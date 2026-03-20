"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="mb-8 flex items-center justify-center">
        <svg
          width="200"
          height="180"
          viewBox="0 0 200 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Document */}
          <rect
            x="50"
            y="20"
            width="80"
            height="100"
            rx="8"
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          <rect x="65" y="40" width="50" height="4" rx="2" fill="#D1D5DB" />
          <rect x="65" y="52" width="40" height="4" rx="2" fill="#D1D5DB" />
          <rect x="65" y="64" width="45" height="4" rx="2" fill="#D1D5DB" />
          <rect x="65" y="76" width="35" height="4" rx="2" fill="#D1D5DB" />
          <rect x="65" y="88" width="50" height="4" rx="2" fill="#D1D5DB" />

          {/* Magnifying glass */}
          <circle
            cx="130"
            cy="90"
            r="30"
            fill="#F9FAFB"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          <line
            x1="152"
            y1="112"
            x2="170"
            y2="130"
            stroke="#D1D5DB"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Red X */}
          <line
            x1="118"
            y1="78"
            x2="142"
            y2="102"
            stroke="#EF4444"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="142"
            y1="78"
            x2="118"
            y2="102"
            stroke="#EF4444"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        No assignments yet
      </h2>
      <p className="max-w-md text-center text-sm text-gray-500 mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Link
        href="/assignments/create"
        className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Create Your First Assignment
      </Link>
    </div>
  );
}
