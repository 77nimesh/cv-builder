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
      'var(--font-resume-inter), "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    description: "Modern clean sans-serif",
    sampleText: "Aa Modern clean resume type",
    matches: ["inter", "arial", "helvetica"],
  },
  {
    id: "lato",
    label: "Lato",
    cssStack:
      'var(--font-resume-lato), "Lato", ui-sans-serif, system-ui, Arial, sans-serif',
    description: "Friendly professional sans-serif",
    sampleText: "Aa Friendly professional resume type",
    matches: ["lato", "calibri"],
  },
  {
    id: "source-sans",
    label: "Source Sans",
    cssStack:
      'var(--font-resume-source-sans), "Source Sans 3", "Source Sans Pro", ui-sans-serif, Arial, sans-serif',
    description: "Crisp modern sans-serif",
    sampleText: "Aa Crisp modern resume type",
    matches: [
      "source-sans",
      "source sans",
      "source sans 3",
      "source sans pro",
      "gill-sans",
      "gill sans",
      "gill sans mt",
    ],
  },
  {
    id: "nunito-sans",
    label: "Nunito Sans",
    cssStack:
      'var(--font-resume-nunito-sans), "Nunito Sans", ui-sans-serif, Arial, sans-serif',
    description: "Rounded contemporary sans-serif",
    sampleText: "Aa Rounded contemporary resume type",
    matches: ["nunito-sans", "nunito sans", "nunito"],
  },
  {
    id: "merriweather",
    label: "Merriweather",
    cssStack:
      'var(--font-resume-merriweather), "Merriweather", Georgia, "Times New Roman", serif',
    description: "Readable professional serif",
    sampleText: "Aa Readable professional resume type",
    matches: ["merriweather", "georgia", "cambria"],
  },
  {
    id: "libre-baskerville",
    label: "Libre Baskerville",
    cssStack:
      'var(--font-resume-libre-baskerville), "Libre Baskerville", Baskerville, Georgia, serif',
    description: "Sharp classic serif",
    sampleText: "Aa Sharp classic resume type",
    matches: [
      "libre-baskerville",
      "libre baskerville",
      "times-new-roman",
      "times new roman",
      "times",
      "palatino",
      "palatino linotype",
    ],
  },
  {
    id: "garamond",
    label: "Garamond",
    cssStack:
      'var(--font-resume-eb-garamond), "EB Garamond", Garamond, "Times New Roman", serif',
    description: "Elegant editorial serif",
    sampleText: "Aa Elegant editorial resume type",
    matches: ["garamond", "eb garamond"],
  },
];

const LEGACY_FONT_ALIASES: Record<string, string> = {
  arial: "inter",
  helvetica: "inter",
  calibri: "lato",
  "gill-sans": "source-sans",
  "gill sans": "source-sans",
  "gill sans mt": "source-sans",
  georgia: "merriweather",
  cambria: "merriweather",
  "times-new-roman": "libre-baskerville",
  "times new roman": "libre-baskerville",
  times: "libre-baskerville",
  palatino: "libre-baskerville",
  "palatino linotype": "libre-baskerville",
  "libre baskerville": "libre-baskerville",
  "source sans": "source-sans",
  "source sans pro": "source-sans",
  "source sans 3": "source-sans",
  nunito: "nunito-sans",
  "eb garamond": "garamond",
};

export function resolveResumeFont(
  fontId: string | null | undefined
): ResumeFontDefinition {
  const normalized = fontId?.trim().toLowerCase();

  if (!normalized) {
    return RESUME_FONT_PRESETS[0];
  }

  const canonical = LEGACY_FONT_ALIASES[normalized] ?? normalized;

  return (
    RESUME_FONT_PRESETS.find(
      (font) =>
        font.id === canonical ||
        font.label.toLowerCase() === canonical ||
        font.matches?.includes(canonical)
    ) ?? RESUME_FONT_PRESETS[0]
  );
}