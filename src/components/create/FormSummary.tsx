"use client";

import { useFormStore, getTotalQuestions, getTotalMarks } from "@/store/formStore";

export default function FormSummary() {
  const questionTypes = useFormStore((s) => s.formData.questionTypes);

  const totalQuestions = getTotalQuestions(questionTypes);
  const totalMarks = getTotalMarks(questionTypes);

  return (
    <div className="flex items-center gap-6 rounded-xl bg-gray-50 border border-gray-200 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Total Questions:</span>
        <span className="text-sm font-bold text-gray-900">{totalQuestions}</span>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Total Marks:</span>
        <span className="text-sm font-bold text-gray-900">{totalMarks}</span>
      </div>
    </div>
  );
}
