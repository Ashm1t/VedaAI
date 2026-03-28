import fs from "fs";
import path from "path";
import type { TemplateMeta, TemplateInfo } from "./types.js";

/**
 * Registry for LaTeX templates.
 * Scans a templates directory for subdirectories containing template.tex + meta.json.
 */
export class TemplateRegistry {
  private templatesDir: string;
  private cache: Map<string, { source: string; meta: TemplateMeta }> = new Map();
  private handbookCache: string | null = null;

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * List all available templates.
   */
  list(): TemplateInfo[] {
    const entries = fs.readdirSync(this.templatesDir, { withFileTypes: true });
    const templates: TemplateInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const metaPath = path.join(this.templatesDir, entry.name, "meta.json");
      if (!fs.existsSync(metaPath)) continue;

      try {
        const meta: TemplateMeta = JSON.parse(
          fs.readFileSync(metaPath, "utf-8")
        );
        templates.push({
          name: meta.name,
          dirName: entry.name,
          meta,
        });
      } catch {
        // Skip malformed meta.json
      }
    }

    return templates;
  }

  /**
   * Get a template's source and metadata by directory name.
   */
  get(dirName: string): { source: string; meta: TemplateMeta } {
    const cached = this.cache.get(dirName);
    if (cached) return cached;

    const templateDir = path.join(this.templatesDir, dirName);
    const texPath = path.join(templateDir, "template.tex");
    const metaPath = path.join(templateDir, "meta.json");

    if (!fs.existsSync(texPath)) {
      throw new Error(`Template not found: ${dirName}/template.tex`);
    }

    const source = fs.readFileSync(texPath, "utf-8");
    let meta: TemplateMeta;

    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    } else {
      meta = {
        name: dirName,
        type: "general",
        tags: [],
        description: "",
        fields: [],
        packages: [],
      };
    }

    const result = { source, meta };
    this.cache.set(dirName, result);
    return result;
  }

  /**
   * Get the handbook content (shared across all templates).
   */
  getHandbook(): string {
    if (this.handbookCache) return this.handbookCache;

    const handbookPath = path.join(this.templatesDir, "handbook.md");
    if (!fs.existsSync(handbookPath)) {
      return "";
    }

    this.handbookCache = fs.readFileSync(handbookPath, "utf-8");
    return this.handbookCache;
  }

  /**
   * Get the legacy template filename for backward compatibility.
   * Maps directory names to old filenames used in prompts.
   */
  getLegacyTemplateName(dirName: string): string {
    const legacyMap: Record<string, string> = {
      "questionpaper": "questionpaper.tex",
      "icse-english-literature": "icse_english_literature.tex",
    };
    return legacyMap[dirName] || `${dirName}.tex`;
  }
}
