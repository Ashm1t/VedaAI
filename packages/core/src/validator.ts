import type { ValidationResult } from "./types.js";

export type { ValidationResult } from "./types.js";

export function validateLatex(tex: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Must have \documentclass
  if (!tex.includes("\\documentclass")) {
    errors.push("Missing \\documentclass declaration");
  }

  // 2. Must have \begin{document} and \end{document}
  if (!tex.includes("\\begin{document}")) {
    errors.push("Missing \\begin{document}");
  }
  if (!tex.includes("\\end{document}")) {
    errors.push("Missing \\end{document}");
  }

  // 3. Brace matching
  const braceBalance = countBraces(tex);
  if (braceBalance !== 0) {
    errors.push(
      `Unbalanced braces: ${braceBalance > 0 ? braceBalance + " unclosed {" : Math.abs(braceBalance) + " extra }"}`
    );
  }

  // 4. Environment matching
  const envErrors = checkEnvironments(tex);
  errors.push(...envErrors);

  // 5. No \usepackage after \begin{document}
  const docStart = tex.indexOf("\\begin{document}");
  if (docStart !== -1) {
    const afterDoc = tex.slice(docStart);
    if (afterDoc.includes("\\usepackage")) {
      errors.push("\\usepackage found after \\begin{document} — must be in preamble");
    }
  }

  // 6. No external image references (they won't exist)
  const imgMatches = tex.match(/\\includegraphics\[.*?\]\{.*?\}/g);
  if (imgMatches) {
    for (const match of imgMatches) {
      const fileMatch = match.match(/\{([^}]+)\}/);
      if (fileMatch && fileMatch[1]) {
        warnings.push(
          `Image reference "${fileMatch[1]}" — file may not exist, could cause compilation warning`
        );
      }
    }
  }

  // 7. Markdown fence detection (AI sometimes wraps output)
  if (tex.startsWith("```")) {
    errors.push("Output starts with markdown code fence — strip ``` before compiling");
  }
  if (tex.trimEnd().endsWith("```")) {
    errors.push("Output ends with markdown code fence — strip ``` before compiling");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Count brace balance. Returns 0 if balanced, positive if unclosed {, negative if extra }.
 * Ignores braces inside comments and escaped braces.
 */
function countBraces(tex: string): number {
  let balance = 0;
  let inComment = false;
  let prevChar = "";

  for (let i = 0; i < tex.length; i++) {
    const ch = tex[i];

    if (ch === "\n") {
      inComment = false;
      prevChar = ch;
      continue;
    }

    if (ch === "%" && prevChar !== "\\") {
      inComment = true;
      prevChar = ch;
      continue;
    }

    if (inComment) {
      prevChar = ch;
      continue;
    }

    if (ch === "{" && prevChar !== "\\") balance++;
    if (ch === "}" && prevChar !== "\\") balance--;

    prevChar = ch;
  }

  return balance;
}

/**
 * Check that all \begin{env} have matching \end{env}.
 */
function checkEnvironments(tex: string): string[] {
  const errors: string[] = [];
  const beginPattern = /\\begin\{(\w+)\}/g;
  const endPattern = /\\end\{(\w+)\}/g;

  const begins: Record<string, number> = {};
  const ends: Record<string, number> = {};

  let match;
  while ((match = beginPattern.exec(tex)) !== null) {
    begins[match[1]] = (begins[match[1]] || 0) + 1;
  }
  while ((match = endPattern.exec(tex)) !== null) {
    ends[match[1]] = (ends[match[1]] || 0) + 1;
  }

  for (const env of Object.keys(begins)) {
    const bCount = begins[env] || 0;
    const eCount = ends[env] || 0;
    if (bCount !== eCount) {
      errors.push(
        `Environment "${env}": ${bCount} \\begin vs ${eCount} \\end`
      );
    }
  }

  for (const env of Object.keys(ends)) {
    if (!begins[env]) {
      errors.push(`\\end{${env}} without matching \\begin{${env}}`);
    }
  }

  return errors;
}

/**
 * Attempt to auto-fix common issues deterministically (no AI needed).
 */
export function autoFixLatex(tex: string): string {
  let fixed = tex;

  // 1. Strip markdown fences
  fixed = fixed
    .replace(/^```latex\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?\s*```\s*$/g, "")
    .trim();

  // 2. Fix common escape issues from JSON/prompt processing
  fixed = fixed.replace(/\\\\newcommand/g, "\\newcommand");
  fixed = fixed.replace(/\\\\begin/g, "\\begin");
  fixed = fixed.replace(/\\\\end/g, "\\end");

  // 3. Remove \includegraphics and \img calls that reference non-existent files
  fixed = fixed.replace(
    /\\includegraphics\s*(\[.*?\])?\s*\{[^}]*\}/g,
    ""
  );
  fixed = fixed.replace(
    /\\img\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/g,
    ""
  );
  fixed = fixed.replace(
    /\\imgtwo\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/g,
    ""
  );
  // Remove empty figure environments left behind
  fixed = fixed.replace(
    /\\begin\{figure\}.*?\\end\{figure\}/gs,
    ""
  );

  // 4. Deterministic brace balancer
  fixed = fixBraces(fixed);

  // 5. Fix unmatched environments
  fixed = fixEnvironments(fixed);

  return fixed;
}

/**
 * Deterministic brace balancer.
 */
function fixBraces(tex: string): string {
  const balance = countBraces(tex);

  if (balance === 0) return tex;

  if (balance > 0) {
    const endDocIdx = tex.lastIndexOf("\\end{document}");
    if (endDocIdx !== -1) {
      const closingBraces = "}".repeat(balance);
      return (
        tex.slice(0, endDocIdx) +
        "\n" + closingBraces + "\n" +
        tex.slice(endDocIdx)
      );
    }
    return tex + "\n" + "}".repeat(balance);
  }

  // balance < 0 — extra closing braces
  let result = tex;
  let toRemove = Math.abs(balance);
  const endDocIdx = result.lastIndexOf("\\end{document}");
  const searchArea = endDocIdx !== -1 ? endDocIdx : result.length;

  for (let i = searchArea - 1; i >= 0 && toRemove > 0; i--) {
    if (result[i] === "}" && (i === 0 || result[i - 1] !== "\\")) {
      const lineStart = result.lastIndexOf("\n", i - 1) + 1;
      const lineEnd = result.indexOf("\n", i);
      const line = result.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
      if (line === "}") {
        result = result.slice(0, lineStart) + result.slice(lineEnd === -1 ? result.length : lineEnd);
        toRemove--;
        i = lineStart;
      }
    }
  }

  return result;
}

/**
 * Fix unmatched \begin{env} / \end{env} pairs.
 */
function fixEnvironments(tex: string): string {
  let fixed = tex;
  const beginPattern = /\\begin\{(\w+)\}/g;
  const endPattern = /\\end\{(\w+)\}/g;

  const begins: Record<string, number> = {};
  const ends: Record<string, number> = {};

  let match;
  while ((match = beginPattern.exec(fixed)) !== null) {
    begins[match[1]] = (begins[match[1]] || 0) + 1;
  }
  while ((match = endPattern.exec(fixed)) !== null) {
    ends[match[1]] = (ends[match[1]] || 0) + 1;
  }

  const endDocIdx = fixed.lastIndexOf("\\end{document}");
  for (const env of Object.keys(begins)) {
    const diff = (begins[env] || 0) - (ends[env] || 0);
    if (diff > 0 && endDocIdx !== -1) {
      const closings = ("\\end{" + env + "}\n").repeat(diff);
      fixed =
        fixed.slice(0, endDocIdx) + closings + fixed.slice(endDocIdx);
    }
  }

  return fixed;
}
