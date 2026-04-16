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
  ResumeSectionType,
  SkillItem,
} from "@/lib/types";
import {
  defaultCertificationItem,
  defaultCustomSectionEntry,
  defaultEducationItem,
  defaultExperienceItem,
  defaultPersonalDetails,
  defaultProjectItem,
  defaultResumeFormData,
  defaultSkillItem,
} from "@/lib/resume/defaults";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readZone(value: unknown): "main" | "sidebar" {
  return value === "sidebar" ? "sidebar" : "main";
}

export function getOrderedSections(data: ResumeData): ResumeSection[] {
  return [...data.sections].sort((left, right) => left.position - right.position);
}

export function getSection(
  data: ResumeData,
  type: ResumeSectionType
): ResumeSection | undefined {
  return data.sections.find((section) => section.type === type);
}

export function getVisibleSections(data: ResumeData): ResumeSection[] {
  return getOrderedSections(data).filter((section) => section.visible);
}

export function getCustomSections(data: ResumeData): ResumeSection[] {
  return getOrderedSections(data).filter((section) => section.type === "custom");
}

export function getSectionTitle(
  data: ResumeData,
  type: ResumeSectionType,
  fallback: string
): string {
  const section = getSection(data, type);
  const title = section?.title?.trim();

  return title && title.length > 0 ? title : fallback;
}

export function getPersonalDetails(data: ResumeData): PersonalDetails {
  const personalSection = getSection(data, "personal-details");
  const personalContent = personalSection?.items[0]?.content;

  if (!isRecord(personalContent)) {
    return { ...defaultPersonalDetails };
  }

  return {
    fullName: readString(personalContent.fullName, defaultPersonalDetails.fullName),
    headline: readString(personalContent.headline, defaultPersonalDetails.headline),
    email: readString(personalContent.email, defaultPersonalDetails.email),
    phone: readString(personalContent.phone, defaultPersonalDetails.phone),
    location: readString(personalContent.location, defaultPersonalDetails.location),
    linkedIn: readString(personalContent.linkedIn, defaultPersonalDetails.linkedIn),
    website: readString(personalContent.website, defaultPersonalDetails.website),
  };
}

export function getSummaryText(data: ResumeData): string {
  const summarySection = getSection(data, "summary");
  const summaryContent = summarySection?.items[0]?.content;

  if (typeof summaryContent === "string") {
    return summaryContent;
  }

  if (isRecord(summaryContent)) {
    return readString(summaryContent.text);
  }

  return "";
}

function readExperienceItem(value: unknown): ExperienceItem {
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

function readEducationItem(value: unknown): EducationItem {
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

function readSkillItem(value: unknown): SkillItem {
  if (!isRecord(value)) {
    return { ...defaultSkillItem };
  }

  return {
    name: readString(value.name),
    level: readString(value.level),
  };
}

function readProjectItem(value: unknown): ProjectItem {
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

function readCertificationItem(value: unknown): CertificationItem {
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

function readCustomSectionEntry(value: unknown): CustomSectionEntry {
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

export function getExperienceItems(data: ResumeData): ExperienceItem[] {
  return (
    getSection(data, "experience")?.items.map((item) =>
      readExperienceItem(item.content)
    ) ?? defaultResumeFormData.experience
  );
}

export function getEducationItems(data: ResumeData): EducationItem[] {
  return (
    getSection(data, "education")?.items.map((item) =>
      readEducationItem(item.content)
    ) ?? defaultResumeFormData.education
  );
}

export function getSkillItems(data: ResumeData): SkillItem[] {
  return (
    getSection(data, "skills")?.items.map((item) => readSkillItem(item.content)) ??
    defaultResumeFormData.skills
  );
}

export function getProjectItems(data: ResumeData): ProjectItem[] {
  return (
    getSection(data, "projects")?.items.map((item) =>
      readProjectItem(item.content)
    ) ?? defaultResumeFormData.projects
  );
}

export function getCertificationItems(data: ResumeData): CertificationItem[] {
  return (
    getSection(data, "certifications")?.items.map((item) =>
      readCertificationItem(item.content)
    ) ?? defaultResumeFormData.certifications
  );
}

export function getCustomSectionFormData(
  data: ResumeData
): CustomSectionFormSection[] {
  return getCustomSections(data).map((section) => ({
    id: section.id,
    title: section.title,
    zone: readZone(section.zone),
    visible: readBoolean(section.visible, true),
    entries: section.items.map((item) => readCustomSectionEntry(item.content)),
  }));
}

export function getResumeFormData(data: ResumeData): ResumeFormData {
  return {
    personal: getPersonalDetails(data),
    summary: getSummaryText(data),
    experience: getExperienceItems(data),
    education: getEducationItems(data),
    skills: getSkillItems(data),
    projects: getProjectItems(data),
    certifications: getCertificationItems(data),
    customSections: getCustomSectionFormData(data),
  };
}