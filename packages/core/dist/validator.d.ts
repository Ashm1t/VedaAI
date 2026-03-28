import type { ValidationResult } from "./types.js";
export type { ValidationResult } from "./types.js";
export declare function validateLatex(tex: string): ValidationResult;
/**
 * Attempt to auto-fix common issues deterministically (no AI needed).
 */
export declare function autoFixLatex(tex: string): string;
//# sourceMappingURL=validator.d.ts.map