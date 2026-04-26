import { Router } from "express";
import {
  createSession,
  getArtifactPdf,
  getLatestArtifact,
  getSession,
  postMessage,
  uploadSessionFiles,
} from "../controllers/agentController.js";
import { agentUpload } from "../middleware/agentUpload.js";

const router = Router();

router.post("/sessions", createSession);
router.get("/sessions/:id", getSession);
router.post("/sessions/:id/messages", postMessage);
router.post("/sessions/:id/files", agentUpload.array("file", 10), uploadSessionFiles);
router.get("/sessions/:id/artifacts/latest", getLatestArtifact);
router.get("/artifacts/:id/pdf", getArtifactPdf);

export default router;
