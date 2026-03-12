-- Create shifts table for day/night shift management
-- Migration: 20260309_create_shifts_and_patients

-- Shifts table with day/night only
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    patient_id UUID,
    shift_date DATE NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('day', 'night')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_staff ON public.shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_type ON public.shifts(shift_type);
CREATE INDEX IF NOT EXISTS idx_shifts_date_type ON public.shifts(shift_date, shift_type);

-- Update patients table if needed (add missing columns)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Simple policies for shifts (adjust as needed)
DROP POLICY IF EXISTS "Allow all access to shifts" ON public.shifts;
CREATE POLICY "Allow all access to shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
