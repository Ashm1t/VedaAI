"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import EmptyState from "@/components/dashboard/EmptyState";
import AssignmentGrid from "@/components/dashboard/AssignmentGrid";
import FilterSearch from "@/components/dashboard/FilterSearch";
import { useAssignmentStore } from "@/store/assignmentStore";

export default function LegacyAssignmentsPage() {
  const { assignments, isLoading, fetchAssignments } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col flex-1">
      <Header title="Legacy Assignments" showBack />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#333] border-t-[#4C8DFF]" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2.5 w-2.5 rounded-full bg-[#4C8DFF]" />
              <h2 className="text-xl font-bold text-white">Legacy Assignments</h2>
            </div>
            <p className="text-sm text-[#B3B3B3]">
              The original question-paper workflow is preserved here for reference.
            </p>
          </div>

          <FilterSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <AssignmentGrid assignments={filtered} />

          <Link
            href="/legacy/assignments/create"
            className="fixed z-30 flex items-center justify-center gap-2 rounded-full text-black shadow-lg transition-opacity hover:opacity-90 bottom-24 right-5 h-14 w-14 md:bottom-8 md:right-8 md:h-auto md:w-auto md:px-6 md:py-3 md:rounded-full"
            style={{ backgroundColor: "#4C8DFF" }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden md:inline text-sm font-semibold">
              Create Assignment
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
