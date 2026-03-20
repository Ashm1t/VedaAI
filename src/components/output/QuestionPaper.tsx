import type { QuestionPaperOutput } from "@/types";
import StudentInfoSection from "./StudentInfoSection";
import SectionBlock from "./SectionBlock";
import AnswerKey from "./AnswerKey";

interface QuestionPaperProps {
  output: QuestionPaperOutput;
}

export default function QuestionPaper({ output }: QuestionPaperProps) {
  return (
    <div>
      {/* Question Paper Card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        {/* School Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold text-gray-900">
            {output.schoolName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Subject: {output.subject} | Class: {output.className}
          </p>
        </div>

        {/* Time & Marks Row */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-5 py-3 mb-4">
          <span className="text-sm text-gray-700">
            <span className="font-medium">Time Allowed:</span>{" "}
            {output.timeAllowed}
          </span>
          <span className="text-sm text-gray-700">
            <span className="font-medium">Maximum Marks:</span>{" "}
            {output.maximumMarks}
          </span>
        </div>

        {/* General Instructions */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            General Instructions:
          </h3>
          <p className="text-sm text-gray-600">{output.generalInstruction}</p>
        </div>

        {/* Student Info */}
        <StudentInfoSection />

        {/* Sections */}
        {output.sections.map((section) => (
          <SectionBlock key={section.label} section={section} />
        ))}
      </div>

      {/* Answer Key (collapsible, outside main paper) */}
      <AnswerKey sections={output.sections} />
    </div>
  );
}
