import type { AssignmentFormData, QuestionTypeConfig } from "../types.js";
/**
 * Step 1: Analyze source material.
 * Extracts structured info from OCR text for downstream question generation.
 */
export declare function buildAnalysisPrompt(extractedText: string, formData: AssignmentFormData): string;
/**
 * Step 2: Generate questions for ONE section type.
 * Called once per question type — focused, parallelizable.
 */
export declare function buildSectionPrompt(sectionLabel: string, questionType: string, questionTypeLabel: string, numberOfQuestions: number, marksPerQuestion: number, keyConcepts: string[], keyTerms: string[], difficultyGuide: string, subject: string, className: string, additionalInstructions: string, startingQuestionNumber: number): string;
export declare function selectTemplate(formData: AssignmentFormData): string;
/**
 * Compute cumulative starting question number for each section.
 */
export declare function computeStartingNumbers(questionTypes: QuestionTypeConfig[]): number[];
//# sourceMappingURL=template-selection.d.ts.map