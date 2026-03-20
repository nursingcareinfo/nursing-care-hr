-- Migration: Add HR-specific fields to staff table
-- These fields support more detailed employee profiles and payment tracking.

ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS age TEXT,
ADD COLUMN IF NOT EXISTS payment_mode TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.staff.religion IS 'Religious affiliation (optional)';
COMMENT ON COLUMN public.staff.marital_status IS 'Single, Married, Divorced, etc.';
COMMENT ON COLUMN public.staff.age IS 'Current age (for quick reference)';
COMMENT ON COLUMN public.staff.payment_mode IS 'Preferred payment method (JazzCash, EasyPaisa, Bank Transfer, Cash)';
COMMENT ON COLUMN public.staff.languages IS 'Languages spoken by the staff member';

-- Update RLS policies if necessary (not needed as "Allow all" policy exists)
