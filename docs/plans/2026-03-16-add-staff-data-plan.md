# Add Staff Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add four new staff members to the HR Manager - Home Nursing Care system by inserting their data into the master staff report and ensuring proper validation and export.

**Architecture:** 
This plan involves adding staff records to the existing markdown-based staff report, validating the data through the existing validation system, and ensuring the records are properly exported to Google Sheets and Supabase. The approach follows the existing data flow: manual data entry → validation → export.

**Tech Stack:** 
- Node.js (existing scripts)
- Markdown staff report (master_staff_report.md)
- Data validator (data_validator.js)
- Export scripts (export_to_sheets.js, export_to_supabase.js)
- Git for version control

---

### Task 1: Analyze Staff Data Format

**Files:**
- Read: `/home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md`

**Step 1: Examine current staff report format**

```bash
head -5 /home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md
```

Expected: See the header and first few staff records to confirm column structure

**Step 2: Map user-provided data to existing format**

Create a mapping document showing how user fields correspond to existing columns:
- Assigned ID: Will need to generate new IDs (following NC-KHI-XXX pattern)
- Name: Direct mapping from "Name" field
- Father's / Husband's Name: From "Father's Name" field
- Date of Birth: From "Date of Birth" field (format may need adjustment)
- Gender: From "Gender" field
- CNIC: From "CNIC (Identity Number)" field
- Designation: From "Designation" field
- Contact 1: From "Contact" field
- Official District: Need to extract from addresses or use default
- Religion: From "Religion" field
- Marital Status: From "Marital Status" field
- Age: Calculate from Date of Birth or leave blank
- Payment Mode: From "Mode of Payment" field
- Languages: From "Language Spoken" field

**Step 3: Commit analysis**

```bash
git add docs/plans/2026-03-16-add-staff-data-plan.md
git commit -m "docs: add staff data implementation plan"
```

---

### Task 2: Create Staff Data Import Script

**Files:**
- Create: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/import_staff_data.js`
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md`

**Step 1: Write the failing test**

```javascript
const { parseStaffData } = require('./import_staff_data');

test('should parse user-provided staff data correctly', () => {
  const userData = [
    {
      "Name": "SHAHZAD KHOKHAR",
      "Father's Name": "NASEEM KHOKHAR", 
      "Date of Birth": "05.08.2000",
      "CNIC (Identity Number)": "42604-0340031-1",
      "Contact": "0317-0230736",
      "Designation": "Attendant",
      "Religion": "CHRISTIAN",
      "Marital Status": "Single",
      "Mode of Payment": "Mobile Money: Easypaisa",
      "Language Spoken": "Punjabi, Urdu"
    }
  ];
  
  const result = parseStaffData(userData);
  expect(result.length).toBe(1);
  expect(result[0].name).toBe("Shahzad Khokhar");
});
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL with "Cannot find module './import_staff_data'"

**Step 3: Write minimal implementation**

```javascript
// import_staff_data.js
function parseStaffData(userDataArray) {
  return userDataArray.map(staff => {
    // Calculate Assigned ID (will need to find next available)
    // Format dates, clean names, etc.
    return {
      assignedId: `NC-KHI-${Date.now()}`, // Temporary, will improve
      name: staff.Name ? staff.Name.toLowerCase().split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : '',
      fatherHusbandName: staff["Father's Name"] ? staff["Father's Name"].toLowerCase().split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : '',
      dob: staff["Date of Birth"] || '',
      gender: staff.Gender || '',
      cnic: staff["CNIC (Identity Number)"] || '',
      designation: staff.Designation || '',
      contact1: staff.Contact || '',
      district: extractDistrictFromAddress(staff["Residential Address"]) || 'Karachi (South)', // Default
      religion: staff.Religion || '',
      maritalStatus: staff["Marital Status"] || '',
      age: calculateAge(staff["Date of Birth"]) || '',
      paymentMode: staff["Mode of Payment"] || '',
      languages: staff["Language Spoken"] || ''
    };
  });
}

function extractDistrictFromAddress(address) {
  // Simple implementation - could be enhanced
  const districts = ['Gulshan', 'Karachi (South)', 'Keamari', 'Korangi', 'Malir', 'Nazimabad', 'Orangi'];
  for (const district of districts) {
    if (address && address.toLowerCase().includes(district.toLowerCase())) {
      return district;
    }
  }
  return 'Karachi (South)'; // Default
}

function calculateAge(dobString) {
  if (!dobString) return '';
  // Implement age calculation from DD.MM.YYYY or DD-MM-YYYY format
  return ''; // Placeholder
}

module.exports = { parseStaffData };
```

**Step 4: Run test to verify it passes**

Run: `node test/import_staff_data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/import_staff_data.js test/import_staff_data.test.js
git commit -m "feat: add staff data import script"
```

---

### Task 3: Generate New Staff IDs

**Files:**
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/import_staff_data.js`

**Step 1: Write the failing test**

```javascript
test('should generate sequential staff IDs based on existing records', () => {
  const existingIds = ['NC-KHI-001', 'NC-KHI-002', 'NC-KHI-003'];
  const nextId = generateNextStaffId(existingIds);
  expect(nextId).toBe('NC-KHI-004');
});
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL with "generateNextStaffId is not defined"

**Step 3: Write minimal implementation**

```javascript
// Add to import_staff_data.js
function generateNextStaffId(existingIds) {
  const numbers = existingIds
    .map(id => parseInt(id.match(/NC-KHI-(\d+)/)[1]))
    .filter(num => !isNaN(num));
  const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `NC-KHI-${nextNum.toString().padStart(3, '0')}`;
}

// Update parseStaffData to use this function (will need to pass existingIds)
```

**Step 4: Run test to verify it passes**

Run: `node test/import_staff_data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/import_staff_data.js
git commit -m "feat: add staff ID generation logic"
```

---

### Task 4: Integrate with Master Staff Report

**Files:**
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/import_staff_data.js`
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md`

**Step 1: Write the failing test**

```javascript
test('should add staff records to master staff report in correct format', () => {
  const staffData = [{ /* sample staff object */ }];
  const markdown = generateStaffMarkdown(staffData);
  expect(markdown).toContain('| NC-KHI-287 |'); // Should start after last ID
  expect(markdown).toMatch(/\| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]+ \|/);
});
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL with "generateStaffMarkdown is not defined"

**Step 3: Write minimal implementation**

```javascript
// Add to import_staff_data.js
function generateStaffMarkdown(staffArray) {
  return staffArray.map(staff => {
    return `| ${staff.assignedId} | ${staff.name} | ${staff.fatherHusbandName} | ${staff.dob} | ${staff.gender} | ${staff.cnic} | ${staff.designation} | ${staff.contact1} | ${staff.district} | ${staff.religion} | ${staff.maritalStatus} | ${staff.age} | ${staff.paymentMode} | ${staff.languages} |`;
  }).join('\n');
}

// Add function to append to master report
function appendToMasterReport(staffArray) {
  const markdown = generateStaffMarkdown(staffArray);
  const reportPath = path.join(__dirname, '../data/master_report/master_staff_report.md');
  fs.appendFileSync(reportPath, '\n' + markdown + '\n');
}
```

**Step 4: Run test to verify it passes**

Run: `node test/import_staff_data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/import_staff_data.js
git commit -m "feat: add staff report integration"
```

---

### Task 5: Validate Imported Data

**Files:**
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/import_staff_data.js`
- Read: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/data_validator.js`

**Step 1: Write the failing test**

```javascript
test('should validate imported staff data using existing validator', () => {
  const staffData = [{ /* valid staff object */ }];
  const validationResults = validateStaffData(staffData);
  expect(validationResults.every(result => result.isValid)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL with "validateStaffData is not defined"

**Step 3: Write minimal implementation**

```javascript
// Add to import_staff_data.js
const DataValidator = require('./data_validator');

function validateStaffData(staffArray) {
  return staffArray.map(staff => {
    // Convert staff object to format expected by DataValidator.process
    const rawData = {
      assigned_id: staff.assignedId,
      name: staff.name,
      father_husband_name: staff.fatherHusbandName,
      date_of_birth: staff.dob,
      gender: staff.gender,
      cnic: staff.cnic,
      designation: staff.designation,
      contact_1: staff.contact1,
      district: staff.district,
      religion: staff.religion,
      marital_status: staff.maritalStatus,
      age: staff.age,
      payment_mode: staff.paymentMode,
      languages: staff.languages
    };
    
    return DataValidator.process(rawData);
  });
}
```

**Step 4: Run test to verify it passes**

Run: `node test/import_staff_data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/import_staff_data.js
git commit -m "feat: add data validation integration"
```

---

### Task 6: Create Command Line Interface

**Files:**
- Create: `/home/archbtw/dev/HR_manager_home_nursing_care/scripts/import_staff_data.js` (complete)
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/package.json`

**Step 1: Write the failing test**

```javascript
test('should have proper CLI interface', () => {
  // Test that script can be run with node and processes data correctly
  // This would be an integration test
});
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL (test not implemented yet)

**Step 3: Write minimal implementation**

```javascript
// Add to bottom of import_staff_data.js
const fs = require('fs');
const path = require('path');

function main() {
  // Read staff data from JSON file or stdin
  // For now, we'll hardcode the four staff members from user input
  const staffData = [
    {
      "Name": "SHAHZAD KHOKHAR",
      "Father's Name": "NASEEM KHOKHAR", 
      "Date of Birth": "05.08.2000",
      "CNIC (Identity Number)": "42604-0340031-1",
      "Contact": "0317-0230736",
      "Designation": "Attendant",
      "Residential Address": "F #48 Famers Town",
      "Permanent Address": "Not specified",
      "Religion": "CHRISTIAN",
      "Language Spoken": "Punjabi, Urdu",
      "Marital Status": "Single",
      "Mode of Payment": "Mobile Money: Easypaisa",
      "Guarantor Name": "S. QONAM",
      "Guarantor Relation": "Sister",
      "Guarantor Contact": "0314-8314-8331925",
      "Guarantor CNIC": "42201-3491375-0",
      "Registration Date": "10/01/2025",
      "Gender": "M",
      "Country of Stay": "Pakistan",
      "Date of Issue": "14.05.2019",
      "Date of Expiry": "14.05.2029",
      "Nationality": "Not specified",
      "Education": "Not specified",
      "Experience": "Not specified"
    },
    // Add the other three staff members here...
  ];
  
  // Get existing IDs to generate proper sequential IDs
  const reportPath = path.join(__dirname, '../data/master_report/master_staff_report.md');
  const existingContent = fs.readFileSync(reportPath, 'utf8');
  const existingIds = extractExistingIds(existingContent);
  
  // Process data
  const parsedData = parseStaffData(staffData, existingIds);
  const validationResults = validateStaffData(parsedData);
  
  // Filter valid records
  const validRecords = parsedData.filter((_, index) => validationResults[index].isValid);
  
  if (validRecords.length === 0) {
    console.error('No valid staff records to import');
    process.exit(1);
  }
  
  // Add to master report
  appendToMasterReport(validRecords);
  
  console.log(`Successfully imported ${validRecords.length} staff members`);
  console.log('Run export scripts to sync with Google Sheets and Supabase');
}

// Helper functions (extractExistingIds, etc.) would go here

if (require.main === module) {
  main();
}
```

**Step 2: Run test to verify it fails**

Run: `node test/import_staff_data.test.js`
Expected: FAIL (need to implement test properly)

**Step 3: Write minimal implementation**

Actually, let's test it manually first:

```bash
node scripts/import_staff_data.js
```

Expected: Should process the staff data and append to master report

**Step 4: Run test to verify it passes**

Run: `node test/import_staff_data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/import_staff_data.js
git commit -m "feat: add CLI interface for staff import"
```

---

### Task 7: Test Import Process

**Files:**
- Modify: `/home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md`

**Step 1: Run the import script**

```bash
node scripts/import_staff_data.js
```

Expected: Should output success message and show how many staff were imported

**Step 2: Verify data was added correctly**

```bash
tail -10 /home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md
```

Expected: Should see the four new staff records at the end of the file

**Step 3: Run data validation to ensure no errors**

```bash
node scripts/test_validator.js
```

Expected: All tests should pass

**Step 4: Commit**

```bash
git add data/master_report/master_staff_report.md
git commit -m "feat: add four new staff members to master report"
```

---

### Task 8: Export to Google Sheets and Supabase

**Files:**
- No new files (using existing export scripts)

**Step 1: Export to Google Sheets**

```bash
npm run export:sheets
```

Expected: Should show new records being exported

**Step 2: Export to Supabase**

```bash
npm run export:supabase
```

Expected: Should show new records being exported

**Step 3: Verify exports worked**

Check Google Sheets and Supabase for the new staff records

**Step 4: Commit**

```bash
git add data/.export_state.json data/.supabase_export_state.json
git commit -m "feat: export new staff data to Google Sheets and Supabase"
```

---

### Task 9: Final Verification

**Files:**
- Read: Various

**Step 1: Check total staff count**

```bash
node scripts/export_to_sheets.js --status
```

Expected: Should show 290 / 290 records (previously 286 + 4 new)

**Step 2: Verify new staff appear in exports**

```bash
# Check for specific staff names in exported data
grep -i "shahzad" /home/archbtw/dev/HR_manager_home_nursing_care/staff_export.csv || echo "Not found in CSV"
```

Expected: Should find the new staff members

**Step 3: Commit final verification**

```bash
git commit -m "feat: verify successful staff data import and export"
```
