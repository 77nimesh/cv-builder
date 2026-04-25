import type {
  CertificationItem,
  CustomSectionEntry,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumePhotoShape,
  ResumeSection,
  ResumeSectionItem,
  ResumeSectionType,
  ResumeZone,
  SkillItem,
} from "@/lib/types";
import {
  getVisibleSections,
  hasRenderableSectionContent,
} from "@/lib/resume/selectors";

export function hasText(value: string | null | undefined) {
  return (value ?? "").trim().length > 0;
}

export function compactTextParts(parts: Array<string | null | undefined>) {
  return parts.map((part) => part?.trim() ?? "").filter(Boolean);
}

export function joinTextParts(
  parts: Array<string | null | undefined>,
  separator = " • "
) {
  return compactTextParts(parts).join(separator);
}

export function formatDateRange(startDate: string, endDate: string) {
  const start = startDate.trim();
  const end = endDate.trim();

  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) {
    return start;
  }

  if (end) {
    return end;
  }

  return "";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function readExperienceItem(content: unknown): ExperienceItem {
  if (!isRecord(content)) {
    return {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    company: readString(content.company),
    role: readString(content.role),
    location: readString(content.location),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

export function readEducationItem(content: unknown): EducationItem {
  if (!isRecord(content)) {
    return {
      institution: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    institution: readString(content.institution),
    degree: readString(content.degree),
    location: readString(content.location),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

export function readSkillItem(content: unknown): SkillItem {
  if (typeof content === "string") {
    return {
      name: content,
      level: "",
    };
  }

  if (!isRecord(content)) {
    return {
      name: "",
      level: "",
    };
  }

  return {
    name: readString(content.name),
    level: readString(content.level),
  };
}

export function readProjectItem(content: unknown): ProjectItem {
  if (!isRecord(content)) {
    return {
      name: "",
      role: "",
      url: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    name: readString(content.name),
    role: readString(content.role),
    url: readString(content.url),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

export function readCertificationItem(content: unknown): CertificationItem {
  if (!isRecord(content)) {
    return {
      name: "",
      issuer: "",
      issueDate: "",
      credentialId: "",
      url: "",
    };
  }

  return {
    name: readString(content.name),
    issuer: readString(content.issuer),
    issueDate: readString(content.issueDate),
    credentialId: readString(content.credentialId),
    url: readString(content.url),
  };
}

export function readCustomEntry(content: unknown): CustomSectionEntry {
  if (!isRecord(content)) {
    return {
      title: "",
      subtitle: "",
      meta: "",
      description: "",
    };
  }

  return {
    title: readString(content.title),
    subtitle: readString(content.subtitle),
    meta: readString(content.meta),
    description: readString(content.description),
  };
}

export function getOrderedItems(section: ResumeSection): ResumeSectionItem[] {
  return [...section.items].sort((left, right) => left.position - right.position);
}

export function getVisibleSectionsByZone(data: ResumeData, zone: ResumeZone) {
  return getVisibleSections(data).filter((section) => section.zone === zone);
}

export function getVisibleSectionsByType(
  data: ResumeData,
  sectionType: ResumeSectionType
) {
  return getVisibleSections(data).filter(
    (section) => section.type === sectionType && hasRenderableSectionContent(section)
  );
}

export function supportsItemDrag(section: ResumeSection) {
  return (
    section.type === "experience" ||
    section.type === "education" ||
    section.type === "projects" ||
    section.type === "certifications" ||
    section.type === "custom"
  );
}

export function normalizePhotoShape(
  shape: ResumePhotoShape | string | null | undefined
) {
  return shape === "circle" ? "circle" : "square";
}

export function normalizePhotoPath(photoPath: string | null | undefined) {
  return photoPath?.trim() ?? "";
}

export function getInitials(fullName: string) {
  const initials = fullName
    .split(/\s+/)
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return initials.toUpperCase() || "CV";
}
