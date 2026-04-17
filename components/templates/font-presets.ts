export const DEFAULT_RESUME_FONT_ID = "inter";

export type ResumeFontDefinition = {
  id: string;
  label: string;
  cssStack: string;
  description: string;
  sampleText: string;
  matches?: string[];
};

export const RESUME_FONT_PRESETS: ResumeFontDefinition[] = [
  {
    id: "inter",
    label: "Inter",
    cssStack:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    description: "Modern clean sans-serif",
    sampleText: "Aa Modern clean resume type",
    matches: ["inter"],
  },
  {
    id: "arial",
    label: "Arial",
    cssStack: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    description: "Familiar neutral sans-serif",
    sampleText: "Aa Familiar neutral resume type",
    matches: ["arial"],
  },
  {
    id: "helvetica",
    label: "Helvetica",
    cssStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    description: "Classic editorial sans-serif",
    sampleText: "Aa Classic editorial resume type",
    matches: ["helvetica", "helvetica neue"],
  },
  {
    id: "georgia",
    label: "Georgia",
    cssStack: 'Georgia, "Times New Roman", Times, serif',
    description: "Readable traditional serif",
    sampleText: "Aa Readable traditional resume type",
    matches: ["georgia"],
  },
  {
    id: "times-new-roman",
    label: "Times New Roman",
    cssStack: '"Times New Roman", Times, serif',
    description: "Formal traditional serif",
    sampleText: "Aa Formal traditional resume type",
    matches: ["times new roman", "times-new-roman", "times"],
  },
  {
    id: "garamond",
    label: "Garamond",
    cssStack: '"EB Garamond", Garamond, "Times New Roman", serif',
    description: "Elegant classical serif",
    sampleText: "Aa Elegant classical resume type",
    matches: ["garamond", "eb garamond"],
  },
  {
    id: "palatino",
    label: "Palatino",
    cssStack: '"Palatino Linotype", Palatino, "Book Antiqua", serif',
    description: "Refined literary serif",
    sampleText: "Aa Refined literary resume type",
    matches: ["palatino", "palatino linotype"],
  },
  {
    id: "cambria",
    label: "Cambria",
    cssStack: 'Cambria, "Times New Roman", serif',
    description: "Polished Microsoft serif",
    sampleText: "Aa Polished Microsoft resume type",
    matches: ["cambria"],
  },
  {
    id: "calibri",
    label: "Calibri",
    cssStack: 'Calibri, "Gill Sans", "Trebuchet MS", sans-serif',
    description: "Approachable modern sans-serif",
    sampleText: "Aa Approachable modern resume type",
    matches: ["calibri"],
  },
  {
    id: "gill-sans",
    label: "Gill Sans",
    cssStack: '"Gill Sans", "Gill Sans MT", "Trebuchet MS", sans-serif',
    description: "Humanist British sans-serif",
    sampleText: "Aa Humanist British resume type",
    matches: ["gill sans", "gill sans mt"],
  },
  {
    id: "lato",
    label: "Lato",
    cssStack: 'Lato, "Helvetica Neue", Arial, sans-serif',
    description: "Friendly professional sans-serif",
    sampleText: "Aa Friendly professional resume type",
    matches: ["lato"],
  },
  {
    id: "source-sans",
    label: "Source Sans",
    cssStack: '"Source Sans 3", "Source Sans Pro", Arial, sans-serif',
    description: "Crisp Adobe sans-serif",
    sampleText: "Aa Crisp Adobe resume type",
    matches: ["source sans", "source sans pro", "source sans 3"],
  },
  {
    id: "merriweather",
    label: "Merriweather",
    cssStack: 'Merriweather, Georgia, serif',
    description: "Sturdy readable serif",
    sampleText: "Aa Sturdy readable resume type",
    matches: ["merriweather"],
  },
  {
    id: "libre-baskerville",
    label: "Libre Baskerville",
    cssStack: '"Libre Baskerville", Baskerville, Georgia, serif',
    description: "Sharp academic serif",
    sampleText: "Aa Sharp academic resume type",
    matches: ["libre baskerville", "baskerville"],
  },
  {
    id: "nunito-sans",
    label: "Nunito Sans",
    cssStack: '"Nunito Sans", "Gill Sans", Arial, sans-serif',
    description: "Rounded contemporary sans-serif",
    sampleText: "Aa Rounded contemporary resume type",
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