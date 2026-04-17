export const DEFAULT_RESUME_FONT_ID = "inter";

export type ResumeFontDefinition = {
  id: string;
  label: string;
  cssStack: string;
  description: string;
  matches?: string[];
};

export const RESUME_FONT_PRESETS: ResumeFontDefinition[] = [
  {
    id: "inter",
    label: "Inter",
    cssStack:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    description: "Modern clean sans-serif",
    matches: ["inter"],
  },
  {
    id: "arial",
    label: "Arial",
    cssStack: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    description: "Familiar neutral sans-serif",
    matches: ["arial"],
  },
  {
    id: "helvetica",
    label: "Helvetica",
    cssStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    description: "Classic editorial sans-serif",
    matches: ["helvetica", "helvetica neue"],
  },
  {
    id: "georgia",
    label: "Georgia",
    cssStack: 'Georgia, "Times New Roman", Times, serif',
    description: "Readable traditional serif",
    matches: ["georgia"],
  },
  {
    id: "times-new-roman",
    label: "Times New Roman",
    cssStack: '"Times New Roman", Times, serif',
    description: "Formal traditional serif",
    matches: ["times new roman", "times-new-roman", "times"],
  },
  {
    id: "garamond",
    label: "Garamond",
    cssStack: '"EB Garamond", Garamond, "Times New Roman", serif',
    description: "Elegant classical serif",
    matches: ["garamond", "eb garamond"],
  },
  {
    id: "palatino",
    label: "Palatino",
    cssStack: '"Palatino Linotype", Palatino, "Book Antiqua", serif',
    description: "Refined literary serif",
    matches: ["palatino", "palatino linotype"],
  },
  {
    id: "cambria",
    label: "Cambria",
    cssStack: 'Cambria, "Times New Roman", serif',
    description: "Polished Microsoft serif",
    matches: ["cambria"],
  },
  {
    id: "calibri",
    label: "Calibri",
    cssStack: 'Calibri, "Gill Sans", "Trebuchet MS", sans-serif',
    description: "Approachable modern sans-serif",
    matches: ["calibri"],
  },
  {
    id: "gill-sans",
    label: "Gill Sans",
    cssStack: '"Gill Sans", "Gill Sans MT", "Trebuchet MS", sans-serif',
    description: "Humanist British sans-serif",
    matches: ["gill sans", "gill sans mt"],
  },
  {
    id: "lato",
    label: "Lato",
    cssStack: 'Lato, "Helvetica Neue", Arial, sans-serif',
    description: "Friendly professional sans-serif",
    matches: ["lato"],
  },
  {
    id: "source-sans",
    label: "Source Sans",
    cssStack: '"Source Sans 3", "Source Sans Pro", Arial, sans-serif',
    description: "Crisp Adobe sans-serif",
    matches: ["source sans", "source sans pro", "source sans 3"],
  },
  {
    id: "merriweather",
    label: "Merriweather",
    cssStack: 'Merriweather, Georgia, serif',
    description: "Sturdy readable serif",
    matches: ["merriweather"],
  },
  {
    id: "libre-baskerville",
    label: "Libre Baskerville",
    cssStack: '"Libre Baskerville", Baskerville, Georgia, serif',
    description: "Sharp academic serif",
    matches: ["libre baskerville", "baskerville"],
  },
  {
    id: "nunito-sans",
    label: "Nunito Sans",
    cssStack: '"Nunito Sans", "Gill Sans", Arial, sans-serif',
    description: "Rounded contemporary sans-serif",
    matches: ["nunito sans", "nunito"],
  },
];

export function resolveResumeFont(
  fontId: string | null | undefined
): ResumeFontDefinition {
  const normalized = fontId?.trim().toLowerCase();

  if (!normalized) {
    return RESUME_FONT_PRESETS[0];
  }

  return (
    RESUME_FONT_PRESETS.find(
      (font) =>
        font.id === normalized ||
        font.label.toLowerCase() === normalized ||
        font.matches?.includes(normalized)
    ) ?? RESUME_FONT_PRESETS[0]
  );
}