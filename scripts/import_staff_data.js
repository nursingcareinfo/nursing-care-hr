// Import staff data utility for HR Manager - Home Nursing Care system
// Handles parsing, validation, and insertion of new staff records

const fs = require('fs');
const path = require('path');

/**
 * Extract existing staff IDs from the master staff report
 * @param {string} content - Content of the master staff report
 * @returns {Array<string>} Array of existing staff IDs
 */
function extractExistingIds(content) {
  const lines = content.split('\n').filter(line => 
    line.trim() && 
    line.includes('|') && 
    !line.includes('---') && 
    !line.includes('Assigned ID')
  );
  
  return lines.map(line => {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    return cols[0]; // Assigned ID is first column
  }).filter(id => id && id.startsWith('NC-KHI-'));
}

/**
 * Generate the next sequential staff ID based on existing IDs
 * @param {Array<string>} existingIds - Array of existing staff IDs
 * @returns {string} Next staff ID in sequence
 */
function generateNextStaffId(existingIds) {
  const numbers = existingIds
    .map(id => {
      const match = id.match(/NC-KHI-(\d+)/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(num => num !== null && !isNaN(num));
  
  const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `NC-KHI-${nextNum.toString().padStart(3, '0')}`;
}

/**
 * Extract district from address string
 * @param {string} address - Full address string
 * @returns {string} District name or default
 */
function extractDistrictFromAddress(address) {
  if (!address) return 'Karachi (South)';
  
  const districts = ['Gulshan', 'Karachi (South)', 'Keamari', 'Korangi', 'Malir', 'Nazimabad', 'Orangi'];
  for (const district of districts) {
    if (address.toLowerCase().includes(district.toLowerCase())) {
      return district;
    }
  }
  return 'Karachi (South)'; // Default
}

/**
 * Calculate age from date of birth string
 * @param {string} dobString - Date of birth in DD.MM.YYYY or DD-MM-YYYY format
 * @returns {number} Age in years or empty string if invalid
 */
function calculateAge(dobString) {
  if (!dobString) return '';
  
  // Handle DD.MM.YYYY format
  let dateParts;
  if (dobString.includes('.')) {
    dateParts = dobString.split('.');
  } else if (dobString.includes('-')) {
    dateParts = dobString.split('-');
  } else {
    return '';
  }
  
  if (dateParts.length !== 3) return '';
  
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JavaScript
  const year = parseInt(dateParts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
  
  const birthDate = new Date(year, month, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : '';
}

/**
 * Parse user-provided staff data into internal format
 * @param {Array<Object>} userDataArray - Array of staff data objects from user input
 * @param {Array<string>} existingIds - Existing staff IDs for generating new ones
 * @returns {Array<Object>} Array of parsed staff data in internal format
 */
function parseStaffData(userDataArray, existingIds) {
  return userDataArray.map(staff => {
    return {
      assignedId: generateNextStaffId(existingIds), // Will be updated for each staff
      name: staff.Name ? staff.Name.toLowerCase().split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : '',
      fatherHusbandName: staff["Father's Name"] ? staff["Father's Name"].toLowerCase().split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : '',
      dob: staff["Date of Birth"] || '',
      gender: staff.Gender || '',
      cnic: staff["CNIC (Identity Number)"] || '',
      designation: staff.Designation || '',
      contact1: staff.Contact || '',
      district: extractDistrictFromAddress(staff["Residential Address"]) || 'Karachi (South)',
      religion: staff.Religion || '',
      maritalStatus: staff["Marital Status"] || '',
      age: calculateAge(staff["Date of Birth"]) || '',
      paymentMode: staff["Mode of Payment"] || '',
      languages: staff["Language Spoken"] || ''
    };
  });
}

/**
 * Validate staff data using existing DataValidator
 * @param {Array<Object>} staffArray - Array of staff data in internal format
 * @returns {Array<Object>} Array of validation results
 */
function validateStaffData(staffArray) {
  const DataValidator = require('./data_validator');
  
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

/**
 * Generate markdown table row for staff data
 * @param {Array<Object>} staffArray - Array of staff data in internal format
 * @returns {string} Markdown formatted table rows
 */
function generateStaffMarkdown(staffArray) {
  return staffArray.map(staff => {
    return `| ${staff.assignedId} | ${staff.name} | ${staff.fatherHusbandName} | ${staff.dob} | ${staff.gender} | ${staff.cnic} | ${staff.designation} | ${staff.contact1} | ${staff.district} | ${staff.religion} | ${staff.maritalStatus} | ${staff.age} | ${staff.paymentMode} | ${staff.languages} |`;
  }).join('\n');
}

/**
 * Append staff data to master staff report
 * @param {Array<Object>} staffArray - Array of staff data in internal format
 */
function appendToMasterReport(staffArray) {
  const markdown = generateStaffMarkdown(staffArray);
  const reportPath = path.join(__dirname, '../data/master_report/master_staff_report.md');
  fs.appendFileSync(reportPath, '\n' + markdown + '\n');
}

/**
 * Main function to import staff data
 */
function main() {
  // Hardcoded staff data from user input
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
    {
      "Name": "MUDASSER KHAN",
      "Father's Name": "SARDAR BAHADUR",
      "Date of Birth": "14-02-1990",
      "CNIC (Identity Number)": "16202-8621411-5",
      "Contact": "0312-2708112",
      "Designation": "Attendant",
      "Residential Address": "House No - 247/B2 Future Colony Landhi, Karachi",
      "Permanent Address": "Walrahi",
      "Religion": "Islam",
      "Language Spoken": "Not specified",
      "Marital Status": "Married",
      "Mode of Payment": "Mobile money: Easypaisa",
      "Guarantor Name": "Irfan Ahmed",
      "Guarantor Relation": "Own Brother",
      "Guarantor Contact": "03132228291",
      "Guarantor CNIC": "Not specified",
      "Registration Date": "6/1/25",
      "Gender": "Male",
      "Country of Stay": "Pakistan",
      "Date of Issue": "Not specified",
      "Date of Expiry": "Not specified",
      "Nationality": "Pakistani",
      "Education": "Matriculation From Karachi Board",
      "Experience": "9 Years Experience as Patient Taker in Jinnah Hospital, Patient Exercise, Patient Massage, Patient Care, Home Care Taker"
    },
    {
      "Name": "JUDE",
      "Father's Name": "PATRICK BALOCH",
      "Date of Birth": "25.12.1983",
      "CNIC (Identity Number)": "42301-6386793-9",
      "Contact": "0306-2156751",
      "Designation": "Attendant",
      "Residential Address": "H #517 Street 408 Alfalal Colony",
      "Permanent Address": "Not specified",
      "Religion": "Not specified",
      "Language Spoken": "Not specified",
      "Marital Status": "Single",
      "Mode of Payment": "Not specified",
      "Guarantor Name": "IBRAHIM",
      "Guarantor Relation": "Mother",
      "Guarantor Contact": "0306-2156751",
      "Guarantor CNIC": "Not specified",
      "Registration Date": "18/9/2025",
      "Gender": "M",
      "Country of Stay": "Pakistan",
      "Date of Issue": "23.06.2020",
      "Date of Expiry": "23.06.2030",
      "Nationality": "Not specified",
      "Education": "Not specified",
      "Experience": "Not specified"
    },
    {
      "Name": "RIAZ AKHTAR",
      "Father's Name": "SALEEM MASIH",
      "Date of Birth": "01.03.1987",
      "CNIC (Identity Number)": "42401-7356656-5",
      "Contact": "0343-2893619",
      "Designation": "Attendant",
      "Residential Address": "Zia Colony, Korangi",
      "Permanent Address": "Not specified",
      "Religion": "CHRISTIAN",
      "Language Spoken": "Punjabi, Urdu",
      "Marital Status": "Single",
      "Mode of Payment": "Not specified",
      "Guarantor Name": "MRS. VERONICA",
      "Guarantor Relation": "Wife",
      "Guarantor Contact": "0343-2773012",
      "Guarantor CNIC": "42301-3424344-4",
      "Registration Date": "19/9/2025",
      "Gender": "M",
      "Country of Stay": "Pakistan",
      "Date of Issue": "20.11.2017",
      "Date of Expiry": "20.11.2027",
      "Nationality": "Not specified",
      "Education": "Not specified",
      "Experience": "Not specified"
    }
  ];
  
  // Get existing IDs to generate proper sequential IDs
  const reportPath = path.join(__dirname, '../data/master_report/master_staff_report.md');
  let existingContent = '';
  try {
    existingContent = fs.readFileSync(reportPath, 'utf8');
  } catch (error) {
    console.error('Error reading master staff report:', error.message);
    process.exit(1);
  }
  
  const existingIds = extractExistingIds(existingContent);
  
  // Process data - we need to update IDs as we go since each new staff gets a new ID
  const processedStaff = [];
  let currentExistingIds = [...existingIds]; // Copy to avoid modifying original
  
  for (const staff of staffData) {
    // Parse this staff member with current existing IDs
    const parsed = parseStaffData([staff], currentExistingIds)[0];
    
    // Validate the parsed data
    const validationResults = validateStaffData([parsed]);
    
    if (validationResults[0].isValid) {
      processedStaff.push(parsed);
      // Add this staff's ID to existing IDs for the next iteration
      currentExistingIds.push(parsed.assignedId);
    } else {
      console.error('Validation failed for staff:', staff.Name, validationResults[0].errors);
    }
  }
  
  if (processedStaff.length === 0) {
    console.error('No valid staff records to import');
    process.exit(1);
  }
  
  // Add to master report
  appendToMasterReport(processedStaff);
  
  console.log(`Successfully imported ${processedStaff.length} staff members`);
  console.log('Run export scripts to sync with Google Sheets and Supabase');
}

// Helper functions for testing
module.exports = {
  parseStaffData,
  generateNextStaffId,
  extractDistrictFromAddress,
  calculateAge,
  validateStaffData,
  generateStaffMarkdown,
  appendToMasterReport,
  extractExistingIds
};

// Run main if script is executed directly
if (require.main === module) {
  main();
}