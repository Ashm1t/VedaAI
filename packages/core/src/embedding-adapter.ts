import type { EmbeddingAdapter } from "./types.js";

/**
 * HuggingFace Inference API embedding adapter using native fetch().
 * Free tier supports sentence-transformers models.
 */
export class HuggingFaceEmbeddingAdapter implements EmbeddingAdapter {
  private apiToken: string;
  private model: string;
  readonly modelId: string;
  readonly dimensions: number;

  constructor(options: {
    apiToken: string;
    model?: string;
    dimensions?: number;
  }) {
    this.apiToken = options.apiToken;
    this.model = options.model || "BAAI/bge-small-en-v1.5";
    this.modelId = this.model;
    this.dimensions = options.dimensions || 384;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${this.model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: texts,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `HF Inference API error (${response.status}): ${body}`
      );
    }

    return (await response.json()) as number[][];
  }
}

/**
 * OpenAI-compatible embedding adapter using native fetch().
 * Works with OpenAI, Azure OpenAI, or any OpenAI-compatible endpoint.
 */
export class OpenAIEmbeddingAdapter implements EmbeddingAdapter {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  readonly modelId: string;
  readonly dimensions: number;

  constructor(options: {
    apiKey: string;
    model?: string;
    dimensions?: number;
    baseUrl?: string;
  }) {
    this.apiKey = options.apiKey;
    this.model = options.model || "text-embedding-3-small";
    this.baseUrl = options.baseUrl || "https://api.openai.com/v1";
    this.modelId = this.model;
    this.dimensions = options.dimensions || 1536;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Embeddings API error (${response.status}): ${body}`
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
