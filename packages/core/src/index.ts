import { TemplateRegistry } from "./template-registry.js";
import { runPipeline } from "./pipeline.js";
import { validateLatex, autoFixLatex } from "./validator.js";
import { compileLaTeX, extractErrorFromLog } from "./compiler.js";
import type {
  LLMAdapter,
  GenerateInput,
  GenerateResult,
} from "./types.js";

export class TexRAG {
  private llm: LLMAdapter;
  private outputDir: string;
  public templates: TemplateRegistry;

  constructor(options: {
    llm: LLMAdapter;
    templatesDir: string;
    outputDir: string;
  }) {
    this.llm = options.llm;
    this.outputDir = options.outputDir;
    this.templates = new TemplateRegistry(options.templatesDir);
  }

  /**
   * High-level: content + config → PDF + structured output.
   */
  async generate(input: GenerateInput, documentId: string): Promise<GenerateResult> {
    return runPipeline(
      this.llm,
      this.templates,
      input.extractedText,
      input.formData,
      {
        outputDir: this.outputDir,
        documentId,
        latexTimeout: 30_000,
      },
      input.onProgress
    );
  }

  /**
   * Low-level: validate a LaTeX string.
   */
  validate(tex: string) {
    return validateLatex(tex);
  }

  /**
   * Low-level: auto-fix common LaTeX issues.
   */
  autoFix(tex: string) {
    return autoFixLatex(tex);
  }

  /**
   * Low-level: compile a LaTeX string to PDF.
   */
  async compile(tex: string, documentId: string) {
    return compileLaTeX(tex, this.outputDir, documentId);
  }
}

// ── Re-exports ─────────────────────────────────────────────────────

export { GroqAdapter } from "./llm-adapter.js";
export { TemplateRegistry } from "./template-registry.js";
export { validateLatex, autoFixLatex } from "./validator.js";
export { compileLaTeX, extractErrorFromLog } from "./compiler.js";
export { runPipeline } from "./pipeline.js";

// Types
export type {
  LLMAdapter,
  GenerateInput,
  GenerateResult,
  PipelineOptions,
  ProgressCallback,
  ValidationResult,
  TemplateMeta,
  TemplateInfo,
  QuestionType,
  Difficulty,
  Question,
  QuestionSection,
  QuestionPaperOutput,
  QuestionTypeConfig,
  AssignmentFormData,
} from "./types.js";

export { QUESTION_TYPE_LABELS } from "./types.js";
