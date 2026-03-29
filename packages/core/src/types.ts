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
  subject?: string;
  documentClass?: string;
  educational?: boolean;
}

export interface TemplateInfo {
  name: string;
  dirName: string;
  meta: TemplateMeta;
}

export interface ScrapedTemplateMeta {
  id: string;
  name: string;
  source_url: string;
  source_site: string;
  type: string;
  subject: string;
  style_tags: string[];
  description: string;
  date_scraped: string;
  packages_required: string[];
  has_custom_macros: boolean;
  document_class: string;
  educational: boolean;
}

// ── RAG / Embeddings ──────────────────────────────────────────────

export interface EmbeddingAdapter {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  readonly modelId: string;
  readonly dimensions: number;
}

export interface EmbeddingEntry {
  id: string;
  text: string;
  vector: number[];
}

export interface EmbeddingIndex {
  version: number;
  model: string;
  dimensions: number;
  entries: EmbeddingEntry[];
}

export interface RetrievalResult {
  templateId: string;
  score: number;
  meta: TemplateMeta;
}

export interface RetrieverOptions {
  topK?: number;
  minScore?: number;
  typeFilter?: string;
  subjectFilter?: string;
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
