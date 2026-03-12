const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ifvqnxcsjdvfpmmzuwlx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdnFueGNzamR2ZnBtbXp1d2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwNDkwNywiZXhwIjoyMDg3NzgwOTA3fQ.EXrvcHU2aqabHTk_UCpz8RNwh-sn_x17ZE9eM8LyQjw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
    console.log('Running WhatsApp tables migration...\n');
    
    let contactsExist = false;
    try {
        const result = await supabase
            .from('whatsapp_contacts')
            .select('id')
            .limit(1);
        
        // If no error or the error is not about table existence, it exists.
        // PostgREST returns PGRST116 for "No rows found" but 404 (PGRST204) for table not found
        if (!result.error || result.error.code !== 'PGRST204') {
            contactsExist = true;
        }
    } catch (e) {
        contactsExist = false;
    }

    if (contactsExist) {
        console.log('WhatsApp tables already exist. Migration skipped.');
        return;
    }

    console.log('Creating tables via Supabase Dashboard SQL Editor required.');
    console.log('Please run the following SQL in your Supabase Dashboard:\n');
    console.log(`-- WhatsApp Integration Tables for HR Manager

-- WhatsApp contacts (staff who have messaged)
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    staff_id UUID REFERENCES staff(id),
    name VARCHAR(100),
    first_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp message log
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_phone VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    command VARCHAR(20),
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance log
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    staff_phone VARCHAR(20) NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    shift_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    staff_phone VARCHAR(20) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON whatsapp_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_staff_id ON attendance_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(shift_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);`);
}

runMigration().catch(console.error);
