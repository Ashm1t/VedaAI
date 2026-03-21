"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Assignment } from "@/types";
import { useAssignmentStore } from "@/store/assignmentStore";

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const deleteAssignment = useAssignmentStore((s) => s.deleteAssignment);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleCardClick = () => {
    if (assignment.outputId) {
      router.push(`/assignments/${assignment.id}/output`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    await deleteAssignment(assignment.id);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow ${
        assignment.outputId ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between mb-8">
        <h3 className="text-base font-semibold text-gray-900 pr-4">
          {assignment.title}
        </h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" fill="#6B7280" />
              <circle cx="12" cy="12" r="1.5" fill="#6B7280" />
              <circle cx="12" cy="19" r="1.5" fill="#6B7280" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-xl bg-white border border-gray-200 shadow-lg py-1">
              {assignment.outputId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    router.push(`/assignments/${assignment.id}/output`);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  View Assignment
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Assigned on: {formatDate(assignment.assignedOn)}</span>
        {assignment.dueDate && (
          <span>Due: {formatDate(assignment.dueDate)}</span>
        )}
      </div>
    </div>
  );
}
