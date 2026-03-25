"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}

function LoginContent() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to app
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/assignments");
    }
  }, [isAuthenticated, router]);

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      router.replace("/assignments");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/libra.png"
            alt="Libra"
            width={48}
            height={48}
            className="rounded-xl mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Welcome to Libra</h1>
          <p className="text-sm text-[#727272] mt-2 text-center">
            Sign in with your approved Google account to continue.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-[#B3B3B3]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </div>
            ) : (
              <>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-in failed.")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  width="300"
                  text="signin_with"
                />
              </>
            )}
          </div>

          {/* Info text */}
          <p className="mt-6 text-center text-xs text-[#555]">
            Only pre-approved accounts can sign in.
            <br />
            Contact your administrator for access.
          </p>
        </div>

        {/* Back to landing */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#727272] hover:text-white transition-colors"
          >
            &larr; Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
