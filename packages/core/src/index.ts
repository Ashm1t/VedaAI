import { TemplateRegistry } from "./template-registry.js";
import { TemplateRetriever } from "./template-retriever.js";
import { runPipeline } from "./pipeline.js";
import { validateLatex, autoFixLatex } from "./validator.js";
import { compileLaTeX, extractErrorFromLog } from "./compiler.js";
import type {
  LLMAdapter,
  EmbeddingAdapter,
  GenerateInput,
  GenerateResult,
} from "./types.js";

export class TexRAG {
  private llm: LLMAdapter;
  private outputDir: string;
  private retriever?: TemplateRetriever;
  public templates: TemplateRegistry;

  constructor(options: {
    llm: LLMAdapter;
    templatesDir: string;
    outputDir: string;
    embeddingAdapter?: EmbeddingAdapter;
    embeddingsPath?: string;
    scrapedRegistryPath?: string;
  }) {
    this.llm = options.llm;
    this.outputDir = options.outputDir;
    this.templates = new TemplateRegistry(options.templatesDir);

    // Register scraped templates if path provided
    if (options.scrapedRegistryPath) {
      this.templates.registerScrapedDir(options.scrapedRegistryPath);
    }

    // Set up RAG retriever if embeddings config provided
    if (options.embeddingAdapter || options.embeddingsPath) {
      this.retriever = new TemplateRetriever({
        registry: this.templates,
        embeddingAdapter: options.embeddingAdapter,
        embeddingsPath: options.embeddingsPath,
      });
    }
  }

  /**
   * Build (or rebuild) the embedding index from all registered templates.
   * Only needed if you want to generate embeddings at runtime.
   */
  async buildIndex(): Promise<void> {
    if (!this.retriever) {
      throw new Error(
        "Cannot build index: no embeddingAdapter configured"
      );
    }
    await this.retriever.buildIndex();
  }

  /**
   * Save the current embedding index to a JSON file.
   */
  async saveEmbeddings(outputPath: string): Promise<void> {
    if (!this.retriever) {
      throw new Error("No retriever configured");
    }
    await this.retriever.saveEmbeddings(outputPath);
  }

  /**
   * High-level: content + config → PDF + structured output.
   */
  async generate(
    input: GenerateInput,
    documentId: string
  ): Promise<GenerateResult> {
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
      input.onProgress,
      this.retriever
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
export { OpenAIEmbeddingAdapter } from "./embedding-adapter.js";
export { TemplateRegistry } from "./template-registry.js";
export { TemplateRetriever } from "./template-retriever.js";
export { validateLatex, autoFixLatex } from "./validator.js";
export { compileLaTeX, extractErrorFromLog } from "./compiler.js";
export { runPipeline } from "./pipeline.js";
export {
  cosineSimilarity,
  buildDocumentText,
  buildQueryText,
  inferDocumentType,
} from "./similarity.js";

// Types
export type {
  LLMAdapter,
  EmbeddingAdapter,
  GenerateInput,
  GenerateResult,
  PipelineOptions,
  ProgressCallback,
  ValidationResult,
  TemplateMeta,
  TemplateInfo,
  ScrapedTemplateMeta,
  EmbeddingEntry,
  EmbeddingIndex,
  RetrievalResult,
  RetrieverOptions,
  QuestionType,
  Difficulty,
  Question,
  QuestionSection,
  QuestionPaperOutput,
  QuestionTypeConfig,
  AssignmentFormData,
} from "./types.js";

export { QUESTION_TYPE_LABELS } from "./types.js";
