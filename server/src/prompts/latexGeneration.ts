import type { QuestionPaperOutput, QuestionSection } from "../types/index.js";

export function buildLatexGenerationPrompt(
  templateSource: string,
  handbookContent: string,
  questionData: QuestionPaperOutput,
  templateName: string
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
1. Copy the ENTIRE preamble from the template UNCHANGED (all \\newcommand definitions)
2. Only write NEW content between \\begin{document} and \\end{document}
3. Header: \\hdr{${questionData.schoolName || "School"}}{}{${questionData.subject}}{Class ${questionData.className} -- Unit Test}{Time: ${questionData.timeAllowed}}{Maximum Marks: ${totalMarks}}
4. MCQ questions: use \\mcqfourtwo{number}{text}{optA}{optB}{optC}{optD}{(N mark)}{}{}
5. All other questions: use \\question{number}{text}{(N marks)}{}
6. Fill-in-the-blank: use \\underline{\\hspace{3cm}} for blank spaces in question text
7. Question numbers MUST be sequential across ALL sections: 1 through ${totalQuestions}
8. After all question sections, add \\newpage then a COMPLETE ANSWER KEY
9. NO \\includegraphics or \\img calls — paper must compile without external image files
10. Section marks MUST sum to exactly ${totalMarks}. Verify before outputting.
11. Output ONLY raw .tex content — absolutely no markdown fences, no \`\`\`, no explanations

## ANSWER KEY FORMAT:
After \\newpage:
\\begin{center}
\\textbf{\\Large ANSWER KEY}\\\\
\\vspace{3mm}
\\hrulefill
\\end{center}

Then for each section:
- Objective types (MCQ, fill, T/F): use \\begin{tabular}{l l} format
- Short/Long answers: use \\textbf{Q[N].} Key points format with \\\\[2mm] spacing`;
}

function formatSectionForPrompt(section: QuestionSection): string {
  const lines = [`### Section ${section.label}: ${section.title}`];
  lines.push(`Instruction: ${section.instruction}`);
  lines.push("");

  for (const q of section.questions) {
    lines.push(`Q${q.number}. [${q.difficulty}] (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.text}`);

    // Include MCQ options if present
    const opts = (q as unknown as Record<string, unknown>).options as
      | Record<string, string>
      | undefined;
    if (opts && typeof opts === "object") {
      lines.push(`  (a) ${opts.a}`);
      lines.push(`  (b) ${opts.b}`);
      lines.push(`  (c) ${opts.c}`);
      lines.push(`  (d) ${opts.d}`);
    }

    lines.push(`  Answer: ${q.answer || "N/A"}`);
    lines.push("");
  }

  return lines.join("\n");
}
