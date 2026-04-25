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
  supportsItemDrag,
} from "@/components/templates/template-utils";

export default function TechnicalCompactTemplateSix({
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
  const visibleSections = getVisibleSections(data).filter(hasRenderableSectionContent);
  const theme = resolveResumeTheme(data.layout.themeColor);
  const font = resolveResumeFont(data.layout.fontFamily);
  const normalizedPhotoPath = normalizePhotoPath(photoPath);
  const photoShape = normalizePhotoShape(data.layout.photoShape);
  const showPersonal = visibleSections.some((section) => section.type === "personal-details");
  const showSummary = visibleSections.some((section) => section.type === "summary") && hasText(summary);
  const contactLine = joinTextParts(
    [personal.email, personal.phone, personal.location, personal.linkedIn, personal.website],
    " • "
  );
  const mainSections = visibleSections.filter(
    (section) =>
      section.zone === "main" &&
      section.type !== "personal-details" &&
      section.type !== "summary"
  );
  const sidebarSections = visibleSections.filter(
    (section) =>
      section.zone === "sidebar" &&
      section.type !== "personal-details" &&
      section.type !== "summary"
  );

  function renderPhoto() {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <ResumePhoto
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        shape={photoShape}
        squareClassName="rounded-2xl"
        className="h-20 w-20 border"
        style={{ borderColor: theme.softBorder }}
      />
    );
  }

  function renderSectionDragHandle(section: ResumeSection) {
    if (!editable) {
      return null;
    }

    return (
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
        className="mb-2 inline-flex cursor-grab rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 active:cursor-grabbing print:hidden"
      >
        Drag section
      </div>
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
        className="mb-1 inline-flex cursor-grab rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 active:cursor-grabbing print:hidden"
      >
        Drag item
      </div>
    );
  }

  function renderItemShell(
    section: ResumeSection,
    item: ResumeSectionItem,
    content: ReactNode
  ) {
    const itemDragEnabled = editable && supportsItemDrag(section);
    const isDraggedItem =
      draggedItem?.sectionId === section.id && draggedItem.itemId === item.id;
    const isDropTargetItem =
      dropTargetItem?.sectionId === section.id && dropTargetItem.itemId === item.id;

    return (
      <div
        key={`${section.id}-${item.id}`}
        className={`transition ${isDropTargetItem ? "rounded-xl ring-2 ring-slate-400" : ""} ${
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
        {renderItemDragHandle(section, item)}
        <div className="print-avoid-break">{content}</div>
      </div>
    );
  }

  function renderItemList(
    section: ResumeSection,
    renderItem: (item: ResumeSectionItem) => ReactNode,
    emptyState: ReactNode,
    gapClassName = "space-y-3"
  ) {
    const orderedItems = getOrderedItems(section);
    const itemDragEnabled = editable && supportsItemDrag(section);

    return (
      <div
        className={gapClassName}
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
          ? orderedItems.map((item) => renderItemShell(section, item, renderItem(item)))
          : emptyState}
      </div>
    );
  }

  function renderEmptyState(label: string) {
    return <p className="text-xs italic text-slate-400">Add {label} entries.</p>;
  }

  function renderHeading(section: ResumeSection, zone: ResumeZone) {
    return (
      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-5 w-1.5 rounded-full"
          style={{ backgroundColor: theme.primary }}
        />
        <h2
          className={`font-black uppercase tracking-[0.16em] ${
            zone === "sidebar" ? "text-[10px]" : "text-[11px]"
          }`}
          style={{ color: zone === "sidebar" ? theme.primary : "#0f172a" }}
        >
          {section.title}
        </h2>
      </div>
    );
  }

  function renderSectionShell(
    section: ResumeSection,
    zone: ResumeZone,
    content: ReactNode
  ) {
    const isDraggedSection = draggedSectionId === section.id;
    const isDropTargetSection = dropTargetSectionId === section.id;
    const printStrategy = getResumeSectionPrintStrategy(section, zone);

    return (
      <section
        key={section.id}
        className={`resume-section-block ${
          zone === "sidebar" ? "border-b pb-4 last:border-b-0" : "border-b pb-5 last:border-b-0"
        } ${isDropTargetSection ? "rounded-xl ring-2 ring-slate-400" : ""} ${
          isDraggedSection ? "opacity-60" : ""
        }`}
        style={{ borderColor: theme.softBorder }}
        data-print-strategy={printStrategy}
        onDragEnter={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
                onSectionDragEnter?.(section.id);
              }
            : undefined
        }
        onDragOver={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : undefined
        }
        onDrop={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
                onSectionDrop?.(section.id);
              }
            : undefined
        }
      >
        {renderSectionDragHandle(section)}
        {renderHeading(section, zone)}
        {content}
      </section>
    );
  }

  function renderExperienceSection(section: ResumeSection, zone: ResumeZone) {
    return renderItemList(section, (item) => {
      const experience = readExperienceItem(item.content);
      const title = compactTextParts([experience.role, experience.company]).join(" @ ");
      const meta = compactTextParts([
        experience.location,
        formatDateRange(experience.startDate, experience.endDate),
      ]);

      return (
        <article className="grid gap-1">
          {hasText(title) ? (
            <h3
              className={`font-bold leading-snug text-slate-950 ${
                zone === "sidebar" ? "text-xs" : "text-[15px]"
              }`}
            >
              {title}
            </h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {meta.join(" • ")}
            </p>
          ) : null}
          {hasText(experience.description) ? (
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {experience.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("experience"), zone === "sidebar" ? "space-y-3" : "space-y-4");
  }

  function renderEducationSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const education = readEducationItem(item.content);
      const title = compactTextParts([education.degree, education.institution]).join(" · ");
      const meta = compactTextParts([
        education.location,
        formatDateRange(education.startDate, education.endDate),
      ]);

      return (
        <article className="space-y-1">
          {hasText(title) ? (
            <h3 className="text-sm font-bold leading-snug text-slate-950">{title}</h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {meta.join(" • ")}
            </p>
          ) : null}
          {hasText(education.description) ? (
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {education.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("education"));
  }

  function renderSkillsSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const skill = readSkillItem(item.content);
      const label = compactTextParts([skill.name, skill.level]).join(" · ");

      if (!hasText(label)) {
        return null;
      }

      return (
        <div
          className="rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
          style={{
            borderColor: theme.softBorder,
            backgroundColor: theme.softBackground,
            color: theme.primary,
          }}
        >
          {label}
        </div>
      );
    }, renderEmptyState("skills"), "grid grid-cols-1 gap-2");
  }

  function renderProjectsSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const project = readProjectItem(item.content);
      const title = compactTextParts([project.name, project.role]).join(" · ");
      const meta = compactTextParts([
        project.url,
        formatDateRange(project.startDate, project.endDate),
      ]);

      return (
        <article className="space-y-1">
          {hasText(title) ? (
            <h3 className="text-sm font-bold leading-snug text-slate-950">{title}</h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="break-words text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {meta.join(" • ")}
            </p>
          ) : null}
          {hasText(project.description) ? (
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
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
      const title = compactTextParts([certification.name, certification.issuer]).join(" · ");
      const meta = compactTextParts([certification.issueDate, certification.credentialId]);

      return (
        <article className="space-y-1">
          {hasText(title) ? (
            <h3 className="text-sm font-bold leading-snug text-slate-950">{title}</h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {meta.join(" • ")}
            </p>
          ) : null}
          {hasText(certification.url) ? (
            <p className="break-words text-xs text-slate-500">{certification.url}</p>
          ) : null}
        </article>
      );
    }, renderEmptyState("certifications"));
  }

  function renderCustomSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const entry = readCustomEntry(item.content);
      const title = compactTextParts([entry.title, entry.subtitle]).join(" · ");

      return (
        <article className="space-y-1">
          {hasText(title) ? (
            <h3 className="text-sm font-bold leading-snug text-slate-950">{title}</h3>
          ) : null}
          {hasText(entry.meta) ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {entry.meta}
            </p>
          ) : null}
          {hasText(entry.description) ? (
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {entry.description}
            </p>
          ) : null}
        </article>
      );
    }, renderEmptyState("custom"));
  }

  function renderSection(section: ResumeSection, zone: ResumeZone) {
    switch (section.type) {
      case "experience":
        return renderSectionShell(section, zone, renderExperienceSection(section, zone));
      case "education":
        return renderSectionShell(section, zone, renderEducationSection(section));
      case "skills":
        return renderSectionShell(section, zone, renderSkillsSection(section));
      case "projects":
        return renderSectionShell(section, zone, renderProjectsSection(section));
      case "certifications":
        return renderSectionShell(section, zone, renderCertificationsSection(section));
      case "custom":
        return renderSectionShell(section, zone, renderCustomSection(section));
      default:
        return null;
    }
  }

  return (
    <article
      className="resume-preview-grid grid min-h-[1123px] grid-cols-[1fr_240px] overflow-hidden bg-white text-slate-900"
      style={{ fontFamily: font.cssStack }}
    >
      <main
        className="resume-preview-main print-main-fragment p-8"
        onDragOver={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                onZoneDrop?.("main");
              }
            : undefined
        }
      >
        {showPersonal ? (
          <header className="mb-6 border-b pb-5 print-avoid-break" style={{ borderColor: theme.softBorder }}>
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.26em]"
                  style={{ color: theme.primary }}
                >
                  Technical Resume
                </p>
                {hasText(personal.fullName) ? (
                  <h1 className="mt-2 break-words text-[38px] font-black leading-none tracking-[-0.05em] text-slate-950">
                    {personal.fullName}
                  </h1>
                ) : null}
                {hasText(personal.headline) ? (
                  <p className="mt-2 text-base font-semibold leading-6 text-slate-700">
                    {personal.headline}
                  </p>
                ) : null}
                {hasText(contactLine) ? (
                  <p className="mt-3 break-words text-xs font-medium leading-5 text-slate-500">
                    {contactLine}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0">{renderPhoto()}</div>
            </div>
          </header>
        ) : null}

        {showSummary ? (
          <section className="resume-section-block mb-6 rounded-2xl border p-4 print-avoid-break" style={{ borderColor: theme.softBorder, backgroundColor: theme.softBackground }}>
            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{summary}</p>
          </section>
        ) : null}

        <div className="space-y-5">
          {mainSections.map((section) => renderSection(section, "main"))}

          {editable ? (
            <div
              className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 print:hidden"
              onDragOver={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
              }}
              onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onZoneDrop?.("main");
              }}
            >
              Drop sections here
            </div>
          ) : null}
        </div>
      </main>

      <aside
        className="resume-preview-sidebar resume-sidebar-fragment border-l p-6"
        style={{ borderColor: theme.softBorder, backgroundColor: "#ffffff" }}
        onDragOver={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          editable
            ? (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                onZoneDrop?.("sidebar");
              }
            : undefined
        }
      >
        <div className="space-y-5">
          <section
            className="rounded-2xl p-4 print-avoid-break"
            style={{ backgroundColor: theme.softBackground }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: theme.primary }}
            >
              Focus
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-700">
              Compact layout for dense technical evidence, tools, credentials, and
              project-heavy career histories.
            </p>
          </section>

          {sidebarSections.map((section) => renderSection(section, "sidebar"))}

          {editable ? (
            <div
              className="rounded-2xl border border-dashed border-slate-300 p-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 print:hidden"
              onDragOver={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
              }}
              onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onZoneDrop?.("sidebar");
              }}
            >
              Drop sidebar sections here
            </div>
          ) : null}
        </div>
      </aside>
    </article>
  );
}
