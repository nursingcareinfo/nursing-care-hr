/**
 * Patient Import Script
 * Creates sample patient data for Supabase
 * 
 * Usage:
 *   node import_patients.js
 * 
 * Requires:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or passed as args
 */

const fs = require('fs');
const path = require('path');

// Sample patient data for home nursing care
function generateSamplePatients() {
  const patients = [
    {
      patient_id: 'PT-KHI-001',
      full_name: 'Ahmad Hassan',
      date_of_birth: '1958-03-15',
      gender: 'Male',
      cnic: '42301-1234567-1',
      phone_1: '+92-300-1234567',
      phone_2: '+92-21-1234567',
      address: 'House 45, Block 5, Clifton, Karachi',
      district: 'Karachi South',
      care_type: 'ICU',
      care_level: 'High',
      billing_category: 'Private',
      hourly_rate: 1500,
      start_date: '2025-01-15',
      notes: 'Post-cardiac surgery, requires 24/7 monitoring',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-002',
      full_name: 'Fatima Begum',
      date_of_birth: '1965-07-22',
      gender: 'Female',
      cnic: '42301-2345678-2',
      phone_1: '+92-300-2345678',
      phone_2: null,
      address: 'Flat 12, Sea View Apartments, Karachi',
      district: 'Karachi South',
      care_type: 'Elderly',
      care_level: 'Medium',
      billing_category: 'Insurance',
      hourly_rate: 800,
      start_date: '2025-02-01',
      notes: 'Elderly patient with mobility issues',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-003',
      full_name: 'Muhammad Ali',
      date_of_birth: '1975-11-08',
      gender: 'Male',
      cnic: '42301-3456789-3',
      phone_1: '+92-300-3456789',
      phone_2: '+92-21-3456789',
      address: 'House 78, Phase 2, DHA, Karachi',
      district: 'Karachi South',
      care_type: 'Post-surgical',
      care_level: 'High',
      billing_category: 'Private',
      hourly_rate: 1200,
      start_date: '2025-02-10',
      notes: 'Post-knee replacement surgery, needs physiotherapy',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-004',
      full_name: 'Aisha Khan',
      date_of_birth: '2020-05-12',
      gender: 'Female',
      cnic: null,
      phone_1: '+92-300-4567890',
      phone_2: null,
      address: 'House 23, Gulberg, Lahore',
      district: 'Lahore',
      care_type: 'Pediatric',
      care_level: 'High',
      billing_category: 'Private',
      hourly_rate: 1000,
      start_date: '2025-01-20',
      notes: 'Special needs child, requires specialized care',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-005',
      full_name: 'Rehana Akhtar',
      date_of_birth: '1990-09-30',
      gender: 'Female',
      cnic: '42301-5678901-5',
      phone_1: '+92-300-5678901',
      phone_2: null,
      address: 'Flat 5, Model Town, Karachi',
      district: 'Karachi South',
      care_type: 'Mother & Baby',
      care_level: 'Medium',
      billing_category: 'Private',
      hourly_rate: 900,
      start_date: '2025-02-15',
      notes: 'Post-delivery mother with newborn twins',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-006',
      full_name: 'Abdul Razzaq',
      date_of_birth: '1952-12-03',
      gender: 'Male',
      cnic: '42301-6789012-6',
      phone_1: '+92-300-6789012',
      phone_2: '+92-21-6789012',
      address: 'House 34, PECHS, Karachi',
      district: 'Karachi South',
      care_type: 'Elderly',
      care_level: 'Low',
      billing_category: 'Government',
      hourly_rate: 600,
      start_date: '2025-01-05',
      notes: 'Elderly, requires assistance with daily activities',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-007',
      full_name: 'Sanaullah',
      date_of_birth: '1985-02-18',
      gender: 'Male',
      cnic: '42301-7890123-7',
      phone_1: '+92-300-7890123',
      phone_2: null,
      address: 'House 12, Lyari, Karachi',
      district: 'Karachi South',
      care_type: 'General',
      care_level: 'Low',
      billing_category: 'Private',
      hourly_rate: 500,
      start_date: '2025-02-20',
      notes: 'General patient recovery',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-008',
      full_name: 'Zainab Bibi',
      date_of_birth: '1970-06-25',
      gender: 'Female',
      cnic: '42301-8901234-8',
      phone_1: '+92-300-8901234',
      phone_2: '+92-42-8901234',
      address: 'House 56, Cantt, Lahore',
      district: 'Lahore',
      care_type: 'ICU',
      care_level: 'High',
      billing_category: 'Insurance',
      hourly_rate: 1800,
      start_date: '2025-02-05',
      notes: 'Critical condition, ventilator dependent',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-009',
      full_name: 'Imran Khan',
      date_of_birth: '1962-08-14',
      gender: 'Male',
      cnic: '42301-9012345-9',
      phone_1: '+92-300-9012345',
      phone_2: null,
      address: 'Flat 8, University Road, Karachi',
      district: 'Karachi South',
      care_type: 'Post-surgical',
      care_level: 'Medium',
      billing_category: 'Private',
      hourly_rate: 1000,
      start_date: '2025-01-25',
      notes: 'Post-abdominal surgery recovery',
      status: 'Active'
    },
    {
      patient_id: 'PT-KHI-010',
      full_name: 'Amna Malik',
      date_of_birth: '2015-03-09',
      gender: 'Female',
      cnic: null,
      phone_1: '+92-300-0123456',
      phone_2: null,
      address: 'House 67, F-6/2, Islamabad',
      district: 'Islamabad',
      care_type: 'Pediatric',
      care_level: 'Medium',
      billing_category: 'Private',
      hourly_rate: 850,
      start_date: '2025-02-12',
      notes: 'Child with chronic illness requiring daily care',
      status: 'Active'
    }
  ];
  
  return patients;
}

// Insert into Supabase
async function importToSupabase(patients) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required');
    console.log('\nUsage:');
    console.log('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node import_patients.js');
    process.exit(1);
  }
  
  console.log(`Importing ${patients.length} patient records to Supabase...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/patients`, {
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
      console.log(`✓ Imported ${Math.min(i + batchSize, patients.length)}/${patients.length}`);
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
  console.log('Generating sample patient data...\n');
  const patients = generateSamplePatients();
  console.log(`Generated ${patients.length} sample patient records\n`);
  
  // Show sample
  console.log('Sample records:');
  patients.slice(0, 3).forEach(p => {
    console.log(`  - ${p.patient_id}: ${p.full_name} (${p.care_type})`);
  });
  console.log();
  
  await importToSupabase(patients);
}

main().catch(console.error);
