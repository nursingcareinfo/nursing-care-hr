# NursingCare.pk HR System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete HR management system for NursingCare.pk with 286+ staff, patient management, scheduling, payroll, compliance alerts, and WhatsApp integration.

**Architecture:** Next.js 14 Frontend → Supabase Database → WhatsApp Cloud API. Data flows from Google Sheets → Supabase → Frontend.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL), WhatsApp Cloud API, Lucide React, Recharts

---

## Phase 1: Database Setup & Data Import

### Task 1: Set Up Supabase Project

**Files:**
- Create: `frontend/supabase/schema.sql`

**Steps:**

1. Create Supabase project at supabase.com (free tier)
2. Get project URL and anon key
3. Create schema.sql with all tables:

```sql
-- Staff Table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  father_husband_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  cnic TEXT,
  cnic_expiry DATE,
  photo_url TEXT,
  contact_1 TEXT,
  contact_2 TEXT,
  whatsapp_number TEXT,
  full_address TEXT,
  designation TEXT NOT NULL,
  hire_date DATE,
  status TEXT DEFAULT 'Active',
  official_district TEXT,
  hourly_rate NUMERIC,
  monthly_salary NUMERIC,
  pnc_license_number TEXT,
  pnc_expiry DATE,
  bls_certified BOOLEAN DEFAULT false,
  bls_expiry DATE,
  skill_icu BOOLEAN DEFAULT false,
  skill_pediatric BOOLEAN DEFAULT false,
  skill_elderly BOOLEAN DEFAULT false,
  skill_mother_baby BOOLEAN DEFAULT false,
  skill_surgical BOOLEAN DEFAULT false,
  languages TEXT,
  can_drive BOOLEAN DEFAULT false,
  available_days TEXT,
  shift_preference TEXT,
  performance_rating NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  cnic TEXT,
  phone_1 TEXT NOT NULL,
  phone_2 TEXT,
  address TEXT NOT NULL,
  district TEXT,
  care_type TEXT NOT NULL,
  care_level TEXT NOT NULL,
  assigned_staff UUID[] DEFAULT '{}',
  billing_category TEXT,
  hourly_rate NUMERIC NOT NULL,
  start_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts Table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  staff_id UUID REFERENCES staff(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll Table
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  hourly_rate NUMERIC NOT NULL,
  overtime_rate NUMERIC,
  gross_amount NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for demo)
CREATE POLICY "Allow all" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON payroll FOR ALL USING (true) WITH CHECK (true);
```

4. Run SQL in Supabase SQL Editor

**Verification:**
- Go to Supabase Dashboard → Table Editor
- Confirm 4 tables created: staff, patients, shifts, payroll

---

### Task 2: Configure Frontend Environment

**Files:**
- Create: `frontend/.env.local`

**Steps:**

1. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Update `frontend/src/lib/supabase.ts` if needed

**Verification:**
- Run `cd frontend && npm run dev`
- Open http://localhost:3000
- Check browser console for Supabase connection

---

### Task 3: Import Staff Data

**Files:**
- Modify: `frontend/supabase/import_staff.js` (create)

**Steps:**

1. Create import script to parse master_staff_report.md
2. Map columns:

| Sheet Column | Supabase Column |
|--------------|-----------------|
| Assigned ID | assigned_id |
| Name | full_name |
| Father's / Husband's Name | father_husband_name |
| Date of Birth | date_of_birth |
| Gender | gender |
| CNIC | cnic |
| Designation | designation |
| Contact 1 | contact_1 |
| Official District | official_district |

3. Run import via Supabase REST API or SQL INSERT

**Sample INSERT:**
```sql
INSERT INTO staff (assigned_id, full_name, father_husband_name, date_of_birth, gender, cnic, designation, contact_1, official_district, status)
VALUES 
('NC-KHI-001', 'Atif Ali', NULL, NULL, 'Male', NULL, 'CEO & Managing Director', NULL, 'Karachi (South)', 'Active'),
('NC-KHI-002', 'Theo', NULL, NULL, 'Male', NULL, 'Office Coordinator & HR Manager', NULL, 'Karachi (South)', 'Active');
-- ... repeat for all 286 records
```

**Verification:**
- Query: `SELECT COUNT(*) FROM staff;`
- Expected: 286 rows

---

### Task 4: Add Sample Patient Data

**Files:**
- Modify: Supabase patients table

**Steps:**

1. Insert sample patients:

```sql
INSERT INTO patients (patient_id, full_name, phone_1, address, district, care_type, care_level, hourly_rate, status)
VALUES 
('P-KHI-001', 'Ahmed Khan', '0300-1234567', 'House 123, Gulshan-e-Iqbal', 'Gulshan', 'ICU', 'High', 1200, 'Active'),
('P-KHI-002', 'Fatima Bibi', '0301-2345678', 'House 45, Korangi', 'Korangi', 'Elderly Care', 'Medium', 800, 'Active'),
('P-KHI-003', 'Bilal Ahmed', '0302-3456789', 'House 78, Malir', 'Malir', 'Post-surgical', 'High', 1000, 'Active'),
('P-KHI-004', 'Aisha Malik', '0303-4567890', 'House 12, Nazimabad', 'Nazimabad', 'Baby Care', 'Low', 600, 'Active'),
('P-KHI-005', 'Muhammad Ali', '0304-5678901', 'House 90, Lyari', 'Keamari', 'General', 'Medium', 700, 'Active');
```

**Verification:**
- Query: `SELECT COUNT(*) FROM patients;`
- Expected: 5+ rows

---

## Phase 2: Frontend Integration

### Task 5: Connect Dashboard to Supabase

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Steps:**

1. Import Supabase client
2. Replace mock data with fetch calls:

```typescript
// Fetch staff count
const { count: staffCount } = await supabase
  .from('staff')
  .select('*', { count: 'exact', head: true });

// Fetch patients
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .eq('status', 'Active');

// Fetch expiring PNC licenses (next 90 days)
const { data: expiring } = await supabase
  .from('staff')
  .select('*')
  .lte('pnc_expiry', new Date(Date.now() + 90*24*60*60*1000));
```

3. Add loading states

**Verification:**
- Dashboard shows real counts from Supabase
- Refresh page - data persists

---

### Task 6: Build Staff List Page

**Files:**
- Modify: `frontend/src/app/staff/page.tsx`

**Steps:**

1. Fetch all staff from Supabase
2. Add filters:
   - By designation (dropdown)
   - By district (dropdown)
   - By status (Active/Inactive)
   - Search by name
3. Add pagination (20 per page)
4. Add "Add Staff" button → modal form

**Verification:**
- Staff list shows all 286+ records
- Filters work correctly
- Search returns matching results

---

### Task 7: Build Patient List Page

**Files:**
- Modify: `frontend/src/app/patients/page.tsx`

**Steps:**

1. Fetch all patients from Supabase
2. Add filters by care_type, care_level, status
3. Add "Add Patient" button → modal form
4. Show assigned staff for each patient

**Verification:**
- Patient list shows sample data
- Filters work correctly
- Can add new patient

---

### Task 8: Build Staff Detail/Edit Page

**Files:**
- Create: `frontend/src/app/staff/[id]/page.tsx`

**Steps:**

1. Dynamic route for staff ID
2. Fetch staff details
3. Edit form with all fields
4. Save updates to Supabase

**Verification:**
- Click staff row → opens detail page
- Edit field → saves to Supabase

---

### Task 9: Build Patient Detail Page

**Files:**
- Create: `frontend/src/app/patients/[id]/page.tsx`

**Steps:**

1. Dynamic route for patient ID
2. Fetch patient details
3. Show assigned staff
4. Assign/unassign staff to patient
5. Edit form

**Verification:**
- Click patient → opens detail
- Can assign staff to patient

---

## Phase 3: Scheduling & Payroll

### Task 10: Build Scheduling Page

**Files:**
- Modify: `frontend/src/app/scheduling/page.tsx`

**Steps:**

1. Calendar view (use react-calendar or custom)
2. Fetch shifts with staff and patient data
3. Create shift form:
   - Select patient
   - Select staff (filter by district/skills)
   - Date picker
   - Time range
4. Display shifts on calendar

**Verification:**
- Calendar shows shifts
- Can create new shift

---

### Task 11: Build Payroll Page

**Files:**
- Modify: `frontend/src/app/payroll/page.tsx`

**Steps:**

1. Select pay period (month)
2. List all staff with:
   - Hours worked (from shifts)
   - Hourly rate
   - Gross pay = hours × rate
   - Deductions field
   - Net pay
3. "Generate Payroll" button
4. "Mark as Paid" button

**Verification:**
- Shows payroll calculation
- Can mark as paid

---

### Task 12: Add Compliance Alerts to Dashboard

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Steps:**

1. Query expiring PNC licenses:
```sql
SELECT * FROM staff 
WHERE pnc_expiry IS NOT NULL 
AND pnc_expiry <= NOW() + INTERVAL '90 days'
ORDER BY pnc_expiry;
```

2. Query expiring CNIC:
```sql
SELECT * FROM staff 
WHERE cnic_expiry IS NOT NULL 
AND cnic_expiry <= NOW() + INTERVAL '90 days';
```

3. Display alerts in dashboard sidebar/header

**Verification:**
- Dashboard shows expiring licenses
- Click alert → goes to staff detail

---

## Phase 4: WhatsApp Integration

### Task 13: Set Up WhatsApp Cloud API

**Files:**
- Modify: `frontend/src/app/settings/page.tsx`

**Steps:**

1. Create WhatsApp Business account at developers.facebook.com
2. Get Phone Number ID and Access Token
3. Add to settings page:
   - Phone Number ID input
   - Access Token input (store securely)
4. Save to Supabase settings table or env vars

**Verification:**
- Settings page saves credentials
- Can send test message

---

### Task 14: Create WhatsApp Notification Functions

**Files:**
- Create: `frontend/src/lib/whatsapp.ts`

**Steps:**

1. Create sendWhatsAppMessage function:

```typescript
export async function sendWhatsAppMessage(phone: string, template: string, params: object) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: template,
        language: { code: 'en_US' },
        components: [{
          type: 'body',
          parameters: params
        }]
      }
    })
  });
  return response.json();
}
```

2. Create templates:
   - shift_reminder: "Hi {name}, your shift at {patient} is tomorrow at {time}"
   - payroll_ready: "Hi {name}, your payslip for {period} is ready. Net: {amount}"
   - pnc_expiry: "Hi {name}, your PNC license expires on {date}. Please renew."

**Verification:**
- Send test message → receives on WhatsApp

---

### Task 15: Connect WhatsApp to Scheduling

**Files:**
- Modify: `frontend/src/app/scheduling/page.tsx`

**Steps:**

1. When shift is created → send WhatsApp to staff
2. Add "Send Reminder" button on existing shifts

**Verification:**
- Create shift → staff gets WhatsApp

---

## Phase 5: Deployment

### Task 16: Push to GitHub

**Steps:**

1. Create GitHub repo
2. Initialize git in frontend folder:
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

**Verification:**
- Code appears in GitHub repo

---

### Task 17: Deploy to Vercel

**Steps:**

1. Go to vercel.com
2. Import GitHub repo
3. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - WHATSAPP_ACCESS_TOKEN
   - WHATSAPP_PHONE_NUMBER_ID
4. Deploy

**Verification:**
- Site loads at vercel.app
- Data shows from Supabase

---

## Summary Checklist

- [ ] Task 1: Supabase tables created
- [ ] Task 2: Frontend env configured
- [ ] Task 3: 286 staff imported
- [ ] Task 4: Sample patients added
- [ ] Task 5: Dashboard connected
- [ ] Task 6: Staff list with filters
- [ ] Task 7: Patient list
- [ ] Task 8: Staff detail/edit
- [ ] Task 9: Patient detail/edit
- [ ] Task 10: Scheduling calendar
- [ ] Task 11: Payroll calculation
- [ ] Task 12: Compliance alerts
- [ ] Task 13: WhatsApp setup
- [ ] Task 14: WhatsApp functions
- [ ] Task 15: WhatsApp notifications
- [ ] Task 16: GitHub push
- [ ] Task 17: Vercel deploy
