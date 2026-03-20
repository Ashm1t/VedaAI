import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { config } from "../config/index.js";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    if (!config.groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }
    groqClient = new Groq({ apiKey: config.groqApiKey });
  }
  return groqClient;
}

/**
 * Extract text from uploaded file using Groq Vision (LLaMA 3.2 90B).
 * - .txt files: read directly
 * - Images: Groq Vision OCR
 * - PDF: read as text if possible, otherwise skip
 */
export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  // Plain text files — just read directly
  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  // Images — use Groq Vision
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return extractFromImage(filePath, ext);
  }

  // PDF — Groq Vision doesn't support PDF directly
  if (ext === ".pdf") {
    throw new Error(
      "PDF OCR not supported with Groq Vision. Upload images (JPG/PNG) instead."
    );
  }

  throw new Error(`Unsupported file type for OCR: ${ext}`);
}

async function extractFromImage(
  filePath: string,
  ext: string
): Promise<string> {
  const groq = getGroq();
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  let mimeType: string;
  if (ext === ".png") mimeType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".webp") mimeType = "image/webp";
  else mimeType = "image/png";

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
          {
            type: "text",
            text: `You are a document OCR specialist. Extract ALL text content from this image.

Preserve structure: headings, bullet points, numbered lists.
For mathematical equations, convert them to LaTeX notation (e.g., $E = mc^2$).
If the image contains diagrams or charts, describe their labels and structure.
If the image contains tables, represent them as structured text.

Return ONLY the extracted text, no commentary or explanations.`,
          },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}
