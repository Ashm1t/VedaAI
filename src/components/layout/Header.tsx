"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className="fixed z-20 hidden md:flex items-center justify-between"
      style={{
        height: 56,
        top: 12,
        left: 328,
        right: 12,
        borderRadius: 16,
        paddingLeft: 24,
        paddingRight: 12,
        background: "rgba(18,18,18,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#282828] transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M15 19l-7-7 7-7"
                stroke="#B3B3B3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              stroke="#727272"
              strokeWidth="1.5"
            />
          </svg>
          <h1 className="text-base font-semibold text-white">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[#282828] transition-colors">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="#B3B3B3"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* User Avatar + Name */}
        <button className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-[#282828] transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4C8DFF]/20 text-sm font-semibold text-[#4C8DFF]">
            JD
          </div>
          <span className="text-sm font-medium text-[#B3B3B3]">John Doe</span>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M19 9l-7 7-7-7"
              stroke="#727272"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
