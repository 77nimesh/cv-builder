export const DEFAULT_RESUME_THEME_ID = "slate";

export type ResumeThemeDefinition = {
  id: string;
  label: string;
  description: string;
  primary: string;
  onPrimary: string;
  accentText: string;
  softBackground: string;
  softBackgroundStrong: string;
  softBorder: string;
};

export const RESUME_THEME_PRESETS: ResumeThemeDefinition[] = [
  {
    id: "slate",
    label: "Slate",
    description: "Clean neutral default",
    primary: "#0f172a",
    onPrimary: "#ffffff",
    accentText: "#334155",
    softBackground: "#f8fafc",
    softBackgroundStrong: "#f1f5f9",
    softBorder: "#cbd5e1",
  },
  {
    id: "blue",
    label: "Blue",
    description: "Classic professional accent",
    primary: "#1d4ed8",
    onPrimary: "#ffffff",
    accentText: "#1d4ed8",
    softBackground: "#eff6ff",
    softBackgroundStrong: "#dbeafe",
    softBorder: "#93c5fd",
  },
  {
    id: "emerald",
    label: "Emerald",
    description: "Fresh modern accent",
    primary: "#047857",
    onPrimary: "#ffffff",
    accentText: "#047857",
    softBackground: "#ecfdf5",
    softBackgroundStrong: "#d1fae5",
    softBorder: "#6ee7b7",
  },
  {
    id: "violet",
    label: "Violet",
    description: "Bold creative accent",
    primary: "#6d28d9",
    onPrimary: "#ffffff",
    accentText: "#6d28d9",
    softBackground: "#f5f3ff",
    softBackgroundStrong: "#ede9fe",
    softBorder: "#c4b5fd",
  },
  {
    id: "rose",
    label: "Rose",
    description: "Warm standout accent",
    primary: "#be123c",
    onPrimary: "#ffffff",
    accentText: "#be123c",
    softBackground: "#fff1f2",
    softBackgroundStrong: "#ffe4e6",
    softBorder: "#fda4af",
  },
  {
    id: "amber",
    label: "Amber",
    description: "Warm executive accent",
    primary: "#92400e",
    onPrimary: "#ffffff",
    accentText: "#92400e",
    softBackground: "#fffbeb",
    softBackgroundStrong: "#fef3c7",
    softBorder: "#fcd34d",
  },
];

export function resolveResumeTheme(
  themeId: string | null | undefined
): ResumeThemeDefinition {
  return (
    RESUME_THEME_PRESETS.find((theme) => theme.id === themeId) ??
    RESUME_THEME_PRESETS[0]
  );
}