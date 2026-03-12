# Supabase Integration Guide

## Overview

The HR Manager system uses Supabase as a backup/storage layer for employee records. Data flows from the master report to both Google Sheets (primary) and Supabase (backup).

## Configuration

Credentials are stored in `n8n/.env`:

```env
SUPABASE_URL=https://ifvqnxcsjdvfpmmzuwlx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

## Database Schema

### `staff` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique record ID |
| `assigned_id` | TEXT | UNIQUE, NOT NULL | ID from master report |
| `name` | TEXT | NOT NULL | Employee name |
| `father_husband_name` | TEXT | | Father/husband name |
| `date_of_birth` | DATE | | Date of birth |
| `gender` | TEXT | | Gender |
| `cnic` | TEXT | | CNIC number |
| `designation` | TEXT | | Job designation |
| `contact_1` | TEXT | | Primary contact |
| `contact_2` | TEXT | | Secondary contact |
| `district` | TEXT | | District |
| `hourly_rate` | NUMERIC | | Hourly rate |
| `status` | TEXT | DEFAULT 'active' | Employment status |
| `hire_date` | DATE | | Hire date |
| `notes` | TEXT | | Additional notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update time |

### Indexes

- `staff_pkey` - Primary key on `id`
- `staff_assigned_id_key` - Unique index on `assigned_id`

## Usage

### Export Staff to Supabase

```bash
# Export new records
npm run export:supabase

# Check export status
npm run export:supabase:status

# Reset export state (re-export all)
npm run export:supabase:reset
```

### Direct Node.js Usage

```bash
node scripts/export_to_supabase.js           # Export
node scripts/export_to_supabase.js --status  # Status
node scripts/export_to_supabase.js --reset   # Reset
```

## Data Flow

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ master_staff_report │────▶│ Export Script    │────▶│ Supabase        │
│ (Markdown)          │     │ (Node.js)        │     │ (staff table)   │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                   │
                                   └────▶ Tracks exported IDs in .supabase_export_state.json
```

## Features

- **Incremental Export**: Only new records are sent (tracked by `assigned_id`)
- **Upsert Logic**: Existing records are updated, new records are inserted
- **Batch Processing**: Records sent in batches of 100 for efficiency
- **State Persistence**: Export state saved to `.supabase_export_state.json`
- **Error Handling**: Graceful handling of network/database errors

## Best Practices

### Performance (from Supabase guidelines)

1. **Indexes**: The `assigned_id` column has a unique index for fast lookups
2. **Batch Operations**: Data exported in batches to reduce connection overhead
3. **Upsert**: Uses `ON CONFLICT` for efficient insert/update operations

### Security

1. **Service Key**: Uses service role key for server-side operations only
2. **Environment Variables**: Credentials stored in `.env`, never committed
3. **RLS Ready**: Table can enable Row Level Security if needed for client access

### Data Quality

1. **Null Handling**: Empty/"No record" values converted to `null` for proper typing
2. **Date Validation**: Date fields properly typed (not empty strings)
3. **Unique Constraint**: `assigned_id` prevents duplicate records

## Troubleshooting

### "invalid input syntax for type date"

Ensure date fields are `null` instead of empty strings. The export script handles this automatically.

### "relation does not exist"

Verify the `staff` table exists in your Supabase project:
1. Go to https://ifvqnxcsjdvfpmmzuwlx.supabase.co
2. Navigate to Table Editor
3. Confirm `staff` table is present

### Reset Export State

```bash
npm run export:supabase:reset
```

This clears the export tracking file and re-exports all records on next run.

## Migration Files

Database schema changes are tracked in `supabase/migrations/`:

```bash
supabase/migrations/
└── 20260302000000_create_employees_table.sql  # Initial schema (reference)
```

**Note**: The actual `staff` table already exists in the database. The migration file is for reference only.

## API Access

### REST API

```bash
# Get all staff
curl "https://ifvqnxcsjdvfpmmzuwlx.supabase.co/rest/v1/staff?select=*" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"

# Get by assigned_id
curl "https://ifvqnxcsjdvfpmmzuwlx.supabase.co/rest/v1/staff?assigned_id=eq.NC-001" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
```

### JavaScript Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Fetch all staff
const { data } = await supabase.from('staff').select('*')

// Fetch by assigned_id
const { data } = await supabase
  .from('staff')
  .select('*')
  .eq('assigned_id', 'NC-001')
```

## Related Files

| File | Purpose |
|------|---------|
| `scripts/export_to_supabase.js` | Export script |
| `scripts/apply_supabase_migration.js` | Migration helper |
| `n8n/.env` | Environment credentials |
| `data/.supabase_export_state.json` | Export tracking |
| `supabase/migrations/` | Schema migrations |
