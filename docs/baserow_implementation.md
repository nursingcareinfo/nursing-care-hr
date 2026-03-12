# Baserow Implementation Guide
## Quick Start for NursingCare.pk

**Estimated Time:** 2-3 hours  
**Difficulty:** Intermediate (Docker knowledge helpful)

---

## Overview

This guide walks you through migrating from Google Sheets → Baserow for employee database management.

### Benefits

| Feature | Google Sheets | Baserow |
|---------|--------------|---------|
| **API Access** | Apps Script only | REST + GraphQL |
| **Row Limits** | 10M cells | Unlimited (self-hosted) |
| **Permissions** | Sheet-level | Row-level |
| **Forms** | Google Forms | Built-in |
| **Cost** | $6/user/mo | Free (self-hosted) |
| **Audit Log** | Limited | Complete |

---

## Prerequisites

- Server with Docker installed (Ubuntu/Debian recommended)
- Domain name (optional, for public access)
- 2GB RAM minimum
- 20GB disk space

---

## Step 1: Deploy Baserow

```bash
# Navigate to project directory
cd /home/archbtw/dev/HR_manager_home_nursing_care

# Make script executable
chmod +x scripts/deploy_baserow.sh

# Run deployment
./scripts/deploy_baserow.sh
```

**What this does:**
- Creates `/opt/baserow` directory
- Generates secure passwords
- Starts Docker container
- Waits for Baserow to be ready

**Expected Output:**
```
🎉 Baserow Deployment Complete!
📍 Access Baserow: http://localhost
👤 Admin Email: admin@nursingcare.pk
🔑 Admin Password: [generated]
```

**Save the admin password!** It's stored in `/opt/baserow/.env`

---

## Step 2: Create Employee Database

1. **Login to Baserow**
   - Open: http://localhost (or your domain)
   - Login with admin credentials

2. **Create New Database**
   - Click "+ New Database"
   - Name: `NursingCare HR`
   - Click "Create"

3. **Create Employee Table**
   - Click "+ New Table" → "Start from scratch"
   - Name: `Employees`
   - Add fields (see schema below)

### Required Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `assigned_id` | Single line text | ✅ | Unique ID (NC-KHI-001) |
| `name` | Single line text | ✅ | Employee full name |
| `father_husband_name` | Single line text | | |
| `date_of_birth` | Date | | |
| `gender` | Single select | | Options: Male, Female, Other |
| `cnic` | Single line text | | 13 digits, no dashes |
| `designation` | Single select | | Nurse, Attendant, etc. |
| `contact_1` | Single line text | | 11 digits |
| `contact_2` | Single line text | | Optional |
| `district` | Single select | | Karachi districts |
| `hourly_rate` | Number | | Decimal |
| `status` | Single select | ✅ | Active, Pending, Inactive |
| `hire_date` | Date | | |
| `notes` | Long text | | |

### Pre-populate Select Options

**Gender:**
```
Male
Female
Other
```

**Designation:**
```
CEO & Managing Director
Office Coordinator & HR Manager
Manager
Staff Nurse
R/N (Registered Nurse)
BSN (Bachelor of Science in Nursing)
Nurse Assistant
Attendant
Mid Wife
Doctor
Physiotherapist
Technician
Babysitter
Caretaker
Office Boy
```

**Districts:**
```
Karachi (South)
Karachi (Central)
Gulshan
Korangi
Keamari
Malir
Nazimabad
Orangi
```

**Status:**
```
Pending Approval
Active
On Leave
Inactive
Terminated
```

---

## Step 3: Get API Token

1. **Go to Settings** (gear icon)
2. **Click "Account"**
3. **Scroll to "Auth Token"**
4. **Click "Create Token"**
   - Name: `n8n-integration`
   - Permissions: Database admin
5. **Copy the token** (save securely)

---

## Step 4: Migrate Data from Supabase

```bash
# Set environment variables
export BASEROW_URL="http://localhost"
export BASEROW_TOKEN="your-token-from-step-3"
export BASEROW_TABLE_ID="1"  # Check in Baserow URL

# Run migration
node scripts/migrate_to_baserow.js
```

**Expected Output:**
```
🚀 Starting Migration: Supabase → Baserow
📥 Fetching data from Supabase...
✅ Fetched 286 records from Supabase
📤 Migrating to Baserow...
✓✓✓✓✓✓✓✓✓✓... 50/286
✓✓✓✓✓✓✓✓✓✓... 100/286
...

📊 Migration Summary
Total Records: 286
✅ Successful: 286
❌ Failed: 0
📈 Success Rate: 100.0%

✅ Migration Complete!
```

---

## Step 5: Create Intake Form

1. **In Baserow, click "Forms"** (left sidebar)
2. **Click "+ New Form"**
3. **Name:** `New Staff Submission`
4. **Configure Fields:**
   - Enable: assigned_id, name, designation, contact_1, etc.
   - Make required: assigned_id, name, designation, contact_1
   - Hide: status (default to "Pending Approval")

5. **Customize Form:**
   - Add logo
   - Welcome message: "Submit new staff member information"
   - Submit button text: "Submit for Approval"
   - Success message: "Submitted! HR will review within 24 hours"

6. **Copy Form URL** (for WhatsApp/intake)

---

## Step 6: Update n8n Workflow

### Import Workflow

1. **Open n8n** (http://localhost:5678)
2. **Workflows → Add Workflow**
3. **Click "⋯" → Import from File**
4. **Select:** `workflows/n8n_baserow_intake.json`

### Configure Credentials

1. **Go to Credentials** (left sidebar)
2. **Add: HTTP Header Auth**
   - Name: `Baserow API Token`
   - Name: `Authorization`
   - Value: `Token YOUR_BASEROW_TOKEN`

3. **Add: Supabase Auth** (if not exists)
   - Name: `Supabase Service Key`
   - Name: `apikey`
   - Value: `YOUR_SUPABASE_KEY`

### Set Environment Variables

In n8n settings or `.env`:

```bash
BASEROW_URL=http://localhost
BASEROW_TOKEN=your-token
BASEROW_TABLE_ID=1
SUPABASE_URL=https://ifvqnxcsjdvfpmmzuwlx.supabase.co
SUPABASE_SERVICE_KEY=your-key
```

### Activate Workflow

1. **Toggle workflow to "Active"**
2. **Copy Webhook URL**
3. **Test with sample data**

---

## Step 7: Test End-to-End

### Test Submission

```bash
curl -X POST http://localhost:5678/webhook/hr-staff-intake \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_id": "NC-TEST-001",
    "name": "Test Employee",
    "designation": "Nurse Assistant",
    "contact1": "03001234567",
    "district": "Gulshan"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Staff member submitted successfully",
  "assigned_id": "NC-TEST-001",
  "status": "Pending Approval"
}
```

### Verify

1. **Check Baserow:** New record with "Pending Approval" status
2. **Check Supabase:** Backup record created
3. **Check Google Sheets:** Synced (if still using)
4. **Check Email:** HR notification sent

---

## Step 8: Go Live

### Update Intake Process

**Old:**
```
WhatsApp → n8n OCR → Google Sheets → Manual Entry
```

**New:**
```
Baserow Form → n8n Validation → Baserow DB → Auto-sync
```

### Update Documentation

1. Share form URL with intake team
2. Train HR on Baserow approval workflow
3. Update SOP documentation

### Monitor

First week:
- Check daily for failed submissions
- Review approval time
- Gather feedback from HR team

---

## Troubleshooting

### Baserow won't start

```bash
# Check logs
cd /opt/baserow
docker-compose logs -f

# Restart
docker-compose restart
```

### Migration fails

```bash
# Test connection
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost/api/database/tables/

# Check table ID
# URL shows: /database/rows/table/1/ → ID is 1
```

### n8n webhook returns 500

1. Check n8n execution logs
2. Verify Baserow token is valid
3. Ensure table ID matches
4. Test with smaller payload

---

## Backup Strategy

### Daily Backup

```bash
# Add to crontab (0 2 * * * = daily at 2 AM)
0 2 * * * cd /opt/baserow && docker-compose exec -T baserow backup > /backups/baserow-$(date +\%Y\%m\%d).bak
```

### Restore

```bash
cd /opt/baserow
docker-compose exec baserow restore /backups/baserow-20260302.bak
```

---

## Next Steps

After Baserow is stable:

1. **Employee Portal:** Build with Softr (2 hours)
2. **Attendance Tracking:** Custom module (1 week)
3. **Shift Scheduling:** Baserow automations (3 days)
4. **Document Management:** Add file upload fields (1 day)

---

## Support

| Issue | Solution |
|-------|----------|
| Login issues | Reset password: docker-compose exec baserow baserow reset_admin_password |
| Slow performance | Increase Docker RAM: 4GB recommended |
| API rate limits | Self-hosted = no limits, check server resources |
| Data export | Baserow → Export as CSV/JSON anytime |

---

**Documentation:** https://baserow.io/docs  
**Community:** https://community.baserow.io  
**GitHub:** https://github.com/bram2w/baserow
