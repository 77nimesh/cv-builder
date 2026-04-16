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
  ResumePhotoShape,
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
  headline: "Professional Resume",
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
  return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>p</mi><mi>r</mi><mi>e</mi><mi>f</mi><mi>i</mi><mi>x</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{prefix}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">i</span><span class="mord mathnormal">x</span></span><span class="mord">−</span></span></span></span>{Math.random().toString(36).slice(2, 10)}`;
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
  photoShape?: ResumePhotoShape;
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
      photoShape: options.photoShape ?? "square",
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