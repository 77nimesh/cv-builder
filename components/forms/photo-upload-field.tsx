"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import PhotoCropperModal from "@/components/forms/photo-cropper-modal";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS_PER_USER = 5;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

type PhotoUploadSelection = {
  photoPath: string;
  photoAssetId: string | null;
};

type UploadResponse = {
  photoPath: string;
  photoAssetId: string;
  byteSize: number;
  width: number | null;
  height: number | null;
};

type LibraryAsset = {
  id: string;
  photoPath: string;
  sourceFileName: string | null;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
  resumeUsageCount: number;
  canDelete: boolean;
};

type LibraryResponse = {
  assets: LibraryAsset[];
};

type PhotoUploadFieldProps = {
  photoPath: string;
  photoAssetId: string | null;
  photoShape: "square" | "circle";
  onChange: (selection: PhotoUploadSelection) => void;
  onPhotoShapeChange: (photoShape: "square" | "circle") => void;
};

function formatBytes(byteSize: number) {
  if (byteSize < 1024) {
    return `${byteSize} B`;
  }

  if (byteSize < 1024 * 1024) {
    return `${(byteSize / 1024).toFixed(0)} KB`;
  }

  return `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
}

function formatUsageCount(count: number) {
  return count === 1 ? "Used by 1 resume" : `Used by ${count} resumes`;
}

export default function PhotoUploadField({
  photoPath,
  photoAssetId,
  photoShape,
  onChange,
  onPhotoShapeChange,
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
  const [lastUploadInfo, setLastUploadInfo] = useState<UploadResponse | null>(null);

  const assetCount = libraryAssets.length;
  const selectedLibraryAsset = photoAssetId
    ? libraryAssets.find((asset) => asset.id === photoAssetId) ?? null
    : null;
  const hasReachedLimit = assetCount >= MAX_PHOTOS_PER_USER;

  async function loadLibrary() {
    try {
      setIsLoadingLibrary(true);

      const response = await fetch("/api/image-assets", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error || "Failed to load image library");
      }

      const payload = (await response.json()) as LibraryResponse;
      setLibraryAssets(payload.assets);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load image library"
      );
    } finally {
      setIsLoadingLibrary(false);
    }
  }

  useEffect(() => {
    void loadLibrary();
  }, []);

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

      const payload = (await response.json()) as UploadResponse;
      setLastUploadInfo(payload);
      onChange({
        photoPath: payload.photoPath,
        photoAssetId: payload.photoAssetId,
      });
      setSelectedFile(null);
      resetInput();
      await loadLibrary();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAsset(asset: LibraryAsset) {
    if (!asset.canDelete || deletingAssetId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this photo from your library? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAssetId(asset.id);
      setErrorMessage("");

      const response = await fetch(`/api/image-assets/${asset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error || "Failed to delete image");
      }

      if (photoAssetId === asset.id) {
        onChange({
          photoPath: "",
          photoAssetId: null,
        });
      }

      setLibraryAssets((currentAssets) =>
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id)
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete image"
      );
    } finally {
      setDeletingAssetId(null);
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
              Upload JPG, PNG, or WebP up to 10MB. After selecting a photo, crop
              the required area and drag to reposition it before upload. The final
              cropped image is optimized on the server and stored as your canonical
              saved photo. You can also reuse previously uploaded photos from your
              library below.
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
              disabled={isUploading || hasReachedLimit}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              title={
                hasReachedLimit
                  ? "Delete an unused photo from your library to upload another one."
                  : undefined
              }
            >
              {isUploading
                ? "Uploading..."
                : photoPath
                  ? "Upload New Photo"
                  : "Upload Photo"}
            </button>

            {photoPath ? (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    photoPath: "",
                    photoAssetId: null,
                  })
                }
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

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Your photo library</h4>
              <p className="mt-1 text-sm text-slate-500">
                Reuse your uploaded photos across resumes. Only photos not used by
                any saved resume can be deleted.
              </p>
            </div>

            <div className="text-sm text-slate-600">
              {assetCount} / {MAX_PHOTOS_PER_USER} photos used
            </div>
          </div>

          {hasReachedLimit ? (
            <p className="mt-3 text-sm text-amber-700">
              Your library is full. Delete an unused photo to upload another one.
            </p>
          ) : null}

          {isLoadingLibrary ? (
            <p className="mt-4 text-sm text-slate-500">Loading image library...</p>
          ) : libraryAssets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No saved photos yet. Upload one to start your library.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {libraryAssets.map((asset) => {
                const isSelected = asset.id === photoAssetId;

                return (
                  <div
                    key={asset.id}
                    className={`rounded-2xl border bg-white p-3 shadow-sm transition ${
                      isSelected
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={asset.photoPath}
                        alt={asset.sourceFileName || "Saved photo"}
                        className="h-36 w-full object-cover"
                      />
                      {isSelected ? (
                        <span className="absolute left-2 top-2 rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                          Selected
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {asset.sourceFileName || "Saved photo"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(asset.byteSize)}
                        {asset.width && asset.height
                          ? ` · ${asset.width}×${asset.height}`
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        Added {new Date(asset.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        className={`text-xs ${
                          asset.canDelete ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {asset.canDelete
                          ? "Unused — safe to delete"
                          : formatUsageCount(asset.resumeUsageCount)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            photoPath: asset.photoPath,
                            photoAssetId: asset.id,
                          })
                        }
                        className={`rounded-xl px-3 py-2 text-sm ${
                          isSelected
                            ? "bg-slate-900 text-white"
                            : "border border-slate-300 text-slate-700"
                        }`}
                      >
                        {isSelected ? "Selected" : "Use this photo"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteAsset(asset)}
                        disabled={!asset.canDelete || deletingAssetId === asset.id}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          asset.canDelete
                            ? "Delete this photo from your library"
                            : "This photo is used by a saved resume and cannot be deleted"
                        }
                      >
                        {deletingAssetId === asset.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {photoPath ? (
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p className="break-all">{photoPath}</p>
            {photoAssetId ? <p>Asset ID: {photoAssetId}</p> : null}
            {selectedLibraryAsset ? (
              <p>
                Current library photo: {selectedLibraryAsset.sourceFileName || "Saved photo"}
              </p>
            ) : null}
            {lastUploadInfo ? (
              <p>
                Optimized output: {lastUploadInfo.width ?? "?"}×
                {lastUploadInfo.height ?? "?"} · {formatBytes(lastUploadInfo.byteSize)}
              </p>
            ) : null}
          </div>
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