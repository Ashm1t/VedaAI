import type { Question } from "@/types";

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-badge-easy-bg text-badge-easy-text",
  moderate: "bg-badge-moderate-bg text-badge-moderate-text",
  hard: "bg-badge-hard-bg text-badge-hard-text",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
};

interface QuestionItemProps {
  question: Question;
}

export default function QuestionItem({ question }: QuestionItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="text-sm font-semibold text-gray-700 mt-0.5 shrink-0">
        {question.number}.
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-relaxed">
          {question.text}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.easy
          }`}
        >
          {DIFFICULTY_LABELS[question.difficulty] || question.difficulty}
        </span>
        <span className="text-xs font-medium text-gray-500">
          [{question.marks} marks]
        </span>
      </div>
    </div>
  );
}
