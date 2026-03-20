import { create } from "zustand";
import type { Assignment, QuestionPaperOutput } from "@/types";
import * as api from "@/services/assignmentService";

interface AssignmentState {
  assignments: Assignment[];
  currentOutput: QuestionPaperOutput | null;
  isLoading: boolean;
  error: string | null;

  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  setCurrentOutput: (output: QuestionPaperOutput | null) => void;
  fetchOutput: (outputId: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  currentOutput: null,
  isLoading: false,
  error: null,

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.fetchAssignments();
      set({ assignments: data, isLoading: false });
    } catch {
      set({ error: "Failed to fetch assignments", isLoading: false });
    }
  },

  deleteAssignment: async (id: string) => {
    try {
      await api.deleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
      }));
    } catch {
      set({ error: "Failed to delete assignment" });
    }
  },

  setCurrentOutput: (output) => {
    set({ currentOutput: output });
  },

  fetchOutput: async (outputId: string) => {
    set({ isLoading: true });
    try {
      const output = await api.fetchQuestionPaper(outputId);
      set({ currentOutput: output || null, isLoading: false });
    } catch {
      set({ error: "Failed to fetch output", isLoading: false });
    }
  },
}));
