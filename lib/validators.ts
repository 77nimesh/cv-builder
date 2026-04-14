import { z } from "zod";

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
    experience: z.array(z.unknown()),
    education: z.array(z.unknown()),
    skills: z.array(z.unknown()),
    projects: z.array(z.unknown()),
    certifications: z.array(z.unknown()),
  }),
});

export type ResumeFormValues = z.infer<typeof resumeFormSchema>;