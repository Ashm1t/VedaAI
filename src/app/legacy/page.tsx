import Link from "next/link";

const LEGACY_SECTIONS = [
  {
    title: "Assignments",
    description:
      "The original assignment creation and question-paper generation workflow.",
    href: "/legacy/assignments",
  },
  {
    title: "Library",
    description:
      "Previously generated question papers and downloadable legacy outputs.",
    href: "/legacy/library",
  },
];

export default function LegacyPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-8">
      <div className="w-full max-w-4xl rounded-[28px] border border-[#2A2A2A] bg-[#161616] p-6 shadow-2xl shadow-black/30 md:p-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2F3A2F] bg-[#162116] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#79D98B]">
            Legacy Surface
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            The old assignment generator lives here now.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A8A8A8]">
            Libra&apos;s main product is now the agent workspace. These screens are preserved so
            the earlier assignment product remains accessible without crowding the new
            direction.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {LEGACY_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-3xl border border-[#2A2A2A] bg-[#1B1B1B] p-5 transition-colors hover:border-[#3A4E3A] hover:bg-[#1F231F]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#222] text-[#79D98B] group-hover:bg-[#203220]">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M7 7h10M7 12h10M7 17h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#A8A8A8]">{section.description}</p>
              <div className="mt-5 text-sm font-medium text-[#79D98B]">Open legacy flow</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
