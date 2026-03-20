---
status: planned
created: 2026-03-01
priority: high
tags:
- integration
- google-sheets
- automation
created_at: 2026-03-01T12:31:52.829198966Z
updated_at: 2026-03-01T12:31:52.829198966Z
---
# Google Sheets Staff Export Automation

## Overview

Automate staff data export from the HR management system to Google Sheets using Google Apps Script (GAS). The GAS will function as a free, self-hosted API endpoint that accepts JSON data from external tools (n8n, local scripts) and imports it into a Google Sheet with duplicate prevention.

**Status**: Already implemented in `scripts/AppsScript.gs` - needs review for CNIC-based duplicate checking

## Design

### Architecture

- **Data Source**: Cleaned staff data from `scripts/data_validator.js` (282 staff members)
- **Transport**: n8n HTTP Request node → Google Apps Script Web App URL
- **Destination**: Google Sheet with standardized headers
- **Duplicate Prevention**: CNIC-based check before inserting new rows

### Google Apps Script Functions

1. `setupStaffSheet()` - Initialize sheet with standardized headers
2. `doPost(e)` - Handle incoming JSON POST requests

### Data Fields

| Field | Type | Notes |
|-------|------|-------|
| Assigned ID | string | NC-KHI-XXX format |
| Name | string | Staff full name |
| Father's/Husband's Name | string | "No record" if missing |
| Date of Birth | string | "No record" if missing |
| Gender | string | |
| CNIC | string | XXXXX-XXXXXXX-X format (unique key) |
| Designation | string | |
| Contact 1 | string | Leading zero preserved |
| Official District | string | |

### Duplicate Logic

- CNIC is the primary unique identifier
- If CNIC exists in sheet → skip entry
- If CNIC is "No record" → allow but check Name

## Plan

- [x] GAS already exists in `scripts/AppsScript.gs` with doPost() handler
- [x] Enhanced with CNIC-based duplicate checking
- [x] Added phone number auto-formatting (03XX-XXXXXXX)
- [x] Added "No record" placeholder handling
- [ ] Document deployment steps (Web App configuration)
- [ ] Create n8n workflow HTTP node configuration
- [ ] Test with sample data

## Test

- [ ] Verify sheet headers are correctly formatted
- [ ] Verify duplicate CNIC entries are skipped
- [ ] Verify "No record" CNICs are handled correctly
- [ ] Verify leading zeros in phone numbers are preserved
- [ ] Verify n8n can successfully POST data to Web App URL