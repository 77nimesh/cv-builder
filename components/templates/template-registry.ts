import type { ResumeTemplateRecordLike } from "@/components/templates/types";

export const RESUME_TEMPLATE_IDS = ["modern-1", "modern-2"] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export type ResumeTemplateDefinition = {
  id: ResumeTemplateId;
  label: string;
  printWrapperClassName?: string;
  printBackgroundClassName?: string;
};

export const resumeTemplateRegistry: Record<
  ResumeTemplateId,
  ResumeTemplateDefinition
> = {
  "modern-1": {
    id: "modern-1",
    label: "Modern 1",
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackgroundClassName:
      "pointer-events-none fixed inset-y-0 left-0 hidden w-[280px] bg-slate-900 print:block",
  },
  "modern-2": {
    id: "modern-2",
    label: "Modern 2",
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackgroundClassName:
      "pointer-events-none fixed inset-y-0 right-0 hidden w-[260px] bg-slate-100 print:block",
  },
};

export function isResumeTemplateId(value: string): value is ResumeTemplateId {
  return RESUME_TEMPLATE_IDS.includes(value as ResumeTemplateId);
}

export function resolveResumeTemplateId(
  template: string | null | undefined
): ResumeTemplateId {
  if (template && isResumeTemplateId(template)) {
    return template;
  }

  return "modern-1";
}

export function getActiveResumeTemplateId(
  resume: ResumeTemplateRecordLike
): ResumeTemplateId {
  return resolveResumeTemplateId(resume.data.layout.template || resume.template);
}

export function getResumeTemplateDefinition(
  template: string | null | undefined
): ResumeTemplateDefinition {
  return resumeTemplateRegistry[resolveResumeTemplateId(template)];
}

export function getResumeTemplateDefinitionForRecord(
  resume: ResumeTemplateRecordLike
): ResumeTemplateDefinition {
  return getResumeTemplateDefinition(getActiveResumeTemplateId(resume));
}