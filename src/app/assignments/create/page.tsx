"use client";

import Header from "@/components/layout/Header";
import CreateAssignmentForm from "@/components/create/CreateAssignmentForm";

export default function CreateAssignmentPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Create Assignment" showBack />
      <div className="flex-1 flex items-start justify-center p-8 pt-12">
        <CreateAssignmentForm />
      </div>
    </div>
  );
}
