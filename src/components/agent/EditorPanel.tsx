"use client";

import { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import FileTree from "./FileTree";
import TerminalPanel from "./TerminalPanel";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#1e1e1e] flex items-center justify-center">
      <span className="text-sm text-[#727272]">Loading editor...</span>
    </div>
  ),
});

export default function EditorPanel() {
  const [showTree, setShowTree] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#333] bg-[#181818]">
        <button
          onClick={() => setShowTree(!showTree)}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            showTree
              ? "bg-[#282828] text-white"
              : "text-[#727272] hover:bg-[#282828] hover:text-white"
          }`}
          title={showTree ? "Hide explorer" : "Show explorer"}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-xs text-[#727272]">document.tex</span>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 min-h-0">
        {showTree && <FileTree />}

        <div className="flex-1 h-full min-w-0">
          <Group orientation="vertical" className="h-full">
            <Panel defaultSize={70} minSize={30}>
              <CodeEditor />
            </Panel>

            <Separator
              style={{ height: 6, cursor: "row-resize", background: "#1a1a1a" }}
            />

            <Panel defaultSize={30} minSize={15} maxSize={50}>
              <TerminalPanel />
            </Panel>
          </Group>
        </div>
      </div>
    </div>
  );
}
