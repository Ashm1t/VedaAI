import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { config } from "../config/index.js";
import {
  buildAnalysisPrompt,
  buildSectionPrompt,
  computeStartingNumbers,
} from "../prompts/templateSelection.js";
import { buildLatexGenerationPrompt } from "../prompts/latexGeneration.js";
import type {
  AssignmentFormData,
  QuestionPaperOutput,
  QuestionSection,
} from "../types/index.js";

let groqClient: Groq | null = null;
let handbookCache: string | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    if (!config.groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }
    groqClient = new Groq({ apiKey: config.groqApiKey });
  }
  return groqClient;
}

function getHandbook(): string {
  if (!handbookCache) {
    const handbookPath = path.join(
      config.templatesDir,
      "latex_qp_agent_handbook.md"
    );
    handbookCache = fs.readFileSync(handbookPath, "utf-8");
  }
  return handbookCache;
}

function getTemplateSource(templateName: string): string {
  const templatePath = path.join(config.templatesDir, templateName);
  return fs.readFileSync(templatePath, "utf-8");
}

/**
 * Call Groq with JSON response mode.
 */
async function groqJson(prompt: string): Promise<string> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content || "{}";
}

/**
 * Call Groq for text generation (LaTeX output).
 */
async function groqText(prompt: string, temperature = 0.3): Promise<string> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens: 8192,
  });
  return response.choices[0]?.message?.content || "";
}

// ---------- Feedforward Chain ----------

interface AnalysisResult {
  subject: string;
  topic: string;
  keyConcepts: string[];
  keyTerms: string[];
  difficultyGuide: string;
  detectedSchoolName: string;
}

/**
 * Chain Step 1: Analyze source material (small, fast call).
 */
async function analyzeContent(
  extractedText: string | null,
  formData: AssignmentFormData
): Promise<AnalysisResult> {
  if (!extractedText || extractedText.trim().length < 20) {
    return {
      subject: formData.subject || "General",
      topic: formData.topic || "General",
      keyConcepts: [formData.topic || "General concepts"],
      keyTerms: [],
      difficultyGuide:
        "Generate questions appropriate for the class level",
      detectedSchoolName: "",
    };
  }

  const prompt = buildAnalysisPrompt(extractedText, formData);

  try {
    const raw = await groqJson(prompt);
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

/**
 * Chain Step 2: Generate questions for each section IN PARALLEL.
 */
async function generateSections(
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
      const raw = await groqJson(prompt);
      const section: QuestionSection = JSON.parse(raw);

      // Enforce correct numbering and marks
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

// ---------- Public API ----------

interface ChainResult {
  selectedTemplate: string;
  questionData: Omit<QuestionPaperOutput, "id" | "assignmentId">;
}

/**
 * Run the full feedforward chain:
 *   Analyze → Generate sections (parallel) → Assemble
 */
export async function selectTemplateAndGenerate(
  extractedText: string | null,
  formData: AssignmentFormData
): Promise<ChainResult> {
  // Step 1: Analyze
  const analysis = await analyzeContent(extractedText, formData);

  // Step 2: Generate all sections in parallel
  const sections = await generateSections(formData, analysis);

  const validSections = sections.filter((s) => s.questions.length > 0);
  if (validSections.length === 0) {
    throw new Error("All section generation calls failed — no questions produced");
  }

  const selectedTemplate = "questionpaper.tex";

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

  return {
    selectedTemplate,
    questionData: {
      schoolName: analysis.detectedSchoolName || "School",
      subject: analysis.subject || formData.subject,
      className: formData.className,
      timeAllowed: `${Math.max(30, Math.ceil(finalMarks * 1.5))} minutes`,
      maximumMarks: finalMarks,
      generalInstruction:
        "All questions are compulsory unless stated otherwise.",
      sections: validSections,
      aiSummary: `Generated a ${analysis.subject} question paper on "${analysis.topic}" with ${validSections.length} sections, ${validSections.reduce((s, sec) => s + sec.questions.length, 0)} questions, and ${finalMarks} total marks.`,
    },
  };
}

/**
 * Generate compilable LaTeX from template + question data.
 */
export async function generateLatex(
  selectedTemplate: string,
  questionData: Omit<QuestionPaperOutput, "id" | "assignmentId">
): Promise<string> {
  const templateSource = getTemplateSource(selectedTemplate);
  const handbook = getHandbook();

  const prompt = buildLatexGenerationPrompt(
    templateSource,
    handbook,
    questionData as QuestionPaperOutput,
    selectedTemplate
  );

  let latex = await groqText(prompt, 0.3);

  // Strip markdown code fences if present
  latex = latex
    .replace(/^```latex\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();

  return latex;
}

/**
 * Attempt to fix broken LaTeX using the compilation error log.
 */
export async function fixLatex(
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

  let latex = await groqText(prompt, 0.2);
  latex = latex
    .replace(/^```latex\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();

  return latex;
}
