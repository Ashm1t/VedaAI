import path from "path";
import { TexRAG, GroqAdapter, HuggingFaceEmbeddingAdapter } from "@libra/core";
import { AssignmentModel } from "../models/Assignment.js";
import { QuestionPaperOutputModel } from "../models/QuestionPaperOutput.js";
import * as ocrService from "./ocrService.js";
import { getIO } from "../index.js";
import { config } from "../config/index.js";

import type { AssignmentFormData } from "@libra/core";

// ── Engine singleton ───────────────────────────────────────────────

let engine: TexRAG | null = null;

function getEngine(): TexRAG {
  if (!engine) {
    const embeddingAdapter = config.hfToken
      ? new HuggingFaceEmbeddingAdapter({ apiToken: config.hfToken })
      : undefined;

    engine = new TexRAG({
      llm: new GroqAdapter({
        apiKey: config.groqApiKey,
      }),
      templatesDir: config.templatesDir,
      outputDir: config.outputDir,
      embeddingAdapter,
      embeddingsPath: config.embeddingsPath,
      scrapedRegistryPath: config.scrapedRegistryPath,
    });
  }
  return engine;
}

// ── Progress emitter ───────────────────────────────────────────────

function createEmitter(assignmentId: string) {
  return (status: string, progress: number) => {
    const io = getIO();
    if (io) {
      io.emit("generation:status", { assignmentId, status, progress });
    }
  };
}

// ── Pipeline ───────────────────────────────────────────────────────

/**
 * Run the full generation pipeline for an assignment.
 * OCR stays here (Libra-specific). Core engine handles everything else.
 */
export async function runGenerationPipeline(
  assignmentId: string
): Promise<void> {
  const emit = createEmitter(assignmentId);

  try {
    emit("processing", 5);

    // Load assignment from MongoDB
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    const formData = assignment.formData as unknown as AssignmentFormData;
    if (!formData) throw new Error("No form data found on assignment");

    // Step 1: OCR (Libra-specific — stays in server)
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

    // Step 2: Delegate to @libra/core engine
    const texrag = getEngine();
    const result = await texrag.generate(
      {
        extractedText,
        formData,
        onProgress: emit,
      },
      assignmentId
    );

    // Step 3: Save output to MongoDB
    emit("processing", 95);
    const output = await QuestionPaperOutputModel.create({
      assignmentId,
      ...result.metadata,
      sections: result.sections,
      latexSource: result.latex,
      latexTemplateName: result.templateUsed,
      pdfPath: result.pdfPath,
    });

    // Update assignment
    assignment.status = "generated";
    assignment.outputId = output._id;
    await assignment.save();

    console.log(
      `[${assignmentId}] Generation complete — output ${output._id}${result.pdfPath ? " with PDF" : " (no PDF)"}`
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

  runGenerationPipeline(assignmentId).catch((err) => {
    console.error("Direct generation failed:", err);
  });
}
