"use client";

import { useState } from "react";

type PurchaseButtonProps = {
  planCode: string;
  resumeId?: string | null;
  disabled?: boolean;
  children?: string;
  className?: string;
};

export default function PurchaseButton({
  planCode,
  resumeId,
  disabled = false,
  children = "Buy with PayPal",
  className = "",
}: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePurchase() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/billing/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planCode,
          resumeId: resumeId ?? undefined,
        }),
      });

      const data = (await response.json()) as {
        approvalUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.approvalUrl) {
        throw new Error(data.error ?? "Could not start PayPal checkout.");
      }

      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not start PayPal checkout."
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => void handlePurchase()}
        className={
          className ||
          "w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        }
      >
        {isLoading ? "Opening PayPal..." : children}
      </button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}