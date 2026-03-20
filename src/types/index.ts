export type QuestionType = "mcq" | "short" | "long" | "fill" | "true_false";

export type Difficulty = "easy" | "moderate" | "hard";

export type AssignmentStatus = "draft" | "generating" | "generated" | "error";

export type GenerationStatus = "idle" | "queued" | "processing" | "done" | "error";

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

export interface QuestionTypeConfig {
  id: string;
  type: QuestionType;
  label: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  file?: File | null;
  fileType?: "pdf" | "text";
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  topic: string;
}

export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
}

export interface QuestionSection {
  label: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaperOutput {
  id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstruction: string;
  sections: QuestionSection[];
  aiSummary: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice Questions",
  short: "Short Answer Questions",
  long: "Long Answer Questions",
  fill: "Fill in the Blanks",
  true_false: "True / False",
};
