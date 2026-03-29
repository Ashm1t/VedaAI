import type {
  TemplateMeta,
  ScrapedTemplateMeta,
  AssignmentFormData,
} from "./types.js";

/**
 * Cosine similarity between two vectors. Returns 0 for zero-length vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Detect whether metadata is scraped format (has packages_required).
 */
function isScrapedMeta(
  meta: TemplateMeta | ScrapedTemplateMeta
): meta is ScrapedTemplateMeta {
  return "packages_required" in meta;
}

/**
 * Build a text representation of a template for embedding.
 */
export function buildDocumentText(
  meta: TemplateMeta | ScrapedTemplateMeta
): string {
  if (isScrapedMeta(meta)) {
    const parts = [
      `${meta.name} | ${meta.type} | ${meta.subject}`,
      meta.description,
      `Tags: ${meta.style_tags.join(", ")}`,
      `Document class: ${meta.document_class}`,
      `Packages: ${meta.packages_required.join(", ")}`,
    ];
    if (meta.educational) parts.push("Educational template");
    return parts.filter(Boolean).join("\n");
  }

  const subject = meta.subject || "general";
  const parts = [
    `${meta.name} | ${meta.type} | ${subject}`,
    meta.description,
    `Tags: ${meta.tags.join(", ")}`,
  ];
  if (meta.documentClass) parts.push(`Document class: ${meta.documentClass}`);
  if (meta.packages.length > 0) {
    parts.push(`Packages: ${meta.packages.join(", ")}`);
  }
  if (meta.educational) parts.push("Educational template");
  return parts.filter(Boolean).join("\n");
}

/**
 * Infer a document type from form data.
 */
export function inferDocumentType(formData: AssignmentFormData): string {
  if (formData.questionTypes && formData.questionTypes.length > 0) {
    return "exam";
  }

  const combined =
    `${formData.topic} ${formData.additionalInstructions}`.toLowerCase();

  const typeKeywords: Record<string, string[]> = {
    homework: ["homework", "assignment", "hw"],
    report: ["report", "lab report", "project report"],
    presentation: ["presentation", "slides", "beamer"],
    resume: ["resume", "cv", "curriculum vitae"],
    letter: ["letter", "cover letter"],
    worksheet: ["worksheet", "activity sheet"],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((kw) => combined.includes(kw))) return type;
  }

  return "article";
}

/**
 * Build a query string from user inputs for embedding search.
 */
export function buildQueryText(
  formData: AssignmentFormData,
  analysis?: { subject: string; topic: string; keyConcepts: string[] }
): string {
  const type = inferDocumentType(formData);
  const subject = analysis?.subject || formData.subject || "general";
  const topic = analysis?.topic || formData.topic || "";

  const parts = [
    `${subject} | ${type} | ${topic}`,
    formData.additionalInstructions || "",
  ];

  if (formData.className) parts.push(`Class: ${formData.className}`);

  if (formData.questionTypes && formData.questionTypes.length > 0) {
    parts.push(
      `Question types: ${formData.questionTypes.map((qt) => qt.label).join(", ")}`
    );
  }

  if (analysis?.keyConcepts && analysis.keyConcepts.length > 0) {
    parts.push(`Key concepts: ${analysis.keyConcepts.join(", ")}`);
  }

  return parts.filter(Boolean).join("\n");
}
