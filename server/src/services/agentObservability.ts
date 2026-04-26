import type { RunnableConfig } from "@langchain/core/runnables";
import type { GraphTraceMetadata } from "./agentOrchestrationContracts.js";

export function isLangSmithTracingEnabled() {
  return process.env.LANGSMITH_TRACING === "true" && Boolean(process.env.LANGSMITH_API_KEY);
}

export function buildLangSmithRunnableConfig(
  metadata: GraphTraceMetadata
): RunnableConfig {
  return {
    tags: [
      "libra-agent",
      `mode:${metadata.mode}`,
      `stage:${metadata.stage}`,
      metadata.templateId ? `template:${metadata.templateId}` : "template:none",
      metadata.compileStatus ? `compile:${metadata.compileStatus}` : "compile:not_set",
    ],
    metadata: {
      sessionId: metadata.sessionId,
      mode: metadata.mode,
      templateId: metadata.templateId || "",
      graphNode: metadata.stage,
      compileStatus: metadata.compileStatus || "",
      retrievalTopK: metadata.retrievalTopK ?? 0,
    },
  };
}
