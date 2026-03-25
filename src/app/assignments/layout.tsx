"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
    <div className="min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: hidden on mobile, shown on desktop */}
      <div className={`hidden md:block`}>
        <Sidebar />
      </div>

      {/* Mobile slide-in sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar mobile onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#121212]/90 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1DB954]">
            <span className="text-black font-bold text-sm">L</span>
          </div>
          <span className="text-base font-bold text-white">Libra</span>
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#282828]">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="#B3B3B3"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <main
        className="flex flex-col min-h-screen
          px-4 pt-14 pb-20
          md:pb-0 md:px-0 md:pt-[78px] md:ml-[328px] md:mr-3"
      >
        {children}
      </main>

      {/* Mobile bottom nav + hamburger callback */}
      <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
    </AuthGuard>
  );
}
