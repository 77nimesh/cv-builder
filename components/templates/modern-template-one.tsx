"use client";

import type { DragEvent, ReactNode } from "react";
import type {
  CertificationItem,
  CustomSectionEntry,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumeSection,
  ResumeSectionItem,
  ResumeZone,
  SkillItem,
} from "@/lib/types";
import {
  getPersonalDetails,
  getSummaryText,
  getVisibleSections,
  hasRenderableSectionContent,
} from "@/lib/resume/selectors";
import { resolveResumeTheme } from "@/components/templates/theme-presets";
import { resolveResumeFont } from "@/components/templates/font-presets";
import { getResumeSectionPrintStrategy } from "@/components/templates/export-layout";
import ResumePhoto from "@/components/templates/resume-photo";

type DraggedItemState = {
  sectionId: string;
  itemId: string;
};

type ModernTemplateOneProps = {
  data: ResumeData;
  photoPath?: string | null;
  editable?: boolean;
  draggedSectionId?: string | null;
  dropTargetSectionId?: string | null;
  draggedItem?: DraggedItemState | null;
  dropTargetItem?: DraggedItemState | null;
  onSectionDragStart?: (sectionId: string) => void;
  onSectionDragEnter?: (sectionId: string) => void;
  onSectionDrop?: (sectionId: string) => void;
  onZoneDrop?: (zone: ResumeZone) => void;
  onSectionDragEnd?: () => void;
  onItemDragStart?: (sectionId: string, itemId: string) => void;
  onItemDragEnter?: (sectionId: string, itemId: string) => void;
  onItemDrop?: (sectionId: string, itemId: string) => void;
  onItemListDrop?: (sectionId: string) => void;
  onItemDragEnd?: () => void;
};

function hasText(value: string) {
  return value.trim().length > 0;
}

function formatDateRange(startDate: string, endDate: string) {
  const start = startDate.trim();
  const end = endDate.trim();

  if (start && end) {
    return start + " - " + end;
  }

  if (start) {
    return start;
  }

  if (end) {
    return end;
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readExperienceItem(content: unknown): ExperienceItem {
  if (!isRecord(content)) {
    return {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    company: readString(content.company),
    role: readString(content.role),
    location: readString(content.location),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

function readEducationItem(content: unknown): EducationItem {
  if (!isRecord(content)) {
    return {
      institution: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    institution: readString(content.institution),
    degree: readString(content.degree),
    location: readString(content.location),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

function readSkillItem(content: unknown): SkillItem {
  if (typeof content === "string") {
    return {
      name: content,
      level: "",
    };
  }

  if (!isRecord(content)) {
    return {
      name: "",
      level: "",
    };
  }

  return {
    name: readString(content.name),
    level: readString(content.level),
  };
}

function readProjectItem(content: unknown): ProjectItem {
  if (!isRecord(content)) {
    return {
      name: "",
      role: "",
      url: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }

  return {
    name: readString(content.name),
    role: readString(content.role),
    url: readString(content.url),
    startDate: readString(content.startDate),
    endDate: readString(content.endDate),
    description: readString(content.description),
  };
}

function readCertificationItem(content: unknown): CertificationItem {
  if (!isRecord(content)) {
    return {
      name: "",
      issuer: "",
      issueDate: "",
      credentialId: "",
      url: "",
    };
  }

  return {
    name: readString(content.name),
    issuer: readString(content.issuer),
    issueDate: readString(content.issueDate),
    credentialId: readString(content.credentialId),
    url: readString(content.url),
  };
}

function readCustomEntry(content: unknown): CustomSectionEntry {
  if (!isRecord(content)) {
    return {
      title: "",
      subtitle: "",
      meta: "",
      description: "",
    };
  }

  return {
    title: readString(content.title),
    subtitle: readString(content.subtitle),
    meta: readString(content.meta),
    description: readString(content.description),
  };
}

function getOrderedItems(section: ResumeSection): ResumeSectionItem[] {
  return [...section.items].sort((left, right) => left.position - right.position);
}

function supportsItemDrag(section: ResumeSection) {
  return (
    section.type === "experience" ||
    section.type === "education" ||
    section.type === "projects" ||
    section.type === "certifications" ||
    section.type === "custom"
  );
}

export default function ModernTemplateOne({
  data,
  photoPath = null,
  editable = false,
  draggedSectionId = null,
  dropTargetSectionId = null,
  draggedItem = null,
  dropTargetItem = null,
  onSectionDragStart,
  onSectionDragEnter,
  onSectionDrop,
  onZoneDrop,
  onSectionDragEnd,
  onItemDragStart,
  onItemDragEnter,
  onItemDrop,
  onItemListDrop,
  onItemDragEnd,
}: ModernTemplateOneProps) {
  const personal = getPersonalDetails(data);
  const summary = getSummaryText(data);
  const visibleSections = getVisibleSections(data);
  const normalizedPhotoPath = photoPath?.trim() ?? "";
  const photoShape = data.layout.photoShape === "circle" ? "circle" : "square";
  const theme = resolveResumeTheme(data.layout.themeColor);
  const font = resolveResumeFont(data.layout.fontFamily);

  const sidebarSections = visibleSections.filter(
    (section) => section.zone === "sidebar"
  );
  const mainSections = visibleSections.filter((section) => section.zone === "main");

  function renderProfilePhoto(variant: "sidebar" | "main") {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <div className="mb-8">
        <ResumePhoto
          src={normalizedPhotoPath}
          alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
          shape={photoShape}
          className={variant === "sidebar" ? "h-52 w-52 border" : "h-36 w-36 border"}
          style={{
            borderColor:
              variant === "sidebar" ? "rgba(255,255,255,0.12)" : theme.softBorder,
          }}
        />
      </div>
    );
  }

  function renderItemShell(
    section: ResumeSection,
    item: ResumeSectionItem,
    content: ReactNode,
    options: { compact?: boolean } = {}
  ) {
    const itemDragEnabled = editable && supportsItemDrag(section);
    const isDraggedItem =
      draggedItem?.sectionId === section.id && draggedItem.itemId === item.id;
    const isDropTargetItem =
      dropTargetItem?.sectionId === section.id && dropTargetItem.itemId === item.id;

    const shellClasses = options.compact
      ? "rounded-xl px-2 py-2 print:px-0 print:py-0"
      : "rounded-xl px-3 py-3 print:px-0 print:py-0";

    const hoverClasses = itemDragEnabled
      ? section.zone === "sidebar"
        ? "ring-1 ring-transparent transition hover:ring-white/20"
        : "ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTargetItem
      ? section.zone === "sidebar"
        ? "ring-2 ring-white/60"
        : "ring-2 ring-slate-400"
      : "";

    const dragStateClass = isDraggedItem ? "opacity-60" : "";

    return (
      <div
        key={`${section.id}-${item.id}`}
        className={`${shellClasses} ${hoverClasses} ${dropClasses} ${dragStateClass}`}
        onDragEnter={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
                onItemDragEnter?.(section.id, item.id);
              }
            : undefined
        }
        onDragOver={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : undefined
        }
        onDrop={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
                onItemDrop?.(section.id, item.id);
              }
            : undefined
        }
      >
        {itemDragEnabled && (
          <div
            draggable
            onDragStart={(event: DragEvent<HTMLDivElement>) => {
              event.stopPropagation();
              onItemDragStart?.(section.id, item.id);
            }}
            onDragEnd={(event: DragEvent<HTMLDivElement>) => {
              event.stopPropagation();
              onItemDragEnd?.();
            }}
            className={`mb-3 inline-flex cursor-grab rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] active:cursor-grabbing print:hidden ${
              section.zone === "sidebar"
                ? "border-white/20 text-slate-300"
                : "border-slate-300 text-slate-500"
            }`}
          >
            Drag item
          </div>
        )}

        <div className="print-avoid-break">{content}</div>
      </div>
    );
  }

  function renderItemList(
    section: ResumeSection,
    renderItem: (item: ResumeSectionItem, index: number) => ReactNode,
    emptyState: ReactNode,
    options: {
      gapClassName: string;
      compactItems?: boolean;
      emptyClassName?: string;
    }
  ) {
    const orderedItems = getOrderedItems(section);
    const itemDragEnabled = editable && supportsItemDrag(section);

    return (
      <div
        className={options.gapClassName}
        onDragOver={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onItemListDrop?.(section.id);
              }
            : undefined
        }
      >
        {orderedItems.length > 0
          ? orderedItems.map((item, index) =>
              renderItemShell(section, item, renderItem(item, index), {
                compact: options.compactItems,
              })
            )
          : <div className={options.emptyClassName ?? ""}>{emptyState}</div>}
      </div>
    );
  }

  function renderSidebarSection(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return (
          <div>
            {renderProfilePhoto("sidebar")}

            {hasText(personal.fullName) && (
              <h1 className="break-words text-3xl font-bold leading-tight">
                {personal.fullName}
              </h1>
            )}

            {hasText(personal.headline) && (
              <p className="mt-3 text-base uppercase tracking-[0.3em] text-slate-200">
                {personal.headline}
              </p>
            )}

            <div className="mt-8 space-y-5 text-sm text-slate-100">
              {hasText(personal.phone) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    Phone
                  </p>
                  <p className="mt-1">{personal.phone}</p>
                </div>
              )}

              {hasText(personal.email) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    Email
                  </p>
                  <p className="mt-1 break-words">{personal.email}</p>
                </div>
              )}

              {hasText(personal.location) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    Location
                  </p>
                  <p className="mt-1">{personal.location}</p>
                </div>
              )}

              {hasText(personal.linkedIn) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    LinkedIn
                  </p>
                  <p className="mt-1 break-words">{personal.linkedIn}</p>
                </div>
              )}

              {hasText(personal.website) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    Website
                  </p>
                  <p className="mt-1 break-words">{personal.website}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "summary":
        if (!hasText(summary)) {
          return null;
        }

        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200">
              About
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-100">{summary}</p>
          </div>
        );

      case "skills":
        return renderItemList(
          section,
          (item) => {
            const skill = readSkillItem(item.content);

            if (!hasText(skill.name)) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="text-sm font-medium leading-6 text-white">{skill.name}</p>
                {hasText(skill.level) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                    {skill.level}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-300">No skills added yet.</p>,
          {
            gapClassName: "space-y-3",
            compactItems: true,
          }
        );

      case "links":
        return renderItemList(
          section,
          (item) => {
            const link = readString(item.content);

            if (!hasText(link)) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="break-words text-sm text-slate-100">{link}</p>
              </div>
            );
          },
          <p className="text-sm text-slate-300">No links added yet.</p>,
          {
            gapClassName: "space-y-3",
            compactItems: true,
          }
        );

      case "education":
        return renderItemList(
          section,
          (item) => {
            const education = readEducationItem(item.content);

            if (!hasText(education.institution) && !hasText(education.degree)) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                {hasText(education.degree) && (
                  <p className="text-sm font-semibold leading-6 text-white">
                    {education.degree}
                  </p>
                )}
                {hasText(education.institution) && (
                  <p className="mt-1 text-sm leading-6 text-slate-100">
                    {education.institution}
                  </p>
                )}
                {hasText(formatDateRange(education.startDate, education.endDate)) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                    {formatDateRange(education.startDate, education.endDate)}
                  </p>
                )}
                {hasText(education.location) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                    {education.location}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-300">No education added yet.</p>,
          {
            gapClassName: "space-y-3",
            compactItems: true,
          }
        );

      case "certifications":
        return renderItemList(
          section,
          (item) => {
            const certification = readCertificationItem(item.content);

            if (!hasText(certification.name)) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="text-sm font-semibold leading-6 text-white">
                  {certification.name}
                </p>
                {hasText(certification.issuer) && (
                  <p className="mt-1 text-sm leading-6 text-slate-100">
                    {certification.issuer}
                  </p>
                )}
                {hasText(certification.issueDate) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                    {certification.issueDate}
                  </p>
                )}
                {hasText(certification.credentialId) && (
                  <p className="mt-1 break-words text-slate-400">
                    {certification.credentialId}
                  </p>
                )}
                {hasText(certification.url) && (
                  <p className="mt-1 break-words text-slate-400">
                    {certification.url}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-300">No certifications added yet.</p>,
          {
            gapClassName: "space-y-3",
            compactItems: true,
          }
        );

      case "custom":
        return renderItemList(
          section,
          (item) => {
            const entry = readCustomEntry(item.content);

            if (
              !hasText(entry.title) &&
              !hasText(entry.subtitle) &&
              !hasText(entry.meta) &&
              !hasText(entry.description)
            ) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                {hasText(entry.title) && (
                  <p className="text-sm font-semibold leading-6 text-white">
                    {entry.title}
                  </p>
                )}
                {hasText(entry.subtitle) && (
                  <p className="mt-1 text-sm leading-6 text-slate-100">
                    {entry.subtitle}
                  </p>
                )}
                {hasText(entry.meta) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                    {entry.meta}
                  </p>
                )}
                {hasText(entry.description) && (
                  <p className="mt-3 text-sm leading-7 text-slate-100">
                    {entry.description}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-300">No items added yet.</p>,
          {
            gapClassName: "space-y-3",
            compactItems: true,
          }
        );

      default:
        return null;
    }
  }

  function renderMainExperienceSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const experience = readExperienceItem(item.content);

        if (!hasText(experience.company) && !hasText(experience.role)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {hasText(experience.role) && (
                  <h3 className="text-lg font-semibold text-slate-900">
                    {experience.role}
                  </h3>
                )}
                {hasText(experience.company) && (
                  <p className="text-base font-medium text-slate-600">
                    {experience.company}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                {hasText(formatDateRange(experience.startDate, experience.endDate)) && (
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    {formatDateRange(experience.startDate, experience.endDate)}
                  </p>
                )}
                {hasText(experience.location) && (
                  <p className="mt-1 text-sm text-slate-500">{experience.location}</p>
                )}
              </div>
            </div>

            {hasText(experience.description) && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {experience.description}
              </p>
            )}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No experience added yet.</p>,
      {
        gapClassName: "space-y-5",
      }
    );
  }

  function renderMainEducationSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const education = readEducationItem(item.content);

        if (!hasText(education.institution) && !hasText(education.degree)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {hasText(education.degree) && (
                  <h3 className="text-lg font-semibold text-slate-900">
                    {education.degree}
                  </h3>
                )}
                {hasText(education.institution) && (
                  <p className="text-base font-medium text-slate-600">
                    {education.institution}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                {hasText(formatDateRange(education.startDate, education.endDate)) && (
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    {formatDateRange(education.startDate, education.endDate)}
                  </p>
                )}
                {hasText(education.location) && (
                  <p className="mt-1 text-sm text-slate-500">{education.location}</p>
                )}
              </div>
            </div>

            {hasText(education.description) && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {education.description}
              </p>
            )}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No education added yet.</p>,
      {
        gapClassName: "space-y-5",
      }
    );
  }

  function renderMainProjectsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const project = readProjectItem(item.content);

        if (!hasText(project.name) && !hasText(project.role)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {hasText(project.name) && (
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h3>
                )}
                {hasText(project.role) && (
                  <p className="text-base font-medium text-slate-600">
                    {project.role}
                  </p>
                )}
                {hasText(project.url) && (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {project.url}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                {hasText(formatDateRange(project.startDate, project.endDate)) && (
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    {formatDateRange(project.startDate, project.endDate)}
                  </p>
                )}
              </div>
            </div>

            {hasText(project.description) && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {project.description}
              </p>
            )}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No projects added yet.</p>,
      {
        gapClassName: "space-y-5",
      }
    );
  }

  function renderMainCertificationsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const certification = readCertificationItem(item.content);

        if (!hasText(certification.name)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {certification.name}
                </h3>
                {hasText(certification.issuer) && (
                  <p className="text-base font-medium text-slate-600">
                    {certification.issuer}
                  </p>
                )}
                {hasText(certification.credentialId) && (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {certification.credentialId}
                  </p>
                )}
                {hasText(certification.url) && (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {certification.url}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                {hasText(certification.issueDate) && (
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    {certification.issueDate}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      },
      <p className="text-sm text-slate-500">No certifications added yet.</p>,
      {
        gapClassName: "space-y-5",
      }
    );
  }

  function renderMainSkillsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const skill = readSkillItem(item.content);

        if (!hasText(skill.name)) {
          return null;
        }

        return (
          <div className="rounded-full border border-slate-200 px-4 py-2">
            <p className="text-sm font-medium text-slate-700">{skill.name}</p>
            {hasText(skill.level) && (
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                {skill.level}
              </p>
            )}
          </div>
        );
      },
      <p className="text-sm text-slate-500">No skills added yet.</p>,
      {
        gapClassName: "flex flex-wrap gap-3",
        compactItems: true,
      }
    );
  }

  function renderMainLinksSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const link = readString(item.content);

        if (!hasText(link)) {
          return null;
        }

        return (
          <div className="rounded-2xl border border-slate-200 px-4 py-3">
            <p className="break-words text-sm text-slate-700">{link}</p>
          </div>
        );
      },
      <p className="text-sm text-slate-500">No links added yet.</p>,
      {
        gapClassName: "space-y-3",
        compactItems: true,
      }
    );
  }

  function renderMainContactSection() {
    if (
      !hasText(personal.fullName) &&
      !hasText(personal.email) &&
      !hasText(personal.phone) &&
      !hasText(personal.location) &&
      !hasText(personal.linkedIn) &&
      !hasText(personal.website)
    ) {
      return null;
    }

    return (
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
          Contact
        </h2>
        <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
        <div className="mt-6 space-y-2 text-[15px] leading-7 text-slate-700">
          {hasText(personal.fullName) && <p>{personal.fullName}</p>}
          {hasText(personal.email) && <p>{personal.email}</p>}
          {hasText(personal.phone) && <p>{personal.phone}</p>}
          {hasText(personal.location) && <p>{personal.location}</p>}
          {hasText(personal.linkedIn) && <p>{personal.linkedIn}</p>}
          {hasText(personal.website) && <p>{personal.website}</p>}
        </div>
      </div>
    );
  }

  function renderMainCustomSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const entry = readCustomEntry(item.content);

        if (
          !hasText(entry.title) &&
          !hasText(entry.subtitle) &&
          !hasText(entry.meta) &&
          !hasText(entry.description)
        ) {
          return null;
        }

        return (
          <article>
            {(hasText(entry.title) || hasText(entry.subtitle) || hasText(entry.meta)) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {hasText(entry.title) && (
                    <h3 className="text-lg font-semibold text-slate-900">
                      {entry.title}
                    </h3>
                  )}
                  {hasText(entry.subtitle) && (
                    <p className="text-base font-medium text-slate-600">
                      {entry.subtitle}
                    </p>
                  )}
                </div>

                {hasText(entry.meta) && (
                  <div className="text-left sm:text-right">
                    <p
                      className="text-sm font-semibold uppercase tracking-[0.24em]"
                      style={{ color: theme.primary }}
                    >
                      {entry.meta}
                    </p>
                  </div>
                )}
              </div>
            )}

            {hasText(entry.description) && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {entry.description}
              </p>
            )}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No items added yet.</p>,
      {
        gapClassName: "space-y-5",
      }
    );
  }

  function renderMainSection(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return (
          <div>
            {renderProfilePhoto("main")}

            {hasText(personal.fullName) && (
              <h1 className="break-words text-3xl font-bold leading-tight text-slate-900">
                {personal.fullName}
              </h1>
            )}

            {hasText(personal.headline) && (
              <p
                className="mt-3 text-sm font-semibold uppercase tracking-[0.3em]"
                style={{ color: theme.primary }}
              >
                {personal.headline}
              </p>
            )}
          </div>
        );

      case "summary":
        if (!hasText(summary)) {
          return null;
        }

        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Professional Summary
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <p className="mt-6 text-sm leading-8 text-slate-700">{summary}</p>
          </div>
        );

      case "experience":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Experience
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainExperienceSection(section)}</div>
          </div>
        );

      case "education":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Education
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainEducationSection(section)}</div>
          </div>
        );

      case "projects":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Projects
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainProjectsSection(section)}</div>
          </div>
        );

      case "certifications":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Certifications
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainCertificationsSection(section)}</div>
          </div>
        );

      case "skills":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Skills
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainSkillsSection(section)}</div>
          </div>
        );

      case "links":
        return (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
              Links
            </h2>
            <div className="mt-4 h-px" style={{ backgroundColor: theme.softBorder }} />
            <div className="mt-6">{renderMainLinksSection(section)}</div>
          </div>
        );

      case "contact":
        return renderMainContactSection();

      case "custom":
        return renderMainCustomSection(section);

      default:
        return null;
    }
  }

  function renderSectionShell(section: ResumeSection, zone: ResumeZone) {
    if (!editable && !hasRenderableSectionContent(section)) {
      return null;
    }

    const isDraggedSection = draggedSectionId === section.id;
    const isDropTargetSection = dropTargetSectionId === section.id;
    const sectionDropEnabled = editable && !draggedItem;

    const interactiveClasses = editable
      ? zone === "sidebar"
        ? "ring-1 ring-transparent transition hover:ring-white/20"
        : "ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTargetSection
      ? zone === "sidebar"
        ? "ring-2 ring-white/60"
        : "ring-2 ring-slate-400"
      : "";

    const dragStateClass = isDraggedSection ? "opacity-60" : "";

    return (
      <div
        key={section.id}
        onDragEnter={
          sectionDropEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onSectionDragEnter?.(section.id);
              }
            : undefined
        }
        onDragOver={
          sectionDropEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          sectionDropEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onSectionDrop?.(section.id);
              }
            : undefined
        }
        data-zone={zone}
        data-resume-section-type={section.type}
        data-print-strategy={getResumeSectionPrintStrategy(section, zone)}
        className={`resume-section-block rounded-2xl px-2 py-2 ${interactiveClasses} ${dropClasses} ${dragStateClass}`}
      >
        {editable && (
          <div className="mb-3 flex items-center gap-2">
            <div
              draggable
              onDragStart={(event: DragEvent<HTMLDivElement>) => {
                event.stopPropagation();
                onSectionDragStart?.(section.id);
              }}
              onDragEnd={(event: DragEvent<HTMLDivElement>) => {
                event.stopPropagation();
                onSectionDragEnd?.();
              }}
              className={`inline-flex cursor-grab rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] active:cursor-grabbing ${
                zone === "sidebar"
                  ? "border-white/20 text-slate-300"
                  : "border-slate-300 text-slate-500"
              }`}
            >
              Drag section
            </div>
          </div>
        )}

        {zone === "sidebar"
          ? renderSidebarSection(section)
          : renderMainSection(section)}
      </div>
    );
  }

  return (
    <div
      className="resume-preview-page resume-preview-surface mx-auto w-full rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 print:rounded-none print:bg-transparent print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <div className="resume-preview-grid grid grid-cols-1 md:grid-cols-[280px_1fr] print:grid-cols-[280px_1fr]">
        <aside
          className="resume-preview-sidebar px-8 py-10 print:bg-transparent"
          style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
          onDragOver={
            editable && !draggedItem
              ? (event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable && !draggedItem
              ? (event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  onZoneDrop?.("sidebar");
                }
              : undefined
          }
        >
          <div className="resume-sidebar-fragment space-y-8">
            {sidebarSections.map((section) => renderSectionShell(section, "sidebar"))}
          </div>
        </aside>

        <section
          className="resume-preview-main px-8 py-10 md:px-10"
          onDragOver={
            editable && !draggedItem
              ? (event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable && !draggedItem
              ? (event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  onZoneDrop?.("main");
                }
              : undefined
          }
        >
          <div className="space-y-12 print-main-fragment">
            {mainSections.map((section) => renderSectionShell(section, "main"))}
          </div>
        </section>
      </div>
    </div>
  );
}