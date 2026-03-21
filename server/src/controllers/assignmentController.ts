import type { Request, Response } from "express";
import { AssignmentModel } from "../models/Assignment.js";
import { triggerGeneration } from "../services/generationService.js";

export async function listAssignments(_req: Request, res: Response) {
  const assignments = await AssignmentModel.find().sort({ createdAt: -1 });
  res.json(assignments.map((a) => a.toJSON()));
}

export async function getAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findById(req.params.id);
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  res.json(assignment.toJSON());
}

export async function createAssignment(req: Request, res: Response) {
  const { title, subject, className, dueDate, topic, additionalInstructions, questionTypes } =
    req.body;

  const parsedQuestionTypes =
    typeof questionTypes === "string"
      ? JSON.parse(questionTypes)
      : questionTypes;

  const assignment = await AssignmentModel.create({
    title: title || `${topic} - ${subject}`,
    subject,
    className,
    dueDate,
    assignedOn: new Date().toISOString().split("T")[0],
    status: "draft",
    uploadedFilePaths: req.files
      ? (req.files as Express.Multer.File[]).map((f) => f.path)
      : [],
    formData: {
      title,
      subject,
      className,
      dueDate,
      topic,
      additionalInstructions,
      questionTypes: parsedQuestionTypes,
      fileType: req.files && (req.files as Express.Multer.File[]).length > 0
        ? (req.files as Express.Multer.File[])[0].originalname.endsWith(".pdf")
          ? "pdf"
          : "image"
        : undefined,
    },
  });

  res.status(201).json(assignment.toJSON());
}

export async function updateAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  res.json(assignment.toJSON());
}

export async function deleteAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findByIdAndDelete(req.params.id);
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  res.json({ success: true });
}

export async function generateQuestions(req: Request, res: Response) {
  const assignment = await AssignmentModel.findById(req.params.id);
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }

  assignment.status = "generating";
  await assignment.save();

  // Trigger async generation (via BullMQ or direct)
  triggerGeneration(assignment._id as string);

  res.json({ status: "queued", assignmentId: assignment._id });
}
