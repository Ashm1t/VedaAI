import type { TemplateMeta, TemplateInfo } from "./types.js";
/**
 * Registry for LaTeX templates.
 * Scans a templates directory for subdirectories containing template.tex + meta.json.
 */
export declare class TemplateRegistry {
    private templatesDir;
    private cache;
    private handbookCache;
    constructor(templatesDir: string);
    /**
     * List all available templates.
     */
    list(): TemplateInfo[];
    /**
     * Get a template's source and metadata by directory name.
     */
    get(dirName: string): {
        source: string;
        meta: TemplateMeta;
    };
    /**
     * Get the handbook content (shared across all templates).
     */
    getHandbook(): string;
    /**
     * Get the legacy template filename for backward compatibility.
     * Maps directory names to old filenames used in prompts.
     */
    getLegacyTemplateName(dirName: string): string;
}
//# sourceMappingURL=template-registry.d.ts.map