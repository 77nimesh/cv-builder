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
  secondaryText: string;
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
    secondaryText: "#475569",
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
    secondaryText: "#4a6a8a",
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
    secondaryText: "#4a7a5e",
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
    secondaryText: "#7a5a9e",
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
    secondaryText: "#964a5a",
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
    secondaryText: "#3d7a84",
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
    secondaryText: "#6b6766",
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
    secondaryText: "#5a62a0",
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
    secondaryText: "#96613e",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Rich near-black blue",
    primary: "#0d1b3e",
    onPrimary: "#ffffff",
    accentText: "#0d1b3e",
    softBackground: "#f0f2f8",
    softBackgroundStrong: "#d8deef",
    softBorder: "#9aaacf",
    secondaryText: "#445a7a",
  },
  {
    id: "steel",
    label: "Steel",
    description: "Cool blue-grey authority",
    primary: "#2e4057",
    onPrimary: "#ffffff",
    accentText: "#2e4057",
    softBackground: "#f1f4f7",
    softBackgroundStrong: "#dce3eb",
    softBorder: "#a2b4c5",
    secondaryText: "#5a7a90",
  },
  {
    id: "aubergine",
    label: "Aubergine",
    description: "Deep eggplant purple-red",
    primary: "#3b1040",
    onPrimary: "#ffffff",
    accentText: "#3b1040",
    softBackground: "#f6f0f7",
    softBackgroundStrong: "#ead9ed",
    softBorder: "#c09cc5",
    secondaryText: "#7a4a80",
  },
  {
    id: "moss",
    label: "Moss",
    description: "Muted earthy olive green",
    primary: "#3a4a28",
    onPrimary: "#ffffff",
    accentText: "#3a4a28",
    softBackground: "#f4f6f0",
    softBackgroundStrong: "#e0e8d5",
    softBorder: "#a8bb8e",
    secondaryText: "#627a48",
  },
  {
    id: "stone",
    label: "Stone",
    description: "Warm greige neutral",
    primary: "#44403c",
    onPrimary: "#ffffff",
    accentText: "#44403c",
    softBackground: "#f9f8f7",
    softBackgroundStrong: "#eeebe7",
    softBorder: "#c8c2ba",
    secondaryText: "#7a7068",
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