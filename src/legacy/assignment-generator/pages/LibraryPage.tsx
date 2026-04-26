"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useAuthStore } from "@/store/authStore";
import { getPdfUrl } from "@/services/assignmentService";
import type { Assignment } from "@/types";

export default function LegacyLibraryPage() {
  const { assignments, fetchAssignments, isLoading } = useAssignmentStore();

  const [subjectFilter, setSubjectFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const generatedPapers = useMemo(
    () =>
      assignments.filter(
        (assignment) => assignment.status === "generated" && assignment.outputId,
      ),
    [assignments],
  );

  const subjects = useMemo(
    () => [
      "All",
      ...Array.from(new Set(generatedPapers.map((assignment) => assignment.subject))).sort(),
    ],
    [generatedPapers],
  );
  const classes = useMemo(
    () => [
      "All",
      ...Array.from(new Set(generatedPapers.map((assignment) => assignment.className))).sort(),
    ],
    [generatedPapers],
  );

  const filtered = useMemo(
    () =>
      generatedPapers.filter(
        (assignment) =>
          (subjectFilter === "All" || assignment.subject === subjectFilter) &&
          (classFilter === "All" || assignment.className === classFilter),
      ),
    [generatedPapers, subjectFilter, classFilter],
  );

  async function handleDownload(assignment: Assignment) {
    if (!assignment.outputId) return;
    setDownloadingId(assignment.id);
    try {
      const url = getPdfUrl(assignment.outputId);
      const token = useAuthStore.getState().token;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `${assignment.title.replace(/[^a-zA-Z0-9 ]/g, "")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="py-6 md:py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Legacy Library</h1>
          <p className="text-sm text-[#B3B3B3] mt-1">
            {generatedPapers.length} question paper
            {generatedPapers.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Link
          href="/legacy/assignments/create"
          className="flex items-center gap-2 rounded-xl bg-[#4C8DFF] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#3977EA] transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Paper
        </Link>
      </div>

      {generatedPapers.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <FilterSelect
            label="Subject"
            value={subjectFilter}
            options={subjects}
            onChange={setSubjectFilter}
          />
          <FilterSelect
            label="Class"
            value={classFilter}
            options={classes}
            onChange={setClassFilter}
          />
          {(subjectFilter !== "All" || classFilter !== "All") && (
            <button
              onClick={() => {
                setSubjectFilter("All");
                setClassFilter("All");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#282828] border border-[#333] px-3 py-2 text-xs font-medium text-[#B3B3B3] hover:text-white hover:border-[#444] transition-colors"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <LibrarySkeleton />
      ) : generatedPapers.length === 0 ? (
        <EmptyLibrary />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#B3B3B3] text-sm">No papers match the selected filters.</p>
          <button
            onClick={() => {
              setSubjectFilter("All");
              setClassFilter("All");
            }}
            className="mt-3 text-[#4C8DFF] text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((assignment) => (
            <PaperCard
              key={assignment.id}
              assignment={assignment}
              downloading={downloadingId === assignment.id}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PaperCard({
  assignment,
  downloading,
  onDownload,
}: {
  assignment: Assignment;
  downloading: boolean;
  onDownload: (assignment: Assignment) => void;
}) {
  const formattedDate = assignment.assignedOn
    ? new Date(assignment.assignedOn).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="group relative rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#333] transition-all hover:shadow-lg hover:shadow-black/30 overflow-hidden">
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #4C8DFF 0%, #2659B8 100%)" }}
      />

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-lg bg-[#4C8DFF]/10 border border-[#4C8DFF]/20 px-2.5 py-1 text-[11px] font-semibold text-[#4C8DFF] uppercase tracking-wide">
            {assignment.subject}
          </span>
          <span className="rounded-lg bg-[#282828] border border-[#333] px-2.5 py-1 text-[11px] font-medium text-[#B3B3B3]">
            Class {assignment.className}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-4 leading-snug">
          {assignment.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {formattedDate}
        </div>
      </div>

      <div className="flex border-t border-[#2A2A2A]">
        <Link
          href={`/legacy/assignments/${assignment.id}/output`}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium text-[#B3B3B3] hover:text-white hover:bg-[#282828]/50 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          View
        </Link>

        <div className="w-px bg-[#2A2A2A]" />

        <button
          onClick={() => onDownload(assignment)}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium text-[#B3B3B3] hover:text-white hover:bg-[#282828]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-xl bg-[#282828] border border-[#333] text-sm text-white pl-3 pr-8 py-2 focus:outline-none focus:border-[#4C8DFF] transition-colors cursor-pointer hover:border-[#444]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label}s` : option}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555]"
        width="12"
        height="12"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]">
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            stroke="#4C8DFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No papers yet</h3>
      <p className="text-sm text-[#B3B3B3] mb-6 max-w-xs">
        Generate your first question paper from an assignment to see it here.
      </p>
      <Link
        href="/legacy/assignments/create"
        className="inline-flex items-center gap-2 rounded-xl bg-[#4C8DFF] px-6 py-3 text-sm font-semibold text-black hover:bg-[#3977EA] transition-colors"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Create Assignment
      </Link>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden animate-pulse">
          <div className="h-1 bg-[#282828]" />
          <div className="p-5">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 rounded-lg bg-[#282828]" />
              <div className="h-5 w-16 rounded-lg bg-[#282828]" />
            </div>
            <div className="h-4 w-full rounded bg-[#282828] mb-2" />
            <div className="h-4 w-3/4 rounded bg-[#282828] mb-4" />
            <div className="h-3 w-24 rounded bg-[#282828]" />
          </div>
          <div className="h-10 border-t border-[#2A2A2A] bg-[#1A1A1A]" />
        </div>
      ))}
    </div>
  );
}
