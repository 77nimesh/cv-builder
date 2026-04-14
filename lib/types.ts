export type ResumeData = {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    website: string;
  };
  summary: string;
  experience: Array<unknown>;
  education: Array<unknown>;
  skills: Array<unknown>;
  projects: Array<unknown>;
  certifications: Array<unknown>;
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