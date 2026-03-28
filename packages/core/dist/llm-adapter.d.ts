import type { LLMAdapter } from "./types.js";
export { type LLMAdapter } from "./types.js";
/**
 * Groq LLM adapter — uses LLaMA models via Groq's fast inference API.
 */
export declare class GroqAdapter implements LLMAdapter {
    private client;
    private model;
    constructor(options: {
        apiKey: string;
        model?: string;
    });
    generateJSON(prompt: string): Promise<string>;
    generateText(prompt: string, temperature?: number): Promise<string>;
}
//# sourceMappingURL=llm-adapter.d.ts.map