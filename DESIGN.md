# Design System Strategy: NCare HR

## 1. Overview & Creative North Star
**The Creative North Star: "The Empathetic Analyst"**

In the home nursing care sector, HR isn't just about spreadsheets; it's about people. This design system rejects the cold, sterile "hospital-blue" aesthetic of legacy SaaS. Instead, it creates a "High-End Editorial" experience that feels both authoritative and deeply human.

We break the "standard dashboard" mold by moving away from rigid, boxed-in grids. By using **intentional asymmetry**, **tonal layering**, and **expansive breathing room**, we create a UI that feels more like a premium medical journal than a database.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

### Primary Colors (Teal Healthcare)
- **Primary:** `#005e53` (Deep Teal)
- **Primary Container:** `#00796b` (Medium Teal)
- **On Primary:** `#ffffff` (White text on primary)
- **Primary Fixed:** `#97f3e2` (Light Teal accent)
- **Primary Fixed Dim:** `#7ad7c6` (Subtle teal highlight)

### Secondary Colors (Professional Blue)
- **Secondary:** `#005db7` (Deep Blue)
- **Secondary Container:** `#64a1ff` (Medium Blue)
- **On Secondary:** `#ffffff`

### Neutral/Surface Colors
- **Background:** `#f8fafb` (Off-white canvas)
- **Surface:** `#f8fafb`
- **Surface Container Low:** `#f2f4f5` (Card backgrounds)
- **Surface Container:** `#eceeef` (Section backgrounds)
- **Surface Container High:** `#e6e8e9`
- **Surface Container Highest:** `#e1e3e4` (Input fields)
- **Surface Container Lowest:** `#ffffff` (Elevated cards - USE THIS FOR CARDS)

### Text Colors
- **On Surface:** `#191c1d` (Primary text)
- **On Surface Variant:** `#3e4946` (Secondary text)
- **Outline:** `#6e7a76` (Borders)
- **Outline Variant:** `#bdc9c5` (Subtle dividers at 15% opacity)

### Status Colors
- **Error:** `#ba1a1a`
- **Error Container:** `#ffdad6`
- **Tertiary:** `#005e58` (Accent)

---

## 3. Typography

### Font Families
- **Display/Headlines:** Manrope (Google Fonts)
- **Body/Labels:** Inter (Google Fonts)

### Scale
- Display: Manrope, large numerical hero stats
- Headlines: Manrope, section headers
- Body: Inter, all functional data
- Labels: Inter, secondary information

---

## 4. Elevation & Depth: Tonal Layering

### The "No-Line" Rule
**STRICT:** No 1px solid borders to define sections.
Structure achieved through **Background Color Shifts** only.

### Card Styling (CRITICAL)
```css
/* WRONG - Old style */
.card {
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* CORRECT - NCare style */
.card {
  background: #ffffff; /* surface-container-lowest */
  /* NO border - use tonal shift instead */
  box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04); /* 4% opacity ambient shadow */
}
```

### Layer Hierarchy
1. **Base Layer:** `surface` (#f8fafb) - The canvas
2. **Secondary Sections:** `surface-container-low` (#f2f4f5) - Grouping areas
3. **Elevated Cards:** `surface-container-lowest` (#ffffff) - Cards that "pop"

---

## 5. Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #005e53;
  color: #ffffff;
  border-radius: 1.5rem; /* xl roundness */
}

/* Secondary Button */
.btn-secondary {
  background: #a9c7ff; /* secondary_fixed_dim */
  color: #001b3d; /* on-secondary-fixed */
  border-radius: 1.5rem;
}
```

### Input Fields
```css
/* Default State */
.input {
  background: #e1e3e4; /* surface-container-highest */
  border: none; /* or sm (0.25rem) rounded */
}

/* Focused State */
.input:focus {
  background: #ffffff;
  border-bottom: 2px solid #005e53; /* Underlined style */
}
```

### Status Chips
```css
/* On Shift */
.chip-on-shift {
  background: #64a1ff; /* secondary_container */
  border-radius: 9999px; /* Pill shape */
}

/* Offline */
.chip-offline {
  background: #e1e3e4; /* surface_variant */
  border-radius: 9999px;
}
```

### Data Lists
**NO divider lines between items.** Use vertical white space:
- 1rem (4) or 1.5rem (6) spacing tokens
- Alternate backgrounds between `surface` and `surface-container-low`

---

## 6. Healthcare-Specific Components

### Availability Heatmap
Use monochromatic teal scale (`primary_fixed` to `primary`).
**AVOID:** Traffic light colors (red/green) for status - causes anxiety.

### Hero Stats
Use `display-sm` Manrope for large numbers like "98% Compliance".

---

## 7. Do's and Don'ts

### ✅ DO
- Use `#191c1d` (on-surface), NOT `#000000` for text
- Use `xl` (1.5rem) roundedness for large containers
- Use `md` (0.75rem) for smaller buttons
- Embrace asymmetric white space
- Use `primary_fixed_dim` for icon "glow" backgrounds

### ❌ DON'T
- Use hard divider lines - use 12px gaps instead
- Use standard 8px corners everywhere
- Use traffic light colors except for critical errors

---

## 8. CSS Variables for Implementation

```css
:root {
  /* Primary */
  --color-primary: #005e53;
  --color-primary-container: #00796b;
  --color-on-primary: #ffffff;
  --color-primary-fixed: #97f3e2;
  --color-primary-fixed-dim: #7ad7c6;
  
  /* Secondary */
  --color-secondary: #005db7;
  --color-secondary-container: #64a1ff;
  --color-on-secondary: #ffffff;
  
  /* Surfaces */
  --color-background: #f8fafb;
  --color-surface: #f8fafb;
  --color-surface-container-low: #f2f4f5;
  --color-surface-container: #eceeef;
  --color-surface-container-high: #e6e8e9;
  --color-surface-container-highest: #e1e3e4;
  --color-surface-container-lowest: #ffffff;
  
  /* Text */
  --color-on-surface: #191c1d;
  --color-on-surface-variant: #3e4946;
  
  /* Outlines */
  --color-outline: #6e7a76;
  --color-outline-variant: #bdc9c5;
  
  /* Status */
  --color-error: #ba1a1a;
  --color-tertiary: #005e58;
  
  /* Typography */
  --font-display: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-ambient: 0 12px 32px rgba(25, 28, 29, 0.04);
}
```

---

## 9. Figma/OpenCode Color Mapping

| NCare Token | Hex | Usage |
|-------------|-----|-------|
| primary | #005e53 | Main CTAs, headers |
| primary-container | #00796b | Secondary CTAs, tags |
| surface-container-lowest | #ffffff | All cards, elevated elements |
| surface-container-low | #f2f4f5 | Section backgrounds |
| background | #f8fafb | Page canvas |
| on-surface | #191c1d | Primary text |
| on-surface-variant | #3e4946 | Secondary text, labels |
| secondary-container | #64a1ff | "On Shift" status |
| surface-variant | #e1e3e4 | "Offline" status |
