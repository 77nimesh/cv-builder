"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumePreview from "@/components/preview/resume-preview";
import {
  FontFamilyDropdown,
  ThemeColorDropdown,
} from "@/components/forms/design-dropdowns";
import {
  RESUME_TEMPLATE_IDS,
  getResumeTemplateDefinition,
} from "@/components/templates/template-registry";
import type {
  ResumeRecord,
  ResumeSection,
  ResumeSectionItem,
  ResumeZone,
} from "@/lib/types";
import {
  buildResumeUpdatePayload,
  normalizeResumeRecord,
} from "@/lib/resume/record";

type PreviewEditorProps = {
  resume: ResumeRecord;
};

type DraggedItemState = {
  sectionId: string;
  itemId: string;
};

function sortSections(sections: ResumeSection[]) {
  return [...sections].sort((left, right) => left.position - right.position);
}

function reindexSections(sections: ResumeSection[]) {
  return sections.map((section, index) => ({
    ...section,
    position: index,
  }));
}

function sortItems(items: ResumeSectionItem[]) {
  return [...items].sort((left, right) => left.position - right.position);
}

function reindexItems(items: ResumeSectionItem[]) {
  return items.map((item, index) => ({
    ...item,
    position: index,
  }));
}

function moveSectionBefore(
  sections: ResumeSection[],
  draggedSectionId: string,
  targetSectionId: string
) {
  if (draggedSectionId === targetSectionId) {
    return sortSections(sections);
  }

  const ordered = sortSections(sections);
  const dragged = ordered.find((section) => section.id === draggedSectionId);
  const target = ordered.find((section) => section.id === targetSectionId);

  if (!dragged || !target) {
    return ordered;
  }

  const withoutDragged = ordered.filter(
    (section) => section.id !== draggedSectionId
  );

  const targetIndex = withoutDragged.findIndex(
    (section) => section.id === targetSectionId
  );

  if (targetIndex === -1) {
    return ordered;
  }

  withoutDragged.splice(targetIndex, 0, {
    ...dragged,
    zone: target.zone,
  });

  return reindexSections(withoutDragged);
}

function moveSectionToZoneEnd(
  sections: ResumeSection[],
  draggedSectionId: string,
  zone: ResumeZone
) {
  const ordered = sortSections(sections);
  const dragged = ordered.find((section) => section.id === draggedSectionId);

  if (!dragged) {
    return ordered;
  }

  const withoutDragged = ordered.filter(
    (section) => section.id !== draggedSectionId
  );

  withoutDragged.push({
    ...dragged,
    zone,
  });

  return reindexSections(withoutDragged);
}

function updateSectionItems(
  sections: ResumeSection[],
  sectionId: string,
  nextItems: ResumeSectionItem[]
) {
  return sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    return {
      ...section,
      items: nextItems,
    };
  });
}

function moveItemBefore(
  items: ResumeSectionItem[],
  draggedItemId: string,
  targetItemId: string
) {
  if (draggedItemId === targetItemId) {
    return sortItems(items);
  }

  const ordered = sortItems(items);
  const dragged = ordered.find((item) => item.id === draggedItemId);
  const target = ordered.find((item) => item.id === targetItemId);

  if (!dragged || !target) {
    return ordered;
  }

  const withoutDragged = ordered.filter((item) => item.id !== draggedItemId);
  const targetIndex = withoutDragged.findIndex((item) => item.id === targetItemId);

  if (targetIndex === -1) {
    return ordered;
  }

  withoutDragged.splice(targetIndex, 0, dragged);

  return reindexItems(withoutDragged);
}

function moveItemToEnd(items: ResumeSectionItem[], draggedItemId: string) {
  const ordered = sortItems(items);
  const dragged = ordered.find((item) => item.id === draggedItemId);

  if (!dragged) {
    return ordered;
  }

  const withoutDragged = ordered.filter((item) => item.id !== draggedItemId);
  withoutDragged.push(dragged);

  return reindexItems(withoutDragged);
}

export default function PreviewEditor({ resume }: PreviewEditorProps) {
  const router = useRouter();
  const [draftResume, setDraftResume] = useState<ResumeRecord>(
    normalizeResumeRecord(resume)
  );
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropTargetSectionId, setDropTargetSectionId] = useState<string | null>(
    null
  );
  const [draggedItem, setDraggedItem] = useState<DraggedItemState | null>(null);
  const [dropTargetItem, setDropTargetItem] = useState<DraggedItemState | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveResume(nextResume: ResumeRecord, savingMessage: string) {
    const previousResume = draftResume;

    const optimisticResume = normalizeResumeRecord(nextResume);
    const savePayload = buildResumeUpdatePayload(
      optimisticResume,
      optimisticResume.data,
      {
        title: optimisticResume.title,
        template: optimisticResume.template,
        themeColor: optimisticResume.themeColor,
        fontFamily: optimisticResume.fontFamily,
        photoPath: optimisticResume.photoPath,
        photoShape: optimisticResume.data.layout.photoShape,
      }
    );

    setDraftResume(optimisticResume);
    setIsSaving(true);
    setMessage(savingMessage);

    try {
      const response = await fetch(`/api/resumes/${optimisticResume.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to save resume");
      }

      const savedResume = normalizeResumeRecord(
        (await response.json()) as ResumeRecord
      );

      setDraftResume(savedResume);
      setMessage("Changes saved.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setDraftResume(previousResume);
      setMessage("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSections(nextSections: ResumeSection[]) {
    const nextData = {
      ...draftResume.data,
      sections: nextSections,
    };

    await saveResume(
      {
        ...draftResume,
        data: nextData,
      },
      "Saving layout..."
    );
  }

  async function handleSectionDrop(targetSectionId: string) {
    if (!draggedSectionId || draggedItem) {
      return;
    }

    const nextSections = moveSectionBefore(
      draftResume.data.sections,
      draggedSectionId,
      targetSectionId
    );

    setDraggedSectionId(null);
    setDropTargetSectionId(null);

    await saveSections(nextSections);
  }

  async function handleZoneDrop(zone: ResumeZone) {
    if (!draggedSectionId || draggedItem) {
      return;
    }

    const nextSections = moveSectionToZoneEnd(
      draftResume.data.sections,
      draggedSectionId,
      zone
    );

    setDraggedSectionId(null);
    setDropTargetSectionId(null);

    await saveSections(nextSections);
  }

  async function handleItemDrop(sectionId: string, targetItemId: string) {
    if (!draggedItem || draggedSectionId || draggedItem.sectionId !== sectionId) {
      return;
    }

    const section = draftResume.data.sections.find((item) => item.id === sectionId);

    if (!section) {
      return;
    }

    const nextItems = moveItemBefore(
      section.items,
      draggedItem.itemId,
      targetItemId
    );

    const nextSections = updateSectionItems(
      draftResume.data.sections,
      sectionId,
      nextItems
    );

    setDraggedItem(null);
    setDropTargetItem(null);

    await saveSections(nextSections);
  }

  async function handleItemListDrop(sectionId: string) {
    if (!draggedItem || draggedSectionId || draggedItem.sectionId !== sectionId) {
      return;
    }

    const section = draftResume.data.sections.find((item) => item.id === sectionId);

    if (!section) {
      return;
    }

    const nextItems = moveItemToEnd(section.items, draggedItem.itemId);

    const nextSections = updateSectionItems(
      draftResume.data.sections,
      sectionId,
      nextItems
    );

    setDraggedItem(null);
    setDropTargetItem(null);

    await saveSections(nextSections);
  }

  async function handleTemplateChange(nextTemplate: string) {
    if (nextTemplate === draftResume.template) {
      return;
    }

    setDraggedSectionId(null);
    setDropTargetSectionId(null);
    setDraggedItem(null);
    setDropTargetItem(null);

    await saveResume(
      {
        ...draftResume,
        template: nextTemplate,
      },
      "Saving design..."
    );
  }

  async function handleThemeChange(nextThemeColor: string) {
    if (nextThemeColor === (draftResume.themeColor ?? "")) {
      return;
    }

    setDraggedSectionId(null);
    setDropTargetSectionId(null);
    setDraggedItem(null);
    setDropTargetItem(null);

    await saveResume(
      {
        ...draftResume,
        themeColor: nextThemeColor,
      },
      "Saving design..."
    );
  }

  async function handleFontChange(nextFontFamily: string) {
    if (nextFontFamily === (draftResume.fontFamily ?? "")) {
      return;
    }

    setDraggedSectionId(null);
    setDropTargetSectionId(null);
    setDraggedItem(null);
    setDropTargetItem(null);

    await saveResume(
      {
        ...draftResume,
        fontFamily: nextFontFamily,
      },
      "Saving design..."
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-32 z-20 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <p>
          Drag sections with the section handle. Drag items with the item handle
          inside Experience, Education, Projects, Certifications, and Custom
          Sections.
        </p>
        <p className="mt-1">
          {isSaving ? message || "Saving..." : message || "Changes save automatically."}
        </p>
      </div>

      <div className="relative lg:flex lg:items-start lg:gap-6">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Template
              </label>
              <select
                value={draftResume.template}
                onChange={(event) => void handleTemplateChange(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
              >
                {RESUME_TEMPLATE_IDS.map((templateId) => {
                  const templateDefinition = getResumeTemplateDefinition(templateId);
                  return (
                    <option key={templateId} value={templateId}>
                      {templateDefinition.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Theme
              </label>
              <ThemeColorDropdown
                value={draftResume.themeColor ?? ""}
                onChange={(nextThemeId) => void handleThemeChange(nextThemeId)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Font
              </label>
              <FontFamilyDropdown
                value={draftResume.fontFamily ?? ""}
                onChange={(nextFontId) => void handleFontChange(nextFontId)}
              />
            </div>
          </div>
        </div>

        <div className="lg:min-w-0 lg:flex-1">
          <div className="w-full lg:flex lg:justify-start">
            <div className="flex w-full justify-center lg:justify-start">
              <ResumePreview
                resume={draftResume}
                editable
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                draggedItem={draggedItem}
                dropTargetItem={dropTargetItem}
                onSectionDragStart={(sectionId) => {
                  setDraggedSectionId(sectionId);
                  setDropTargetSectionId(null);
                  setDraggedItem(null);
                  setDropTargetItem(null);
                }}
                onSectionDragEnter={(sectionId) => {
                  if (draggedSectionId && draggedSectionId !== sectionId) {
                    setDropTargetSectionId(sectionId);
                  }
                }}
                onSectionDrop={handleSectionDrop}
                onZoneDrop={handleZoneDrop}
                onSectionDragEnd={() => {
                  setDraggedSectionId(null);
                  setDropTargetSectionId(null);
                }}
                onItemDragStart={(sectionId, itemId) => {
                  setDraggedItem({ sectionId, itemId });
                  setDropTargetItem(null);
                  setDraggedSectionId(null);
                  setDropTargetSectionId(null);
                }}
                onItemDragEnter={(sectionId, itemId) => {
                  if (
                    draggedItem &&
                    draggedItem.sectionId === sectionId &&
                    draggedItem.itemId !== itemId
                  ) {
                    setDropTargetItem({ sectionId, itemId });
                  }
                }}
                onItemDrop={handleItemDrop}
                onItemListDrop={handleItemListDrop}
                onItemDragEnd={() => {
                  setDraggedItem(null);
                  setDropTargetItem(null);
                }}
              />
            </div>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 print:hidden lg:block">
          <div className="fixed z-10 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Design</h2>
            <p className="mt-1 text-xs text-slate-500">
              Template, theme, and font apply instantly.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Template
                </label>
                <select
                  value={draftResume.template}
                  onChange={(event) => void handleTemplateChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
                >
                  {RESUME_TEMPLATE_IDS.map((templateId) => {
                    const templateDefinition = getResumeTemplateDefinition(templateId);
                    return (
                      <option key={templateId} value={templateId}>
                        {templateDefinition.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Theme
                </label>
                <ThemeColorDropdown
                  value={draftResume.themeColor ?? ""}
                  onChange={(nextThemeId) => void handleThemeChange(nextThemeId)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Font
                </label>
                <FontFamilyDropdown
                  value={draftResume.fontFamily ?? ""}
                  onChange={(nextFontId) => void handleFontChange(nextFontId)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}