import type { Request, Response, NextFunction } from "express";
import multer from "multer";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${req.method} ${req.originalUrl}] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message === "Not found") {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
