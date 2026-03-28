import Groq from "groq-sdk";
/**
 * Groq LLM adapter — uses LLaMA models via Groq's fast inference API.
 */
export class GroqAdapter {
    client;
    model;
    constructor(options) {
        if (!options.apiKey) {
            throw new Error("Groq API key is required");
        }
        this.client = new Groq({ apiKey: options.apiKey });
        this.model = options.model || "llama-3.3-70b-versatile";
    }
    async generateJSON(prompt) {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
            max_tokens: 4096,
        });
        return response.choices[0]?.message?.content || "{}";
    }
    async generateText(prompt, temperature = 0.3) {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature,
            max_tokens: 8192,
        });
        return response.choices[0]?.message?.content || "";
    }
}
//# sourceMappingURL=llm-adapter.js.map