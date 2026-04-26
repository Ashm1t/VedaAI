"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAgentArtifactPdfBlob } from "@/services/agentService";
import { useAgentStore } from "@/store/agentStore";

const SAMPLE_PDF_PATH = "/Jake_s_Resume.pdf";

export default function PdfPreview() {
  const latestArtifact = useAgentStore((state) => state.latestArtifact);
  const sourceDocumentName = useAgentStore(
    (state) => state.session?.sourceDocumentName || "Jake_s_Resume.pdf"
  );
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPdf() {
      if (!latestArtifact?.id || !latestArtifact.hasPdf) {
        setArtifactUrl(null);
        return;
      }

      try {
        const blob = await fetchAgentArtifactPdfBlob(latestArtifact.id);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setArtifactUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setArtifactUrl(null);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [latestArtifact?.hasPdf, latestArtifact?.id]);

  const previewUrl = artifactUrl || SAMPLE_PDF_PATH;
  const downloadLabel = artifactUrl ? "Download PDF" : "Download sample";
  const subtitle = useMemo(() => {
    if (latestArtifact?.hasPdf) {
      return latestArtifact.title || "Generated preview";
    }

    return `Showing \`${sourceDocumentName}\``;
  }, [latestArtifact?.hasPdf, latestArtifact?.title, sourceDocumentName]);

  return (
    <div className="flex flex-col h-full bg-[#181818]">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path
              d="M7 21h10a2 2 0 002-2V9l-5-5H7a2 2 0 00-2 2v13a2 2 0 002 2z"
              stroke="#727272"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 4v5h5"
              stroke="#727272"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium text-[#B3B3B3]">PDF Preview</span>
        </div>

        <span className="hidden md:block text-xs text-[#727272] truncate max-w-[40%]">
          {subtitle}
        </span>

        <a
          href={previewUrl}
          download
          className="rounded-full border border-[#333] px-3 py-1 text-xs text-[#B3B3B3] transition hover:bg-[#282828] hover:text-white"
        >
          {downloadLabel}
        </a>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <iframe
          title="Jake resume preview"
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          className="h-full w-full rounded-xl border border-[#333] bg-white"
        />
      </div>
    </div>
  );
}
