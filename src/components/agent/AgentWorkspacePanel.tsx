"use client";

import { useMemo, useState } from "react";
import ChatPanel from "@/components/agent/ChatPanel";
import SourceEditorPanel from "@/components/agent/SourceEditorPanel";
import { useAgentStore } from "@/store/agentStore";

export default function AgentWorkspacePanel() {
  const [activePane, setActivePane] = useState<"chat" | "source">("chat");
  const session = useAgentStore((state) => state.session);
  const isInitializing = useAgentStore((state) => state.isInitializing);

  const statusLabel = useMemo(() => {
    if (isInitializing) return "Loading";
    if (session?.status === "processing") return "Working";
    if (session?.status === "error") return "Error";
    return "Ready";
  }, [isInitializing, session?.status]);

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      <div className="flex items-center gap-2 border-b border-[#333] px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <h2 className="text-sm font-semibold text-white">Agent Workspace</h2>
        <span className="text-xs text-[#727272]">{statusLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          {(["chat", "source"] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              onClick={() => setActivePane(pane)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                activePane === pane
                  ? "border-[var(--color-primary)] bg-[color:var(--color-primary-soft)] text-white"
                  : "border-[#333] text-[#8f8f8f] hover:border-[#4B5B73] hover:text-white"
              }`}
            >
              {pane === "chat" ? "Chat" : "Source"}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {activePane === "chat" ? <ChatPanel embedded /> : <SourceEditorPanel embedded />}
      </div>
    </div>
  );
}
