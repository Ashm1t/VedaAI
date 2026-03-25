"use client";

import { useState, useEffect } from "react";
import { useProfileStore } from "@/store/profileStore";

const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Gujarati",
  "Punjabi",
  "Urdu",
];

export default function SettingsPage() {
  const profile = useProfileStore();

  // Local form state — only syncs to store on save
  const [name, setName] = useState(profile.name);
  const [initials, setInitials] = useState(profile.initials);
  const [schoolName, setSchoolName] = useState(profile.schoolName);
  const [schoolLocation, setSchoolLocation] = useState(profile.schoolLocation);
  const [language, setLanguage] = useState(profile.language);
  const [saved, setSaved] = useState(false);

  // Keep local state in sync if store hydrates after mount
  useEffect(() => {
    setName(profile.name);
    setInitials(profile.initials);
    setSchoolName(profile.schoolName);
    setSchoolLocation(profile.schoolLocation);
    setLanguage(profile.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-derive initials preview from name while typing
  const previewInitials = initials || derivedInitials(name) || "?";

  function derivedInitials(n: string) {
    return n
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function handleSave() {
    profile.updateProfile({
      name,
      initials: initials || derivedInitials(name),
      schoolName,
      schoolLocation,
      language,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const hasChanges =
    name !== profile.name ||
    initials !== profile.initials ||
    schoolName !== profile.schoolName ||
    schoolLocation !== profile.schoolLocation ||
    language !== profile.language;

  return (
    <div className="py-6 md:py-8 px-4 md:px-6 max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#B3B3B3] mt-1">
          Manage your profile, school info, and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Profile Section ── */}
        <section className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="text-base font-semibold text-white mb-5">Profile</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1DB954 0%, #0f7a33 100%)" }}
            >
              {previewInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {name || "Your Name"}
              </p>
              <p className="text-xs text-[#727272] mt-0.5">
                Initials shown across the app
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#B3B3B3] mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl bg-[#282828] border border-[#333] text-white placeholder-[#555] px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B3B3B3] mb-2 uppercase tracking-wide">
                Custom Initials{" "}
                <span className="normal-case text-[#555]">(optional — auto-generated from name)</span>
              </label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
                placeholder={derivedInitials(name) || "RS"}
                maxLength={3}
                className="w-28 rounded-xl bg-[#282828] border border-[#333] text-white placeholder-[#555] px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ── School Info Section ── */}
        <section className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="text-base font-semibold text-white mb-5">School</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#B3B3B3] mb-2 uppercase tracking-wide">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Delhi Public School"
                className="w-full rounded-xl bg-[#282828] border border-[#333] text-white placeholder-[#555] px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B3B3B3] mb-2 uppercase tracking-wide">
                City / Location
              </label>
              <input
                type="text"
                value={schoolLocation}
                onChange={(e) => setSchoolLocation(e.target.value)}
                placeholder="e.g. Bokaro Steel City"
                className="w-full rounded-xl bg-[#282828] border border-[#333] text-white placeholder-[#555] px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ── Preferences Section ── */}
        <section className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="text-base font-semibold text-white mb-5">Preferences</h2>

          <div>
            <label className="block text-xs font-medium text-[#B3B3B3] mb-2 uppercase tracking-wide">
              Output Language
            </label>
            <p className="text-xs text-[#555] mb-3">
              Language used in generated question papers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all border ${
                    language === lang
                      ? "bg-[#1DB954]/15 border-[#1DB954] text-[#1DB954]"
                      : "bg-[#282828] border-[#333] text-[#B3B3B3] hover:border-[#444] hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Save Button ── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-xs text-[#555]">
            Saved locally in your browser.
          </p>
          <button
            onClick={handleSave}
            disabled={!hasChanges && !saved}
            className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              saved
                ? "bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40"
                : hasChanges
                ? "bg-[#1DB954] text-black hover:bg-[#1AA34A] active:scale-95"
                : "bg-[#282828] text-[#555] cursor-not-allowed"
            }`}
          >
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
