"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DuplicateResumeButtonProps = {
  resumeId: string;
  className?: string;
  label?: string;
};

export default function DuplicateResumeButton({
  resumeId,
  className,
  label = "Duplicate",
}: DuplicateResumeButtonProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDuplicate() {
    try {
      setIsDuplicating(true);
      setErrorMessage("");

      const response = await fetch(`/api/resumes/${resumeId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate resume");
      }

      const duplicatedResume = (await response.json()) as { id: string };

      router.push(`/resumes/${duplicatedResume.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to duplicate resume.");
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className={className}
      >
        {isDuplicating ? "Duplicating..." : label}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}