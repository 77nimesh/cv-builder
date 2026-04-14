"use client";

import type {
  CustomSectionEntry,
  ResumeData,
  ResumeSection,
  ResumeZone,
} from "@/lib/types";
import {
  getCertificationItems,
  getCustomSections,
  getEducationItems,
  getExperienceItems,
  getPersonalDetails,
  getProjectItems,
  getSectionTitle,
  getSkillItems,
  getSummaryText,
  getVisibleSections,
} from "@/lib/resume/selectors";

type ModernTemplateOneProps = {
  data: ResumeData;
  editable?: boolean;
  draggedSectionId?: string | null;
  dropTargetSectionId?: string | null;
  onSectionDragStart?: (sectionId: string) => void;
  onSectionDragEnter?: (sectionId: string) => void;
  onSectionDrop?: (sectionId: string) => void;
  onZoneDrop?: (zone: ResumeZone) => void;
  onSectionDragEnd?: () => void;
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
    title: typeof content.title === "string" ? content.title : "",
    subtitle: typeof content.subtitle === "string" ? content.subtitle : "",
    meta: typeof content.meta === "string" ? content.meta : "",
    description: typeof content.description === "string" ? content.description : "",
  };
}

function getCustomEntries(section: ResumeSection): CustomSectionEntry[] {
  return section.items.map((item) => readCustomEntry(item.content));
}

export default function ModernTemplateOne({
  data,
  editable = false,
  draggedSectionId = null,
  dropTargetSectionId = null,
  onSectionDragStart,
  onSectionDragEnter,
  onSectionDrop,
  onZoneDrop,
  onSectionDragEnd,
}: ModernTemplateOneProps) {
  const personal = getPersonalDetails(data);
  const summary = getSummaryText(data);
  const experienceItems = getExperienceItems(data);
  const educationItems = getEducationItems(data);
  const skillItems = getSkillItems(data);
  const projectItems = getProjectItems(data);
  const certificationItems = getCertificationItems(data);
  const visibleSections = getVisibleSections(data);
  const customSections = getCustomSections(data);

  const sidebarSections = visibleSections.filter(
    (section) => section.zone === "sidebar"
  );
  const mainSections = visibleSections.filter((section) => section.zone === "main");

  function renderSidebarCustomSection(section: ResumeSection) {
    const entries = getCustomEntries(section);

    return (
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          {section.title || "Custom Section"}
        </h2>

        <div className="mt-4 space-y-4 text-sm text-slate-100">
          {entries.length === 0 ? (
            <p className="text-slate-300">No entries yet.</p>
          ) : (
            entries.map((entry, index) => (
              <div key={`${section.id}-${index}`}>
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
            ))
          )}
        </div>
      </div>
    );
  }

  function renderMainCustomSection(section: ResumeSection) {
    const entries = getCustomEntries(section);

    return (
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {section.title || "Custom Section"}
        </h2>
        <div className="mt-4 h-px bg-slate-200" />

        <div className="mt-6 space-y-8">
          {entries.length === 0 ? (
            <p className="text-[15px] leading-7 text-slate-500">
              Add entries in the editor.
            </p>
          ) : (
            entries.map((entry, index) => (
              <div key={`${section.id}-${index}`}>
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
            ))
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

      case "skills":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {getSectionTitle(data, "skills", "Skills")}
            </h2>

            <div className="mt-4 space-y-3">
              {skillItems.length === 0 ? (
                <p className="text-sm text-slate-300">No skills added yet.</p>
              ) : (
                skillItems.map((skill, index) => (
                  <div key={`${skill.name}-${index}`} className="text-sm text-slate-100">
                    <p className="font-medium">{skill.name}</p>
                    {hasText(skill.level) && (
                      <p className="text-slate-300">{skill.level}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "certifications":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {getSectionTitle(data, "certifications", "Certifications")}
            </h2>

            <div className="mt-4 space-y-4 text-sm text-slate-100">
              {certificationItems.length === 0 ? (
                <p className="text-sm text-slate-300">
                  No certifications added yet.
                </p>
              ) : (
                certificationItems.map((certification, index) => (
                  <div key={`${certification.name}-${index}`}>
                    <p className="font-medium">{certification.name}</p>
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
                ))
              )}
            </div>
          </div>
        );

      case "summary":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              {getSectionTitle(data, "summary", "Profile")}
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
              {getSectionTitle(data, "summary", "Profile")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
              {summary ||
                "Write a short professional summary that highlights your strengths, experience, and goals."}
            </p>
          </div>
        );

      case "experience":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {getSectionTitle(data, "experience", "Experience")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 space-y-8">
              {experienceItems.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add experience entries in the editor.
                </p>
              ) : (
                experienceItems.map((item, index) => (
                  <div key={`${item.company}-${item.role}-${index}`}>
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.role || "Role"}
                        </h3>
                        <p className="text-slate-700">
                          {[item.company, item.location].filter(Boolean).join(" • ")}
                        </p>
                      </div>

                      {hasText(formatDateRange(item.startDate, item.endDate)) && (
                        <p className="text-sm text-slate-500">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>
                      )}
                    </div>

                    {hasText(item.description) && (
                      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "education":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {getSectionTitle(data, "education", "Education")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 space-y-8">
              {educationItems.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add education entries in the editor.
                </p>
              ) : (
                educationItems.map((item, index) => (
                  <div key={`${item.institution}-${item.degree}-${index}`}>
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.degree || "Degree"}
                        </h3>
                        <p className="text-slate-700">
                          {[item.institution, item.location].filter(Boolean).join(" • ")}
                        </p>
                      </div>

                      {hasText(formatDateRange(item.startDate, item.endDate)) && (
                        <p className="text-sm text-slate-500">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>
                      )}
                    </div>

                    {hasText(item.description) && (
                      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "projects":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {getSectionTitle(data, "projects", "Projects")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 space-y-8">
              {projectItems.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add project entries in the editor.
                </p>
              ) : (
                projectItems.map((item, index) => (
                  <div key={`${item.name}-${item.role}-${index}`}>
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name || "Project"}
                        </h3>
                        <p className="text-slate-700">
                          {[item.role, item.url].filter(Boolean).join(" • ")}
                        </p>
                      </div>

                      {hasText(formatDateRange(item.startDate, item.endDate)) && (
                        <p className="text-sm text-slate-500">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>
                      )}
                    </div>

                    {hasText(item.description) && (
                      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "skills":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {getSectionTitle(data, "skills", "Skills")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 flex flex-wrap gap-3">
              {skillItems.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add skills in the editor.
                </p>
              ) : (
                skillItems.map((skill, index) => (
                  <div
                    key={`${skill.name}-${index}`}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {skill.name}
                    {hasText(skill.level) ? ` • ${skill.level}` : ""}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "certifications":
        return (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {getSectionTitle(data, "certifications", "Certifications")}
            </h2>
            <div className="mt-4 h-px bg-slate-200" />

            <div className="mt-6 space-y-6">
              {certificationItems.length === 0 ? (
                <p className="text-[15px] leading-7 text-slate-500">
                  Add certifications in the editor.
                </p>
              ) : (
                certificationItems.map((item, index) => (
                  <div key={`${item.name}-${index}`}>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.name || "Certification"}
                    </h3>
                    <p className="mt-1 text-slate-700">
                      {[item.issuer, item.issueDate].filter(Boolean).join(" • ")}
                    </p>
                    {hasText(item.credentialId) && (
                      <p className="mt-1 text-sm text-slate-500">
                        Credential ID: {item.credentialId}
                      </p>
                    )}
                    {hasText(item.url) && (
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.url}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "personal-details":
        return (
          <div>
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
    const isDragged = draggedSectionId === section.id;
    const isDropTarget = dropTargetSectionId === section.id;

    const interactiveClasses = editable
      ? zone === "sidebar"
        ? "cursor-move ring-1 ring-transparent transition hover:ring-white/20"
        : "cursor-move ring-1 ring-transparent transition hover:ring-slate-300"
      : "";

    const dropClasses = isDropTarget
      ? zone === "sidebar"
        ? "ring-2 ring-white/60"
        : "ring-2 ring-slate-400"
      : "";

    return (
      <div
        key={section.id}
        draggable={editable}
        onDragStart={
          editable ? () => onSectionDragStart?.(section.id) : undefined
        }
        onDragEnter={
          editable ? () => onSectionDragEnter?.(section.id) : undefined
        }
        onDragOver={
          editable
            ? (event) => {
                event.preventDefault();
              }
            : undefined
        }
        onDrop={
          editable
            ? (event) => {
                event.preventDefault();
                onSectionDrop?.(section.id);
              }
            : undefined
        }
        onDragEnd={editable ? () => onSectionDragEnd?.() : undefined}
        className={`rounded-2xl px-2 py-2 ${interactiveClasses} ${dropClasses} ${
          isDragged ? "opacity-60" : ""
        }`}
      >
        {editable && (
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Drag section
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
            editable
              ? (event) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable
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
            editable
              ? (event) => {
                  event.preventDefault();
                }
              : undefined
          }
          onDrop={
            editable
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