"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ResumeRecord } from "@/lib/types";
import {
  resumeFormSchema,
  type ResumeFormValues,
} from "@/lib/validators";
import { getResumeFormData } from "@/lib/resume/selectors";

type ResumeFormProps = {
  resume: ResumeRecord;
};

const emptyExperience = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyEducation = {
  institution: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptySkill = {
  name: "",
  level: "",
};

const emptyProject = {
  name: "",
  role: "",
  url: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyCertification = {
  name: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  url: "",
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
      themeColor: resume.themeColor ?? resume.data.layout.themeColor ?? "",
      fontFamily: resume.fontFamily ?? resume.data.layout.fontFamily ?? "",
      photoPath: resume.photoPath ?? "",
      data: getResumeFormData(resume.data),
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const experienceArray = useFieldArray({
    control,
    name: "data.experience",
  });

  const educationArray = useFieldArray({
    control,
    name: "data.education",
  });

  const skillsArray = useFieldArray({
    control,
    name: "data.skills",
  });

  const projectsArray = useFieldArray({
    control,
    name: "data.projects",
  });

  const certificationsArray = useFieldArray({
    control,
    name: "data.certifications",
  });

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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Experience</h2>
          <button
            type="button"
            onClick={() => experienceArray.append(emptyExperience)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Experience
          </button>
        </div>

        {experienceArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No experience entries yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {experienceArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Experience #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => experienceArray.remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Job Title</label>
                    <input
                      {...register(`data.experience.${index}.role` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Frontend Developer"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Company</label>
                    <input
                      {...register(`data.experience.${index}.company` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Acme Pty Ltd"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Location</label>
                    <input
                      {...register(`data.experience.${index}.location` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Adelaide, SA"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Start Date</label>
                    <input
                      {...register(`data.experience.${index}.startDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Jan 2024"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">End Date</label>
                    <input
                      {...register(`data.experience.${index}.endDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Present"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">
                    Description / Highlights
                  </label>
                  <textarea
                    {...register(`data.experience.${index}.description` as const)}
                    rows={5}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="Describe what you achieved in this role..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <button
            type="button"
            onClick={() => educationArray.append(emptyEducation)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Education
          </button>
        </div>

        {educationArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No education entries yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {educationArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Education #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => educationArray.remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Institution</label>
                    <input
                      {...register(`data.education.${index}.institution` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="University of Adelaide"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Degree</label>
                    <input
                      {...register(`data.education.${index}.degree` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Bachelor of Computer Science"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Location</label>
                    <input
                      {...register(`data.education.${index}.location` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Adelaide, SA"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Start Date</label>
                    <input
                      {...register(`data.education.${index}.startDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="2021"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">End Date</label>
                    <input
                      {...register(`data.education.${index}.endDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">
                    Notes / Description
                  </label>
                  <textarea
                    {...register(`data.education.${index}.description` as const)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="Relevant coursework, honours, awards..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <button
            type="button"
            onClick={() => skillsArray.append(emptySkill)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Skill
          </button>
        </div>

        {skillsArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No skills added yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {skillsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Skill #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => skillsArray.remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Skill</label>
                    <input
                      {...register(`data.skills.${index}.name` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="React"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Level</label>
                    <input
                      {...register(`data.skills.${index}.level` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Advanced"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            type="button"
            onClick={() => projectsArray.append(emptyProject)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Project
          </button>
        </div>

        {projectsArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No projects added yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {projectsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Project #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => projectsArray.remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Project Name</label>
                    <input
                      {...register(`data.projects.${index}.name` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="CV Builder"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Role</label>
                    <input
                      {...register(`data.projects.${index}.role` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Full Stack Developer"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Project URL</label>
                    <input
                      {...register(`data.projects.${index}.url` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Start Date</label>
                    <input
                      {...register(`data.projects.${index}.startDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Apr 2026"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">End Date</label>
                    <input
                      {...register(`data.projects.${index}.endDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Present"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    {...register(`data.projects.${index}.description` as const)}
                    rows={5}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="Explain what the project does and your contribution..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Certifications</h2>
          <button
            type="button"
            onClick={() => certificationsArray.append(emptyCertification)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Certification
          </button>
        </div>

        {certificationsArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No certifications added yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {certificationsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Certification #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => certificationsArray.remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Certification Name</label>
                    <input
                      {...register(`data.certifications.${index}.name` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="AWS Certified Cloud Practitioner"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Issuer</label>
                    <input
                      {...register(`data.certifications.${index}.issuer` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Issue Date</label>
                    <input
                      {...register(`data.certifications.${index}.issueDate` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="Mar 2026"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Credential ID</label>
                    <input
                      {...register(`data.certifications.${index}.credentialId` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="ABC123456"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Credential URL</label>
                    <input
                      {...register(`data.certifications.${index}.url` as const)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          {message ||
            (isDirty ? "You have unsaved changes." : "No unsaved changes.")}
        </span>
      </div>
    </form>
  );
}