/**
 * Migrate Employee Data from Supabase to Baserow
 * NursingCare.pk HR Management System
 * 
 * Usage: node scripts/migrate_to_baserow.js
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load Supabase credentials
const envPath = path.join(__dirname, '../n8n/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)[1].trim();
const SUPABASE_KEY = envContent.match(/SUPABASE_SERVICE_KEY=(.+)/)[1].trim();

// Baserow Configuration
const BASEROW_URL = process.env.BASEROW_URL || 'http://localhost';
const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID || '1';

if (!BASEROW_TOKEN) {
    console.error('Error: BASEROW_TOKEN environment variable is required');
    console.log('Set it with: export BASEROW_TOKEN="your-token-here"');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Field mapping: Supabase → Baserow
const FIELD_MAPPING = {
    'assigned_id': 'assigned_id',
    'name': 'name',
    'father_husband_name': 'father_husband_name',
    'date_of_birth': 'date_of_birth',
    'gender': 'gender',
    'cnic': 'cnic',
    'designation': 'designation',
    'contact_1': 'contact_1',
    'contact_2': 'contact_2',
    'district': 'district',
    'hourly_rate': 'hourly_rate',
    'status': 'status',
    'hire_date': 'hire_date',
    'notes': 'notes'
};

async function fetchFromSupabase() {
    console.log('📥 Fetching data from Supabase...');
    
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('❌ Error fetching from Supabase:', error.message);
        return null;
    }
    
    console.log(`✅ Fetched ${data.length} records from Supabase`);
    return data;
}

async function createInBaserow(employee) {
    const baserowData = {};
    
    // Map fields
    for (const [supabaseField, baserowField] of Object.entries(FIELD_MAPPING)) {
        if (employee[supabaseField] !== null && employee[supabaseField] !== undefined) {
            baserowData[baserowField] = employee[supabaseField];
        }
    }
    
    try {
        const response = await axios.post(
            `${BASEROW_URL}/api/database/rows/table/${BASEROW_TABLE_ID}/`,
            baserowData,
            {
                headers: {
                    'Authorization': `Token ${BASEROW_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return { success: true, id: response.data.id };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.detail || error.message 
        };
    }
}

async function migrate() {
    console.log('🚀 Starting Migration: Supabase → Baserow');
    console.log('===========================================\n');
    
    // Fetch from Supabase
    const employees = await fetchFromSupabase();
    if (!employees || employees.length === 0) {
        console.log('⚠️  No data to migrate');
        return;
    }
    
    // Migrate to Baserow
    console.log('\n📤 Migrating to Baserow...');
    console.log(`Target: ${BASEROW_URL}/table/${BASEROW_TABLE_ID}`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const result = await createInBaserow(employee);
        
        if (result.success) {
            successCount++;
            process.stdout.write(`✓`);
        } else {
            errorCount++;
            errors.push({
                assigned_id: employee.assigned_id,
                name: employee.name,
                error: result.error
            });
            process.stdout.write(`✗`);
        }
        
        // Progress indicator every 50 records
        if ((i + 1) % 50 === 0) {
            console.log(` ${i + 1}/${employees.length}`);
        }
    }
    
    // Summary
    console.log('\n\n===========================================');
    console.log('📊 Migration Summary');
    console.log('===========================================');
    console.log(`Total Records: ${employees.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Success Rate: ${((successCount / employees.length) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
        console.log('\n⚠️  Failed Records:');
        errors.slice(0, 10).forEach(err => {
            console.log(`  - ${err.assigned_id} (${err.name}): ${err.error}`);
        });
        
        if (errors.length > 10) {
            console.log(`  ... and ${errors.length - 10} more`);
        }
        
        // Save errors to file
        const errorFile = path.join(__dirname, '../data/migration_errors.json');
        fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2));
        console.log(`\n💾 Full error list saved to: ${errorFile}`);
    }
    
    console.log('\n✅ Migration Complete!');
    console.log(`\nNext Steps:`);
    console.log(`  1. Verify data in Baserow: ${BASEROW_URL}`);
    console.log(`  2. Check for any failed records`);
    console.log(`  3. Update n8n workflows to use Baserow API`);
    console.log(`  4. Test new employee intake form`);
}

// Run migration
migrate().catch(console.error);
