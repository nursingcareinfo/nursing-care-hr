/**
 * Sheets Exporter - Incremental Export
 * Parses master_staff_report.md and sends only NEW records to Google Sheets.
 * Tracks exported IDs to prevent duplicates.
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Configuration constants
const CONFIG = {
    REPORT_PATH: path.join(__dirname, '../data/master_report/master_staff_report.md'),
    STATE_FILE: path.join(__dirname, '../data/.export_state.json'),
    BATCH_SIZE: 50,
    ENDPOINT_URL: process.env.GOOGLE_SHEETS_WEB_APP_URL
};

/**
 * Loads previously exported record IDs from state file.
 * @returns {Set<string>} - Set of exported record IDs.
 */
function loadExportedIds() {
    try {
        if (fs.existsSync(CONFIG.STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
            return new Set(data.exportedIds || []);
        }
    } catch (error) {
        console.warn('Could not load export state:', error.message);
    }
    return new Set();
}

/**
 * Saves exported record IDs to state file.
 * @param {Set<string>} ids - Set of exported record IDs.
 */
function saveExportedIds(ids) {
    try {
        const stateData = {
            exportedIds: Array.from(ids),
            lastExport: new Date().toISOString()
        };
        fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(stateData, null, 2));
    } catch (error) {
        console.error('Failed to save export state:', error.message);
    }
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
            assignedId: columns[0],
            name: columns[1],
            fatherHusbandName: columns[2] === 'No record' ? '' : columns[2],
            dob: columns[3] === 'No record' ? '' : columns[3],
            gender: columns[4] === 'No record' ? '' : columns[4],
            cnic: columns[5] === 'No record' ? '' : columns[5],
            designation: columns[6] === 'No record' ? '' : columns[6],
            contact1: columns[7] === 'No record' ? '' : columns[7],
            district: columns[8] === 'No record' ? '' : columns[8]
        };
    });
}

/**
 * Exports a batch of records to Google Sheets.
 * @param {Array<Object>} batch - Records to export.
 * @param {number} batchNumber - Current batch number.
 * @param {number} totalBatches - Total number of batches.
 * @returns {Promise<boolean>} - Success status.
 */
async function exportBatch(batch, batchNumber, totalBatches) {
    try {
        console.log(`Sending batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

        const response = await fetch(CONFIG.ENDPOINT_URL, {
            method: 'POST',
            body: JSON.stringify(batch),
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow'
        });

        const result = await response.text();
        console.log(`Batch ${batchNumber} response:`, result);
        return true;
    } catch (error) {
        console.error(`Batch ${batchNumber} failed:`, error.message);
        return false;
    }
}

/**
 * Main export function - exports new records to Google Sheets.
 */
async function exportData() {
    if (!CONFIG.ENDPOINT_URL) {
        console.error('Error: GOOGLE_SHEETS_WEB_APP_URL environment variable is not set.');
        console.log('Set it with: export GOOGLE_SHEETS_WEB_APP_URL="https://..."');
        process.exit(1);
    }

    try {
        const exportedIds = loadExportedIds();
        console.log(`Previously exported: ${exportedIds.size} records`);

        const allRecords = parseStaffReport();
        console.log(`Total records in report: ${allRecords.length}`);

        const newRecords = allRecords.filter(record => !exportedIds.has(record.assignedId));

        if (newRecords.length === 0) {
            console.log('No new records to export.');
            return;
        }

        console.log(`New records to export: ${newRecords.length}`);

        let successCount = 0;
        const totalBatches = Math.ceil(newRecords.length / CONFIG.BATCH_SIZE);

        for (let i = 0; i < newRecords.length; i += CONFIG.BATCH_SIZE) {
            const batch = newRecords.slice(i, i + CONFIG.BATCH_SIZE);
            const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;

            const success = await exportBatch(batch, batchNumber, totalBatches);
            if (success) {
                successCount += batch.length;
            }
        }

        newRecords.forEach(record => exportedIds.add(record.assignedId));
        saveExportedIds(exportedIds);

        console.log(`\nExport complete! ${successCount} new records sent to Google Sheets.`);
        console.log(`Total exported (cumulative): ${exportedIds.size}`);

    } catch (error) {
        console.error('Export failed:', error.message);
        process.exit(1);
    }
}

/**
 * Resets export state - all records will be re-exported on next run.
 */
function resetState() {
    try {
        if (fs.existsSync(CONFIG.STATE_FILE)) {
            fs.unlinkSync(CONFIG.STATE_FILE);
            console.log('Export state reset. All records will be re-exported on next run.');
        } else {
            console.log('No export state file found.');
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
        const exportedIds = loadExportedIds();
        const allRecords = parseStaffReport();
        const missingRecords = allRecords.filter(record => !exportedIds.has(record.assignedId));

        console.log(`Exported: ${exportedIds.size} / ${allRecords.length} records`);
        console.log('Missing IDs:', missingRecords.map(record => record.assignedId).join(', '));
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
