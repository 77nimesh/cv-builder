import type { ComponentType, ReactElement } from "react";
import AtsCleanTemplateFour from "@/components/templates/ats-clean-template-four";
import BoldLeftTemplateEleven from "@/components/templates/bold-left-template-eleven";
import CardGridTemplateTen from "@/components/templates/card-grid-template-ten";
import CompactColumnsTemplateFourteen from "@/components/templates/compact-columns-template-fourteen";
import ExecutiveTemplateThree from "@/components/templates/executive-template-three";
import MinimalBandTemplateNine from "@/components/templates/minimal-band-template-nine";
import ModernTemplateOne from "@/components/templates/modern-template-one";
import MonogramHeroTemplateThirteen from "@/components/templates/monogram-hero-template-thirteen";
import ProfileFocusTemplateSeven from "@/components/templates/profile-focus-template-seven";
import SidebarCardTemplateFive from "@/components/templates/sidebar-card-template-five";
import TechnicalCompactTemplateSix from "@/components/templates/technical-compact-template-six";
import TwoPageProTemplateTwelve from "@/components/templates/two-page-pro-template-twelve";
import TimelineSplitTemplateEight from "@/components/templates/timeline-split-template-eight";
import ModernTemplateTwo from "@/components/templates/modern-template-two";
import type { ResumeTemplateProps } from "@/components/templates/types";
import {
  type AvailableResumeTemplateId,
  resolveAvailableResumeTemplateId,
} from "@/components/templates/template-registry";

const resumeTemplateComponents: Record<
  AvailableResumeTemplateId,
  ComponentType<ResumeTemplateProps>
> = {
  "modern-1": ModernTemplateOne,
  "modern-2": ModernTemplateTwo,
  "executive-3": ExecutiveTemplateThree,
  "ats-clean-4": AtsCleanTemplateFour,
  "sidebar-card-5": SidebarCardTemplateFive,
  "technical-compact-6": TechnicalCompactTemplateSix,
  "profile-focus-7": ProfileFocusTemplateSeven,
  "timeline-split-8": TimelineSplitTemplateEight,
  "minimal-band-9": MinimalBandTemplateNine,
  "card-grid-10": CardGridTemplateTen,
  "bold-left-11": BoldLeftTemplateEleven,
  "two-page-pro-12": TwoPageProTemplateTwelve,
  "monogram-hero-13": MonogramHeroTemplateThirteen,
  "compact-columns-14": CompactColumnsTemplateFourteen,
};

export function resolveResumeTemplateComponent(
  template: string | null | undefined
): ComponentType<ResumeTemplateProps> {
  return resumeTemplateComponents[resolveAvailableResumeTemplateId(template)];
}

export function renderResumeTemplate(
  template: string | null | undefined,
  props: ResumeTemplateProps
): ReactElement {
  const TemplateComponent = resolveResumeTemplateComponent(template);

  return <TemplateComponent {...props} />;
}