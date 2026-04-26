"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar mobile onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#1e1e1e] md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1a1a1a] hover:text-white transition-colors"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">Libra</span>
      </div>

      <main className="flex flex-col min-h-screen px-4 pt-16 pb-20 md:pb-6 md:pt-6 md:px-6 md:ml-[52px]">
        {children}
      </main>

      <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}
