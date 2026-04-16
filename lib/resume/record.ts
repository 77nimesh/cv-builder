import type { ResumeData, ResumePhotoShape, ResumeRecord } from "@/lib/types";
import { normalizeResumeData } from "@/lib/resume/normalizers";

type ResumeRecordSource = Omit<ResumeRecord, "data"> & {
  data: unknown;
};

function readPhotoShape(value: unknown): ResumePhotoShape | undefined {
  if (value === "circle" || value === "square") {
    return value;
  }

  return undefined;
}

function getPhotoShapeFromData(data: unknown): ResumePhotoShape | undefined {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return undefined;
  }

  const layout = (data as { layout?: { photoShape?: unknown } }).layout;
  return readPhotoShape(layout?.photoShape);
}

export function normalizeResumeRecord(record: ResumeRecordSource): ResumeRecord {
  return {
    ...record,
    data: normalizeResumeData(record.data, {
      template: record.template,
      themeColor: record.themeColor,
      fontFamily: record.fontFamily,
      photoShape: getPhotoShapeFromData(record.data),
    }),
  };
}

export function buildResumeUpdatePayload(
  resume: ResumeRecord,
  nextData: ResumeData = resume.data
) {
  const template = nextData.layout.template || resume.template || "modern-1";
  const themeColor =
    nextData.layout.themeColor ?? resume.themeColor ?? null;
  const fontFamily =
    nextData.layout.fontFamily ?? resume.fontFamily ?? null;
  const photoShape =
    nextData.layout.photoShape === "circle" ? "circle" : "square";

  const normalizedData = normalizeResumeData(nextData, {
    template,
    themeColor,
    fontFamily,
    photoShape,
  });

  return {
    title: resume.title,
    template,
    themeColor: themeColor ?? "",
    fontFamily: fontFamily ?? "",
    photoPath: resume.photoPath ?? "",
    photoShape,
    data: normalizedData,
  };
}