import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";

const storage = multer.diskStorage({
  destination: config.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const agentUpload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".pdf",
      ".docx",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".txt",
      ".md",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid file type: ${ext}. Allowed: ${allowed.join(", ")}`)
      );
    }
  },
});
