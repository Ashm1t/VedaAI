import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProfileState {
  // Profile
  name: string;
  initials: string;
  // School
  schoolName: string;
  schoolLocation: string;
  // Preferences
  language: string;
  // Actions
  updateProfile: (data: Partial<Omit<ProfileState, "updateProfile">>) => void;
}

function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      initials: "",
      schoolName: "Delhi Public School",
      schoolLocation: "Bokaro Steel City",
      language: "English",

      updateProfile: (data) =>
        set((state) => {
          const next = { ...state, ...data };
          // Auto-derive initials from name if initials wasn't explicitly set
          if (data.name !== undefined && data.initials === undefined) {
            next.initials = deriveInitials(data.name);
          }
          return next;
        }),
    }),
    {
      name: "libra-profile",
    }
  )
);
