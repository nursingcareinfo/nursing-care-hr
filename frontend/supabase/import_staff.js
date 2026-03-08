/**
 * Staff Import Script
 * Parses master_staff_report.md and imports to Supabase
 * 
 * Usage:
 *   node import_staff.js
 * 
 * Requires:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or passed as args
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse markdown table from master_staff_report.md
function parseStaffData() {
  const filePath = path.join(__dirname, '../../data/master_report/master_staff_report.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.trim().split('\n');
  const staff = [];
  
  // Skip header lines (first 3 lines: title, separator, header row)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse markdown table row
    // Format: | NC-KHI-001 | Atif Ali | No record | ...
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    
    if (cells.length < 8) continue;
    
    const [
      assignedId,
      name,
      fatherHusbandName,
      dateOfBirth,
      gender,
      cnic,
      designation,
      contact1,
      ...rest
    ] = cells;
    
    // Skip "No record" entries where name is missing
    if (!name || name === 'No record') continue;
    
    // Map designation to standard values
    const designationMap = {
      'CEO & Managing Director': 'CEO',
      'Office Coordinator & HR Manager': 'OFFICE_STAFF',
      'Manager': 'MANAGER',
      'Office Boy': 'OFFICE_STAFF',
      'Nurse Assistant': 'NURSE_ASSISTANT',
      'Attendant': 'ATTENDANT',
      'R/N': 'R/N',
      'Mid Wife': 'MID_WIFE',
      'BSN': 'BSN',
      'physiotherapist': 'PHYSIOTHERAPIST',
      'Doctor': 'DOCTOR',
      'Baby Sitter': 'BABY_SITTER',
      'Staff Nurse': 'R/N',
      'Caretaker/Attendant': 'ATTENDANT',
      'Technician': 'TECHNICIAN',
    };
    
    // Map district
    const districtMap = {
      'Karachi (South)': 'Karachi South',
      'Karachi (South)': 'Karachi South',
    };
    
    staff.push({
      assigned_id: assignedId,
      full_name: name,
      father_husband_name: fatherHusbandName === 'No record' ? null : fatherHusbandName,
      date_of_birth: dateOfBirth === 'No record' ? null : dateOfBirth,
      gender: gender === 'No record' ? null : gender,
      cnic: cnic === 'No record' ? null : cnic,
      designation: designationMap[designation] || designation,
      contact_1: contact1 === 'No record' ? null : contact1,
      official_district: rest[0] === 'No record' ? null : (districtMap[rest[0]] || rest[0]),
      status: 'Active'
    });
  }
  
  return staff;
}

// Insert into Supabase
async function importToSupabase(staff) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required');
    console.log('\nUsage:');
    console.log('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node import_staff.js');
    process.exit(1);
  }
  
  console.log(`Importing ${staff.length} staff records to Supabase...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < staff.length; i += batchSize) {
    const batch = staff.slice(i, i + batchSize);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });
    
    if (response.ok) {
      successCount += batch.length;
      console.log(`✓ Imported ${Math.min(i + batchSize, staff.length)}/${staff.length}`);
    } else {
      const error = await response.text();
      errorCount += batch.length;
      errors.push({ batch: i / batchSize + 1, error });
      console.log(`✗ Error importing batch ${i / batchSize + 1}: ${error.substring(0, 100)}`);
    }
  }
  
  console.log(`\n=== Import Complete ===`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  Batch ${e.batch}: ${e.error.substring(0, 80)}`));
  }
  
  return { successCount, errorCount };
}

// Main
async function main() {
  console.log('Parsing staff data from master_staff_report.md...\n');
  const staff = parseStaffData();
  console.log(`Found ${staff.length} staff records\n`);
  
  // Show sample
  console.log('Sample records:');
  staff.slice(0, 3).forEach(s => {
    console.log(`  - ${s.assigned_id}: ${s.full_name} (${s.designation})`);
  });
  console.log();
  
  await importToSupabase(staff);
}

main().catch(console.error);
