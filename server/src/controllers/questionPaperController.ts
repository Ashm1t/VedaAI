import type { Request, Response } from "express";
import fs from "fs";
import { QuestionPaperOutputModel } from "../models/QuestionPaperOutput.js";

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
  const pdfPath = output?.pdfPath as string | undefined;
  if (!output || !pdfPath) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

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
