import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import {
  createInitialDocumentGraphState,
  type BuildResult,
  type DocumentGraphIntent,
  type DocumentGraphStage,
  type DocumentGraphState,
  type IngestionPacket,
  type TemplateShortlist,
} from "./agentOrchestrationContracts.js";
import type { AgentDocumentPlan } from "./agentPlanningService.js";
import type { AgentModeKey } from "./agentModeRegistry.js";

const DocumentGraphAnnotation = Annotation.Root({
  sessionId: Annotation<string>(),
  turnId: Annotation<string>(),
  stage: Annotation<DocumentGraphStage>(),
  intent: Annotation<DocumentGraphIntent>(),
  mode: Annotation<AgentModeKey>(),
  userPrompt: Annotation<string>(),
  ingestion: Annotation<IngestionPacket | null>(),
  retrieval: Annotation<TemplateShortlist | null>(),
  plan: Annotation<AgentDocumentPlan | null>(),
  build: Annotation<BuildResult | null>(),
  selectedTemplateId: Annotation<string>(),
  answers: Annotation<Record<string, string>>(),
  artifactIds: Annotation<string[]>({
    reducer: (left, right) => Array.from(new Set([...left, ...right])),
    default: () => [],
  }),
  warnings: Annotation<string[]>({
    reducer: (left, right) => Array.from(new Set([...left, ...right])),
    default: () => [],
  }),
  error: Annotation<string | undefined>(),
});

type LangGraphDocumentState = typeof DocumentGraphAnnotation.State;
type LangGraphDocumentUpdate = typeof DocumentGraphAnnotation.Update;

function stageNode(stage: DocumentGraphStage) {
  return async (): Promise<LangGraphDocumentUpdate> => ({
    stage,
  });
}

async function intentNode(
  state: LangGraphDocumentState
): Promise<LangGraphDocumentUpdate> {
  const prompt = state.userPrompt.toLowerCase();

  if (/\b(export|download|zip)\b/.test(prompt)) {
    return { stage: "intent", intent: "export" };
  }

  if (/\b(compile|render|pdf)\b/.test(prompt)) {
    return { stage: "intent", intent: "compile" };
  }

  if (/\b(fix|repair|error|failed)\b/.test(prompt)) {
    return { stage: "intent", intent: "repair" };
  }

  if (/\b(upload|ingest|read this|source)\b/.test(prompt)) {
    return { stage: "intent", intent: "ingest" };
  }

  if (/\b(edit|rewrite|modify|update|change)\b/.test(prompt)) {
    return { stage: "intent", intent: "edit" };
  }

  if (/\b(create|generate|write|draft|make)\b/.test(prompt)) {
    return { stage: "intent", intent: "create" };
  }

  return { stage: "intent", intent: "conversation" };
}

export function createDocumentGraph() {
  return new StateGraph(DocumentGraphAnnotation)
    .addNode("intent", intentNode)
    .addNode("ingestion", stageNode("ingestion"))
    .addNode("retrieval", stageNode("retrieval"))
    .addNode("clarification", stageNode("clarification"))
    .addNode("build", stageNode("build"))
    .addNode("compile", stageNode("compile"))
    .addNode("repair", stageNode("repair"))
    .addNode("export", stageNode("export"))
    .addEdge(START, "intent")
    .addEdge("intent", "ingestion")
    .addEdge("ingestion", "retrieval")
    .addEdge("retrieval", "clarification")
    .addEdge("clarification", "build")
    .addEdge("build", "compile")
    .addEdge("compile", "repair")
    .addEdge("repair", "export")
    .addEdge("export", END)
    .compile();
}

export async function runDocumentGraphSkeleton(input: {
  sessionId: string;
  turnId: string;
  userPrompt: string;
  mode: AgentModeKey;
}): Promise<DocumentGraphState> {
  const graph = createDocumentGraph();
  const initialState = createInitialDocumentGraphState(
    input.sessionId,
    input.turnId,
    input.userPrompt,
    input.mode
  );

  return graph.invoke(initialState) as Promise<DocumentGraphState>;
}
