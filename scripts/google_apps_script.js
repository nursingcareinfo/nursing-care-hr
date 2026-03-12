/**
 * Automated Staff Record Importer for Google Sheets
 * Receives data from n8n or local export scripts.
 */

function setupStaffSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    const headers = [
        "Assigned ID", "Name", "Father's / Husband's Name",
        "Date of Birth", "Gender", "CNIC",
        "Designation", "Contact 1", "Official District", "Status"
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
        .setFontWeight("bold")
        .setBackground("#f3f3f3");

    sheet.setFrozenRows(1);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Bulk append logic
        if (Array.isArray(data)) {
            data.forEach(staff => appendRow(sheet, staff));
        } else {
            appendRow(sheet, data);
        }

        return ContentService.createTextOutput("Success: Data imported.");
    } catch (err) {
        return ContentService.createTextOutput("Error: " + err.message);
    }
}

function appendRow(sheet, staff) {
    sheet.appendRow([
        staff.assignedId,
        staff.name,
        staff.fatherHusbandName || "No record",
        staff.dob || "No record",
        staff.gender,
        staff.cnic,
        staff.designation,
        "'" + staff.contact1, // Preserve leading zeros
        staff.district,
        "Pending" // Default status
    ]);
}
