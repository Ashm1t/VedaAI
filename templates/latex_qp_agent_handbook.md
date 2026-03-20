# LaTeX Question Paper Agent Handbook

> Reference for generating school-level exam papers. Target: K-12 teachers generating unit tests, term exams, and assignments.

---

## 1. Template Selection

For school-level question papers, **always use `questionpaper.tex`** unless the teacher explicitly requests a different format. It supports all question types needed in school exams.

| Template | When to use |
|----------|-------------|
| **questionpaper.tex** | **DEFAULT.** School exams, unit tests, term papers. Has MCQ, fill-in-blank, short/long answer support. |
| Others | Only for university-level or highly specialized papers. Not recommended for school use. |

---

## 2. Standard Paper Structure (School Exams)

A well-structured school exam paper follows this section order:

| Section | Type | Typical Marks | Notes |
|---------|------|---------------|-------|
| A | MCQs | 1 mark each | 2-column layout with `\mcqfourtwo{}` |
| B | Fill in the Blanks | 1 mark each | Use `\question{}` with `\underline{\hspace{3cm}}` for blanks |
| C | True or False | 1 mark each | Use `\question{}` with statement |
| D | Short Answer | 2 marks each | 2-3 sentence answers |
| E | Long Answer / Diagram | 4-5 marks each | 5-6 sentence answers, may include diagrams |

**The marks MUST always add up to the maximum marks in the header.**

Count before finalizing: `(Section A total) + (Section B total) + ... = Maximum Marks`

---

## 3. Editing the Header

```latex
\hdr{School Name}{City/Address}{Subject -- Chapter/Topic Name}{Class X -- Exam Type}{Time: NN minutes}{Maximum Marks: NN}
```

Rules:
- Arg 1: School name (use what the teacher provides, or "School" as default)
- Arg 2: City or address (can be left as just the city)
- Arg 3: Subject followed by topic, separated by ` -- `
- Arg 4: Class/grade followed by exam type (Unit Test, Term Exam, etc.)
- Arg 5: Always prefix with `Time: `
- Arg 6: Always prefix with `Maximum Marks: `

---

## 4. General Instructions

```latex
\geninstructions{
\item All questions are compulsory.
\item Read each question carefully before answering.
\item Write neat and legible answers.
\item Marks are indicated against each question.
}
```

Keep instructions simple and age-appropriate. 4-5 items maximum.

---

## 5. Adding Sections

```latex
\questionsection{A}{Multiple Choice Questions (1 mark each)}{
\item Choose the correct option for each question.
\item Each question carries 1 mark. No negative marking.}
```

- Arg 1: Section letter (A, B, C, D, E)
- Arg 2: Section title with marks info in parentheses
- Arg 3: Section-specific instructions as `\item` list

---

## 6. Adding Questions

### MCQs — 2-column layout (preferred for school papers)
```latex
\mcqfourtwo{1}{Question text ending with a colon or question mark:}
    {Option A}
    {Option B}
    {Option C}
    {Option D}
    {(1 mark)}{}{}
```
- Arg 1: Question number
- Arg 2: Question text
- Args 3-6: Four options (a, b, c, d — the template adds labels automatically)
- Arg 7: Marks in parentheses and italics
- Arg 8: Hint (leave empty `{}` for school papers)
- Arg 9: Image/equation (leave empty `{}` if none)

### Fill in the Blanks
```latex
\question{6}{The forces that act in the interior of the earth are called \underline{\hspace{3cm}} forces.}{(1 mark)}{}
```
- Use `\underline{\hspace{3cm}}` for the blank space
- Keep blanks for key terms, definitions, or factual recall

### True or False
```latex
\question{9}{Exogenic forces act in the interior of the earth.}{(1 mark)}{}
```
- State a clear assertion — avoid ambiguous statements
- Mix true and false answers roughly 50/50

### Short Answer Questions
```latex
\question{11}{Differentiate between endogenic and exogenic forces with one example each.}{(2 marks)}{}
```
- Questions should need 2-3 sentence answers
- Use verbs: define, differentiate, name, list, state, give examples

### Long Answer Questions
```latex
\question{14}{Describe the structure of a volcano with the help of a well-labelled diagram.}{(5 marks)}{Draw a neat diagram.}
```
- Questions should need 5-8 sentence answers
- Arg 4 can contain a hint like "Draw a neat diagram."
- Use verbs: describe, explain, discuss, compare and contrast

---

## 7. Answer Key

Always include an answer key on a separate page after the questions:

```latex
\newpage
\begin{center}
\textbf{\Large ANSWER KEY}\\
\vspace{3mm}
\hrulefill
\end{center}
\vspace{5mm}
```

Format answers by section:

**MCQs and objective questions** — use a tabular format:
```latex
\textbf{\underline{Section A -- MCQs}}\\[2mm]
\begin{tabular}{l l}
Q1. & (b) Correct option text \\
Q2. & (c) Correct option text \\
\end{tabular}
```

**Short/Long answers** — use key points format:
```latex
\textbf{\underline{Section D -- Short Answers (Key Points)}}\\[2mm]
\textbf{Q11.} Key point 1. Key point 2.\\[2mm]
\textbf{Q12.} Key point 1. Key point 2.\\[2mm]
```

---

## 8. Math and Special Characters

| Need | LaTeX |
|------|-------|
| Inline math | `$E = mc^2$` |
| Display equation | `\[ F = ma \]` |
| Degree symbol | `$90^\circ$` |
| Subscript/superscript | `$H_2O$`, `$x^2$` |
| Fraction | `$\frac{1}{2}$` |
| Greek letters | `$\alpha$`, `$\beta$`, `$\Omega$` |
| Blank for fill-in | `\underline{\hspace{3cm}}` |

Always wrap math symbols in `$...$`, even standalone ones like `$\Omega$`.

---

## 9. Difficulty Distribution

For school exams, follow this distribution:

| Difficulty | Percentage | Placement |
|------------|------------|-----------|
| Easy | ~40% | MCQs, fill-in-blanks, true/false |
| Moderate | ~40% | Short answer, some MCQs |
| Hard | ~20% | Long answer, application-based |

---

## 10. Golden Rules

1. **NEVER** edit `\newcommand` definitions in the preamble — only edit call sites below `\begin{document}`
2. **ALWAYS** count `{` and `}` braces — one unclosed brace breaks the whole document
3. **NEVER** add `\usepackage{}` after `\begin{document}`
4. **ALWAYS** use `$...$` for any math symbol in question text
5. **NEVER** change `\documentclass` to a class whose `.cls` file isn't present
6. **ALWAYS** number questions sequentially across all sections (1, 2, ... N)
7. **ALWAYS** verify marks add up to the header's Maximum Marks
8. **ALWAYS** include an answer key on a separate page
9. **NEVER** use images that aren't provided — the template should compile without external files
10. **KEEP** language simple and age-appropriate for the target class/grade

---

## 11. Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `! Missing $ inserted` | Math symbol outside `$...$` | Wrap in dollar signs |
| `! Undefined control sequence` | Typo or missing package | Check spelling, add `\usepackage{}` in preamble |
| `! Missing } inserted` | Unmatched brace | Count all `{` and `}` |
| `! Extra alignment tab` | Wrong `&` count in table | Match column count |
| `Overfull \hbox` | Text too wide | Not a fatal error, can ignore |
| `! File not found` | Image reference | Remove `\img{}` or `\includegraphics{}` calls — don't reference external images |

---

## 12. Pre-Compilation Checklist

Before outputting the final .tex:

- [ ] All `\newcommand` definitions are unchanged from template
- [ ] Every `{` has a matching `}`
- [ ] Question numbers are sequential (1 through N)
- [ ] Marks per section add up correctly
- [ ] Total marks = header Maximum Marks
- [ ] No `\includegraphics` or `\img` calls referencing non-existent files
- [ ] All math symbols wrapped in `$...$`
- [ ] Answer key present on new page
- [ ] No empty sections (every section has at least 1 question)
