"use client";

import Link from "next/link";
import { useState } from "react";
import { BILLING_PLAN_CODES } from "@/lib/billing/types";

type ExportButtonVariant = "compact" | "card";

type ExportButtonProps = {
  resumeId: string;
  canExport: boolean;
  remainingDownloads?: number | null;
  downloadLimit?: number | null;
  downloadsUsed?: number | null;
  lockedReason?: string | null;
  lockedCode?: string | null;
  variant?: ExportButtonVariant;
};

function isDownloadLimitReached(code: string | null | undefined) {
  return code === "DOWNLOAD_LIMIT_REACHED";
}

function buildAllowanceText(input: {
  canExport: boolean;
  remainingDownloads?: number | null;
  downloadLimit?: number | null;
  downloadsUsed?: number | null;
  lockedCode?: string | null;
}) {
  if (input.downloadLimit === null) {
    return input.canExport ? "Unlimited downloads available." : null;
  }

  if (typeof input.downloadLimit !== "number") {
    return null;
  }

  if (isDownloadLimitReached(input.lockedCode)) {
    return `Download allowance used: ${
      input.downloadsUsed ?? input.downloadLimit
    } of ${input.downloadLimit}.`;
  }

  if (typeof input.remainingDownloads === "number") {
    return `${input.remainingDownloads} of ${input.downloadLimit} downloads remaining.`;
  }

  return null;
}

export default function ExportButton({
  resumeId,
  canExport,
  remainingDownloads,
  downloadLimit,
  downloadsUsed,
  lockedReason,
  lockedCode,
  variant = "card",
}: ExportButtonProps) {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [message, setMessage] = useState("");

  const compact = variant === "compact";
  const allowanceText = buildAllowanceText({
    canExport,
    remainingDownloads,
    downloadLimit,
    downloadsUsed,
    lockedCode,
  });
  const downloadLimitReached = isDownloadLimitReached(lockedCode);

  async function startCheckout() {
    setIsStartingCheckout(true);
    setMessage("");

    try {
      const response = await fetch("/api/billing/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planCode: BILLING_PLAN_CODES.SINGLE_EXPORT,
          resumeId,
        }),
      });

      const data = (await response.json()) as {
        approvalUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.approvalUrl) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setIsStartingCheckout(false);
    }
  }

  const baseButtonClass =
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300";

  const buttonClass = compact
    ? `${baseButtonClass} min-w-[190px] px-4 py-2`
    : `${baseButtonClass} w-full px-4 py-3`;

  const containerClass = compact
    ? "flex min-w-0 flex-col items-stretch gap-1.5 sm:items-end"
    : "space-y-2";

  const helperTextClass = compact
    ? "max-w-[240px] text-xs leading-5 text-slate-500 sm:text-right"
    : "text-xs leading-5 text-slate-500";

  const linkClass = compact
    ? "self-center text-xs font-medium text-slate-600 underline sm:self-end"
    : "block text-center text-xs font-medium text-slate-600 underline";

  if (canExport) {
    return (
      <div className={containerClass}>
        <a href={`/api/resumes/${resumeId}/pdf`} className={buttonClass}>
          Download PDF
        </a>

        {allowanceText ? <p className={helperTextClass}>{allowanceText}</p> : null}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <button
        type="button"
        disabled={isStartingCheckout}
        onClick={() => void startCheckout()}
        className={buttonClass}
      >
        {isStartingCheckout
          ? "Opening PayPal..."
          : downloadLimitReached
            ? "Buy Another Export Pack"
            : "Unlock PDF Export"}
      </button>

      <Link
        href={`/billing?resumeId=${encodeURIComponent(resumeId)}`}
        className={linkClass}
      >
        View plans
      </Link>

      {downloadLimitReached ? (
        <p className={helperTextClass}>
          {allowanceText} Buy another Single Export Pack to download again.
        </p>
      ) : (
        <p className={helperTextClass}>
          {lockedReason ?? "PDF export is locked for your current plan."}
        </p>
      )}

      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}