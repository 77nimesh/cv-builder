"use client";

import type { DragEvent, ReactNode } from "react";
import type { ResumeSection, ResumeSectionItem, ResumeZone } from "@/lib/types";
import {
  getPersonalDetails,
  getSummaryText,
  getVisibleSections,
  hasRenderableSectionContent,
} from "@/lib/resume/selectors";
import { getResumeSectionPrintStrategy } from "@/components/templates/export-layout";
import { resolveResumeFont } from "@/components/templates/font-presets";
import ResumePhoto from "@/components/templates/resume-photo";
import { resolveResumeTheme } from "@/components/templates/theme-presets";
import type { ResumeTemplateProps } from "@/components/templates/types";
import {
  compactTextParts,
  formatDateRange,
  getOrderedItems,
  hasText,
  joinTextParts,
  normalizePhotoPath,
  normalizePhotoShape,
  readCertificationItem,
  readCustomEntry,
  readEducationItem,
  readExperienceItem,
  readProjectItem,
  readSkillItem,
  readString,
  supportsItemDrag,
} from "@/components/templates/template-utils";

export default function AtsCleanTemplateFour({
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
  const theme = resolveResumeTheme(data.layout.themeColor);
  const font = resolveResumeFont(data.layout.fontFamily);
  const normalizedPhotoPath = normalizePhotoPath(photoPath);
  const photoShape = normalizePhotoShape(data.layout.photoShape);
  const allSections = visibleSections;
  const contactLine = joinTextParts(
    [personal.email, personal.phone, personal.location, personal.linkedIn, personal.website],
    " | "
  );

  function renderProfilePhoto() {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <ResumePhoto
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        shape={photoShape}
        squareClassName="rounded-2xl"
        className="h-24 w-24 border"
        style={{ borderColor: theme.softBorder }}
      />
    );
  }

  function renderHeading(section: ResumeSection) {
    return (
      <h2
        className="border-b pb-2.5 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ borderColor: theme.softBorder, color: theme.primary }}
      >
        {section.title}
      </h2>
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

    return (
      <div
        key={`${section.id}-${item.id}`}
        className={`${options.compact ? "py-1" : "py-2"} ${
          itemDragEnabled ? "rounded-xl ring-1 ring-transparent transition hover:ring-slate-300" : ""
        } ${isDropTargetItem ? "ring-2 ring-slate-400" : ""} ${
          isDraggedItem ? "opacity-60" : ""
        }`}
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
        {itemDragEnabled ? (
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
            className="mb-2 inline-flex cursor-grab rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 active:cursor-grabbing print:hidden"
          >
            Drag item
          </div>
        ) : null}

        <div className="print-avoid-break">{content}</div>
      </div>
    );
  }

  function renderItemList(
    section: ResumeSection,
    renderItem: (item: ResumeSectionItem, index: number) => ReactNode,
    emptyState: ReactNode,
    options: { gapClassName?: string; compactItems?: boolean } = {}
  ) {
    const orderedItems = getOrderedItems(section);
    const itemDragEnabled = editable && supportsItemDrag(section);

    return (
      <div
        className={options.gapClassName ?? "space-y-3"}
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
          : emptyState}
      </div>
    );
  }

  function renderPersonalDetailsSection() {
    return (
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          {hasText(personal.fullName) ? (
            <h1 className="break-words text-4xl font-bold leading-tight tracking-[-0.025em] text-slate-950">
              {personal.fullName}
            </h1>
          ) : null}
          {hasText(personal.headline) ? (
            <p className="mt-2.5 text-base font-semibold text-slate-600">
              {personal.headline}
            </p>
          ) : null}
          {hasText(contactLine) ? (
            <p className="mt-4 break-words text-sm leading-6 text-slate-600">
              {contactLine}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">{renderProfilePhoto()}</div>
      </div>
    );
  }

  function renderExperienceSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const experience = readExperienceItem(item.content);
        const dateRange = formatDateRange(experience.startDate, experience.endDate);
        const roleAndCompany = compactTextParts([experience.role, experience.company]);
        const meta = compactTextParts([experience.location, dateRange]);

        if (roleAndCompany.length === 0 && meta.length === 0 && !hasText(experience.description)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {roleAndCompany.length > 0 ? (
                  <h3 className="text-[15px] font-bold leading-snug text-slate-950">
                    {roleAndCompany.join(" — ")}
                  </h3>
                ) : null}
                {hasText(experience.location) ? (
                  <p className="mt-1 text-sm text-slate-600">{experience.location}</p>
                ) : null}
              </div>
              {hasText(dateRange) ? (
                <p className="text-sm font-medium text-slate-500">{dateRange}</p>
              ) : null}
            </div>
            {hasText(experience.description) ? (
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {experience.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm italic text-slate-400">No experience added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderEducationSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const education = readEducationItem(item.content);
        const dateRange = formatDateRange(education.startDate, education.endDate);
        const title = compactTextParts([education.degree, education.institution]).join(" — ");
        const meta = compactTextParts([education.location, dateRange]);

        if (!hasText(title) && meta.length === 0 && !hasText(education.description)) {
          return null;
        }

        return (
          <article>
            {hasText(title) ? (
              <h3 className="text-[15px] font-bold leading-snug text-slate-950">{title}</h3>
            ) : null}
            {meta.length > 0 ? (
              <p className="mt-1 text-sm text-slate-600">{meta.join(" | ")}</p>
            ) : null}
            {hasText(education.description) ? (
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {education.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm italic text-slate-400">No education added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderSkillsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const skill = readSkillItem(item.content);

        if (!hasText(skill.name)) {
          return null;
        }

        return (
          <span className="inline-block text-sm leading-7 text-slate-700">
            <span className="font-semibold text-slate-900">{skill.name}</span>
            {hasText(skill.level) ? <span> ({skill.level})</span> : null}
          </span>
        );
      },
      <p className="text-sm italic text-slate-400">No skills added yet.</p>,
      { gapClassName: "flex flex-wrap gap-x-4 gap-y-1", compactItems: true }
    );
  }

  function renderProjectsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const project = readProjectItem(item.content);
        const dateRange = formatDateRange(project.startDate, project.endDate);
        const meta = compactTextParts([project.role, dateRange, project.url]);

        if (!hasText(project.name) && meta.length === 0 && !hasText(project.description)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              {hasText(project.name) ? (
                <h3 className="text-[15px] font-bold leading-snug text-slate-950">{project.name}</h3>
              ) : null}
              {hasText(dateRange) ? (
                <p className="text-sm font-medium text-slate-500">{dateRange}</p>
              ) : null}
            </div>
            {meta.length > 0 ? (
              <p className="mt-1 break-words text-sm text-slate-600">{meta.join(" | ")}</p>
            ) : null}
            {hasText(project.description) ? (
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {project.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm italic text-slate-400">No projects added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderCertificationsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const certification = readCertificationItem(item.content);
        const meta = compactTextParts([
          certification.issuer,
          certification.issueDate,
          certification.credentialId,
          certification.url,
        ]);

        if (!hasText(certification.name)) {
          return null;
        }

        return (
          <article>
            <h3 className="text-[15px] font-bold leading-snug text-slate-950">{certification.name}</h3>
            {meta.length > 0 ? (
              <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                {meta.join(" | ")}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm italic text-slate-400">No certifications added yet.</p>,
      { gapClassName: "space-y-3" }
    );
  }

  function renderCustomSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const entry = readCustomEntry(item.content);
        const title = compactTextParts([entry.title, entry.subtitle]).join(" — ");
        const meta = entry.meta;

        if (!hasText(title) && !hasText(meta) && !hasText(entry.description)) {
          return null;
        }

        return (
          <article>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              {hasText(title) ? (
                <h3 className="text-[15px] font-bold leading-snug text-slate-950">{title}</h3>
              ) : null}
              {hasText(meta) ? (
                <p className="text-sm font-medium text-slate-500">{meta}</p>
              ) : null}
            </div>
            {hasText(entry.description) ? (
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {entry.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm italic text-slate-400">No items added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderSectionContent(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return renderPersonalDetailsSection();

      case "summary":
        return hasText(summary) ? (
          <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
        ) : null;

      case "experience":
        return renderExperienceSection(section);

      case "education":
        return renderEducationSection(section);

      case "skills":
        return renderSkillsSection(section);

      case "projects":
        return renderProjectsSection(section);

      case "certifications":
        return renderCertificationsSection(section);

      case "links":
        return renderItemList(
          section,
          (item) => {
            const link = readString(item.content);

            return hasText(link) ? (
              <p className="break-words text-sm leading-relaxed text-slate-700">{link}</p>
            ) : null;
          },
          <p className="text-sm italic text-slate-400">No links added yet.</p>,
          { gapClassName: "space-y-2", compactItems: true }
        );

      case "contact":
        return (
          <p className="text-sm leading-7 text-slate-700">
            {contactLine || "No contact details added yet."}
          </p>
        );

      case "custom":
        return renderCustomSection(section);

      default:
        return null;
    }
  }

  function renderSectionShell(section: ResumeSection) {
    if (!editable && !hasRenderableSectionContent(section)) {
      return null;
    }

    const isDraggedSection = draggedSectionId === section.id;
    const isDropTargetSection = dropTargetSectionId === section.id;
    const sectionDropEnabled = editable && !draggedItem;
    const sectionContent = renderSectionContent(section);

    return (
      <section
        key={section.id}
        onDragEnter={
          sectionDropEnabled
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                onSectionDragEnter?.(section.id);
              }
            : undefined
        }
        onDragOver={
          sectionDropEnabled
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          sectionDropEnabled
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                onSectionDrop?.(section.id);
              }
            : undefined
        }
        data-zone="main"
        data-resume-section-type={section.type}
        data-print-strategy={getResumeSectionPrintStrategy(section, "main")}
        className={`resume-section-block ${
          section.type === "personal-details" ? "pt-0" : "pt-4"
        } ${editable ? "rounded-2xl px-2 py-2 ring-1 ring-transparent transition hover:ring-slate-300" : ""} ${
          isDropTargetSection ? "ring-2 ring-slate-400" : ""
        } ${isDraggedSection ? "opacity-60" : ""}`}
      >
        {editable ? (
          <div className="mb-3 flex items-center gap-2 print:hidden">
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
              className="inline-flex cursor-grab rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 active:cursor-grabbing"
            >
              Drag section
            </div>
          </div>
        ) : null}

        {section.type === "personal-details" ? null : renderHeading(section)}
        <div className={section.type === "personal-details" ? "" : "mt-4"}>{sectionContent}</div>
      </section>
    );
  }

  function renderDropHandlers() {
    if (!editable || draggedItem) {
      return {};
    }

    return {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        onZoneDrop?.("main");
      },
    };
  }

  return (
    <div
      className="resume-preview-page resume-preview-surface mx-auto w-full rounded-none bg-white shadow-sm ring-1 ring-slate-200/80 print:bg-transparent print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <main className="resume-preview-main px-10 py-10 print:px-10" {...renderDropHandlers()}>
        <div className="print-main-fragment space-y-6">
          {allSections.map((section) => renderSectionShell(section))}
        </div>
      </main>
    </div>
  );
}
