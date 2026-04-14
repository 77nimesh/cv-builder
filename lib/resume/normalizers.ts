import type {
  PersonalDetails,
  ResumeData,
  ResumeFormData,
  ResumeSection,
  ResumeSectionItem,
  ResumeSectionType,
  ResumeZone,
} from "@/types/resume";
import {
  createDefaultResumeData,
  defaultPersonalDetails,
} from "@/lib/resume/defaults";

type ResumeNormalizationOptions = {
  template?: string | null;
  themeColor?: string | null;
  fontFamily?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readPosition(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readZone(value: unknown, fallback: ResumeZone): ResumeZone {
  return value === "main" || value === "sidebar" ? value : fallback;
}

function normalizePersonalDetailsContent(value: unknown): PersonalDetails {
  if (!isRecord(value)) {
    return { ...defaultPersonalDetails };
  }

  return {
    fullName: readString(value.fullName),
    email: readString(value.email),
    phone: readString(value.phone),
    location: readString(value.location),
    linkedIn: readString(value.linkedIn),
    website: readString(value.website),
  };
}

function normalizeSummaryContent(value: unknown): { text: string } {
  if (typeof value === "string") {
    return { text: value };
  }

  if (!isRecord(value)) {
    return { text: "" };
  }

  return {
    text: readString(value.text),
  };
}

function normalizeGenericContent(value: unknown): unknown {
  return value ?? {};
}

function buildNormalizedItem(
  sectionType: ResumeSectionType,
  rawItem: unknown,
  fallbackPosition: number
): ResumeSectionItem {
  const itemRecord = isRecord(rawItem) ? rawItem : null;
  const id = readString(itemRecord?.id, `${sectionType}-${fallbackPosition + 1}`);
  const position = readPosition(itemRecord?.position, fallbackPosition);
  const rawContent = itemRecord?.content ?? rawItem;

  switch (sectionType) {
    case "personal-details":
      return {
        id,
        position,
        content: normalizePersonalDetailsContent(rawContent),
      };
    case "summary":
      return {
        id,
        position,
        content: normalizeSummaryContent(rawContent),
      };
    default:
      return {
        id,
        position,
        content: normalizeGenericContent(rawContent),
      };
  }
}

function buildDefaultSectionTemplate(
  sectionType: ResumeSectionType
): ResumeSection {
  const defaultData = createDefaultResumeData();
  const section = defaultData.sections.find((item) => item.type === sectionType);

  if (!section) {
    throw new Error(`Missing default section template for ${sectionType}`);
  }

  return section;
}

function normalizeSectionItems(
  sectionType: ResumeSectionType,
  rawItems: unknown
): ResumeSectionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const defaultSection = buildDefaultSectionTemplate(sectionType);

    if (sectionType === "personal-details" || sectionType === "summary") {
      return defaultSection.items.map((item) => ({ ...item }));
    }

    return [];
  }

  return rawItems
    .map((item, index) => buildNormalizedItem(sectionType, item, index))
    .sort((left, right) => left.position - right.position)
    .map((item, index) => ({
      ...item,
      position: index,
      id: item.id || `${sectionType}-${index + 1}`,
    }));
}

function normalizeCanonicalSection(
  rawSection: unknown,
  defaultSection: ResumeSection,
  fallbackPosition: number
): ResumeSection {
  const sectionRecord = isRecord(rawSection) ? rawSection : {};

  return {
    id: readString(sectionRecord.id, defaultSection.id),
    type: defaultSection.type,
    title: readString(sectionRecord.title, defaultSection.title),
    zone: readZone(sectionRecord.zone, defaultSection.zone),
    position: readPosition(sectionRecord.position, fallbackPosition),
    visible: readBoolean(sectionRecord.visible, defaultSection.visible),
    items: normalizeSectionItems(defaultSection.type, sectionRecord.items),
  };
}

function normalizeCanonicalResumeData(
  value: ResumeData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
  });

  const meta = isRecord(value.meta) ? value.meta : {};
  const layout = isRecord(value.layout) ? value.layout : {};
  const sections = Array.isArray(value.sections) ? value.sections : [];

  return {
    meta: {
      language: readString(meta.language, defaults.meta.language),
      targetRole: readString(meta.targetRole, defaults.meta.targetRole),
    },
    layout: {
      template: readString(
        options.template ?? layout.template,
        defaults.layout.template
      ),
      themeColor: readNullableString(
        options.themeColor !== undefined ? options.themeColor : layout.themeColor
      ),
      fontFamily: readNullableString(
        options.fontFamily !== undefined ? options.fontFamily : layout.fontFamily
      ),
    },
    sections: defaults.sections
      .map((defaultSection, index) => {
        const rawSection = sections.find((section) => {
          if (!isRecord(section)) {
            return false;
          }

          return (
            section.type === defaultSection.type || section.id === defaultSection.id
          );
        });

        return normalizeCanonicalSection(rawSection, defaultSection, index);
      })
      .sort((left, right) => left.position - right.position)
      .map((section, index) => ({
        ...section,
        position: index,
      })),
  };
}

export function isCanonicalResumeData(value: unknown): value is ResumeData {
  return isRecord(value) && Array.isArray(value.sections);
}

export function buildResumeDataFromFormData(
  formData: ResumeFormData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
  });

  const sections = defaults.sections.map((section) => {
    switch (section.type) {
      case "personal-details":
        return {
          ...section,
          items: [
            {
              id: "personal-details-1",
              position: 0,
              content: normalizePersonalDetailsContent(formData.personal),
            },
          ],
        };
      case "summary":
        return {
          ...section,
          items: [
            {
              id: "summary-1",
              position: 0,
              content: normalizeSummaryContent(formData.summary),
            },
          ],
        };
      case "experience":
        return {
          ...section,
          items: normalizeSectionItems("experience", formData.experience),
        };
      case "education":
        return {
          ...section,
          items: normalizeSectionItems("education", formData.education),
        };
      case "skills":
        return {
          ...section,
          items: normalizeSectionItems("skills", formData.skills),
        };
      case "projects":
        return {
          ...section,
          items: normalizeSectionItems("projects", formData.projects),
        };
      case "certifications":
        return {
          ...section,
          items: normalizeSectionItems("certifications", formData.certifications),
        };
      default:
        return section;
    }
  });

  return normalizeCanonicalResumeData(
    {
      meta: defaults.meta,
      layout: defaults.layout,
      sections,
    },
    options
  );
}

export function normalizeResumeData(
  value: unknown,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  if (isCanonicalResumeData(value)) {
    return normalizeCanonicalResumeData(value, options);
  }

  const legacy = isRecord(value) ? value : {};

  return buildResumeDataFromFormData(
    {
      personal: normalizePersonalDetailsContent(legacy.personal),
      summary: readString(legacy.summary),
      experience: Array.isArray(legacy.experience) ? legacy.experience : [],
      education: Array.isArray(legacy.education) ? legacy.education : [],
      skills: Array.isArray(legacy.skills) ? legacy.skills : [],
      projects: Array.isArray(legacy.projects) ? legacy.projects : [],
      certifications: Array.isArray(legacy.certifications)
        ? legacy.certifications
        : [],
    },
    options
  );
}
