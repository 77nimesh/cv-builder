import type { ComponentType } from "react";
import ModernTemplateOne from "@/components/templates/modern-template-one";
import ModernTemplateTwo from "@/components/templates/modern-template-two";
import type { ResumeTemplateProps } from "@/components/templates/types";
import {
  type ResumeTemplateId,
  resolveResumeTemplateId,
} from "@/components/templates/template-registry";

const resumeTemplateComponents: Record<
  ResumeTemplateId,
  ComponentType<ResumeTemplateProps>
> = {
  "modern-1": ModernTemplateOne,
  "modern-2": ModernTemplateTwo,
};

export function resolveResumeTemplateComponent(
  template: string | null | undefined
): ComponentType<ResumeTemplateProps> {
  return resumeTemplateComponents[resolveResumeTemplateId(template)];
}