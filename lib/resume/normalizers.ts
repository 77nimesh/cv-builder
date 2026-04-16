import type {
  CertificationItem,
  CustomSectionEntry,
  CustomSectionFormSection,
  EducationItem,
  ExperienceItem,
  PersonalDetails,
  ProjectItem,
  ResumeData,
  ResumeFormData,
  ResumeSection,
  ResumeSectionItem,
  ResumeSectionType,
  ResumeZone,
  SkillItem,
  ResumePhotoShape,
} from "@/lib/types";
import {
  createDefaultResumeData,
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
  const id = readString(itemRecord?.id, `${fallbackPrefix}-${fallbackPosition + 1}`);
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

  return rawItems
    .map((item, index) =>
      buildNormalizedItem(sectionType, item, index, fallbackPrefix)
    )
    .sort((left, right) => left.position - right.position)
    .map((item, index) => ({
      ...item,
      position: index,
      id: item.id || `${fallbackPrefix}-${index + 1}`,
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
  const id = readString(sectionRecord.id, `custom-${fallbackPosition + 1}`);

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

  const meta = isRecord(value.meta) ? value.meta : {};
  const layout = isRecord(value.layout) ? value.layout : {};
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
    sections: [...builtInSections, ...customSections]
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

function getCustomSectionId(
  section: CustomSectionFormSection,
  startPosition: number,
  index: number
) {
  return section.id || `custom-${startPosition + index + 1}`;
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
      items: normalizeSectionItems(
        "custom",
        section.entries,
        `${sectionId}-entry`
      ),
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
          items: normalizeSectionItems("experience", formData.experience, "experience"),
        };
      case "education":
        return {
          ...section,
          items: normalizeSectionItems("education", formData.education, "education"),
        };
      case "skills":
        return {
          ...section,
          items: normalizeSectionItems("skills", formData.skills, "skills"),
        };
      case "projects":
        return {
          ...section,
          items: normalizeSectionItems("projects", formData.projects, "projects"),
        };
      case "certifications":
        return {
          ...section,
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
      customSections: [],
    },
    options
  );
}