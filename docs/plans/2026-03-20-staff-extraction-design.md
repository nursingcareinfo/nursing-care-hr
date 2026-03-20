# Staff Data Extraction App - Design

## Overview

A web app to extract staff data from uploaded images (employee forms + CNIC) and add records to the existing Supabase staff database.

**Purpose:** Upload employee form + CNIC photos → AI extracts data → User reviews/edits → Add to staff list

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS with NCare design system (#005e53 teal palette)
- **AI/OCR:** Google Gemini 2.5 Flash via Vercel AI SDK
- **Database:** Supabase (existing staff table)
- **Deployment:** Vercel

## Data Flow

```
User uploads 2 images (form + CNIC)
        ↓
Next.js API route calls Gemini Vision
        ↓
Extract data from both images
        ↓
Merge fields (CNIC validates/form supplements)
        ↓
Display review screen
        ↓
User edits/confirms
        ↓
Upsert to Supabase staff table
        ↓
Redirect to success/confirmation
```

## Fields to Extract

### Employee Form
| Field | Type | Required |
|-------|------|----------|
| full_name | string | Yes |
| father_husband_name | string | No |
| date_of_birth | date | Yes |
| gender | enum | Yes |
| cnic | string (13 digits) | Yes |
| designation | enum | Yes |
| contact_1 | string | Yes |
| contact_2 | string | No |
| district | enum | Yes |
| hourly_rate | number | No |
| hire_date | date | No |

### CNIC (verify/override)
| Field | Maps To |
|-------|---------|
| Name | full_name |
| Father Name | father_husband_name |
| DOB | date_of_birth |
| Gender | gender |
| CNIC Number | cnic |
| Address | district (partial) |

## UI/UX

### Upload Screen
- Drag & drop zone for 2 image slots
- Label each slot: "Employee Form" and "CNIC"
- Click to browse fallback
- Preview thumbnails after upload
- "Extract Data" button (disabled until both uploaded)

### Review Screen
- Card layout with field groups
- Left: Extracted value (read-only with confidence badge)
- Right: Editable input (pre-filled)
- Confidence indicator: 🟢 High / 🟡 Medium / 🔴 Low
- "Add to Staff List" primary button
- "Start Over" secondary button

### Success Screen
- Confirmation message
- "View Staff List" link
- "Add Another" button

## Supabase Schema

Expected existing table `staff`:
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_id TEXT UNIQUE,
  name TEXT,
  father_husband_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  cnic TEXT UNIQUE,
  designation TEXT,
  contact_1 TEXT,
  contact_2 TEXT,
  district TEXT,
  hourly_rate NUMERIC,
  status TEXT DEFAULT 'Active',
  hire_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Design

### POST /api/extract
**Request:**
```json
{
  "formImage": "base64 string",
  "cnicImage": "base64 string"
}
```

**Response:**
```json
{
  "staff": {
    "full_name": "string",
    "father_husband_name": "string",
    "date_of_birth": "YYYY-MM-DD",
    "gender": "Male|Female",
    "cnic": "XXXXX-XXXXXXX-X",
    "designation": "string",
    "contact_1": "string",
    "contact_2": "string",
    "district": "string",
    "hourly_rate": 0,
    "hire_date": "YYYY-MM-DD"
  },
  "confidences": {
    "full_name": "high|medium|low",
    ...
  }
}
```

### POST /api/staff
**Request:** Staff object from review screen
**Response:** `{ "success": true, "assigned_id": "NC-KHI-337" }`

## Deployment

### Vercel Setup
1. Clone/copy frontend structure to new app
2. Connect to GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_AI_API_KEY`
4. Deploy

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GOOGLE_AI_API_KEY=AIza...
```

## Future Enhancements (Out of Scope)
- Batch processing (multiple forms)
- Auto-generate assigned_id
- WhatsApp integration
- Document verification workflow

## Status
- [x] Design complete
- [ ] Implementation planned
- [ ] Built
- [ ] Deployed
