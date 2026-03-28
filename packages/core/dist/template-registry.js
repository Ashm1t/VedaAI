import fs from "fs";
import path from "path";
/**
 * Registry for LaTeX templates.
 * Scans a templates directory for subdirectories containing template.tex + meta.json.
 */
export class TemplateRegistry {
    templatesDir;
    cache = new Map();
    handbookCache = null;
    constructor(templatesDir) {
        this.templatesDir = templatesDir;
    }
    /**
     * List all available templates.
     */
    list() {
        const entries = fs.readdirSync(this.templatesDir, { withFileTypes: true });
        const templates = [];
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const metaPath = path.join(this.templatesDir, entry.name, "meta.json");
            if (!fs.existsSync(metaPath))
                continue;
            try {
                const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                templates.push({
                    name: meta.name,
                    dirName: entry.name,
                    meta,
                });
            }
            catch {
                // Skip malformed meta.json
            }
        }
        return templates;
    }
    /**
     * Get a template's source and metadata by directory name.
     */
    get(dirName) {
        const cached = this.cache.get(dirName);
        if (cached)
            return cached;
        const templateDir = path.join(this.templatesDir, dirName);
        const texPath = path.join(templateDir, "template.tex");
        const metaPath = path.join(templateDir, "meta.json");
        if (!fs.existsSync(texPath)) {
            throw new Error(`Template not found: ${dirName}/template.tex`);
        }
        const source = fs.readFileSync(texPath, "utf-8");
        let meta;
        if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        }
        else {
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
    getHandbook() {
        if (this.handbookCache)
            return this.handbookCache;
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
    getLegacyTemplateName(dirName) {
        const legacyMap = {
            "questionpaper": "questionpaper.tex",
            "icse-english-literature": "icse_english_literature.tex",
        };
        return legacyMap[dirName] || `${dirName}.tex`;
    }
}
//# sourceMappingURL=template-registry.js.map