import type {
  BuiltInSectionVisibility,
  CertificationItem,
  CustomSectionEntry,
  CustomSectionFormSection,
  EducationItem,
  ExperienceItem,
  PersonalDetails,
  ProjectItem,
  ResumeData,
  ResumeFormData,
  ResumePhotoShape,
  ResumeSection,
  ResumeSectionItem,
  ResumeSectionType,
  ResumeZone,
  SkillItem,
} from "@/lib/types";
import {
  createDefaultResumeData,
  defaultBuiltInSectionVisibility,
  defaultCertificationItem,
  defaultCustomSectionEntry,
  defaultEducationItem,
  defaultExperienceItem,
  defaultPersonalDetails,
  defaultProjectItem,
  defaultSkillItem,
} from "@/lib/resume/defaults";

type ResumeNormalizationOptions = {
  template?: string | null;
  themeColor?: string | null;
  fontFamily?: string | null;
  photoShape?: ResumePhotoShape | null;
};

const CORRUPTED_ID_PATTERN = /<[^>]+>|[{}]/;

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

function readPhotoShape(
  value: unknown,
  fallback: ResumePhotoShape = "square"
): ResumePhotoShape {
  return value === "circle" ? "circle" : fallback;
}

function readIdString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function isBrokenGeneratedId(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return CORRUPTED_ID_PATTERN.test(trimmed);
}

function sanitizeIdPart(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
}

function sanitizeExistingId(value: string, fallback: string): string {
  if (isBrokenGeneratedId(value)) {
    return fallback;
  }

  return sanitizeIdPart(value, fallback);
}

function buildSafeItemId(prefix: string, position: number): string {
  const safePrefix = sanitizeIdPart(prefix, "item");
  return `${safePrefix}-${position + 1}`;
}

function buildSafeSectionId(position: number): string {
  return `custom-${position + 1}`;
}

function getUniqueId(baseId: string, seenIds: Set<string>): string {
  let nextId = baseId;
  let suffix = 2;

  while (seenIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  seenIds.add(nextId);
  return nextId;
}

function normalizePersonalDetailsContent(value: unknown): PersonalDetails {
  if (!isRecord(value)) {
    return { ...defaultPersonalDetails };
  }

  return {
    fullName: readString(value.fullName),
    headline: readString(value.headline, defaultPersonalDetails.headline),
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

function normalizeExperienceItem(value: unknown): ExperienceItem {
  if (!isRecord(value)) {
    return { ...defaultExperienceItem };
  }

  return {
    company: readString(value.company),
    role: readString(value.role),
    location: readString(value.location),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeEducationItem(value: unknown): EducationItem {
  if (!isRecord(value)) {
    return { ...defaultEducationItem };
  }

  return {
    institution: readString(value.institution),
    degree: readString(value.degree),
    location: readString(value.location),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeSkillItem(value: unknown): SkillItem {
  if (!isRecord(value)) {
    return { ...defaultSkillItem };
  }

  return {
    name: readString(value.name),
    level: readString(value.level),
  };
}

function normalizeProjectItem(value: unknown): ProjectItem {
  if (!isRecord(value)) {
    return { ...defaultProjectItem };
  }

  return {
    name: readString(value.name),
    role: readString(value.role),
    url: readString(value.url),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeCertificationItem(value: unknown): CertificationItem {
  if (!isRecord(value)) {
    return { ...defaultCertificationItem };
  }

  return {
    name: readString(value.name),
    issuer: readString(value.issuer),
    issueDate: readString(value.issueDate),
    credentialId: readString(value.credentialId),
    url: readString(value.url),
  };
}

function normalizeCustomSectionEntry(value: unknown): CustomSectionEntry {
  if (!isRecord(value)) {
    return { ...defaultCustomSectionEntry };
  }

  return {
    title: readString(value.title),
    subtitle: readString(value.subtitle),
    meta: readString(value.meta),
    description: readString(value.description),
  };
}

function buildNormalizedItem(
  sectionType: ResumeSectionType,
  rawItem: unknown,
  fallbackPosition: number,
  fallbackPrefix: string
): ResumeSectionItem {
  const itemRecord = isRecord(rawItem) ? rawItem : null;
  const rawId = readIdString(itemRecord?.id);
  const position = readPosition(itemRecord?.position, fallbackPosition);
  const fallbackId = buildSafeItemId(fallbackPrefix, position);
  const id = sanitizeExistingId(rawId, fallbackId);
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
    case "experience":
      return {
        id,
        position,
        content: normalizeExperienceItem(rawContent),
      };
    case "education":
      return {
        id,
        position,
        content: normalizeEducationItem(rawContent),
      };
    case "skills":
      return {
        id,
        position,
        content: normalizeSkillItem(rawContent),
      };
    case "projects":
      return {
        id,
        position,
        content: normalizeProjectItem(rawContent),
      };
    case "certifications":
      return {
        id,
        position,
        content: normalizeCertificationItem(rawContent),
      };
    case "custom":
      return {
        id,
        position,
        content: normalizeCustomSectionEntry(rawContent),
      };
    default:
      return {
        id,
        position,
        content: rawContent ?? {},
      };
  }
}

function buildDefaultSectionTemplate(
  sectionType: Exclude<ResumeSectionType, "custom">
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
  rawItems: unknown,
  fallbackPrefix: string
): ResumeSectionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    if (sectionType === "personal-details" || sectionType === "summary") {
      const defaultSection = buildDefaultSectionTemplate(
        sectionType as "personal-details" | "summary"
      );

      return defaultSection.items.map((item) => ({ ...item }));
    }

    return [];
  }

  const seenIds = new Set<string>();

  return rawItems
    .map((item, index) =>
      buildNormalizedItem(sectionType, item, index, fallbackPrefix)
    )
    .sort((left, right) => left.position - right.position)
    .map((item, index) => {
      const fallbackId = buildSafeItemId(fallbackPrefix, index);
      const baseId = sanitizeExistingId(item.id, fallbackId);
      const id = getUniqueId(baseId, seenIds);

      return {
        ...item,
        position: index,
        id,
      };
    });
}

function normalizeCanonicalSection(
  rawSection: unknown,
  defaultSection: ResumeSection,
  fallbackPosition: number
): ResumeSection {
  const sectionRecord = isRecord(rawSection) ? rawSection : {};

  return {
    id: defaultSection.id,
    type: defaultSection.type,
    title: readString(sectionRecord.title, defaultSection.title),
    zone: readZone(sectionRecord.zone, defaultSection.zone),
    position: readPosition(sectionRecord.position, fallbackPosition),
    visible: readBoolean(sectionRecord.visible, defaultSection.visible),
    items: normalizeSectionItems(
      defaultSection.type,
      sectionRecord.items,
      defaultSection.id
    ),
  };
}

function normalizeCustomSection(
  rawSection: unknown,
  fallbackPosition: number
): ResumeSection {
  const sectionRecord = isRecord(rawSection) ? rawSection : {};
  const fallbackId = buildSafeSectionId(fallbackPosition);
  const rawId = readIdString(sectionRecord.id);
  const id = sanitizeExistingId(rawId, fallbackId);

  return {
    id,
    type: "custom",
    title: readString(sectionRecord.title, "Custom Section"),
    zone: readZone(sectionRecord.zone, "main"),
    position: readPosition(sectionRecord.position, fallbackPosition),
    visible: readBoolean(sectionRecord.visible, true),
    items: normalizeSectionItems("custom", sectionRecord.items, `${id}-entry`),
  };
}

function buildUniqueSectionId(
  section: ResumeSection,
  fallbackPosition: number,
  seenIds: Set<string>
): string {
  const fallbackId =
    section.type === "custom"
      ? buildSafeSectionId(fallbackPosition)
      : sanitizeIdPart(section.type, "section");

  const baseId = sanitizeExistingId(section.id, fallbackId);
  return getUniqueId(baseId, seenIds);
}

function normalizeSectionIds(sections: ResumeSection[]): ResumeSection[] {
  const seenIds = new Set<string>();

  return sections.map((section, index) => ({
    ...section,
    id: buildUniqueSectionId(section, index, seenIds),
  }));
}

function normalizeCanonicalResumeData(
  value: ResumeData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
    photoShape: options.photoShape ?? undefined,
  });

  const meta: Record<string, unknown> = isRecord(value.meta) ? value.meta : {};
  const layout: Record<string, unknown> = isRecord(value.layout) ? value.layout : {};
  const sections = Array.isArray(value.sections) ? value.sections : [];

  const builtInSections = defaults.sections.map((defaultSection, index) => {
    const rawSection = sections.find((section) => {
      if (!isRecord(section)) {
        return false;
      }

      return (
        section.type === defaultSection.type || section.id === defaultSection.id
      );
    });

    return normalizeCanonicalSection(rawSection, defaultSection, index);
  });

  const customSections = sections
    .filter((section) => isRecord(section) && section.type === "custom")
    .map((section, index) =>
      normalizeCustomSection(section, defaults.sections.length + index)
    );

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
      photoShape: readPhotoShape(
        options.photoShape !== undefined ? options.photoShape : layout.photoShape,
        defaults.layout.photoShape
      ),
    },
    sections: normalizeSectionIds(
      [...builtInSections, ...customSections]
        .sort((left, right) => left.position - right.position)
        .map((section, index) => ({
          ...section,
          position: index,
        }))
    ),
  };
}

export function isCanonicalResumeData(value: unknown): value is ResumeData {
  return isRecord(value) && Array.isArray(value.sections);
}

function getCustomSectionId(
  section: CustomSectionFormSection,
  startPosition: number,
  index: number
): string {
  const fallbackId = buildSafeSectionId(startPosition + index);
  return sanitizeExistingId(section.id, fallbackId);
}

function buildCustomSectionsFromFormData(
  customSections: CustomSectionFormSection[],
  startPosition: number
): ResumeSection[] {
  return customSections.map((section, index) => {
    const sectionId = getCustomSectionId(section, startPosition, index);

    return {
      id: sectionId,
      type: "custom" as const,
      title: readString(section.title, "Custom Section"),
      zone: readZone(section.zone, "main"),
      position: startPosition + index,
      visible: readBoolean(section.visible, true),
      items: normalizeSectionItems("custom", section.entries, `${sectionId}-entry`),
    };
  });
}

export function buildResumeDataFromFormData(
  formData: ResumeFormData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
    photoShape: options.photoShape ?? undefined,
  });

  const sections = defaults.sections.map((section) => {
    switch (section.type) {
      case "personal-details":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.personalDetails,
            defaultBuiltInSectionVisibility.personalDetails
          ),
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
          visible: readBoolean(
            formData.sectionVisibility?.summary,
            defaultBuiltInSectionVisibility.summary
          ),
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
          visible: readBoolean(
            formData.sectionVisibility?.experience,
            defaultBuiltInSectionVisibility.experience
          ),
          items: normalizeSectionItems(
            "experience",
            formData.experience,
            "experience"
          ),
        };
      case "education":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.education,
            defaultBuiltInSectionVisibility.education
          ),
          items: normalizeSectionItems("education", formData.education, "education"),
        };
      case "skills":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.skills,
            defaultBuiltInSectionVisibility.skills
          ),
          items: normalizeSectionItems("skills", formData.skills, "skills"),
        };
      case "projects":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.projects,
            defaultBuiltInSectionVisibility.projects
          ),
          items: normalizeSectionItems("projects", formData.projects, "projects"),
        };
      case "certifications":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.certifications,
            defaultBuiltInSectionVisibility.certifications
          ),
          items: normalizeSectionItems(
            "certifications",
            formData.certifications,
            "certifications"
          ),
        };
      default:
        return section;
    }
  });

  const customSections = buildCustomSectionsFromFormData(
    Array.isArray(formData.customSections) ? formData.customSections : [],
    sections.length
  );

  return normalizeCanonicalResumeData(
    {
      meta: defaults.meta,
      layout: defaults.layout,
      sections: [...sections, ...customSections],
    },
    options
  );
}

function normalizeSectionVisibility(value: unknown): BuiltInSectionVisibility {
  const visibility = isRecord(value) ? value : {};

  return {
    personalDetails: readBoolean(
      visibility.personalDetails,
      defaultBuiltInSectionVisibility.personalDetails
    ),
    summary: readBoolean(
      visibility.summary,
      defaultBuiltInSectionVisibility.summary
    ),
    experience: readBoolean(
      visibility.experience,
      defaultBuiltInSectionVisibility.experience
    ),
    education: readBoolean(
      visibility.education,
      defaultBuiltInSectionVisibility.education
    ),
    skills: readBoolean(
      visibility.skills,
      defaultBuiltInSectionVisibility.skills
    ),
    projects: readBoolean(
      visibility.projects,
      defaultBuiltInSectionVisibility.projects
    ),
    certifications: readBoolean(
      visibility.certifications,
      defaultBuiltInSectionVisibility.certifications
    ),
  };
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
      customSections: Array.isArray(legacy.customSections)
        ? legacy.customSections
        : [],
      sectionVisibility: normalizeSectionVisibility(legacy.sectionVisibility),
    },
    options
  );
}