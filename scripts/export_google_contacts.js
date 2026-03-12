/**
 * Export Supabase Staff Records to Google Contacts CSV
 * Usage: node scripts/export_google_contacts.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createObjectCsvWriter } = require('csv-writer');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ifvqnxcsjdvfpmmzuwlx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdnFueGNzamR2ZnBtbXp1d2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwNDkwNywiZXhwIjoyMDg3NzgwOTA3fQ.EXrvcHU2aqabHTk_UCpz8RNwh-sn_x17ZE9eM8LyQjw';

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