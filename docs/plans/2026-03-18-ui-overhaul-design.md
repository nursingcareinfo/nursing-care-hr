# UI Overhaul Design - HR Manager Home Nursing Care

**Date:** 2026-03-18
**Status:** Approved

---

## Overview

Improve UI consistency across all pages with shared components and dark mode support.

## Goals

1. Create reusable UI component library
2. Implement dark mode with manual toggle
3. Add minimal animations (loading states only)
4. Consistent styling across all pages

---

## Component Library

### Location
`src/components/ui/`

### Components to Create

| Component | Purpose | Variants |
|-----------|---------|----------|
| Button | Primary actions | primary, secondary, ghost, danger |
| Card | Content containers | default, with header, with footer |
| Input | Form fields | default, with icon, error state |
| Table | Data display | default, striped, sortable |
| Modal | Dialogs | default, sizes (sm, md, lg) |
| Badge | Status indicators | success, warning, error, info |
| Toggle | Dark mode switch | - |
| Spinner | Loading state | sm, md, lg |

---

## Dark Mode Implementation

### Approach
- Toggle button in header (sun/moon icons)
- Store preference in `localStorage`
- Apply `dark` class to `<html>` element
- Use Tailwind `dark:` variants

### Color Palette (Dark Mode)
- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Text: `#f8fafc` (slate-50)
- Border: `#334155` (slate-700)

---

## Animation (Minimal)

Only add animations for:
1. Loading spinner
2. Modal fade in/out

No other animations.

---

## Layout Changes

1. Move Sidebar to `layout.tsx` for consistency
2. Add header with dark mode toggle
3. Consistent page container wrapper

---

## Implementation Order

1. Create UI components
2. Add dark mode to globals.css
3. Update layout.tsx with Sidebar + Header
4. Update page.tsx (Dashboard) with new components
5. Update remaining pages with consistent styling

---

## Acceptance Criteria

- [ ] All pages have consistent styling
- [ ] Dark mode toggle works
- [ ] Dark mode preference persists
- [ ] Loading states show spinner
- [ ] Modals have fade animation
- [ ] No layout shifts during loading
