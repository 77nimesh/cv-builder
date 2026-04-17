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
} from "@/lib/resume/selectors";
import { resolveResumeTheme } from "@/components/templates/theme-presets";
import { resolveResumeFont } from "@/components/templates/font-presets";
import type { ResumeTemplateProps } from "@/components/templates/types";

function hasText(value: string) {
  return value.trim().length > 0;
}

function formatDateRange(startDate: string, endDate: string) {
  const start = startDate.trim();
  const end = endDate.trim();

  if (start && end) {
    return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>t</mi><mi>a</mi><mi>r</mi><mi>t</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{start} -</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6984em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">t</span></span><span class="mord">−</span></span></span></span>{end}`;
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

    const shapeClass = photoShape === "circle" ? "rounded-full" : "rounded-3xl";

    return (
      <img
        src={normalizedPhotoPath}
        alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
        className={
          variant === "sidebar"
            ? `h-28 w-28 border object-cover ${shapeClass}`
            : `h-32 w-32 border-4 border-white object-cover shadow-sm ${shapeClass}`
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
        key={`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>e</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>o</mi><mi>n</mi><mi mathvariant="normal">.</mi><mi>i</mi><mi>d</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{section.id}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">sec</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord">.</span><span class="mord mathnormal">i</span><span class="mord mathnormal">d</span></span><span class="mord">−</span></span></span></span>{item.position}-${item.id}`}
        className={`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mi>h</mi><mi>e</mi><mi>l</mi><mi>l</mi><mi>C</mi><mi>l</mi><mi>a</mi><mi>s</mi><mi>s</mi><mi>e</mi><mi>s</mi></mrow><annotation encoding="application/x-tex">{shellClasses}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mord mathnormal">h</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal" style="margin-right:0.07153em;">C</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">sses</span></span></span></span></span>{hoverClasses} <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>r</mi><mi>o</mi><mi>p</mi><mi>C</mi><mi>l</mi><mi>a</mi><mi>s</mi><mi>s</mi><mi>e</mi><mi>s</mi></mrow><annotation encoding="application/x-tex">{dropClasses}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.07153em;">pC</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">sses</span></span></span></span></span>{dragStateClass}`}
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
    items: ResumeSectionItem[],
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
                event.stopPropagation();
              }
            : undefined
        }
        onDrop={
          itemDragEnabled
            ? (event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                event.stopPropagation();
                onItemListDrop?.(section.id);
              }
            : undefined
        }
      >
        {items.length === 0 ? (
          <div className={options.emptyClassName}>{emptyState}</div>
        ) : (
          orderedItems.map((item, index) =>
            renderItemShell(section, item, renderItem(item, index), {
              compact: options.compactItems,
            })
          )
        )}
      </div>
    );
  }

  function renderSidebarCustomSection(section: ResumeSection) {
    const items = getOrderedItems(section);

    return (
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: theme.accentText }}
        >
          {section.title || "Custom Section"}
        </h2>

        <div className="mt-4">
          {renderItemList(
            section,
            items,
            (item) => {
              const entry = readCustomEntry(item.content);

              return (
                <div className="text-sm text-slate-700">
                  {hasText(entry.title) && (
                    <p className="font-semibold text-slate-900">{entry.title}</p>
                  )}
                  {hasText(entry.subtitle) && (
                    <p className="mt-1 text-slate-700">{entry.subtitle}</p>
                  )}
                  {hasText(entry.meta) && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {entry.meta}
                    </p>
                  )}
                  {hasText(entry.description) && (
                    <p className="mt-2 whitespace-pre-wrap text-slate-600">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            },
            <p className="text-sm text-slate-500">No entries yet.</p>,
            {
              gapClassName: "space-y-4",
              compactItems: true,
            }
          )}
        </div>
      </div>
    );
  }

  function renderMainCustomSection(section: ResumeSection) {
    const items = getOrderedItems(section);

    return (
      <div>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
          <h2
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: theme.accentText }}
          >
            {section.title || "Custom Section"}
          </h2>
        </div>

        <div className="mt-6">
          {renderItemList(
            section,
            items,
            (item) => {
              const entry = readCustomEntry(item.content);

              return (
                <div>
                  {(hasText(entry.title) || hasText(entry.subtitle)) && (
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        {hasText(entry.title) && (
                          <h3 className="text-lg font-semibold text-slate-900">
                            {entry.title}
                          </h3>
                        )}
                        {hasText(entry.subtitle) && (
                          <p className="text-slate-700">{entry.subtitle}</p>
                        )}
                      </div>

                      {hasText(entry.meta) && (
                        <p className="text-sm uppercase tracking-wide text-slate-500">
                          {entry.meta}
                        </p>
                      )}
                    </div>
                  )}

                  {hasText(entry.description) && (
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            },
            <p className="text-[15px] leading-7 text-slate-500">
              Add entries in the editor.
            </p>,
            {
              gapClassName: "space-y-6",
            }
          )}
        </div>
      </div>
    );
  }

  function renderSidebarSection(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return (
          <div
            className="rounded-[28px] border bg-white p-6 shadow-sm"
            style={{ borderColor: theme.softBorder }}
          >
            <div className="flex flex-col items-center text-center">
              {renderProfilePhoto("sidebar") ? (
                <div className="mb-4">{renderProfilePhoto("sidebar")}</div>
              ) : null}

              <h1 className="break-words text-2xl font-bold leading-tight text-slate-900">
                {personal.fullName || "Your Name"}
              </h1>

              {hasText(personal.headline) ? (
                <p
                  className="mt-2 text-xs uppercase tracking-[0.25em]"
                  style={{ color: theme.accentText }}
                >
                  {personal.headline}
                </p>
              ) : null}
            </div>

            <div
              className="mt-6 space-y-3 border-t pt-6 text-sm text-slate-700"
              style={{ borderColor: theme.softBorder }}
            >
              {hasText(personal.email) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 break-words">{personal.email}</p>
                </div>
              )}
              {hasText(personal.phone) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Phone
                  </p>
                  <p className="mt-1">{personal.phone}</p>
                </div>
              )}
              {hasText(personal.location) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-1">{personal.location}</p>
                </div>
              )}
              {hasText(personal.linkedIn) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    LinkedIn
                  </p>
                  <p className="mt-1 break-words">{personal.linkedIn}</p>
                </div>
              )}
              {hasText(personal.website) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Website
                  </p>
                  <p className="mt-1 break-words">{personal.website}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "summary":
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: theme.accentText }}
            >
              {section.title || "Profile"}
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>
        );

      case "skills": {
        const items = getOrderedItems(section);

        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: theme.accentText }}
            >
              {section.title || "Skills"}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">Add skills in the editor.</p>
              ) : (
                items.map((item) => {
                  const skill = readSkillItem(item.content);

                  return (
                    <div
                      key={`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>e</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>o</mi><mi>n</mi><mi mathvariant="normal">.</mi><mi>i</mi><mi>d</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{section.id}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">sec</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord">.</span><span class="mord mathnormal">i</span><span class="mord mathnormal">d</span></span><span class="mord">−</span></span></span></span>{item.id}`}
                      className="rounded-full px-3 py-1.5 text-sm"
                      style={{
                        backgroundColor: theme.softBackground,
                        color: theme.accentText,
                        border: `1px solid ${theme.softBorder}`,
                      }}
                    >
                      {skill.name}
                      {hasText(skill.level) ? ` • ${skill.level}` : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      case "certifications": {
        const items = getOrderedItems(section);

        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: theme.accentText }}
            >
              {section.title || "Certifications"}
            </h2>

            <div className="mt-4">
              {renderItemList(
                section,
                items,
                (item) => {
                  const certification = readCertificationItem(item.content);

                  return (
                    <div className="text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {certification.name || "Certification"}
                      </p>
                      {hasText(certification.issuer) && (
                        <p className="mt-1">{certification.issuer}</p>
                      )}
                      {hasText(certification.issueDate) && (
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {certification.issueDate}
                        </p>
                      )}
                      {hasText(certification.credentialId) && (
                        <p className="mt-1 break-words text-xs text-slate-500">
                          ID: {certification.credentialId}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-sm text-slate-500">
                  No certifications added yet.
                </p>,
                {
                  gapClassName: "space-y-4",
                  compactItems: true,
                }
              )}
            </div>
          </div>
        );
      }

      case "custom":
        return renderSidebarCustomSection(section);

      default:
        return (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: theme.accentText }}
            >
              {section.title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Move this section to the main column for full layout rendering.
            </p>
          </div>
        );
    }
  }

  function renderMainSection(section: ResumeSection) {
    switch (section.type) {
      case "personal-details":
        return (
          <div
            className="overflow-hidden rounded-[32px] text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Resume Profile
                </p>
                <h1 className="mt-3 break-words text-4xl font-bold leading-tight">
                  {personal.fullName || "Your Name"}
                </h1>
                {hasText(personal.headline) ? (
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/75">
                    {personal.headline}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/95">
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

              {renderProfilePhoto("main") ? (
                <div className="shrink-0 self-start md:self-center">
                  {renderProfilePhoto("main")}
                </div>
              ) : null}
            </div>
          </div>
        );

      case "summary":
        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Profile"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>
        );

      case "experience": {
        const items = getOrderedItems(section);

        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Experience"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const experience = readExperienceItem(item.content);

                  return (
                    <div
                      className="border-l-2 pl-5"
                      style={{ borderColor: theme.softBorder }}
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {experience.role || "Role"}
                          </h3>
                          <p className="text-slate-700">
                            {[experience.company, experience.location]
                              .filter(Boolean)
                              .join("  |  ")}
                          </p>
                        </div>

                        {hasText(formatDateRange(experience.startDate, experience.endDate)) && (
                          <p className="text-sm text-slate-500">
                            {formatDateRange(experience.startDate, experience.endDate)}
                          </p>
                        )}
                      </div>

                      {hasText(experience.description) && (
                        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-[15px] leading-7 text-slate-500">
                  Add experience entries in the editor.
                </p>,
                {
                  gapClassName: "space-y-6",
                }
              )}
            </div>
          </div>
        );
      }

      case "education": {
        const items = getOrderedItems(section);

        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Education"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const education = readEducationItem(item.content);

                  return (
                    <div
                      className="rounded-2xl px-5 py-5"
                      style={{
                        backgroundColor: theme.softBackground,
                        border: `1px solid ${theme.softBorder}`,
                      }}
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {education.degree || "Degree"}
                          </h3>
                          <p className="text-slate-700">
                            {[education.institution, education.location]
                              .filter(Boolean)
                              .join("  |  ")}
                          </p>
                        </div>

                        {hasText(formatDateRange(education.startDate, education.endDate)) && (
                          <p className="text-sm text-slate-500">
                            {formatDateRange(education.startDate, education.endDate)}
                          </p>
                        )}
                      </div>

                      {hasText(education.description) && (
                        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                          {education.description}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-[15px] leading-7 text-slate-500">
                  Add education entries in the editor.
                </p>,
                {
                  gapClassName: "space-y-5",
                }
              )}
            </div>
          </div>
        );
      }

      case "projects": {
        const items = getOrderedItems(section);

        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Projects"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const project = readProjectItem(item.content);

                  return (
                    <div
                      className="rounded-2xl px-5 py-5"
                      style={{ border: `1px solid ${theme.softBorder}` }}
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {project.name || "Project"}
                          </h3>
                          <p className="text-slate-700">
                            {[project.role, project.url].filter(Boolean).join("  |  ")}
                          </p>
                        </div>

                        {hasText(formatDateRange(project.startDate, project.endDate)) && (
                          <p className="text-sm text-slate-500">
                            {formatDateRange(project.startDate, project.endDate)}
                          </p>
                        )}
                      </div>

                      {hasText(project.description) && (
                        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                          {project.description}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-[15px] leading-7 text-slate-500">
                  Add project entries in the editor.
                </p>,
                {
                  gapClassName: "space-y-5",
                }
              )}
            </div>
          </div>
        );
      }

      case "skills": {
        const items = getOrderedItems(section);

        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Skills"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {items.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add skills in the editor.
                </p>
              ) : (
                items.map((item) => {
                  const skill = readSkillItem(item.content);

                  return (
                    <div
                      key={`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>e</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>o</mi><mi>n</mi><mi mathvariant="normal">.</mi><mi>i</mi><mi>d</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{section.id}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">sec</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord">.</span><span class="mord mathnormal">i</span><span class="mord mathnormal">d</span></span><span class="mord">−</span></span></span></span>{item.id}`}
                      className="rounded-full px-4 py-2 text-sm"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme.onPrimary,
                      }}
                    >
                      {skill.name}
                      {hasText(skill.level) ? ` • ${skill.level}` : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      case "certifications": {
        const items = getOrderedItems(section);

        return (
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: theme.accentText }}
              >
                {section.title || "Certifications"}
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: theme.softBorder }} />
            </div>

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const certification = readCertificationItem(item.content);

                  return (
                    <div
                      className="rounded-2xl px-5 py-5"
                      style={{
                        backgroundColor: theme.softBackground,
                        border: `1px solid ${theme.softBorder}`,
                      }}
                    >
                      <h3 className="text-lg font-semibold text-slate-900">
                        {certification.name || "Certification"}
                      </h3>
                      <p className="mt-1 text-slate-700">
                        {[certification.issuer, certification.issueDate]
                          .filter(Boolean)
                          .join("  |  ")}
                      </p>
                      {hasText(certification.credentialId) && (
                        <p className="mt-2 text-sm text-slate-500">
                          Credential ID: {certification.credentialId}
                        </p>
                      )}
                      {hasText(certification.url) && (
                        <p className="mt-1 break-words text-sm text-slate-500">
                          {certification.url}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-[15px] leading-7 text-slate-500">
                  Add certifications in the editor.
                </p>,
                {
                  gapClassName: "space-y-5",
                }
              )}
            </div>
          </div>
        );
      }

      case "custom":
        return renderMainCustomSection(section);

      default:
        return null;
    }
  }

  function renderSectionShell(section: ResumeSection, zone: ResumeZone) {
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
        className={`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mi>h</mi><mi>e</mi><mi>l</mi><mi>l</mi><mi>B</mi><mi>a</mi><mi>s</mi><mi>e</mi><mi>C</mi><mi>l</mi><mi>a</mi><mi>s</mi><mi>s</mi></mrow><annotation encoding="application/x-tex">{shellBaseClass}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mord mathnormal">h</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal" style="margin-right:0.05017em;">B</span><span class="mord mathnormal">a</span><span class="mord mathnormal">se</span><span class="mord mathnormal" style="margin-right:0.07153em;">C</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">ss</span></span></span></span></span>{interactiveClasses} <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>r</mi><mi>o</mi><mi>p</mi><mi>C</mi><mi>l</mi><mi>a</mi><mi>s</mi><mi>s</mi><mi>e</mi><mi>s</mi></mrow><annotation encoding="application/x-tex">{dropClasses}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.07153em;">pC</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">sses</span></span></span></span></span>{dragStateClass}`}
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
      className="mx-auto w-full max-w-[850px] rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200 print:max-w-none print:rounded-none print:bg-transparent print:shadow-none print:ring-0"
      style={{ fontFamily: font.cssStack }}
    >
      <div className="grid min-h-[1100px] grid-cols-1 md:grid-cols-[1fr_260px] print:grid-cols-[1fr_260px]">
        <section
          className={`order-2 border-t px-6 py-8 md:order-2 md:border-l md:border-t-0 print:border-l ${editable ? "min-h-[1100px]" : ""}`}
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
          <div className="space-y-6">
            {sidebarSections.map((section) => renderSectionShell(section, "sidebar"))}
          </div>
        </section>

        <main
          className={`order-1 px-6 py-8 md:px-8 print:px-8 ${editable ? "min-h-[1100px]" : ""}`}
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