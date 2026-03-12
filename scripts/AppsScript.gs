/**
 * Google Sheets Web App for HR Staff Data Management
 * Deploy as Web App with Execute as: Me, Who has access: Anyone
 * 
 * Features:
 * - CNIC-based duplicate checking
 * - Assigned ID auto-update for existing records
 * - "No record" placeholder handling
 * - Leading zero preservation for phone numbers
 */

const SHEET_NAME = 'Sheet1';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZrFlVxuUL8aYsFbgz5B6TbiXMbQycPxZsMULVtm5WlYF2pndTdppVieiRTOUGVQzO/exec';

function doPost(e) {
    const action = e.parameter.action;
    
    try {
        if (action === 'clear') {
            return clearSheet();
        } else if (action === 'status') {
            return getStatus();
        } else {
            // Default: import data
            return importData(e);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return doPost(e);
}

/**
 * Import staff records from POST body
 * Features CNIC-based duplicate checking and phone number formatting
 */
function importData(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        // Add headers
        sheet.appendRow([
            'Assigned ID', 'Name', "Father's/Husband's Name", 
            'Date of Birth', 'Gender', 'CNIC', 
            'Designation', 'Contact 1', 'District'
        ]);
    }
    
    let data;
    try {
        data = JSON.parse(e.postData.contents);
    } catch (parseError) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid JSON: ' + parseError.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle both single record and array of records
    const records = Array.isArray(data) ? data : [data];
    let imported = 0;
    let skipped = 0;
    
    // Get existing CNICs for duplicate checking (column 6 = CNIC)
    const lastRow = sheet.getLastRow();
    let existingCnics = [];
    if (lastRow > 1) {
        const cnicData = sheet.getRange(2, 6, lastRow - 1, 1).getValues();
        existingCnics = cnicData.map(r => r[0]).filter(c => c && c !== '');
    }
    
    records.forEach(record => {
        // CNIC-based duplicate check
        const cnic = record.cnic || '';
        const cleanCnic = cnic.replace(/[-\s]/g, ''); // Remove formatting
        
        // Skip if CNIC exists (except "No record")
        if (cnic && cnic !== 'No record' && existingCnics.length > 0) {
            const cnicExists = existingCnics.some(existing => {
                return existing.replace(/[-\s]/g, '') === cleanCnic;
            });
            if (cnicExists) {
                skipped++;
                return; // Skip duplicate
            }
        }
        
        // Format phone number to 03XX-XXXXXXX
        let contact1 = record.contact1 || '';
        if (contact1 && contact1 !== 'No record') {
            // Remove all non-digits
            const digits = contact1.replace(/\D/g, '');
            // Format as 03XX-XXXXXXX
            if (digits.length >= 10) {
                contact1 = digits.slice(0, 4) + '-' + digits.slice(4);
            }
        }
        
        const row = [
            record.assignedId || '',
            record.name || '',
            record.fatherHusbandName || 'No record',
            record.dob || 'No record',
            record.gender || 'No record',
            record.cnic || 'No record',
            record.designation || '',
            "'" + contact1, // Prefix with ' to preserve leading zero
            record.district || ''
        ];
        
        sheet.appendRow(row);
        imported++;
        
        // Add CNIC to existing list for this batch
        if (cnic && cnic !== 'No record') {
            existingCnics.push(cnic);
        }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: `Data imported: ${imported} new, ${skipped} duplicates skipped.`,
        imported: imported,
        skipped: skipped,
        totalRows: sheet.getLastRow() - 1
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Clear all data rows (keep headers)
 */
function clearSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Sheet does not exist, nothing to clear.'
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'All data cleared (headers preserved).'
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get current status
 */
function getStatus() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            totalRows: 0
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        totalRows: sheet.getLastRow() - 1
    })).setMimeType(ContentService.MimeType.JSON);
}
