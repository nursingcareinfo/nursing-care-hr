# Documentation Index

## Getting Started

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Main project overview and quick start guide |
| [docs/deployment_guide.md](deployment_guide.md) | Step-by-step deployment instructions |
| [docs/export_scripts_guide.md](export_scripts_guide.md) | Quick reference for export commands |

## Technical Documentation

| Document | Description |
|----------|-------------|
| [docs/supabase_integration.md](supabase_integration.md) | Supabase setup, schema, and API usage |
| [docs/operating_procedures.md](operating_procedures.md) | Standard operating procedures for staff ingestion |
| [docs/security_policy.md](security_policy.md) | Security guidelines and best practices |
| [specs/README.md](../specs/README.md) | LeanSpec feature specifications |

## Configuration

| File | Description |
|------|-------------|
| [.env.example](../.env.example) | Environment variable template |
| [package.json](../package.json) | Dependencies and npm scripts |
| [n8n/.env](../n8n/.env) | n8n and Supabase credentials |
| [n8n/docker-compose.yml](../n8n/docker-compose.yml) | n8n Docker configuration |

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/data_validator.js` | Employee record validation and cleaning |
| `scripts/export_to_sheets.js` | Incremental export to Google Sheets |
| `scripts/export_to_supabase.js` | Incremental export to Supabase |
| `scripts/test_validator.js` | Validation test suite |

## Data Flow

```
WhatsApp Form → n8n (OCR) → Google Sheets → Manual Approval
                                              ↓
                                         Supabase (Backup/API)
                                              ↓
                                         Horilla HRMS (Optional)
```

## Quick Commands

```bash
# Install dependencies
npm install

# Export to both platforms
npm run export:sheets
npm run export:supabase

# Check status
npm run export:sheets -- --status
npm run export:supabase:status

# Reset and re-export
npm run export:sheets -- --reset
npm run export:supabase:reset

# Run tests
npm test
```

## Database Schema

See [docs/supabase_integration.md](supabase_integration.md#database-schema) for complete `staff` table schema.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Export fails with missing URL | Check `.env` file, verify `GOOGLE_SHEETS_WEB_APP_URL` |
| "No new records to export" | All records already exported, use `--reset` to re-export |
| Supabase table not found | Create `staff` table via SQL Editor |
| Google Apps Script error | Redeploy Web App, update URL in `.env` |

## External Resources

- [Supabase Docs](https://supabase.com/docs)
- [n8n Docs](https://docs.n8n.io)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Postgres Best Practices](https://supabase.com/docs/guides/database)
