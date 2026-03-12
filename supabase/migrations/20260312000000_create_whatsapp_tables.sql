-- WhatsApp Integration Tables for HR Manager
-- Created: 2026-03-12

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
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
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
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
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
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON whatsapp_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_staff_id ON attendance_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(shift_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
