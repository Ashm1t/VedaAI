"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useFormStore } from "@/store/formStore";

export default function FileUploadZone() {
  const { formData, updateField } = useFormStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const merged = [...formData.files, ...acceptedFiles];
        updateField("files", merged);
        const ext = acceptedFiles[0].name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") updateField("fileType", "pdf");
        else updateField("fileType", "image");
      }
    },
    [updateField, formData.files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    const updated = formData.files.filter((_, i) => i !== index);
    updateField("files", updated);
    if (updated.length === 0) updateField("fileType", undefined);
  };

  const removeAll = () => {
    updateField("files", []);
    updateField("fileType", undefined);
  };

  return (
    <div className="space-y-2">
      {/* Dropzone — always visible */}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-[#1DB954]/10"
            : "border-[#333] bg-[#282828] hover:border-[#555]"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mb-2 text-[#727272]"
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-[#B3B3B3] mb-0.5">
          Choose files or drag & drop here
        </p>
        <p className="text-xs text-[#727272] mb-2">
          JPEG, PNG, PDF — up to 10MB each
        </p>
        <span className="rounded-lg border border-[#555] px-4 py-1.5 text-sm font-medium text-[#B3B3B3] hover:bg-[#333] transition-colors">
          Browse Files
        </span>
      </div>

      {/* File list */}
      {formData.files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#B3B3B3]">
              {formData.files.length} file{formData.files.length > 1 ? "s" : ""} selected
            </p>
            <button
              onClick={removeAll}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Remove all
            </button>
          </div>
          {formData.files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-[#333] bg-[#282828] px-3 py-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#333]">
                {file.type.startsWith("image/") ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#727272" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="2" stroke="#727272" strokeWidth="1.5" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#727272" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-[#727272]">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#333] transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[#727272] text-center">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
