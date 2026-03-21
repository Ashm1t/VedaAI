"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAssignmentStore } from "@/store/assignmentStore";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "My Groups", href: "/coming-soon", icon: GroupIcon },
  { label: "Assignments", href: "/assignments", icon: AssignmentIcon },
  { label: "AI Teacher's Toolkit", href: "/coming-soon", icon: ToolkitIcon },
  { label: "My Library", href: "/coming-soon", icon: LibraryIcon },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const assignments = useAssignmentStore((s) => s.assignments);
  const assignmentCount = assignments.length;

  // Mobile: full-height drawer, no gap
  if (mobile) {
    return (
      <aside className="flex h-full flex-col bg-white justify-between p-6">
        <SidebarContent
          pathname={pathname}
          assignmentCount={assignmentCount}
          onNavigate={onClose}
        />
      </aside>
    );
  }

  // Desktop: floating box per Figma spec
  return (
    <aside
      className="fixed z-30 flex flex-col bg-white justify-between"
      style={{
        width: 304,
        height: "calc(100vh - 24px)",
        top: 12,
        left: 12,
        borderRadius: 16,
        padding: 24,
        boxShadow:
          "0 32px 48px rgba(0,0,0,0.20), 0 16px 48px rgba(0,0,0,0.12)",
      }}
    >
      <SidebarContent
        pathname={pathname}
        assignmentCount={assignmentCount}
      />
    </aside>
  );
}

/* ── Shared content used by both desktop & mobile sidebar ── */

interface SidebarContentProps {
  pathname: string;
  assignmentCount: number;
  onNavigate?: () => void;
}

function SidebarContent({ pathname, assignmentCount, onNavigate }: SidebarContentProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (label: string) => {
    setToast(`${label} — Coming Soon!`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <Image
            src="/vedaAI.png"
            alt="VedaAI"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span className="text-xl font-bold text-gray-900">VedaAI</span>
        </div>

        {/* Create Assignment Button */}
        <div className="gradient-border-btn mb-8">
          <Link
            href="/assignments/create"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#2c2c2c" }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Create Assignment</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/assignments"
                ? pathname.startsWith("/assignments")
                : pathname === item.href;

            const isPlaceholder = item.href === "/coming-soon";

            return isPlaceholder ? (
              <button
                key={item.label}
                onClick={() => showToast(item.label)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-700`}
              >
                <item.icon active={false} />
                <span>{item.label}</span>
                {item.label === "My Library" && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                    32
                  </span>
                )}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <item.icon active={isActive} />
                <span>{item.label}</span>
                {item.label === "Assignments" && assignmentCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                    {assignmentCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div>
        {/* Settings */}
        <button
          onClick={() => showToast("Settings")}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 mb-4"
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>

        {/* School Info */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-amber-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#92400E" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#92400E" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Delhi Public School
            </p>
            <p className="text-xs text-gray-500">Bokaro Steel City</p>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}

// --- Inline SVG Icons ---

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
        stroke={active ? "#111827" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GroupIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        stroke={active ? "#111827" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssignmentIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        stroke={active ? "#111827" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToolkitIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        stroke={active ? "#111827" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        stroke={active ? "#111827" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
