"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import EmptyState from "@/components/dashboard/EmptyState";
import AssignmentGrid from "@/components/dashboard/AssignmentGrid";
import FilterSearch from "@/components/dashboard/FilterSearch";
import { useAssignmentStore } from "@/store/assignmentStore";

export default function AssignmentsPage() {
  const { assignments, isLoading, fetchAssignments } =
    useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = assignments.length === 0;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Assignment" showBack />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="flex-1 p-8">
          {/* Section Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
            </div>
            <p className="text-sm text-gray-500">
              Manage and create assignments for your classes.
            </p>
          </div>

          <FilterSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <AssignmentGrid assignments={filtered} />

          {/* Floating Create Button */}
          <Link
            href="/assignments/create"
            className="fixed z-30 flex items-center justify-center gap-2 rounded-full text-white shadow-lg transition-opacity hover:opacity-90
              bottom-24 right-5 h-14 w-14
              md:bottom-8 md:right-8 md:h-auto md:w-auto md:px-6 md:py-3 md:rounded-full"
            style={{ backgroundColor: "#181818" }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden md:inline text-sm font-semibold">Create Assignment</span>
          </Link>
        </div>
      )}
    </div>
  );
}
