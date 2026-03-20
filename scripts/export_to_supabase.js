/**
 * Supabase Exporter - Incremental Export
 * Parses master_staff_report.md and sends only NEW records to Supabase.
 * Tracks exported IDs to prevent duplicates.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration constants
const CONFIG = {
    REPORT_PATH: path.join(__dirname, '../data/master_report/master_staff_report.md'),
    STATE_FILE: path.join(__dirname, '../data/.export_state.json'),
    SUPABASE_STATE_FILE: path.join(__dirname, '../data/.supabase_export_state.json'),
    ENV_PATH: path.join(__dirname, '../n8n/.env'),
    BATCH_SIZE: 100,
    TABLE_NAME: 'staff'
};

/**
 * Loads Supabase credentials from environment file.
 * @returns {{url: string, key: string}} - Supabase credentials.
 */
function loadSupabaseCredentials() {
    try {
        const envContent = fs.readFileSync(CONFIG.ENV_PATH, 'utf8');
        const envVars = {};

        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });

        const url = envVars.SUPABASE_URL;
        const key = envVars.SUPABASE_SERVICE_KEY;

        if (!url || !key) {
            console.error('Error: Supabase credentials not found in n8n/.env');
            process.exit(1);
        }

        return { url, key };
    } catch (error) {
        console.error('Failed to load Supabase credentials:', error.message);
        process.exit(1);
    }
}

const { url: SUPABASE_URL, key: SUPABASE_SERVICE_KEY } = loadSupabaseCredentials();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Loads previously exported record IDs from state file.
 * @param {string} stateFile - Path to state file.
 * @returns {Set<string>} - Set of exported record IDs.
 */
function loadExportedIds(stateFile) {
    try {
        if (fs.existsSync(stateFile)) {
            const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            return new Set(data.exportedIds || []);
        }
    } catch (error) {
        console.warn(`Could not load export state from ${stateFile}:`, error.message);
    }
    return new Set();
}

/**
 * Saves exported record IDs to state file.
 * @param {Set<string>} ids - Set of exported record IDs.
 * @param {string} stateFile - Path to state file.
 */
function saveExportedIds(ids, stateFile) {
    try {
        const stateData = {
            exportedIds: Array.from(ids),
            lastExport: new Date().toISOString()
        };
        fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
    } catch (error) {
        console.error(`Failed to save export state to ${stateFile}:`, error.message);
    }
}

/**
 * Converts various date formats to PostgreSQL YYYY-MM-DD format.
 * Handles: DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY
 * @param {string} dateStr - Date string to normalize.
 * @returns {string|null} - Normalized date or null if invalid.
 */
function normalizeDate(dateStr) {
    if (!dateStr || dateStr === 'No record' || dateStr === '') {
        return null;
    }

    let day, month, year;

    if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            [day, month, year] = parts;
        }
    } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            [day, month, year] = parts;
        }
    } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            [day, month, year] = parts;
        }
    }

    if (day && month && year) {
        day = day.padStart(2, '0');
        month = month.padStart(2, '0');
        if (year.length === 2) {
            year = (parseInt(year, 10) > 50) ? '19' + year : '20' + year;
        }
        return `${year}-${month}-${day}`;
    }

    return null;
}

/**
 * Parses staff report markdown file into structured records.
 * @returns {Array<Object>} - Array of parsed staff records.
 */
function parseStaffReport() {
    const content = fs.readFileSync(CONFIG.REPORT_PATH, 'utf8');
    const lines = content.split('\n').filter(line =>
        line.trim() &&
        line.includes('|') &&
        !line.includes('---') &&
        !line.includes('Assigned ID')
    );

    return lines.map(line => {
        const columns = line.split('|').map(column => column.trim()).filter(Boolean);
        return {
            assigned_id: columns[0],
            name: columns[1],
            father_husband_name: columns[2] === 'No record' ? null : columns[2],
            date_of_birth: normalizeDate(columns[3]),
            gender: columns[4] === 'No record' ? null : columns[4],
            cnic: columns[5] === 'No record' ? null : columns[5],
            designation: columns[6] === 'No record' ? null : columns[6],
            contact_1: columns[7] === 'No record' ? null : columns[7],
            district: columns[8] === 'No record' ? null : columns[8]
        };
    });
}

/**
 * Checks if staff table is accessible in Supabase.
 * @returns {Promise<boolean>} - True if table is accessible.
 */
async function checkStaffTable() {
    try {
        const { data, error } = await supabase
            .from(CONFIG.TABLE_NAME)
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

/**
 * Exports a batch of records to Supabase.
 * @param {Array<Object>} batch - Records to export.
 * @param {number} batchNumber - Current batch number.
 * @param {number} totalBatches - Total number of batches.
 * @returns {Promise<{success: number, error: number}>} - Success/error counts.
 */
async function exportBatch(batch, batchNumber, totalBatches) {
    console.log(`Sending batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

    const { data, error } = await supabase
        .from(CONFIG.TABLE_NAME)
        .upsert(batch, { onConflict: 'assigned_id', ignoreDuplicates: false })
        .select();

    if (error) {
        console.error(`Batch ${batchNumber} error:`, error.message);
        return { success: 0, error: batch.length };
    }

    console.log(`Batch ${batchNumber} success: ${data.length} records upserted`);
    return { success: data.length, error: 0 };
}

/**
 * Main export function - exports new records to Supabase.
 */
async function exportData() {
    try {
        console.log('Connected to Supabase:', SUPABASE_URL);

        await checkStaffTable();

        const exportedIds = loadExportedIds(CONFIG.SUPABASE_STATE_FILE);
        console.log(`Previously exported to Supabase: ${exportedIds.size} records`);

        const allRecords = parseStaffReport();
        console.log(`Total records in report: ${allRecords.length}`);

        const newRecords = allRecords.filter(record => !exportedIds.has(record.assigned_id));

        if (newRecords.length === 0) {
            console.log('No new records to export to Supabase.');
            return;
        }

        console.log(`New records to export to Supabase: ${newRecords.length}`);

        let successCount = 0;
        let errorCount = 0;
        const totalBatches = Math.ceil(newRecords.length / CONFIG.BATCH_SIZE);

        for (let i = 0; i < newRecords.length; i += CONFIG.BATCH_SIZE) {
            const batch = newRecords.slice(i, i + CONFIG.BATCH_SIZE);
            const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;

            const result = await exportBatch(batch, batchNumber, totalBatches);
            successCount += result.success;
            errorCount += result.error;
        }

        newRecords.forEach(record => exportedIds.add(record.assigned_id));
        saveExportedIds(exportedIds, CONFIG.SUPABASE_STATE_FILE);

        console.log('\nExport complete!');
        console.log(`  - ${successCount} records successfully exported`);
        console.log(`  - ${errorCount} records failed`);
        console.log(`  - Total exported to Supabase (cumulative): ${exportedIds.size}`);

    } catch (error) {
        console.error('Supabase export failed:', error.message);
        process.exit(1);
    }
}

/**
 * Resets export state - all records will be re-exported on next run.
 */
function resetState() {
    try {
        if (fs.existsSync(CONFIG.SUPABASE_STATE_FILE)) {
            fs.unlinkSync(CONFIG.SUPABASE_STATE_FILE);
            console.log('Supabase export state reset. All records will be re-exported on next run.');
        } else {
            console.log('No Supabase export state file found.');
        }
    } catch (error) {
        console.error('Failed to reset export state:', error.message);
    }
}

/**
 * Shows current export status.
 */
function showStatus() {
    try {
        const exportedIds = loadExportedIds(CONFIG.SUPABASE_STATE_FILE);
        const allRecords = parseStaffReport();
        const missingCount = allRecords.length - exportedIds.size;

        console.log('Supabase Export Status:');
        console.log(`  Exported: ${exportedIds.size} / ${allRecords.length} records`);
        console.log(`  Missing: ${missingCount} records`);

        if (missingCount > 0) {
            const missingRecords = allRecords.filter(record => !exportedIds.has(record.assigned_id));
            const missingIds = missingRecords.slice(0, 20).map(record => record.assigned_id).join(', ');
            const truncated = missingRecords.length > 20 ? '...' : '';
            console.log(`  Missing IDs: ${missingIds}${truncated}`);
        }
    } catch (error) {
        console.error('Failed to get export status:', error.message);
    }
}

// CLI argument handling
const args = process.argv.slice(2);
if (args[0] === '--reset') {
    resetState();
} else if (args[0] === '--status') {
    showStatus();
} else {
    exportData();
}
