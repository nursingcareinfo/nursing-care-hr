/**
 * Supabase Exporter - Incremental Export
 * Parses master_staff_report.md and sends only NEW records to Supabase.
 * Tracks exported IDs to prevent duplicates.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORT_PATH = path.join(__dirname, '../data/master_report/master_staff_report.md');
const STATE_FILE = path.join(__dirname, '../data/.export_state.json');
const SUPABASE_STATE_FILE = path.join(__dirname, '../data/.supabase_export_state.json');

// Load credentials from n8n/.env
const envPath = path.join(__dirname, '../n8n/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Supabase credentials not found in n8n/.env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function loadExportedIds() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            return new Set(data.exportedIds || []);
        }
    } catch (error) {
        console.warn('Could not load export state:', error.message);
    }
    return new Set();
}

function loadSupabaseExportedIds() {
    try {
        if (fs.existsSync(SUPABASE_STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(SUPABASE_STATE_FILE, 'utf8'));
            return new Set(data.exportedIds || []);
        }
    } catch (error) {
        console.warn('Could not load Supabase export state:', error.message);
    }
    return new Set();
}

function saveSupabaseExportedIds(ids) {
    try {
        fs.writeFileSync(SUPABASE_STATE_FILE, JSON.stringify({
            exportedIds: Array.from(ids),
            lastExport: new Date().toISOString()
        }, null, 2));
    } catch (error) {
        console.error('Failed to save Supabase export state:', error.message);
    }
}

function parseStaffReport() {
    const content = fs.readFileSync(REPORT_PATH, 'utf8');
    const lines = content.split('\n').filter(line =>
        line.trim() &&
        line.includes('|') &&
        !line.includes('---') &&
        !line.includes('Assigned ID')
    );

    return lines.map(line => {
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        return {
            assigned_id: cols[0],
            name: cols[1],
            father_husband_name: cols[2] === 'No record' ? null : cols[2],
            date_of_birth: cols[3] === 'No record' || cols[3] === '' ? null : cols[3],
            gender: cols[4] === 'No record' ? null : cols[4],
            cnic: cols[5] === 'No record' ? null : cols[5],
            designation: cols[6] === 'No record' ? null : cols[6],
            contact_1: cols[7] === 'No record' ? null : cols[7],
            district: cols[8] === 'No record' ? null : cols[8]
        };
    });
}

async function checkStaffTable() {
    // Check if the staff table exists and is accessible
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('id', { count: 'exact', head: true });
        
        if (error) {
            console.log('Warning: Could not access staff table:', error.message);
            return false;
        }
        console.log('Staff table is accessible');
        return true;
    } catch (error) {
        console.log('Warning: Could not verify staff table. Ensure it exists in Supabase.');
        return false;
    }
}

async function exportData() {
    try {
        console.log('Connected to Supabase:', SUPABASE_URL);
        
        // Check if staff table is accessible
        await checkStaffTable();

        const exportedIds = loadSupabaseExportedIds();
        console.log(`Previously exported to Supabase: ${exportedIds.size} records`);

        const allRecords = parseStaffReport();
        console.log(`Total records in report: ${allRecords.length}`);

        const newRecords = allRecords.filter(record => !exportedIds.has(record.assigned_id));

        if (newRecords.length === 0) {
            console.log('No new records to export to Supabase.');
            return;
        }

        console.log(`New records to export to Supabase: ${newRecords.length}`);

        const BATCH_SIZE = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
            const batch = newRecords.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(newRecords.length / BATCH_SIZE);

            console.log(`Sending batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

            // Use upsert to handle duplicates gracefully
            const { data, error } = await supabase
                .from('staff')
                .upsert(batch, { onConflict: 'assigned_id', ignoreDuplicates: false })
                .select();

            if (error) {
                console.error(`Batch ${batchNum} error:`, error.message);
                errorCount += batch.length;
            } else {
                console.log(`Batch ${batchNum} success: ${data.length} records upserted`);
                successCount += data.length;
            }
        }

        newRecords.forEach(record => exportedIds.add(record.assigned_id));
        saveSupabaseExportedIds(exportedIds);

        console.log(`\nExport complete!`);
        console.log(`  - ${successCount} records successfully exported`);
        console.log(`  - ${errorCount} records failed`);
        console.log(`  - Total exported to Supabase (cumulative): ${exportedIds.size}`);

    } catch (error) {
        console.error('Supabase export failed:', error.message);
        process.exit(1);
    }
}

function resetState() {
    if (fs.existsSync(SUPABASE_STATE_FILE)) {
        fs.unlinkSync(SUPABASE_STATE_FILE);
        console.log('Supabase export state reset. All records will be re-exported on next run.');
    } else {
        console.log('No Supabase export state file found.');
    }
}

function showStatus() {
    const exportedIds = loadSupabaseExportedIds();
    const allRecords = parseStaffReport();
    console.log(`Supabase Export Status:`);
    console.log(`  Exported: ${exportedIds.size} / ${allRecords.length} records`);
    console.log(`  Missing: ${allRecords.length - exportedIds.size} records`);
    
    if (exportedIds.size < allRecords.length) {
        const missing = allRecords.filter(r => !exportedIds.has(r.assigned_id));
        console.log(`  Missing IDs: ${missing.slice(0, 20).map(r => r.assigned_id).join(', ')}${missing.length > 20 ? '...' : ''}`);
    }
}

const args = process.argv.slice(2);
if (args[0] === '--reset') {
    resetState();
} else if (args[0] === '--status') {
    showStatus();
} else {
    exportData();
}
