import path from "path";
import { AssignmentModel } from "../models/Assignment.js";
import { QuestionPaperOutputModel } from "../models/QuestionPaperOutput.js";
import * as ocrService from "./ocrService.js";
import * as aiService from "./aiService.js";
import * as latexService from "./latexService.js";
import { validateLatex, autoFixLatex } from "./latexValidator.js";
import { getIO } from "../index.js";
import { config } from "../config/index.js";

type ProgressEmitter = (status: string, progress: number) => void;

function createEmitter(assignmentId: string): ProgressEmitter {
  return (status: string, progress: number) => {
    const io = getIO();
    if (io) {
      io.emit("generation:status", { assignmentId, status, progress });
    }
  };
}

/**
 * Run the full generation pipeline for an assignment.
 *
 * Flow:
 *   OCR (if file) → Analyze → Generate sections (parallel) → Generate LaTeX → Validate → Compile PDF
 */
export async function runGenerationPipeline(
  assignmentId: string
): Promise<void> {
  const emit = createEmitter(assignmentId);

  try {
    emit("processing", 5);

    // Load assignment
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    const formData = assignment.formData as Record<string, unknown>;
    if (!formData) throw new Error("No form data found on assignment");

    // Step 1: OCR (if file uploaded)
    emit("processing", 10);
    let extractedText: string | null = null;

    const filePaths = (assignment.uploadedFilePaths as string[]) || [];
    if (filePaths.length > 0) {
      try {
        console.log(`[${assignmentId}] Running OCR on ${filePaths.length} uploaded file(s)...`);
        const textParts: string[] = [];
        for (const fp of filePaths) {
          try {
            const text = await ocrService.extractText(fp);
            if (text) textParts.push(text);
          } catch (err) {
            console.warn(`[${assignmentId}] OCR failed for ${fp}:`, (err as Error).message);
          }
        }
        if (textParts.length > 0) {
          extractedText = textParts.join("\n\n---\n\n");
          assignment.extractedText = extractedText;
          await assignment.save();
          console.log(
            `[${assignmentId}] OCR complete — ${extractedText.length} chars from ${textParts.length} file(s)`
          );
        }
      } catch (err) {
        console.error(`[${assignmentId}] OCR failed, continuing without:`, err);
      }
    }

    // Step 2: Feedforward chain — Analyze + Generate sections (parallel)
    emit("processing", 25);
    console.log(`[${assignmentId}] Running feedforward chain...`);
    const { selectedTemplate, questionData } =
      await aiService.selectTemplateAndGenerate(
        extractedText,
        formData as unknown as Parameters<
          typeof aiService.selectTemplateAndGenerate
        >[1]
      );

    const totalQ = questionData.sections.reduce(
      (s, sec) => s + sec.questions.length,
      0
    );
    console.log(
      `[${assignmentId}] Chain complete — ${questionData.sections.length} sections, ${totalQ} questions, ${questionData.maximumMarks} marks`
    );

    // Step 3: LaTeX generation
    emit("processing", 55);
    console.log(`[${assignmentId}] Generating LaTeX...`);
    let texContent = await aiService.generateLatex(
      selectedTemplate,
      questionData
    );

    // Step 3.5: Pre-compilation validation
    emit("processing", 65);
    texContent = autoFixLatex(texContent); // Strip fences, fix double-escapes

    const validation = validateLatex(texContent);
    if (validation.warnings.length > 0) {
      console.warn(
        `[${assignmentId}] LaTeX warnings:`,
        validation.warnings.join("; ")
      );
    }

    if (!validation.valid) {
      console.error(
        `[${assignmentId}] LaTeX validation FAILED:`,
        validation.errors.join("; ")
      );
      console.log(`[${assignmentId}] Attempting AI fix before compilation...`);

      // Use AI to fix the structural issues
      texContent = await aiService.fixLatex(
        texContent,
        `Pre-compilation validation errors:\n${validation.errors.join("\n")}`,
        selectedTemplate
      );
      texContent = autoFixLatex(texContent);

      // Re-validate
      const recheck = validateLatex(texContent);
      if (!recheck.valid) {
        console.error(
          `[${assignmentId}] AI fix did not resolve all issues:`,
          recheck.errors.join("; ")
        );
        // Continue anyway — pdflatex may still handle it
      }
    } else {
      console.log(`[${assignmentId}] LaTeX validation passed`);
    }

    // Step 4: Compile LaTeX to PDF
    emit("processing", 75);
    let pdfPath: string | undefined;

    try {
      console.log(`[${assignmentId}] Compiling PDF...`);
      pdfPath = await latexService.compileLaTeX(texContent, assignmentId);
      console.log(`[${assignmentId}] PDF compiled: ${pdfPath}`);
    } catch (err) {
      console.error(`[${assignmentId}] First compilation failed`);
      const errorLog = latexService.extractErrorFromLog(
        err instanceof Error ? err.message : String(err)
      );

      try {
        // Retry with AI fix using the actual pdflatex error
        emit("processing", 85);
        texContent = await aiService.fixLatex(
          texContent,
          errorLog,
          selectedTemplate
        );
        texContent = autoFixLatex(texContent);
        pdfPath = await latexService.compileLaTeX(texContent, assignmentId);
        console.log(`[${assignmentId}] PDF compiled on retry: ${pdfPath}`);
      } catch (retryErr) {
        console.error(
          `[${assignmentId}] Second compilation also failed — saving without PDF`
        );
        // Continue without PDF — the structured JSON output is still usable
      }
    }

    // Step 5: Save output (store relative path for portability)
    emit("processing", 95);
    const relativePdfPath = pdfPath
      ? path.relative(config.outputDir, pdfPath)
      : undefined;
    const output = await QuestionPaperOutputModel.create({
      assignmentId,
      ...questionData,
      latexSource: texContent,
      latexTemplateName: selectedTemplate,
      pdfPath: relativePdfPath,
    });

    // Update assignment
    assignment.status = "generated";
    assignment.outputId = output._id;
    await assignment.save();

    console.log(
      `[${assignmentId}] Generation complete — output ${output._id}${pdfPath ? " with PDF" : " (no PDF)"}`
    );
    emit("done", 100);
  } catch (err) {
    console.error(`[${assignmentId}] Generation pipeline FAILED:`, err);

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: "error",
    });

    emit("error", 0);
    throw err;
  }
}

/**
 * Trigger generation — uses BullMQ if Redis is available, otherwise runs directly.
 */
export async function triggerGeneration(assignmentId: string): Promise<void> {
  try {
    const { enqueueGeneration } = await import("../jobs/generationQueue.js");
    await enqueueGeneration(assignmentId);
    return;
  } catch {
    console.log("BullMQ unavailable, running generation directly");
  }

  // Fallback: run directly (non-blocking)
  runGenerationPipeline(assignmentId).catch((err) => {
    console.error("Direct generation failed:", err);
  });
}
