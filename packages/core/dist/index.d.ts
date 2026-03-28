import { TemplateRegistry } from "./template-registry.js";
import type { LLMAdapter, GenerateInput, GenerateResult } from "./types.js";
export declare class TexRAG {
    private llm;
    private outputDir;
    templates: TemplateRegistry;
    constructor(options: {
        llm: LLMAdapter;
        templatesDir: string;
        outputDir: string;
    });
    /**
     * High-level: content + config → PDF + structured output.
     */
    generate(input: GenerateInput, documentId: string): Promise<GenerateResult>;
    /**
     * Low-level: validate a LaTeX string.
     */
    validate(tex: string): import("./types.js").ValidationResult;
    /**
     * Low-level: auto-fix common LaTeX issues.
     */
    autoFix(tex: string): string;
    /**
     * Low-level: compile a LaTeX string to PDF.
     */
    compile(tex: string, documentId: string): Promise<string>;
}
export { GroqAdapter } from "./llm-adapter.js";
export { TemplateRegistry } from "./template-registry.js";
export { validateLatex, autoFixLatex } from "./validator.js";
export { compileLaTeX, extractErrorFromLog } from "./compiler.js";
export { runPipeline } from "./pipeline.js";
export type { LLMAdapter, GenerateInput, GenerateResult, PipelineOptions, ProgressCallback, ValidationResult, TemplateMeta, TemplateInfo, QuestionType, Difficulty, Question, QuestionSection, QuestionPaperOutput, QuestionTypeConfig, AssignmentFormData, } from "./types.js";
export { QUESTION_TYPE_LABELS } from "./types.js";
//# sourceMappingURL=index.d.ts.map