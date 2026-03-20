"use client";

import type { Assignment } from "@/types";
import AssignmentCard from "./AssignmentCard";

interface AssignmentGridProps {
  assignments: Assignment[];
}

export default function AssignmentGrid({ assignments }: AssignmentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}
