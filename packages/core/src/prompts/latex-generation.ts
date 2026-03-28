import type { QuestionPaperOutput, QuestionSection } from "../types.js";

export function buildLatexGenerationPrompt(
  templateSource: string,
  handbookContent: string,
  questionData: QuestionPaperOutput,
  templateName: string
): string {
  if (templateName === "icse_english_literature.tex") {
    return buildLiteraturePrompt(templateSource, handbookContent, questionData);
  }

  return buildDefaultPrompt(templateSource, handbookContent, questionData);
}

// ── Default prompt (questionpaper.tex — STEM / general) ──────────────

function buildDefaultPrompt(
  templateSource: string,
  handbookContent: string,
  questionData: QuestionPaperOutput
): string {
  const sectionsMarkdown = questionData.sections
    .map((s) => formatSectionForPrompt(s))
    .join("\n\n");

  const totalMarks = questionData.maximumMarks;
  const totalQuestions = questionData.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  return `You are a LaTeX expert generating a school exam paper. Produce a COMPLETE, compilable .tex file.

## TEMPLATE (keep all \\newcommand definitions EXACTLY as-is, copy lines 1-146 unchanged):
\`\`\`latex
${templateSource}
\`\`\`

## HANDBOOK RULES (MUST follow):
${handbookContent}

## PAPER DETAILS:
- School: ${questionData.schoolName || "School"}
- Subject: ${questionData.subject}
- Class: ${questionData.className}
- Exam Type: Unit Test
- Time: ${questionData.timeAllowed}
- Maximum Marks: ${totalMarks}
- Total Questions: ${totalQuestions}

## GENERAL INSTRUCTIONS:
${questionData.generalInstruction}

## SECTIONS AND QUESTIONS:
${sectionsMarkdown}

## CRITICAL OUTPUT RULES:
1. Copy the ENTIRE preamble from the template UNCHANGED (all \\newcommand, \\newlist definitions)
2. Only write NEW content between \\begin{document} and \\end{document}
3. Header: \\hdr{${questionData.schoolName || "School"}}{}{${questionData.subject}}{Class ${questionData.className} -- Unit Test}{Time: ${questionData.timeAllowed}}{Maximum Marks: ${totalMarks}}
4. MCQ questions (short options): use \\mcqfourtwo{num}{text}{optA}{optB}{optC}{optD}{[N]}{}{}
5. MCQ questions (long options): use \\mcqfour{num}{text}{optA}{optB}{optC}{optD}{[N]}{}{}
6. All other questions: use \\question{num}{text}{[N]}{}
7. Fill-in-the-blank: use \\underline{\\hspace{3cm}} for blank spaces in question text
8. Question numbers MUST be sequential across ALL sections: 1 through ${totalQuestions}
9. After all question sections, add \\newpage then a COMPLETE ANSWER KEY
10. End with $\\blacksquare$~$\\blacksquare$ centered, then \\end{document}
11. NO \\includegraphics or \\img calls — paper must compile without external image files
12. Section marks MUST sum to exactly ${totalMarks}. Verify before outputting.
13. Output ONLY raw .tex content — absolutely no markdown fences, no \`\`\`, no explanations

## ANSWER KEY FORMAT:
After \\newpage:
\\begin{center}
\\textbf{\\Large ANSWER KEY}\\\\[3pt]
\\rule{0.5\\textwidth}{0.4pt}
\\end{center}
\\vspace{6pt}

Then for each section:
- Objective types (MCQ, fill, T/F): use \\begin{tabular}{l l} format
- Short/Long answers: use \\textbf{Q[N].} Key points format with \\\\[2mm] spacing
- End the paper with \\vspace{20pt} then centered $\\blacksquare$~$\\blacksquare$ then \\end{document}`;
}

// ── Literature prompt (icse_english_literature.tex) ──────────────────

function buildLiteraturePrompt(
  templateSource: string,
  handbookContent: string,
  questionData: QuestionPaperOutput
): string {
  const sectionsMarkdown = questionData.sections
    .map((s) => formatSectionForPrompt(s))
    .join("\n\n");

  const totalMarks = questionData.maximumMarks;
  const totalQuestions = questionData.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  return `You are a LaTeX expert generating an ICSE-style English Literature board exam paper. Produce a COMPLETE, compilable .tex file.

## REFERENCE TEMPLATE (study its structure carefully — replicate the same formatting patterns):
\`\`\`latex
${templateSource}
\`\`\`

## HANDBOOK RULES (MUST follow):
${handbookContent}

## PAPER DETAILS:
- Board/School: ${questionData.schoolName || "ICSE BOARD PAPER"}
- Subject: ${questionData.subject}
- Class: ${questionData.className}
- Time Allotted: ${questionData.timeAllowed}
- Maximum Marks: ${totalMarks}

## GENERAL INSTRUCTIONS:
${questionData.generalInstruction}

## SECTIONS AND QUESTIONS:
${sectionsMarkdown}

## ICSE LITERATURE TEMPLATE STRUCTURE:
This template uses standard LaTeX (NOT custom \\hdr or \\mcqfourtwo macros). Follow these formatting patterns:

### Title block:
\\begin{center}
  {\\LARGE\\bfseries EXAM TITLE}\\\\[4pt]
  {\\Large\\bfseries SUBJECT}\\\\[4pt]
  {\\Large\\bfseries [PAPER TYPE]}\\\\[4pt]
  {\\Large\\bfseries Class-N\\textsuperscript{th}}
\\end{center}

### Maximum Marks / Time line:
Use \\rule{\\textwidth}{0.8pt} above and \\rule{\\textwidth}{0.4pt} below, with
\\begin{tabularx}{\\textwidth}{@{}X r@{}} for left/right alignment.

### Instructions:
Two numbered lists separated by a horizontal rule:
- Items 1-4: general exam conduct (writing, reading time)
- Items 5-8: paper structure (sections, compulsory questions, marks notation)

### Section A — MCQs:
- One main "Question 1" with \\qmarks{16}
- Sub-questions use \\begin{romanenum} (roman numerals: (i), (ii), ...)
- Each MCQ has options as \\begin{abcenum} (vertical list) OR 2-column \\begin{tabularx}
- Use 2-column layout when options are SHORT (single words / short phrases)
- Use vertical list when options are LONG (sentences)

### Sections B, C, D — Extract-based questions:
- Section heading centered with \\textbf and section marks [10] on the right
- Category heading: DRAMA / PROSE - SHORT STORIES / POETRY
- Source reference in parentheses
- Extract in italic using \\textit{} — verse passages in \\begin{tabular} with character names bold
- Prose extracts in \\begin{quote} ... \\end{quote}
- Sub-questions use \\begin{romanenum} with \\qmarks{N} flush-right
- Each sub-question may have multiple parts (each on its own line below the first)

### Answer Key:
After all questions, add \\newpage and an answer key section.

## CRITICAL OUTPUT RULES:
1. Use the EXACT same preamble (packages, list definitions, \\qmarks command) from the template
2. DO NOT add \\hdr{}, \\mcqfourtwo{}, \\question{}, or any custom macros — this template uses standard LaTeX
3. Use \\begin{romanenum} for roman-numeral sub-questions, \\begin{abcenum} for (a)-(d) options
4. Place marks flush-right using \\qmarks{N} (the \\hfill\\textbf{[#1]} command from preamble)
5. Verse/play extracts: character name in \\textbf{}, lines in \\textit{}
6. Prose extracts: \\begin{quote}\\textit{...}\\end{quote}
7. Total marks across all sections MUST equal ${totalMarks}
8. NO \\includegraphics — paper must compile without external files
9. Output ONLY raw .tex content — no markdown fences, no \`\`\`, no explanations
10. Every \\begin{} must have a matching \\end{}
11. Every { must have a matching }`;
}


function formatSectionForPrompt(section: QuestionSection): string {
  const lines = [`### Section ${section.label}: ${section.title}`];
  lines.push(`Instruction: ${section.instruction}`);
  lines.push("");

  for (const q of section.questions) {
    lines.push(`Q${q.number}. [${q.difficulty}] (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.text}`);

    if (q.options && typeof q.options === "object") {
      lines.push(`  (a) ${q.options.a}`);
      lines.push(`  (b) ${q.options.b}`);
      lines.push(`  (c) ${q.options.c}`);
      lines.push(`  (d) ${q.options.d}`);
    }

    lines.push(`  Answer: ${q.answer || "N/A"}`);
    lines.push("");
  }

  return lines.join("\n");
}
