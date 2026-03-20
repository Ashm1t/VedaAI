import type { QuestionSection } from "@/types";
import QuestionItem from "./QuestionItem";

interface SectionBlockProps {
  section: QuestionSection;
}

export default function SectionBlock({ section }: SectionBlockProps) {
  return (
    <div className="mt-6">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">
          Section {section.label} — {section.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 italic">
          {section.instruction}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {section.questions.map((q) => (
          <QuestionItem key={q.number} question={q} />
        ))}
      </div>
    </div>
  );
}
