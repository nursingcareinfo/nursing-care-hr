# HR Manager - Home Nursing Care

Employee data management system for NursingCare.pk. Automates ingestion, validation, and synchronization of staff records across multiple platforms.

## Architecture

### Current (Phase 1)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  WhatsApp Form  │────▶│   n8n Workflow   │────▶│  Google Sheets  │
│    (New Hire)   │     │  (OCR/Extraction)│     │   (Approval)    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                  ┌───────▼────────┐
                                                  │   Supabase     │
                                                  │   (Backup)     │
                                                  └────────────────┘
```

### Recommended (Phase 2)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Baserow Form   │────▶│   n8n Workflow   │────▶│    Baserow      │
│  (New Hire)     │     │  (Validate)      │     │  (Primary DB)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                          ┌──────────────────┐     ┌──────▼───────┐
                          │   Softr Portal   │◀────│   Supabase   │
                          │  (Self-Service)  │     │   (Backup)   │
                          └──────────────────┘     └──────────────┘
```

See [HR Technology Recommendations](docs/hr_technology_recommendations.md) for full roadmap.

## Features

- **Data Validation**: Node.js scripts validate and clean employee records
- **Google Sheets Integration**: Incremental export with duplicate prevention
- **Supabase Backup**: PostgreSQL backup with full API access
- **State Tracking**: Tracks exported records to prevent duplicates
- **Batch Processing**: Efficient batch uploads for large datasets

## Quick Start

### Prerequisites

- Node.js v25.6.1+ (managed via mise)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SHEETS_WEB_APP_URL` | Yes | Google Apps Script Web App URL |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | No | Supabase service role key |

### Commands

```bash
# Run tests
npm test

# Export to Google Sheets
npm run export:sheets
npm run export:sheets -- --status    # Check status
npm run export:sheets -- --reset     # Reset and re-export

# Export to Supabase
npm run export:supabase
npm run export:supabase:status       # Check status
npm run export:supabase:reset        # Reset and re-export
```

## Project Structure

```
HR_manager_home_nursing_care/
├── scripts/
│   ├── data_validator.js        # Employee record validation
│   ├── export_to_sheets.js      # Google Sheets exporter
│   ├── export_to_supabase.js    # Supabase exporter
│   └── test_validator.js        # Validation tests
├── data/
│   ├── master_report/           # Source employee data (Markdown)
│   ├── .export_state.json       # Sheets export tracking
│   └── .supabase_export_state.json  # Supabase export tracking
├── docs/
│   ├── deployment_guide.md      # Setup instructions
│   ├── operating_procedures.md  # SOP documentation
│   ├── security_policy.md       # Security guidelines
│   └── supabase_integration.md  # Supabase integration guide
├── workflows/
│   └── *.json                   # n8n automation workflows
├── n8n/
│   ├── .env                     # n8n environment variables
│   └── docker-compose.yml       # n8n Docker setup
├── supabase/
│   └── migrations/              # Database migrations
├── specs/
│   └── */README.md              # Feature specifications
├── .env                         # Local environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Data Flow

1. **Ingestion**: Raw data from WhatsApp forms or Markdown reports
2. **Validation**: `DataValidator` cleans and validates records
3. **Export**: Incremental push to Google Sheets and Supabase
4. **Approval**: Manual review in Google Sheets
5. **Sync**: Approved records available via Supabase API

## Database Schema

### Supabase `staff` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `assigned_id` | TEXT | Unique ID from master report |
| `name` | TEXT | Employee name |
| `father_husband_name` | TEXT | Father/husband name |
| `date_of_birth` | DATE | Date of birth |
| `gender` | TEXT | Gender |
| `cnic` | TEXT | CNIC number |
| `designation` | TEXT | Job designation |
| `contact_1` | TEXT | Primary contact |
| `contact_2` | TEXT | Secondary contact |
| `district` | TEXT | District |
| `hourly_rate` | NUMERIC | Hourly rate |
| `status` | TEXT | Employment status |
| `hire_date` | DATE | Hire date |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

## API Access

### Supabase REST API

```bash
# Get all staff
curl "https://YOUR_PROJECT.supabase.co/rest/v1/staff?select=*" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"

# Get by assigned_id
curl "https://YOUR_PROJECT.supabase.co/rest/v1/staff?assigned_id=eq.NC-001" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
```

### JavaScript Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Fetch all staff
const { data, error } = await supabase.from('staff').select('*')

// Fetch by assigned_id
const { data, error } = await supabase
  .from('staff')
  .select('*')
  .eq('assigned_id', 'NC-001')
```

## Architecture Comparison

| Aspect | Google Sheets | Supabase |
|--------|--------------|----------|
| **Purpose** | Manual review & approval | API backend & production |
| **Access** | Web UI, Apps Script | REST API, SQL |
| **Performance** | ~1000 rows optimal | Millions of rows |
| **Query Power** | Basic filters | Full SQL, joins |
| **Security** | Sharing permissions | Row-Level Security |
| **Best For** | Business users | Developers, apps |

## Troubleshooting

### Export fails with missing URL

```bash
export GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/..."
```

### Reset export state

```bash
npm run export:sheets -- --reset
npm run export:supabase:reset
```

### Check what's been exported

```bash
npm run export:sheets -- --status
npm run export:supabase:status
```

### Google Apps Script errors

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Check execution logs for errors
4. Redeploy Web App if needed

### Supabase connection issues

1. Verify credentials in `.env`
2. Check project at https://YOUR_PROJECT.supabase.co
3. Ensure `staff` table exists

## Testing

```bash
# Run validation tests
npm test

# Or directly
node scripts/test_validator.js
```

## Contributing

1. Follow existing code style (CommonJS, ES6 classes)
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

Internal use only - NursingCare.pk

## Related Documentation

- [Deployment Guide](docs/deployment_guide.md)
- [Operating Procedures](docs/operating_procedures.md)
- [Security Policy](docs/security_policy.md)
- [Supabase Integration](docs/supabase_integration.md)
- [LeanSpec Specifications](specs/README.md)
