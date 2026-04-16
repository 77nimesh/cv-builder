"use client";

import { useRef, useState, type ChangeEvent } from "react";
import PhotoCropperModal from "@/components/forms/photo-cropper-modal";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

type PhotoUploadFieldProps = {
  photoPath: string;
  photoShape: "square" | "circle";
  onChange: (photoPath: string) => void;
  onPhotoShapeChange: (photoShape: "square" | "circle") => void;
};

export default function PhotoUploadField({
  photoPath,
  photoShape,
  onChange,
  onPhotoShapeChange,
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadPhoto(file: File) {
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
      setSelectedFile(null);
      resetInput();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, and WebP images are supported");
      resetInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("Photo must be 10MB or smaller");
      resetInput();
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="font-medium text-slate-900">Profile Photo</h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload JPG, PNG, or WebP up to 10MB. After selecting a photo, crop the
              required area and drag to reposition it before upload. Save the resume
              after upload to persist the photo path and display style.
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

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {photoPath ? (
              <img
                src={photoPath}
                alt="Profile preview"
                className={`h-36 w-36 border border-slate-200 object-cover ${
                  photoShape === "circle" ? "rounded-full" : "rounded-[1.75rem]"
                }`}
              />
            ) : (
              <div
                className={`flex h-36 w-36 items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 ${
                  photoShape === "circle" ? "rounded-full" : "rounded-[1.75rem]"
                }`}
              >
                No photo
              </div>
            )}
          </div>

          <div className="w-full max-w-sm">
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Photo Shape
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onPhotoShapeChange("square")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  photoShape === "square"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-current/30 bg-current/10" />
                  <div>
                    <p className="text-sm font-medium">Square</p>
                    <p
                      className={`text-xs ${
                        photoShape === "square" ? "text-slate-200" : "text-slate-500"
                      }`}
                    >
                      Larger rounded square display
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onPhotoShapeChange("circle")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  photoShape === "circle"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-current/30 bg-current/10" />
                  <div>
                    <p className="text-sm font-medium">Circle</p>
                    <p
                      className={`text-xs ${
                        photoShape === "circle" ? "text-slate-200" : "text-slate-500"
                      }`}
                    >
                      Circular profile display
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              This setting changes how the photo is shown in the resume template.
              The uploaded image file remains the same.
            </p>
          </div>
        </div>

        {photoPath ? (
          <p className="mt-3 break-all text-xs text-slate-500">{photoPath}</p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      {selectedFile ? (
        <PhotoCropperModal
          file={selectedFile}
          isSubmitting={isUploading}
          onCancel={() => {
            setSelectedFile(null);
            resetInput();
          }}
          onConfirm={uploadPhoto}
        />
      ) : null}
    </>
  );
}