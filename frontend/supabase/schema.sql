-- NursingCare.pk HR Management System - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assigned_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  father_husband_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  cnic TEXT UNIQUE,
  cnic_expiry DATE,
  photo_url TEXT,
  contact_1 TEXT,
  contact_2 TEXT,
  whatsapp_number TEXT,
  full_address TEXT,
  designation TEXT NOT NULL CHECK (designation IN (
    'R/N', 'BSN', 'NURSE_ASSISTANT', 'ATTENDANT', 'MID_WIFE',
    'PHYSIOTHERAPIST', 'DOCTOR', 'BABY_SITTER', 'TECHNICIAN',
    'OFFICE_STAFF', 'MANAGER', 'CEO'
  )),
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
  official_district TEXT,
  hourly_rate NUMERIC(10,2),
  monthly_salary NUMERIC(12,2),
  overtime_rate NUMERIC(5,2),
  bank_name TEXT,
  account_number TEXT,
  pnc_license_number TEXT,
  pnc_expiry DATE,
  bls_certified BOOLEAN DEFAULT false,
  bls_expiry DATE,
  vaccination_status TEXT CHECK (vaccination_status IN ('Complete', 'Partial', 'None')),
  skill_icu BOOLEAN DEFAULT false,
  skill_pediatric BOOLEAN DEFAULT false,
  skill_elderly BOOLEAN DEFAULT false,
  skill_mother_baby BOOLEAN DEFAULT false,
  skill_surgical BOOLEAN DEFAULT false,
  languages TEXT,
  can_drive BOOLEAN DEFAULT false,
  gender_preference TEXT CHECK (gender_preference IN ('Male', 'Female', 'None')),
  available_days TEXT,
  shift_preference TEXT CHECK (shift_preference IN ('Morning', 'Afternoon', 'Night', 'Any')),
  max_distance_km NUMERIC(6,2),
  performance_rating NUMERIC(2,1) CHECK (performance_rating >= 1 AND performance_rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  cnic TEXT,
  phone_1 TEXT NOT NULL,
  phone_2 TEXT,
  address TEXT NOT NULL,
  district TEXT,
  care_type TEXT NOT NULL CHECK (care_type IN ('ICU', 'Elderly', 'Pediatric', 'Mother & Baby', 'Post-surgical', 'General')),
  care_level TEXT NOT NULL CHECK (care_level IN ('High', 'Medium', 'Low')),
  assigned_staff UUID[] DEFAULT '{}',
  billing_category TEXT CHECK (billing_category IN ('Private', 'Insurance', 'Government')),
  hourly_rate NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIFTS TABLE
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Missed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYROLL TABLE
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  regular_hours NUMERIC(6,2) NOT NULL,
  overtime_hours NUMERIC(6,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL,
  overtime_rate NUMERIC(5,2),
  gross_amount NUMERIC(12,2) NOT NULL,
  deductions NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Paid')),
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - can restrict later)
CREATE POLICY "Allow all access to staff" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all access to shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow all access to payroll" ON payroll FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_designation ON staff(designation);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_district ON staff(official_district);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_staff ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_payroll_staff ON payroll(staff_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for staff
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
