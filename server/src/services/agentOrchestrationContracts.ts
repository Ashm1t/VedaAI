import type { AgentDocumentPlan } from "./agentPlanningService.js";
import type { AgentModeKey } from "./agentModeRegistry.js";

export type DocumentGraphStage =
  | "intent"
  | "ingestion"
  | "retrieval"
  | "clarification"
  | "build"
  | "compile"
  | "repair"
  | "export"
  | "complete"
  | "error";

export type DocumentGraphIntent =
  | "conversation"
  | "ingest"
  | "create"
  | "edit"
  | "compile"
  | "repair"
  | "export";

export type IngestionSourceKind =
  | "libra_artifact"
  | "pdf_embedded_source"
  | "pdf_text_layer"
  | "pdf_ocr"
  | "docx"
  | "image"
  | "latex"
  | "markdown"
  | "manual";

export type IngestionConfidence = "high" | "medium" | "low";

export interface SourceArtifactRef {
  artifactId: string;
  path: string;
  language: "latex" | "bibtex" | "markdown" | "text" | "asset";
  confidence: IngestionConfidence;
}

export interface DocumentOutlineItem {
  title: string;
  level: number;
  page?: number;
  sourceRef?: string;
}

export interface IngestionPacket {
  sourceKind: IngestionSourceKind;
  confidence: IngestionConfidence;
  sourceFiles: SourceArtifactRef[];
  documentOutline: DocumentOutlineItem[];
  extractedFields: Record<string, string | string[]>;
  warnings: string[];
}

export interface RetrievalCandidate {
  templateId: string;
  name: string;
  score: number;
  reasons: string[];
  requiredFields: string[];
  compileProfileId: string;
  rendererAdapterId: string;
}

export interface TemplateShortlist {
  mode: AgentModeKey;
  candidates: RetrievalCandidate[];
  clarifyingQuestions: string[];
}

export interface BuildRequest {
  prompt: string;
  mode: AgentModeKey;
  plan: AgentDocumentPlan | null;
  ingestion: IngestionPacket | null;
  shortlist: TemplateShortlist | null;
  selectedTemplateId: string;
  sourceArtifactIds: string[];
  answers: Record<string, string>;
}

export interface BuildResult {
  message: string;
  latexArtifactId?: string;
  latexSource?: string;
  pdfArtifactId?: string;
  compileLogArtifactId?: string;
  compileStatus: "not_run" | "success" | "failed";
  warnings: string[];
}

export interface GraphTraceMetadata {
  sessionId: string;
  mode: AgentModeKey;
  templateId?: string;
  stage: DocumentGraphStage;
  compileStatus?: BuildResult["compileStatus"];
  retrievalTopK?: number;
}

export interface DocumentGraphState {
  sessionId: string;
  turnId: string;
  stage: DocumentGraphStage;
  intent: DocumentGraphIntent;
  mode: AgentModeKey;
  userPrompt: string;
  ingestion: IngestionPacket | null;
  retrieval: TemplateShortlist | null;
  plan: AgentDocumentPlan | null;
  build: BuildResult | null;
  selectedTemplateId: string;
  answers: Record<string, string>;
  artifactIds: string[];
  warnings: string[];
  error?: string;
}

export function createInitialDocumentGraphState(
  sessionId: string,
  turnId: string,
  userPrompt: string,
  mode: AgentModeKey
): DocumentGraphState {
  return {
    sessionId,
    turnId,
    stage: "intent",
    intent: "conversation",
    mode,
    userPrompt,
    ingestion: null,
    retrieval: null,
    plan: null,
    build: null,
    selectedTemplateId: "",
    answers: {},
    artifactIds: [],
    warnings: [],
  };
}
