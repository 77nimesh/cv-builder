export type PersonalDetails = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
};

export type ResumeLegacyData = {
  personal: PersonalDetails;
  summary: string;
  experience: Array<unknown>;
  education: Array<unknown>;
  skills: Array<unknown>;
  projects: Array<unknown>;
  certifications: Array<unknown>;
};

export type ResumeFormData = ResumeLegacyData;

export type ResumeSectionType =
  | "personal-details"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export type ResumeZone = "main" | "sidebar";

export type ResumeMeta = {
  language: string;
  targetRole: string;
};

export type ResumeLayout = {
  template: string;
  themeColor: string | null;
  fontFamily: string | null;
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
