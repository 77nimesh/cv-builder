import type { CSSProperties } from "react";
import type { ResumeSection, ResumeZone } from "@/lib/types";
import {
  getAvailableResumeTemplateDefinition,
  type ResumeTemplateId,
} from "@/components/templates/template-registry";

export const RESUME_EXPORT_PAGE_WIDTH_PX = 794;
export const RESUME_EXPORT_PAGE_MIN_HEIGHT_PX = 1123;

export const DEFAULT_RESUME_SIDEBAR_WIDTH_PX = 0;

export function getResumeSidebarWidthPx(
  template: ResumeTemplateId | string | null | undefined
) {
  return (
    getAvailableResumeTemplateDefinition(template).sidebarWidthPx ??
    DEFAULT_RESUME_SIDEBAR_WIDTH_PX
  );
}

export function getResumePreviewShellStyle(
  template: ResumeTemplateId | string | null | undefined
): CSSProperties {
  return {
    ["--resume-page-width" as string]: `${RESUME_EXPORT_PAGE_WIDTH_PX}px`,
    ["--resume-page-min-height" as string]: `${RESUME_EXPORT_PAGE_MIN_HEIGHT_PX}px`,
    ["--resume-sidebar-width" as string]: `${getResumeSidebarWidthPx(template)}px`,
  } as CSSProperties;
}

export function getResumeSectionPrintStrategy(
  section: ResumeSection,
  zone: ResumeZone
): "avoid" | "flow" {
  if (zone === "sidebar") {
    return "avoid";
  }

  if (section.type === "experience") {
    return "flow";
  }

  if (section.type === "summary") {
    return "avoid";
  }

  return section.items.length <= 2 ? "avoid" : "flow";
}