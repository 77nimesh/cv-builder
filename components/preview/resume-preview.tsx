"use client";

import type { ResumeRecord, ResumeZone } from "@/lib/types";
import ModernTemplateOne from "@/components/templates/modern-template-one";

type DraggedItemState = {
  sectionId: string;
  itemId: string;
};

type ResumePreviewProps = {
  resume: ResumeRecord;
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

export default function ResumePreview({
  resume,
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
}: ResumePreviewProps) {
  return (
    <div className="print:m-0 print:p-0">
      {(() => {
        switch (resume.template) {
          case "modern-1":
            return (
              <ModernTemplateOne
                data={resume.data}
                photoPath={resume.photoPath}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                draggedItem={draggedItem}
                dropTargetItem={dropTargetItem}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
                onItemDragStart={onItemDragStart}
                onItemDragEnter={onItemDragEnter}
                onItemDrop={onItemDrop}
                onItemListDrop={onItemListDrop}
                onItemDragEnd={onItemDragEnd}
              />
            );
          case "modern-2":
            return (
              <ModernTemplateOne
                data={resume.data}
                photoPath={resume.photoPath}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                draggedItem={draggedItem}
                dropTargetItem={dropTargetItem}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
                onItemDragStart={onItemDragStart}
                onItemDragEnter={onItemDragEnter}
                onItemDrop={onItemDrop}
                onItemListDrop={onItemListDrop}
                onItemDragEnd={onItemDragEnd}
              />
            );
          default:
            return (
              <ModernTemplateOne
                data={resume.data}
                photoPath={resume.photoPath}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                draggedItem={draggedItem}
                dropTargetItem={dropTargetItem}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
                onItemDragStart={onItemDragStart}
                onItemDragEnter={onItemDragEnter}
                onItemDrop={onItemDrop}
                onItemListDrop={onItemListDrop}
                onItemDragEnd={onItemDragEnd}
              />
            );
        }
      })()}
    </div>
  );
}