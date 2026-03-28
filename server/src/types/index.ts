// Re-export shared types from @libra/core
export type {
  QuestionType,
  Difficulty,
  Question,
  QuestionSection,
  QuestionPaperOutput,
  QuestionTypeConfig,
  AssignmentFormData,
} from "@libra/core";

export { QUESTION_TYPE_LABELS } from "@libra/core";

// ── Server-specific types ──────────────────────────────────────────

export type AssignmentStatus = "draft" | "generating" | "generated" | "error";

export type GenerationStatus =
  | "idle"
  | "queued"
  | "processing"
  | "done"
  | "error";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  assignedOn: string;
  dueDate: string;
  status: AssignmentStatus;
  outputId?: string;
}
