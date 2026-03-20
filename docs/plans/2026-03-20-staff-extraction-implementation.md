# Staff Data Extraction App - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js web app that extracts staff data from uploaded employee form + CNIC images using AI, allows user review/editing, and saves to Supabase.

**Architecture:** Standalone Next.js app with Vercel deployment. Uses Google Gemini Vision API for OCR and data extraction. Supabase client for database operations.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS (NCare design), Google Gemini, Vercel AI SDK, Supabase

---

## Project Setup

### Task 1: Create New Next.js Project

**Files:**
- Create: `/staff-extractor/` (new directory)

**Step 1: Create Next.js app**

```bash
cd /home/archbtw/dev
npx create-next-app@latest staff-extractor \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*" \
  --use-npm --no-git
```

**Step 2: Install dependencies**

```bash
cd staff-extractor
npm install @ai-sdk/google @supabase/supabase-js ai
npm install -D @types/node
```

---

## Configuration

### Task 2: Environment Setup

**Files:**
- Create: `staff-extractor/.env.local`
- Create: `staff-extractor/.env.example`

**Step 1: Create .env.example**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_AI_API_KEY=your-gemini-api-key
```

**Step 2: Create .env.local** (user will fill in actual values)

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
GOOGLE_AI_API_KEY=placeholder-key
```

---

## Core Components

### Task 3: Create Upload Component

**Files:**
- Create: `staff-extractor/src/components/ImageUploader.tsx`

**Step 1: Write the component**

```tsx
'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  label: string
  onImageSelect: (image: string) => void
  currentImage?: string
}

export function ImageUploader({ label, onImageSelect, currentImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => onImageSelect(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => onImageSelect(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  if (currentImage) {
    return (
      <div className="relative">
        <img src={currentImage} alt={label} className="w-full h-48 object-cover rounded-xl" />
        <button
          onClick={() => onImageSelect('')}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
      }`}
    >
      <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id={label} />
      <label htmlFor={label} className="cursor-pointer">
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
      </label>
    </div>
  )
}
```

**Step 2: Export from components index**

Add to `staff-extractor/src/components/index.ts`:
```tsx
export { ImageUploader } from './ImageUploader'
```

---

### Task 4: Create Review Component

**Files:**
- Create: `staff-extractor/src/components/DataReview.tsx`

**Step 1: Write the component**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface StaffData {
  full_name: string
  father_husband_name: string
  date_of_birth: string
  gender: string
  cnic: string
  designation: string
  contact_1: string
  contact_2: string
  district: string
  hourly_rate: string
  hire_date: string
}

interface DataReviewProps {
  data: StaffData
  confidences: Record<string, string>
  onConfirm: (data: StaffData) => void
  onCancel: () => void
  isSubmitting: boolean
}

const designations = ['R/N', 'BSN', 'NURSE_ASSISTANT', 'ATTENDANT', 'MID_WIFE', 'PHYSIOTHERAPIST', 'DOCTOR']
const districts = ['Korangi', 'Gulshan', 'Karachi South', 'Nazimabad', 'Malir', 'Keamari']

export function DataReview({ data, confidences, onConfirm, onCancel, isSubmitting }: DataReviewProps) {
  const [formData, setFormData] = useState(data)

  const updateField = (field: keyof StaffData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const fields = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'father_husband_name', label: 'Father/Husband Name' },
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { key: 'cnic', label: 'CNIC' },
    { key: 'designation', label: 'Designation', type: 'select', options: designations },
    { key: 'contact_1', label: 'Contact 1' },
    { key: 'contact_2', label: 'Contact 2' },
    { key: 'district', label: 'District', type: 'select', options: districts },
    { key: 'hourly_rate', label: 'Hourly Rate (PKR)', type: 'number' },
    { key: 'hire_date', label: 'Hire Date', type: 'date' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
        <h2 className="text-lg font-bold text-on-surface mb-6">Review Extracted Data</h2>
        
        <div className="grid gap-4">
          {fields.map(field => (
            <div key={field.key} className="grid grid-cols-2 gap-4 items-start">
              <div>
                <label className="text-sm font-medium text-on-surface-variant">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="text-sm mt-1">
                  {confidences[field.key] && (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${getConfidenceColor(confidences[field.key])}`}>
                      {confidences[field.key]}
                    </span>
                  )}
                </div>
              </div>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key as keyof StaffData]}
                  onChange={(e) => updateField(field.key as keyof StaffData, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key as keyof StaffData]}
                  onChange={(e) => updateField(field.key as keyof StaffData, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting} className="flex-1">
            Start Over
          </Button>
          <Button onClick={() => onConfirm(formData)} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Adding...' : 'Add to Staff List'}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 5: Create API Route for Extraction

**Files:**
- Create: `staff-extractor/src/app/api/extract/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'

interface StaffData {
  full_name: string
  father_husband_name: string
  date_of_birth: string
  gender: string
  cnic: string
  designation: string
  contact_1: string
  contact_2: string
  district: string
  hourly_rate: string
  hire_date: string
}

export async function POST(req: NextRequest) {
  try {
    const { formImage, cnicImage } = await req.json()

    if (!formImage || !cnicImage) {
      return NextResponse.json({ error: 'Both images required' }, { status: 400 })
    }

    const model = google('gemini-2.0-flash')

    const prompt = `You are a data extraction specialist. Extract staff information from these two images:
1. Employee Form
2. CNIC (National Identity Card)

Return ONLY a JSON object with this exact structure:
{
  "staff": {
    "full_name": "extracted name",
    "father_husband_name": "extracted father/husband name",
    "date_of_birth": "YYYY-MM-DD format",
    "gender": "Male or Female",
    "cnic": "XXXXX-XXXXXXX-X format",
    "designation": "One of: R/N, BSN, NURSE_ASSISTANT, ATTENDANT, MID_WIFE, PHYSIOTHERAPIST, DOCTOR",
    "contact_1": "phone number",
    "contact_2": "second phone if available",
    "district": "One of: Korangi, Gulshan, Karachi South, Nazimabad, Malir, Keamari",
    "hourly_rate": "number or empty",
    "hire_date": "YYYY-MM-DD format or empty"
  },
  "confidences": {
    "full_name": "high/medium/low",
    "father_husband_name": "high/medium/low",
    ...
  }
}

Use the CNIC to verify/override name, DOB, gender, and CNIC number from the form.`

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: formImage.split(',')[1] } },
      { inlineData: { mimeType: 'image/jpeg', data: cnicImage.split(',')[1] } }
    ])

    const response = result.response.text()
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse extraction result' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
```

---

### Task 6: Create API Route for Saving Staff

**Files:**
- Create: `staff-extractor/src/app/api/staff/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const staffData = await req.json()

    const { data, error } = await supabase
      .from('staff')
      .insert([{
        ...staffData,
        status: 'Active'
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save staff' }, { status: 500 })
  }
}
```

---

### Task 7: Create Main Page

**Files:**
- Create: `staff-extractor/src/app/page.tsx`

**Step 1: Write the main page**

```tsx
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { DataReview } from '@/components/DataReview'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface StaffData {
  full_name: string
  father_husband_name: string
  date_of_birth: string
  gender: string
  cnic: string
  designation: string
  contact_1: string
  contact_2: string
  district: string
  hourly_rate: string
  hire_date: string
}

type Step = 'upload' | 'review' | 'success'

export default function Home() {
  const [step, setStep] = useState<Step>('upload')
  const [formImage, setFormImage] = useState('')
  const [cnicImage, setCnicImage] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<StaffData | null>(null)
  const [confidences, setConfidences] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canExtract = formImage && cnicImage

  const handleExtract = async () => {
    setIsExtracting(true)
    setError('')

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formImage, cnicImage })
      })

      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        return
      }

      setExtractedData(data.staff)
      setConfidences(data.confidences)
      setStep('review')
    } catch (err) {
      setError('Failed to extract data. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleConfirm = async (data: StaffData) => {
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }

      setStep('success')
    } catch (err) {
      setError('Failed to save staff. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartOver = () => {
    setStep('upload')
    setFormImage('')
    setCnicImage('')
    setExtractedData(null)
    setConfidences({})
    setError('')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-on-surface font-display mb-2">
          Staff Data Extraction
        </h1>
        <p className="text-on-surface-variant mb-8">
          Upload employee form and CNIC images to extract and add staff records
        </p>

        {error && (
          <div className="bg-error-container text-error-on-container p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <ImageUploader
                label="Employee Form"
                onImageSelect={setFormImage}
                currentImage={formImage}
              />
              <ImageUploader
                label="CNIC"
                onImageSelect={setCnicImage}
                currentImage={cnicImage}
              />
            </div>

            <Button
              onClick={handleExtract}
              disabled={!canExtract || isExtracting}
              className="w-full"
            >
              {isExtracting ? 'Extracting Data...' : 'Extract Data'}
            </Button>
          </div>
        )}

        {step === 'review' && extractedData && (
          <DataReview
            data={extractedData}
            confidences={confidences}
            onConfirm={handleConfirm}
            onCancel={handleStartOver}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'success' && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-on-surface mb-2">Staff Added Successfully!</h2>
            <p className="text-on-surface-variant mb-8">
              The staff member has been added to your database.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" onClick={handleStartOver}>
                Add Another
              </Button>
              <Button onClick={() => window.open('https://your-hr-app.vercel.app/staff', '_blank')}>
                View Staff List
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
```

---

### Task 8: Copy UI Components

**Files:**
- Copy from: `HR_manager_home_nursing_care/frontend/src/components/ui/Button.tsx`
- Copy from: `HR_manager_home_nursing_care/frontend/tailwind.config.js`
- Create: `staff-extractor/src/components/ui/Button.tsx`
- Create: `staff-extractor/src/components/ui/index.ts`
- Create: `staff-extractor/tailwind.config.js`
- Create: `staff-extractor/src/lib/utils.ts`

**Step 1: Copy Button component**

Copy the Button, Badge, Card, Input components from the HR app.

**Step 2: Copy tailwind.config.js**

Copy the NCare color palette from the HR app's tailwind.config.js.

**Step 3: Copy utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 4: Install clsx and tailwind-merge**

```bash
npm install clsx tailwind-merge
```

---

## Testing & Deployment

### Task 9: Local Testing

**Step 1: Run dev server**

```bash
cd staff-extractor
npm run dev
```

**Step 2: Test upload flow**

1. Open http://localhost:3000
2. Upload two test images
3. Click "Extract Data"
4. Verify extraction results
5. Edit and confirm

**Step 3: Test Supabase connection**

Verify data appears in Supabase dashboard.

---

### Task 10: Deploy to Vercel

**Step 1: Push to GitHub**

```bash
cd staff-extractor
git init
git add .
git commit -m "Initial commit: Staff extraction app"
gh repo create staff-extractor --public --push
```

**Step 2: Deploy on Vercel**

1. Go to vercel.com/new
2. Import the GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_AI_API_KEY`
4. Deploy

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create Next.js project |
| 2 | Environment setup |
| 3 | ImageUploader component |
| 4 | DataReview component |
| 5 | /api/extract route |
| 6 | /api/staff route |
| 7 | Main page |
| 8 | Copy UI components |
| 9 | Local testing |
| 10 | Deploy to Vercel |
