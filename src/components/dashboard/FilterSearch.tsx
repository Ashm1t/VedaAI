"use client";

interface FilterSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterSearch({
  searchQuery,
  onSearchChange,
}: FilterSearchProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Filter Dropdown */}
      <button className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#282828] px-4 py-2 text-sm text-[#B3B3B3] hover:bg-[#333] transition-colors">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Filter By
      </button>

      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727272]"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search Assignment"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-[#333] bg-[#282828] py-2 pl-10 pr-4 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50"
        />
      </div>
    </div>
  );
}
