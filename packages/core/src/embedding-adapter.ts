import type { EmbeddingAdapter } from "./types.js";

/**
 * Groq embedding adapter using native fetch().
 * Uses the OpenAI-compatible embeddings endpoint.
 */
export class GroqEmbeddingAdapter implements EmbeddingAdapter {
  private apiKey: string;
  private model: string;
  readonly modelId: string;
  readonly dimensions: number;

  constructor(options: {
    apiKey: string;
    model?: string;
    dimensions?: number;
  }) {
    this.apiKey = options.apiKey;
    this.model = options.model || "llama-3.3-70b-versatile";
    this.modelId = this.model;
    this.dimensions = options.dimensions || 1024;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(
      "https://api.groq.com/openai/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Groq embeddings API error (${response.status}): ${body}`
      );
    }

    const json = (await response.json()) as {
      data: Array<{ embedding: number[]; index: number }>;
    };

    // Sort by index to preserve input order
    return json.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}
