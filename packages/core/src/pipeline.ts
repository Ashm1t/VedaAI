import path from "path";
import type {
  LLMAdapter,
  AssignmentFormData,
  QuestionPaperOutput,
  QuestionSection,
  GenerateResult,
  PipelineOptions,
  ProgressCallback,
} from "./types.js";
import { compileLaTeX, extractErrorFromLog } from "./compiler.js";
import { validateLatex, autoFixLatex } from "./validator.js";
import { TemplateRegistry } from "./template-registry.js";
import {
  buildAnalysisPrompt,
  buildSectionPrompt,
  computeStartingNumbers,
  selectTemplate,
} from "./prompts/template-selection.js";
import type { TemplateRetriever } from "./template-retriever.js";
import { buildLatexGenerationPrompt } from "./prompts/latex-generation.js";

// ── Analysis ───────────────────────────────────────────────────────

interface AnalysisResult {
  subject: string;
  topic: string;
  keyConcepts: string[];
  keyTerms: string[];
  difficultyGuide: string;
  detectedSchoolName: string;
}

async function analyzeContent(
  llm: LLMAdapter,
  extractedText: string | null,
  formData: AssignmentFormData
): Promise<AnalysisResult> {
  if (!extractedText || extractedText.trim().length < 20) {
    return {
      subject: formData.subject || "General",
      topic: formData.topic || "General",
      keyConcepts: [formData.topic || "General concepts"],
      keyTerms: [],
      difficultyGuide: "Generate questions appropriate for the class level",
      detectedSchoolName: "",
    };
  }

  const prompt = buildAnalysisPrompt(extractedText, formData);

  try {
    const raw = await llm.generateJSON(prompt);
    const parsed = JSON.parse(raw);
    return {
      subject: parsed.subject || formData.subject || "General",
      topic: parsed.topic || formData.topic || "General",
      keyConcepts: parsed.keyConcepts || [formData.topic || "General"],
      keyTerms: parsed.keyTerms || [],
      difficultyGuide: parsed.difficultyGuide || "Standard difficulty",
      detectedSchoolName: parsed.detectedSchoolName || "",
    };
  } catch {
    return {
      subject: formData.subject || "General",
      topic: formData.topic || "General",
      keyConcepts: [formData.topic || "General"],
      keyTerms: [],
      difficultyGuide: "Standard difficulty distribution",
      detectedSchoolName: "",
    };
  }
}

// ── Section Generation ─────────────────────────────────────────────

async function generateSections(
  llm: LLMAdapter,
  formData: AssignmentFormData,
  analysis: AnalysisResult
): Promise<QuestionSection[]> {
  const labels = "ABCDEFGHIJ";
  const startingNumbers = computeStartingNumbers(formData.questionTypes);

  const sectionPromises = formData.questionTypes.map(async (qt, i) => {
    const prompt = buildSectionPrompt(
      labels[i] || String(i + 1),
      qt.type,
      qt.label,
      qt.numberOfQuestions,
      qt.marksPerQuestion,
      analysis.keyConcepts,
      analysis.keyTerms,
      analysis.difficultyGuide,
      analysis.subject || formData.subject,
      formData.className,
      formData.additionalInstructions,
      startingNumbers[i]
    );

    try {
      const raw = await llm.generateJSON(prompt);
      const section: QuestionSection = JSON.parse(raw);

      const start = startingNumbers[i];
      section.questions = section.questions.map((q, idx) => ({
        ...q,
        number: start + idx,
        marks: qt.marksPerQuestion,
      }));

      return section;
    } catch (err) {
      console.error(`Failed to generate section ${labels[i]}:`, err);
      return {
        label: labels[i] || String(i + 1),
        title: qt.label,
        instruction: `Attempt all questions. Each carries ${qt.marksPerQuestion} marks.`,
        questions: [],
      };
    }
  });

  return Promise.all(sectionPromises);
}

// ── LaTeX Generation ───────────────────────────────────────────────

async function generateLatex(
  llm: LLMAdapter,
  registry: TemplateRegistry,
  selectedTemplate: string,
  questionData: Omit<QuestionPaperOutput, "id" | "assignmentId">
): Promise<string> {
  const { source: templateSource } = registry.get(selectedTemplate);
  const handbook = registry.getHandbook();
  const legacyName = registry.getLegacyTemplateName(selectedTemplate);

  const prompt = buildLatexGenerationPrompt(
    templateSource,
    handbook,
    questionData as QuestionPaperOutput,
    legacyName
  );

  let latex = await llm.generateText(prompt, 0.3);

  // Strip markdown code fences if present
  latex = latex
    .replace(/^```latex\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();

  return latex;
}

async function fixLatex(
  llm: LLMAdapter,
  brokenLatex: string,
  errorLog: string,
  templateName: string
): Promise<string> {
  const prompt = `You are a LaTeX debugging expert. Fix this .tex file that failed to compile.

Error from log:
${errorLog.slice(0, 2000)}

Broken .tex file:
\`\`\`latex
${brokenLatex}
\`\`\`

Fix ONLY the broken parts. Ensure all braces match. Output the COMPLETE fixed .tex file only — no explanations, no markdown fences.
Template: ${templateName}`;

  let latex = await llm.generateText(prompt, 0.2);
  latex = latex
    .replace(/^```latex\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();

  return latex;
}

// ── Main Pipeline ──────────────────────────────────────────────────

/**
 * Run the complete generation pipeline.
 * Pure function: takes data in, returns data out. No MongoDB, no Socket.io.
 */
export async function runPipeline(
  llm: LLMAdapter,
  registry: TemplateRegistry,
  extractedText: string | null,
  formData: AssignmentFormData,
  options: PipelineOptions,
  onProgress?: ProgressCallback,
  retriever?: TemplateRetriever
): Promise<GenerateResult> {
  const emit = onProgress || (() => {});

  // Step 1: Analyze content
  emit("processing", 10);
  const analysis = await analyzeContent(llm, extractedText, formData);

  // Step 2: Generate all sections in parallel
  emit("processing", 25);
  const sections = await generateSections(llm, formData, analysis);

  const validSections = sections.filter((s) => s.questions.length > 0);
  if (validSections.length === 0) {
    throw new Error("All section generation calls failed — no questions produced");
  }

  const selectedTemplate = retriever
    ? await retriever.selectTemplate(formData, analysis)
    : selectTemplate(formData);

  const totalMarks = formData.questionTypes.reduce(
    (sum, qt) => sum + qt.numberOfQuestions * qt.marksPerQuestion,
    0
  );

  const actualMarks = validSections.reduce(
    (sum, s) => sum + s.questions.reduce((qsum, q) => qsum + q.marks, 0),
    0
  );

  if (actualMarks !== totalMarks) {
    console.warn(
      `Marks mismatch: expected ${totalMarks}, got ${actualMarks}. Using actual total.`
    );
  }

  const finalMarks = actualMarks || totalMarks;

  const questionData = {
    schoolName: analysis.detectedSchoolName || "School",
    subject: analysis.subject || formData.subject,
    className: formData.className,
    timeAllowed: `${Math.max(30, Math.ceil(finalMarks * 1.5))} minutes`,
    maximumMarks: finalMarks,
    generalInstruction: "All questions are compulsory unless stated otherwise.",
    sections: validSections,
    aiSummary: `Generated a ${analysis.subject} question paper on "${analysis.topic}" with ${validSections.length} sections, ${validSections.reduce((s, sec) => s + sec.questions.length, 0)} questions, and ${finalMarks} total marks.`,
  };

  // Step 3: Generate LaTeX
  emit("processing", 55);
  let texContent = await generateLatex(llm, registry, selectedTemplate, questionData);

  // Step 3.5: Pre-compilation validation
  emit("processing", 65);
  texContent = autoFixLatex(texContent);

  const validation = validateLatex(texContent);
  if (validation.warnings.length > 0) {
    console.warn("LaTeX warnings:", validation.warnings.join("; "));
  }

  const legacyName = registry.getLegacyTemplateName(selectedTemplate);

  if (!validation.valid) {
    console.error("LaTeX validation FAILED:", validation.errors.join("; "));
    texContent = await fixLatex(
      llm,
      texContent,
      `Pre-compilation validation errors:\n${validation.errors.join("\n")}`,
      legacyName
    );
    texContent = autoFixLatex(texContent);
  }

  // Step 4: Compile LaTeX to PDF
  emit("processing", 75);
  let pdfPath: string | undefined;

  try {
    pdfPath = await compileLaTeX(
      texContent,
      options.outputDir,
      options.documentId,
      options.latexTimeout
    );
  } catch (err) {
    const errorLog = extractErrorFromLog(
      err instanceof Error ? err.message : String(err)
    );

    try {
      emit("processing", 85);
      texContent = await fixLatex(llm, texContent, errorLog, legacyName);
      texContent = autoFixLatex(texContent);
      pdfPath = await compileLaTeX(
        texContent,
        options.outputDir,
        options.documentId,
        options.latexTimeout
      );
    } catch {
      console.error("Second compilation also failed — saving without PDF");
    }
  }

  const relativePdfPath = pdfPath
    ? path.relative(options.outputDir, pdfPath)
    : undefined;

  return {
    sections: validSections,
    latex: texContent,
    pdfPath: relativePdfPath,
    templateUsed: selectedTemplate,
    metadata: {
      schoolName: questionData.schoolName,
      subject: questionData.subject,
      className: questionData.className,
      timeAllowed: questionData.timeAllowed,
      maximumMarks: questionData.maximumMarks,
      generalInstruction: questionData.generalInstruction,
      aiSummary: questionData.aiSummary,
    },
  };
}
