"use client";

import type { ResumeRecord, ResumeZone } from "@/lib/types";
import { getActiveResumeTemplateId } from "@/components/templates/template-registry";
import ModernTemplateOne from "@/components/templates/modern-template-one";
import ModernTemplateTwo from "@/components/templates/modern-template-two";
import type {
  DraggedItemState,
  ResumeTemplateProps,
} from "@/components/templates/types";

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
  const activeTemplateId = getActiveResumeTemplateId(resume);

  const templateProps: ResumeTemplateProps = {
    data: resume.data,
    photoPath: resume.photoPath,
    editable,
    draggedSectionId,
    dropTargetSectionId,
    draggedItem,
    dropTargetItem,
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
  };

  return (
    <div className="print:m-0 print:p-0">
      {activeTemplateId === "modern-2" ? (
        <ModernTemplateTwo {...templateProps} />
      ) : (
        <ModernTemplateOne {...templateProps} />
      )}
    </div>
  );
}