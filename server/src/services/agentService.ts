import fs from "fs";
import path from "path";
import {
  GroqAdapter,
  validateLatex,
  autoFixLatex,
  compileLaTeX,
  extractErrorFromLog,
} from "@libra/core";
import { AgentSessionModel } from "../models/AgentSession.js";
import { AgentArtifactModel } from "../models/AgentArtifact.js";
import { getIO } from "../index.js";
import { config } from "../config/index.js";
import {
  retrieveTemplatesForAgent,
  getTemplateContextById,
  type RetrievedTemplateContext,
} from "./templateRetrievalService.js";
import {
  planAgentDocument,
  type AgentDocumentPlan,
} from "./agentPlanningService.js";
import {
  buildGuidanceMessage,
  buildPendingInputMessage,
  buildUserInputSummary,
  createWorkflowFromPlan,
  mergeWorkflowIntoPlan,
  updateWorkflowWithResponses,
  workflowHasEnoughInput,
  type AgentTurnInput,
  type AgentWorkflowState,
} from "./agentWorkflowService.js";
import { detectAgentIntent } from "./agentIntentService.js";
import {
  applyModeProfileToPlan,
  resolveAgentMode,
} from "./agentModeRegistry.js";
import {
  ingestAgentFiles,
  type IngestedSourceFile,
} from "./agentDocumentIngestionService.js";

type AgentRole = "system" | "user" | "assistant";
type AgentSessionStatus = "idle" | "processing" | "ready" | "error";

export interface AgentMessagePayload {
  id: string;
  role: AgentRole;
  content: string;
  status: "complete" | "error";
  createdAt: Date;
}

/* ── Socket emitters ── */

function emitStatus(
  sessionId: string,
  status: AgentSessionStatus,
  error?: string
) {
  const io = getIO();
  if (!io) return;
  io.emit("agent:status", { sessionId, status, error: error || null });
}

function emitMessage(sessionId: string, message: AgentMessagePayload) {
  const io = getIO();
  if (!io) return;
  io.emit("agent:message", { sessionId, message });
}

function emitArtifact(sessionId: string, artifact: unknown) {
  const io = getIO();
  if (!io) return;
  io.emit("agent:artifact", { sessionId, artifact });
}

function emitSessionUpdate(sessionId: string, session: { toJSON: () => unknown }) {
  const io = getIO();
  if (!io) return;
  io.emit("agent:session", { sessionId, session: session.toJSON() });
}

/* ── LLM singleton ── */

let llm: GroqAdapter | null = null;

function getLLM(): GroqAdapter {
  if (!llm) {
    if (!config.groqApiKey) throw new Error("GROQ_API_KEY not configured");
    llm = new GroqAdapter({ apiKey: config.groqApiKey });
  }
  return llm;
}

/* ── Prompt building ── */

function buildAgentPrompt(
  userPrompt: string,
  messages: Array<{ role: string; content: string }>,
  currentTex: string,
  sourceDocumentName: string,
  _retrieval?: RetrievedTemplateContext | null
): string {
  const history = messages
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const docState = currentTex
    ? `CURRENT DOCUMENT (modify this when the user requests changes — always return the COMPLETE updated document):\n\`\`\`\n${currentTex}\n\`\`\``
    : "No document exists yet. Create one if the user requests it.";

  return `You are Libra Agent, a LaTeX document assistant. You help users create and edit LaTeX documents.

CRITICAL: Respond ONLY with a JSON object containing exactly two keys:
{
  "message": "Your conversational response to the user",
  "latex": "Complete LaTeX source code" OR null
}

RULES FOR THE "latex" FIELD:
- When the user asks to CREATE, MODIFY, or EDIT a document: provide the COMPLETE compilable LaTeX source starting with \\documentclass. Always include ALL content, not just the changed parts.
- When the user asks a QUESTION, makes conversation, or no document change is needed: set latex to null.
- NEVER use \\includegraphics or reference external image files.
- NEVER wrap LaTeX in markdown fences inside the JSON.
- The LaTeX MUST be a complete, standalone, compilable document.

Source document: ${sourceDocumentName || "none"}

${docState}

CONVERSATION HISTORY:
${history}

USER PROMPT:
${userPrompt}`;
}

/* ── Response parsing ── */

function parseAgentResponse(raw: string): {
  message: string;
  latex: string | null;
} {
  try {
    const parsed = JSON.parse(raw);
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message
        : "Document processed.";
    const latex =
      typeof parsed.latex === "string" && parsed.latex.trim()
        ? parsed.latex
        : null;
    return { message, latex };
  } catch {
    return { message: raw, latex: null };
  }
}

/* ── LaTeX compilation with retry ── */

async function compileLatexWithRetry(
  tex: string,
  documentId: string
): Promise<{ pdfPath: string | null; finalTex: string; error: string | null }> {
  let workingTex = tex;

  const validation = validateLatex(workingTex);
  if (!validation.valid) {
    workingTex = autoFixLatex(workingTex);
  }

  try {
    const pdfPath = await compileLaTeX(
      workingTex,
      config.outputDir,
      documentId,
      config.latexTimeout
    );
    return { pdfPath, finalTex: workingTex, error: null };
  } catch (firstErr) {
    // Retry after auto-fix
    workingTex = autoFixLatex(workingTex);

    try {
      const pdfPath = await compileLaTeX(
        workingTex,
        config.outputDir,
        `${documentId}_retry`,
        config.latexTimeout
      );
      return { pdfPath, finalTex: workingTex, error: null };
    } catch (retryErr) {
      const errMsg =
        retryErr instanceof Error ? retryErr.message : "Compilation failed";
      const cleanError = extractErrorFromLog(errMsg);
      return { pdfPath: null, finalTex: workingTex, error: cleanError };
    }
  }
}

/* ── Helpers ── */

function buildSessionTitle(prompt: string) {
  const compact = prompt.trim().replace(/\s+/g, " ");
  return compact.length > 48 ? `${compact.slice(0, 45)}...` : compact;
}

function buildRetrievalQuery(
  userPrompt: string,
  messages: Array<{ role: string; content: string }>,
  currentTex: string,
  sourceDocumentName: string,
  sourceContextText: string
) {
  const recentConversation = messages
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const parts = [
    `User request: ${userPrompt}`,
    `Source document name: ${sourceDocumentName || "none"}`,
  ];

  if (recentConversation) {
    parts.push(`Recent conversation:\n${recentConversation}`);
  }

  if (currentTex) {
    parts.push(`Current LaTeX document snippet:\n${currentTex.slice(0, 3000)}`);
  }

  if (sourceContextText) {
    parts.push(`Source context snippet:\n${sourceContextText.slice(0, 3000)}`);
  }

  return parts.join("\n\n");
}

function appendRetrievalContext(
  userPrompt: string,
  retrieval: RetrievedTemplateContext | null
) {
  if (!retrieval) return userPrompt;

  const templateList = retrieval.results
    .map(
      (result, index) =>
        `${index + 1}. ${result.templateId} | score=${result.score.toFixed(3)} | ${result.meta.name} | type=${result.meta.type} | subject=${result.meta.subject || "general"} | tags=${result.meta.tags.join(", ")}`
    )
    .join("\n");

  return `${userPrompt}

TEMPLATE RETRIEVAL CONTEXT (${retrieval.mode.toUpperCase()}):
${templateList}

PRIMARY TEMPLATE TO USE AS REFERENCE:
Template ID: ${retrieval.primaryTemplateId}
Template name: ${retrieval.primaryTemplateMeta.name}
Template description: ${retrieval.primaryTemplateMeta.description}

TEMPLATE SOURCE REFERENCE (follow its structure, packages, and style when creating a new document):
\`\`\`latex
${retrieval.primaryTemplateSource}
\`\`\``;
}

function buildStructuredGenerationPrompt(
  userPrompt: string,
  messages: Array<{ role: string; content: string }>,
  currentTex: string,
  sourceDocumentName: string,
  sourceContextText: string,
  plan: AgentDocumentPlan,
  retrieval: RetrievedTemplateContext | null
) {
  const history = messages
    .slice(-10)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const fieldValues = JSON.stringify(plan.fieldValues, null, 2);
  const sectionPlan = JSON.stringify(plan.sections, null, 2);
  const retrievalContext = retrieval
    ? `SELECTED TEMPLATE:
- id: ${retrieval.primaryTemplateId}
- name: ${retrieval.primaryTemplateMeta.name}
- type: ${retrieval.primaryTemplateMeta.type}
- subject: ${retrieval.primaryTemplateMeta.subject || "general"}
- document class: ${retrieval.primaryTemplateClass}
- why selected: ${retrieval.selectionReason}

TEMPLATE SOURCE (treat this as the skeleton to adapt):
\`\`\`latex
${retrieval.primaryTemplateSource}
\`\`\``
    : "No template selected. Use a clean single-file LaTeX structure.";

  const docState = currentTex
    ? `CURRENT DOCUMENT TO EDIT OR REFORMAT:
\`\`\`latex
${currentTex}
\`\`\``
    : "No current document exists yet.";

  return `You are Libra Agent, a structured LaTeX author.

Return ONLY a JSON object with exactly these keys:
{
  "message": "short user-facing summary",
  "latex": "complete compilable LaTeX source or null"
}

You are not allowed to freehand random layouts. Use the document plan and selected template skeleton to produce the document.

Hard requirements:
- Output a complete single-file pdflatex document.
- Do not depend on external .cls, .sty, .bib, .png, .jpg, or \\input files.
- Replace all sample content with new content driven by the extracted fields and section plan.
- If plan.action is "edit" or "rewrite" and plan.preserveCurrentDocument is true, preserve the current document structure where reasonable.
- If the selected template contains unsupported external dependencies, keep only the structural ideas and rewrite it into a self-contained LaTeX file.
- Write substantive section content. Do not just restate the prompt in prose.
- For resumes, include coherent contact info, summary, experience, education, and skills unless the plan clearly says otherwise.
- For research papers, include a strong title, abstract, introduction, multiple body sections, and conclusion unless the plan clearly says otherwise.
- Never use \\includegraphics or external file references.
- Never wrap the LaTeX in markdown fences inside JSON.

SOURCE DOCUMENT NAME:
${sourceDocumentName || "none"}

SOURCE CONTEXT:
\`\`\`
${sourceContextText.slice(0, 7000) || "none"}
\`\`\`

LATEST USER PROMPT:
${userPrompt}

DOCUMENT PLAN:
- action: ${plan.action}
- mode: ${plan.documentMode}
- title: ${plan.title}
- summary: ${plan.summary}
- style hints: ${plan.styleHints.join(", ")}
- preserve current document: ${String(plan.preserveCurrentDocument)}
- missing information: ${plan.missingInformation.join(", ") || "none"}

FIELD VALUES:
\`\`\`json
${fieldValues}
\`\`\`

SECTION PLAN:
\`\`\`json
${sectionPlan}
\`\`\`

CONTENT INSTRUCTIONS:
- ${plan.contentInstructions.join("\n- ") || "write a coherent, well-structured document"}

${docState}

${retrievalContext}

RECENT CONVERSATION:
${history}`;
}

function buildConversationPrompt(
  userPrompt: string,
  messages: Array<{ role: string; content: string }>,
  sourceDocumentName: string,
  sourceContextText: string
) {
  const history = messages
    .slice(-10)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return `You are Libra Agent, a conversational LaTeX document assistant.

Return ONLY a JSON object with exactly these keys:
{
  "message": "helpful conversational reply",
  "latex": null
}

Rules:
- Stay conversational and helpful.
- Do not trigger a document draft unless the user clearly wants one.
- If uploaded source context exists, use it to answer naturally.
- latex must always be null for this response.

SOURCE DOCUMENT NAME:
${sourceDocumentName || "none"}

SOURCE CONTEXT:
\`\`\`
${sourceContextText.slice(0, 5000) || "none"}
\`\`\`

RECENT CONVERSATION:
${history || "none"}

LATEST USER PROMPT:
${userPrompt}`;
}

function hasMeaningfulLatexStructure(
  plan: AgentDocumentPlan,
  latex: string
): boolean {
  const normalized = latex.toLowerCase();
  const sectionCount = (normalized.match(/\\section\*?/g) || []).length;

  if (!normalized.includes("\\documentclass")) return false;
  if (normalized.length < 800) return false;

  switch (plan.documentMode) {
    case "resume":
      return (
        /education|experience|skills|summary|projects/.test(normalized) &&
        sectionCount >= 2
      );
    case "research_paper":
      return /abstract/.test(normalized) && sectionCount >= 3;
    case "report":
    case "article":
      return sectionCount >= 2;
    default:
      return true;
  }
}

function getWorkflowState(session: { workflow?: unknown }): AgentWorkflowState | null {
  return session.workflow && typeof session.workflow === "object"
    ? (session.workflow as AgentWorkflowState)
    : null;
}

async function saveSessionAndEmit(
  sessionId: string,
  session: { save: () => Promise<unknown>; toJSON: () => unknown }
) {
  await session.save();
  emitSessionUpdate(sessionId, session);
}

async function appendAssistantMessage(
  sessionId: string,
  session: {
    messages: AgentMessagePayload[];
    status: AgentSessionStatus;
    save: () => Promise<unknown>;
    toJSON: () => unknown;
  },
  content: string
) {
  const assistantMessage: AgentMessagePayload = {
    id: `msg_${Date.now()}_assistant`,
    role: "assistant",
    content,
    status: "complete",
    createdAt: new Date(),
  };

  session.messages.push(assistantMessage);
  await saveSessionAndEmit(sessionId, session);
  emitMessage(sessionId, assistantMessage);
  return assistantMessage;
}

/* ── Session CRUD ── */

export async function createAgentSession(userId?: string) {
  const session = await AgentSessionModel.create({
    userId: userId || null,
    messages: [
      {
        role: "assistant",
        content:
          "Hello! I'm your LaTeX document agent. Tell me what you want to create or modify, and I’ll guide you through template selection and key details before I generate and compile the document.",
      },
    ],
  });

  return session.toJSON();
}

export async function getAgentSessionForUser(
  sessionId: string,
  userId?: string
) {
  const session = await AgentSessionModel.findById(sessionId);
  if (!session) return null;

  if (userId && session.userId && session.userId !== userId) {
    return null;
  }

  return session;
}

export async function getLatestArtifactForSession(
  sessionId: string,
  userId?: string
) {
  const session = await getAgentSessionForUser(sessionId, userId);
  if (!session || !session.latestArtifactId) return null;

  return AgentArtifactModel.findById(session.latestArtifactId);
}

export async function getArtifactForUser(artifactId: string, userId?: string) {
  const artifact = await AgentArtifactModel.findById(artifactId);
  if (!artifact) return null;

  const session = await getAgentSessionForUser(artifact.sessionId, userId);
  if (!session) return null;

  return artifact;
}

export async function ingestFilesIntoAgentSession(
  sessionId: string,
  files: Express.Multer.File[],
  userId?: string
) {
  const session = await getAgentSessionForUser(sessionId, userId);
  if (!session) return null;

  const result = await ingestAgentFiles(files);
  const existingFiles = Array.isArray(session.sourceFiles)
    ? (session.sourceFiles as IngestedSourceFile[])
    : [];

  session.sourceFiles = [...existingFiles, ...result.files];
  session.sourceDocumentName = result.primaryDocumentName;
  session.sourceContextText = [session.sourceContextText || "", result.combinedText]
    .filter(Boolean)
    .join("\n\n---\n\n")
    .trim();
  session.lastError = "";

  await saveSessionAndEmit(sessionId, session);

  const readyCount = result.files.filter((file) => file.status === "ready").length;
  const errorCount = result.files.length - readyCount;
  const summaryParts = [
    `I ingested ${readyCount} source file${readyCount === 1 ? "" : "s"} and can use that material in future answers and drafts.`,
  ];

  if (errorCount > 0) {
    summaryParts.push(
      `${errorCount} file${errorCount === 1 ? "" : "s"} could not be parsed cleanly.`
    );
  }

  const assistantMessage = await appendAssistantMessage(
    sessionId,
    session,
    summaryParts.join(" ")
  );

  session.status = "ready";
  await saveSessionAndEmit(sessionId, session);
  emitStatus(sessionId, "ready");

  return {
    session,
    message: assistantMessage,
    files: result.files,
  };
}

export async function appendUserMessage(
  sessionId: string,
  input: AgentTurnInput,
  userId?: string
) {
  const session = await getAgentSessionForUser(sessionId, userId);
  if (!session) return null;

  const workflow = getWorkflowState(session);
  const content = buildUserInputSummary(workflow, input);
  const finalContent = content || input.content?.trim() || "Updated guided input";

  const message: AgentMessagePayload = {
    id: `msg_${Date.now()}`,
    role: "user",
    content: finalContent,
    status: "complete",
    createdAt: new Date(),
  };

  session.messages.push(message);
  if (session.title === "Untitled Agent Session" && finalContent) {
    session.title = buildSessionTitle(finalContent);
  }
  session.lastError = "";
  await saveSessionAndEmit(sessionId, session);

  return { session, message };
}

/* ── Core orchestration ── */

export async function processAgentMessage(
  sessionId: string,
  input: AgentTurnInput,
  sourceMessageId: string
) {
  const session = await AgentSessionModel.findById(sessionId);
  if (!session) return;

  try {
    session.status = "processing";
    session.lastError = "";
    await saveSessionAndEmit(sessionId, session);
    emitStatus(sessionId, "processing");

    const conversation = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const planner = getLLM();
    const prompt = input.content?.trim() || "";
    const existingWorkflow = getWorkflowState(session);
    const sourceContextText = session.sourceContextText || "";

    let plan: AgentDocumentPlan;
    let retrieval: RetrievedTemplateContext | null = null;
    let latestUserPrompt = prompt;

    if (
      existingWorkflow &&
      (existingWorkflow.stage === "template_selection" ||
        existingWorkflow.stage === "clarification")
    ) {
      const updatedWorkflow = updateWorkflowWithResponses(existingWorkflow, input);
      session.workflow = updatedWorkflow;

      if (!workflowHasEnoughInput(updatedWorkflow)) {
        session.status = "ready";
        await appendAssistantMessage(
          sessionId,
          session,
          buildPendingInputMessage(updatedWorkflow)
        );
        emitStatus(sessionId, "ready");
        return;
      }

      const draftingWorkflow: AgentWorkflowState = {
        ...updatedWorkflow,
        stage: "drafting",
      };
      session.workflow = draftingWorkflow;
      await saveSessionAndEmit(sessionId, session);

      plan = mergeWorkflowIntoPlan(updatedWorkflow, prompt);
      applyModeProfileToPlan(plan, updatedWorkflow.documentMode);
      latestUserPrompt =
        prompt || updatedWorkflow.lastUserPrompt || updatedWorkflow.promptSummary;
      retrieval = updatedWorkflow.selectedTemplateId
        ? getTemplateContextById(updatedWorkflow.selectedTemplateId)
        : null;

      console.log(
        `[agent:${sessionId}] guided mode=${plan.documentMode} action=${plan.action} template=${retrieval?.primaryTemplateId || "none"}`
      );
    } else {
      const intent = await detectAgentIntent(planner, {
        prompt,
        messages: conversation,
        hasCurrentTex: Boolean(session.currentTex?.trim()),
        hasSourceContext: Boolean(sourceContextText.trim()),
      });

      console.log(
        `[agent:${sessionId}] intent=${intent.kind} workflow=${String(intent.triggerWorkflow)} mode=${intent.modeKey} confidence=${intent.confidence.toFixed(2)}`
      );

      if (!intent.triggerWorkflow) {
        const conversationPrompt = buildConversationPrompt(
          prompt,
          conversation,
          session.sourceDocumentName,
          sourceContextText
        );
        const rawConversation = await planner.generateJSON(conversationPrompt);
        const { message: assistantText } = parseAgentResponse(rawConversation);

        session.status = "ready";
        await appendAssistantMessage(sessionId, session, assistantText);
        emitStatus(sessionId, "ready");
        return;
      }

      plan = await planAgentDocument(planner, {
        prompt,
        messages: conversation,
        currentTex: session.currentTex || "",
        sourceDocumentName: session.sourceDocumentName,
        sourceContextText,
      });
      applyModeProfileToPlan(plan, resolveAgentMode(intent.modeKey, prompt));

      retrieval = await retrieveTemplatesForAgent(
        buildRetrievalQuery(
          [
            plan.title,
            plan.summary,
            ...plan.positiveKeywords,
            ...plan.subjectHints,
            ...plan.sections.flatMap((section) => [
              section.title,
              ...section.details,
            ]),
          ]
            .filter(Boolean)
            .join("\n"),
          conversation,
          session.currentTex || "",
          session.sourceDocumentName,
          sourceContextText
        ),
        {
          preferredTypes: plan.preferredTemplateTypes,
          subjectHints: plan.subjectHints,
          positiveKeywords: plan.positiveKeywords,
          topK: 4,
        }
      );

      console.log(
        `[agent:${sessionId}] mode=${plan.documentMode} action=${plan.action} retrieval=${retrieval?.mode || "none"} template=${retrieval?.primaryTemplateId || "none"}`
      );

      if (plan.action !== "edit") {
        const workflow = createWorkflowFromPlan(plan, retrieval, prompt);
        session.workflow = workflow;
        session.status = "ready";
        await appendAssistantMessage(
          sessionId,
          session,
          buildGuidanceMessage(workflow)
        );
        emitStatus(sessionId, "ready");
        return;
      }
    }

    const agentPrompt = buildStructuredGenerationPrompt(
      latestUserPrompt,
      conversation,
      session.currentTex || "",
      session.sourceDocumentName,
      sourceContextText,
      plan,
      retrieval
    );

    let rawResponse = await planner.generateJSON(agentPrompt);
    let { message: assistantText, latex } = parseAgentResponse(rawResponse);

    if (!latex && plan.action !== "edit") {
      rawResponse = await planner.generateJSON(
        `${agentPrompt}

The previous response did not provide LaTeX even though the user asked for a document.
Return a complete LaTeX document this time.`
      );
      ({ message: assistantText, latex } = parseAgentResponse(rawResponse));
    }

    if (latex && !hasMeaningfulLatexStructure(plan, latex)) {
      rawResponse = await planner.generateJSON(
        `${agentPrompt}

The previous draft was structurally weak or incomplete.
Regenerate the full document with stronger section structure, richer content, and cleaner formatting while still respecting the selected template skeleton.`
      );
      ({ message: assistantText, latex } = parseAgentResponse(rawResponse));
    }

    let finalMessage = assistantText;
    let artifactKind: "response_snapshot" | "compiled_pdf" = "response_snapshot";
    let pdfPath = "";
    let latexSource = session.currentTex || "";

    if (latex) {
      const docId = `agent_${sessionId}_${Date.now()}`;
      const result = await compileLatexWithRetry(latex, docId);

      latexSource = result.finalTex;
      session.currentTex = result.finalTex;

      if (result.pdfPath) {
        pdfPath = result.pdfPath;
        session.currentPdfPath = result.pdfPath;
        artifactKind = "compiled_pdf";
      } else if (result.error) {
        finalMessage += `\n\n---\n**Compilation failed:** ${result.error}\nThe LaTeX has been saved. You can ask me to fix the issue.`;
      }
    }

    session.status = "ready";
    if (session.workflow && typeof session.workflow === "object") {
      const readyWorkflow: AgentWorkflowState = {
        ...(session.workflow as AgentWorkflowState),
        stage: "ready",
        missingInformation: [],
        lastUserPrompt: latestUserPrompt,
        plan,
      };
      session.workflow = readyWorkflow;
    }

    const assistantMessage = await appendAssistantMessage(
      sessionId,
      session,
      finalMessage
    );

    const turnNumber = session.messages.filter(
      (m) => m.role === "assistant"
    ).length;
    const artifact = await AgentArtifactModel.create({
      sessionId,
      sourceMessageId,
      kind: artifactKind,
      title: `Turn ${turnNumber}`,
      assistantSummary: finalMessage,
      latexSource,
      pdfPath,
      templateUsed: retrieval?.primaryTemplateId || "",
    });

    session.latestArtifactId = artifact._id;
    await saveSessionAndEmit(sessionId, session);

    emitArtifact(sessionId, artifact.toJSON());
    emitStatus(sessionId, "ready");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent turn failed";
    session.status = "error";
    session.lastError = message;
    await saveSessionAndEmit(sessionId, session);

    emitStatus(sessionId, "error", message);
  }
}

export async function resolveArtifactPdfPath(
  artifactId: string,
  userId?: string
) {
  const artifact = await getArtifactForUser(artifactId, userId);
  const storedPath = artifact?.pdfPath;
  if (!artifact || !storedPath) return null;

  return path.isAbsolute(storedPath)
    ? storedPath
    : path.resolve(config.outputDir, storedPath);
}

export function artifactPdfExists(resolvedPath: string) {
  return fs.existsSync(resolvedPath);
}
