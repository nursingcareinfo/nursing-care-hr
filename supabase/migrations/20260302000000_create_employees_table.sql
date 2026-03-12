-- Create employees table for NursingCare.pk staff records
-- Migration: 20260302_create_employees_table

CREATE TABLE IF NOT EXISTS public.employees (
    id BIGSERIAL PRIMARY KEY,
    assigned_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    father_husband_name TEXT DEFAULT '',
    dob TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    cnic TEXT DEFAULT '',
    designation TEXT DEFAULT '',
    contact1 TEXT DEFAULT '',
    district TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by assigned_id
CREATE INDEX IF NOT EXISTS idx_employees_assigned_id ON public.employees(assigned_id);

-- Table and column documentation
COMMENT ON TABLE public.employees IS 'Employee records from NursingCare.pk';
COMMENT ON COLUMN public.employees.assigned_id IS 'Unique identifier from master report';
COMMENT ON COLUMN public.employees.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.employees.updated_at IS 'Last update timestamp';

-- Enable Row Level Security (optional, configure policies as needed)
-- ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
