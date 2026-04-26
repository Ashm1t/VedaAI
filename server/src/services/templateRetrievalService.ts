import fs from "fs";
import {
  HuggingFaceEmbeddingAdapter,
  TemplateRegistry,
  TemplateRetriever,
} from "@libra/core";
import type { RetrievalResult, TemplateMeta } from "@libra/core";
import { config } from "../config/index.js";

export interface AgentTemplateRetrievalOptions {
  topK?: number;
  preferredTypes?: string[];
  subjectHints?: string[];
  positiveKeywords?: string[];
  minimumScore?: number;
}

export interface RetrievedTemplateOption {
  id: string;
  name: string;
  description: string;
  type: string;
  subject: string;
  tags: string[];
  score: number;
  compileSafe: boolean;
  documentClass: string;
  selectionReason: string;
}

export interface RetrievedTemplateContext {
  mode: "semantic" | "metadata";
  results: RetrievalResult[];
  options: RetrievedTemplateOption[];
  primaryTemplateId: string;
  primaryTemplateMeta: TemplateMeta;
  primaryTemplateSource: string;
  primaryTemplateClass: string;
  selectionReason: string;
}

interface TemplateSafety {
  safe: boolean;
  documentClass: string;
  issues: string[];
}

const SAFE_DOCUMENT_CLASSES = new Set([
  "article",
  "report",
  "letter",
  "IEEEtran",
  "beamer",
]);

let registry: TemplateRegistry | null = null;
let retriever: TemplateRetriever | null = null;

function getTemplateRegistry(): TemplateRegistry {
  if (!registry) {
    registry = new TemplateRegistry(config.templatesDir);

    if (fs.existsSync(config.scrapedRegistryPath)) {
      registry.registerScrapedDir(config.scrapedRegistryPath);
    }
  }

  return registry;
}

function hasEmbeddingsFile() {
  return fs.existsSync(config.embeddingsPath);
}

function createEmbeddingAdapter() {
  if (!config.hfToken) return undefined;

  return new HuggingFaceEmbeddingAdapter({
    apiToken: config.hfToken,
  });
}

function getTemplateRetriever(): TemplateRetriever {
  if (!retriever) {
    retriever = new TemplateRetriever({
      registry: getTemplateRegistry(),
      embeddingAdapter: createEmbeddingAdapter(),
      embeddingsPath: hasEmbeddingsFile() ? config.embeddingsPath : undefined,
    });
  }

  return retriever;
}

function normalizeTokens(values: string[] = []) {
  return values
    .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length > 1);
}

function analyzeTemplateSafety(source: string): TemplateSafety {
  const issues: string[] = [];
  const classMatch = source.match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/);
  const documentClass = classMatch?.[1] || "unknown";

  if (!SAFE_DOCUMENT_CLASSES.has(documentClass)) {
    issues.push(`unsupported document class: ${documentClass}`);
  }

  if (/\\(?:input|include)\{[^}]+\}/.test(source)) {
    issues.push("references external TeX files");
  }

  if (/\\(?:addbibresource|bibliography)\{[^}]+\}/.test(source)) {
    issues.push("references external bibliography files");
  }

  if (/\\includegraphics(?:\[[^\]]*\])?\{[^}]+\}/.test(source)) {
    issues.push("references external image assets");
  }

  if (/\\(?:setmainfont|setsansfont|setmonofont)\{/.test(source)) {
    issues.push("requires xelatex or lualatex font setup");
  }

  if (/(xelatex|lualatex)/i.test(source)) {
    issues.push("declares a non-pdflatex compile path");
  }

  return {
    safe: issues.length === 0,
    documentClass,
    issues,
  };
}

function keywordBonus(meta: TemplateMeta, tokens: string[]) {
  if (tokens.length === 0) return 0;

  const haystack = [
    meta.name,
    meta.description,
    meta.subject || "",
    ...meta.tags,
    meta.type,
  ]
    .join(" ")
    .toLowerCase();

  return tokens.reduce(
    (score, token) => score + (haystack.includes(token) ? 0.08 : 0),
    0
  );
}

function typeBonus(meta: TemplateMeta, preferredTypes: string[]) {
  return preferredTypes.includes(meta.type) ? 0.35 : 0;
}

function subjectBonus(meta: TemplateMeta, subjectHints: string[]) {
  if (subjectHints.length === 0) return 0;

  const subject = (meta.subject || "").toLowerCase();
  const tags = meta.tags.map((tag) => tag.toLowerCase());
  return subjectHints.some(
    (hint) => subject === hint || tags.includes(hint)
  )
    ? 0.15
    : 0;
}

export function isSemanticRetrievalEnabled() {
  return Boolean(config.hfToken && hasEmbeddingsFile());
}

function toTemplateOption(
  result: RetrievalResult,
  safety: TemplateSafety,
  score: number
): RetrievedTemplateOption {
  return {
    id: result.templateId,
    name: result.meta.name,
    description: result.meta.description,
    type: result.meta.type,
    subject: result.meta.subject || "",
    tags: result.meta.tags,
    score,
    compileSafe: safety.safe,
    documentClass: safety.documentClass,
    selectionReason: safety.safe
      ? "compile-safe shortlist candidate"
      : `has issues: ${safety.issues.join(", ")}`,
  };
}

export async function retrieveTemplatesForAgent(
  query: string,
  options: AgentTemplateRetrievalOptions = {}
): Promise<RetrievedTemplateContext | null> {
  try {
    const preferredTypes = (options.preferredTypes || []).map((value) =>
      value.toLowerCase()
    );
    const subjectHints = normalizeTokens(options.subjectHints);
    const positiveKeywords = normalizeTokens(options.positiveKeywords);

    const results = await getTemplateRetriever().search(query, {
      topK: 40,
      minScore: options.minimumScore ?? 0.08,
    });

    const ranked = results
      .map((result) => {
        const template = getTemplateRegistry().get(result.templateId);
        const safety = analyzeTemplateSafety(template.source);
        const score =
          result.score +
          typeBonus(result.meta, preferredTypes) +
          subjectBonus(result.meta, subjectHints) +
          keywordBonus(result.meta, positiveKeywords) +
          (safety.safe ? 0.4 : -0.8);

        return {
          result,
          template,
          safety,
          score,
        };
      })
      .filter((entry) =>
        preferredTypes.length > 0
          ? preferredTypes.includes(entry.result.meta.type)
          : true
      )
      .sort((a, b) => b.score - a.score);

    const safeRanked = ranked.filter((entry) => entry.safety.safe);
    const selectedPool = safeRanked.length > 0 ? safeRanked : ranked;
    if (selectedPool.length === 0) {
      return null;
    }

    const selected = selectedPool[0];
    const limitedEntries = selectedPool.slice(0, options.topK ?? 3);
    const limitedResults = limitedEntries.map((entry) => entry.result);
    const shortlist = limitedEntries.map((entry) =>
      toTemplateOption(entry.result, entry.safety, entry.score)
    );

    return {
      mode: isSemanticRetrievalEnabled() ? "semantic" : "metadata",
      results: limitedResults,
      options: shortlist,
      primaryTemplateId: selected.result.templateId,
      primaryTemplateMeta: selected.template.meta,
      primaryTemplateSource: selected.template.source.slice(0, 14000),
      primaryTemplateClass: selected.safety.documentClass,
      selectionReason: selected.safety.safe
        ? "highest-ranked compile-safe template"
        : `fallback template with issues: ${selected.safety.issues.join(", ")}`,
    };
  } catch (error) {
    console.warn("Template retrieval failed, continuing without RAG:", error);
    return null;
  }
}

export function getTemplateContextById(
  templateId: string
): RetrievedTemplateContext | null {
  try {
    const template = getTemplateRegistry().get(templateId);
    const safety = analyzeTemplateSafety(template.source);
    const baseResult: RetrievalResult = {
      templateId,
      meta: template.meta,
      score: 1,
    };

    return {
      mode: isSemanticRetrievalEnabled() ? "semantic" : "metadata",
      results: [baseResult],
      options: [toTemplateOption(baseResult, safety, 1)],
      primaryTemplateId: templateId,
      primaryTemplateMeta: template.meta,
      primaryTemplateSource: template.source.slice(0, 14000),
      primaryTemplateClass: safety.documentClass,
      selectionReason: "user-selected template",
    };
  } catch (error) {
    console.warn(`Failed to resolve template "${templateId}":`, error);
    return null;
  }
}
