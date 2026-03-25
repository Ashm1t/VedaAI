"use client";

import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#282828] shadow-md">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#1DB954"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Coming Soon</h1>
        <p className="text-[#B3B3B3] mb-8">
          This feature is currently under development. Check back soon for
          updates!
        </p>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1DB954] px-6 py-3 text-sm font-semibold text-black shadow-md transition-colors hover:bg-[#1AA34A]"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Assignments
        </Link>
      </div>
    </div>
  );
}
