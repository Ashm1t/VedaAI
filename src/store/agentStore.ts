import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AgentArtifact,
  AgentEditorMode,
  AgentMessage,
  AgentSession,
  AgentSessionStatus,
} from "@/types";
import * as api from "@/services/agentService";

interface AgentState {
  sessionId: string | null;
  session: AgentSession | null;
  latestArtifact: AgentArtifact | null;
  editorMode: AgentEditorMode;
  editorContent: string;
  editorDirty: boolean;
  isInitializing: boolean;
  isSending: boolean;
  isUploading: boolean;
  error: string | null;
  initializeSession: () => Promise<void>;
  sendPrompt: (content: string) => Promise<void>;
  sendEditorDraft: (instruction?: string) => Promise<void>;
  submitGuidedResponse: (input: api.AgentMessageInput) => Promise<void>;
  uploadSourceFiles: (files: File[]) => Promise<void>;
  setEditorMode: (mode: AgentEditorMode) => void;
  setEditorContent: (content: string) => void;
  resetEditorContent: () => void;
  applyRemoteStatus: (status: AgentSessionStatus, error?: string | null) => void;
  applyRemoteMessage: (message: AgentMessage) => void;
  applyRemoteArtifact: (artifact: AgentArtifact) => void;
  applyRemoteSession: (session: AgentSession) => void;
  resetAgentState: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      session: null,
      latestArtifact: null,
      editorMode: "markdown",
      editorContent: "",
      editorDirty: false,
      isInitializing: false,
      isSending: false,
      isUploading: false,
      error: null,

      initializeSession: async () => {
        if (get().isInitializing) return;

        set({ isInitializing: true, error: null });

        try {
          let session = get().sessionId
            ? await api.fetchAgentSession(get().sessionId as string)
            : undefined;

          if (!session) {
            session = await api.createAgentSession();
          }

          const latestArtifact = await api.fetchLatestAgentArtifact(session.id);
          const baseline =
            latestArtifact?.latexSource ||
            session.currentTex ||
            session.sourceContextText ||
            "";

          set({
            sessionId: session.id,
            session,
            latestArtifact: latestArtifact || null,
            editorMode:
              latestArtifact?.latexSource || session.currentTex ? "latex" : "markdown",
            editorContent: baseline,
            editorDirty: false,
            isInitializing: false,
          });
        } catch (error) {
          console.error("Agent session initialization failed:", error);

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize agent session",
            isInitializing: false,
          });
        }
      },

      sendPrompt: async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || get().isSending) return;

        if (!get().session) {
          await get().initializeSession();
        }

        const session = get().session;
        if (!session) return;

        set({ isSending: true, error: null });

        try {
          const response = await api.sendAgentMessage(session.id, {
            content: trimmed,
          });

          set((state) => ({
            isSending: false,
            session: state.session
              ? {
                  ...state.session,
                  messages: [...state.session.messages, response.message],
                }
              : state.session,
          }));
        } catch (error) {
          console.error("Agent prompt failed:", error);

          set({
            error:
              error instanceof Error ? error.message : "Failed to send prompt",
            isSending: false,
          });
        }
      },

      sendEditorDraft: async (instruction) => {
        if (get().isSending) return;

        if (!get().session) {
          await get().initializeSession();
        }

        const session = get().session;
        if (!session) return;

        const editorContent = get().editorContent.trim();
        if (!editorContent) return;

        const editorMode = get().editorMode;
        const intent =
          instruction?.trim() ||
          "Use this edited source as the current document state, preserve the author's changes, and render an updated PDF.";

        const prompt = [
          `You are updating the current document from edited ${editorMode} source.`,
          intent,
          `Treat the following ${editorMode} source as authoritative for this turn:`,
          `\`\`\`${editorMode === "latex" ? "tex" : editorMode}`,
          editorContent,
          "```",
        ].join("\n\n");

        set({ isSending: true, error: null });

        try {
          const response = await api.sendAgentMessage(session.id, {
            content: prompt,
          });

          set((state) => ({
            isSending: false,
            session: state.session
              ? {
                  ...state.session,
                  messages: [...state.session.messages, response.message],
                }
              : state.session,
            editorDirty: false,
          }));
        } catch (error) {
          console.error("Agent source sync failed:", error);

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to send source draft",
            isSending: false,
          });
        }
      },

      submitGuidedResponse: async (input) => {
        const hasContent = Boolean(input.content?.trim());
        const hasTemplate = Boolean(input.selectedTemplateId?.trim());
        const hasAnswers = Boolean(
          input.answers &&
            Object.values(input.answers).some((value) => value.trim().length > 0)
        );

        if ((!hasContent && !hasTemplate && !hasAnswers) || get().isSending) {
          return;
        }

        if (!get().session) {
          await get().initializeSession();
        }

        const session = get().session;
        if (!session) return;

        set({ isSending: true, error: null });

        try {
          const response = await api.sendAgentMessage(session.id, input);

          set((state) => ({
            isSending: false,
            session: state.session
              ? {
                  ...state.session,
                  messages: [...state.session.messages, response.message],
                }
              : state.session,
          }));
        } catch (error) {
          console.error("Agent guided submission failed:", error);

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to submit document details",
            isSending: false,
          });
        }
      },

      uploadSourceFiles: async (files) => {
        if (files.length === 0 || get().isUploading) return;

        if (!get().session) {
          await get().initializeSession();
        }

        const session = get().session;
        if (!session) return;

        set({ isUploading: true, error: null });

        try {
          const response = await api.uploadAgentFiles(session.id, files);

          set((state) => ({
            isUploading: false,
            session: state.session
              ? {
                  ...state.session,
                  messages: [...state.session.messages, response.message],
                }
              : state.session,
          }));
        } catch (error) {
          console.error("Agent source upload failed:", error);

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload source files",
            isUploading: false,
          });
        }
      },

      setEditorMode: (mode) => set({ editorMode: mode }),

      setEditorContent: (content) => set({ editorContent: content, editorDirty: true }),

      resetEditorContent: () => {
        const session = get().session;
        const latestArtifact = get().latestArtifact;
        const baseline =
          latestArtifact?.latexSource || session?.currentTex || session?.sourceContextText || "";

        set({
          editorMode:
            latestArtifact?.latexSource || session?.currentTex ? "latex" : "markdown",
          editorContent: baseline,
          editorDirty: false,
        });
      },

      applyRemoteStatus: (status, error) =>
        set((state) => ({
          error: error || null,
          isSending: status === "processing",
          session: state.session
            ? {
                ...state.session,
                status,
                lastError: error || "",
              }
            : state.session,
        })),

      applyRemoteMessage: (message) =>
        set((state) => {
          if (!state.session) return state;

          const exists = state.session.messages.some((m) => m.id === message.id);
          if (exists) {
            return {
              session: {
                ...state.session,
                messages: state.session.messages.map((m) =>
                  m.id === message.id ? message : m
                ),
              },
              isSending: false,
            };
          }

          return {
            session: {
              ...state.session,
              messages: [...state.session.messages, message],
            },
            isSending: false,
          };
        }),

      applyRemoteArtifact: (artifact) =>
        set((state) => {
          const shouldRefreshEditor = !state.editorDirty && Boolean(artifact.latexSource);

          return {
            latestArtifact: artifact,
            editorMode: shouldRefreshEditor ? "latex" : state.editorMode,
            editorContent:
              shouldRefreshEditor && artifact.latexSource
                ? artifact.latexSource
                : state.editorContent,
            editorDirty: shouldRefreshEditor ? false : state.editorDirty,
            session: state.session
              ? {
                  ...state.session,
                  latestArtifactId: artifact.id,
                }
              : state.session,
          };
        }),

      applyRemoteSession: (session) =>
        set((state) => {
          const baseline = session.currentTex || session.sourceContextText || "";
          const shouldRefreshEditor = !state.editorDirty && Boolean(baseline);

          return {
            sessionId: session.id,
            editorMode:
              shouldRefreshEditor && session.currentTex
                ? "latex"
                : state.editorMode,
            editorContent: shouldRefreshEditor ? baseline : state.editorContent,
            editorDirty: shouldRefreshEditor ? false : state.editorDirty,
            session: state.session
              ? {
                  ...state.session,
                  ...session,
                }
              : session,
          };
        }),

      resetAgentState: () =>
        set({
          sessionId: null,
          session: null,
          latestArtifact: null,
          editorMode: "markdown",
          editorContent: "",
          editorDirty: false,
          isInitializing: false,
          isSending: false,
          isUploading: false,
          error: null,
        }),
    }),
    {
      name: "libra-agent-session",
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);
