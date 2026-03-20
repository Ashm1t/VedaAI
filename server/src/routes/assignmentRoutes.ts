import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  generateQuestions,
} from "../controllers/assignmentController.js";

const router = Router();

router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.post("/", upload.single("file"), createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
router.post("/:id/generate", generateQuestions);

export default router;
