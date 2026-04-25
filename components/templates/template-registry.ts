import type { ResumeTemplateRecordLike } from "@/components/templates/types";
import { resolveResumeTheme } from "@/components/templates/theme-presets";

export const RESUME_TEMPLATE_IDS = [
  "modern-1",
  "modern-2",
  "executive-3",
  "ats-clean-4",
  "sidebar-card-5",
  "technical-compact-6",
  "profile-focus-7",
  "timeline-split-8",
  "minimal-band-9",
  "card-grid-10",
  "bold-left-11",
  "two-page-pro-12",
  "monogram-hero-13",
  "compact-columns-14",
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export const AVAILABLE_RESUME_TEMPLATE_IDS = [
  "modern-1",
  "modern-2",
  "executive-3",
  "ats-clean-4",
  "sidebar-card-5",
  "technical-compact-6",
  "profile-focus-7",
  "timeline-split-8",
  "minimal-band-9",
  "card-grid-10",
  "bold-left-11",
  "two-page-pro-12",
  "monogram-hero-13",
  "compact-columns-14",
] as const satisfies readonly ResumeTemplateId[];

export type AvailableResumeTemplateId = (typeof AVAILABLE_RESUME_TEMPLATE_IDS)[number];

export type ResumeTemplateImplementationStatus = "available" | "planned";

export type ResumeTemplateLayoutKind =
  | "two-column"
  | "single-column"
  | "hybrid"
  | "two-page";

export type ResumeTemplatePrintBackgroundColorSource =
  | "primary"
  | "softBackground"
  | "surface";

export type ResumeTemplatePrintBackground = {
  side: "left" | "right";
  widthClassName: string;
  colorSource: ResumeTemplatePrintBackgroundColorSource;
};

export type ResumeTemplateDefinition = {
  id: ResumeTemplateId;
  label: string;
  shortLabel?: string;
  concept: string;
  bestFor: string;
  keyVisualFeature: string;
  status: ResumeTemplateImplementationStatus;
  layoutKind: ResumeTemplateLayoutKind;
  sidebarWidthPx: number;
  printWrapperClassName: string;
  printBackground?: ResumeTemplatePrintBackground;
};

const DEFAULT_TEMPLATE_ID: AvailableResumeTemplateId = "modern-1";

export const resumeTemplateRegistry: Record<
  ResumeTemplateId,
  ResumeTemplateDefinition
> = {
  "modern-1": {
    id: "modern-1",
    label: "Modern 1",
    concept: "Balanced two-column professional resume with a strong colored sidebar.",
    bestFor: "General professional resumes",
    keyVisualFeature: "Theme-colored sidebar with clear content separation.",
    status: "available",
    layoutKind: "two-column",
    sidebarWidthPx: 280,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "left",
      widthClassName: "w-[280px]",
      colorSource: "primary",
    },
  },
  "modern-2": {
    id: "modern-2",
    label: "Modern 2",
    concept: "Modern two-column resume with a soft accent sidebar on the right.",
    bestFor: "Professionals who want a polished but restrained layout",
    keyVisualFeature: "Soft theme sidebar that keeps the main column bright and readable.",
    status: "available",
    layoutKind: "two-column",
    sidebarWidthPx: 260,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "right",
      widthClassName: "w-[260px]",
      colorSource: "softBackground",
    },
  },
  "executive-3": {
    id: "executive-3",
    label: "Executive 3",
    concept: "Premium executive two-column layout with strong name/header treatment and refined sidebar blocks.",
    bestFor: "Executives, managers, senior professionals",
    keyVisualFeature: "Premium header hierarchy with refined sidebar content blocks.",
    status: "available",
    layoutKind: "two-column",
    sidebarWidthPx: 250,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "left",
      widthClassName: "w-[250px]",
      colorSource: "softBackground",
    },
  },
  "ats-clean-4": {
    id: "ats-clean-4",
    label: "ATS Clean 4",
    concept: "Clean single-column ATS-friendly layout with minimal decoration and excellent long-content flow.",
    bestFor: "Corporate, consultant, and ATS-sensitive applications",
    keyVisualFeature: "Single-column reading order with restrained typography.",
    status: "available",
    layoutKind: "single-column",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "sidebar-card-5": {
    id: "sidebar-card-5",
    label: "Sidebar Card 5",
    concept: "Modern card/sidebar layout using soft theme backgrounds, rounded section cards, and flexible photo placement.",
    bestFor: "General professionals and modern business roles",
    keyVisualFeature: "Soft card sections layered over a restrained sidebar.",
    status: "available",
    layoutKind: "two-column",
    sidebarWidthPx: 270,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "left",
      widthClassName: "w-[270px]",
      colorSource: "softBackground",
    },
  },
  "technical-compact-6": {
    id: "technical-compact-6",
    label: "Technical Compact 6",
    concept: "Compact professional layout for technical and engineering resumes with dense skill/project presentation.",
    bestFor: "Engineers, developers, automotive and technical professionals",
    keyVisualFeature: "Dense content rhythm with technical sections optimized for scanning.",
    status: "available",
    layoutKind: "hybrid",
    sidebarWidthPx: 240,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "right",
      widthClassName: "w-[240px]",
      colorSource: "surface",
    },
  },
  "profile-focus-7": {
    id: "profile-focus-7",
    label: "Profile Focus 7",
    concept: "Polished profile-focused layout with a modern top band, optional photo, and elegant content sections.",
    bestFor: "Product, UX, marketing, and client-facing roles",
    keyVisualFeature: "Profile-led hero area that still flows cleanly across pages.",
    status: "available",
    layoutKind: "hybrid",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "timeline-split-8": {
    id: "timeline-split-8",
    label: "Timeline Split",
    concept: "Left sidebar with vertical timeline dots connected by a line running through experience entries.",
    bestFor: "Designers, project managers, marketers",
    keyVisualFeature: "Animated-feel timeline spine using the primary theme color.",
    status: "available",
    layoutKind: "two-column",
    sidebarWidthPx: 250,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "left",
      widthClassName: "w-[250px]",
      colorSource: "softBackground",
    },
  },
  "minimal-band-9": {
    id: "minimal-band-9",
    label: "Minimal Band",
    concept: "Ultra-minimal single column with a slim full-width color band at the top containing only name and role.",
    bestFor: "Senior professionals and consultants",
    keyVisualFeature: "Restrained full-width top band with zero decoration below it.",
    status: "available",
    layoutKind: "single-column",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "card-grid-10": {
    id: "card-grid-10",
    label: "Card Grid",
    concept: "Skills, certifications, and stats presented as a grid of small cards in the header zone with a classic column below.",
    bestFor: "Engineers, data scientists, and technical specialists",
    keyVisualFeature: "Scannable card grid for hard skills at the top.",
    status: "available",
    layoutKind: "hybrid",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "bold-left-11": {
    id: "bold-left-11",
    label: "Bold Left",
    concept: "Oversized vertically-written name or large first-name block on the far left margin with content flowing right.",
    bestFor: "Creative professionals and portfolio-led roles",
    keyVisualFeature: "Typographic statement with the name as a design element.",
    status: "available",
    layoutKind: "hybrid",
    sidebarWidthPx: 170,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
    printBackground: {
      side: "left",
      widthClassName: "w-[170px]",
      colorSource: "surface",
    },
  },
  "two-page-pro-12": {
    id: "two-page-pro-12",
    label: "Two Page Pro",
    concept: "Two-page-oriented professional template with intentional continuation styling for long resumes.",
    bestFor: "Senior engineers, academics, and long-form professional resumes",
    keyVisualFeature: "Clean page-break design that feels intentional, not accidental.",
    status: "available",
    layoutKind: "two-page",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "monogram-hero-13": {
    id: "monogram-hero-13",
    label: "Monogram Hero",
    concept: "Large circular monogram or photo hero block centered at top with name beneath and skills as a horizontal pill row.",
    bestFor: "Product, UX, and marketing roles",
    keyVisualFeature: "Strong centered visual anchor that works with all color themes.",
    status: "available",
    layoutKind: "single-column",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
  "compact-columns-14": {
    id: "compact-columns-14",
    label: "Compact Columns",
    concept: "Three-column skills/stats zone at the top, then a clean two-column layout for experience and one-column education.",
    bestFor: "Technical and business hybrid roles",
    keyVisualFeature: "Distinctive three-column top zone before the main content flow.",
    status: "available",
    layoutKind: "hybrid",
    sidebarWidthPx: 0,
    printWrapperClassName: "relative mx-auto w-[794px] bg-white print:w-full",
  },
};

export const selectableResumeTemplateDefinitions = AVAILABLE_RESUME_TEMPLATE_IDS.map(
  (templateId) => resumeTemplateRegistry[templateId]
);

export const allResumeTemplateDefinitions = RESUME_TEMPLATE_IDS.map(
  (templateId) => resumeTemplateRegistry[templateId]
);

export function isResumeTemplateId(value: string): value is ResumeTemplateId {
  return RESUME_TEMPLATE_IDS.includes(value as ResumeTemplateId);
}

export function isAvailableResumeTemplateId(
  value: string
): value is AvailableResumeTemplateId {
  return AVAILABLE_RESUME_TEMPLATE_IDS.includes(
    value as AvailableResumeTemplateId
  );
}

export function resolveResumeTemplateId(
  template: string | null | undefined
): ResumeTemplateId {
  if (template && isResumeTemplateId(template)) {
    return template;
  }

  return DEFAULT_TEMPLATE_ID;
}

export function resolveAvailableResumeTemplateId(
  template: string | null | undefined
): AvailableResumeTemplateId {
  if (template && isAvailableResumeTemplateId(template)) {
    return template;
  }

  return DEFAULT_TEMPLATE_ID;
}

export function getActiveResumeTemplateId(
  resume: ResumeTemplateRecordLike
): ResumeTemplateId {
  return resolveResumeTemplateId(resume.data.layout.template || resume.template);
}

export function getRenderableResumeTemplateId(
  resume: ResumeTemplateRecordLike
): AvailableResumeTemplateId {
  return resolveAvailableResumeTemplateId(
    resume.data.layout.template || resume.template
  );
}

export function getResumeTemplateDefinition(
  template: string | null | undefined
): ResumeTemplateDefinition {
  return resumeTemplateRegistry[resolveResumeTemplateId(template)];
}

export function getAvailableResumeTemplateDefinition(
  template: string | null | undefined
): ResumeTemplateDefinition {
  return resumeTemplateRegistry[resolveAvailableResumeTemplateId(template)];
}

export function getResumeTemplateDefinitionForRecord(
  resume: ResumeTemplateRecordLike
): ResumeTemplateDefinition {
  return getAvailableResumeTemplateDefinition(
    resume.data.layout.template || resume.template
  );
}

export function getSelectableResumeTemplateDefinitions() {
  return selectableResumeTemplateDefinitions;
}

export function getAllResumeTemplateDefinitions() {
  return allResumeTemplateDefinitions;
}

export function getResumeTemplatePrintBackgroundColor(
  template: string | null | undefined,
  themeColor: string | null | undefined
) {
  const templateDefinition = getAvailableResumeTemplateDefinition(template);
  const colorSource = templateDefinition.printBackground?.colorSource;

  if (!colorSource) {
    return undefined;
  }

  const theme = resolveResumeTheme(themeColor);

  if (colorSource === "primary") {
    return theme.primary;
  }

  if (colorSource === "softBackground") {
    return theme.softBackground;
  }

  return "#ffffff";
}