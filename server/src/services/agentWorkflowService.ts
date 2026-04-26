import type {
  AgentDocumentAction,
  AgentDocumentPlan,
  AgentSectionPlan,
} from "./agentPlanningService.js";
import type {
  RetrievedTemplateContext,
  RetrievedTemplateOption,
} from "./templateRetrievalService.js";
import { resolveAgentMode, type AgentModeKey } from "./agentModeRegistry.js";

export type AgentWorkflowStage =
  | "idle"
  | "template_selection"
  | "clarification"
  | "drafting"
  | "ready";

export type AgentQuestionType = "short_text" | "long_text" | "single_select";

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

export interface AgentWorkflowState {
  stage: AgentWorkflowStage;
  action: AgentDocumentAction;
  documentMode: AgentModeKey;
  promptSummary: string;
  templateOptions: RetrievedTemplateOption[];
  selectedTemplateId: string;
  questions: AgentClarificationQuestion[];
  answers: Record<string, string>;
  missingInformation: string[];
  lastUserPrompt: string;
  plan: AgentDocumentPlan | null;
}

export interface AgentTurnInput {
  content?: string;
  selectedTemplateId?: string;
  answers?: Record<string, string>;
}

function normalizeAnswerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  return typeof value === "string" ? value.trim() : "";
}

function getFieldValue(
  fieldValues: Record<string, string | string[]>,
  keys: string[]
) {
  for (const key of keys) {
    const value = normalizeAnswerValue(fieldValues[key]);
    if (value) {
      return value;
    }
  }

  return "";
}

function question(
  id: string,
  label: string,
  prompt: string,
  type: AgentQuestionType,
  required: boolean,
  placeholder?: string,
  options?: string[],
  defaultValue?: string
): AgentClarificationQuestion {
  return {
    id,
    label,
    prompt,
    type,
    required,
    placeholder,
    options,
    defaultValue,
  };
}

function buildResumeQuestions(plan: AgentDocumentPlan) {
  return [
    question(
      "full_name",
      "Full name",
      "Who should this resume belong to?",
      "short_text",
      true,
      "Aarav Sharma",
      undefined,
      getFieldValue(plan.fieldValues, ["full_name", "name"])
    ),
    question(
      "headline",
      "Target role",
      "What role or headline should appear near the top?",
      "short_text",
      true,
      "AI Engineer | Applied ML Researcher",
      undefined,
      getFieldValue(plan.fieldValues, ["headline", "target_role", "role"])
    ),
    question(
      "experience_highlights",
      "Experience highlights",
      "List the most important work experience, impact, and achievements to include.",
      "long_text",
      true,
      "2 years at Google building GenAI products, shipped retrieval features, improved latency by 35%",
      undefined,
      getFieldValue(plan.fieldValues, [
        "experience_highlights",
        "experience",
        "work_experience",
      ])
    ),
    question(
      "education",
      "Education",
      "What education details should be shown?",
      "short_text",
      true,
      "B.Tech in Computer Science, Harvard University, 2024",
      undefined,
      getFieldValue(plan.fieldValues, ["education", "degree"])
    ),
    question(
      "skills",
      "Skills",
      "Which skills, tools, and domains matter most?",
      "long_text",
      true,
      "Python, PyTorch, TensorFlow, LLM evaluation, retrieval systems, MLOps",
      undefined,
      getFieldValue(plan.fieldValues, ["skills", "technical_skills"])
    ),
    question(
      "links",
      "Links",
      "Any links or contact details to place in the header?",
      "short_text",
      false,
      "email, phone, linkedin, github, portfolio",
      undefined,
      getFieldValue(plan.fieldValues, ["links", "contact", "contact_info"])
    ),
    question(
      "tone_preference",
      "Visual tone",
      "Which visual tone should the resume lean toward?",
      "single_select",
      false,
      undefined,
      ["minimal", "professional", "modern"],
      getFieldValue(plan.fieldValues, ["tone_preference", "style"])
    ),
  ];
}

function buildResearchPaperQuestions(plan: AgentDocumentPlan) {
  return [
    question(
      "paper_title",
      "Paper title",
      "What is the working title of the paper?",
      "short_text",
      true,
      "Retrieval-Augmented Editing for LaTeX Documents",
      undefined,
      getFieldValue(plan.fieldValues, ["paper_title", "title"])
    ),
    question(
      "authors",
      "Authors",
      "Who are the authors?",
      "short_text",
      true,
      "Ashmit Pandey, ...",
      undefined,
      getFieldValue(plan.fieldValues, ["authors", "author_names"])
    ),
    question(
      "affiliations",
      "Affiliations",
      "What affiliations should appear under the author block?",
      "short_text",
      true,
      "Delhi Public School, Research Lab Name, City, Country",
      undefined,
      getFieldValue(plan.fieldValues, ["affiliations", "institutions"])
    ),
    question(
      "abstract_focus",
      "Abstract focus",
      "What central idea, method, or claim should the abstract emphasize?",
      "long_text",
      true,
      "Focus on a modular RAG agent for structured LaTeX document creation and repair",
      undefined,
      getFieldValue(plan.fieldValues, ["abstract_focus", "abstract"])
    ),
    question(
      "section_requirements",
      "Key sections",
      "Which sections or arguments must the body cover?",
      "long_text",
      true,
      "problem statement, architecture, retrieval pipeline, experiments, limitations, future work",
      undefined,
      getFieldValue(plan.fieldValues, [
        "section_requirements",
        "body_outline",
        "sections",
      ])
    ),
    question(
      "target_length",
      "Length target",
      "How long should the paper feel?",
      "single_select",
      false,
      undefined,
      ["2-3 pages", "4-5 pages", "6+ pages"],
      getFieldValue(plan.fieldValues, ["target_length", "page_target"])
    ),
    question(
      "citation_expectations",
      "Citation expectations",
      "Any expectations around references or citation placeholders?",
      "short_text",
      false,
      "Use placeholder references if needed, no external .bib",
      undefined,
      getFieldValue(plan.fieldValues, ["citation_expectations", "references"])
    ),
  ];
}

function buildPresentationQuestions(plan: AgentDocumentPlan) {
  return [
    question(
      "presentation_title",
      "Deck title",
      "What should the presentation be called?",
      "short_text",
      true,
      "RAG-Based LaTeX Editing Agent",
      undefined,
      getFieldValue(plan.fieldValues, ["presentation_title", "title"])
    ),
    question(
      "audience",
      "Audience",
      "Who is the presentation for?",
      "short_text",
      true,
      "Engineering team, investors, classroom, conference audience",
      undefined,
      getFieldValue(plan.fieldValues, ["audience"])
    ),
    question(
      "slide_outline",
      "Slide outline",
      "What topics or slides must be included?",
      "long_text",
      true,
      "problem, system overview, retrieval flow, demo, roadmap",
      undefined,
      getFieldValue(plan.fieldValues, ["slide_outline", "sections"])
    ),
    question(
      "speaker_notes",
      "Speaker notes",
      "Should the slides be terse or include denser explanatory content?",
      "single_select",
      false,
      undefined,
      ["terse slides", "balanced", "detail-heavy slides"],
      getFieldValue(plan.fieldValues, ["speaker_notes", "detail_level"])
    ),
  ];
}

function buildGenericQuestions(plan: AgentDocumentPlan) {
  return [
    question(
      "document_title",
      "Document title",
      "What title should appear on the document?",
      "short_text",
      true,
      "Document Title",
      undefined,
      getFieldValue(plan.fieldValues, ["document_title", "title"])
    ),
    question(
      "target_audience",
      "Audience",
      "Who is this document for?",
      "short_text",
      true,
      "Teacher, recruiter, technical reviewer, client, general audience",
      undefined,
      getFieldValue(plan.fieldValues, ["target_audience", "audience"])
    ),
    question(
      "must_include",
      "Must-include points",
      "What facts, sections, or outcomes absolutely need to be covered?",
      "long_text",
      true,
      "List the specific points the document must cover",
      undefined,
      getFieldValue(plan.fieldValues, ["must_include", "requirements"])
    ),
    question(
      "style_preference",
      "Style preference",
      "What tone should the writing follow?",
      "single_select",
      false,
      undefined,
      ["formal", "academic", "professional", "concise"],
      getFieldValue(plan.fieldValues, ["style_preference", "tone"])
    ),
  ];
}

export function buildClarificationQuestions(plan: AgentDocumentPlan) {
  switch (resolveAgentMode(plan.documentMode, plan.summary)) {
    case "resume_cv":
      return buildResumeQuestions(plan);
    case "research_paper":
      return buildResearchPaperQuestions(plan);
    case "slides_presentation":
      return buildPresentationQuestions(plan);
    default:
      return buildGenericQuestions(plan);
  }
}

function buildDefaultAnswers(questions: AgentClarificationQuestion[]) {
  const answers: Record<string, string> = {};

  for (const item of questions) {
    if (item.defaultValue?.trim()) {
      answers[item.id] = item.defaultValue.trim();
    }
  }

  return answers;
}

function buildMissingInformation(
  questions: AgentClarificationQuestion[],
  answers: Record<string, string>,
  templateRequired: boolean,
  selectedTemplateId: string
) {
  const missing = questions
    .filter((item) => item.required && !answers[item.id]?.trim())
    .map((item) => item.label);

  if (templateRequired && !selectedTemplateId) {
    missing.unshift("Template selection");
  }

  return missing;
}

export function createWorkflowFromPlan(
  plan: AgentDocumentPlan,
  retrieval: RetrievedTemplateContext | null,
  prompt: string
): AgentWorkflowState {
  const questions = buildClarificationQuestions(plan);
  const answers = buildDefaultAnswers(questions);
  const templateOptions = retrieval?.options || [];
  const selectedTemplateId = "";
  const missingInformation = buildMissingInformation(
    questions,
    answers,
    templateOptions.length > 0,
    selectedTemplateId
  );

  return {
    stage: templateOptions.length > 0 ? "template_selection" : "clarification",
    action: plan.action,
    documentMode: resolveAgentMode(plan.documentMode, prompt),
    promptSummary: plan.summary || prompt,
    templateOptions,
    selectedTemplateId,
    questions,
    answers,
    missingInformation,
    lastUserPrompt: prompt,
    plan,
  };
}

export function updateWorkflowWithResponses(
  workflow: AgentWorkflowState,
  input: AgentTurnInput
): AgentWorkflowState {
  const answers: Record<string, string> = {
    ...workflow.answers,
  };

  for (const [key, value] of Object.entries(input.answers || {})) {
    const normalized = value.trim();
    if (normalized) {
      answers[key] = normalized;
    } else {
      delete answers[key];
    }
  }

  if (input.content?.trim()) {
    answers.additional_notes = input.content.trim();
  }

  const selectedTemplateId =
    input.selectedTemplateId?.trim() || workflow.selectedTemplateId || "";

  const missingInformation = buildMissingInformation(
    workflow.questions,
    answers,
    workflow.templateOptions.length > 0,
    selectedTemplateId
  );

  const stage: AgentWorkflowStage =
    missingInformation.length > 0
      ? selectedTemplateId || workflow.templateOptions.length === 0
        ? "clarification"
        : "template_selection"
      : "drafting";

  return {
    ...workflow,
    answers,
    selectedTemplateId,
    missingInformation,
    stage,
  };
}

function findSection(plan: AgentDocumentPlan, matcher: RegExp) {
  return plan.sections.find((section) => matcher.test(section.title.toLowerCase()));
}

function appendSectionDetail(section: AgentSectionPlan | undefined, detail: string) {
  const normalized = detail.trim();
  if (!section || !normalized) return;

  if (!section.details.includes(normalized)) {
    section.details.push(normalized);
  }
}

function mergeResumeAnswers(plan: AgentDocumentPlan, answers: Record<string, string>) {
  const summarySection = findSection(plan, /summary|profile|objective/);
  const experienceSection = findSection(plan, /experience|employment|work/);
  const educationSection = findSection(plan, /education/);
  const skillsSection = findSection(plan, /skills|technical/);
  const projectsSection = findSection(plan, /projects/);

  if (answers.full_name && /generated document/i.test(plan.title)) {
    plan.title = `${answers.full_name} Resume`;
  }

  if (answers.headline) {
    plan.fieldValues.headline = answers.headline;
    appendSectionDetail(summarySection, `Professional headline: ${answers.headline}`);
  }

  if (answers.experience_highlights) {
    plan.fieldValues.experience_highlights = answers.experience_highlights;
    appendSectionDetail(experienceSection, answers.experience_highlights);
    appendSectionDetail(summarySection, answers.experience_highlights);
    appendSectionDetail(projectsSection, answers.experience_highlights);
  }

  if (answers.education) {
    plan.fieldValues.education = answers.education;
    appendSectionDetail(educationSection, answers.education);
  }

  if (answers.skills) {
    plan.fieldValues.skills = answers.skills;
    appendSectionDetail(skillsSection, answers.skills);
  }

  if (answers.links) {
    plan.fieldValues.links = answers.links;
  }

  if (answers.tone_preference) {
    plan.styleHints = Array.from(
      new Set([...plan.styleHints, answers.tone_preference])
    );
  }
}

function mergeResearchPaperAnswers(
  plan: AgentDocumentPlan,
  answers: Record<string, string>
) {
  const abstractSection = findSection(plan, /abstract/);
  const introSection = findSection(plan, /intro/);
  const methodSection = findSection(plan, /method|approach|system/);
  const resultsSection = findSection(plan, /results|discussion|analysis/);
  const conclusionSection = findSection(plan, /conclusion/);

  if (answers.paper_title) {
    plan.title = answers.paper_title;
    plan.fieldValues.paper_title = answers.paper_title;
  }

  if (answers.authors) {
    plan.fieldValues.authors = answers.authors;
  }

  if (answers.affiliations) {
    plan.fieldValues.affiliations = answers.affiliations;
  }

  if (answers.abstract_focus) {
    plan.fieldValues.abstract_focus = answers.abstract_focus;
    appendSectionDetail(abstractSection, answers.abstract_focus);
    appendSectionDetail(introSection, answers.abstract_focus);
  }

  if (answers.section_requirements) {
    plan.fieldValues.section_requirements = answers.section_requirements;
    appendSectionDetail(methodSection, answers.section_requirements);
    appendSectionDetail(resultsSection, answers.section_requirements);
    appendSectionDetail(conclusionSection, answers.section_requirements);
  }

  if (answers.target_length) {
    plan.contentInstructions.push(
      `Target overall paper length: ${answers.target_length}.`
    );
  }

  if (answers.citation_expectations) {
    plan.contentInstructions.push(
      `Citation expectations: ${answers.citation_expectations}.`
    );
  }
}

function mergeGenericAnswers(plan: AgentDocumentPlan, answers: Record<string, string>) {
  if (answers.document_title) {
    plan.title = answers.document_title;
    plan.fieldValues.document_title = answers.document_title;
  }

  if (answers.target_audience) {
    plan.fieldValues.target_audience = answers.target_audience;
    plan.contentInstructions.push(`Audience: ${answers.target_audience}.`);
  }

  if (answers.must_include) {
    plan.fieldValues.must_include = answers.must_include;
    for (const section of plan.sections) {
      appendSectionDetail(section, answers.must_include);
    }
  }

  if (answers.style_preference) {
    plan.styleHints = Array.from(
      new Set([...plan.styleHints, answers.style_preference])
    );
  }
}

function mergePresentationAnswers(
  plan: AgentDocumentPlan,
  answers: Record<string, string>
) {
  if (answers.presentation_title) {
    plan.title = answers.presentation_title;
    plan.fieldValues.presentation_title = answers.presentation_title;
  }

  if (answers.audience) {
    plan.fieldValues.audience = answers.audience;
    plan.contentInstructions.push(`Presentation audience: ${answers.audience}.`);
  }

  if (answers.slide_outline) {
    plan.fieldValues.slide_outline = answers.slide_outline;
    for (const section of plan.sections) {
      appendSectionDetail(section, answers.slide_outline);
    }
  }

  if (answers.speaker_notes) {
    plan.styleHints = Array.from(
      new Set([...plan.styleHints, answers.speaker_notes])
    );
  }
}

export function workflowHasEnoughInput(workflow: AgentWorkflowState) {
  return workflow.missingInformation.length === 0;
}

export function getSelectedTemplateLabel(workflow: AgentWorkflowState) {
  const selected = workflow.templateOptions.find(
    (option) => option.id === workflow.selectedTemplateId
  );

  return selected?.name || workflow.selectedTemplateId || "";
}

export function buildGuidanceMessage(workflow: AgentWorkflowState) {
  const typeLabel = workflow.documentMode.replace(/_/g, " ");
  const templateLead =
    workflow.templateOptions.length > 0
      ? `I shortlisted ${workflow.templateOptions.length} compile-safe template options for this ${typeLabel}. Pick one below, then answer the follow-up fields so I can draft into the chosen skeleton instead of freestyling the layout.`
      : `I mapped this request to a ${typeLabel} workflow. Answer the follow-up fields below so I can draft with stronger structure and cleaner formatting.`;

  const requiredLabels = workflow.questions
    .filter((item) => item.required)
    .slice(0, 5)
    .map((item) => item.label)
    .join(", ");

  return `${templateLead}

Required details I still need: ${requiredLabels || "a few clarifying details"}.

Once you pick a template and fill those in, I’ll generate the LaTeX, compile it, and show the PDF here.`;
}

export function buildPendingInputMessage(workflow: AgentWorkflowState) {
  const missing = workflow.missingInformation.join(", ");
  const templateLabel = getSelectedTemplateLabel(workflow);

  if (missing) {
    return templateLabel
      ? `I’ve locked in the \`${templateLabel}\` template. I still need: ${missing}. Fill the remaining fields and I’ll draft the document.`
      : `I have your request, but I still need: ${missing}. Choose a template and fill the remaining details so I can draft cleanly.`;
  }

  return `I have enough detail now${templateLabel ? ` with the \`${templateLabel}\` template` : ""}. Drafting the document next.`;
}

export function buildUserInputSummary(
  workflow: AgentWorkflowState | null | undefined,
  input: AgentTurnInput
) {
  const lines: string[] = [];

  if (input.content?.trim()) {
    lines.push(input.content.trim());
  }

  if (workflow && input.selectedTemplateId?.trim()) {
    const selected = workflow.templateOptions.find(
      (option) => option.id === input.selectedTemplateId?.trim()
    );

    lines.push(
      `Selected template: ${selected?.name || input.selectedTemplateId.trim()}`
    );
  }

  const answerEntries = Object.entries(input.answers || {}).filter(
    ([, value]) => value.trim().length > 0
  );
  if (workflow && answerEntries.length > 0) {
    lines.push("Provided details:");

    for (const [key, value] of answerEntries) {
      const label =
        workflow.questions.find((item) => item.id === key)?.label || key;
      lines.push(`- ${label}: ${value.trim()}`);
    }
  }

  return lines.join("\n");
}

export function mergeWorkflowIntoPlan(
  workflow: AgentWorkflowState,
  latestPrompt?: string
) {
  const plan = JSON.parse(
    JSON.stringify(workflow.plan || {})
  ) as AgentDocumentPlan;

  plan.fieldValues = {
    ...plan.fieldValues,
    ...workflow.answers,
  };

  switch (workflow.documentMode) {
    case "resume_cv":
      mergeResumeAnswers(plan, workflow.answers);
      break;
    case "research_paper":
      mergeResearchPaperAnswers(plan, workflow.answers);
      break;
    case "slides_presentation":
      mergePresentationAnswers(plan, workflow.answers);
      break;
    default:
      mergeGenericAnswers(plan, workflow.answers);
      break;
  }

  if (latestPrompt?.trim()) {
    plan.contentInstructions.push(
      `Respect the latest user note: ${latestPrompt.trim()}.`
    );
  }

  const selectedTemplateLabel = getSelectedTemplateLabel(workflow);
  if (selectedTemplateLabel) {
    plan.contentInstructions.push(
      `Use the selected template skeleton: ${selectedTemplateLabel}.`
    );
  }

  plan.missingInformation = [];
  plan.summary = workflow.promptSummary;

  return plan;
}
