import type { SelectHTMLAttributes } from "react";
import {
  getAllResumeTemplateDefinitions,
  getSelectableResumeTemplateDefinitions,
} from "@/components/templates/template-registry";

type TemplateDropdownProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  includePlanned?: boolean;
};

export default function TemplateDropdown({
  includePlanned = false,
  className = "",
  ...props
}: TemplateDropdownProps) {
  const templates = includePlanned
    ? getAllResumeTemplateDefinitions()
    : getSelectableResumeTemplateDefinitions();

  return (
    <select
      {...props}
      className={
        className ||
        "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
      }
    >
      {templates.map((template) => (
        <option
          key={template.id}
          value={template.id}
          disabled={template.status !== "available"}
        >
          {template.status === "available"
            ? template.label
            : `${template.label} (coming soon)`}
        </option>
      ))}
    </select>
  );
}
