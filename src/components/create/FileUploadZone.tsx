"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useFormStore } from "@/store/formStore";

export default function FileUploadZone() {
  const { formData, updateField } = useFormStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        updateField("file", file);
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") updateField("fileType", "pdf");
        else updateField("fileType", "text");
      }
    },
    [updateField]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = () => {
    updateField("file", null);
    updateField("fileType", undefined);
  };

  return (
    <div className="space-y-1">
      {formData.file ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {formData.file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(formData.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeFile}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-orange-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <svg
            className="mb-3 text-gray-400"
            width="32"
            height="32"
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
          <p className="text-sm text-gray-600 mb-1">
            Choose a file or drag & drop it here
          </p>
          <p className="text-xs text-gray-400 mb-3">
            JPEG, PNG, upto 10MB
          </p>
          <span className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            Browse Files
          </span>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
