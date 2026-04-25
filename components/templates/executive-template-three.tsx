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

export default function ExecutiveTemplateThree({
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

  const sidebarSections = visibleSections.filter(
    (section) => section.zone === "sidebar"
  );
  const mainSections = visibleSections.filter((section) => section.zone === "main");

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedIn,
    personal.website,
  ].filter(hasText);

  function renderProfilePhoto(size: "compact" | "large" = "compact") {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <ResumePhoto
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        shape={photoShape}
        squareClassName="rounded-[28px]"
        className={
          size === "large"
            ? "h-36 w-36 border-4 border-white shadow-sm"
            : "h-28 w-28 border-4 border-white shadow-sm"
        }
      />
    );
  }

  function renderSectionHeading(section: ResumeSection, inverse = false) {
    return (
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className="h-px w-8 flex-none"
          style={{ backgroundColor: inverse ? theme.onPrimary : theme.primary }}
        />
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.28em]"
          style={{ color: inverse ? theme.onPrimary : theme.primary }}
        >
          {section.title}
        </h2>
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

    return (
      <div
        key={`${section.id}-${item.id}`}
        className={`rounded-2xl ${options.compact ? "px-2 py-2" : "px-3 py-3"} ${
          itemDragEnabled ? "ring-1 ring-transparent transition hover:ring-slate-300" : ""
        } ${isDropTargetItem ? "ring-2 ring-slate-400" : ""} ${
          isDraggedItem ? "opacity-60" : ""
        } print:px-0 print:py-0`}
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
            className="mb-2 inline-flex cursor-grab rounded-full border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 active:cursor-grabbing print:hidden"
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
          ? orderedItems.map((item, index) =>
              renderItemShell(section, item, renderItem(item, index), {
                compact: options.compactItems,
              })
            )
          : emptyState}
      </div>
    );
  }

  function renderSidebarSection(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return (
          <div>
            <div className="mb-6">{renderProfilePhoto()}</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">
              Contact
            </p>
            <div className="mt-4 space-y-2 text-[13px] leading-5 text-slate-700">
              {contactItems.length > 0 ? (
                contactItems.map((item) => (
                  <p key={item} className="break-words">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-slate-500">No contact details added yet.</p>
              )}
            </div>
          </div>
        );

      case "summary":
        return hasText(summary) ? (
          <div>
            {renderSectionHeading(section)}
            <p className="text-sm leading-7 text-slate-700">{summary}</p>
          </div>
        ) : null;

      case "skills":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderItemList(
              section,
              (item) => {
                const skill = readSkillItem(item.content);

                if (!hasText(skill.name)) {
                  return null;
                }

                return (
                  <div className="rounded-2xl border bg-white px-3 py-3" style={{ borderColor: theme.softBorder }}>
                    <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                    {hasText(skill.level) ? (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        {skill.level}
                      </p>
                    ) : null}
                  </div>
                );
              },
              <p className="text-sm text-slate-500">No skills added yet.</p>,
              { gapClassName: "space-y-2", compactItems: true }
            )}
          </div>
        );

      case "education":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderItemList(
              section,
              (item) => {
                const education = readEducationItem(item.content);
                const meta = compactTextParts([
                  education.institution,
                  education.location,
                  formatDateRange(education.startDate, education.endDate),
                ]);

                if (!hasText(education.degree) && meta.length === 0) {
                  return null;
                }

                return (
                  <article className="space-y-1">
                    {hasText(education.degree) ? (
                      <h3 className="text-sm font-semibold text-slate-900">
                        {education.degree}
                      </h3>
                    ) : null}
                    {meta.length > 0 ? (
                      <p className="text-xs leading-5 text-slate-600">{meta.join(" • ")}</p>
                    ) : null}
                    {hasText(education.description) ? (
                      <p className="whitespace-pre-line text-xs leading-5 text-slate-600">
                        {education.description}
                      </p>
                    ) : null}
                  </article>
                );
              },
              <p className="text-sm text-slate-500">No education added yet.</p>,
              { gapClassName: "space-y-3", compactItems: true }
            )}
          </div>
        );

      case "certifications":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderItemList(
              section,
              (item) => {
                const certification = readCertificationItem(item.content);
                const meta = compactTextParts([
                  certification.issuer,
                  certification.issueDate,
                  certification.credentialId,
                ]);

                if (!hasText(certification.name)) {
                  return null;
                }

                return (
                  <article>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {certification.name}
                    </h3>
                    {meta.length > 0 ? (
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {meta.join(" • ")}
                      </p>
                    ) : null}
                    {hasText(certification.url) ? (
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {certification.url}
                      </p>
                    ) : null}
                  </article>
                );
              },
              <p className="text-sm text-slate-500">No certifications added yet.</p>,
              { gapClassName: "space-y-3", compactItems: true }
            )}
          </div>
        );

      case "links":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderItemList(
              section,
              (item) => {
                const link = readString(item.content);

                return hasText(link) ? (
                  <p className="break-words text-sm leading-6 text-slate-700">{link}</p>
                ) : null;
              },
              <p className="text-sm text-slate-500">No links added yet.</p>,
              { gapClassName: "space-y-2", compactItems: true }
            )}
          </div>
        );

      case "custom":
        return renderCustomSection(section, true);

      default:
        return renderMainSection(section, true);
    }
  }

  function renderExperienceSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const experience = readExperienceItem(item.content);
        const dateRange = formatDateRange(experience.startDate, experience.endDate);
        const meta = compactTextParts([experience.company, experience.location]);

        if (!hasText(experience.role) && meta.length === 0 && !hasText(experience.description)) {
          return null;
        }

        return (
          <article className="relative border-l pl-5" style={{ borderColor: theme.softBorder }}>
            <span
              aria-hidden
              className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {hasText(experience.role) ? (
                  <h3 className="text-base font-bold text-slate-950">{experience.role}</h3>
                ) : null}
                {meta.length > 0 ? (
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {meta.join(" • ")}
                  </p>
                ) : null}
              </div>
              {hasText(dateRange) ? (
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: theme.primary }}
                >
                  {dateRange}
                </p>
              ) : null}
            </div>
            {hasText(experience.description) ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {experience.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No experience added yet.</p>,
      { gapClassName: "space-y-5" }
    );
  }

  function renderEducationSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const education = readEducationItem(item.content);
        const dateRange = formatDateRange(education.startDate, education.endDate);
        const meta = compactTextParts([education.institution, education.location, dateRange]);

        if (!hasText(education.degree) && meta.length === 0 && !hasText(education.description)) {
          return null;
        }

        return (
          <article className="rounded-3xl border bg-white px-5 py-4" style={{ borderColor: theme.softBorder }}>
            {hasText(education.degree) ? (
              <h3 className="text-base font-bold text-slate-950">{education.degree}</h3>
            ) : null}
            {meta.length > 0 ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{meta.join(" • ")}</p>
            ) : null}
            {hasText(education.description) ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {education.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No education added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderSkillsSection(section: ResumeSection, compact = false) {
    return renderItemList(
      section,
      (item) => {
        const skill = readSkillItem(item.content);

        if (!hasText(skill.name)) {
          return null;
        }

        return (
          <div
            className={`rounded-full border px-4 py-2 ${compact ? "text-xs" : "text-sm"}`}
            style={{ borderColor: theme.softBorder, backgroundColor: theme.softBackground }}
          >
            <span className="font-semibold text-slate-900">{skill.name}</span>
            {hasText(skill.level) ? (
              <span className="text-slate-500"> — {skill.level}</span>
            ) : null}
          </div>
        );
      },
      <p className="text-sm text-slate-500">No skills added yet.</p>,
      { gapClassName: "flex flex-wrap gap-2", compactItems: true }
    );
  }

  function renderProjectsSection(section: ResumeSection) {
    return renderItemList(
      section,
      (item) => {
        const project = readProjectItem(item.content);
        const dateRange = formatDateRange(project.startDate, project.endDate);
        const meta = compactTextParts([project.role, dateRange]);

        if (!hasText(project.name) && meta.length === 0 && !hasText(project.description)) {
          return null;
        }

        return (
          <article className="rounded-3xl border bg-white px-5 py-4" style={{ borderColor: theme.softBorder }}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {hasText(project.name) ? (
                  <h3 className="text-base font-bold text-slate-950">{project.name}</h3>
                ) : null}
                {meta.length > 0 ? (
                  <p className="mt-1 text-sm leading-6 text-slate-600">{meta.join(" • ")}</p>
                ) : null}
              </div>
              {hasText(project.url) ? (
                <p className="break-words text-xs font-semibold text-slate-500">
                  {project.url}
                </p>
              ) : null}
            </div>
            {hasText(project.description) ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {project.description}
              </p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No projects added yet.</p>,
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
        ]);

        if (!hasText(certification.name)) {
          return null;
        }

        return (
          <article className="rounded-3xl border bg-white px-5 py-4" style={{ borderColor: theme.softBorder }}>
            <h3 className="text-base font-bold text-slate-950">{certification.name}</h3>
            {meta.length > 0 ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{meta.join(" • ")}</p>
            ) : null}
            {hasText(certification.url) ? (
              <p className="mt-2 break-words text-sm text-slate-500">{certification.url}</p>
            ) : null}
          </article>
        );
      },
      <p className="text-sm text-slate-500">No certifications added yet.</p>,
      { gapClassName: "space-y-4" }
    );
  }

  function renderCustomSection(section: ResumeSection, compact = false) {
    return (
      <div>
        {renderSectionHeading(section)}
        {renderItemList(
          section,
          (item) => {
            const entry = readCustomEntry(item.content);
            const meta = compactTextParts([entry.subtitle, entry.meta]);

            if (!hasText(entry.title) && meta.length === 0 && !hasText(entry.description)) {
              return null;
            }

            return (
              <article className={compact ? "space-y-1" : "rounded-3xl border bg-white px-5 py-4"} style={compact ? undefined : { borderColor: theme.softBorder }}>
                {hasText(entry.title) ? (
                  <h3 className="text-base font-bold text-slate-950">{entry.title}</h3>
                ) : null}
                {meta.length > 0 ? (
                  <p className="text-sm leading-6 text-slate-600">{meta.join(" • ")}</p>
                ) : null}
                {hasText(entry.description) ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {entry.description}
                  </p>
                ) : null}
              </article>
            );
          },
          <p className="text-sm text-slate-500">No items added yet.</p>,
          { gapClassName: compact ? "space-y-3" : "space-y-4", compactItems: compact }
        )}
      </div>
    );
  }

  function renderMainSection(section: ResumeSection, compact = false) {
    switch (section.type) {
      case "personal-details":
        return (
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              {hasText(personal.headline) ? (
                <p
                  className="text-xs font-bold uppercase tracking-[0.34em]"
                  style={{ color: theme.primary }}
                >
                  {personal.headline}
                </p>
              ) : null}
              {hasText(personal.fullName) ? (
                <h1 className="mt-3 break-words text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-slate-950">
                  {personal.fullName}
                </h1>
              ) : null}
              {contactItems.length > 0 ? (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {contactItems.join(" • ")}
                </p>
              ) : null}
            </div>
            <div className="shrink-0">{renderProfilePhoto("large")}</div>
          </div>
        );

      case "summary":
        return hasText(summary) ? (
          <div>
            {renderSectionHeading(section)}
            <p className="text-[15px] leading-8 text-slate-700">{summary}</p>
          </div>
        ) : null;

      case "experience":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderExperienceSection(section)}
          </div>
        );

      case "education":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderEducationSection(section)}
          </div>
        );

      case "skills":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderSkillsSection(section, compact)}
          </div>
        );

      case "projects":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderProjectsSection(section)}
          </div>
        );

      case "certifications":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderCertificationsSection(section)}
          </div>
        );

      case "links":
        return (
          <div>
            {renderSectionHeading(section)}
            {renderItemList(
              section,
              (item) => {
                const link = readString(item.content);

                return hasText(link) ? (
                  <p className="break-words text-sm leading-6 text-slate-700">{link}</p>
                ) : null;
              },
              <p className="text-sm text-slate-500">No links added yet.</p>,
              { gapClassName: "space-y-2", compactItems: true }
            )}
          </div>
        );

      case "contact":
        return (
          <div>
            {renderSectionHeading(section)}
            <p className="text-sm leading-7 text-slate-700">
              {joinTextParts(contactItems, " • ") || "No contact details added yet."}
            </p>
          </div>
        );

      case "custom":
        return renderCustomSection(section, compact);

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
    const isSidebar = zone === "sidebar";

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
        className={`resume-section-block rounded-[28px] ${
          isSidebar ? "border px-4 py-5" : "border bg-white px-6 py-6 shadow-sm"
        } ${editable ? "ring-1 ring-transparent transition hover:ring-slate-300" : ""} ${
          isDropTargetSection ? "ring-2 ring-slate-400" : ""
        } ${isDraggedSection ? "opacity-60" : ""}`}
        style={{
          borderColor: theme.softBorder,
          backgroundColor: isSidebar ? "rgba(255, 255, 255, 0.55)" : "#ffffff",
        }}
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
              className="inline-flex cursor-grab rounded-full border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 active:cursor-grabbing"
            >
              Drag section
            </div>
          </div>
        ) : null}

        {isSidebar ? renderSidebarSection(section) : renderMainSection(section)}
      </div>
    );
  }

  function renderZoneDropHandlers(zone: ResumeZone) {
    if (!editable || draggedItem) {
      return {};
    }

    return {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        onZoneDrop?.(zone);
      },
    };
  }

  return (
    <div
      className="resume-preview-page resume-preview-surface mx-auto w-full overflow-hidden rounded-[34px] bg-white shadow-sm ring-1 ring-slate-200 print:rounded-none print:bg-transparent print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <div className="resume-preview-grid grid grid-cols-1 md:grid-cols-[250px_1fr] print:grid-cols-[250px_1fr]">
        <aside
          className="resume-preview-sidebar px-6 py-8 print:px-6"
          style={{ backgroundColor: theme.softBackground }}
          {...renderZoneDropHandlers("sidebar")}
        >
          <div className="resume-sidebar-fragment space-y-5">
            {sidebarSections.map((section) => renderSectionShell(section, "sidebar"))}
          </div>
        </aside>

        <main
          className="resume-preview-main px-7 py-8 md:px-9 print:px-9"
          {...renderZoneDropHandlers("main")}
        >
          <div className="print-main-fragment space-y-6">
            {mainSections.map((section) => renderSectionShell(section, "main"))}
          </div>
        </main>
      </div>
    </div>
  );
}
