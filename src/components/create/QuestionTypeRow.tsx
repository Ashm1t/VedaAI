"use client";

import type { QuestionTypeConfig, QuestionType } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";
import { useFormStore } from "@/store/formStore";

interface QuestionTypeRowProps {
  config: QuestionTypeConfig;
}

export default function QuestionTypeRow({ config }: QuestionTypeRowProps) {
  const { updateQuestionType, removeQuestionType } = useFormStore();

  const handleTypeChange = (type: QuestionType) => {
    updateQuestionType(config.id, {
      type,
      label: QUESTION_TYPE_LABELS[type],
    });
  };

  const increment = (field: "numberOfQuestions" | "marksPerQuestion") => {
    updateQuestionType(config.id, { [field]: config[field] + 1 });
  };

  const decrement = (field: "numberOfQuestions" | "marksPerQuestion") => {
    if (config[field] > 1) {
      updateQuestionType(config.id, { [field]: config[field] - 1 });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Type selector */}
      <div className="flex-1 min-w-0">
        <select
          value={config.type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeQuestionType(config.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Number of questions: -/+ stepper */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => decrement("numberOfQuestions")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          &minus;
        </button>
        <span className="w-8 text-center text-sm font-semibold text-gray-900">
          {config.numberOfQuestions}
        </span>
        <button
          onClick={() => increment("numberOfQuestions")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          +
        </button>
      </div>

      {/* Marks: -/+ stepper */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => decrement("marksPerQuestion")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          &minus;
        </button>
        <span className="w-8 text-center text-sm font-semibold text-gray-900">
          {config.marksPerQuestion}
        </span>
        <button
          onClick={() => increment("marksPerQuestion")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
