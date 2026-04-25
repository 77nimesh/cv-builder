"use client";

import type { ResumeRecord, ResumeZone } from "@/lib/types";
import {
  getRenderableResumeTemplateId,
  getResumeTemplateDefinitionForRecord,
  getResumeTemplatePrintBackgroundColor,
} from "@/components/templates/template-registry";
import { renderResumeTemplate } from "@/components/templates/template-renderer";
import { getResumePreviewShellStyle } from "@/components/templates/export-layout";
import type {
  DraggedItemState,
  ResumeTemplateProps,
} from "@/components/templates/types";

type ResumePreviewProps = {
  resume: ResumeRecord;
  mode?: "preview" | "print";
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
  mode = "preview",
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
  const activeTemplateId = getRenderableResumeTemplateId(resume);
  const templateDefinition = getResumeTemplateDefinitionForRecord(resume);
  const printBackgroundColor = getResumeTemplatePrintBackgroundColor(
    templateDefinition.id,
    resume.data.layout.themeColor
  );
  const pageShellStyle = getResumePreviewShellStyle(templateDefinition.id);
  const printBackground = templateDefinition.printBackground;

  const templateProps: ResumeTemplateProps = {
    data: resume.data,
    templateId: templateDefinition.id,
    mode,
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
    <div
      data-resume-template={templateDefinition.id}
      data-resume-mode={mode}
      data-resume-layout={templateDefinition.layoutKind}
      className={
        mode === "print"
          ? "resume-preview-shell relative mx-auto w-full bg-white print:w-full"
          : "resume-preview-shell relative mx-auto w-full"
      }
      style={pageShellStyle}
    >
      {mode === "print" && printBackground && printBackgroundColor ? (
        <div
          aria-hidden
          className={`pointer-events-none fixed inset-y-0 hidden print:block ${
            printBackground.side === "left" ? "left-0" : "right-0"
          } ${printBackground.widthClassName}`}
          style={{ backgroundColor: printBackgroundColor }}
        />
      ) : null}

      <div className="relative z-10 print:m-0 print:p-0">
        {renderResumeTemplate(activeTemplateId, templateProps)}
      </div>
    </div>
  );
}