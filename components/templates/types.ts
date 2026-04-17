import type { ResumeData, ResumeRecord, ResumeZone } from "@/lib/types";

export type DraggedItemState = {
  sectionId: string;
  itemId: string;
};

export type ResumeTemplateProps = {
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

export type ResumeTemplateRecordLike = Pick<ResumeRecord, "template" | "data">;