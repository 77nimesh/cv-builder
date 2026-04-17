"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  type Control,
  type UseFormRegister,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhotoUploadField from "@/components/forms/photo-upload-field";
import {
  DEFAULT_RESUME_THEME_ID,
  RESUME_THEME_PRESETS,
  resolveResumeTheme,
} from "@/components/templates/theme-presets";
import {
  DEFAULT_RESUME_FONT_ID,
  RESUME_FONT_PRESETS,
  resolveResumeFont,
} from "@/components/templates/font-presets";
import type { ResumeRecord } from "@/lib/types";
import { getResumeFormData } from "@/lib/resume/selectors";
import {
  createEmptyCustomSectionFormSection,
  defaultCertificationItem,
  defaultEducationItem,
  defaultExperienceItem,
  defaultProjectItem,
  defaultSkillItem,
} from "@/lib/resume/defaults";
import {
  resumeFormSchema,
  type ResumeFormValues,
} from "@/lib/validators";

type ResumeFormProps = {
  resume: ResumeRecord;
};

const BUILT_IN_SECTION_VISIBILITY_OPTIONS: Array<{
  field: keyof ResumeFormValues["data"]["sectionVisibility"];
  label: string;
  description: string;
}> = [
  {
    field: "personalDetails",
    label: "Personal Details",
    description: "Name, contact details, headline, and photo",
  },
  {
    field: "summary",
    label: "Professional Summary",
    description: "Short introduction or profile summary",
  },
  {
    field: "experience",
    label: "Experience",
    description: "Employment history and achievements",
  },
  {
    field: "education",
    label: "Education",
    description: "Degrees, certificates, and study history",
  },
  {
    field: "skills",
    label: "Skills",
    description: "Skill list or capability tags",
  },
  {
    field: "projects",
    label: "Projects",
    description: "Portfolio, coursework, or personal projects",
  },
  {
    field: "certifications",
    label: "Certifications",
    description: "Licences, badges, and formal certifications",
  },
];

type ThemeColorDropdownProps = {
  value: string;
  onChange: (nextThemeId: string) => void;
};

function ThemeColorDropdown({
  value,
  onChange,
}: ThemeColorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeTheme = resolveResumeTheme(value || DEFAULT_RESUME_THEME_ID);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 px-4 py-3 text-left outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: activeTheme.primary }}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-900">
              {activeTheme.label}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {activeTheme.description}
            </span>
          </span>
        </span>

        <span className="ml-3 text-xs text-slate-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen ? (
        <div
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          role="listbox"
          aria-label="Theme Color"
        >
          {RESUME_THEME_PRESETS.map((themeOption) => {
            const isActive = themeOption.id === activeTheme.id;

            return (
              <button
                key={themeOption.id}
                type="button"
                onClick={() => {
                  onChange(themeOption.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-slate-100 ring-1 ring-slate-300"
                    : "hover:bg-slate-50"
                }`}
                role="option"
                aria-selected={isActive}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: themeOption.primary }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">
                    {themeOption.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {themeOption.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type CustomSectionFieldsProps = {
  index: number;
  control: Control<ResumeFormValues>;
  register: UseFormRegister<ResumeFormValues>;
  removeSection: (index: number) => void;
};

function CustomSectionFields({
  index,
  control,
  register,
  removeSection,
}: CustomSectionFieldsProps) {
  const entriesArray = useFieldArray({
    control,
    name: `data.customSections.${index}.entries` as const,
  });

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <input
        type="hidden"
        {...register(`data.customSections.${index}.id` as const)}
      />

      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Custom Section #{index + 1}</h3>
        <button
          type="button"
          onClick={() => removeSection(index)}
          className="text-sm text-red-600"
        >
          Remove Section
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Section Title</label>
          <input
            {...register(`data.customSections.${index}.title` as const)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="Awards"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Column</label>
          <select
            {...register(`data.customSections.${index}.zone` as const)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
          >
            <option value="main">Main</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            {...register(`data.customSections.${index}.visible` as const)}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">Visible in preview and PDF</label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h4 className="font-medium">Entries</h4>
        <button
          type="button"
          onClick={() =>
            entriesArray.append({
              title: "",
              subtitle: "",
              meta: "",
              description: "",
            })
          }
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
        >
          Add Entry
        </button>
      </div>

      {entriesArray.fields.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No entries yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {entriesArray.fields.map((field, entryIndex) => (
            <div
              key={field.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h5 className="font-medium">Entry #{entryIndex + 1}</h5>
                <button
                  type="button"
                  onClick={() => entriesArray.remove(entryIndex)}
                  className="text-sm text-red-600"
                >
                  Remove Entry
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Title</label>
                  <input
                    {...register(
                      `data.customSections.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>i</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi></mrow><mi mathvariant="normal">.</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>r</mi><mi>i</mi><mi>e</mi><mi>s</mi><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">{index}.entries.</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">in</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span></span><span class="mord">.</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">i</span><span class="mord mathnormal">es</span><span class="mord">.</span></span></span></span>{entryIndex}.title` as const
                    )}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="Dean’s List"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Subtitle</label>
                  <input
                    {...register(
                      `data.customSections.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>i</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi></mrow><mi mathvariant="normal">.</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>r</mi><mi>i</mi><mi>e</mi><mi>s</mi><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">{index}.entries.</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">in</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span></span><span class="mord">.</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">i</span><span class="mord mathnormal">es</span><span class="mord">.</span></span></span></span>{entryIndex}.subtitle` as const
                    )}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="University of Adelaide"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Meta</label>
                  <input
                    {...register(
                      `data.customSections.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>i</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi></mrow><mi mathvariant="normal">.</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>r</mi><mi>i</mi><mi>e</mi><mi>s</mi><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">{index}.entries.</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">in</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span></span><span class="mord">.</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">i</span><span class="mord mathnormal">es</span><span class="mord">.</span></span></span></span>{entryIndex}.meta` as const
                    )}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="2024 • Adelaide"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  {...register(
                    `data.customSections.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>i</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi></mrow><mi mathvariant="normal">.</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>r</mi><mi>i</mi><mi>e</mi><mi>s</mi><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">{index}.entries.</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">in</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span></span><span class="mord">.</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">i</span><span class="mord mathnormal">es</span><span class="mord">.</span></span></span></span>{entryIndex}.description` as const
                  )}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                  placeholder="Describe this entry..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumeForm({ resume }: ResumeFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      title: resume.title,
      template: resume.template,
      themeColor:
        resume.themeColor ??
        resume.data.layout.themeColor ??
        DEFAULT_RESUME_THEME_ID,
      fontFamily:
        resume.fontFamily ??
        resume.data.layout.fontFamily ??
        DEFAULT_RESUME_FONT_ID,
      photoPath: resume.photoPath ?? "",
      photoShape: resume.data.layout.photoShape ?? "square",
      data: getResumeFormData(resume.data),
    },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
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

  const customSectionsArray = useFieldArray({
    control,
    name: "data.customSections",
  });

  // ── Auto-save: debounce 1.5s after any field change ──────────────────────
  const isFirstRender = useRef(true);
  const watchedValues = watch();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [JSON.stringify(watchedValues)]);
  // ─────────────────────────────────────────────────────────────────────────

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
    <div className="flex justify-center">
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Resume Settings</h2>

        <input type="hidden" {...register("photoPath")} />
        <input type="hidden" {...register("photoShape")} />

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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Theme Color</label>
            <input type="hidden" {...register("themeColor")} />
            <ThemeColorDropdown
              value={watch("themeColor") || DEFAULT_RESUME_THEME_ID}
              onChange={(nextThemeId) => {
                setValue("themeColor", nextThemeId, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Font Family</label>
            <select
              {...register("fontFamily")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            >
              {RESUME_FONT_PRESETS.map((fontOption) => (
                <option key={fontOption.id} value={fontOption.id}>
                  {fontOption.label}
                </option>
              ))}
            </select>
            <p
              className="mt-2 text-xs text-slate-500"
              style={{
                fontFamily: resolveResumeFont(
                  watch("fontFamily") || DEFAULT_RESUME_FONT_ID
                ).cssStack,
              }}
            >
              {
                resolveResumeFont(
                  watch("fontFamily") || DEFAULT_RESUME_FONT_ID
                ).description
              }
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PhotoUploadField
            photoPath={watch("photoPath") ?? ""}
            photoShape={watch("photoShape") === "circle" ? "circle" : "square"}
            onChange={(nextPhotoPath) => {
              setValue("photoPath", nextPhotoPath, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            onPhotoShapeChange={(nextPhotoShape) => {
              setValue("photoShape", nextPhotoShape, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Section Visibility</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hidden sections stay saved in your resume data but do not render in preview, print, or PDF.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {BUILT_IN_SECTION_VISIBILITY_OPTIONS.map((sectionOption) => (
            <label
              key={sectionOption.field}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
            >
              <input
                type="checkbox"
                {...register(
                  `data.sectionVisibility.${sectionOption.field}` as const
                )}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {sectionOption.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {sectionOption.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Custom sections keep their own visibility toggle inside each custom section card below.
        </p>
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
            <label className="mb-2 block text-sm font-medium">Headline / Subtitle</label>
            <input
              {...register("data.personal.headline")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              placeholder="AI & Computer Vision Trainee / Automotive Technician"
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
            onClick={() => experienceArray.append({ ...defaultExperienceItem })}
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
            onClick={() => educationArray.append({ ...defaultEducationItem })}
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
            onClick={() => skillsArray.append({ ...defaultSkillItem })}
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
            onClick={() => projectsArray.append({ ...defaultProjectItem })}
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
            onClick={() =>
              certificationsArray.append({ ...defaultCertificationItem })
            }
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Custom Sections</h2>
          <button
            type="button"
            onClick={() =>
              customSectionsArray.append(createEmptyCustomSectionFormSection())
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            Add Custom Section
          </button>
        </div>

        {customSectionsArray.fields.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No custom sections added yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {customSectionsArray.fields.map((field, index) => (
              <CustomSectionFields
                key={field.id}
                index={index}
                control={control}
                register={register}
                removeSection={customSectionsArray.remove}
              />
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

      {isDirty ? (
        null
      ) : null}
    </form>

      {/* ── Sticky save button pinned to the right of the form ── */}
      <div className="relative w-0">
        <div className="fixed bottom-6 ml-4 pt-6">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            aria-label="Save"
            title="Save"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 print:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3 4a2 2 0 0 1 2-2h7.586a2 2 0 0 1 1.414.586l2.414 2.414A2 2 0 0 1 17 6.414V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Zm2 0v12h10V7h-3a1 1 0 0 1-1-1V4H5Zm8 0.414V6h1.586L13 4.414ZM7 10a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" />
            </svg>
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
          {message && (
            <p className="mt-2 w-max text-xs text-slate-500">{message}</p>
          )}
        </div>
      </div>

    </div>
  );
}