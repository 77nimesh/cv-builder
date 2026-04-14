"use client";

import type { ResumeRecord, ResumeZone } from "@/lib/types";
import ModernTemplateOne from "@/components/templates/modern-template-one";

type ResumePreviewProps = {
  resume: ResumeRecord;
  editable?: boolean;
  draggedSectionId?: string | null;
  dropTargetSectionId?: string | null;
  onSectionDragStart?: (sectionId: string) => void;
  onSectionDragEnter?: (sectionId: string) => void;
  onSectionDrop?: (sectionId: string) => void;
  onZoneDrop?: (zone: ResumeZone) => void;
  onSectionDragEnd?: () => void;
};

export default function ResumePreview({
  resume,
  editable = false,
  draggedSectionId = null,
  dropTargetSectionId = null,
  onSectionDragStart,
  onSectionDragEnter,
  onSectionDrop,
  onZoneDrop,
  onSectionDragEnd,
}: ResumePreviewProps) {
  return (
    <div className="print:m-0 print:p-0">
      {(() => {
        switch (resume.template) {
          case "modern-1":
            return (
              <ModernTemplateOne
                data={resume.data}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
              />
            );
          case "modern-2":
            return (
              <ModernTemplateOne
                data={resume.data}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
              />
            );
          default:
            return (
              <ModernTemplateOne
                data={resume.data}
                editable={editable}
                draggedSectionId={draggedSectionId}
                dropTargetSectionId={dropTargetSectionId}
                onSectionDragStart={onSectionDragStart}
                onSectionDragEnter={onSectionDragEnter}
                onSectionDrop={onSectionDrop}
                onZoneDrop={onZoneDrop}
                onSectionDragEnd={onSectionDragEnd}
              />
            );
        }
      })()}
    </div>
  );
}