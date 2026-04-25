"use client";

import {
  useEffect,
  useMemo,
  useState,
  type SelectHTMLAttributes,
} from "react";
import {
  getAllResumeTemplateDefinitions,
  getSelectableResumeTemplateDefinitions,
} from "@/components/templates/template-registry";

type BillingAccessResponse = {
  templateLimit?: number;
  activePlanCodes?: string[];
  exportAccess?: {
    canExport?: boolean;
    code?: string | null;
    planCode?: string | null;
    downloadLimit?: number | null;
    downloadsUsed?: number;
    remainingDownloads?: number | null;
    reason?: string | null;
  } | null;
  planExemption?: {
    code: string;
    reason: string;
  } | null;
};

type TemplateDropdownProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  includePlanned?: boolean;
  resumeId?: string | null;
  templateLimit?: number;
  showAccessHint?: boolean;
};

function getResumeIdFromPathname() {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.pathname.match(/\/resumes\/([^/]+)/);

  if (!match?.[1] || match[1] === "new") {
    return null;
  }

  return decodeURIComponent(match[1]);
}

function buildAccessHint(input: {
  isLoadingAccess: boolean;
  hasLoadedAccess: boolean;
  unlockedCount: number;
  activePlanCodes: string[];
  exportAccess: BillingAccessResponse["exportAccess"];
  planExemption: BillingAccessResponse["planExemption"];
}) {
  if (input.isLoadingAccess || !input.hasLoadedAccess) {
    return "Checking template access...";
  }

  if (input.planExemption) {
    return `${input.unlockedCount} templates unlocked for your own admin resume.`;
  }

  if (input.exportAccess?.code === "DOWNLOAD_LIMIT_REACHED") {
    return `Templates unlocked: ${input.unlockedCount}. PDF downloads used: ${
      input.exportAccess.downloadsUsed ?? input.exportAccess.downloadLimit ?? 0
    } of ${input.exportAccess.downloadLimit ?? 0}. Buy another export pack to download again.`;
  }

  if (input.activePlanCodes.length > 0) {
    if (input.exportAccess?.canExport) {
      return `Paid access: ${input.unlockedCount} templates unlocked and PDF export available.`;
    }

    return `Paid template access: ${input.unlockedCount} templates unlocked. PDF export is not currently available.`;
  }

  return `Free access: ${input.unlockedCount} templates unlocked. Locked templates require a paid entitlement.`;
}

export default function TemplateDropdown({
  includePlanned = false,
  className = "",
  resumeId,
  templateLimit,
  showAccessHint = true,
  value,
  defaultValue,
  ...props
}: TemplateDropdownProps) {
  const [resolvedTemplateLimit, setResolvedTemplateLimit] = useState(
    templateLimit ?? 2
  );
  const [activePlanCodes, setActivePlanCodes] = useState<string[]>([]);
  const [exportAccess, setExportAccess] =
    useState<BillingAccessResponse["exportAccess"]>(null);
  const [planExemption, setPlanExemption] =
    useState<BillingAccessResponse["planExemption"]>(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [hasLoadedAccess, setHasLoadedAccess] = useState(
    typeof templateLimit === "number"
  );

  const currentValue =
    typeof value === "string"
      ? value
      : typeof defaultValue === "string"
        ? defaultValue
        : undefined;

  useEffect(() => {
    if (typeof templateLimit === "number") {
      setResolvedTemplateLimit(templateLimit);
      setHasLoadedAccess(true);
      return;
    }

    const resolvedResumeId = resumeId ?? getResumeIdFromPathname();

    if (!resolvedResumeId) {
      setResolvedTemplateLimit(2);
      setHasLoadedAccess(true);
      return;
    }

    let isMounted = true;

    async function loadAccess(resumeIdForRequest: string) {
      setIsLoadingAccess(true);

      try {
        const response = await fetch(
          `/api/billing/access?resumeId=${encodeURIComponent(resumeIdForRequest)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`Billing access request failed: ${response.status}`);
        }

        const data = (await response.json()) as BillingAccessResponse;

        if (!isMounted) {
          return;
        }

        setResolvedTemplateLimit(
          typeof data.templateLimit === "number" ? data.templateLimit : 2
        );
        setActivePlanCodes(data.activePlanCodes ?? []);
        setExportAccess(data.exportAccess ?? null);
        setPlanExemption(data.planExemption ?? null);
        setHasLoadedAccess(true);
      } catch (error) {
        console.error("Failed to load billing access:", error);

        if (isMounted) {
          setResolvedTemplateLimit(2);
          setHasLoadedAccess(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAccess(false);
        }
      }
    }

    void loadAccess(resolvedResumeId);

    return () => {
      isMounted = false;
    };
  }, [resumeId, templateLimit]);

  const templates = includePlanned
    ? getAllResumeTemplateDefinitions()
    : getSelectableResumeTemplateDefinitions();

  const unlockedCount = useMemo(
    () =>
      templates.filter(
        (template, index) =>
          template.status === "available" && index + 1 <= resolvedTemplateLimit
      ).length,
    [templates, resolvedTemplateLimit]
  );

  return (
    <div className="space-y-2">
      <select
        {...props}
        value={value}
        defaultValue={defaultValue}
        disabled={props.disabled || isLoadingAccess || !hasLoadedAccess}
        className={
          className ||
          "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500"
        }
      >
        {templates.map((template, index) => {
          const templateRank = index + 1;
          const isLockedByPlan =
            template.status === "available" &&
            templateRank > resolvedTemplateLimit;
          const isCurrentValue = currentValue === template.id;
          const isDisabled =
            template.status !== "available" ||
            (isLockedByPlan && !isCurrentValue);

          let label = template.label;

          if (template.status !== "available") {
            label = `${template.label} (coming soon)`;
          } else if (isLockedByPlan) {
            label = `${template.label} (locked)`;
          }

          return (
            <option key={template.id} value={template.id} disabled={isDisabled}>
              {label}
            </option>
          );
        })}
      </select>

      {showAccessHint ? (
        <p className="text-xs text-slate-500">
          {buildAccessHint({
            isLoadingAccess,
            hasLoadedAccess,
            unlockedCount,
            activePlanCodes,
            exportAccess,
            planExemption,
          })}
        </p>
      ) : null}
    </div>
  );
}