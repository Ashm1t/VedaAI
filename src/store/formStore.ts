import { create } from "zustand";
import type { AssignmentFormData, QuestionTypeConfig } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface FormState {
  formData: AssignmentFormData;
  errors: Record<string, string>;

  updateField: <K extends keyof AssignmentFormData>(
    field: K,
    value: AssignmentFormData[K]
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (
    id: string,
    updates: Partial<QuestionTypeConfig>
  ) => void;
  validate: () => boolean;
  reset: () => void;
}

const initialFormData: AssignmentFormData = {
  title: "",
  subject: "",
  className: "",
  files: [],
  dueDate: "",
  questionTypes: [
    {
      id: uuidv4(),
      type: "mcq",
      label: "Multiple Choice Questions",
      numberOfQuestions: 4,
      marksPerQuestion: 1,
    },
    {
      id: uuidv4(),
      type: "short",
      label: "Short Answer Questions",
      numberOfQuestions: 3,
      marksPerQuestion: 2,
    },
  ],
  additionalInstructions: "",
  topic: "",
};

export const useFormStore = create<FormState>((set, get) => ({
  formData: { ...initialFormData },
  errors: {},

  updateField: (field, value) =>
    set((s) => ({
      formData: { ...s.formData, [field]: value },
      errors: { ...s.errors, [field]: "" },
    })),

  addQuestionType: () =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: [
          ...s.formData.questionTypes,
          {
            id: uuidv4(),
            type: "long",
            label: "Long Answer Questions",
            numberOfQuestions: 3,
            marksPerQuestion: 5,
          },
        ],
      },
    })),

  removeQuestionType: (id) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: s.formData.questionTypes.filter((q) => q.id !== id),
      },
    })),

  updateQuestionType: (id, updates) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: s.formData.questionTypes.map((q) =>
          q.id === id ? { ...q, ...updates } : q
        ),
      },
    })),

  validate: () => {
    const { formData } = get();
    const errors: Record<string, string> = {};

    if (!formData.dueDate) errors.dueDate = "Due date is required";

    if (formData.questionTypes.length === 0)
      errors.questionTypes = "Add at least one question type";

    formData.questionTypes.forEach((qt) => {
      if (qt.numberOfQuestions < 1)
        errors[`qt_${qt.id}_num`] = "Min 1 question";
      if (qt.marksPerQuestion < 1)
        errors[`qt_${qt.id}_marks`] = "Min 1 mark";
    });

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  reset: () =>
    set({
      formData: {
        ...initialFormData,
        questionTypes: initialFormData.questionTypes.map((q) => ({
          ...q,
          id: uuidv4(),
        })),
      },
      errors: {},
    }),
}));

// Derived helpers
export function getTotalQuestions(types: QuestionTypeConfig[]): number {
  return types.reduce((sum, qt) => sum + qt.numberOfQuestions, 0);
}

export function getTotalMarks(types: QuestionTypeConfig[]): number {
  return types.reduce(
    (sum, qt) => sum + qt.numberOfQuestions * qt.marksPerQuestion,
    0
  );
}
