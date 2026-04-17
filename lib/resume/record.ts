import type { ResumePhotoShape, ResumeRecord } from "@/lib/types";
import { normalizeResumeData } from "@/lib/resume/normalizers";

type ResumeRecordSource = Omit<ResumeRecord, "data"> & {
  data: unknown;
};

type ResumeUpdateOverrides = {
  title?: string;
  template?: string | null;
  themeColor?: string | null;
  fontFamily?: string | null;
  photoPath?: string | null;
  photoShape?: ResumePhotoShape | null;
};

function normalizeRequiredString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeNullableString(
  value: unknown,
  fallback: string | null = null
): string | null {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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

function getBaseTemplate(resume: ResumeRecord): string {
  return normalizeRequiredString(
    resume.data.layout.template || resume.template,
    "modern-1"
  );
}

function getBaseThemeColor(resume: ResumeRecord): string | null {
  return resume.data.layout.themeColor ?? resume.themeColor ?? null;
}

function getBaseFontFamily(resume: ResumeRecord): string | null {
  return resume.data.layout.fontFamily ?? resume.fontFamily ?? null;
}

function getBasePhotoShape(resume: ResumeRecord): ResumePhotoShape {
  return getPhotoShapeFromData(resume.data) ?? "square";
}

export function normalizeResumeRecord(record: ResumeRecordSource): ResumeRecord {
  const normalizedData = normalizeResumeData(record.data, {
    template: record.template,
    themeColor: record.themeColor,
    fontFamily: record.fontFamily,
    photoShape: getPhotoShapeFromData(record.data),
  });

  return {
    ...record,
    title: normalizeRequiredString(record.title, "Untitled Resume"),
    template: normalizedData.layout.template,
    themeColor: normalizedData.layout.themeColor,
    fontFamily: normalizedData.layout.fontFamily,
    photoPath: normalizeNullableString(record.photoPath, null),
    data: normalizedData,
  };
}

export function buildResumeUpdatePayload(
  resume: ResumeRecord,
  nextData: unknown = resume.data,
  overrides: ResumeUpdateOverrides = {}
) {
  const template = normalizeRequiredString(
    overrides.template,
    getBaseTemplate(resume)
  );
  const themeColor =
    overrides.themeColor !== undefined
      ? normalizeNullableString(overrides.themeColor)
      : getBaseThemeColor(resume);
  const fontFamily =
    overrides.fontFamily !== undefined
      ? normalizeNullableString(overrides.fontFamily)
      : getBaseFontFamily(resume);
  const photoPath =
    overrides.photoPath !== undefined
      ? normalizeNullableString(overrides.photoPath)
      : resume.photoPath ?? null;
  const photoShape =
    readPhotoShape(overrides.photoShape) ?? getBasePhotoShape(resume);
  const title = normalizeRequiredString(
    overrides.title,
    normalizeRequiredString(resume.title, "Untitled Resume")
  );

  const normalizedData = normalizeResumeData(nextData, {
    template,
    themeColor,
    fontFamily,
    photoShape,
  });

  return {
    title,
    template: normalizedData.layout.template,
    themeColor: normalizedData.layout.themeColor,
    fontFamily: normalizedData.layout.fontFamily,
    photoPath,
    photoShape: normalizedData.layout.photoShape,
    data: normalizedData,
  };
}