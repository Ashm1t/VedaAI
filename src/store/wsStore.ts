import { create } from "zustand";
import type { GenerationStatus } from "@/types";

interface WsState {
  status: GenerationStatus;
  progress: number;
  setStatus: (status: GenerationStatus, progress: number) => void;
  reset: () => void;
}

export const useWsStore = create<WsState>((set) => ({
  status: "idle",
  progress: 0,

  setStatus: (status, progress) => set({ status, progress }),

  reset: () => set({ status: "idle", progress: 0 }),
}));
