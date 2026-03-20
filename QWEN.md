# HR Manager - Home Nursing Care

## Project Overview

This is an **employee data management system** for NursingCare.pk, a home nursing care provider. The system automates the ingestion, validation, and synchronization of staff/employee records across multiple platforms:

- **Data Source**: Markdown reports and WhatsApp form submissions
- **Validation**: Node.js data validator scripts
- **Storage**: Google Sheets (primary) + Supabase (backup)
- **Automation**: n8n workflows for data ingestion and synchronization
- **Optional Integration**: Horilla HRMS for final employee records

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  WhatsApp Form  │────▶│   n8n Workflow   │────▶│  Google Sheets  │
│    (New Hire)   │     │  (OCR/Extraction)│     │   (Staging)     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐     ┌────────▼────────┐
│  Horilla HRMS   │◀────│  Export Scripts  │◀────│  Google Sheets  │
│  (Optional)     │     │   (Node.js)      │     │   (Approved)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Key Components

| Directory/File | Purpose |
|----------------|---------|
| `scripts/data_validator.js` | Employee record validation and cleaning |
| `scripts/export_to_sheets.js` | Incremental export to Google Sheets (tracks state) |
| `scripts/horilla_integration.js` | Optional HRMS API integration |
| `workflows/*.json` | n8n automation workflows |
| `data/master_report/` | Source employee data (Markdown format) |
| `n8n/docker-compose.yml` | n8n container configuration |
| `specs/` | LeanSpec specifications for features |

---

## Building and Running

### Prerequisites

- **Node.js**: v25.6.1 (managed via mise)
- **n8n**: Docker (optional, for automation)

### Setup

```bash
# Install dependencies
npm install

# Set environment variables
export GOOGLE_SHEETS_WEB_APP_URL="https://..."
export HORILLA_BASE_URL="http://localhost:8000"  # Optional
export HORILLA_API_KEY="your-api-key"            # Optional
```

### Commands

```bash
# Run tests
npm test
node scripts/test_validator.js

# Export to Google Sheets
npm run export:sheets
node scripts/export_to_sheets.js --status    # Check status
node scripts/export_to_sheets.js --reset     # Reset state

# Export to Supabase
npm run export:supabase
node scripts/export_to_supabase.js --status  # Check status
node scripts/export_to_supabase.js --reset   # Reset state

# Start n8n (Docker)
cd n8n && docker-compose up -d
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SHEETS_WEB_APP_URL` | Yes | Google Apps Script webhook URL |
| `HORILLA_BASE_URL` | No | Horilla HRMS base URL |
| `HORILLA_API_KEY` | No | Horilla API authentication token |
| `ERROR_WEBHOOK_URL` | No | Error notification webhook |

---

## Development Conventions

### Code Style

- **Module System**: CommonJS (`require()` / `module.exports`)
- **Classes**: ES6 class syntax with static methods for utilities
- **Error Handling**: Try/catch for async operations; log with context before re-throwing

### Import/Export Pattern

```javascript
// Single export
module.exports = ClassName;

// Multiple exports
const { func1, func2 } = require('./module');
module.exports = { func1, func2 };
```

### Data Validation Pattern

```javascript
{
  isValid: boolean,
  data: object,
  errors: string[]
}
```

### Testing Practices

- Tests located in `scripts/test_validator.js`
- Run with `npm test` or `node scripts/test_validator.js`

---

## Data Flow

1. **Ingestion**: Raw data extracted from Markdown reports or WhatsApp form images
2. **Validation**: `DataValidator` cleans and validates employee records
3. **Export**: Incremental push to Google Sheets (tracks exported IDs in `.export_state.json`)
4. **Approval**: Manual review in Google Sheets; status set to "Approved"
5. **Sync**: Approved records synced to Supabase (optional: Horilla HRMS)

---

## Key Files Reference

| File | Description |
|------|-------------|
| `AGENTS.md` | Agent guidelines and code style |
| `docs/deployment_guide.md` | Step-by-step deployment instructions |
| `docs/operating_procedures.md` | SOP for employee ingestion workflow |
| `data/import_instructions.html` | HTML guide for CSV import to Sheets |
| `specs/README.md` | LeanSpec documentation |

---

## Troubleshooting

### Export fails with missing URL
```bash
export GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/..."
```

### Reset export state
```bash
node scripts/export_to_sheets.js --reset
```

### Check what's been exported
```bash
node scripts/export_to_sheets.js --status
```

### n8n container issues
```bash
cd n8n
docker-compose down
docker-compose up -d
```

## Qwen Added Memories
- User is developing HR Manager system for NursingCare.pk - employee data management with Google Sheets + Supabase sync
- Project uses Node.js v25.6.1 via mise, CommonJS modules, with exports to Google Sheets (primary) and Supabase (backup). Supabase project: ifvqnxcsjdvfpmmzuwlx with staff table containing 286 records
- Recommended tech stack for NursingCare.pk HR: Baserow (primary DB) + n8n (automation) + Softr (employee portal). Self-hosted, free, scalable to 1000+ employees. Frappe HR for Phase 2 when >500 employees.
- NursingCare.pk HR automation: Baserow + Typebot + n8n + WhatsApp API for 2000+ employee onboarding. Target cost $71-170/month vs $2000+ traditional HRMS. WhatsApp form → AI verification → Baserow DB → HR approval workflow.
