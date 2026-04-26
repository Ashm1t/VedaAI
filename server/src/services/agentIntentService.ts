import type { LLMAdapter } from "@libra/core";
import { resolveAgentMode, type AgentModeKey } from "./agentModeRegistry.js";

export type AgentIntentKind =
  | "conversation"
  | "create_document"
  | "edit_document"
  | "ingest_source";

export interface AgentIntentResult {
  kind: AgentIntentKind;
  confidence: number;
  modeKey: AgentModeKey;
  reason: string;
  triggerWorkflow: boolean;
}

interface IntentContext {
  prompt: string;
  messages: Array<{ role: string; content: string }>;
  hasCurrentTex: boolean;
  hasSourceContext: boolean;
}

function heuristicIntent(context: IntentContext): AgentIntentResult {
  const normalized = context.prompt.toLowerCase().trim();
  const modeKey = resolveAgentMode(undefined, normalized);

  if (!normalized) {
    return {
      kind: "conversation",
      confidence: 0.9,
      modeKey,
      reason: "empty prompt",
      triggerWorkflow: false,
    };
  }

  if (
    /\b(upload|attach|read this file|scan this|ocr this|extract text|summarize this pdf|summarise this pdf)\b/.test(
      normalized
    )
  ) {
    return {
      kind: "ingest_source",
      confidence: 0.92,
      modeKey,
      reason: "source ingestion request detected",
      triggerWorkflow: false,
    };
  }

  if (
    /\b(create|generate|draft|write|make|prepare|build)\b/.test(normalized) &&
    /\b(resume|cv|paper|report|letter|slides|presentation|worksheet|exam|quiz|article|essay|document)\b/.test(
      normalized
    )
  ) {
    return {
      kind: "create_document",
      confidence: 0.94,
      modeKey,
      reason: "document creation request detected",
      triggerWorkflow: true,
    };
  }

  if (
    context.hasCurrentTex &&
    /\b(edit|update|modify|rewrite|reformat|fix|improve|change|polish)\b/.test(
      normalized
    )
  ) {
    return {
      kind: "edit_document",
      confidence: 0.93,
      modeKey,
      reason: "document edit request detected",
      triggerWorkflow: true,
    };
  }

  if (
    /\bwhat|why|how|explain|help|can you|could you|should|which|who\b/.test(
      normalized
    )
  ) {
    return {
      kind: "conversation",
      confidence: 0.88,
      modeKey,
      reason: "conversational question detected",
      triggerWorkflow: false,
    };
  }

  return {
    kind: context.hasCurrentTex ? "edit_document" : "conversation",
    confidence: 0.65,
    modeKey,
    reason: "heuristic fallback",
    triggerWorkflow: context.hasCurrentTex,
  };
}

function buildIntentPrompt(context: IntentContext) {
  const history = context.messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return `Classify the user's latest turn for a LaTeX document assistant.

Return a JSON object with exactly these keys:
{
  "kind": "conversation" | "create_document" | "edit_document" | "ingest_source",
  "confidence": 0.0,
  "modeKey": "resume_cv" | "research_paper" | "report_article" | "letter_application" | "slides_presentation" | "worksheet_exam" | "sandbox",
  "reason": "short reason",
  "triggerWorkflow": true | false
}

Rules:
- Use "conversation" for normal chat, explanation, brainstorming, or advice.
- Use "create_document" when the user wants a new document drafted.
- Use "edit_document" when the user wants a current document revised, reformatted, or fixed.
- Use "ingest_source" when the user is asking the agent to read uploaded material.
- triggerWorkflow should be true only when the UI should show template cards / clarification fields.
- modeKey should map to the best matching renderer lane.

HAS CURRENT LATEX: ${String(context.hasCurrentTex)}
HAS SOURCE CONTEXT: ${String(context.hasSourceContext)}

RECENT CONVERSATION:
${history || "none"}

LATEST USER PROMPT:
${context.prompt}`;
}

export async function detectAgentIntent(
  llm: LLMAdapter,
  context: IntentContext
): Promise<AgentIntentResult> {
  const heuristic = heuristicIntent(context);

  if (!context.prompt.trim()) {
    return heuristic;
  }

  try {
    const raw = await llm.generateJSON(buildIntentPrompt(context));
    const parsed = JSON.parse(raw) as Partial<AgentIntentResult>;

    const kind = parsed.kind || heuristic.kind;
    const confidence =
      typeof parsed.confidence === "number" ? parsed.confidence : heuristic.confidence;
    const modeKey = resolveAgentMode(parsed.modeKey, context.prompt);
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason
        : heuristic.reason;
    const triggerWorkflow =
      typeof parsed.triggerWorkflow === "boolean"
        ? parsed.triggerWorkflow
        : heuristic.triggerWorkflow;

    return {
      kind,
      confidence,
      modeKey,
      reason,
      triggerWorkflow,
    };
  } catch {
    return heuristic;
  }
}
