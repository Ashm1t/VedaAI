"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="hidden md:block">
        <Sidebar />
      </div>

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
      </div>

      <main
        className="flex flex-col min-h-screen
          px-4 pt-14 pb-20
          md:pb-0 md:px-0 md:pt-[78px] md:ml-[328px] md:mr-3"
      >
        {children}
      </main>

      <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}
