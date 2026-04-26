"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* ── Navigation items ── */
const NAV_ITEMS = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Agent", href: "/agent", icon: AgentIcon },
  { label: "Documents", href: "/legacy", icon: DocumentIcon },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  /* ── Mobile: slide-in drawer with icons + labels ── */
  if (mobile) {
    return (
      <aside className="flex h-full w-full flex-col bg-[#0d0d0d] border-r border-[#1e1e1e] px-3 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-2.5">
            <Image src="/libra.png" alt="Libra" width={28} height={28} className="rounded-lg" />
            <span className="text-base font-bold text-white">Libra</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = getIsActive(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1e2a3a] text-[#4C8DFF]"
                    : "text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <item.icon active={isActive} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 pt-4 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-[#444]">
            <LocalIcon />
            <span>Local workspace</span>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-[#1a1a1a] text-white"
                : "text-[#666] hover:bg-[#1a1a1a] hover:text-white"
            }`}
          >
            <SettingsIcon active={pathname === "/settings"} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    );
  }

  /* ── Desktop: 52px icon rail ── */
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[52px] flex-col items-center justify-between border-r border-[#1e1e1e] bg-[#0d0d0d] py-3">
      {/* Top: logo + nav */}
      <div className="flex flex-col items-center gap-1">
        <RailTooltip label="Libra">
          <Link
            href="/agent"
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#1a1a1a] transition-colors"
          >
            <Image src="/libra.png" alt="Libra" width={28} height={28} className="rounded-md" />
          </Link>
        </RailTooltip>

        <div className="my-1 h-px w-7 bg-[#1e1e1e]" />

        {NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item.href, pathname);
          return (
            <RailTooltip key={item.label} label={item.label}>
              <Link
                href={item.href}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#1e2a3a] text-[#4C8DFF]"
                    : "text-[#555] hover:bg-[#1a1a1a] hover:text-[#bbb]"
                }`}
              >
                <item.icon active={isActive} />
              </Link>
            </RailTooltip>
          );
        })}
      </div>

      {/* Bottom: local indicator + settings */}
      <div className="flex flex-col items-center gap-1">
        <RailTooltip label="Local workspace — files stay on your machine">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[#333] hover:text-[#555] transition-colors cursor-default">
            <LocalIcon />
          </div>
        </RailTooltip>

        <RailTooltip label="Settings">
          <Link
            href="/settings"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              pathname === "/settings"
                ? "bg-[#1a1a1a] text-white"
                : "text-[#555] hover:bg-[#1a1a1a] hover:text-[#bbb]"
            }`}
          >
            <SettingsIcon active={pathname === "/settings"} />
          </Link>
        </RailTooltip>
      </div>
    </aside>
  );
}

/* ── Helpers ── */

function getIsActive(href: string, pathname: string): boolean {
  if (href === "/agent") return pathname.startsWith("/agent");
  if (href === "/legacy")
    return (
      pathname.startsWith("/legacy") ||
      pathname.startsWith("/assignments") ||
      pathname.startsWith("/library")
    );
  return pathname === href;
}

function RailTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {children}
      <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg border border-[#2a2a2a] bg-[#161616] px-2.5 py-1.5 text-xs font-medium text-[#ccc] opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

/* ── Icons (18×18, stroke-based) ── */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
        stroke={active ? "#4C8DFF" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AgentIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        stroke={active ? "#4C8DFF" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        stroke={active ? "#4C8DFF" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        stroke={active ? "#ffffff" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        stroke={active ? "#ffffff" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocalIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
