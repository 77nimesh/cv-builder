"use client";

import { useEffect, useRef, useState } from "react";
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

function ThemePreviewSwatches({
  primary,
  softBackground,
  softBorder,
}: {
  primary: string;
  softBackground: string;
  softBorder: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      <span
        className="h-4 w-4 rounded-full border border-black/10"
        style={{ backgroundColor: primary }}
      />
      <span
        className="h-4 w-4 rounded-full border"
        style={{ backgroundColor: softBackground, borderColor: softBorder }}
      />
      <span
        className="h-4 w-4 rounded-full border"
        style={{ backgroundColor: "#ffffff", borderColor: softBorder }}
      />
    </span>
  );
}

type ThemeColorDropdownProps = {
  value: string;
  onChange: (nextThemeId: string) => void;
};

export function ThemeColorDropdown({
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
          <ThemePreviewSwatches
            primary={activeTheme.primary}
            softBackground={activeTheme.softBackgroundStrong}
            softBorder={activeTheme.softBorder}
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
                <ThemePreviewSwatches
                  primary={themeOption.primary}
                  softBackground={themeOption.softBackgroundStrong}
                  softBorder={themeOption.softBorder}
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

type FontFamilyDropdownProps = {
  value: string;
  onChange: (nextFontId: string) => void;
};

export function FontFamilyDropdown({
  value,
  onChange,
}: FontFamilyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeFont = resolveResumeFont(value || DEFAULT_RESUME_FONT_ID);

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
        <span className="min-w-0">
          <span
            className="block truncate text-sm font-medium text-slate-900"
            style={{ fontFamily: activeFont.cssStack }}
          >
            {activeFont.label}
          </span>
          <span
            className="block truncate text-xs text-slate-500"
            style={{ fontFamily: activeFont.cssStack }}
          >
            {activeFont.sampleText}
          </span>
        </span>

        <span className="ml-3 text-xs text-slate-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen ? (
        <div
          className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl"
          role="listbox"
          aria-label="Font Family"
        >
          <div
            className="max-h-56 overflow-y-scroll overscroll-contain rounded-2xl p-2"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {RESUME_FONT_PRESETS.map((fontOption) => {
              const isActive = fontOption.id === activeFont.id;

              return (
                <button
                  key={fontOption.id}
                  type="button"
                  onClick={() => {
                    onChange(fontOption.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full flex-col items-start rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-slate-100 ring-1 ring-slate-300"
                      : "hover:bg-slate-50"
                  }`}
                  role="option"
                  aria-selected={isActive}
                  style={{ fontFamily: fontOption.cssStack }}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {fontOption.label}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    {fontOption.sampleText}
                  </span>
                  <span className="mt-1 text-[11px] text-slate-400">
                    {fontOption.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
