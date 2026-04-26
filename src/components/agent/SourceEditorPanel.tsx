"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import type { AgentEditorMode } from "@/types";
import { useAgentStore } from "@/store/agentStore";

const MODE_LABELS: Record<AgentEditorMode, string> = {
  markdown: "Markdown",
  latex: "LaTeX",
  text: "Plain text",
};

const MODE_LANGUAGES: Record<AgentEditorMode, string> = {
  markdown: "markdown",
  latex: "latex",
  text: "plaintext",
};

export default function SourceEditorPanel({ embedded = false }: { embedded?: boolean }) {
  const editorMode = useAgentStore((state) => state.editorMode);
  const editorContent = useAgentStore((state) => state.editorContent);
  const editorDirty = useAgentStore((state) => state.editorDirty);
  const isInitializing = useAgentStore((state) => state.isInitializing);
  const isSending = useAgentStore((state) => state.isSending);
  const setEditorMode = useAgentStore((state) => state.setEditorMode);
  const setEditorContent = useAgentStore((state) => state.setEditorContent);
  const resetEditorContent = useAgentStore((state) => state.resetEditorContent);
  const sendEditorDraft = useAgentStore((state) => state.sendEditorDraft);
  const [instruction, setInstruction] = useState("");

  const language = useMemo(() => MODE_LANGUAGES[editorMode], [editorMode]);

  async function handleSendEditorDraft() {
    await sendEditorDraft(instruction.trim());
    setInstruction("");
  }

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      {!embedded && (
        <div className="flex items-center justify-between gap-3 border-b border-[#333] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-white">Source</h2>
            <span className="text-xs text-[#727272]">
              Edit the draftable document state
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(["markdown", "latex", "text"] as AgentEditorMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setEditorMode(mode)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  editorMode === mode
                    ? "border-[var(--color-primary)] bg-[color:var(--color-primary-soft)] text-white"
                    : "border-[#333] text-[#A0A0A0] hover:border-[#4B5B73] hover:text-white"
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      )}

      {embedded && (
        <div className="border-b border-[#333] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["markdown", "latex", "text"] as AgentEditorMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setEditorMode(mode)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  editorMode === mode
                    ? "border-[var(--color-primary)] bg-[color:var(--color-primary-soft)] text-white"
                    : "border-[#333] text-[#A0A0A0] hover:border-[#4B5B73] hover:text-white"
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-[#333] px-4 py-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Optional instruction, e.g. tighten the tone or reformat the headings"
            className="rounded-xl border border-[#2d2d2d] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#6f6f6f] outline-none transition focus:border-[var(--color-primary)]"
          />
          <button
            type="button"
            onClick={resetEditorContent}
            disabled={!editorDirty || isInitializing || isSending}
            className="rounded-xl border border-[#333] px-4 py-2 text-sm text-[#B3B3B3] transition hover:border-[#4B5B73] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset to latest
          </button>
          <button
            type="button"
            onClick={() => void handleSendEditorDraft()}
            disabled={!editorContent.trim() || isInitializing || isSending}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-black transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending ? "Sending..." : "Send source to agent"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[#727272]">
          The PDF stays read-only. Edit the source here, then let the agent compile a refreshed draft.
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={editorContent}
          path={`document.${editorMode === "latex" ? "tex" : editorMode === "markdown" ? "md" : "txt"}`}
          theme="agent-dark"
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: "gutter",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            wordWrap: "on",
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
          onChange={(value) => setEditorContent(value || "")}
          onMount={(_editor, monaco) => {
            monaco.editor.defineTheme("agent-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {
                "editor.background": "#121212",
                "editorGutter.background": "#121212",
                "editor.lineHighlightBackground": "#1a1d24",
                "editorLineNumber.foreground": "#727272",
                "editorLineNumber.activeForeground": "#D8E4FF",
                "editorCursor.foreground": "#4C8DFF",
                "editor.selectionBackground": "#163B70",
                "editor.inactiveSelectionBackground": "#10294F",
              },
            });
          }}
        />
      </div>
    </div>
  );
}
