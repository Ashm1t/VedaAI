"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import QuestionPaper from "@/components/output/QuestionPaper";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getPdfUrl } from "@/services/assignmentService";

export default function OutputPage() {
  const params = useParams();
  const id = params.id as string;

  const { currentOutput, isLoading, fetchOutput, assignments, fetchAssignments } =
    useAssignmentStore();

  useEffect(() => {
    if (assignments.length === 0) {
      fetchAssignments();
    }
  }, [assignments.length, fetchAssignments]);

  const assignment = assignments.find((a) => a.id === id);

  useEffect(() => {
    if (assignment?.outputId && currentOutput?.assignmentId !== id) {
      fetchOutput(assignment.outputId);
    }
  }, [assignment, currentOutput, fetchOutput, id]);

  const handleDownload = () => {
    if (currentOutput?.id) {
      // Try to open the backend-generated PDF
      window.open(getPdfUrl(currentOutput.id), "_blank");
    } else {
      // Fallback to browser print
      window.print();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Assignment Output" showBack />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#333] border-t-[#1DB954]" />
        </div>
      ) : !currentOutput ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[#727272]">No output found for this assignment.</p>
        </div>
      ) : (
        <div className="flex-1 p-8">
          {/* AI Summary Bar */}
          <div className="flex items-center justify-between rounded-2xl bg-[#181818] border border-[#282828] shadow-sm px-6 py-4 mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="text-primary"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#B3B3B3] truncate">
                {currentOutput.aiSummary}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-[#1DB954] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#1AA34A] transition-colors shrink-0 ml-4"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download as PDF
            </button>
          </div>

          {/* Question Paper */}
          <QuestionPaper output={currentOutput} />
        </div>
      )}
    </div>
  );
}
