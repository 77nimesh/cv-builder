export type ResumeZone = "main" | "sidebar";

export type PersonalDetails = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
};

export type ResumePhotoShape = "square" | "circle";

export type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type EducationItem = {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type SkillItem = {
  name: string;
  level: string;
};

export type ProjectItem = {
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CertificationItem = {
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  url: string;
};

export type CustomSectionEntry = {
  title: string;
  subtitle: string;
  meta: string;
  description: string;
};

export type CustomSectionFormSection = {
  id: string;
  title: string;
  zone: ResumeZone;
  visible: boolean;
  entries: CustomSectionEntry[];
};

export type ResumeLegacyData = {
  personal: PersonalDetails;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSectionFormSection[];
};

export type ResumeFormData = ResumeLegacyData;

export type ResumeSectionType =
  | "personal-details"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "custom";

export type ResumeMeta = {
  language: string;
  targetRole: string;
};

export type ResumeLayout = {
  template: string;
  themeColor: string | null;
  fontFamily: string | null;
  photoShape: ResumePhotoShape;
};

export type ResumeSectionItem = {
  id: string;
  position: number;
  content: unknown;
};

export type ResumeSection = {
  id: string;
  type: ResumeSectionType;
  title: string;
  zone: ResumeZone;
  position: number;
  visible: boolean;
  items: ResumeSectionItem[];
};

export type ResumeData = {
  meta: ResumeMeta;
  layout: ResumeLayout;
  sections: ResumeSection[];
};

export type ResumeRecord = {
  id: string;
  title: string;
  template: string;
  themeColor: string | null;
  fontFamily: string | null;
  data: ResumeData;
  photoPath: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};