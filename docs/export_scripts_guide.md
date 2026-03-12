# Export Scripts - Quick Reference

## Google Sheets Export

### Export New Records
```bash
npm run export:sheets
# or
node scripts/export_to_sheets.js
```

### Check Export Status
```bash
npm run export:sheets -- --status
# or
node scripts/export_to_sheets.js --status
```

### Reset and Re-export All
```bash
npm run export:sheets -- --reset
# or
node scripts/export_to_sheets.js --reset
```

### Output Example
```
Previously exported: 286 records
Total records in report: 286
New records to export: 0
```

---

## Supabase Export

### Export New Records
```bash
npm run export:supabase
# or
node scripts/export_to_supabase.js
```

### Check Export Status
```bash
npm run export:supabase:status
# or
node scripts/export_to_supabase.js --status
```

### Reset and Re-export All
```bash
npm run export:supabase:reset
# or
node scripts/export_to_supabase.js --reset
```

### Output Example
```
Connected to Supabase: https://ifvqnxcsjdvfpmmzuwlx.supabase.co
Staff table is accessible
Previously exported to Supabase: 286 records
Total records in report: 286
New records to export to Supabase: 0
```

---

## State Files

| File | Purpose |
|------|---------|
| `data/.export_state.json` | Tracks Google Sheets exports |
| `data/.supabase_export_state.json` | Tracks Supabase exports |

### State File Format
```json
{
  "exportedIds": ["NC-001", "NC-002", ...],
  "lastExport": "2026-03-02T19:00:00.000Z"
}
```

---

## Environment Setup

### Required (.env)
```env
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### Optional (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Batch Processing

Both exporters use batch processing:

| Exporter | Batch Size |
|----------|-----------|
| Google Sheets | 50 records |
| Supabase | 100 records |

---

## Error Handling

### Common Errors

**"No new records to export"**
- All records already exported
- Run with `--reset` to re-export

**"GOOGLE_SHEETS_WEB_APP_URL is not set"**
- Check `.env` file exists
- Verify URL is correct

**"invalid input syntax for type date"**
- Date fields must be `null`, not empty strings
- Script handles this automatically

**"relation does not exist"**
- Supabase `staff` table missing
- Create table via SQL Editor

---

## Data Validation

Records are parsed from Markdown format:

```markdown
| Assigned ID | Name | Father/Husband | DOB | Gender | CNIC | Designation | Contact | District |
|-------------|------|----------------|-----|--------|------|-------------|---------|----------|
| NC-001 | John Doe | Jane Doe | 1990-01-01 | Male | 12345-1234567-1 | Nurse | 0300-1234567 | Karachi |
```

Mapped to database fields:
- `assigned_id` ← Assigned ID
- `name` ← Name
- `father_husband_name` ← Father/Husband
- `date_of_birth` ← DOB
- `gender` ← Gender
- `cnic` ← CNIC
- `designation` ← Designation
- `contact_1` ← Contact
- `district` ← District

---

## Best Practices

1. **Run exports after updating master report**
2. **Check status before resetting**
3. **Keep state files backed up**
4. **Use environment variables, never hardcode**
5. **Test with small batches first**

---

## Troubleshooting Flow

```
Export fails?
  ├─ Check .env exists → If no, create from .env.example
  ├─ Verify URL/credentials → If wrong, update .env
  ├─ Check state files → If corrupt, run --reset
  └─ Review error message → Search this doc
```
