import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGODB_URI || "",
  redisUrl: process.env.REDIS_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Paths
  uploadsDir: path.resolve(__dirname, "../../uploads"),
  outputDir: path.resolve(__dirname, "../../output"),
  templatesDir: path.resolve(__dirname, "../../../templates"),

  // Limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  latexTimeout: 30_000, // 30 seconds
};
