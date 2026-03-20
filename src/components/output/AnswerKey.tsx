"use client";

import { useState } from "react";
import type { QuestionSection } from "@/types";

interface AnswerKeyProps {
  sections: QuestionSection[];
}

export default function AnswerKey({ sections }: AnswerKeyProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allQuestions = sections.flatMap((s) => s.questions);
  const hasAnswers = allQuestions.some((q) => q.answer);

  if (!hasAnswers) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900">Answer Key</span>
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          className={`text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                Section {section.label}
              </h4>
              <div className="space-y-3">
                {section.questions
                  .filter((q) => q.answer)
                  .map((q) => (
                    <div key={q.number} className="flex gap-3">
                      <span className="text-sm font-semibold text-gray-700 shrink-0">
                        {q.number}.
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
