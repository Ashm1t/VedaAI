"use client";

import { useRouter } from "next/navigation";
import { useFormStore, getTotalQuestions, getTotalMarks } from "@/store/formStore";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useWsStore } from "@/store/wsStore";
import * as api from "@/services/assignmentService";
import { listenForGeneration } from "@/services/wsService";
import FileUploadZone from "./FileUploadZone";
import QuestionTypeRow from "./QuestionTypeRow";

export default function CreateAssignmentForm() {
  const router = useRouter();
  const {
    formData,
    errors,
    updateField,
    addQuestionType,
    validate,
    reset,
  } = useFormStore();

  const fetchAssignments = useAssignmentStore((s) => s.fetchAssignments);
  const { status, progress, setStatus, reset: resetWs } = useWsStore();

  const isGenerating = status === "queued" || status === "processing";

  const totalQuestions = getTotalQuestions(formData.questionTypes);
  const totalMarks = getTotalMarks(formData.questionTypes);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const assignment = await api.createAssignment(formData);

      setStatus("queued", 0);

      const stopListening = listenForGeneration(
        assignment.id,
        async (genStatus, genProgress) => {
          setStatus(genStatus, genProgress);

          if (genStatus === "done") {
            stopListening();
            await fetchAssignments();
            reset();
            resetWs();
            router.push(`/assignments/${assignment.id}/output`);
          }

          if (genStatus === "error") {
            stopListening();
            resetWs();
          }
        }
      );

      await api.triggerGeneration(assignment.id);
    } catch (err) {
      console.error("Failed to create assignment:", err);
      resetWs();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl bg-[#181818] border border-[#282828] shadow-sm p-8">
        {/* Two-step progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-[#1DB954]" />
          <div className="flex-1 h-1.5 rounded-full bg-[#333333]" />
        </div>

        {isGenerating ? (
          <GeneratingUI progress={progress} status={status} />
        ) : (
          <>
            {/* Assignment Details */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assignment Details
                </h2>
                <p className="text-sm text-[#B3B3B3]">
                  Basic information about your assignment
                </p>
              </div>

              {/* Subject and Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder="e.g. Science"
                    className="w-full rounded-lg border border-[#333] bg-[#282828] px-3 py-2.5 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => updateField("className", e.target.value)}
                    placeholder="e.g. Class X"
                    className="w-full rounded-lg border border-[#333] bg-[#282828] px-3 py-2.5 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50"
                  />
                </div>
              </div>

              <FileUploadZone />

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  placeholder="e.g. Photosynthesis"
                  className="w-full rounded-lg border border-[#333] bg-[#282828] px-3 py-2.5 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-bold text-white mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    placeholder="Choose a chapter"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder:text-[#727272] focus:outline-none focus:ring-1 ${
                      errors.dueDate
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                        : "border-[#333] bg-[#282828] focus:border-[#1DB954] focus:ring-[#1DB954]/50"
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>
                )}
              </div>

              {/* Question Type Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-white">
                    Question Type
                  </label>
                  <div className="flex items-center gap-8 text-xs font-medium text-[#B3B3B3]">
                    <span>No. of Questions</span>
                    <span>Marks</span>
                  </div>
                </div>

                {errors.questionTypes && (
                  <p className="text-sm text-red-500 mb-2">
                    {errors.questionTypes}
                  </p>
                )}

                <div className="space-y-3">
                  {formData.questionTypes.map((qt) => (
                    <QuestionTypeRow key={qt.id} config={qt} />
                  ))}
                </div>

                <button
                  onClick={addQuestionType}
                  className="flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                    +
                  </div>
                  Add Question Type
                </button>
              </div>

              {/* Summary */}
              <div className="flex flex-col items-end gap-0.5 text-sm">
                <span className="text-[#B3B3B3]">
                  Total Questions:{" "}
                  <span className="font-bold text-white">
                    {totalQuestions}
                  </span>
                </span>
                <span className="text-[#B3B3B3]">
                  Total Marks:{" "}
                  <span className="font-bold text-white">{totalMarks}</span>
                </span>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-bold text-white mb-1.5">
                  Additional Information{" "}
                  <span className="font-normal text-[#727272]">
                    (For better output)
                  </span>
                </label>
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) =>
                    updateField("additionalInstructions", e.target.value)
                  }
                  rows={3}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full rounded-lg border border-[#333] bg-[#282828] px-3 py-2.5 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50 resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-[#333]">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Generate Questions
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GeneratingUI({
  progress,
  status,
}: {
  progress: number;
  status: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#333] border-t-primary" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        {status === "queued" ? "Queued..." : "Generating Questions..."}
      </h3>
      <p className="text-sm text-[#B3B3B3] mb-6">
        AI is creating your question paper
      </p>
      <div className="w-64 h-2 rounded-full bg-[#333] overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[#727272]">{progress}%</p>
    </div>
  );
}
