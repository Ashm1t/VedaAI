"use client";

import Header from "@/components/layout/Header";
import CreateAssignmentForm from "@/components/create/CreateAssignmentForm";

export default function LegacyCreateAssignmentPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Create Legacy Assignment" showBack />
      <div className="flex-1 flex items-start justify-center p-8 pt-12">
        <CreateAssignmentForm />
      </div>
    </div>
  );
}
