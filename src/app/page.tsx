"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const waitlistRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMockup = () => {
    mockupRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-x-hidden">
      <Navbar onCTAClick={scrollToWaitlist} onHowItWorks={scrollToMockup} />
      <Hero onCTAClick={scrollToWaitlist} onHowItWorks={scrollToMockup} />
      <AppMockup ref={mockupRef} />
      <HowItWorks />
      <UpcomingAgent />
      <WaitlistSection ref={waitlistRef} />
      <Footer />
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onCTAClick, onHowItWorks }: { onCTAClick: () => void; onHowItWorks: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-2.5"
      style={{ background: "rgba(18,18,18,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-3 items-center">
        {/* Logo — left */}
        <div className="flex items-center gap-2.5">
          <Image src="/libra.png" alt="Libra" width={28} height={28} className="rounded-md" />
          <span className="text-lg font-bold">Libra</span>
        </div>

        {/* Centre link — always page-centred */}
        <div className="hidden md:flex items-center justify-center">
          <button onClick={onHowItWorks} className="text-sm text-[#B3B3B3] hover:text-white transition-colors">
            How it works
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-end gap-3 col-start-3">
          <Link
            href="/login"
            className="hidden md:block text-sm text-[#B3B3B3] hover:text-white transition-colors"
          >
            Log in
          </Link>
          <button
            onClick={onCTAClick}
            className="rounded-full bg-[#1DB954] px-5 py-2 text-sm font-semibold text-black hover:bg-[#1AA34A] transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onCTAClick, onHowItWorks }: { onCTAClick: () => void; onHowItWorks: () => void }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center pt-16">
      {/* Minimal background — single subtle glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse, #1DB954 0%, transparent 70%)" }} />

      {/* Badge */}
      <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-1.5 text-xs font-medium text-[#1DB954]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954] animate-pulse" />
        Now in early access
      </div>

      {/* Main heading */}
      <h1 className="relative max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
        Create question papers
        <br />
        <span className="text-[#1DB954]">in minutes.</span>
        <br />
        <span className="text-[#B3B3B3]">Not hours.</span>
      </h1>

      {/* Subheading */}
      <p className="relative mt-6 max-w-xl text-lg text-[#727272] leading-relaxed">
        Upload your notes or syllabus. Libra reads them, understands your subject,
        and generates a complete, print-ready question paper — automatically.
      </p>

      {/* CTA buttons */}
      <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onCTAClick}
          className="flex items-center gap-2 rounded-full bg-[#1DB954] px-8 py-3.5 text-base font-semibold text-black hover:bg-[#1AA34A] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Get started
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full border border-[#333] px-8 py-3.5 text-base font-semibold text-[#B3B3B3] hover:border-[#555] hover:text-white transition-colors"
        >
          Log in
        </Link>
      </div>

      {/* Scroll indicator */}
      <button onClick={onHowItWorks} className="relative mt-20 flex flex-col items-center gap-2 text-[#727272] hover:text-[#B3B3B3] transition-colors">
        <span className="text-xs">See how it works</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="animate-bounce">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}

/* ── App Mockup ── */
const AppMockup = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => {
  const cards = [
    { title: "Geography - Geo", assigned: "21-03-2026", due: "21-04-2026" },
    { title: "Math - Math", assigned: "21-03-2026", due: "31-12-2026" },
    { title: "Bio Test - Bio", assigned: "21-03-2026", due: "22-08-2026" },
    { title: "Trees - Bio", assigned: "23-03-2026", due: "13-06-2026" },
  ];

  return (
    <section ref={ref} className="px-4 md:px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Everything in one place</h2>
        <p className="text-[#B3B3B3] max-w-lg mx-auto">
          A clean, focused workspace built for teachers. No clutter, no learning curve.
        </p>
      </div>

      {/* ── Desktop mockup (hidden on mobile) ── */}
      <div className="hidden md:block rounded-2xl overflow-hidden border border-[#282828] shadow-2xl"
        style={{ boxShadow: "0 0 80px rgba(29,185,84,0.06), 0 32px 64px rgba(0,0,0,0.5)" }}>
        {/* Browser bar */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-3 border-b border-[#282828]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C940]" />
          </div>
          <div className="flex-1 mx-4 rounded-md bg-[#282828] px-3 py-1 text-xs text-[#727272]">
            libra.app/assignments
          </div>
        </div>

        {/* Desktop App UI */}
        <div className="bg-[#121212] flex" style={{ height: 480 }}>
          {/* Sidebar */}
          <div className="w-56 shrink-0 bg-[#121212] border-r border-[#282828] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-6 rounded-md bg-[#1DB954] flex items-center justify-center">
                  <span className="text-black text-[8px] font-bold">L</span>
                </div>
                <span className="text-sm font-bold text-white">Libra</span>
              </div>
              <div className="mb-4 rounded-full border border-[#1DB954] p-0.5">
                <div className="rounded-full bg-[#1DB954] px-3 py-1.5 text-center text-[10px] font-semibold text-black">
                  + Create Assignment
                </div>
              </div>
              <div className="space-y-1">
                {["Home", "My Groups", "Assignments", "AI Toolkit", "My Library"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] ${i === 2 ? "bg-[#282828] text-white" : "text-[#727272]"}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-[#1DB954]" : "bg-[#333]"}`} />
                    {item}
                    {item === "Assignments" && (
                      <span className="ml-auto rounded-full bg-[#1DB954] px-1.5 text-[8px] font-bold text-black">9</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-[#282828] p-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#1DB954]">D</span>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-white">Delhi Public School</div>
                  <div className="text-[8px] text-[#727272]">Bokaro Steel City</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-5 rounded-xl px-4 py-2"
              style={{ background: "rgba(18,18,18,0.85)" }}>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-[#333]" />
                <span className="text-xs font-semibold text-white">Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#1DB954]">JD</span>
                </div>
                <span className="text-[10px] text-[#B3B3B3]">John Doe</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-[#1DB954]" />
              <span className="text-sm font-bold text-white">Assignments</span>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-1 rounded-lg border border-[#333] bg-[#282828] px-3 py-1.5">
                <div className="h-2.5 w-2.5 rounded bg-[#333]" />
                <span className="text-[9px] text-[#B3B3B3]">Filter By</span>
              </div>
              <div className="flex-1 rounded-lg border border-[#333] bg-[#282828] px-3 py-1.5">
                <span className="text-[9px] text-[#727272]">Search Assignment</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => (
                <div key={card.title} className="rounded-xl bg-[#181818] border border-[#282828] p-3">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-semibold text-white pr-2">{card.title}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(i => <div key={i} className="h-0.5 w-0.5 rounded-full bg-[#727272]" />)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-[#727272]">
                    <span>Assigned: {card.assigned}</span>
                    <span>Due: {card.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile mockup (hidden on desktop) ── */}
      <div className="md:hidden mx-auto" style={{ maxWidth: 320 }}>
        <div className="rounded-[2rem] overflow-hidden border-[3px] border-[#333] shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(29,185,84,0.06), 0 24px 48px rgba(0,0,0,0.5)" }}>
          {/* Phone status bar */}
          <div className="flex items-center justify-between bg-[#121212] px-5 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-white">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-3 rounded-sm bg-white/70" />
              <div className="h-2 w-2.5 rounded-sm bg-white/70" />
              <div className="h-2.5 w-5 rounded-sm border border-white/70 p-px"><div className="h-full w-3/4 rounded-sm bg-white/70" /></div>
            </div>
          </div>

          {/* App header */}
          <div className="bg-[#121212] px-4 py-3 flex items-center justify-between border-b border-[#282828]">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-[#1DB954] flex items-center justify-center">
                <span className="text-black text-[7px] font-bold">L</span>
              </div>
              <span className="text-xs font-bold text-white">Assignments</span>
            </div>
            <div className="h-6 w-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <span className="text-[7px] font-bold text-[#1DB954]">JD</span>
            </div>
          </div>

          {/* Content area */}
          <div className="bg-[#121212] px-4 py-3" style={{ minHeight: 420 }}>
            {/* Create button */}
            <div className="mb-3 rounded-full bg-[#1DB954] px-4 py-2 text-center text-[11px] font-semibold text-black">
              + Create Assignment
            </div>

            {/* Filter bar */}
            <div className="flex gap-2 mb-3">
              <div className="flex items-center gap-1 rounded-lg border border-[#333] bg-[#282828] px-2.5 py-1.5">
                <div className="h-2 w-2 rounded bg-[#333]" />
                <span className="text-[9px] text-[#B3B3B3]">Filter</span>
              </div>
              <div className="flex-1 rounded-lg border border-[#333] bg-[#282828] px-2.5 py-1.5">
                <span className="text-[9px] text-[#727272]">Search...</span>
              </div>
            </div>

            {/* Card list (single column for phone) */}
            <div className="space-y-2">
              {cards.map((card) => (
                <div key={card.title} className="rounded-xl bg-[#181818] border border-[#282828] p-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[11px] font-semibold text-white">{card.title}</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3].map(i => <div key={i} className="h-0.5 w-0.5 rounded-full bg-[#727272]" />)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#727272]">
                    <span>Assigned: {card.assigned}</span>
                    <span>Due: {card.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom nav bar */}
          <div className="bg-[#121212] border-t border-[#282828] px-4 py-2.5 flex items-center justify-around">
            {[
              { label: "Home", active: false },
              { label: "Tasks", active: true },
              { label: "Library", active: false },
              { label: "Settings", active: false },
            ].map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-0.5">
                <div className={`h-4 w-4 rounded ${tab.active ? "bg-[#1DB954]" : "bg-[#333]"}`} />
                <span className={`text-[8px] ${tab.active ? "text-[#1DB954] font-semibold" : "text-[#727272]"}`}>{tab.label}</span>
              </div>
            ))}
          </div>

          {/* Home indicator */}
          <div className="bg-[#121212] flex justify-center pb-2 pt-1">
            <div className="h-1 w-24 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── How It Works ── */
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload your material",
      description: "Upload images of your notes, textbook pages, or syllabus. Libra reads and understands them using OCR.",
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI generates your paper",
      description: "Libra analyses your content, identifies key concepts, and generates balanced questions across sections — all in under 2 minutes.",
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Download as PDF",
      description: "Get a professionally typeset question paper, ready to print. LaTeX-quality formatting, every time.",
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest">How it works</span>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Three steps. That&apos;s it.</h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#1DB954]/40 via-[#1DB954]/20 to-[#1DB954]/40" />

        {steps.map((step) => (
          <div key={step.number} className="relative flex flex-col items-center text-center p-6">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#181818] border border-[#282828] text-[#1DB954]">
              {step.icon}
              <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#1DB954] text-[10px] font-bold text-black">
                {step.number.replace("0", "")}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-[#727272] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Upcoming Agent ── */
function UpcomingAgent() {
  return (
    <section className="px-4 md:px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-1.5 text-xs font-semibold text-[#1DB954] uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954] animate-pulse" />
          Upcoming Feature
        </span>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">Meet the Agent</h2>
        <p className="mt-3 text-[#B3B3B3] max-w-lg mx-auto">
          Chat your way to a finished paper. Describe what you need and the Agent drafts, compiles, and previews it — live.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden border border-[#282828] shadow-2xl"
        style={{ boxShadow: "0 0 80px rgba(29,185,84,0.06), 0 32px 64px rgba(0,0,0,0.5)" }}
      >
        <Image
          src="/agent-preview.png"
          alt="Libra Agent preview"
          width={1900}
          height={900}
          className="w-full h-auto"
          priority={false}
        />
      </div>
    </section>
  );
}

/* ── Waitlist Section ── */
const WaitlistSection = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setState("success");
        setMessage(data.message);
        setEmail("");
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section ref={ref} className="relative px-6 py-32">
      <div className="relative max-w-2xl mx-auto text-center">
        <span className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest">Get started</span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
          Try Libra
          <br />
          <span className="text-[#1DB954]">for free.</span>
        </h2>
        <p className="mt-5 text-[#727272] text-lg max-w-md mx-auto">
          Enter your email to get instant access. Sign in with Google and start creating.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={state === "loading" || state === "success"}
            className="flex-1 rounded-full border border-[#333] bg-[#181818] px-5 py-3.5 text-sm text-white placeholder:text-[#727272] focus:border-[#1DB954] focus:outline-none focus:ring-2 focus:ring-[#1DB954]/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "success"}
            className="rounded-full bg-[#1DB954] px-7 py-3.5 text-sm font-semibold text-black hover:bg-[#1AA34A] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {state === "loading" ? "Setting up..." : state === "success" ? "Redirecting..." : "Get access"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${state === "success" ? "text-[#1DB954]" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <p className="mt-4 text-xs text-[#727272]">No credit card required. Free during early access.</p>
      </div>
    </section>
  );
};

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-[#282828] px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/libra.png" alt="Libra" width={20} height={20} className="rounded" />
          <span className="text-sm font-semibold">Libra</span>
          <span className="text-[#727272] text-sm ml-2">&copy; 2026</span>
        </div>

        <p className="text-sm text-[#727272]">AI-powered question paper generation for educators.</p>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full border border-[#333] px-4 py-2 text-sm text-[#B3B3B3] hover:border-[#1DB954] hover:text-[#1DB954] transition-colors"
        >
          Log in
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
