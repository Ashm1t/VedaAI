import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import * as ocrService from "./ocrService.js";

export type IngestedSourceKind =
  | "text"
  | "image"
  | "pdf"
  | "docx"
  | "unknown";

export interface IngestedSourceFile {
  id: string;
  name: string;
  mimeType: string;
  kind: IngestedSourceKind;
  status: "ready" | "error";
  storedPath: string;
  extractedTextLength: number;
  error?: string;
}

export interface IngestionResult {
  files: IngestedSourceFile[];
  combinedText: string;
  primaryDocumentName: string;
}

function extensionKind(filePath: string): IngestedSourceKind {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt" || ext === ".md") return "text";
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  return "unknown";
}

async function extractTextFromPdf(filePath: string) {
  const buffer = await fs.promises.readFile(filePath);
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  if (pages.length === 0) {
    throw new Error(
      "No embedded text found in PDF. Scanned-PDF OCR fallback is not configured yet."
    );
  }

  return pages.join("\n\n");
}

async function extractTextFromDocx(filePath: string) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value.replace(/\s+\n/g, "\n").trim();

  if (!text) {
    throw new Error("No readable text found in DOCX file.");
  }

  return text;
}

async function extractSingleFileText(filePath: string, kind: IngestedSourceKind) {
  switch (kind) {
    case "text":
      return fs.promises.readFile(filePath, "utf-8");
    case "image":
      return ocrService.extractText(filePath);
    case "pdf":
      return extractTextFromPdf(filePath);
    case "docx":
      return extractTextFromDocx(filePath);
    default:
      throw new Error(`Unsupported file type for ingestion: ${path.extname(filePath)}`);
  }
}

export async function ingestAgentFiles(
  files: Express.Multer.File[]
): Promise<IngestionResult> {
  const ingestedFiles: IngestedSourceFile[] = [];
  const textParts: string[] = [];

  for (const file of files) {
    const kind = extensionKind(file.originalname);

    try {
      const text = (await extractSingleFileText(file.path, kind)).trim();
      if (text) {
        textParts.push(`[Source: ${file.originalname}]\n${text}`);
      }

      ingestedFiles.push({
        id: file.filename,
        name: file.originalname,
        mimeType: file.mimetype,
        kind,
        status: "ready",
        storedPath: file.path,
        extractedTextLength: text.length,
      });
    } catch (error) {
      ingestedFiles.push({
        id: file.filename,
        name: file.originalname,
        mimeType: file.mimetype,
        kind,
        status: "error",
        storedPath: file.path,
        extractedTextLength: 0,
        error: error instanceof Error ? error.message : "Ingestion failed",
      });
    }
  }

  return {
    files: ingestedFiles,
    combinedText: textParts.join("\n\n---\n\n").trim(),
    primaryDocumentName:
      files.length === 1 ? files[0].originalname : `${files.length} source files`,
  };
}
