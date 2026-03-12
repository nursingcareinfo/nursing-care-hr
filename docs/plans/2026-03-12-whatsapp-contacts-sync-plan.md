# Google Contacts Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a Node.js script that reads the Supabase `staff` table and generates a correctly formatted CSV for Google Contacts import, enabling bulk update and standardization of WhatsApp contacts.

**Architecture:** A standalone CommonJS Node.js script inside the `scripts/` directory that uses the Supabase JS client to fetch records, formats them according to Google Contacts CSV specification, and writes the output file using the `csv-writer` and `fs` modules.

**Tech Stack:** 
- Node.js
- Supabase JS Client (`@supabase/supabase-js`)
- CSV Writer (`csv-writer`)

---

### Task 1: Setup Dependencies and Directory

**Files:**
- Modify: `package.json`
- Create: `data/exports/.gitkeep`

**Step 1: Install dependencies**

Run: `npm install csv-writer`
Expected: `csv-writer` added to package.json

**Step 2: Create exports directory**

Run: `mkdir -p data/exports && touch data/exports/.gitkeep`
Expected: Directory exists

**Step 3: Update .gitignore**

Run: `echo "\ndata/exports/*.csv" >> .gitignore`
Expected: .csv files in exports folder are ignored so we don't commit PII.

**Step 4: Commit setup**

```bash
git add package.json package-lock.json data/exports/.gitkeep .gitignore
git commit -m "chore: setup dependencies and directories for google contacts export"
```

---

### Task 2: Create the Export Script

**Files:**
- Create: `scripts/export_google_contacts.js`

**Step 1: Create the script file**

```javascript
/**
 * Export Supabase Staff Records to Google Contacts CSV
 * Usage: node scripts/export_google_contacts.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createObjectCsvWriter } = require('csv-writer');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Supabase credentials missing in environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const OUTPUT_PATH = path.join(__dirname, '../data/exports/google_contacts_import.csv');

// Format phone number to ensure +92 country code and remove spaces/dashes
function formatPhone(phone) {
    if (!phone) return '';
    let cleanPhone = phone.replace(/[\s-]/g, '');
    
    // If it starts with 03, replace 0 with +92
    if (cleanPhone.startsWith('03')) {
        cleanPhone = '+92' + cleanPhone.substring(1);
    } 
    // If it starts with 3, prepend +92
    else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
        cleanPhone = '+92' + cleanPhone;
    }
    // If it starts with 92, prepend +
    else if (cleanPhone.startsWith('92')) {
        cleanPhone = '+' + cleanPhone;
    }
    
    return cleanPhone;
}

async function exportContacts() {
    console.log('Fetching staff records from Supabase...');
    
    const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
        
    if (error) {
        console.error('Error fetching data:', error.message);
        process.exit(1);
    }
    
    if (!staff || staff.length === 0) {
        console.log('No staff records found.');
        return;
    }
    
    console.log(`Found ${staff.length} staff records. Formatting for Google Contacts...`);
    
    const csvWriter = createObjectCsvWriter({
        path: OUTPUT_PATH,
        header: [
            { id: 'givenName', title: 'Given Name' },
            { id: 'notes', title: 'Notes' },
            { id: 'phone1Type', title: 'Phone 1 - Type' },
            { id: 'phone1Value', title: 'Phone 1 - Value' },
            { id: 'phone2Type', title: 'Phone 2 - Type' },
            { id: 'phone2Value', title: 'Phone 2 - Value' }
        ]
    });
    
    const records = staff.map(person => {
        // Construct display name: Name - Designation - District
        const parts = [person.name];
        if (person.designation) parts.push(person.designation);
        if (person.district) parts.push(person.district);
        const displayName = parts.join(' - ');
        
        // Construct notes
        const notes = [
            `Status: ${person.status || 'Unknown'}`,
            `Assigned ID: ${person.assigned_id || 'None'}`,
            `HR Manager Home Nursing Care`
        ].join('\n');
        
        return {
            givenName: displayName,
            notes: notes,
            phone1Type: 'Mobile',
            phone1Value: formatPhone(person.contact_1),
            phone2Type: person.contact_2 ? 'Other' : '',
            phone2Value: formatPhone(person.contact_2)
        };
    });
    
    await csvWriter.writeRecords(records);
    console.log(`\n✅ Success! Google Contacts CSV generated at: ${OUTPUT_PATH}`);
    console.log('\nNext Steps:');
    console.log('1. Go to https://contacts.google.com/');
    console.log('2. Make sure you are logged into the Google Account on your phone');
    console.log('3. Click "Import" on the left sidebar and upload the CSV');
}

exportContacts().catch(console.error);
```

**Step 2: Add package.json script shortcut**

Modify `package.json` to add `"export:contacts": "node scripts/export_google_contacts.js"` to the `scripts` object.

**Step 3: Test execution**

Run: `npm run export:contacts`
Expected: Output showing records fetched and CSV generated.

**Step 4: Verify output**

Run: `head -n 5 data/exports/google_contacts_import.csv`
Expected: Headers matching Google format, and correctly formatted phone numbers.

**Step 5: Commit**

```bash
git add scripts/export_google_contacts.js package.json
git commit -m "feat: add script to generate google contacts csv"
```
