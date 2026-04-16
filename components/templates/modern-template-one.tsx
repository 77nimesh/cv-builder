"use client";

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
} from "@/lib/types";
import {
  getPersonalDetails,
  getSummaryText,
  getVisibleSections,
} from "@/lib/resume/selectors";

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
    return `${start} — ${end}`;
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

  const sidebarSections = visibleSections.filter(
    (section) => section.zone === "sidebar"
  );
  const mainSections = visibleSections.filter((section) => section.zone === "main");

  function renderProfilePhoto(variant: "sidebar" | "main") {
    if (!hasText(normalizedPhotoPath)) {
      return null;
    }

    return (
      <div className={variant === "sidebar" ? "mb-6" : "mb-6"}>
        <img
          src={normalizedPhotoPath}
          alt={personal.fullName ? `${personal.fullName} profile photo` : "Profile photo"}
          className={
            variant === "sidebar"
              ? "h-28 w-28 rounded-2xl border border-white/10 object-cover"
              : "h-24 w-24 rounded-2xl border border-slate-200 object-cover"
          }
        />
      </div>
    );
  }

  function renderItemShell(
    section: ResumeSection,
    item: ResumeSectionItem,
    content: React.ReactNode,
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

    return (
      <div
        key={item.id}
        className={`${shellClasses} ${hoverClasses} ${dropClasses} ${
          isDraggedItem ? "opacity-60" : ""
        }`}
        onDragEnter={
          itemDragEnabled
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
                onItemDragEnter?.(section.id, item.id);
              }
            : undefined
        }
        onDragOver={
          itemDragEnabled
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : undefined
        }
        onDrop={
          itemDragEnabled
            ? (event) => {
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
            onDragStart={(event) => {
              event.stopPropagation();
              onItemDragStart?.(section.id, item.id);
            }}
            onDragEnd={(event) => {
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
    items: ResumeSectionItem[],
    renderItem: (item: ResumeSectionItem, index: number) => React.ReactNode,
    emptyState: React.ReactNode,
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
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : undefined
        }
        onDrop={
          itemDragEnabled
            ? (event) => {
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
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          {section.title || "Custom Section"}
        </h2>

        <div className="mt-4">
          {renderItemList(
            section,
            items,
            (item) => {
              const entry = readCustomEntry(item.content);

              return (
                <div className="text-sm text-slate-100">
                  {hasText(entry.title) && <p className="font-medium">{entry.title}</p>}
                  {hasText(entry.subtitle) && (
                    <p className="text-slate-300">{entry.subtitle}</p>
                  )}
                  {hasText(entry.meta) && (
                    <p className="text-slate-400">{entry.meta}</p>
                  )}
                  {hasText(entry.description) && (
                    <p className="mt-2 whitespace-pre-wrap text-slate-200">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            },
            <p className="text-sm text-slate-300">No entries yet.</p>,
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
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {section.title || "Custom Section"}
        </h2>
        <div className="mt-4 h-px bg-slate-200" />

        <div className="mt-6">
          {renderItemList(
            section,
            items,
            (item) => {
              const entry = readCustomEntry(item.content);

              return (
                <div>
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      {hasText(entry.title) && (
                        <h3 className="text-lg font-semibold text-slate-900">
                          {entry.title}
                        </h3>
                      )}

                      {(hasText(entry.subtitle) || hasText(entry.meta)) && (
                        <p className="text-slate-700">
                          {[entry.subtitle, entry.meta].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {hasText(entry.description) && (
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            },
            <p className="text-[15px] leading-7 text-slate-500">Add entries in the editor.</p>,
            {
              gapClassName: "space-y-8",
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
          <>
            <div>
              {renderProfilePhoto("sidebar")}

              <h1 className="break-words text-3xl font-bold leading-tight">
                {personal.fullName || "Your Name"}
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-300">
                Professional Resume
              </p>
            </div>

            <div className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Contact
              </h2>

              <div className="mt-4 space-y-4 text-sm text-slate-100">
                {hasText(personal.email) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-words">{personal.email}</p>
                  </div>
                )}

                {hasText(personal.phone) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Phone
                    </p>
                    <p className="mt-1">{personal.phone}</p>
                  </div>
                )}

                {hasText(personal.location) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Location
                    </p>
                    <p className="mt-1">{personal.location}</p>
                  </div>
                )}

                {hasText(personal.linkedIn) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      LinkedIn
                    </p>
                    <p className="mt-1 break-words">{personal.linkedIn}</p>
                  </div>
                )}

                {hasText(personal.website) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Website
                    </p>
                    <p className="mt-1 break-words">{personal.website}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case "certifications": {
        const items = getOrderedItems(section);

        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {section.title || "Certifications"}
            </h2>

            <div className="mt-4">
              {renderItemList(
                section,
                items,
                (item) => {
                  const certification = readCertificationItem(item.content);

                  return (
                    <div className="text-sm text-slate-100">
                      <p className="font-medium">
                        {certification.name || "Certification"}
                      </p>
                      {hasText(certification.issuer) && (
                        <p className="text-slate-300">{certification.issuer}</p>
                      )}
                      {hasText(certification.issueDate) && (
                        <p className="text-slate-400">{certification.issueDate}</p>
                      )}
                      {hasText(certification.credentialId) && (
                        <p className="break-words text-slate-400">
                          ID: {certification.credentialId}
                        </p>
                      )}
                    </div>
                  );
                },
                <p className="text-sm text-slate-300">No certifications added yet.</p>,
                {
                  gapClassName: "space-y-4",
                  compactItems: true,
                }
              )}
            </div>
          </div>
        );
      }

      case "summary":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {section.title || "Profile"}
            </h2>
            <div className="mt-4 h-px bg-slate-700" />
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-100">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>
        );

      case "custom":
        return renderSidebarCustomSection(section);

      default:
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {section.title}
            </h2>
            <p className="mt-4 text-sm text-slate-300">
              Move this section to the main column for full layout rendering.
            </p>
          </div>
        );
    }
  }

  function renderMainSection(section: ResumeSection) {
    switch (section.type) {
      case "summary":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Profile"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>
        );

      case "experience": {
        const items = getOrderedItems(section);

        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Experience"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const experience = readExperienceItem(item.content);

                  return (
                    <div>
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {experience.role || "Role"}
                          </h3>
                          <p className="text-slate-700">
                            {[experience.company, experience.location]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>

                        {hasText(
                          formatDateRange(experience.startDate, experience.endDate)
                        ) && (
                          <p className="text-sm text-slate-500">
                            {formatDateRange(
                              experience.startDate,
                              experience.endDate
                            )}
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
                  gapClassName: "space-y-8",
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Education"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const education = readEducationItem(item.content);

                  return (
                    <div>
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {education.degree || "Degree"}
                          </h3>
                          <p className="text-slate-700">
                            {[education.institution, education.location]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>

                        {hasText(
                          formatDateRange(education.startDate, education.endDate)
                        ) && (
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
                  gapClassName: "space-y-8",
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Projects"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const project = readProjectItem(item.content);

                  return (
                    <div>
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {project.name || "Project"}
                          </h3>
                          <p className="text-slate-700">
                            {[project.role, project.url].filter(Boolean).join(" • ")}
                          </p>
                        </div>

                        {hasText(
                          formatDateRange(project.startDate, project.endDate)
                        ) && (
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
                  gapClassName: "space-y-8",
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Skills"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 flex flex-wrap gap-3">
              {items.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add skills in the editor.
                </p>
              ) : (
                items.map((item) => {
                  const skill = isRecord(item.content)
                    ? {
                        name: readString(item.content.name),
                        level: readString(item.content.level),
                      }
                    : { name: "", level: "" };

                  return (
                    <div
                      key={item.id}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {section.title || "Certifications"}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6">
              {renderItemList(
                section,
                items,
                (item) => {
                  const certification = readCertificationItem(item.content);

                  return (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {certification.name || "Certification"}
                      </h3>
                      <p className="mt-1 text-slate-700">
                        {[certification.issuer, certification.issueDate]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      {hasText(certification.credentialId) && (
                        <p className="mt-1 text-sm text-slate-500">
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
                  gapClassName: "space-y-6",
                }
              )}
            </div>
          </div>
        );
      }

      case "personal-details":
        return (
          <div>
            {renderProfilePhoto("main")}

            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Contact
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
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
      ? zone === "sidebar"
        ? "ring-1 ring-transparent transition hover:ring-white/20"
        : "ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTargetSection
      ? zone === "sidebar"
        ? "ring-2 ring-white/60"
        : "ring-2 ring-slate-400"
      : "";

    return (
      <div
        key={section.id}
        onDragEnter={
          sectionDropEnabled
            ? (event) => {
                event.preventDefault();
                onSectionDragEnter?.(section.id);
              }
            : undefined
        }
        onDragOver={
          sectionDropEnabled
            ? (event) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          sectionDropEnabled
            ? (event) => {
                event.preventDefault();
                onSectionDrop?.(section.id);
              }
            : undefined
        }
        className={`rounded-2xl px-2 py-2 ${interactiveClasses} ${dropClasses} ${
          isDraggedSection ? "opacity-60" : ""
        }`}
      >
        {editable && (
          <div className="mb-3 flex items-center gap-2">
            <div
              draggable
              onDragStart={(event) => {
                event.stopPropagation();
                onSectionDragStart?.(section.id);
              }}
              onDragEnd={(event) => {
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
    <div className="mx-auto w-full max-w-[850px] rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 print:max-w-none print:rounded-none print:bg-transparent print:shadow-none print:ring-0">
      <div className="grid min-h-[1100px] grid-cols-1 md:grid-cols-[280px_1fr] print:grid-cols-[280px_1fr]">
        <aside
          className={`bg-slate-900 px-8 py-10 text-white print:bg-transparent ${
            editable ? "min-h-[1100px]" : ""
          }`}
          onDragOver={
            editable && !draggedItem
              ? (event) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable && !draggedItem
              ? (event) => {
                  event.preventDefault();
                  onZoneDrop?.("sidebar");
                }
              : undefined
          }
        >
          <div className="space-y-8">
            {sidebarSections.map((section) => renderSectionShell(section, "sidebar"))}
          </div>
        </aside>

        <section
          className={`px-8 py-10 md:px-10 ${editable ? "min-h-[1100px]" : ""}`}
          onDragOver={
            editable && !draggedItem
              ? (event) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable && !draggedItem
              ? (event) => {
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