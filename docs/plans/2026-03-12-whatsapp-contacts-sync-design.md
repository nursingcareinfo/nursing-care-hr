# Google Contacts Sync Design

## Overview
A utility script to export the Supabase `staff` table into a perfectly formatted Google Contacts CSV file. This enables the user to bulk-import and standardize all employee contacts in WhatsApp Web by leveraging Google Contacts sync.

## Goals
- Eradicate messy/duplicate contacts in WhatsApp.
- Give all staff members a standardized naming convention so they are instantly recognizable.
- Make contacts highly searchable by role and location.

## Data Source
- The script will query the Supabase `staff` table.
- We will fetch: `name`, `designation`, `district`, `contact_1`, `contact_2`, `status`, and `assigned_id`.

## Formatting Rules
- **Display Name (First Name column in Google Contacts):** 
  `[Name] - [Designation] - [District]`
  *Example:* `Saiman Masih - Attendant - Karachi South`
- **Phone Numbers:** 
  All phone numbers (`contact_1` and `contact_2`) will be strictly formatted to include the `+92` country code, stripping out dashes and spaces to ensure WhatsApp recognizes them immediately.
- **Notes Field:** 
  The contact notes will contain metadata for HR tracking:
  ```
  Status: [Active/Inactive]
  Assigned ID: [NC-001]
  HR Manager Home Nursing Care
  ```

## Output
- A file named `google_contacts_import.csv` generated in a new `data/exports/` directory.
- The CSV headers will strictly follow the Google Contacts import template (e.g., `Given Name`, `Phone 1 - Type`, `Phone 1 - Value`, `Notes`).

## Error Handling
- Invalid phone numbers or records missing names will be skipped with a warning logged to the console.
- If Supabase connection fails, the script will exit gracefully with an error message.

## Usage Workflow
1. Run the script: `node scripts/export_google_contacts.js`
2. Retrieve the generated `data/exports/google_contacts_import.csv` file.
3. User navigates to contacts.google.com (making sure they are logged into the account their phone uses).
4. User clicks "Import" and uploads the CSV.
5. Google Contacts merges duplicates automatically, and the phone syncs the updated names to WhatsApp.
