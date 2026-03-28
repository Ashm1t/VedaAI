/**
 * Compile a .tex string to PDF using pdflatex.
 * Returns the absolute path to the generated PDF.
 */
export declare function compileLaTeX(texContent: string, outputDir: string, documentId: string, timeout?: number): Promise<string>;
/**
 * Extract error summary from a compilation error message.
 */
export declare function extractErrorFromLog(errorMessage: string): string;
//# sourceMappingURL=compiler.d.ts.map