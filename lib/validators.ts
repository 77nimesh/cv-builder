import { z } from "zod";

const experienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const skillItemSchema = z.object({
  name: z.string(),
  level: z.string(),
});

const projectItemSchema = z.object({
  name: z.string(),
  role: z.string(),
  url: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const certificationItemSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  credentialId: z.string(),
  url: z.string(),
});

export const resumeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  template: z.string().min(1),
  themeColor: z.string().nullable().optional(),
  fontFamily: z.string().nullable().optional(),
  photoPath: z.string().nullable().optional(),
  data: z.object({
    personal: z.object({
      fullName: z.string(),
      email: z.string(),
      phone: z.string(),
      location: z.string(),
      linkedIn: z.string(),
      website: z.string(),
    }),
    summary: z.string(),
    experience: z.array(experienceItemSchema),
    education: z.array(educationItemSchema),
    skills: z.array(skillItemSchema),
    projects: z.array(projectItemSchema),
    certifications: z.array(certificationItemSchema),
  }),
});

export type ResumeFormValues = z.infer<typeof resumeFormSchema>;