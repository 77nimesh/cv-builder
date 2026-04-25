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
  getInitials,
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

export default function ProfileFocusTemplateSeven({
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
  const contactLine = joinTextParts(
    [personal.email, personal.phone, personal.location, personal.linkedIn, personal.website],
    " • "
  );

  function renderHeroPhoto() {
    if (hasText(normalizedPhotoPath)) {
      return (
        <ResumePhoto
          src={normalizedPhotoPath}
          alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
          shape={photoShape}
          squareClassName="rounded-[2rem]"
          className="h-28 w-28 border-4 border-white shadow-md"
        />
      );
    }

    if (!showPersonal || !hasText(personal.fullName)) {
      return null;
    }

    return (
      <div
        className="flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-white text-3xl font-black tracking-[-0.08em] text-white shadow-md"
        style={{ backgroundColor: theme.primary }}
        aria-hidden="true"
      >
        {getInitials(personal.fullName)}
      </div>
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
        className="mb-3 inline-flex cursor-grab rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm active:cursor-grabbing print:hidden"
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
        className="mb-2 inline-flex cursor-grab rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 active:cursor-grabbing print:hidden"
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
        className={`transition ${isDropTargetItem ? "rounded-2xl ring-2 ring-slate-400" : ""} ${
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
    gapClassName = "space-y-4"
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
    return <p className="text-sm text-slate-400">Add {label} entries to display them here.</p>;
  }

  function renderSectionHeading(section: ResumeSection, compact = false) {
    return (
      <div className={compact ? "mb-3" : "mb-5"}>
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: theme.primary }}
        >
          {section.title}
        </p>
        <div
          className="mt-2 h-px w-full"
          style={{ backgroundColor: compact ? theme.softBorder : theme.primary }}
        />
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
    const compact = zone === "sidebar";

    return (
      <section
        key={section.id}
        className={`resume-section-block ${
          compact ? "rounded-3xl bg-slate-50 p-4" : "rounded-[2rem] border bg-white p-6 shadow-sm"
        } ${isDropTargetSection ? "ring-2 ring-slate-400" : ""} ${
          isDraggedSection ? "opacity-60" : ""
        }`}
        style={compact ? undefined : { borderColor: theme.softBorder }}
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
        {renderSectionHeading(section, compact)}
        {content}
      </section>
    );
  }

  function renderExperienceSection(section: ResumeSection) {
    return renderItemList(section, (item) => {
      const experience = readExperienceItem(item.content);
      const title = compactTextParts([experience.role, experience.company]).join(" · ");
      const meta = compactTextParts([
        experience.location,
        formatDateRange(experience.startDate, experience.endDate),
      ]);

      return (
        <article className="space-y-2">
          {hasText(title) ? (
            <h3 className="text-base font-bold leading-snug text-slate-950">{title}</h3>
          ) : null}
          {meta.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
    }, renderEmptyState("experience"));
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
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
    const skills = getOrderedItems(section)
      .map((item) => ({ item, skill: readSkillItem(item.content) }))
      .filter(({ skill }) => hasText(skill.name) || hasText(skill.level));
    const itemDragEnabled = editable && supportsItemDrag(section);

    return (
      <div
        className="flex flex-wrap gap-2"
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
        {skills.length > 0 ? (
          skills.map(({ item, skill }) =>
            renderItemShell(
              section,
              item,
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: theme.softBackground, color: theme.primary }}
              >
                {compactTextParts([skill.name, skill.level]).join(" · ")}
              </div>
            )
          )
        ) : (
          renderEmptyState("skills")
        )}
      </div>
    );
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
            <p className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
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
        return renderSectionShell(section, zone, renderExperienceSection(section));
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
      className="min-h-[1123px] overflow-hidden bg-white text-slate-900"
      style={{ fontFamily: font.cssStack }}
    >
      <header
        className="print-avoid-break px-9 py-8"
        style={{ backgroundColor: theme.softBackground }}
      >
        <div className="flex items-center gap-6">
          {renderHeroPhoto()}
          {showPersonal ? (
            <div className="min-w-0 flex-1">
              {hasText(personal.headline) ? (
                <p
                  className="text-xs font-black uppercase tracking-[0.24em]"
                  style={{ color: theme.primary }}
                >
                  {personal.headline}
                </p>
              ) : null}
              {hasText(personal.fullName) ? (
                <h1 className="mt-2 break-words text-5xl font-black leading-none tracking-[-0.06em] text-slate-950">
                  {personal.fullName}
                </h1>
              ) : null}
              {hasText(contactLine) ? (
                <p className="mt-4 break-words text-xs font-semibold leading-5 text-slate-600">
                  {contactLine}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        {showSummary ? (
          <p className="mt-6 max-w-[680px] whitespace-pre-line text-[15px] leading-7 text-slate-700">
            {summary}
          </p>
        ) : null}
      </header>

      <div className="grid grid-cols-[1fr_235px] gap-6 p-8">
        <main
          className="space-y-5"
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
          {mainSections.map((section) => renderSection(section, "main"))}
          {editable ? (
            <div
              className="rounded-[2rem] border border-dashed border-slate-300 p-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 print:hidden"
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
        </main>

        <aside
          className="space-y-4"
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
          {sidebarSections.map((section) => renderSection(section, "sidebar"))}
          {editable ? (
            <div
              className="rounded-3xl border border-dashed border-slate-300 p-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 print:hidden"
              onDragOver={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
              }}
              onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onZoneDrop?.("sidebar");
              }}
            >
              Drop sidebar sections
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
