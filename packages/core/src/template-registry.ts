import fs from "fs";
import path from "path";
import type { TemplateMeta, TemplateInfo, ScrapedTemplateMeta } from "./types.js";

/**
 * Normalize scraped metadata format into the standard TemplateMeta format.
 */
function normalizeScrapedMeta(scraped: ScrapedTemplateMeta): TemplateMeta {
  return {
    name: scraped.name,
    type: scraped.type,
    tags: [...scraped.style_tags, scraped.subject],
    description: scraped.description,
    fields: [],
    packages: scraped.packages_required,
    subject: scraped.subject,
    documentClass: scraped.document_class,
    educational: scraped.educational,
  };
}

/**
 * Registry for LaTeX templates.
 * Scans a templates directory for subdirectories containing template.tex + meta.json.
 * Also supports scraped template directories indexed by registry.json.
 */
export class TemplateRegistry {
  private templatesDir: string;
  private cache: Map<string, { source: string; meta: TemplateMeta }> = new Map();
  private handbookCache: string | null = null;
  private scrapedTemplates: Map<string, { texPath: string; meta: TemplateMeta }> =
    new Map();

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * Register scraped templates from a registry.json file.
   * The registry.json contains paths relative to the project root;
   * pass the base directory so paths can be resolved.
   */
  registerScrapedDir(registryJsonPath: string): void {
    const registryDir = path.dirname(registryJsonPath);
    const registry = JSON.parse(fs.readFileSync(registryJsonPath, "utf-8")) as {
      templates: Array<{
        id: string;
        tex_path: string;
        metadata_path: string;
      }>;
    };

    for (const entry of registry.templates) {
      // Paths in registry.json are relative (e.g. "templates/scraped/article/...")
      // Resolve relative to the directory containing registry.json, going up to match
      const texPath = path.resolve(registryDir, path.basename(entry.tex_path.replace(/.*scraped\//, "")));
      const metadataPath = path.resolve(registryDir, path.basename(entry.metadata_path.replace(/.*scraped\//, "")));

      // Actually, the paths like "templates/scraped/article/biology/formal/id/template.tex"
      // need to be resolved relative to the parent that contains "templates/"
      // Simpler: strip the "templates/scraped/" prefix and resolve from registryDir
      const texRelative = entry.tex_path.replace(/^templates\/scraped\//, "");
      const metaRelative = entry.metadata_path.replace(/^templates\/scraped\//, "");
      const resolvedTexPath = path.join(registryDir, texRelative);
      const resolvedMetaPath = path.join(registryDir, metaRelative);

      if (!fs.existsSync(resolvedMetaPath)) continue;

      try {
        const scraped: ScrapedTemplateMeta = JSON.parse(
          fs.readFileSync(resolvedMetaPath, "utf-8")
        );
        this.scrapedTemplates.set(entry.id, {
          texPath: resolvedTexPath,
          meta: normalizeScrapedMeta(scraped),
        });
      } catch {
        // Skip malformed metadata
      }
    }
  }

  /**
   * List all available templates (built-in + scraped).
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

    // Add scraped templates
    for (const [id, { meta }] of this.scrapedTemplates) {
      templates.push({ name: meta.name, dirName: id, meta });
    }

    return templates;
  }

  /**
   * Get a template's source and metadata by directory name or scraped ID.
   */
  get(dirName: string): { source: string; meta: TemplateMeta } {
    const cached = this.cache.get(dirName);
    if (cached) return cached;

    // Check scraped templates first
    const scraped = this.scrapedTemplates.get(dirName);
    if (scraped) {
      if (!fs.existsSync(scraped.texPath)) {
        throw new Error(`Scraped template .tex not found: ${scraped.texPath}`);
      }
      const source = fs.readFileSync(scraped.texPath, "utf-8");
      const result = { source, meta: scraped.meta };
      this.cache.set(dirName, result);
      return result;
    }

    // Fall back to built-in templates
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
