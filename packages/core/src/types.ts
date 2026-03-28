// ── Question & Document Types ──────────────────────────────────────

export type QuestionType = "mcq" | "short" | "long" | "fill" | "true_false";

export type Difficulty = "easy" | "moderate" | "hard";

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
  options?: Record<string, string>;
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
  latexSource?: string;
  latexTemplateName?: string;
  pdfPath?: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice Questions",
  short: "Short Answer Questions",
  long: "Long Answer Questions",
  fill: "Fill in the Blanks",
  true_false: "True / False",
};

// ── Validation ─────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Template ───────────────────────────────────────────────────────

export interface TemplateMeta {
  name: string;
  type: string;
  tags: string[];
  description: string;
  fields: string[];
  packages: string[];
}

export interface TemplateInfo {
  name: string;
  dirName: string;
  meta: TemplateMeta;
}

// ── Pipeline ───────────────────────────────────────────────────────

export type ProgressCallback = (status: string, progress: number) => void;

export interface GenerateInput {
  extractedText: string | null;
  formData: AssignmentFormData;
  onProgress?: ProgressCallback;
}

export interface GenerateResult {
  sections: QuestionSection[];
  latex: string;
  pdfPath?: string;
  templateUsed: string;
  metadata: {
    schoolName: string;
    subject: string;
    className: string;
    timeAllowed: string;
    maximumMarks: number;
    generalInstruction: string;
    aiSummary: string;
  };
}

export interface PipelineOptions {
  outputDir: string;
  documentId: string;
  latexTimeout?: number;
  maxRetries?: number;
}

// ── LLM Adapter ────────────────────────────────────────────────────

export interface LLMAdapter {
  /** Generate a JSON response from a prompt */
  generateJSON(prompt: string): Promise<string>;
  /** Generate raw text from a prompt */
  generateText(prompt: string, temperature?: number): Promise<string>;
}
