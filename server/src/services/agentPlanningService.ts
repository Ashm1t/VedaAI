import type { LLMAdapter } from "@libra/core";

export type AgentDocumentMode =
  | "resume"
  | "research_paper"
  | "report"
  | "cover_letter"
  | "letter"
  | "article"
  | "presentation"
  | "worksheet"
  | "homework"
  | "exam"
  | "generic";

export type AgentDocumentAction = "create" | "edit" | "rewrite";

export interface AgentSectionPlan {
  title: string;
  purpose: string;
  details: string[];
  required: boolean;
}

export interface AgentDocumentPlan {
  action: AgentDocumentAction;
  documentMode: AgentDocumentMode;
  preferredTemplateTypes: string[];
  subjectHints: string[];
  positiveKeywords: string[];
  title: string;
  summary: string;
  styleHints: string[];
  preserveCurrentDocument: boolean;
  fieldValues: Record<string, string | string[]>;
  sections: AgentSectionPlan[];
  contentInstructions: string[];
  missingInformation: string[];
}

interface PlanContext {
  prompt: string;
  messages: Array<{ role: string; content: string }>;
  currentTex: string;
  sourceDocumentName: string;
  sourceContextText?: string;
}

const DEFAULT_STYLE_HINTS = ["clean", "readable", "single-file"];

function inferMode(text: string): AgentDocumentMode {
  const normalized = text.toLowerCase();

  if (/\b(resume|cv|curriculum vitae)\b/.test(normalized)) return "resume";
  if (/\b(cover letter)\b/.test(normalized)) return "cover_letter";
  if (/\b(research paper|conference paper|journal paper|thesis)\b/.test(normalized)) {
    return "research_paper";
  }
  if (/\b(report|project report|lab report)\b/.test(normalized)) return "report";
  if (/\b(slides|presentation|beamer)\b/.test(normalized)) return "presentation";
  if (/\b(worksheet|activity sheet)\b/.test(normalized)) return "worksheet";
  if (/\b(homework|assignment)\b/.test(normalized)) return "homework";
  if (/\b(exam|question paper|test paper|quiz)\b/.test(normalized)) return "exam";
  if (/\b(letter)\b/.test(normalized)) return "letter";
  if (/\b(article|essay)\b/.test(normalized)) return "article";
  return "generic";
}

function inferAction(prompt: string, currentTex: string): AgentDocumentAction {
  const normalized = prompt.toLowerCase();

  if (!currentTex.trim()) return "create";
  if (/\b(rewrite|reformat|proper format|scratch that)\b/.test(normalized)) {
    return "rewrite";
  }
  if (/\b(edit|update|modify|fix|change|improve)\b/.test(normalized)) {
    return "edit";
  }
  return "create";
}

function defaultTemplateTypes(mode: AgentDocumentMode): string[] {
  switch (mode) {
    case "resume":
      return ["resume", "article"];
    case "research_paper":
      return ["article", "report"];
    case "report":
      return ["report", "article"];
    case "cover_letter":
    case "letter":
      return ["letter", "article"];
    case "presentation":
      return ["presentation"];
    case "worksheet":
      return ["worksheet", "homework", "article"];
    case "homework":
      return ["homework", "worksheet", "article"];
    case "exam":
      return ["exam", "exam-paper", "article"];
    case "article":
    case "generic":
    default:
      return ["article", "report"];
  }
}

function defaultPositiveKeywords(mode: AgentDocumentMode): string[] {
  switch (mode) {
    case "resume":
      return ["resume", "cv", "professional"];
    case "research_paper":
      return ["paper", "research", "conference", "journal", "ieee"];
    case "report":
      return ["report", "technical", "project"];
    case "cover_letter":
    case "letter":
      return ["letter", "application", "formal"];
    case "presentation":
      return ["slides", "presentation", "beamer"];
    case "worksheet":
      return ["worksheet", "activity"];
    case "homework":
      return ["homework", "assignment"];
    case "exam":
      return ["exam", "question paper", "test"];
    case "article":
    case "generic":
    default:
      return ["article", "document"];
  }
}

function fallbackSections(mode: AgentDocumentMode): AgentSectionPlan[] {
  switch (mode) {
    case "resume":
      return [
        {
          title: "Professional Summary",
          purpose: "Give a concise top-level overview",
          details: [],
          required: true,
        },
        {
          title: "Experience",
          purpose: "Highlight work history and achievements",
          details: [],
          required: true,
        },
        {
          title: "Education",
          purpose: "Summarize academic background",
          details: [],
          required: true,
        },
        {
          title: "Skills",
          purpose: "List relevant technical and domain skills",
          details: [],
          required: true,
        },
      ];
    case "research_paper":
      return [
        {
          title: "Abstract",
          purpose: "Summarize the problem, approach, and contributions",
          details: [],
          required: true,
        },
        {
          title: "Introduction",
          purpose: "Frame the topic and motivation",
          details: [],
          required: true,
        },
        {
          title: "Methodology",
          purpose: "Explain the method or argument structure",
          details: [],
          required: true,
        },
        {
          title: "Results and Discussion",
          purpose: "Present findings or analysis",
          details: [],
          required: true,
        },
        {
          title: "Conclusion",
          purpose: "Close the paper and summarize outcomes",
          details: [],
          required: true,
        },
      ];
    default:
      return [
        {
          title: "Introduction",
          purpose: "Open the document clearly",
          details: [],
          required: true,
        },
        {
          title: "Main Content",
          purpose: "Cover the requested substance",
          details: [],
          required: true,
        },
        {
          title: "Conclusion",
          purpose: "Close the document cleanly",
          details: [],
          required: true,
        },
      ];
  }
}

function sanitizePlan(plan: Partial<AgentDocumentPlan>, context: PlanContext): AgentDocumentPlan {
  const inferredMode = inferMode(
    `${context.prompt}\n${context.sourceDocumentName}\n${context.currentTex.slice(0, 2000)}`
  );
  const documentMode = plan.documentMode || inferredMode;
  const action = plan.action || inferAction(context.prompt, context.currentTex);
  const defaultPreserveCurrentDocument =
    action === "edit" && Boolean(context.currentTex.trim());

  return {
    action,
    documentMode,
    preferredTemplateTypes:
      plan.preferredTemplateTypes && plan.preferredTemplateTypes.length > 0
        ? plan.preferredTemplateTypes
        : defaultTemplateTypes(documentMode),
    subjectHints: (plan.subjectHints || []).filter(Boolean),
    positiveKeywords:
      plan.positiveKeywords && plan.positiveKeywords.length > 0
        ? plan.positiveKeywords
        : defaultPositiveKeywords(documentMode),
    title: plan.title || "Generated Document",
    summary: plan.summary || context.prompt,
    styleHints:
      plan.styleHints && plan.styleHints.length > 0
        ? plan.styleHints
        : DEFAULT_STYLE_HINTS,
    preserveCurrentDocument:
      typeof plan.preserveCurrentDocument === "boolean"
        ? plan.preserveCurrentDocument
        : defaultPreserveCurrentDocument,
    fieldValues: plan.fieldValues || {},
    sections:
      plan.sections && plan.sections.length > 0
        ? plan.sections.map((section) => ({
            title: section.title || "Section",
            purpose: section.purpose || "",
            details: section.details || [],
            required: section.required !== false,
          }))
        : fallbackSections(documentMode),
    contentInstructions: plan.contentInstructions || [],
    missingInformation: plan.missingInformation || [],
  };
}

function buildPlanningPrompt(context: PlanContext) {
  const conversation = context.messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return `You are planning a LaTeX document generation turn.

Return a JSON object with exactly these keys:
{
  "action": "create" | "edit" | "rewrite",
  "documentMode": "resume" | "research_paper" | "report" | "cover_letter" | "letter" | "article" | "presentation" | "worksheet" | "homework" | "exam" | "generic",
  "preferredTemplateTypes": ["template type strings"],
  "subjectHints": ["short subject hints"],
  "positiveKeywords": ["keywords useful for template search"],
  "title": "document title",
  "summary": "short summary of what should be produced",
  "styleHints": ["style guidance"],
  "preserveCurrentDocument": true | false,
  "fieldValues": {
    "key": "value or array of values"
  },
  "sections": [
    {
      "title": "section title",
      "purpose": "why this section exists",
      "details": ["facts, bullets, or requirements to include"],
      "required": true
    }
  ],
  "contentInstructions": ["specific writing instructions"],
  "missingInformation": ["important missing info that is still unknown"]
}

Guidelines:
- Treat templates as structure only, not content.
- Extract concrete facts from the user prompt and conversation history into fieldValues and section details.
- If the user asks for a fictional or example document and leaves details vague, infer plausible but internally consistent content requirements.
- For resumes, prefer sections like summary, experience, education, projects, skills, achievements.
- For research papers, prefer title, abstract, introduction, methodology, results/discussion, conclusion, references if appropriate.
- If a current LaTeX document exists and the user wants edits or reformatting, preserveCurrentDocument should usually be true.
- Keep subjectHints and positiveKeywords short and retrieval-friendly.

SOURCE DOCUMENT NAME:
${context.sourceDocumentName || "none"}

CURRENT LATEX:
${context.currentTex.slice(0, 5000) || "none"}

SOURCE CONTEXT SNIPPET:
${context.sourceContextText?.slice(0, 5000) || "none"}

RECENT CONVERSATION:
${conversation || "none"}

LATEST USER PROMPT:
${context.prompt}`;
}

export async function planAgentDocument(
  llm: LLMAdapter,
  context: PlanContext
): Promise<AgentDocumentPlan> {
  try {
    const raw = await llm.generateJSON(buildPlanningPrompt(context));
    const parsed = JSON.parse(raw) as Partial<AgentDocumentPlan>;
    return sanitizePlan(parsed, context);
  } catch {
    return sanitizePlan({}, context);
  }
}
