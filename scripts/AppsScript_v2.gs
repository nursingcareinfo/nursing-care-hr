/**
 * HR Staff Data Management - Google Sheets Web App
 * With validation, auto-ID, and duplicate detection
 * 
 * Deploy as Web App: Execute as Me, Who has access: Anyone
 */

const SHEET_NAME = 'Staff Data';
const LAST_ID_SHEET = 'Config';

function doPost(e) {
    try {
        const action = e.parameter.action;
        
        if (action === 'clear') {
            return clearData();
        } else if (action === 'status') {
            return getStatus();
        } else if (action === 'nextId') {
            return getNextId();
        } else {
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
 * Validate and normalize CNIC - XXXXX-XXXXXXX-X
 */
function validateCNIC(cnic) {
    if (!cnic || cnic === 'No record' || cnic === '') {
        return { valid: true, value: '' };
    }
    
    const cleaned = cnic.replace(/[^0-9]/g, '');
    
    if (cleaned.length === 13) {
        return {
            valid: true,
            value: cleaned.slice(0,5) + '-' + cleaned.slice(5,12) + '-' + cleaned.slice(12)
        };
    } else if (cleaned.length > 0 && cleaned.length < 13) {
        return { valid: false, value: cnic, error: 'CNIC incomplete' };
    }
    
    return { valid: true, value: cnic };
}

/**
 * Validate and normalize phone - 03XX-XXXXXXX
 */
function validatePhone(phone) {
    if (!phone || phone === 'No record' || phone === '') {
        return { valid: true, value: '' };
    }
    
    const cleaned = phone.replace(/[^0-9]/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('03')) {
        return { valid: true, value: cleaned.slice(0,4) + '-' + cleaned.slice(4) };
    } else if (cleaned.length === 10 && cleaned.startsWith('3')) {
        return { valid: true, value: '0' + cleaned.slice(0,3) + '-' + cleaned.slice(3) };
    } else if (cleaned.length === 11 && !cleaned.startsWith('03')) {
        return { valid: false, value: phone, error: 'Phone must start with 03' };
    }
    
    return { valid: true, value: phone };
}

/**
 * Standardize designation
 */
function standardizeDesignation(designation) {
    if (!designation) return '';
    
    const d = designation.toLowerCase().trim();
    
    if (d.includes('nursing asst') || d.includes('nurse asst')) return 'Nurse Assistant';
    if (d.includes('r/n') || d.includes('rn') || d.includes('registered nurse')) return 'R/N';
    if (d.includes('mid wife') || d.includes('midwife')) return 'Mid Wife';
    if (d.includes('baby sit') || d.includes('babysitter')) return 'Baby Sitter';
    if (d.includes('bsn')) return 'BSN';
    if (d.includes('attendant') || d.includes('caretaker')) return 'Attendant';
    if (d.includes('doctor') || d.includes('dr.')) return 'Doctor';
    
    return designation;
}

/**
 * Get or create Config sheet for last ID
 */
function getConfigSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let configSheet = ss.getSheetByName(LAST_ID_SHEET);
    
    if (!configSheet) {
        configSheet = ss.insertSheet(LAST_ID_SHEET);
        configSheet.appendRow(['Last ID Number', '246']);
    }
    
    return configSheet;
}

/**
 * Get next staff ID
 */
function getNextAssignedId() {
    const configSheet = getConfigSheet();
    const lastId = configSheet.getRange(2, 1).getValue();
    const nextNum = parseInt(lastId) || 246;
    
    configSheet.getRange(2, 1).setValue(nextNum);
    
    return 'NC-KHI-' + String(nextNum).padStart(3, '0');
}

/**
 * Increment ID counter
 */
function incrementIdCounter() {
    const configSheet = getConfigSheet();
    const lastId = configSheet.getRange(2, 1).getValue();
    const nextNum = (parseInt(lastId) || 246) + 1;
    configSheet.getRange(2, 1).setValue(nextNum);
}

/**
 * Check for duplicates by CNIC or Name+Phone
 */
function checkDuplicate(data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) return { isDuplicate: false };
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { isDuplicate: false };
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const cnicCol = 5;
    const nameCol = 1;
    const phoneCol = 7;
    
    for (let i = 0; i < dataRange.length; i++) {
        const row = dataRange[i];
        
        if (data.cnic && row[cnicCol - 1] === data.cnic) {
            return { isDuplicate: true, existingId: row[0], field: 'CNIC' };
        }
        
        if (data.name && row[nameCol - 1] === data.name && 
            data.contact1 && row[phoneCol - 1] === data.contact1) {
            return { isDuplicate: true, existingId: row[0], field: 'Name+Phone' };
        }
    }
    
    return { isDuplicate: false };
}

/**
 * Import staff data
 */
function importData(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        sheet.appendRow([
            'Assigned ID', 'Name', 'Father/Husband Name', 
            'Date of Birth', 'Gender', 'CNIC', 
            'Designation', 'Contact 1', 'District',
            'Validation Status', 'Import Date'
        ]);
    }
    
    let data;
    try {
        if (!e.postData || !e.postData.contents) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: 'No data provided. Use POST with JSON body or ?action=status'
            })).setMimeType(ContentService.MimeType.JSON);
        }
        data = JSON.parse(e.postData.contents);
    } catch (parseError) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid JSON: ' + parseError.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const records = Array.isArray(data) ? data : [data];
    const results = [];
    
    records.forEach(record => {
        const validationErrors = [];
        
        const cnicResult = validateCNIC(record.cnic);
        if (!cnicResult.valid) validationErrors.push(cnicResult.error);
        
        const phoneResult = validatePhone(record.contact1);
        if (!phoneResult.valid) validationErrors.push(phoneResult.error);
        
        const duplicateCheck = checkDuplicate({
            cnic: cnicResult.value,
            name: record.name,
            contact1: phoneResult.value
        });
        
        if (duplicateCheck.isDuplicate) {
            results.push({
                success: false,
                assignedId: null,
                name: record.name,
                error: 'Duplicate found: ' + duplicateCheck.field + ' matches existing ID ' + duplicateCheck.existingId
            });
            return;
        }
        
        const assignedId = record.assignedId || getNextAssignedId();
        
        const row = [
            assignedId,
            record.name || '',
            record.fatherHusbandName || '',
            record.dob || '',
            record.gender || '',
            cnicResult.value,
            standardizeDesignation(record.designation) || '',
            phoneResult.value,
            record.district || '',
            validationErrors.length > 0 ? 'Issues: ' + validationErrors.join(', ') : 'Valid',
            new Date().toISOString()
        ];
        
        sheet.appendRow(row);
        incrementIdCounter();
        
        results.push({
            success: true,
            assignedId: assignedId,
            name: record.name,
            cnic: cnicResult.valid ? 'Valid' : cnicResult.error,
            phone: phoneResult.valid ? 'Valid' : phoneResult.error
        });
    });
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        results: results,
        totalProcessed: records.length
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Clear all data (keep headers)
 */
function clearData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Sheet does not exist'
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
    }
    
    const configSheet = ss.getSheetByName(LAST_ID_SHEET);
    if (configSheet) {
        configSheet.getRange(2, 1).setValue('246');
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'All data cleared'
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get status
 */
function getStatus() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    let totalRows = 0;
    let validCount = 0;
    let issueCount = 0;
    
    if (sheet && sheet.getLastRow() > 1) {
        totalRows = sheet.getLastRow() - 1;
        
        const statusCol = 10;
        const dataRange = sheet.getRange(2, statusCol, totalRows, 1).getValues();
        
        dataRange.forEach(row => {
            const status = String(row[0]);
            if (status.includes('Valid')) validCount++;
            else if (status.includes('Issues')) issueCount++;
        });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        totalRows: totalRows,
        validRecords: validCount,
        recordsWithIssues: issueCount
    })).setMimeType(ContentService.MimeType.JSON);
}
