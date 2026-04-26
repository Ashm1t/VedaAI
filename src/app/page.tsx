"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      <Navbar onHowItWorks={scrollToHowItWorks} />
      <Hero onHowItWorks={scrollToHowItWorks} />
      <AppMockup />
      <HowItWorks ref={howItWorksRef} />
      <OpenSourceCTA />
      <Footer />
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 py-3"
      style={{
        background: "rgba(13,13,13,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="w-full px-5 md:px-10 grid grid-cols-3 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/libra.png" alt="Libra" width={26} height={26} className="rounded-md" />
          <span className="text-sm font-bold tracking-tight">Libra</span>
        </div>

        {/* Centre */}
        <div className="hidden md:flex items-center justify-center">
          <button
            onClick={onHowItWorks}
            className="text-xs text-[#666] hover:text-[#ccc] transition-colors"
          >
            How it works
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end">
          <Link
            href="/agent"
            className="flex items-center gap-1.5 rounded-full bg-[#4C8DFF] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#3977EA] transition-colors"
          >
            Open editor
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center pt-16">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[700px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse, #4C8DFF 0%, transparent 70%)" }}
      />

      {/* Open-source badge */}
      <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-[#4C8DFF]/25 bg-[#4C8DFF]/08 px-4 py-1.5 text-xs font-medium text-[#4C8DFF]">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Free and open-source
      </div>

      {/* Heading */}
      <h1 className="relative max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
        A document editor
        <br />
        <span className="text-[#4C8DFF]">that writes with you.</span>
      </h1>

      {/* Sub */}
      <p className="relative mt-6 max-w-lg text-base text-[#555] leading-relaxed md:text-lg">
        Libra is an open-source AI workspace for creating and editing LaTeX documents.
        No account. No subscription. Your files stay on your machine.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/agent"
          className="flex items-center gap-2 rounded-full bg-[#4C8DFF] px-8 py-3.5 text-sm font-semibold text-black hover:bg-[#3977EA] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Open the editor
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-[#222] px-8 py-3.5 text-sm font-semibold text-[#888] hover:border-[#444] hover:text-white transition-colors"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          View on GitHub
        </a>
      </div>

      {/* Scroll hint */}
      <button
        onClick={onHowItWorks}
        className="relative mt-20 flex flex-col items-center gap-2 text-[#333] hover:text-[#666] transition-colors"
      >
        <span className="text-[11px] tracking-widest uppercase">See how it works</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="animate-bounce">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}

/* ── App Mockup ── */
function AppMockup() {
  return (
    <section className="px-4 md:px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-2 text-white">Everything in one workspace</h2>
        <p className="text-[#555] text-sm max-w-md mx-auto">
          Agent chat, LaTeX editor, and live PDF preview — all in one split-pane interface.
        </p>
      </div>

      {/* Desktop mockup */}
      <div
        className="hidden md:block rounded-2xl overflow-hidden border border-[#1e1e1e]"
        style={{ boxShadow: "0 0 80px rgba(76,141,255,0.05), 0 32px 64px rgba(0,0,0,0.6)" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 bg-[#111] px-4 py-2.5 border-b border-[#1e1e1e]">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#333]" />
          </div>
          <div className="flex-1 mx-4 rounded-md bg-[#1a1a1a] px-3 py-1 text-[11px] text-[#444]">
            libr4.strangled.net/agent
          </div>
        </div>

        {/* App UI */}
        <div className="bg-[#0d0d0d] flex" style={{ height: 460 }}>
          {/* Icon rail */}
          <div className="w-[52px] shrink-0 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col items-center justify-between py-3">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-lg overflow-hidden mb-2">
                <div className="h-full w-full bg-[#4C8DFF] flex items-center justify-center">
                  <span className="text-black text-[9px] font-bold">L</span>
                </div>
              </div>
              <div className="my-0.5 h-px w-6 bg-[#1e1e1e]" />
              {/* Nav dots */}
              {[false, true, false].map((active, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                    active ? "bg-[#1e2a3a]" : ""
                  }`}
                >
                  <div className={`h-3 w-3 rounded-sm ${active ? "bg-[#4C8DFF]" : "bg-[#2a2a2a]"}`} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 rounded-sm bg-[#1e1e1e]" />
              </div>
            </div>
          </div>

          {/* Agent chat pane */}
          <div className="w-[38%] shrink-0 border-r border-[#1e1e1e] flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e1e1e]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4C8DFF]" />
              <span className="text-[10px] font-semibold text-white">Agent Workspace</span>
              <span className="ml-auto text-[9px] text-[#444]">Ready</span>
            </div>
            {/* Messages */}
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-[#4C8DFF] flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] font-bold text-black">A</span>
                </div>
                <div className="rounded-xl bg-[#1a1a1a] px-2.5 py-2 text-[10px] text-[#888] max-w-[80%] leading-relaxed">
                  Hello! I can help you create or edit LaTeX documents. What would you like to build?
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="rounded-xl border border-[#285AA8]/40 bg-[#12233F] px-2.5 py-2 text-[10px] text-[#9EC4FF] max-w-[80%]">
                  Create a mid-term exam paper for Grade 10 Physics
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-[#4C8DFF] flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] font-bold text-black">A</span>
                </div>
                <div className="rounded-xl bg-[#1a1a1a] px-2.5 py-2 text-[10px] text-[#888] max-w-[80%] leading-relaxed">
                  Drafting your Physics exam... selecting template and generating questions.
                </div>
              </div>
            </div>
            {/* Input */}
            <div className="border-t border-[#1e1e1e] px-3 py-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-2.5 py-1.5">
                <div className="flex-1 text-[10px] text-[#333]">Ask the agent...</div>
                <div className="h-5 w-5 rounded-md bg-[#4C8DFF] flex items-center justify-center">
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* PDF preview pane */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#1e1e1e]">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-sm bg-[#2a2a2a]" />
                <span className="text-[10px] font-medium text-[#666]">PDF Preview</span>
              </div>
              <div className="rounded-full border border-[#222] px-2 py-0.5 text-[9px] text-[#555]">
                Save to disk
              </div>
            </div>
            {/* PDF placeholder */}
            <div className="flex-1 p-3">
              <div className="h-full rounded-lg bg-white/[0.03] border border-[#1e1e1e] flex flex-col items-center pt-6 gap-2">
                {/* Fake document lines */}
                <div className="w-[70%] space-y-1.5">
                  <div className="h-2 rounded-full bg-[#1e1e1e] w-[60%] mx-auto" />
                  <div className="h-px bg-[#1a1a1a]" />
                  <div className="h-1.5 rounded-full bg-[#181818]" />
                  <div className="h-1.5 rounded-full bg-[#181818] w-[85%]" />
                  <div className="h-1.5 rounded-full bg-[#181818] w-[75%]" />
                  <div className="mt-2 h-1.5 rounded-full bg-[#181818] w-[90%]" />
                  <div className="h-1.5 rounded-full bg-[#181818]" />
                  <div className="h-1.5 rounded-full bg-[#181818] w-[80%]" />
                  <div className="mt-2 h-2 rounded-full bg-[#1e2a3a] w-[40%]" />
                  <div className="h-1.5 rounded-full bg-[#181818]" />
                  <div className="h-1.5 rounded-full bg-[#181818] w-[70%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile mockup */}
      <div className="md:hidden mx-auto" style={{ maxWidth: 300 }}>
        <div
          className="rounded-[2rem] overflow-hidden border-[2px] border-[#1e1e1e]"
          style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}
        >
          <div className="bg-[#0d0d0d] px-4 py-3 flex items-center justify-between border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-[#4C8DFF] flex items-center justify-center">
                <span className="text-black text-[7px] font-bold">L</span>
              </div>
              <span className="text-xs font-bold text-white">Libra</span>
            </div>
            <div className="h-5 w-5 rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="bg-[#0d0d0d] px-4 py-4" style={{ minHeight: 380 }}>
            <div className="mb-3 rounded-full bg-[#4C8DFF] px-4 py-2 text-center text-[11px] font-semibold text-black">
              Open Agent Editor
            </div>
            <div className="space-y-2">
              {["Physics Mid-Term Exam", "Math Assignment", "Biology Test"].map((title) => (
                <div key={title} className="rounded-xl bg-[#111] border border-[#1e1e1e] px-3 py-2.5">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-medium text-white">{title}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4C8DFF] mt-1" />
                  </div>
                  <p className="mt-1 text-[9px] text-[#444]">Generated by agent · PDF ready</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
const HowItWorks = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => {
  const steps = [
    {
      number: "01",
      title: "Describe your document",
      description:
        "Tell the agent what you need — an exam, an assignment, a report. Attach notes or a syllabus if you have one.",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            d="M8 10h8M8 14h5M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Agent drafts it in LaTeX",
      description:
        "Libra picks the best template, fills in your content, and compiles a clean PDF — in seconds, not hours.",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Save to your disk",
      description:
        "Download the PDF straight to your machine. No cloud storage, no account, no data leaving your control.",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-[10px] font-semibold text-[#4C8DFF] uppercase tracking-widest">
          How it works
        </span>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">Three steps. That&apos;s it.</h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#4C8DFF]/20 via-[#4C8DFF]/10 to-[#4C8DFF]/20" />

        {steps.map((step) => (
          <div key={step.number} className="relative flex flex-col items-center text-center p-6">
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111] border border-[#1e1e1e] text-[#4C8DFF]">
              {step.icon}
              <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4C8DFF] text-[9px] font-bold text-black">
                {step.number.replace("0", "")}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-xs text-[#555] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Open-source CTA (replaces waitlist) ── */
function OpenSourceCTA() {
  return (
    <section className="relative px-6 py-28">
      <div className="relative max-w-xl mx-auto text-center">
        {/* Subtle glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(ellipse, #4C8DFF 0%, transparent 70%)" }}
        />

        <span className="relative text-[10px] font-semibold text-[#4C8DFF] uppercase tracking-widest">
          Ready to start
        </span>
        <h2 className="relative mt-4 text-3xl font-extrabold md:text-4xl">
          Open the editor.
          <br />
          <span className="text-[#4C8DFF]">No sign-up required.</span>
        </h2>
        <p className="relative mt-5 text-[#555] text-sm max-w-sm mx-auto leading-relaxed">
          Free and open-source. Fork it, self-host it, or just use it.
          Your documents never leave your machine.
        </p>

        <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/agent"
            className="flex items-center gap-2 rounded-full bg-[#4C8DFF] px-8 py-3.5 text-sm font-semibold text-black hover:bg-[#3977EA] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Open editor
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-[#222] px-8 py-3.5 text-sm font-semibold text-[#777] hover:border-[#333] hover:text-white transition-colors"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-[#111] px-8 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/libra.png" alt="Libra" width={18} height={18} className="rounded opacity-70" />
          <span className="text-xs font-semibold text-[#444]">Libra</span>
          <span className="text-[#2a2a2a] text-xs ml-1">&copy; 2026</span>
        </div>

        <p className="text-xs text-[#333]">
          Open-source AI document editor · MIT License
        </p>

        <Link
          href="/agent"
          className="text-xs text-[#444] hover:text-[#4C8DFF] transition-colors"
        >
          Open editor →
        </Link>
      </div>
    </footer>
  );
}
