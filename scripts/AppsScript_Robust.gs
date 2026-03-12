/**
 * ROBUST Google Sheets Web App for HR Staff Data
 * 
 * Features:
 * - Atomic Locking (prevents concurrent write corruption)
 * - Batch Processing (higher throughput)
 * - Intelligent Deduplication (normalized CNIC)
 * - Status Reporting (returns current sync state)
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait up to 30 seconds for a lock
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createResponse({ success: false, error: 'Could not obtain lock after 30s' });
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const action = e.parameter.action || 'import';

    if (action === 'import') {
      return handleImport(data);
    } else if (action === 'clear') {
      return handleClear();
    } else {
      return createResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    return createResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function handleImport(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Assigned ID', 'Name', 'Father Name', 'DOB', 'Gender', 'CNIC', 'Designation', 'Contact', 'District']);
  }

  const records = Array.isArray(data) ? data : [data];
  const lastRow = sheet.getLastRow();
  const existingCnics = lastRow > 1 ? 
    sheet.getRange(2, 6, lastRow - 1, 1).getValues().flat().map(normalizeCnic) : [];
  
  const newRows = [];
  let imported = 0;
  let skipped = 0;

  records.forEach(r => {
    const cnic = normalizeCnic(r.cnic);
    if (cnic && cnic !== 'norecord' && existingCnics.indexOf(cnic) !== -1) {
      skipped++;
      return;
    }
    
    newRows.push([
      r.assignedId || '',
      r.name || '',
      r.fatherHusbandName || 'No record',
      r.dob || 'No record',
      r.gender || 'No record',
      r.cnic || 'No record',
      r.designation || '',
      "'" + formatPhone(r.contact1),
      r.district || ''
    ]);
    imported++;
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    SpreadsheetApp.flush();
  }

  return createResponse({ success: true, imported, skipped, total: sheet.getLastRow() - 1 });
}

function normalizeCnic(cnic) {
  if (!cnic) return '';
  return cnic.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatPhone(phone) {
  if (!phone || phone === 'No record') return 'No record';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(0, 4) + '-' + digits.slice(4);
  }
  return digits;
}

function handleClear() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (sheet && sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  return createResponse({ success: true, message: 'Sheet cleared' });
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
