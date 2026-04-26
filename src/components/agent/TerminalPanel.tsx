"use client";

const MOCK_OUTPUT = [
  { type: "prompt" as const, text: "$ npm run dev" },
  {
    type: "output" as const,
    text: "  ready - started server on 0.0.0.0:3000",
  },
  {
    type: "output" as const,
    text: "  event - compiled client and server successfully in 2.3s",
  },
  {
    type: "success" as const,
    text: "  ✓ Ready on http://localhost:3000",
  },
  { type: "prompt" as const, text: "$ " },
];

export default function TerminalPanel() {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#333] bg-[#181818]">
        <span className="text-xs font-medium text-[#B3B3B3]">Terminal</span>
        <div className="flex items-center gap-1 ml-auto">
          <div className="h-2 w-2 rounded-full bg-[#4C8DFF]" />
          <span className="text-[10px] text-[#727272]">bash</span>
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-5">
        {MOCK_OUTPUT.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "prompt"
                ? "text-[#4C8DFF]"
                : line.type === "success"
                ? "text-[#4C8DFF]"
                : "text-[#B3B3B3]"
            }
          >
            {line.text}
            {i === MOCK_OUTPUT.length - 1 && (
              <span className="inline-block w-2 h-3.5 bg-[#B3B3B3] ml-0.5 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
