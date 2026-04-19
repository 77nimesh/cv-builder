import type { CSSProperties } from "react";
import type { ResumeSection, ResumeZone } from "@/lib/types";
import type { ResumeTemplateId } from "@/components/templates/template-registry";

export const RESUME_EXPORT_PAGE_WIDTH_PX = 794;
export const RESUME_EXPORT_PAGE_MIN_HEIGHT_PX = 1123;

const templateSidebarWidths: Record<ResumeTemplateId, number> = {
  "modern-1": 280,
  "modern-2": 260,
};

export function getResumeSidebarWidthPx(templateId: ResumeTemplateId) {
  return templateSidebarWidths[templateId];
}

export function getResumePreviewShellStyle(
  templateId: ResumeTemplateId
): CSSProperties {
  return {
    ["--resume-page-width" as string]: `${RESUME_EXPORT_PAGE_WIDTH_PX}px`,
    ["--resume-page-min-height" as string]: `${RESUME_EXPORT_PAGE_MIN_HEIGHT_PX}px`,
    ["--resume-sidebar-width" as string]: `${getResumeSidebarWidthPx(templateId)}px`,
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