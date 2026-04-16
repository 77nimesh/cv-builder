"use client";

import { useRef, useState, type ChangeEvent } from "react";

type PhotoUploadFieldProps = {
  photoPath: string;
  onChange: (photoPath: string) => void;
};

export default function PhotoUploadField({
  photoPath,
  onChange,
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/resume-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error || "Failed to upload photo");
      }

      const payload = (await response.json()) as { photoPath: string };
      onChange(payload.photoPath);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-medium text-slate-900">Profile Photo</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload JPG, PNG, or WebP up to 5MB. Save the resume after upload to
            persist the photo path.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:opacity-60"
          >
            {isUploading
              ? "Uploading..."
              : photoPath
                ? "Replace Photo"
                : "Upload Photo"}
          </button>

          {photoPath ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm text-red-600"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        {photoPath ? (
          <img
            src={photoPath}
            alt="Profile preview"
            className="h-32 w-32 rounded-2xl border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            No photo
          </div>
        )}
      </div>

      {photoPath ? (
        <p className="mt-3 break-all text-xs text-slate-500">{photoPath}</p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}