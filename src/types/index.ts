export type QuestionType = "mcq" | "short" | "long" | "fill" | "true_false";

export type Difficulty = "easy" | "moderate" | "hard";

export type AssignmentStatus = "draft" | "generating" | "generated" | "error";

export type GenerationStatus = "idle" | "queued" | "processing" | "done" | "error";
export type AgentSessionStatus = "idle" | "processing" | "ready" | "error";
export type AgentRole = "system" | "user" | "assistant";
export type AgentArtifactKind = "response_snapshot" | "compiled_pdf";
export type AgentEditorMode = "markdown" | "latex" | "text";
export type AgentWorkflowStage =
  | "idle"
  | "template_selection"
  | "clarification"
  | "drafting"
  | "ready";
export type AgentQuestionType = "short_text" | "long_text" | "single_select";

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
  files: File[];
  fileType?: "pdf" | "image";
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

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  status: "complete" | "error";
  createdAt: string;
}

export interface AgentTemplateOption {
  id: string;
  name: string;
  description: string;
  type: string;
  subject: string;
  tags: string[];
  score: number;
  compileSafe: boolean;
  documentClass: string;
  selectionReason: string;
}

export interface AgentClarificationQuestion {
  id: string;
  label: string;
  prompt: string;
  type: AgentQuestionType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface AgentSourceFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  status: "ready" | "error";
  extractedTextLength: number;
  error?: string;
}

export interface AgentWorkflow {
  stage: AgentWorkflowStage;
  action: string;
  documentMode: string;
  promptSummary: string;
  templateOptions: AgentTemplateOption[];
  selectedTemplateId: string;
  questions: AgentClarificationQuestion[];
  answers: Record<string, string>;
  missingInformation: string[];
  lastUserPrompt: string;
}

export interface AgentSession {
  id: string;
  title: string;
  status: AgentSessionStatus;
  sourceDocumentName: string;
  sourceFiles?: AgentSourceFile[];
  sourceContextText?: string;
  messages: AgentMessage[];
  latestArtifactId?: string | null;
  currentTex?: string;
  workflow?: AgentWorkflow | null;
  lastError?: string;
  hasCurrentPdf?: boolean;
}

export interface AgentArtifact {
  id: string;
  sessionId: string;
  sourceMessageId?: string | null;
  kind: AgentArtifactKind;
  title: string;
  assistantSummary: string;
  latexSource?: string;
  templateUsed?: string;
  hasPdf: boolean;
  hasLatex: boolean;
  createdAt: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice Questions",
  short: "Short Answer Questions",
  long: "Long Answer Questions",
  fill: "Fill in the Blanks",
  true_false: "True / False",
};
