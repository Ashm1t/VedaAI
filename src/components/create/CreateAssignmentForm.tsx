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
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-gray-200 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-300"
            style={{ width: isGenerating ? `${progress}%` : "60%" }}
          />
        </div>

        {isGenerating ? (
          <GeneratingUI progress={progress} status={status} />
        ) : (
          <>
            {/* Assignment Details */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assignment Details
                </h2>
                <p className="text-sm text-gray-500">
                  Basic information about your assignment
                </p>
              </div>

              {/* Subject and Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder="e.g. Science"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => updateField("className", e.target.value)}
                    placeholder="e.g. Class X"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
              </div>

              <FileUploadZone />

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  placeholder="e.g. Photosynthesis"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    placeholder="Choose a chapter"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                      errors.dueDate
                        ? "border-red-300 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 bg-white focus:border-gray-300 focus:ring-gray-300"
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
                  <label className="text-sm font-bold text-gray-900">
                    Question Type
                  </label>
                  <div className="flex items-center gap-8 text-xs font-medium text-gray-500">
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
                <span className="text-gray-700">
                  Total Questions:{" "}
                  <span className="font-bold text-gray-900">
                    {totalQuestions}
                  </span>
                </span>
                <span className="text-gray-700">
                  Total Marks:{" "}
                  <span className="font-bold text-gray-900">{totalMarks}</span>
                </span>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Additional Information{" "}
                  <span className="font-normal text-gray-400">
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
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
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
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {status === "queued" ? "Queued..." : "Generating Questions..."}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        AI is creating your question paper
      </p>
      <div className="w-64 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">{progress}%</p>
    </div>
  );
}
