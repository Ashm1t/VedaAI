"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[260px] flex flex-col">{children}</main>
    </div>
  );
}
