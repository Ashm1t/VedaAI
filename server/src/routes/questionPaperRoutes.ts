import { Router } from "express";
import {
  getQuestionPaper,
  getQuestionPaperPdf,
} from "../controllers/questionPaperController.js";

const router = Router();

router.get("/:id", getQuestionPaper);
router.get("/:id/pdf", getQuestionPaperPdf);

export default router;
