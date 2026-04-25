"use client";

import type { DragEvent, ReactNode } from "react";
import type { ResumeSection, ResumeSectionItem } from "@/lib/types";
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

export default function TwoPageProTemplateTwelve({
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
  const showPersonal = visibleSections.some((section) => section.type === "personal-details");
  const contentSections = visibleSections.filter(
    (section) => section.type !== "personal-details" && section.type !== "summary"
  );
  const contactLine = joinTextParts(
    [personal.email, personal.phone, personal.location, personal.linkedIn, personal.website],
    " | "
  );

  function renderProfileBadge() {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <ResumePhoto
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        shape={photoShape}
        squareClassName="rounded-2xl"
        className="h-24 w-24 border-4 object-cover shadow-sm"
        style={{ borderColor: theme.softBorder }}
      />
    );
  }

  function renderHeroHeader() {
    if (!showPersonal && !hasText(summary)) {
      return null;
    }

    return (
      <header className="print-avoid-break px-10 py-9">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 flex-1">
            {showPersonal && hasText(personal.fullName) ? (
              <h1 className="break-words text-5xl font-black leading-none tracking-[-0.06em] text-slate-950">
                {personal.fullName}
              </h1>
            ) : null}
            {showPersonal && hasText(personal.headline) ? (
              <p
                className="mt-3 text-xs font-black uppercase tracking-[0.26em]"
                style={{ color: theme.primary }}
              >
                {personal.headline}
              </p>
            ) : null}
            {hasText(contactLine) ? (
              <p className="mt-4 break-words text-sm font-medium leading-6 text-slate-600">
                {contactLine}
              </p>
            ) : null}
          </div>
          <div className="shrink-0">{renderProfileBadge()}</div>
        </div>

        {hasText(summary) ? (
          <div
            className="mt-7 rounded-3xl border p-5"
            style={{ borderColor: theme.softBorder, backgroundColor: theme.softBackground }}
          >
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {summary}
            </p>
          </div>
        ) : null}
      </header>
    );
  }

  function renderHeading(section: ResumeSection) {
    return (
      <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-950">
        {section.title}
      </h2>
    );
  }

  function renderItemDragHandle(section: ResumeSection, item: ResumeSectionItem) {
    if (!editable || !supportsItemDrag(section)) {
      return null;
    }

    return (
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
        className="mb-2 inline-flex cursor-grab rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 active:cursor-grabbing print:hidden"
      >
        Drag item
      </div>
    );
  }

  function renderItemShell(
    section: ResumeSection,
    item: ResumeSectionItem,
    content: ReactNode,
    compact = false
  ) {
    const itemDragEnabled = editable && supportsItemDrag(section);
    const isDraggedItem =
      draggedItem?.sectionId === section.id && draggedItem.itemId === item.id;
    const isDropTargetItem =
      dropTargetItem?.sectionId === section.id && dropTargetItem.itemId === item.id;

    return (
      <div
        key={`${section.id}-${item.id}`}
        className={`${compact ? "py-1" : "py-2"} transition ${
          isDropTargetItem ? "rounded-xl ring-2 ring-slate-400" : ""
        } ${isDraggedItem ? "opacity-60" : ""}`}
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
        {renderItemDragHandle(section, item)}
        <div className="print-avoid-break">{content}</div>
      </div>
    );
  }

  function renderItemList(
    section: ResumeSection,
    renderItem: (item: ResumeSectionItem) => ReactNode,
    emptyState: ReactNode,
    options: { gapClassName?: string; compactItems?: boolean } = {}
  ) {
    const orderedItems = getOrderedItems(section);
    const itemDragEnabled = editable && supportsItemDrag(section);

    return (
      <div
        className={options.gapClassName ?? "space-y-4"}
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
          ? orderedItems.map((item) =>
              renderItemShell(section, item, renderItem(item), options.compactItems)
            )
          : emptyState}
      </div>
    );
  }

  function renderEmptyState(label: string) {
    return <p className="text-sm text-slate-400">Add {label} entries to display them here.</p>;
  }

  function renderExperienceSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const experience = readExperienceItem(item.content);
      const dateRange = formatDateRange(experience.startDate, experience.endDate);
      const title = compactTextParts([experience.role, experience.company]).join(" — ");
      const meta = compactTextParts([experience.location, dateRange]);

      return (
        <article>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            {hasText(title) ? (
              <h3 className="text-[15px] font-semibold text-slate-950">{title}</h3>
            ) : null}
            {hasText(dateRange) ? (
              <p className="text-sm font-medium text-slate-500">{dateRange}</p>
            ) : null}
          </div>
          {meta.length > 0 ? (
            <p className="mt-1 text-sm text-slate-500">{meta.join(" | ")}</p>
          ) : null}
          {hasText(experience.description) ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
              {experience.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("experience"));
  }

  function renderEducationSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const education = readEducationItem(item.content);
      const dateRange = formatDateRange(education.startDate, education.endDate);
      const title = compactTextParts([education.degree, education.institution]).join(" — ");
      const meta = compactTextParts([education.location, dateRange]);

      return (
        <article>
          {hasText(title) ? (
            <h3 className="text-[15px] font-semibold text-slate-950">{title}</h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="mt-1 text-sm text-slate-500">{meta.join(" | ")}</p>
          ) : null}
          {hasText(education.description) ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
              {education.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("education"));
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
            <span className="font-semibold text-slate-950">{skill.name}</span>
            {hasText(skill.level) ? <span> ({skill.level})</span> : null}
          </span>
        );
      },
      renderEmptyState("skills"),
      { gapClassName: "flex flex-wrap gap-x-4 gap-y-1", compactItems: true }
    );
  }

  function renderProjectsSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const project = readProjectItem(item.content);
      const dateRange = formatDateRange(project.startDate, project.endDate);
      const meta = compactTextParts([project.role, dateRange, project.url]);

      return (
        <article>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            {hasText(project.name) ? (
              <h3 className="text-[15px] font-semibold text-slate-950">{project.name}</h3>
            ) : null}
            {hasText(dateRange) ? (
              <p className="text-sm font-medium text-slate-500">{dateRange}</p>
            ) : null}
          </div>
          {meta.length > 0 ? (
            <p className="mt-1 break-words text-sm text-slate-500">{meta.join(" | ")}</p>
          ) : null}
          {hasText(project.description) ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
              {project.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("projects"));
  }

  function renderCertificationsSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const certification = readCertificationItem(item.content);
      const meta = compactTextParts([
        certification.issuer,
        certification.issueDate,
        certification.credentialId,
        certification.url,
      ]);

      return (
        <article>
          {hasText(certification.name) ? (
            <h3 className="text-[15px] font-semibold text-slate-950">
              {certification.name}
            </h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="mt-1 break-words text-sm leading-6 text-slate-500">
              {meta.join(" | ")}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("certifications"));
  }

  function renderCustomSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const entry = readCustomEntry(item.content);
      const title = compactTextParts([entry.title, entry.subtitle]).join(" — ");

      return (
        <article>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            {hasText(title) ? (
              <h3 className="text-[15px] font-semibold text-slate-950">{title}</h3>
            ) : null}
            {hasText(entry.meta) ? (
              <p className="text-sm font-medium text-slate-500">{entry.meta}</p>
            ) : null}
          </div>
          {hasText(entry.description) ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
              {entry.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("custom"));
  }

  function renderSectionContent(section: ResumeSection) {
    switch (section.type) {
      case "summary":
        return hasText(summary) ? (
          <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{summary}</p>
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
              <p className="break-words text-sm leading-6 text-slate-700">{link}</p>
            ) : null;
          },
          renderEmptyState("links"),
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
        className={`resume-section-block border-t border-slate-200 pt-5 ${
          editable ? "rounded-xl px-2 py-2 ring-1 ring-transparent transition hover:ring-slate-300" : ""
        } ${isDropTargetSection ? "ring-2 ring-slate-400" : ""} ${
          isDraggedSection ? "opacity-60" : ""
        }`}
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
              className="inline-flex cursor-grab rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 active:cursor-grabbing"
            >
              Drag section
            </div>
          </div>
        ) : null}

        {renderHeading(section)}
        <div className="mt-4">{sectionContent}</div>
      </section>
    );
  }

  function getContinuationDividerIndex() {
    const firstNonExperienceIndex = contentSections.findIndex(
      (section, index) => index > 0 && section.type !== "experience"
    );

    return firstNonExperienceIndex > 0 ? firstNonExperienceIndex : -1;
  }

  function renderContinuationDivider() {
    return (
      <div
        className="print-avoid-break my-8 rounded-3xl border px-5 py-4"
        style={{ borderColor: theme.softBorder, backgroundColor: theme.softBackground }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.28em]"
          style={{ color: theme.primary }}
        >
          Continued professional profile
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Supporting projects, education, credentials, and additional sections continue below.
        </p>
      </div>
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

  const continuationDividerIndex = getContinuationDividerIndex();

  return (
    <article
      className="resume-preview-page resume-preview-surface mx-auto min-h-[1123px] w-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 print:bg-transparent print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <div className="h-3 w-full" style={{ backgroundColor: theme.primary }} />
      {renderHeroHeader()}

      <main className="resume-preview-main px-10 pb-10 pt-1" {...renderDropHandlers()}>
        <div className="print-main-fragment space-y-6">
          {contentSections.map((section, index) => (
            <div key={section.id}>
              {index === continuationDividerIndex ? renderContinuationDivider() : null}
              {renderSectionShell(section)}
            </div>
          ))}
        </div>
      </main>
    </article>
  );
}