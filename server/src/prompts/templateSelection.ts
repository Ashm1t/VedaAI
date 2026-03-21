import type { AssignmentFormData, QuestionSection, QuestionTypeConfig } from "../types/index.js";

/**
 * Step 1: Analyze source material.
 * Extracts structured info from OCR text for downstream question generation.
 */
export function buildAnalysisPrompt(
  extractedText: string,
  formData: AssignmentFormData
): string {
  return `You are an experienced school teacher preparing an exam. Analyze this educational material and extract structured information.

Subject: ${formData.subject || "Not specified"}
Topic: ${formData.topic || "Not specified"}
Class/Grade: ${formData.className || "Not specified"}

Source Material:
${extractedText.slice(0, 8000)}

Extract and respond with ONLY valid JSON:
{
  "subject": "Detected or confirmed subject name",
  "topic": "Main chapter/topic name",
  "keyConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "keyTerms": ["term1", "term2", "term3"],
  "difficultyGuide": "What makes easy vs moderate vs hard questions for this material — be specific to the content",
  "detectedSchoolName": ""
}

Rules:
- Extract 5-10 key concepts that can be tested
- Extract 3-6 key terms suitable for fill-in-the-blank questions
- Be specific to the actual content, not generic`;
}

/**
 * Step 2: Generate questions for ONE section type.
 * Called once per question type — focused, parallelizable.
 */
export function buildSectionPrompt(
  sectionLabel: string,
  questionType: string,
  questionTypeLabel: string,
  numberOfQuestions: number,
  marksPerQuestion: number,
  keyConcepts: string[],
  keyTerms: string[],
  difficultyGuide: string,
  subject: string,
  className: string,
  additionalInstructions: string,
  startingQuestionNumber: number
): string {
  const difficultyDistribution = getDifficultyDistribution(numberOfQuestions);

  return `You are an experienced ${subject} teacher for Class ${className}. Generate exactly ${numberOfQuestions} ${questionTypeLabel}.

Section: ${sectionLabel}
Marks per question: ${marksPerQuestion}
Key concepts to cover: ${keyConcepts.join(", ")}
${keyTerms.length > 0 ? `Key terms: ${keyTerms.join(", ")}` : ""}
Difficulty guide: ${difficultyGuide}
${additionalInstructions ? `Teacher's instructions: ${additionalInstructions}` : ""}

Difficulty distribution for this section:
${difficultyDistribution}

Starting question number: ${startingQuestionNumber}

${getQuestionTypeGuidance(questionType, marksPerQuestion)}

Respond with ONLY valid JSON (no markdown fences):
{
  "label": "${sectionLabel}",
  "title": "${questionTypeLabel} (${marksPerQuestion} mark${marksPerQuestion > 1 ? "s" : ""} each)",
  "instruction": "${getSectionInstruction(questionType, marksPerQuestion)}",
  "questions": [
    {
      "number": ${startingQuestionNumber},
      "text": "Question text here",
      "difficulty": "easy",
      "marks": ${marksPerQuestion},
      "answer": "Correct answer here"
    }
  ]
}

Rules:
- Generate EXACTLY ${numberOfQuestions} questions, numbered ${startingQuestionNumber} to ${startingQuestionNumber + numberOfQuestions - 1}
- Every question MUST have an "answer" field
- Questions must be directly based on the provided concepts — do not add external topics
- Language must be clear and age-appropriate for Class ${className}
- Each question must test a different concept where possible`;
}

function getDifficultyDistribution(count: number): string {
  const easy = Math.round(count * 0.4);
  const hard = Math.max(1, Math.round(count * 0.2));
  const moderate = count - easy - hard;
  return `- Easy: ${easy} questions (recall, definitions, direct facts)
- Moderate: ${moderate} questions (understanding, application, comparison)
- Hard: ${hard} question${hard > 1 ? "s" : ""} (analysis, reasoning, multi-step)`;
}

function getSectionInstruction(questionType: string, marks: number): string {
  switch (questionType) {
    case "mcq":
      return `Choose the correct option for each question. Each question carries ${marks} mark${marks > 1 ? "s" : ""}. No negative marking.`;
    case "fill":
      return `Fill in the blanks with the correct word or phrase.`;
    case "true_false":
      return `Write True or False against each statement.`;
    case "short":
      return `Answer each question in 2-3 sentences.`;
    case "long":
      return `Answer in 5-6 sentences with appropriate detail.`;
    default:
      return `Attempt all questions. Each carries ${marks} mark${marks > 1 ? "s" : ""}.`;
  }
}

function getQuestionTypeGuidance(type: string, marks: number): string {
  switch (type) {
    case "mcq":
      return `MCQ format rules:
- Question text should end with a colon or question mark
- Provide exactly 4 options labeled (a), (b), (c), (d) in the "text" field is NOT needed — just the question stem
- Instead, add "options" field as an object: {"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"}
- The "answer" field should state the correct letter and the option text, e.g. "(b) Lithospheric plates"
- Make distractors plausible but clearly wrong if you know the material
- Avoid "All of the above" and "None of the above" — they are lazy options

Additional JSON field for MCQs:
Add "options": {"a": "...", "b": "...", "c": "...", "d": "..."} to each question object.`;

    case "fill":
      return `Fill in the blanks rules:
- The "text" field should contain the sentence with "______" (6 underscores) where the blank goes
- Test key terms, definitions, and factual recall
- Each blank should have exactly ONE correct answer
- The "answer" field should contain just the word/phrase that fills the blank`;

    case "true_false":
      return `True/False rules:
- State a clear, unambiguous assertion
- Mix roughly 50% true and 50% false
- The "answer" field should be "True" or "False" followed by a brief reason
- Avoid double negatives or tricky wording — these are school students`;

    case "short":
      return `Short answer rules:
- Questions should require 2-3 sentence answers (appropriate for ${marks} marks)
- Use verbs: define, differentiate, name, list, state, give examples, what is, why
- The "answer" field should contain the expected answer in 2-3 sentences`;

    case "long":
      return `Long answer rules:
- Questions should require 5-8 sentence detailed answers (appropriate for ${marks} marks)
- Use verbs: describe, explain in detail, discuss, compare and contrast, draw and label
- Can ask for diagrams: "with the help of a well-labelled diagram"
- The "answer" field should contain key points the student must cover`;

    default:
      return "";
  }
}

/**
 * Step 3: Select best template based on subject and paper structure.
 *
 * Template catalogue:
 *   questionpaper.tex               — Default. STEM, sciences, general school exams.
 *   icse_english_literature.tex     — ICSE-style English Literature papers with
 *                                     extract-based drama / prose / poetry sections.
 */
const LITERATURE_KEYWORDS = [
  "english literature",
  "literature",
  "english paper 2",
  "english paper-2",
  "english paper ii",
  "drama",
  "poetry",
  "prose",
  "shakespeare",
  "julius caesar",
  "treasure trove",
  "icse english",
];

export function selectTemplate(
  formData: AssignmentFormData
): string {
  const subject = (formData.subject || "").toLowerCase().trim();
  const topic = (formData.topic || "").toLowerCase().trim();
  const extra = (formData.additionalInstructions || "").toLowerCase();

  const combined = `${subject} ${topic} ${extra}`;

  // Check if the paper looks like an ICSE-style English Literature exam
  const isLiterature = LITERATURE_KEYWORDS.some((kw) => combined.includes(kw));

  if (isLiterature) {
    return "icse_english_literature.tex";
  }

  return "questionpaper.tex";
}

/**
 * @deprecated Use selectTemplate() instead. Kept for backward compatibility.
 */
export function buildTemplatePickerPrompt(
  sections: QuestionSection[],
  formData: AssignmentFormData
): string {
  return selectTemplate(formData);
}

/**
 * Compute cumulative starting question number for each section.
 */
export function computeStartingNumbers(
  questionTypes: QuestionTypeConfig[]
): number[] {
  const starts: number[] = [];
  let current = 1;
  for (const qt of questionTypes) {
    starts.push(current);
    current += qt.numberOfQuestions;
  }
  return starts;
}
