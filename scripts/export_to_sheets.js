/**
 * Sheets Exporter - Incremental Export
 * Parses master_staff_report.md and sends only NEW records to Google Sheets.
 * Tracks exported IDs to prevent duplicates.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env
require('dotenv').config();

const REPORT_PATH = path.join(__dirname, '../data/master_report/master_staff_report.md');
const STATE_FILE = path.join(__dirname, '../data/.export_state.json');
const ENDPOINT_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL;

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

function saveExportedIds(ids) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify({
            exportedIds: Array.from(ids),
            lastExport: new Date().toISOString()
        }, null, 2));
    } catch (error) {
        console.error('Failed to save export state:', error.message);
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
            assignedId: cols[0],
            name: cols[1],
            fatherHusbandName: cols[2] === 'No record' ? '' : cols[2],
            dob: cols[3] === 'No record' ? '' : cols[3],
            gender: cols[4] === 'No record' ? '' : cols[4],
            cnic: cols[5] === 'No record' ? '' : cols[5],
            designation: cols[6] === 'No record' ? '' : cols[6],
            contact1: cols[7] === 'No record' ? '' : cols[7],
            district: cols[8] === 'No record' ? '' : cols[8]
        };
    });
}

async function exportData() {
    if (!ENDPOINT_URL) {
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

        const BATCH_SIZE = 50;
        let successCount = 0;

        for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
            const batch = newRecords.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(newRecords.length / BATCH_SIZE);

            console.log(`Sending batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

            const response = await fetch(ENDPOINT_URL, {
                method: 'POST',
                body: JSON.stringify(batch),
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow'
            });

            const result = await response.text();
            console.log(`Batch ${batchNum} response:`, result);
            successCount += batch.length;
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

function resetState() {
    if (fs.existsSync(STATE_FILE)) {
        fs.unlinkSync(STATE_FILE);
        console.log('Export state reset. All records will be re-exported on next run.');
    } else {
        console.log('No export state file found.');
    }
}

const args = process.argv.slice(2);
if (args[0] === '--reset') {
    resetState();
} else if (args[0] === '--status') {
    const exportedIds = loadExportedIds();
    const allRecords = parseStaffReport();
    console.log(`Exported: ${exportedIds.size} / ${allRecords.length} records`);
    console.log('Missing IDs:', allRecords.filter(r => !exportedIds.has(r.assignedId)).map(r => r.assignedId).join(', '));
} else {
    exportData();
}
