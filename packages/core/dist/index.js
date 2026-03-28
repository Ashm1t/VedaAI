import { TemplateRegistry } from "./template-registry.js";
import { runPipeline } from "./pipeline.js";
import { validateLatex, autoFixLatex } from "./validator.js";
import { compileLaTeX } from "./compiler.js";
export class TexRAG {
    llm;
    outputDir;
    templates;
    constructor(options) {
        this.llm = options.llm;
        this.outputDir = options.outputDir;
        this.templates = new TemplateRegistry(options.templatesDir);
    }
    /**
     * High-level: content + config → PDF + structured output.
     */
    async generate(input, documentId) {
        return runPipeline(this.llm, this.templates, input.extractedText, input.formData, {
            outputDir: this.outputDir,
            documentId,
            latexTimeout: 30_000,
        }, input.onProgress);
    }
    /**
     * Low-level: validate a LaTeX string.
     */
    validate(tex) {
        return validateLatex(tex);
    }
    /**
     * Low-level: auto-fix common LaTeX issues.
     */
    autoFix(tex) {
        return autoFixLatex(tex);
    }
    /**
     * Low-level: compile a LaTeX string to PDF.
     */
    async compile(tex, documentId) {
        return compileLaTeX(tex, this.outputDir, documentId);
    }
}
// ── Re-exports ─────────────────────────────────────────────────────
export { GroqAdapter } from "./llm-adapter.js";
export { TemplateRegistry } from "./template-registry.js";
export { validateLatex, autoFixLatex } from "./validator.js";
export { compileLaTeX, extractErrorFromLog } from "./compiler.js";
export { runPipeline } from "./pipeline.js";
export { QUESTION_TYPE_LABELS } from "./types.js";
//# sourceMappingURL=index.js.map