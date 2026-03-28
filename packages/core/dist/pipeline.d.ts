import type { LLMAdapter, AssignmentFormData, GenerateResult, PipelineOptions, ProgressCallback } from "./types.js";
import { TemplateRegistry } from "./template-registry.js";
/**
 * Run the complete generation pipeline.
 * Pure function: takes data in, returns data out. No MongoDB, no Socket.io.
 */
export declare function runPipeline(llm: LLMAdapter, registry: TemplateRegistry, extractedText: string | null, formData: AssignmentFormData, options: PipelineOptions, onProgress?: ProgressCallback): Promise<GenerateResult>;
//# sourceMappingURL=pipeline.d.ts.map