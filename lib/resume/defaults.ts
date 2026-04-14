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
  ResumeSectionType,
  SkillItem,
} from "@/lib/types";

export const resumeSectionOrder: ResumeSectionType[] = [
  "personal-details",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

export const defaultPersonalDetails: PersonalDetails = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  website: "",
};

export const defaultExperienceItem: ExperienceItem = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

export const defaultEducationItem: EducationItem = {
  institution: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

export const defaultSkillItem: SkillItem = {
  name: "",
  level: "",
};

export const defaultProjectItem: ProjectItem = {
  name: "",
  role: "",
  url: "",
  startDate: "",
  endDate: "",
  description: "",
};

export const defaultCertificationItem: CertificationItem = {
  name: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  url: "",
};

export const defaultCustomSectionEntry: CustomSectionEntry = {
  title: "",
  subtitle: "",
  meta: "",
  description: "",
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyCustomSectionFormSection(): CustomSectionFormSection {
  return {
    id: createId("custom"),
    title: "Custom Section",
    zone: "main",
    visible: true,
    entries: [{ ...defaultCustomSectionEntry }],
  };
}

export const defaultResumeFormData: ResumeFormData = {
  personal: { ...defaultPersonalDetails },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  customSections: [],
};

type CreateDefaultResumeDataOptions = {
  template?: string;
  themeColor?: string | null;
  fontFamily?: string | null;
  language?: string;
  targetRole?: string;
};

export function createDefaultResumeData(
  options: CreateDefaultResumeDataOptions = {}
): ResumeData {
  const template = options.template ?? "modern-1";

  return {
    meta: {
      language: options.language ?? "en",
      targetRole: options.targetRole ?? "",
    },
    layout: {
      template,
      themeColor: options.themeColor ?? null,
      fontFamily: options.fontFamily ?? null,
    },
    sections: [
      {
        id: "personal-details",
        type: "personal-details",
        title: "Personal Details",
        zone: "sidebar",
        position: 0,
        visible: true,
        items: [
          {
            id: "personal-details-1",
            position: 0,
            content: { ...defaultPersonalDetails },
          },
        ],
      },
      {
        id: "summary",
        type: "summary",
        title: "Professional Summary",
        zone: "main",
        position: 1,
        visible: true,
        items: [
          {
            id: "summary-1",
            position: 0,
            content: { text: "" },
          },
        ],
      },
      {
        id: "experience",
        type: "experience",
        title: "Experience",
        zone: "main",
        position: 2,
        visible: true,
        items: [],
      },
      {
        id: "education",
        type: "education",
        title: "Education",
        zone: "main",
        position: 3,
        visible: true,
        items: [],
      },
      {
        id: "skills",
        type: "skills",
        title: "Skills",
        zone: "main",
        position: 4,
        visible: true,
        items: [],
      },
      {
        id: "projects",
        type: "projects",
        title: "Projects",
        zone: "main",
        position: 5,
        visible: true,
        items: [],
      },
      {
        id: "certifications",
        type: "certifications",
        title: "Certifications",
        zone: "sidebar",
        position: 6,
        visible: true,
        items: [],
      },
    ],
  };
}

export const defaultResumeData = createDefaultResumeData();