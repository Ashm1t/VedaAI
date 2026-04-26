"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AgentClarificationQuestion } from "@/types";
import { useAgentStore } from "@/store/agentStore";

function QuestionField(props: {
  question: AgentClarificationQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  const { question, value, onChange } = props;

  if (question.type === "long_text") {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={question.placeholder}
        className="min-h-[88px] w-full rounded-xl border border-[#2d2d2d] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#6f6f6f] outline-none transition focus:border-[#4C8DFF]"
      />
    );
  }

  if (question.type === "single_select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#2d2d2d] bg-[#151515] px-3 py-2 text-sm text-white outline-none transition focus:border-[#4C8DFF]"
      >
        <option value="">Select an option</option>
        {(question.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      className="w-full rounded-xl border border-[#2d2d2d] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#6f6f6f] outline-none transition focus:border-[#4C8DFF]"
    />
  );
}

export default function ChatPanel({ embedded = false }: { embedded?: boolean }) {
  const [input, setInput] = useState("");
  const [guidedNote, setGuidedNote] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const session = useAgentStore((state) => state.session);
  const isInitializing = useAgentStore((state) => state.isInitializing);
  const isSending = useAgentStore((state) => state.isSending);
  const isUploading = useAgentStore((state) => state.isUploading);
  const error = useAgentStore((state) => state.error);
  const sendPrompt = useAgentStore((state) => state.sendPrompt);
  const submitGuidedResponse = useAgentStore(
    (state) => state.submitGuidedResponse
  );
  const uploadSourceFiles = useAgentStore((state) => state.uploadSourceFiles);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const workflow = session?.workflow;
  const sourceFiles = session?.sourceFiles || [];

  useEffect(() => {
    if (!workflow) {
      setSelectedTemplateId("");
      setGuidedAnswers({});
      setGuidedNote("");
      return;
    }

    setSelectedTemplateId(workflow.selectedTemplateId || "");
    setGuidedAnswers(workflow.answers || {});
    setGuidedNote("");
  }, [workflow]);

  const statusLabel = useMemo(() => {
    if (isInitializing) return "Loading";
    if (workflow?.stage === "template_selection") return "Choose template";
    if (workflow?.stage === "clarification") return "Awaiting details";
    if (workflow?.stage === "drafting" || session?.status === "processing") {
      return "Drafting";
    }
    if (session?.status === "error") return "Error";
    if (session?.status === "ready") return "Ready";
    return "Ready";
  }, [isInitializing, session?.status, workflow?.stage]);

  const messages = session?.messages || [];
  const showWorkflowPanel =
    workflow && workflow.stage !== "ready" && workflow.stage !== "idle";
  const requiredMissingCount = workflow?.missingInformation.length || 0;
  const canSubmitGuided = Boolean(
    selectedTemplateId ||
      guidedNote.trim() ||
      Object.values(guidedAnswers).some((value) => value.trim())
  );

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    await sendPrompt(trimmed);
    setInput("");
  }

  async function handleGuidedSubmit() {
    if (!workflow) return;

    await submitGuidedResponse({
      content: guidedNote.trim(),
      selectedTemplateId,
      answers: guidedAnswers,
    });
    setGuidedNote("");
  }

  async function handleFileSelection(files: FileList | null) {
    if (!files || files.length === 0) return;

    await uploadSourceFiles(Array.from(files));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      {!embedded && (
        <div className="flex items-center gap-2 border-b border-[#333] px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-[#4C8DFF]" />
          <h2 className="text-sm font-semibold text-white">Agent</h2>
          <span className="text-xs text-[#727272]">{statusLabel}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const isAssistant = message.role !== "user";

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}
            >
              {isAssistant && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#4C8DFF] text-xs font-bold text-black">
                  A
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                  isAssistant
                    ? "bg-[#282828] text-[#B3B3B3]"
                    : "border border-[#285AA8] bg-[#12233F] text-[#EDF4FF]"
                }`}
              >
                {message.content}
              </div>

              {!isAssistant && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#333] text-xs font-bold text-white">
                  Y
                </div>
              )}
            </div>
          );
        })}

        {showWorkflowPanel && workflow && (
          <div className="rounded-2xl border border-[#2d2d2d] bg-[#171717] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6f6f6f]">
                  Guided Draft
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white capitalize">
                  {workflow.documentMode.replace(/_/g, " ")}
                </h3>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  {workflow.promptSummary}
                </p>
              </div>
              <div className="rounded-full border border-[#244F8F] bg-[#102746] px-2.5 py-1 text-[11px] text-[#9EC4FF]">
                {requiredMissingCount > 0
                  ? `${requiredMissingCount} detail${
                      requiredMissingCount === 1 ? "" : "s"
                    } left`
                  : "Ready to draft"}
              </div>
            </div>

            {workflow.templateOptions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-[#b8b8b8]">
                  Template shortlist
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {workflow.templateOptions.map((option) => {
                    const isSelected = selectedTemplateId === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(option.id)}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          isSelected
                            ? "border-[#285AA8] bg-[#12233F]"
                            : "border-[#2d2d2d] bg-[#141414] hover:border-[#3b3b3b]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">
                            {option.name}
                          </span>
                          <span className="rounded-full border border-[#2d2d2d] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#909090]">
                            {option.type}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#8d8d8d]">
                          {option.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#7a7a7a]">
                          {option.subject ? (
                            <span className="rounded-full border border-[#2d2d2d] px-2 py-0.5">
                              {option.subject}
                            </span>
                          ) : null}
                          <span className="rounded-full border border-[#2d2d2d] px-2 py-0.5">
                            {option.documentClass}
                          </span>
                          {option.compileSafe ? (
                            <span className="rounded-full border border-[#244F8F] bg-[#102746] px-2 py-0.5 text-[#9EC4FF]">
                              compile-safe
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {workflow.questions.length > 0 && (
              <div className="mt-4 grid gap-3">
                {workflow.questions.map((question) => (
                  <label key={question.id} className="grid gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#b8b8b8]">
                      <span>{question.label}</span>
                      {question.required && (
                        <span className="text-[#9EC4FF]">*</span>
                      )}
                    </div>
                    <p className="text-[11px] leading-5 text-[#777]">
                      {question.prompt}
                    </p>
                    <QuestionField
                      question={question}
                      value={guidedAnswers[question.id] || ""}
                      onChange={(value) =>
                        setGuidedAnswers((current) => ({
                          ...current,
                          [question.id]: value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="grid gap-1.5">
                <span className="text-xs text-[#b8b8b8]">Additional notes</span>
                <textarea
                  rows={3}
                  value={guidedNote}
                  onChange={(event) => setGuidedNote(event.target.value)}
                  placeholder="Any extra instructions about tone, emphasis, or formatting?"
                  className="min-h-[88px] w-full rounded-xl border border-[#2d2d2d] bg-[#151515] px-3 py-2 text-sm text-white placeholder-[#6f6f6f] outline-none transition focus:border-[#4C8DFF]"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-[#727272]">
                The agent will draft only after the required details are filled.
              </p>
              <button
                type="button"
                onClick={() => void handleGuidedSubmit()}
                disabled={!canSubmitGuided || isInitializing || isSending}
                className="rounded-xl bg-[#4C8DFF] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#3977EA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {workflow.stage === "drafting" || isSending
                  ? "Drafting..."
                  : "Generate draft"}
              </button>
            </div>
          </div>
        )}

        {sourceFiles.length > 0 && (
          <div className="rounded-2xl border border-[#262626] bg-[#151515] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6f6f6f]">
                  Source Context
                </p>
                <p className="mt-1 text-xs text-[#9a9a9a]">
                  Uploaded material the agent can read conversationally and use during drafting.
                </p>
              </div>
              <span className="rounded-full border border-[#2d2d2d] px-2.5 py-1 text-[11px] text-[#b8b8b8]">
                {sourceFiles.length} file{sourceFiles.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {sourceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#232323] bg-[#111] px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-white">{file.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#747474]">
                      {file.kind} · {file.extractedTextLength} chars
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                      file.status === "ready"
                        ? "border border-[#244F8F] bg-[#102746] text-[#9EC4FF]"
                        : "border border-red-500/30 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-[#333] px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-[#282828] px-3 py-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(event) => {
              void handleFileSelection(event.target.files);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3a3a3a] text-[#b3b3b3] transition hover:bg-[#333] disabled:opacity-40"
            disabled={isInitializing || isSending || isUploading}
            title="Attach PDF, DOCX, text, or images"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l9.2-9.19a3.5 3.5 0 114.95 4.95l-9.19 9.2a1.5 1.5 0 11-2.12-2.12l8.49-8.49"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              showWorkflowPanel
                ? "Add an extra instruction or ask a follow-up..."
                : "Ask the agent..."
            }
            className="flex-1 bg-transparent text-sm text-white placeholder-[#727272] outline-none"
          />
          <button
            onClick={() => void handleSend()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4C8DFF] text-black transition-all hover:bg-[#3977EA] disabled:opacity-40"
            disabled={!input.trim() || isInitializing || isSending || isUploading}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
