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
    id: "navy",
    label: "Navy",
    description: "Deep corporate blue",
    primary: "#1e3a5f",
    onPrimary: "#ffffff",
    accentText: "#1e3a5f",
    softBackground: "#f0f4f8",
    softBackgroundStrong: "#dde8f0",
    softBorder: "#a8c3d9",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Refined deep green",
    primary: "#1c3d2e",
    onPrimary: "#ffffff",
    accentText: "#1c3d2e",
    softBackground: "#f0f7f2",
    softBackgroundStrong: "#d8ede0",
    softBorder: "#9dc8b0",
  },
  {
    id: "plum",
    label: "Plum",
    description: "Sophisticated deep violet",
    primary: "#3d1a6e",
    onPrimary: "#ffffff",
    accentText: "#3d1a6e",
    softBackground: "#f4f0f9",
    softBackgroundStrong: "#e5d9f5",
    softBorder: "#b89ed9",
  },
  {
    id: "burgundy",
    label: "Burgundy",
    description: "Elegant warm red",
    primary: "#6b1a2a",
    onPrimary: "#ffffff",
    accentText: "#6b1a2a",
    softBackground: "#fdf0f2",
    softBackgroundStrong: "#f5d9de",
    softBorder: "#d49aa5",
  },
  {
    id: "teal",
    label: "Teal",
    description: "Modern muted teal",
    primary: "#0d4a52",
    onPrimary: "#ffffff",
    accentText: "#0d4a52",
    softBackground: "#f0f8f9",
    softBackgroundStrong: "#d5ecef",
    softBorder: "#8cc8cf",
  },
  {
    id: "charcoal",
    label: "Charcoal",
    description: "Warm dark neutral",
    primary: "#2c2c2c",
    onPrimary: "#ffffff",
    accentText: "#2c2c2c",
    softBackground: "#f7f6f5",
    softBackgroundStrong: "#eeece9",
    softBorder: "#c4bfb8",
  },
  {
    id: "indigo",
    label: "Indigo",
    description: "Deep blue-purple authority",
    primary: "#232970",
    onPrimary: "#ffffff",
    accentText: "#232970",
    softBackground: "#f1f2fb",
    softBackgroundStrong: "#dcdff5",
    softBorder: "#9fa8df",
  },
  {
    id: "copper",
    label: "Copper",
    description: "Warm metallic executive",
    primary: "#6b3a1f",
    onPrimary: "#ffffff",
    accentText: "#6b3a1f",
    softBackground: "#fdf5f0",
    softBackgroundStrong: "#f5e2d5",
    softBorder: "#d4a88a",
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