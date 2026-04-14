"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ResumeRecord } from "@/lib/types";
import {
  resumeFormSchema,
  type ResumeFormValues,
} from "@/lib/validators";

type ResumeFormProps = {
  resume: ResumeRecord;
};

export default function ResumeForm({ resume }: ResumeFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      title: resume.title,
      template: resume.template,
      themeColor: resume.themeColor ?? "",
      fontFamily: resume.fontFamily ?? "",
      photoPath: resume.photoPath ?? "",
      data: {
        personal: {
          fullName: resume.data.personal.fullName ?? "",
          email: resume.data.personal.email ?? "",
          phone: resume.data.personal.phone ?? "",
          location: resume.data.personal.location ?? "",
          linkedIn: resume.data.personal.linkedIn ?? "",
          website: resume.data.personal.website ?? "",
        },
        summary: resume.data.summary ?? "",
        experience: resume.data.experience ?? [],
        education: resume.data.education ?? [],
        skills: resume.data.skills ?? [],
        projects: resume.data.projects ?? [],
        certifications: resume.data.certifications ?? [],
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  async function onSubmit(values: ResumeFormValues) {
    try {
      setIsSaving(true);
      setMessage("");

      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save resume");
      }

      setMessage("Resume saved successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Resume Settings</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Resume Title</label>
            <input
              {...register("title")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="My Professional Resume"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Template</label>
            <select
              {...register("template")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              <option value="modern-1">Modern 1</option>
              <option value="modern-2">Modern 2</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Personal Details</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <input
              {...register("data.personal.fullName")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              {...register("data.personal.email")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="john@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <input
              {...register("data.personal.phone")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="+61 ..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Location</label>
            <input
              {...register("data.personal.location")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="Adelaide, SA"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">LinkedIn</label>
            <input
              {...register("data.personal.linkedIn")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="linkedin.com/in/yourname"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Website</label>
            <input
              {...register("data.personal.website")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="yourwebsite.com"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Professional Summary</h2>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium">Summary</label>
          <textarea
            {...register("data.summary")}
            rows={6}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="Write a short professional summary..."
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Resume"}
        </button>

        <span className="text-sm text-slate-600">
          {message || (isDirty ? "You have unsaved changes." : "No unsaved changes.")}
        </span>
      </div>
    </form>
  );
}