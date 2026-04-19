"use client";

import type { DragEvent, ReactNode } from "react";
import type {
  CertificationItem,
  CustomSectionEntry,
  EducationItem,
  ExperienceItem,
  ProjectItem,
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
import type { ResumeTemplateProps } from "@/components/templates/types";
import ResumePhoto from "@/components/templates/resume-photo";

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

function readSkillItem(content: unknown): SkillItem {
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

export default function ModernTemplateTwo({
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
}: ResumeTemplateProps) {
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
      <ResumePhoto
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        shape={photoShape}
        squareClassName="rounded-3xl"
        className={
          variant === "sidebar"
            ? "h-40 w-40 border"
            : "h-52 w-52 border-4 border-white shadow-sm"
        }
        style={
          variant === "sidebar"
            ? { borderColor: theme.softBorder }
            : undefined
        }
      />
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
      ? "rounded-2xl px-3 py-3 print:px-0 print:py-0"
      : "rounded-2xl px-4 py-4 print:px-0 print:py-0";

    const hoverClasses = itemDragEnabled
      ? "ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTargetItem ? "ring-2 ring-slate-400" : "";
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
            className="mb-3 inline-flex cursor-grab rounded-full border border-slate-300 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 active:cursor-grabbing print:hidden"
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
            <div className="flex flex-col items-start gap-5">
              {renderProfilePhoto("sidebar")}

              <div className="min-w-0 w-full">
                {hasText(personal.headline) && (
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.3em]"
                    style={{ color: theme.secondaryText }}
                  >
                    {personal.headline}
                  </p>
                )}

                {hasText(personal.fullName) && (
                  <h1 className="mt-3 break-words text-4xl font-bold leading-tight">
                    {personal.fullName}
                  </h1>
                )}

                <div className="mt-6 space-y-1 text-sm text-slate-600">
                  {hasText(personal.email) && <p className="break-words">{personal.email}</p>}
                  {hasText(personal.phone) && <p>{personal.phone}</p>}
                  {hasText(personal.location) && <p>{personal.location}</p>}
                  {hasText(personal.linkedIn) && (
                    <p className="break-words">{personal.linkedIn}</p>
                  )}
                  {hasText(personal.website) && (
                    <p className="break-words">{personal.website}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "summary":
        if (!hasText(summary)) {
          return null;
        }

        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Summary
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">{summary}</p>
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
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-medium text-slate-800">{skill.name}</p>
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
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
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

      case "education":
        return renderItemList(
          section,
          (item) => {
            const education = readEducationItem(item.content);

            if (!hasText(education.institution) && !hasText(education.degree)) {
              return null;
            }

            return (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                {hasText(education.degree) && (
                  <p className="text-sm font-semibold text-slate-900">
                    {education.degree}
                  </p>
                )}
                {hasText(education.institution) && (
                  <p className="mt-1 text-sm text-slate-700">{education.institution}</p>
                )}
                {hasText(formatDateRange(education.startDate, education.endDate)) && (
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {formatDateRange(education.startDate, education.endDate)}
                  </p>
                )}
                {hasText(education.location) && (
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {education.location}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-500">No education added yet.</p>,
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
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {certification.name}
                </p>
                {hasText(certification.issuer) && (
                  <p className="mt-1 text-sm text-slate-700">{certification.issuer}</p>
                )}
                {hasText(certification.issueDate) && (
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {certification.issueDate}
                  </p>
                )}
                {hasText(certification.credentialId) && (
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {certification.credentialId}
                  </p>
                )}
                {hasText(certification.url) && (
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {certification.url}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-500">No certifications added yet.</p>,
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
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                {hasText(entry.title) && (
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.title}
                  </p>
                )}
                {hasText(entry.subtitle) && (
                  <p className="mt-1 text-sm text-slate-700">{entry.subtitle}</p>
                )}
                {hasText(entry.meta) && (
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {entry.meta}
                  </p>
                )}
                {hasText(entry.description) && (
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {entry.description}
                  </p>
                )}
              </div>
            );
          },
          <p className="text-sm text-slate-500">No items added yet.</p>,
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
        <h2
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: theme.secondaryText }}
        >
          Contact
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
          {[
            personal.fullName,
            personal.email,
            personal.phone,
            personal.location,
            personal.linkedIn,
            personal.website,
          ]
            .filter((value) => hasText(value))
            .join("\n")}
        </p>
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
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                {hasText(personal.headline) && (
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.3em]"
                    style={{ color: theme.secondaryText }}
                  >
                    {personal.headline}
                  </p>
                )}

                {hasText(personal.fullName) && (
                  <h1 className="mt-3 break-words text-4xl font-bold leading-tight">
                    {personal.fullName}
                  </h1>
                )}

                <div className="mt-6 space-y-1 text-sm text-slate-600">
                  {hasText(personal.email) && <p className="break-words">{personal.email}</p>}
                  {hasText(personal.phone) && <p>{personal.phone}</p>}
                  {hasText(personal.location) && <p>{personal.location}</p>}
                  {hasText(personal.linkedIn) && (
                    <p className="break-words">{personal.linkedIn}</p>
                  )}
                  {hasText(personal.website) && (
                    <p className="break-words">{personal.website}</p>
                  )}
                </div>
              </div>

              <div className="shrink-0">{renderProfilePhoto("main")}</div>
            </div>
          </div>
        );

      case "summary":
        if (!hasText(summary)) {
          return null;
        }

        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Summary
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">{summary}</p>
          </div>
        );

      case "experience":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Experience
            </h2>
            <div className="mt-6">{renderMainExperienceSection(section)}</div>
          </div>
        );

      case "education":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Education
            </h2>
            <div className="mt-6">{renderMainEducationSection(section)}</div>
          </div>
        );

      case "projects":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Projects
            </h2>
            <div className="mt-6">{renderMainProjectsSection(section)}</div>
          </div>
        );

      case "certifications":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Certifications
            </h2>
            <div className="mt-6">{renderMainCertificationsSection(section)}</div>
          </div>
        );

      case "skills":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Skills
            </h2>
            <div className="mt-6">{renderMainSkillsSection(section)}</div>
          </div>
        );

      case "links":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: theme.secondaryText }}
            >
              Links
            </h2>
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
      ? "ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTargetSection ? "ring-2 ring-slate-400" : "";
    const dragStateClass = isDraggedSection ? "opacity-60" : "";
    const shellBaseClass =
      zone === "main"
        ? "rounded-[28px] border bg-white px-6 py-6 shadow-sm"
        : "rounded-[28px] border px-5 py-5";

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
        className={`resume-section-block ${shellBaseClass} ${interactiveClasses} ${dropClasses} ${dragStateClass}`}
        style={
          zone === "main"
            ? { borderColor: theme.softBorder }
            : {
                borderColor: theme.softBorder,
                backgroundColor: theme.softBackgroundStrong,
              }
        }
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
              className="inline-flex cursor-grab rounded-full border border-slate-300 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 active:cursor-grabbing"
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
      className="resume-preview-page resume-preview-surface mx-auto w-full rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200 print:rounded-none print:bg-transparent print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <div className="resume-preview-grid grid grid-cols-1 md:grid-cols-[1fr_260px] print:grid-cols-[1fr_260px]">
        <section
          className="resume-preview-sidebar order-2 border-t px-6 py-8 md:order-2 md:border-l md:border-t-0 print:border-l"
          style={{
            borderColor: theme.softBorder,
            backgroundColor: theme.softBackground,
          }}
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
          <div className="resume-sidebar-fragment space-y-6">
            {sidebarSections.map((section) => renderSectionShell(section, "sidebar"))}
          </div>
        </section>

        <main
          className="resume-preview-main order-1 px-6 py-8 md:px-8 print:px-8"
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
          <div className="space-y-7 print-main-fragment">
            {mainSections.map((section) => renderSectionShell(section, "main"))}
          </div>
        </main>
      </div>
    </div>
  );
}