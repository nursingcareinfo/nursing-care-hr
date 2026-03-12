# NursingCare.pk Business Automation System
## Design Document - v1.0

**Date:** 2026-03-07  
**Author:** AI Assistant (HR Manager perspective)  
**Status:** Approved for Implementation

---

## 1. Executive Summary

Complete automation system for NursingCare.pk home nursing care business. Manages 1200+ staff members and 1000+ patients with WhatsApp integration, smart scheduling, payroll, and real-time analytics.

**Tech Stack:**
- Frontend: Next.js 14 (React) on Vercel (Free)
- Backend: Supabase (Free tier: 500MB DB, 1GB storage)
- WhatsApp: Cloud API (Free tier: 1K template messages/month)
- Backup: Google Sheets + Baserow

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FREND (Vercel)                              │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐  │
│  │Dashboard│ │ Staff   │ │ Patients │ │Schedule│ │ Payroll │  │
│  └─────────┘ └─────────┘ └──────────┘ └────────┘ └─────────┘  │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                           │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │PostgreSQL│ │  Auth   │ │Functions │ │   Storage        │   │
│  │  (DB)    │ │         │ │(Edge API)│ │  (Photos/Docs)  │   │
│  └──────────┘ └─────────┘ └──────────┘ └──────────────────┘   │
└──────────────────────────┬────────────────────────────────────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │ WhatsApp  │  │  Google   │  │  Baserow  │
     │  Cloud    │  │  Sheets   │  │           │
     │   API     │  │  (Backup) │  │  (Backup) │
     └───────────┘  └───────────┘  └───────────┘
```

---

## 3. Database Schema

### 3.1 Staff Table

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| assigned_id | TEXT | Yes | NC-KHI-XXX format |
| full_name | TEXT | Yes | Full name |
| father_husband_name | TEXT | No | Family reference |
| date_of_birth | DATE | No | DOB |
| gender | TEXT | No | Male/Female/Other |
| cnic | TEXT | No | CNIC number |
| cnic_expiry | DATE | No | CNIC renewal date |
| photo_url | TEXT | No | Profile photo URL |
| contact_1 | TEXT | No | Primary phone |
| contact_2 | TEXT | No | Emergency contact |
| whatsapp_number | TEXT | No | WhatsApp number |
| full_address | TEXT | No | Home address |
| designation | TEXT | Yes | Role (see below) |
| hire_date | DATE | No | When joined |
| status | TEXT | Yes | Active/Inactive/On Leave |
| official_district | TEXT | No | Work district |
| hourly_rate | NUMERIC | No | PKR per hour |
| monthly_salary | NUMERIC | No | Fixed monthly |
| overtime_rate | NUMERIC | No | 1.5x or 2x |
| bank_name | TEXT | No | For salary transfer |
| account_number | TEXT | No | IBAN/Account |
| pnc_license_number | TEXT | No | PNC registration |
| pnc_expiry | DATE | No | License validity |
| bls_certified | BOOLEAN | No | CPR training |
| bls_expiry | DATE | No | BLS renewal date |
| vaccination_status | TEXT | No | Complete/Partial/None |
| skill_icu | BOOLEAN | No | ICU capability |
| skill_pediatric | BOOLEAN | No | Child care |
| skill_elderly | BOOLEAN | No | Elderly care |
| skill_mother_baby | BOOLEAN | No | Maternity |
| skill_surgical | BOOLEAN | No | Post-surgical |
| languages | TEXT | No | Urdu, English, Sindhi... |
| can_drive | BOOLEAN | No | Has license |
| gender_preference | TEXT | No | Male/Female/None |
| available_days | TEXT | No | Mon-Sun |
| shift_preference | TEXT | No | Morning/Afternoon/Night |
| max_distance_km | NUMERIC | No | Travel distance |
| performance_rating | NUMERIC | No | 1-5 stars |
| notes | TEXT | No | Special notes |
| created_at | TIMESTAMP | Yes | Auto |
| updated_at | TIMESTAMP | Yes | Auto |

### 3.2 Designations (Standardized)

| Code | Display Name | Default Rate (PKR) |
|------|--------------|-------------------|
| R/N | Registered Nurse | 800-1200/hr |
| BSN | Bachelor Nurse | 1000-1500/hr |
| NURSE_ASSISTANT | Nurse Assistant | 500-700/hr |
| ATTENDANT | Attendant | 400-600/hr |
| MID_WIFE | Midwife | 700-1000/hr |
| PHYSIOTHERAPIST | Physiotherapist | 1000-1500/hr |
| DOCTOR | Doctor | 2000-5000/hr |
| BABY_SITTER | Baby Sitter | 400-600/hr |
| TECHNICIAN | Medical Technician | 600-900/hr |
| OFFICE_STAFF | Admin/Office | Fixed salary |
| MANAGER | Manager | Fixed salary |
| CEO | CEO | Fixed salary |

### 3.3 Patients Table

| Column | Type | Required |
|--------|------|----------|
| id | UUID | Yes |
| patient_id | TEXT | Yes | P-KHI-XXX format |
| full_name | TEXT | Yes |
| date_of_birth | DATE | No |
| gender | TEXT | No |
| cnic | TEXT | No |
| phone_1 | TEXT | Yes |
| phone_2 | TEXT | No |
| address | TEXT | Yes |
| district | TEXT | No |
| care_type | TEXT | Yes | ICU/Elderly/Post-surgical/etc |
| care_level | TEXT | Yes | High/Medium/Low |
| assigned_staff | UUID[] | No | Array of staff IDs |
| billing_category | TEXT | No | Private/Insurance/Government |
| hourly_rate | NUMERIC | Yes |
| start_date | DATE | Yes |
| notes | TEXT | No |
| status | TEXT | Yes | Active/Discharged |
| created_at | TIMESTAMP | Yes |

### 3.4 Shifts Table

| Column | Type | Required |
|--------|------|----------|
| id | UUID | Yes |
| patient_id | UUID | Yes |
| staff_id | UUID | Yes |
| shift_date | DATE | Yes |
| start_time | TIME | Yes |
| end_time | TIME | Yes |
| actual_start | TIMESTAMP | No | Check-in time |
| actual_end | TIMESTAMP | No | Check-out time |
| status | TEXT | Yes | Scheduled/Completed/Missed |
| notes | TEXT | No |
| created_at | TIMESTAMP | Yes |

### 3.5 Payroll Table

| Column | Type | Required |
|--------|------|----------|
| id | UUID | Yes |
| staff_id | UUID | Yes |
| period_start | DATE | Yes |
| period_end | DATE | Yes |
| regular_hours | NUMERIC | Yes |
| overtime_hours | NUMERIC | No |
| hourly_rate | NUMERIC | Yes |
| overtime_rate | NUMERIC | No |
| gross_amount | NUMERIC | Yes |
| deductions | NUMERIC | No |
| net_amount | NUMERIC | Yes |
| status | TEXT | Yes | Draft/Approved/Paid |
| paid_date | DATE | No |
| created_at | TIMESTAMP | Yes |

---

## 4. UI/UX Design

### 4.1 Layout

- **Sidebar Navigation** (collapsible)
  - Dashboard
  - Staff
  - Patients
  - Scheduling
  - Payroll
  - Reports
  - Settings
- **Top Bar**: Search, Notifications, User Menu
- **Main Content**: Dynamic based on selection

### 4.2 Color Scheme

- Primary: #0EA5E9 (Sky Blue - healthcare)
- Secondary: #10B981 (Emerald - success)
- Accent: #F59E0B (Amber - warning)
- Danger: #EF4444 (Red)
- Background: #F8FAFC (Light gray)
- Card Background: #FFFFFF
- Text: #1E293B (Slate)

### 4.3 Components

- Data tables with sorting, filtering, pagination
- Forms with validation
- Cards for dashboard stats
- Charts for analytics
- Modal dialogs for CRUD
- Toast notifications

---

## 5. Features

### 5.1 Dashboard
- Total staff count (by role)
- Total patients (active/inactive)
- Today's shifts
- Upcoming expiring licenses
- Revenue this month
- Staff utilization %

### 5.2 Staff Management
- List all staff with filters
- Add/Edit/View staff
- Bulk import from CSV
- License expiry alerts
- Performance tracking
- Document storage

### 5.3 Patient Management
- List all patients
- Add/Edit/View patient
- Assign staff to patient
- Care plan management
- Billing info

### 5.4 Scheduling
- Calendar view (day/week/month)
- Create shifts
- Auto-assign based on skills
- Conflict detection
- Shift confirmation via WhatsApp

### 5.5 Payroll
- Generate pay periods
- Auto-calculate hours
- Add deductions
- Export payslips
- Payment tracking

### 5.6 WhatsApp Integration
- Staff intake form (template)
- Patient intake form (template)
- Shift reminders
- Shift confirmation
- Payroll notifications
- Expiry alerts

---

## 6. API Endpoints

### Staff
- GET /api/staff - List all
- GET /api/staff/[id] - Get one
- POST /api/staff - Create
- PUT /api/staff/[id] - Update
- DELETE /api/staff/[id] - Delete

### Patients
- GET /api/patients - List all
- GET /api/patients/[id] - Get one
- POST /api/patients - Create
- PUT /api/patients/[id] - Update

### Shifts
- GET /api/shifts - List (with filters)
- POST /api/shifts - Create
- PUT /api/shifts/[id] - Update

### Payroll
- GET /api/payroll - List
- POST /api/payroll/generate - Generate period
- PUT /api/payroll/[id] - Update status

---

## 7. Security

- Row Level Security (RLS) on all tables
- Auth required for dashboard access
- Role-based access (Admin, Manager, Staff)
- Input sanitization
- Rate limiting on API

---

## 8. Deployment

### Vercel
- Connect GitHub repo
- Auto-deploy on push
- Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - WHATSAPP_ACCESS_TOKEN
  - WHATSAPP_PHONE_NUMBER_ID

### Supabase
- Create project
- Run SQL migrations
- Configure RLS policies
- Set up storage bucket

---

## 9. Migration Plan

### Phase 1: Staff & Patients
- Import existing 286 staff records
- Enhance with new columns
- Add missing data

### Phase 2: Operations
- Scheduling module
- Shift management

### Phase 3: Finance
- Payroll generation
- Billing

### Phase 4: Automation
- WhatsApp integration
- Notifications

---

## 10. Success Metrics

- [ ] All 1200+ staff in system
- [ ] All 1000+ patients tracked
- [ ] Real-time dashboard working
- [ ] WhatsApp notifications working
- [ ] Payroll automated
- [ ] Zero manual tracking

---

**Approved by:** ________________  
**Date:** ________________
