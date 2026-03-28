# LaTeX Question Paper Agent Handbook

> Reference for generating school-level exam papers. Both templates share a unified design language — Times font, 2 cm margins, horizontal rules, flush-right marks in brackets, clean centered section headers, and an end-of-paper marker.

---

## 1. Template Catalogue

| Template | When to use | Macro style |
|----------|-------------|-------------|
| **questionpaper.tex** | **DEFAULT.** STEM, sciences, humanities, general school exams. MCQ, fill-in-blank, T/F, short/long answer. | Custom macros: `\hdr`, `\mcqfourtwo`, `\question`, `\questionsection` |
| **icse_english_literature.tex** | ICSE-style English Literature papers with extract-based drama / prose / poetry sections. | Standard LaTeX: `romanenum`, `abcenum`, `\qmarks{}`, `tabularx` |

**Selection rule:** The pipeline selects the template automatically based on subject keywords. You do NOT choose — just follow whichever template's preamble you receive.

---

## 2. Shared Design Language

Both templates use these formatting fundamentals. **Never deviate from them:**

| Element | Specification |
|---------|---------------|
| Font | Times (via `\usepackage{times}`) |
| Margins | `top=1.8cm, bottom=2cm, left=2cm, right=2cm` |
| Paragraph indent | `0pt` — never indent |
| Paragraph skip | `4pt` |
| Page style | `\pagestyle{empty}` — no headers/footers |
| Marks display | Flush-right, bold, in brackets: `\textbf{[N]}` or `\qmarks{N}` |
| Horizontal rules | Thick `0.8pt` above marks/time line, thin `0.4pt` below and as separators |
| Section headers | Centered, `\large\bfseries`, instruction in italic below |
| Lists | `romanenum` (roman numerals) and `abcenum` (a-b-c-d) with precise spacing |
| Math | Always in `$...$` for inline, `\[ ... \]` for display |
| End marker | `$\blacksquare$~$\blacksquare$` centered at bottom of last page |
| Encoding | UTF-8 via `inputenc` |

---

## 3. Template: questionpaper.tex — Structure Guide

### 3.1 Header

```latex
\hdr{School Name}{City/Address}{Subject -- Topic}{Class X -- Exam Type}{Time: NN minutes}{Maximum Marks: NN}
```

- Arg 1: School name — use what teacher provides, or "School"
- Arg 2: City or address (can be blank)
- Arg 3: Subject and topic separated by ` -- `
- Arg 4: Class/grade and exam type (Unit Test, Term Exam, etc.)
- Arg 5: Always prefix with `Time: `
- Arg 6: Always prefix with `Maximum Marks: `

The macro renders: centered title block → thick rule → time/marks in `tabularx` → thin rule.

### 3.2 General Instructions

```latex
\geninstructions{
\item All questions are compulsory.
\item Read each question carefully before answering.
\item Write neat and legible answers.
\item Marks are indicated against each question in brackets~[~].
}
```

4–5 items. Simple, age-appropriate language. The macro renders a numbered list followed by a thin horizontal rule.

### 3.3 Section Headers

```latex
\questionsection{A}{Multiple Choice Questions (1 mark each)}{
\item Choose the correct option for each question.
\item Each question carries 1 mark. No negative marking.}
```

- Arg 1: Section letter (A, B, C, D, E)
- Arg 2: Section title with marks info
- Arg 3: Section-specific instructions as `\item` list

### 3.4 MCQs — 2-column layout (preferred for short options)

```latex
\mcqfourtwo{1}{Question text ending with colon or question mark:}
    {Option A}
    {Option B}
    {Option C}
    {Option D}
    {[1]}{}{}
```

- Args 1–6: number, question, four options
- Arg 7: Marks in brackets: `[1]` or `[2]`
- Arg 8: Hint (leave `{}` if none)
- Arg 9: Extra content (leave `{}` — no images)

Options render in a 2-column `tabularx` with `(a)`, `(b)`, `(c)`, `(d)` labels.

### 3.5 MCQs — 1-column layout (for long options)

```latex
\mcqfour{2}{Question text:}
    {Long option A text here}
    {Long option B text here}
    {Long option C text here}
    {Long option D text here}
    {[1]}{}{}
```

Same args as `\mcqfourtwo`. Options render in an `abcenum` vertical list.

### 3.6 Fill in the Blanks

```latex
\question{6}{The SI unit of force is \underline{\hspace{3cm}}.}{[1]}{}
```

- Use `\underline{\hspace{3cm}}` for the blank space
- One blank per question, testing key terms or definitions

### 3.7 True or False

```latex
\question{9}{Friction always opposes motion.}{[1]}{}
```

- State a clear, unambiguous assertion
- Mix roughly 50% true and 50% false

### 3.8 Short Answer Questions

```latex
\question{11}{Differentiate between contact and non-contact forces with one example each.}{[2]}{}
```

- Should need 2–3 sentence answers
- Verbs: define, differentiate, name, list, state, give examples

### 3.9 Long Answer Questions

```latex
\question{14}{Describe the structure of a volcano with the help of a well-labelled diagram.}{[5]}{Draw a neat diagram.}
```

- Should need 5–8 sentence answers
- Arg 4 can contain a hint
- Verbs: describe, explain, discuss, compare and contrast

---

## 4. Template: icse_english_literature.tex — Structure Guide

This template uses **standard LaTeX** (no `\hdr`, `\mcqfourtwo`, `\question` macros).

### 4.1 Title Block

```latex
\begin{center}
    {\LARGE\bfseries EXAM TITLE}\\[4pt]
    {\Large\bfseries SUBJECT}\\[4pt]
    {\Large\bfseries [PAPER TYPE]}\\[4pt]
    {\Large\bfseries Class-N\textsuperscript{th}}
\end{center}
```

### 4.2 Marks / Time Line

```latex
\noindent\rule{\textwidth}{0.8pt}
\vspace{-6pt}
\noindent\begin{tabularx}{\textwidth}{@{}X r@{}}
\textbf{\textit{Maximum Marks: 80}} & \textbf{\textit{Time Allotted: Two Hours}}
\end{tabularx}
\vspace{-2pt}
\noindent\rule{\textwidth}{0.4pt}
```

### 4.3 Instructions

Two numbered lists separated by a thin rule:
- Items 1–4: general exam conduct (writing time, reading time)
- Items 5–8: paper structure (sections, compulsory questions, marks notation)

### 4.4 Section A — MCQs

- One main "Question 1" with `\qmarks{16}`
- Sub-questions in `\begin{romanenum}` (roman numerals)
- Options as `\begin{abcenum}` (vertical) OR 2-column `\begin{tabularx}`:
  - **Short options** → 2-column tabularx
  - **Long options** → vertical abcenum
- Fill-in-blank MCQs use `\rule{2cm}{0.4pt}` for blanks

### 4.5 Sections B, C, D — Extract-based

```latex
\begin{center}
    {\large\bfseries SECTION B}\hfill\textbf{[10]}\\[2pt]
    \textit{(Answer \textbf{one or more} questions from this \textbf{Section}.)}
\end{center}
```

- Category heading: DRAMA / PROSE - SHORT STORIES / POETRY
- Source in parentheses below category
- **Verse/play extracts:** `\begin{tabular}` with character name in `\textbf{}`, lines in `\textit{}`
- **Prose extracts:** `\begin{quote}\textit{...}\end{quote}`
- Sub-questions in `\begin{romanenum}` with `\qmarks{N}` flush-right
- Multi-part sub-questions: additional lines below the first (no separate `\item`)

---

## 5. Answer Key

Always on a separate page after all questions:

```latex
\newpage
\begin{center}
\textbf{\Large ANSWER KEY}\\[3pt]
\rule{0.5\textwidth}{0.4pt}
\end{center}
\vspace{6pt}
```

### Objective questions (MCQ, fill, T/F) — tabular format:

```latex
\textbf{\underline{Section A -- MCQs}}\\[3mm]
\begin{tabular}{l l}
Q1. & (b) Correct option text \\
Q2. & (c) Correct option text \\
\end{tabular}
```

### Short/Long answers — key points format:

```latex
\textbf{\underline{Section D -- Short Answers (Key Points)}}\\[3mm]
\textbf{Q11.} Key point 1. Key point 2.\\[2mm]
\textbf{Q12.} Key point 1. Key point 2.\\[2mm]
```

---

## 6. Math and Special Characters

| Need | LaTeX |
|------|-------|
| Inline math | `$E = mc^2$` |
| Display equation | `\[ F = ma \]` or `\equ{F = ma}` (questionpaper.tex only) |
| Degree symbol | `$90^\circ$` |
| Subscript/superscript | `$H_2O$`, `$x^2$` |
| Fraction | `$\frac{1}{2}$` |
| Greek letters | `$\alpha$`, `$\beta$`, `$\Omega$` |
| Blank for fill-in | `\underline{\hspace{3cm}}` |
| Rule-style blank | `\rule{2cm}{0.4pt}` (literature template) |

Always wrap math symbols in `$...$`, even standalone ones like `$\Omega$`.

---

## 7. Difficulty Distribution

| Difficulty | Percentage | Placement |
|------------|------------|-----------|
| Easy | ~40% | MCQs, fill-in-blanks, true/false |
| Moderate | ~40% | Short answer, some MCQs |
| Hard | ~20% | Long answer, application-based |

---

## 8. Golden Rules

1. **NEVER** edit `\newcommand` or `\newlist` definitions in the preamble
2. **ALWAYS** count `{` and `}` braces — one unclosed brace breaks the whole document
3. **NEVER** add `\usepackage{}` after `\begin{document}`
4. **ALWAYS** use `$...$` for any math symbol in question text
5. **NEVER** change `\documentclass` or remove packages
6. **ALWAYS** number questions sequentially across all sections (1, 2, … N)
7. **ALWAYS** verify marks add up to the header's Maximum Marks
8. **ALWAYS** include an answer key on a separate page
9. **NEVER** use `\includegraphics` or `\img` — paper must compile without external files
10. **KEEP** language simple and age-appropriate for the target class/grade
11. **ALWAYS** end with `$\blacksquare$~$\blacksquare$` centered, then `\end{document}`
12. **USE** `\noindent` before `\rule` to avoid indentation artefacts

---

## 9. Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `! Missing $ inserted` | Math symbol outside `$...$` | Wrap in dollar signs |
| `! Undefined control sequence` | Typo or missing package | Check spelling; never add packages after `\begin{document}` |
| `! Missing } inserted` | Unmatched brace | Count all `{` and `}` |
| `! Extra alignment tab` | Wrong `&` count in table | Match column count in tabularx |
| `Overfull \hbox` | Text too wide | Not fatal, can ignore |
| `! File not found` | Image reference | Remove `\includegraphics` / `\img` calls |
| `! Environment X undefined` | Using wrong template's macros | `romanenum`/`abcenum` only exist in templates that define them |

---

## 10. Pre-Compilation Checklist

Before outputting the final .tex:

- [ ] All preamble definitions (`\newcommand`, `\newlist`) unchanged from template
- [ ] Every `{` has a matching `}`
- [ ] Every `\begin{env}` has a matching `\end{env}`
- [ ] Question numbers are sequential (1 through N)
- [ ] Marks per section add up correctly
- [ ] Total marks = header Maximum Marks
- [ ] No `\includegraphics` or `\img` calls
- [ ] All math symbols wrapped in `$...$`
- [ ] Answer key present on new page
- [ ] No empty sections (every section has at least 1 question)
- [ ] Paper ends with `$\blacksquare$~$\blacksquare$` marker
- [ ] No `\usepackage` after `\begin{document}`
