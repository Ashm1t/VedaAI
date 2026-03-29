import fs from "fs";
import type {
  EmbeddingAdapter,
  EmbeddingEntry,
  EmbeddingIndex,
  TemplateMeta,
  RetrievalResult,
  RetrieverOptions,
  AssignmentFormData,
} from "./types.js";
import { TemplateRegistry } from "./template-registry.js";
import {
  cosineSimilarity,
  buildDocumentText,
  buildQueryText,
  inferDocumentType,
} from "./similarity.js";

/**
 * RAG-based template retriever.
 * Loads pre-computed embeddings from a JSON file or builds them at runtime,
 * then uses cosine similarity to find the best-matching template for a query.
 */
export class TemplateRetriever {
  private registry: TemplateRegistry;
  private embeddingAdapter?: EmbeddingAdapter;
  private entries: EmbeddingEntry[] = [];
  private metadataMap: Map<string, TemplateMeta> = new Map();
  private loaded = false;

  constructor(options: {
    registry: TemplateRegistry;
    embeddingAdapter?: EmbeddingAdapter;
    embeddingsPath?: string;
  }) {
    this.registry = options.registry;
    this.embeddingAdapter = options.embeddingAdapter;

    if (options.embeddingsPath) {
      this.loadEmbeddings(options.embeddingsPath);
    }

    this.refreshMetadata();
  }

  /**
   * Refresh the internal metadata map from the registry.
   */
  private refreshMetadata(): void {
    this.metadataMap.clear();
    for (const tmpl of this.registry.list()) {
      this.metadataMap.set(tmpl.dirName, tmpl.meta);
    }
  }

  /**
   * Load pre-computed embeddings from a JSON file (synchronous).
   */
  loadEmbeddings(filePath: string): void {
    const raw = fs.readFileSync(filePath, "utf-8");
    const index: EmbeddingIndex = JSON.parse(raw);

    if (
      this.embeddingAdapter &&
      index.model !== this.embeddingAdapter.modelId
    ) {
      console.warn(
        `Embedding model mismatch: file has "${index.model}", adapter uses "${this.embeddingAdapter.modelId}". Results may be inaccurate.`
      );
    }

    this.entries = index.entries;
    this.loaded = true;
  }

  /**
   * Build the embedding index from all registered templates.
   * Requires an EmbeddingAdapter to be configured.
   */
  async buildIndex(): Promise<void> {
    if (!this.embeddingAdapter) {
      throw new Error("Cannot build index without an EmbeddingAdapter");
    }

    this.refreshMetadata();
    const templates = this.registry.list();

    // Build text representations
    const texts: string[] = [];
    const ids: string[] = [];

    for (const tmpl of templates) {
      ids.push(tmpl.dirName);
      texts.push(buildDocumentText(tmpl.meta));
    }

    // Embed in batches of 20
    const batchSize = 20;
    const allVectors: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const vectors = await this.embeddingAdapter.embedBatch(batch);
      allVectors.push(...vectors);
    }

    this.entries = ids.map((id, i) => ({
      id,
      text: texts[i],
      vector: allVectors[i],
    }));

    this.loaded = true;
  }

  /**
   * Save the current embedding index to a JSON file.
   */
  async saveEmbeddings(outputPath: string): Promise<void> {
    if (this.entries.length === 0) {
      throw new Error("No embeddings to save. Call buildIndex() first.");
    }

    const index: EmbeddingIndex = {
      version: 1,
      model: this.embeddingAdapter?.modelId || "unknown",
      dimensions: this.entries[0]?.vector.length || 0,
      entries: this.entries,
    };

    fs.writeFileSync(outputPath, JSON.stringify(index), "utf-8");
  }

  /**
   * Search for templates matching a text query.
   */
  async search(
    query: string,
    options?: RetrieverOptions
  ): Promise<RetrievalResult[]> {
    const topK = options?.topK ?? 3;
    const minScore = options?.minScore ?? 0.3;

    if (!this.loaded || this.entries.length === 0 || !this.embeddingAdapter) {
      return this.metadataFallback(options);
    }

    const queryVector = await this.embeddingAdapter.embed(query);

    let results: Array<{ id: string; score: number }> = this.entries.map(
      (entry) => ({
        id: entry.id,
        score: cosineSimilarity(queryVector, entry.vector),
      })
    );

    // Apply filters
    if (options?.typeFilter) {
      const typeFilter = options.typeFilter;
      results = results.filter((r) => {
        const meta = this.metadataMap.get(r.id);
        return meta?.type === typeFilter;
      });
    }
    if (options?.subjectFilter) {
      const subjectFilter = options.subjectFilter;
      results = results.filter((r) => {
        const meta = this.metadataMap.get(r.id);
        return (
          meta?.subject === subjectFilter ||
          meta?.tags.includes(subjectFilter)
        );
      });
    }

    // Sort descending by score, filter by threshold, limit
    results.sort((a, b) => b.score - a.score);
    results = results.filter((r) => r.score >= minScore).slice(0, topK);

    return results.map((r) => ({
      templateId: r.id,
      score: r.score,
      meta: this.metadataMap.get(r.id)!,
    }));
  }

  /**
   * Select the best template for a given form + analysis.
   * This is the public replacement for the keyword-based selectTemplate().
   */
  async selectTemplate(
    formData: AssignmentFormData,
    analysis?: { subject: string; topic: string; keyConcepts: string[] }
  ): Promise<string> {
    const query = buildQueryText(formData, analysis);
    const type = inferDocumentType(formData);

    // Try semantic search with type filter
    let results = await this.search(query, { topK: 1, typeFilter: type });
    if (results.length > 0) return results[0].templateId;

    // Try semantic search without type filter
    results = await this.search(query, { topK: 1 });
    if (results.length > 0) return results[0].templateId;

    // Metadata-based fallback (no embeddings needed)
    const subject = (
      analysis?.subject ||
      formData.subject ||
      ""
    ).toLowerCase();

    // Type + subject match
    for (const [id, meta] of this.metadataMap) {
      if (
        meta.type === type &&
        (meta.subject === subject || meta.tags.includes(subject))
      ) {
        return id;
      }
    }

    // Type-only match
    for (const [id, meta] of this.metadataMap) {
      if (meta.type === type) return id;
    }

    // Ultimate fallback
    return "questionpaper";
  }

  /**
   * Fallback when no embeddings are available: filter by metadata fields.
   */
  private metadataFallback(options?: RetrieverOptions): RetrievalResult[] {
    const results: RetrievalResult[] = [];

    for (const [id, meta] of this.metadataMap) {
      let match = true;
      if (options?.typeFilter && meta.type !== options.typeFilter) match = false;
      if (
        options?.subjectFilter &&
        meta.subject !== options.subjectFilter &&
        !meta.tags.includes(options.subjectFilter)
      ) {
        match = false;
      }
      if (match) {
        results.push({ templateId: id, score: 0.5, meta });
      }
    }

    return results.slice(0, options?.topK ?? 3);
  }
}
