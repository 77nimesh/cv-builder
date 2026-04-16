"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const CROP_SIZE = 320;
const OUTPUT_SIZE = 800;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1.15;

type PhotoCropperModalProps = {
  file: File;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => Promise<void> | void;
};

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildOutputFileName(originalName: string, mimeType: string) {
  const baseName = originalName.replace(/\.[^.]+$/, "") || "resume-photo";
  const extension =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : "jpg";

  return `${baseName}-cropped.${extension}`;
}

export default function PhotoCropperModal({
  file,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: PhotoCropperModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setImageUrl(nextUrl);
    setNaturalSize({ width: 0, height: 0 });
    setZoom(DEFAULT_ZOOM);
    setOffset({ x: 0, y: 0 });
    setErrorMessage("");

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel]);

  const baseScale = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) {
      return 1;
    }

    return Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height);
  }, [naturalSize.height, naturalSize.width]);

  const renderScale = baseScale * zoom;
  const displayWidth = naturalSize.width * renderScale;
  const displayHeight = naturalSize.height * renderScale;

  const clampOffset = useCallback(
    (nextOffset: Point): Point => {
      const maxOffsetX = Math.max(0, displayWidth - CROP_SIZE) / 2;
      const maxOffsetY = Math.max(0, displayHeight - CROP_SIZE) / 2;

      return {
        x: clamp(nextOffset.x, -maxOffsetX, maxOffsetX),
        y: clamp(nextOffset.y, -maxOffsetY, maxOffsetY),
      };
    },
    [displayHeight, displayWidth]
  );

  useEffect(() => {
    setOffset((currentOffset) => clampOffset(currentOffset));
  }, [clampOffset]);

  function handleImageLoad() {
    const image = imageRef.current;

    if (!image) {
      return;
    }

    setNaturalSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!naturalSize.width || !naturalSize.height) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;

    setOffset(
      clampOffset({
        x: dragStartRef.current.offsetX + deltaX,
        y: dragStartRef.current.offsetY + deltaY,
      })
    );
  }

  function endDragging(event?: ReactPointerEvent<HTMLDivElement>) {
    if (event && pointerIdRef.current === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerIdRef.current = null;
    dragStartRef.current = null;
    setIsDragging(false);
  }

  async function handleConfirm() {
    try {
      setErrorMessage("");

      const image = imageRef.current;

      if (!image || !naturalSize.width || !naturalSize.height) {
        throw new Error("Image is still loading. Please try again.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Failed to prepare cropped image.");
      }

      const topLeftX = (CROP_SIZE - displayWidth) / 2 + offset.x;
      const topLeftY = (CROP_SIZE - displayHeight) / 2 + offset.y;
      const rawSourceX = (0 - topLeftX) / renderScale;
      const rawSourceY = (0 - topLeftY) / renderScale;
      const rawSourceSize = CROP_SIZE / renderScale;

      const sourceSize = Math.min(
        rawSourceSize,
        naturalSize.width,
        naturalSize.height
      );

      const sourceX = clamp(rawSourceX, 0, Math.max(0, naturalSize.width - sourceSize));
      const sourceY = clamp(rawSourceY, 0, Math.max(0, naturalSize.height - sourceSize));

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      const outputMimeType =
        file.type === "image/png" || file.type === "image/webp"
          ? file.type
          : "image/jpeg";

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputMimeType, 0.92);
      });

      if (!blob) {
        throw new Error("Failed to create cropped image.");
      }

      const croppedFile = new File(
        [blob],
        buildOutputFileName(file.name, outputMimeType),
        {
          type: outputMimeType,
        }
      );

      await onConfirm(croppedFile);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to crop photo"
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Crop Profile Photo</h3>
            <p className="mt-1 text-sm text-slate-500">
              Drag the image to reposition it inside the crop area, then use zoom if
              needed.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex justify-center">
            <div
              className={`relative h-[320px] w-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDragging}
              onPointerCancel={endDragging}
              style={{ touchAction: "none" }}
            >
              {imageUrl ? (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    left: `${(CROP_SIZE - displayWidth) / 2 + offset.x}px`,
                    top: `${(CROP_SIZE - displayHeight) / 2 + offset.y}px`,
                  }}
                />
              ) : null}

              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
              <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border-2 border-white/90 shadow-[0_0_0_999px_rgba(15,23,42,0.34)]" />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Zoom
              </label>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
              <p className="mt-2 text-xs text-slate-500">
                Current zoom: {zoom.toFixed(2)}x
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setZoom(DEFAULT_ZOOM);
                setOffset({ x: 0, y: 0 });
              }}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 disabled:opacity-60"
            >
              Reset Position
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !naturalSize.width || !naturalSize.height}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Uploading Cropped Photo..." : "Crop and Upload"}
            </button>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              The final output is generated from this crop, then uploaded using the
              same local photo flow you already have.
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}