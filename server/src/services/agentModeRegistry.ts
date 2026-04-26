import type { AgentDocumentMode, AgentDocumentPlan } from "./agentPlanningService.js";

export type AgentModeKey =
  | "resume_cv"
  | "research_paper"
  | "report_article"
  | "letter_application"
  | "slides_presentation"
  | "worksheet_exam"
  | "sandbox";

export interface AgentModeProfile {
  key: AgentModeKey;
  label: string;
  description: string;
  templateTypes: string[];
  retrievalKeywords: string[];
  rendererHint: string;
}

export const AGENT_MODE_REGISTRY: Record<AgentModeKey, AgentModeProfile> = {
  resume_cv: {
    key: "resume_cv",
    label: "Resume / CV",
    description: "Professional resumes, CVs, portfolios, and hiring docs.",
    templateTypes: ["resume", "cv", "article"],
    retrievalKeywords: ["resume", "cv", "professional", "one-page"],
    rendererHint: "Keep header/contact compact and prioritize experience impact.",
  },
  research_paper: {
    key: "research_paper",
    label: "Research Paper",
    description: "Conference, journal, thesis, and formal academic papers.",
    templateTypes: ["article", "report", "paper"],
    retrievalKeywords: ["research", "paper", "conference", "ieee", "journal"],
    rendererHint: "Use academic structure, author block, abstract, and section hierarchy.",
  },
  report_article: {
    key: "report_article",
    label: "Report / Article",
    description: "Technical reports, essays, whitepapers, and general articles.",
    templateTypes: ["report", "article"],
    retrievalKeywords: ["report", "article", "technical", "project"],
    rendererHint: "Favor a clear title page or clean article flow with strong headings.",
  },
  letter_application: {
    key: "letter_application",
    label: "Letter / Application",
    description: "Cover letters, formal letters, applications, and statements.",
    templateTypes: ["letter", "article"],
    retrievalKeywords: ["letter", "application", "formal", "cover letter"],
    rendererHint: "Keep the body tight, personal, and intentionally formal.",
  },
  slides_presentation: {
    key: "slides_presentation",
    label: "Slides / Presentation",
    description: "Beamer decks, slides, and presentation narratives.",
    templateTypes: ["presentation", "slides", "beamer"],
    retrievalKeywords: ["slides", "presentation", "beamer", "deck"],
    rendererHint: "Optimize for slide rhythm, not dense prose.",
  },
  worksheet_exam: {
    key: "worksheet_exam",
    label: "Worksheet / Exam",
    description: "Worksheets, assignments, quizzes, and exam-style documents.",
    templateTypes: ["worksheet", "homework", "exam", "exam-paper", "article"],
    retrievalKeywords: ["worksheet", "exam", "quiz", "assignment", "question paper"],
    rendererHint: "Favor numbered prompts, spacing, and consistent instructional blocks.",
  },
  sandbox: {
    key: "sandbox",
    label: "Sandbox",
    description: "Mode-agnostic fallback for mixed or unusual requests.",
    templateTypes: ["article", "report"],
    retrievalKeywords: ["document", "latex", "general"],
    rendererHint: "Stay flexible and use a conservative self-contained layout.",
  },
};

function modeFromDocumentMode(documentMode: AgentDocumentMode): AgentModeKey {
  switch (documentMode) {
    case "resume":
      return "resume_cv";
    case "research_paper":
      return "research_paper";
    case "report":
    case "article":
    case "generic":
      return "report_article";
    case "cover_letter":
    case "letter":
      return "letter_application";
    case "presentation":
      return "slides_presentation";
    case "worksheet":
    case "homework":
    case "exam":
      return "worksheet_exam";
    default:
      return "sandbox";
  }
}

function modeFromPrompt(prompt: string): AgentModeKey {
  const normalized = prompt.toLowerCase();

  if (/\b(resume|cv|curriculum vitae)\b/.test(normalized)) return "resume_cv";
  if (/\b(research paper|conference paper|journal paper|ieee|thesis)\b/.test(normalized)) {
    return "research_paper";
  }
  if (/\b(cover letter|statement of purpose|application letter)\b/.test(normalized)) {
    return "letter_application";
  }
  if (/\b(slides|presentation|beamer|deck)\b/.test(normalized)) {
    return "slides_presentation";
  }
  if (/\b(worksheet|exam|quiz|assignment|question paper)\b/.test(normalized)) {
    return "worksheet_exam";
  }
  if (/\b(report|article|essay|whitepaper)\b/.test(normalized)) {
    return "report_article";
  }

  return "sandbox";
}

export function resolveAgentMode(
  documentMode: AgentDocumentMode | string | undefined,
  prompt: string
): AgentModeKey {
  if (documentMode && documentMode in AGENT_MODE_REGISTRY) {
    return documentMode as AgentModeKey;
  }

  if (documentMode) {
    return modeFromDocumentMode(documentMode as AgentDocumentMode);
  }

  return modeFromPrompt(prompt);
}

export function getAgentModeProfile(modeKey: AgentModeKey) {
  return AGENT_MODE_REGISTRY[modeKey];
}

export function applyModeProfileToPlan(
  plan: AgentDocumentPlan,
  modeKey: AgentModeKey
) {
  const profile = getAgentModeProfile(modeKey);

  plan.preferredTemplateTypes = Array.from(
    new Set([...profile.templateTypes, ...plan.preferredTemplateTypes])
  );
  plan.positiveKeywords = Array.from(
    new Set([...profile.retrievalKeywords, ...plan.positiveKeywords])
  );
  plan.styleHints = Array.from(
    new Set([...plan.styleHints, profile.rendererHint])
  );

  return plan;
}
