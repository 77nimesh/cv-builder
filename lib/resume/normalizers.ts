import type {
  CertificationItem,
  CustomSectionEntry,
  CustomSectionFormSection,
  EducationItem,
  ExperienceItem,
  PersonalDetails,
  ProjectItem,
  ResumeData,
  ResumeFormData,
  ResumeSection,
  ResumeSectionItem,
  ResumeSectionType,
  ResumeZone,
  SkillItem,
  ResumePhotoShape,
} from "@/lib/types";
import {
  createDefaultResumeData,
  defaultBuiltInSectionVisibility,
  defaultCertificationItem,
  defaultCustomSectionEntry,
  defaultEducationItem,
  defaultExperienceItem,
  defaultPersonalDetails,
  defaultProjectItem,
  defaultSkillItem,
} from "@/lib/resume/defaults";

type ResumeNormalizationOptions = {
  template?: string | null;
  themeColor?: string | null;
  fontFamily?: string | null;
  photoShape?: ResumePhotoShape | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readPosition(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readZone(value: unknown, fallback: ResumeZone): ResumeZone {
  return value === "main" || value === "sidebar" ? value : fallback;
}

function readPhotoShape(
  value: unknown,
  fallback: ResumePhotoShape = "square"
): ResumePhotoShape {
  return value === "circle" ? "circle" : fallback;
}

function isBrokenGeneratedId(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return (
    trimmed.includes("<span class=\"katex\">") ||
    trimmed.includes("katex-mathml") ||
    trimmed.includes("{fallbackPrefix}") ||
    trimmed.includes("{fallbackPosition") ||
    trimmed.includes("{start}") ||
    trimmed.includes("{end}") ||
    trimmed.includes("<math ") ||
    trimmed.includes("</span>")
  );
}

function buildSafeItemId(prefix: string, position: number) {
  return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>p</mi><mi>r</mi><mi>e</mi><mi>f</mi><mi>i</mi><mi>x</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{prefix}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">i</span><span class="mord mathnormal">x</span></span><span class="mord">−</span></span></span></span>{position + 1}`;
}

function buildSafeSectionId(position: number) {
  return `custom-${position + 1}`;
}

function readIdString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizePersonalDetailsContent(value: unknown): PersonalDetails {
  if (!isRecord(value)) {
    return { ...defaultPersonalDetails };
  }

  return {
    fullName: readString(value.fullName),
    headline: readString(value.headline, defaultPersonalDetails.headline),
    email: readString(value.email),
    phone: readString(value.phone),
    location: readString(value.location),
    linkedIn: readString(value.linkedIn),
    website: readString(value.website),
  };
}

function normalizeSummaryContent(value: unknown): { text: string } {
  if (typeof value === "string") {
    return { text: value };
  }

  if (!isRecord(value)) {
    return { text: "" };
  }

  return {
    text: readString(value.text),
  };
}

function normalizeExperienceItem(value: unknown): ExperienceItem {
  if (!isRecord(value)) {
    return { ...defaultExperienceItem };
  }

  return {
    company: readString(value.company),
    role: readString(value.role),
    location: readString(value.location),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeEducationItem(value: unknown): EducationItem {
  if (!isRecord(value)) {
    return { ...defaultEducationItem };
  }

  return {
    institution: readString(value.institution),
    degree: readString(value.degree),
    location: readString(value.location),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeSkillItem(value: unknown): SkillItem {
  if (!isRecord(value)) {
    return { ...defaultSkillItem };
  }

  return {
    name: readString(value.name),
    level: readString(value.level),
  };
}

function normalizeProjectItem(value: unknown): ProjectItem {
  if (!isRecord(value)) {
    return { ...defaultProjectItem };
  }

  return {
    name: readString(value.name),
    role: readString(value.role),
    url: readString(value.url),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  };
}

function normalizeCertificationItem(value: unknown): CertificationItem {
  if (!isRecord(value)) {
    return { ...defaultCertificationItem };
  }

  return {
    name: readString(value.name),
    issuer: readString(value.issuer),
    issueDate: readString(value.issueDate),
    credentialId: readString(value.credentialId),
    url: readString(value.url),
  };
}

function normalizeCustomSectionEntry(value: unknown): CustomSectionEntry {
  if (!isRecord(value)) {
    return { ...defaultCustomSectionEntry };
  }

  return {
    title: readString(value.title),
    subtitle: readString(value.subtitle),
    meta: readString(value.meta),
    description: readString(value.description),
  };
}

function buildNormalizedItem(
  sectionType: ResumeSectionType,
  rawItem: unknown,
  fallbackPosition: number,
  fallbackPrefix: string
): ResumeSectionItem {
  const itemRecord = isRecord(rawItem) ? rawItem : null;
  const rawId = readIdString(itemRecord?.id);
  const id = isBrokenGeneratedId(rawId)
    ? buildSafeItemId(fallbackPrefix, fallbackPosition)
    : rawId;

  const position = readPosition(itemRecord?.position, fallbackPosition);
  const rawContent = itemRecord?.content ?? rawItem;

  switch (sectionType) {
    case "personal-details":
      return {
        id,
        position,
        content: normalizePersonalDetailsContent(rawContent),
      };
    case "summary":
      return {
        id,
        position,
        content: normalizeSummaryContent(rawContent),
      };
    case "experience":
      return {
        id,
        position,
        content: normalizeExperienceItem(rawContent),
      };
    case "education":
      return {
        id,
        position,
        content: normalizeEducationItem(rawContent),
      };
    case "skills":
      return {
        id,
        position,
        content: normalizeSkillItem(rawContent),
      };
    case "projects":
      return {
        id,
        position,
        content: normalizeProjectItem(rawContent),
      };
    case "certifications":
      return {
        id,
        position,
        content: normalizeCertificationItem(rawContent),
      };
    case "custom":
      return {
        id,
        position,
        content: normalizeCustomSectionEntry(rawContent),
      };
    default:
      return {
        id,
        position,
        content: rawContent ?? {},
      };
  }
}

function buildDefaultSectionTemplate(
  sectionType: Exclude<ResumeSectionType, "custom">
): ResumeSection {
  const defaultData = createDefaultResumeData();
  const section = defaultData.sections.find((item) => item.type === sectionType);

  if (!section) {
    throw new Error(`Missing default section template for ${sectionType}`);
  }

  return section;
}

function normalizeSectionItems(
  sectionType: ResumeSectionType,
  rawItems: unknown,
  fallbackPrefix: string
): ResumeSectionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    if (sectionType === "personal-details" || sectionType === "summary") {
      const defaultSection = buildDefaultSectionTemplate(
        sectionType as "personal-details" | "summary"
      );
      return defaultSection.items.map((item) => ({ ...item }));
    }

    return [];
  }

  const seenIds = new Set<string>();

  return rawItems
    .map((item, index) =>
      buildNormalizedItem(sectionType, item, index, fallbackPrefix)
    )
    .sort((left, right) => left.position - right.position)
    .map((item, index) => {
      let nextId = item.id;

      if (isBrokenGeneratedId(nextId) || seenIds.has(nextId)) {
        nextId = buildSafeItemId(fallbackPrefix, index);
      }

      while (seenIds.has(nextId)) {
        nextId = `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>b</mi><mi>u</mi><mi>i</mi><mi>l</mi><mi>d</mi><mi>S</mi><mi>a</mi><mi>f</mi><mi>e</mi><mi>I</mi><mi>t</mi><mi>e</mi><mi>m</mi><mi>I</mi><mi>d</mi><mo stretchy="false">(</mo><mi>f</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>b</mi><mi>a</mi><mi>c</mi><mi>k</mi><mi>P</mi><mi>r</mi><mi>e</mi><mi>f</mi><mi>i</mi><mi>x</mi><mo separator="true">,</mo><mi>i</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{buildSafeItemId(fallbackPrefix, index)}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="mord mathnormal">u</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.05764em;">S</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">I</span><span class="mord mathnormal">t</span><span class="mord mathnormal">e</span><span class="mord mathnormal">m</span><span class="mord mathnormal" style="margin-right:0.07847em;">I</span><span class="mord mathnormal">d</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">ba</span><span class="mord mathnormal">c</span><span class="mord mathnormal" style="margin-right:0.03148em;">k</span><span class="mord mathnormal" style="margin-right:0.13889em;">P</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">i</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">in</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span><span class="mord">−</span></span></span></span>{seenIds.size + 1}`;
      }

      seenIds.add(nextId);

      return {
        ...item,
        position: index,
        id: nextId,
      };
    });
}

function normalizeCanonicalSection(
  rawSection: unknown,
  defaultSection: ResumeSection,
  fallbackPosition: number
): ResumeSection {
  const sectionRecord = isRecord(rawSection) ? rawSection : {};

  return {
    id: defaultSection.id,
    type: defaultSection.type,
    title: readString(sectionRecord.title, defaultSection.title),
    zone: readZone(sectionRecord.zone, defaultSection.zone),
    position: readPosition(sectionRecord.position, fallbackPosition),
    visible: readBoolean(sectionRecord.visible, defaultSection.visible),
    items: normalizeSectionItems(
      defaultSection.type,
      sectionRecord.items,
      defaultSection.id
    ),
  };
}

function normalizeCustomSection(
  rawSection: unknown,
  fallbackPosition: number
): ResumeSection {
  const sectionRecord = isRecord(rawSection) ? rawSection : {};
  const rawId = readIdString(sectionRecord.id);
  const id = isBrokenGeneratedId(rawId)
    ? buildSafeSectionId(fallbackPosition)
    : readIdString(sectionRecord.id, buildSafeSectionId(fallbackPosition));

  return {
    id,
    type: "custom",
    title: readString(sectionRecord.title, "Custom Section"),
    zone: readZone(sectionRecord.zone, "main"),
    position: readPosition(sectionRecord.position, fallbackPosition),
    visible: readBoolean(sectionRecord.visible, true),
    items: normalizeSectionItems("custom", sectionRecord.items, `${id}-entry`),
  };
}

function buildUniqueSectionId(
  section: ResumeSection,
  fallbackPosition: number,
  seenIds: Set<string>
) {
  const baseId =
    section.type === "custom"
      ? isBrokenGeneratedId(section.id)
        ? buildSafeSectionId(fallbackPosition)
        : readIdString(section.id, buildSafeSectionId(fallbackPosition))
      : section.id;

  let nextId = baseId;

  if (!nextId || seenIds.has(nextId)) {
    const safeBase =
      section.type === "custom"
        ? buildSafeSectionId(fallbackPosition)
        : `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>e</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>o</mi><mi>n</mi><mi mathvariant="normal">.</mi><mi>i</mi><mi>d</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{section.id}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">sec</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord">.</span><span class="mord mathnormal">i</span><span class="mord mathnormal">d</span></span><span class="mord">−</span></span></span></span>{fallbackPosition + 1}`;

    nextId = safeBase;

    let suffix = 2;
    while (seenIds.has(nextId)) {
      nextId = `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>s</mi><mi>a</mi><mi>f</mi><mi>e</mi><mi>B</mi><mi>a</mi><mi>s</mi><mi>e</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{safeBase}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.05017em;">B</span><span class="mord mathnormal">a</span><span class="mord mathnormal">se</span></span><span class="mord">−</span></span></span></span>{suffix}`;
      suffix += 1;
    }
  }

  seenIds.add(nextId);
  return nextId;
}

function normalizeSectionIds(sections: ResumeSection[]) {
  const seenIds = new Set<string>();

  return sections.map((section, index) => ({
    ...section,
    id: buildUniqueSectionId(section, index, seenIds),
  }));
}

function normalizeCanonicalResumeData(
  value: ResumeData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
    photoShape: options.photoShape ?? undefined,
  });

  const meta: Record<string, unknown> = isRecord(value.meta) ? value.meta : {};
  const layout: Record<string, unknown> = isRecord(value.layout) ? value.layout : {};
  const sections = Array.isArray(value.sections) ? value.sections : [];

  const builtInSections = defaults.sections.map((defaultSection, index) => {
    const rawSection = sections.find((section) => {
      if (!isRecord(section)) {
        return false;
      }

      return (
        section.type === defaultSection.type || section.id === defaultSection.id
      );
    });

    return normalizeCanonicalSection(rawSection, defaultSection, index);
  });

  const customSections = sections
    .filter((section) => isRecord(section) && section.type === "custom")
    .map((section, index) =>
      normalizeCustomSection(section, defaults.sections.length + index)
    );

  return {
    meta: {
      language: readString(meta.language, defaults.meta.language),
      targetRole: readString(meta.targetRole, defaults.meta.targetRole),
    },
    layout: {
      template: readString(
        options.template ?? layout.template,
        defaults.layout.template
      ),
      themeColor: readNullableString(
        options.themeColor !== undefined ? options.themeColor : layout.themeColor
      ),
      fontFamily: readNullableString(
        options.fontFamily !== undefined ? options.fontFamily : layout.fontFamily
      ),
      photoShape: readPhotoShape(
        options.photoShape !== undefined ? options.photoShape : layout.photoShape,
        defaults.layout.photoShape
      ),
    },
    sections: normalizeSectionIds(
      [...builtInSections, ...customSections]
        .sort((left, right) => left.position - right.position)
        .map((section, index) => ({
          ...section,
          position: index,
        }))
    ),
  };
}

export function isCanonicalResumeData(value: unknown): value is ResumeData {
  return isRecord(value) && Array.isArray(value.sections);
}

function getCustomSectionId(
  section: CustomSectionFormSection,
  startPosition: number,
  index: number
) {
  return section.id || `custom-${startPosition + index + 1}`;
}

function buildCustomSectionsFromFormData(
  customSections: CustomSectionFormSection[],
  startPosition: number
): ResumeSection[] {
  return customSections.map((section, index) => {
    const sectionId = getCustomSectionId(section, startPosition, index);

    return {
      id: sectionId,
      type: "custom" as const,
      title: readString(section.title, "Custom Section"),
      zone: readZone(section.zone, "main"),
      position: startPosition + index,
      visible: readBoolean(section.visible, true),
      items: normalizeSectionItems(
        "custom",
        section.entries,
        `${sectionId}-entry`
      ),
    };
  });
}

export function buildResumeDataFromFormData(
  formData: ResumeFormData,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  const defaults = createDefaultResumeData({
    template: options.template ?? undefined,
    themeColor: options.themeColor ?? null,
    fontFamily: options.fontFamily ?? null,
    photoShape: options.photoShape ?? undefined,
  });

  const sections = defaults.sections.map((section) => {
    switch (section.type) {
      case "personal-details":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.personalDetails,
            defaultBuiltInSectionVisibility.personalDetails
          ),
          items: [
            {
              id: "personal-details-1",
              position: 0,
              content: normalizePersonalDetailsContent(formData.personal),
            },
          ],
        };
      case "summary":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.summary,
            defaultBuiltInSectionVisibility.summary
          ),
          items: [
            {
              id: "summary-1",
              position: 0,
              content: normalizeSummaryContent(formData.summary),
            },
          ],
        };
      case "experience":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.experience,
            defaultBuiltInSectionVisibility.experience
          ),
          items: normalizeSectionItems("experience", formData.experience, "experience"),
        };
      case "education":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.education,
            defaultBuiltInSectionVisibility.education
          ),
          items: normalizeSectionItems("education", formData.education, "education"),
        };
      case "skills":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.skills,
            defaultBuiltInSectionVisibility.skills
          ),
          items: normalizeSectionItems("skills", formData.skills, "skills"),
        };
      case "projects":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.projects,
            defaultBuiltInSectionVisibility.projects
          ),
          items: normalizeSectionItems("projects", formData.projects, "projects"),
        };
      case "certifications":
        return {
          ...section,
          visible: readBoolean(
            formData.sectionVisibility?.certifications,
            defaultBuiltInSectionVisibility.certifications
          ),
          items: normalizeSectionItems(
            "certifications",
            formData.certifications,
            "certifications"
          ),
        };
      default:
        return section;
    }
  });

  const customSections = buildCustomSectionsFromFormData(
    Array.isArray(formData.customSections) ? formData.customSections : [],
    sections.length
  );

  return normalizeCanonicalResumeData(
    {
      meta: defaults.meta,
      layout: defaults.layout,
      sections: [...sections, ...customSections],
    },
    options
  );
}

export function normalizeResumeData(
  value: unknown,
  options: ResumeNormalizationOptions = {}
): ResumeData {
  if (isCanonicalResumeData(value)) {
    return normalizeCanonicalResumeData(value, options);
  }

  const legacy = isRecord(value) ? value : {};

  return buildResumeDataFromFormData(
    {
      personal: normalizePersonalDetailsContent(legacy.personal),
      summary: readString(legacy.summary),
      experience: Array.isArray(legacy.experience) ? legacy.experience : [],
      education: Array.isArray(legacy.education) ? legacy.education : [],
      skills: Array.isArray(legacy.skills) ? legacy.skills : [],
      projects: Array.isArray(legacy.projects) ? legacy.projects : [],
      certifications: Array.isArray(legacy.certifications)
        ? legacy.certifications
        : [],
      customSections: [],
    },
    options
  );
}