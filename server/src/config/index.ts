import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function firstExistingPath(candidates: string[]) {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "";
}

const defaultScrapedRegistryCandidates = [
  process.env.SCRAPED_REGISTRY_PATH || "",
  "C:\\R\\Veda\\templates\\scraped\\registry.json",
  path.resolve(__dirname, "../../../packages/core/templates/scraped/registry.json"),
];

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGODB_URI || "",
  redisUrl: process.env.REDIS_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  hfToken: process.env.HF_TOKEN || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Auth
  jwtSecret: process.env.JWT_SECRET || "libra-dev-secret-change-me",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),

  // Paths
  uploadsDir: path.resolve(__dirname, "../../uploads"),
  outputDir: path.resolve(__dirname, "../../output"),
  templatesDir:
    process.env.TEMPLATES_DIR ||
    path.resolve(__dirname, "../../../packages/core/templates"),
  scrapedRegistryPath: firstExistingPath(defaultScrapedRegistryCandidates),
  embeddingsPath:
    process.env.EMBEDDINGS_PATH ||
    path.resolve(__dirname, "../../../packages/core/embeddings/embeddings.json"),

  // Limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  latexTimeout: 30_000, // 30 seconds
};
