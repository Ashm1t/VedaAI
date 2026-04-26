"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Wraps protected pages. Redirects to /login if not authenticated.
 * Shows nothing while checking hydration to avoid flash.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (hydrated && !isAuthenticated && !isDev) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, isDev, router]);

  // Don't render anything until zustand has hydrated from localStorage
  if (!hydrated || (!isAuthenticated && !isDev)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#727272] text-sm">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
