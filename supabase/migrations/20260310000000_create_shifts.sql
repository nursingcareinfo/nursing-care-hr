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

CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_staff ON public.shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_type ON public.shifts(shift_type);
CREATE INDEX IF NOT EXISTS idx_shifts_date_type ON public.shifts(shift_date, shift_type);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to shifts" ON public.shifts;
CREATE POLICY "Allow all access to shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
