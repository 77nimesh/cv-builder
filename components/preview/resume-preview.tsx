import type { ResumeRecord } from "@/lib/types";
import ModernTemplateOne from "@/components/templates/modern-template-one";

type ResumePreviewProps = {
  resume: ResumeRecord;
};

export default function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <div className="print:m-0 print:p-0">
      {(() => {
        switch (resume.template) {
          case "modern-1":
            return <ModernTemplateOne data={resume.data} />;
          case "modern-2":
            return <ModernTemplateOne data={resume.data} />;
          default:
            return <ModernTemplateOne data={resume.data} />;
        }
      })()}
    </div>
  );
}