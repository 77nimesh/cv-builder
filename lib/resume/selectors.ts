import type {
  PersonalDetails,
  ResumeData,
  ResumeFormData,
  ResumeSection,
  ResumeSectionType,
} from "@/types/resume";
import {
  defaultPersonalDetails,
  defaultResumeFormData,
} from "@/lib/resume/defaults";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function getPersonalDetails(data: ResumeData): PersonalDetails {
  const personalSection = getSection(data, "personal-details");
  const personalContent = personalSection?.items[0]?.content;

  if (!isRecord(personalContent)) {
    return { ...defaultPersonalDetails };
  }

  return {
    fullName:
      typeof personalContent.fullName === "string"
        ? personalContent.fullName
        : defaultPersonalDetails.fullName,
    email:
      typeof personalContent.email === "string"
        ? personalContent.email
        : defaultPersonalDetails.email,
    phone:
      typeof personalContent.phone === "string"
        ? personalContent.phone
        : defaultPersonalDetails.phone,
    location:
      typeof personalContent.location === "string"
        ? personalContent.location
        : defaultPersonalDetails.location,
    linkedIn:
      typeof personalContent.linkedIn === "string"
        ? personalContent.linkedIn
        : defaultPersonalDetails.linkedIn,
    website:
      typeof personalContent.website === "string"
        ? personalContent.website
        : defaultPersonalDetails.website,
  };
}

export function getSummaryText(data: ResumeData): string {
  const summarySection = getSection(data, "summary");
  const summaryContent = summarySection?.items[0]?.content;

  if (typeof summaryContent === "string") {
    return summaryContent;
  }

  if (isRecord(summaryContent) && typeof summaryContent.text === "string") {
    return summaryContent.text;
  }

  return "";
}

export function getResumeFormData(data: ResumeData): ResumeFormData {
  return {
    personal: getPersonalDetails(data),
    summary: getSummaryText(data),
    experience:
      getSection(data, "experience")?.items.map((item) => item.content) ??
      defaultResumeFormData.experience,
    education:
      getSection(data, "education")?.items.map((item) => item.content) ??
      defaultResumeFormData.education,
    skills:
      getSection(data, "skills")?.items.map((item) => item.content) ??
      defaultResumeFormData.skills,
    projects:
      getSection(data, "projects")?.items.map((item) => item.content) ??
      defaultResumeFormData.projects,
    certifications:
      getSection(data, "certifications")?.items.map((item) => item.content) ??
      defaultResumeFormData.certifications,
  };
}
