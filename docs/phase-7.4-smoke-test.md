# Phase 7.4 Smoke Test Checklist

Use this checklist after applying the Phase 7.4 fixes.

## Save and edit flow
- Open an existing resume in `/resumes/[id]/edit`.
- Change headline/subtitle, photo shape, and one experience item.
- Save.
- Refresh the page.
- Confirm the changes persist exactly.

## Preview drag/drop persistence
- Open `/resumes/[id]/preview`.
- Reorder two sections.
- Reorder two items inside Experience.
- Wait for `Layout saved.`
- Refresh the preview page.
- Confirm these values are unchanged after reorder:
  - `photoPath`
  - `photoShape`
  - headline/subtitle
  - template
  - theme color
  - font family

## Print consistency
- Open `/resumes/[id]/print`.
- Compare with preview for the same resume.
- Confirm section order, item order, headline, and photo shape match preview.

## PDF consistency
- Download from `/api/resumes/[id]/pdf`.
- Confirm the PDF matches preview/print for:
  - section order
  - item order
  - photo visibility
  - photo shape
  - headline/subtitle
  - no raw KaTeX / HTML artifacts

## Duplicate-key and ID stability spot checks
- Add or keep at least one custom section.
- Reorder custom and built-in sections in preview.
- Confirm no duplicate key warning appears in the browser console.
- Confirm drag/drop still targets the correct section after refresh.

## Pass criteria
- No data regression after preview reorder
- No broken section/item drag targets
- No raw HTML / KaTeX text in preview, print, or PDF
- PDF output is visually aligned with preview for the same resume
