"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumePreview from "@/components/preview/resume-preview";
import type {
  ResumeRecord,
  ResumeSection,
  ResumeSectionItem,
  ResumeZone,
} from "@/lib/types";

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
  const [draftResume, setDraftResume] = useState<ResumeRecord>(resume);
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

  async function saveSections(nextSections: ResumeSection[]) {
    const previousResume = draftResume;

    const optimisticResume: ResumeRecord = {
      ...draftResume,
      data: {
        ...draftResume.data,
        sections: nextSections,
      },
    };

    setDraftResume(optimisticResume);
    setIsSaving(true);
    setMessage("Saving layout...");

    try {
      const response = await fetch(`/api/resumes/${draftResume.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draftResume.title,
          template: draftResume.template,
          themeColor: draftResume.themeColor ?? "",
          fontFamily: draftResume.fontFamily ?? "",
          photoPath: draftResume.photoPath ?? "",
          data: {
            ...draftResume.data,
            sections: nextSections,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save layout");
      }

      const savedResume = (await response.json()) as ResumeRecord;
      setDraftResume(savedResume);
      setMessage("Layout saved.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setDraftResume(previousResume);
      setMessage("Failed to save layout.");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <p>
          Drag sections with the section handle. Drag items with the item handle
          inside Experience, Education, Projects, Certifications, and Custom
          Sections.
        </p>
        <p className="mt-1">
          {isSaving
            ? "Saving layout..."
            : message || "Layout changes save automatically."}
        </p>
      </div>

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
  );
}