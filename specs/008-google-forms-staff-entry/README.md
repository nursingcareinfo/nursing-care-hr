---
status: in-progress
created: 2026-03-01
priority: high
tags:
- google-forms
- google-sheets
- simple
created_at: 2026-03-01T07:14:52.808405503Z
updated_at: 2026-03-01T07:14:52.808405503Z
---

# Simple Google Forms Staff Entry

## Overview

Simple staff data entry via Google Forms. No complex web UI - just forms feeding into Sheets with automatic ID generation.

## Why This Approach

- **Google Forms**: Easy data entry (mobile-friendly)
- **Google Sheets**: Data storage with formulas
- **Apps Script**: Auto-ID generation on form submit
- **Supabase**: Already has 283 staff - sync from there

## Plan

- [ ] 1. Create Google Form for staff entry
- [ ] 2. Link form to Sheet
- [ ] 3. Add Apps Script trigger for auto-ID
- [ ] 4. Sync existing 283 staff to Sheet
- [ ] 5. Optional: Connect to Supabase

## Step 1: Create Google Form

Fields needed:
- Name (text, required)
- Father/Husband Name (text)
- Date of Birth (date)
- Gender (dropdown: Male/Female)
- CNIC (text, format: XXXXX-XXXXXXX-X)
- Designation (dropdown)
- Contact 1 (text, required)
- Contact 2 (text)
- District (text)
- Status (dropdown: Active/Inactive/On Leave)
- Hire Date (date)
- Notes (paragraph)

## Step 2: Apps Script Auto-ID

On form submit → add NC-KHI-XXX ID automatically.

## Step 3: Import Existing Staff

Copy 283 staff from Supabase to Sheet.

## Test

- [ ] Form submits → creates new row with auto-ID
- [ ] Mobile form works for field staff
