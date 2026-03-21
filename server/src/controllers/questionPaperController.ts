import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { QuestionPaperOutputModel } from "../models/QuestionPaperOutput.js";
import { config } from "../config/index.js";

export async function getQuestionPaper(req: Request, res: Response) {
  const output = await QuestionPaperOutputModel.findById(req.params.id);
  if (!output) {
    res.status(404).json({ error: "Question paper not found" });
    return;
  }
  res.json(output.toJSON());
}

export async function getQuestionPaperPdf(req: Request, res: Response) {
  const output = await QuestionPaperOutputModel.findById(req.params.id);
  const storedPath = output?.pdfPath as string | undefined;
  if (!output || !storedPath) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  // Resolve relative paths against outputDir; absolute paths pass through
  const pdfPath = path.isAbsolute(storedPath)
    ? storedPath
    : path.resolve(config.outputDir, storedPath);

  if (!fs.existsSync(pdfPath)) {
    res.status(404).json({ error: "PDF file missing from disk" });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="question-paper-${output.assignmentId}.pdf"`
  );
  fs.createReadStream(pdfPath).pipe(res);
}
