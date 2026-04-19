"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteResumeButtonProps = {
  resumeId: string;
  className?: string;
  label?: string;
};

export default function DeleteResumeButton({
  resumeId,
  className,
  label = "Delete",
}: DeleteResumeButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this resume? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage("");

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete resume.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className={className}
      >
        {isDeleting ? "Deleting..." : label}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
