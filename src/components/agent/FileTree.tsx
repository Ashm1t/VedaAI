"use client";

const MOCK_FILES = [
  { name: "templates", type: "folder" as const, depth: 0, expanded: true },
  { name: "questionpaper.tex", type: "file" as const, depth: 1, active: false },
  { name: "homework.tex", type: "file" as const, depth: 1, active: false },
  { name: "output", type: "folder" as const, depth: 0, expanded: true },
  { name: "document.tex", type: "file" as const, depth: 1, active: true },
  { name: "document.pdf", type: "file" as const, depth: 1, active: false },
];

export default function FileTree() {
  return (
    <div className="w-[180px] h-full border-r border-[#333] bg-[#181818] overflow-y-auto flex-shrink-0">
      <div className="px-3 py-2 text-[10px] font-semibold text-[#727272] uppercase tracking-wider">
        Explorer
      </div>

      <div className="px-1">
        {MOCK_FILES.map((item, i) => (
          <button
            key={i}
            className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              item.active
                ? "bg-[#282828] text-white"
                : "text-[#B3B3B3] hover:bg-[#282828] hover:text-white"
            }`}
            style={{ paddingLeft: `${item.depth * 12 + 8}px` }}
          >
            <span className="w-3 text-center text-[10px] text-[#727272]">
              {item.type === "folder" ? (item.expanded ? "▾" : "▸") : ""}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
