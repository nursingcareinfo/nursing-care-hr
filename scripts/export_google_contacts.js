/**
 * Export Local Staff Records to Google Contacts CSV
 * Usage: node scripts/export_google_contacts.js
 * 
 * This script prepares a CSV file that can be imported into Google Contacts,
 * which then syncs with WhatsApp Business to manage staff contacts.
 * It parses the local master_staff_report.md file directly.
 * 
 * IMPORTANT: Google Contacts CSV uses COLUMN POSITION to identify fields.
 */

const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const REPORT_PATH = path.join(__dirname, '../data/master_report/master_staff_report.md');
const OUTPUT_PATH = path.join(__dirname, '../data/exports/google_contacts_import.csv');

// Format phone number to ensure +92 country code and remove spaces/dashes
function formatPhone(phone) {
    if (!phone || phone === 'No record') return '';
    let cleanPhone = phone.replace(/["\s-"]/g, '');
    
    // If it starts with 03, replace 0 with +92
    if (cleanPhone.startsWith('03')) {
        cleanPhone = '+92' + cleanPhone.substring(1);
    } 
    // If it starts with 3 && it's exactly 10 digits
    else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
        cleanPhone = '+92' + cleanPhone;
    }
    // If it starts with 92, prepend +
    else if (cleanPhone.startsWith('92')) {
        cleanPhone = '+' + cleanPhone;
    }
    
    return cleanPhone;
}

// Parse the local Markdown report file
function parseStaffReport() {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`Error: Report file not found at ${REPORT_PATH}`);
        process.exit(1);
    }

    const content = fs.readFileSync(REPORT_PATH, 'utf8');
    const allLines = content.split('\n');
    
    // Try to find the header line to see what columns we have
    const headerLine = allLines.find(line => line.includes('Assigned ID') && line.includes('|'));
    const headers = headerLine ? headerLine.split('|').map(h => h.trim()).filter(Boolean) : [];
    
    const lines = allLines.filter(line =>
        line.trim() &&
        line.includes('|') &&
        !line.includes('---') &&
        !line.includes('Assigned ID')
    );

    return lines.map(line => {
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        const record = {
            assigned_id: cols[0],
            name: cols[1],
            father_husband_name: cols[2],
            date_of_birth: cols[3],
            gender: cols[4],
            cnic: cols[5],
            designation: cols[6],
            contact_1: cols[7],
            district: cols[8],
            contact_2: cols.length > 14 ? cols[14] : '',
            status: 'active'
        };

        // Dynamically add new fields if the report has more columns
        // Example: | Religion | Marital Status | Age | Payment Mode | Languages | 
        if (cols.length > 9) {
            record.religion = cols[9];
            record.marital_status = cols[10];
            record.age = cols[11];
            record.payment_mode = cols[12];
            record.languages = cols[13];
        }

        return record;
    });
}

async function exportContacts() {
    console.log(`Reading staff records from ${REPORT_PATH}...`);
    
    const staff = parseStaffReport();
    
    if (!staff || staff.length === 0) {
        console.log('No staff records found in the report.');
        return;
    }
    
    console.log(`Found ${staff.length} staff records. Formatting for Google Contacts...`);
    
    // Google Contacts CSV - COLUMN ORDER IS CRITICAL!
    const csvWriter = createObjectCsvWriter({
        path: OUTPUT_PATH,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'givenName', title: 'Given Name' },
            { id: 'familyName', title: 'Family Name' },
            { id: 'additionalName', title: 'Additional Name' },
            { id: 'yomiName', title: 'Yomi Name' },
            { id: 'givenNameYomi', title: 'Given Name Yomi' },
            { id: 'additionalNameYomi', title: 'Additional Name Yomi' },
            { id: 'familyNameYomi', title: 'Family Name Yomi' },
            { id: 'namePrefix', title: 'Name Prefix' },
            { id: 'nameSuffix', title: 'Name Suffix' },
            { id: 'initials', title: 'Initials' },
            { id: 'nickname', title: 'Nickname' },
            { id: 'shortName', title: 'Short Name' },
            { id: 'maidenName', title: 'Maiden Name' },
            { id: 'birthday', title: 'Birthday' },
            { id: 'gender', title: 'Gender' },
            // Location = District/area
            { id: 'location', title: 'Location' },
            { id: 'billingInformation', title: 'Billing Information' },
            { id: 'directoryServer', title: 'Directory Server' },
            { id: 'mileage', title: 'Mileage' },
            // Occupation = Designation
            { id: 'occupation', title: 'Occupation' },
            { id: 'hobby', title: 'Hobby' },
            { id: 'sensitivity', title: 'Sensitivity' },
            { id: 'priority', title: 'Priority' },
            { id: 'subject', title: 'Subject' },
            { id: 'notes', title: 'Notes' },
            { id: 'language', title: 'Language' },
            { id: 'photo', title: 'Photo' },
            { id: 'groupMembership', title: 'Group Membership' },
            { id: 'email1Type', title: 'E-mail 1 - Type' },
            { id: 'email1Value', title: 'E-mail 1 - Value' },
            { id: 'email2Type', title: 'E-mail 2 - Type' },
            { id: 'email2Value', title: 'E-mail 2 - Value' },
            { id: 'email3Type', title: 'E-mail 3 - Type' },
            { id: 'email3Value', title: 'E-mail 3 - Value' },
            { id: 'im1Type', title: 'IM 1 - Type' },
            { id: 'im1Service', title: 'IM 1 - Service' },
            { id: 'im1Value', title: 'IM 1 - Value' },
            { id: 'im2Type', title: 'IM 2 - Type' },
            { id: 'im2Service', title: 'IM 2 - Service' },
            { id: 'im2Value', title: 'IM 2 - Value' },
            { id: 'phone1Type', title: 'Phone 1 - Type' },
            { id: 'phone1Value', title: 'Phone 1 - Value' },
            { id: 'phone2Type', title: 'Phone 2 - Type' },
            { id: 'phone2Value', title: 'Phone 2 - Value' },
            { id: 'phone3Type', title: 'Phone 3 - Type' },
            { id: 'phone3Value', title: 'Phone 3 - Value' },
            { id: 'phone4Type', title: 'Phone 4 - Type' },
            { id: 'phone4Value', title: 'Phone 4 - Value' },
            { id: 'address1Type', title: 'Address 1 - Type' },
            { id: 'address1Formatted', title: 'Address 1 - Formatted' },
            { id: 'address1Street', title: 'Address 1 - Street' },
            { id: 'address1City', title: 'Address 1 - City' },
            { id: 'address1POBox', title: 'Address 1 - PO Box' },
            { id: 'address1Region', title: 'Address 1 - Region' },
            { id: 'address1PostalCode', title: 'Address 1 - Postal Code' },
            { id: 'address1Country', title: 'Address 1 - Country' },
            { id: 'address1ExtendedAddress', title: 'Address 1 - Extended Address' },
            { id: 'address2Type', title: 'Address 2 - Type' },
            { id: 'address2Formatted', title: 'Address 2 - Formatted' },
            { id: 'address2Street', title: 'Address 2 - Street' },
            { id: 'address2City', title: 'Address 2 - City' },
            { id: 'address2POBox', title: 'Address 2 - PO Box' },
            { id: 'address2Region', title: 'Address 2 - Region' },
            { id: 'address2PostalCode', title: 'Address 2 - Postal Code' },
            { id: 'address2Country', title: 'Address 2 - Country' },
            { id: 'address2ExtendedAddress', title: 'Address 2 - Extended Address' },
            // Organization = Company, Title = Designation, Location = District
            { id: 'org1Type', title: 'Organization 1 - Type' },
            { id: 'org1Name', title: 'Organization 1 - Name' },
            { id: 'org1YomiName', title: 'Organization 1 - Yomi Name' },
            { id: 'org1Title', title: 'Organization 1 - Title' },
            { id: 'org1Department', title: 'Organization 1 - Department' },
            { id: 'org1Symbol', title: 'Organization 1 - Symbol' },
            { id: 'org1Location', title: 'Organization 1 - Location' },
            { id: 'org1JobDescription', title: 'Organization 1 - Job Description' },
            { id: 'org2Type', title: 'Organization 2 - Type' },
            { id: 'org2Name', title: 'Organization 2 - Name' },
            { id: 'org2YomiName', title: 'Organization 2 - Yomi Name' },
            { id: 'org2Title', title: 'Organization 2 - Title' },
            { id: 'org2Department', title: 'Organization 2 - Department' },
            { id: 'org2Symbol', title: 'Organization 2 - Symbol' },
            { id: 'org2Location', title: 'Organization 2 - Location' },
            { id: 'org2JobDescription', title: 'Organization 2 - Job Description' },
            { id: 'relation1Type', title: 'Relation 1 - Type' },
            { id: 'relation1Value', title: 'Relation 1 - Value' },
            { id: 'relation2Type', title: 'Relation 2 - Type' },
            { id: 'relation2Value', title: 'Relation 2 - Value' },
            { id: 'website1Type', title: 'Website 1 - Type' },
            { id: 'website1Value', title: 'Website 1 - Value' },
            { id: 'website2Type', title: 'Website 2 - Type' },
            { id: 'website2Value', title: 'Website 2 - Value' },
            { id: 'website3Type', title: 'Website 3 - Type' },
            { id: 'website3Value', title: 'Website 3 - Value' }
        ]
    });
    
    const records = staff.map(person => {
        // Split name for Given/Family if possible
        const nameParts = person.name.split(' ');
        const givenName = nameParts[0] || person.name;
        const familyName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        // Clean designation
        const designation = person.designation && person.designation !== 'No record' ? person.designation : '';
        
        // Clean district
        const district = person.district && person.district !== 'No record' ? person.district : '';
        
        // Get formatted phone numbers
        const phone1 = formatPhone(person.contact_1);
        const phone2 = person.contact_2 ? formatPhone(person.contact_2) : '';
        
        // Construct notes including HR fields
        const notes = [
            `Status: ${person.status}`,
            `Assigned ID: ${person.assigned_id}`,
            `Religion: ${person.religion || 'Not specified'}`,
            `Marital Status: ${person.marital_status || 'Not specified'}`,
            `Age: ${person.age || 'Not specified'}`,
            `Payment Mode: ${person.payment_mode || 'Not specified'}`,
            `Languages: ${person.languages || 'Not specified'}`,
            `HR Manager Home Nursing Care`
        ].join('\n');
        
        return {
            // Name fields
            name: person.name,
            givenName: givenName,
            familyName: familyName,
            additionalName: '',
            yomiName: '',
            givenNameYomi: '',
            additionalNameYomi: '',
            familyNameYomi: '',
            namePrefix: '',
            nameSuffix: '',
            initials: '',
            nickname: '',
            shortName: '',
            maidenName: '',
            birthday: '',
            gender: '',
            // Location = District
            location: district,
            billingInformation: '',
            directoryServer: '',
            mileage: '',
            // Occupation = Designation
            occupation: designation,
            hobby: '',
            sensitivity: '',
            priority: '',
            subject: '',
            notes: notes,
            language: '',
            photo: '',
            groupMembership: '* HR Manager Home Nursing Care',
            email1Type: '',
            email1Value: '',
            email2Type: '',
            email2Value: '',
            email3Type: '',
            email3Value: '',
            im1Type: '',
            im1Service: '',
            im1Value: '',
            im2Type: '',
            im2Service: '',
            im2Value: '',
            phone1Type: phone1 ? 'Mobile' : '',
            phone1Value: phone1,
            phone2Type: phone2 ? 'Work' : '',
            phone2Value: phone2,
            phone3Type: '',
            phone3Value: '',
            phone4Type: '',
            phone4Value: '',
            // Address (using district as city)
            address1Type: 'Work',
            address1Formatted: district ? `Karachi, ${district}, Pakistan` : 'Karachi, Pakistan',
            address1Street: '',
            address1City: district || 'Karachi',
            address1POBox: '',
            address1Region: 'Sindh',
            address1PostalCode: '',
            address1Country: 'Pakistan',
            address1ExtendedAddress: '',
            address2Type: '',
            address2Formatted: '',
            address2Street: '',
            address2City: '',
            address2POBox: '',
            address2Region: '',
            address2PostalCode: '',
            address2Country: '',
            address2ExtendedAddress: '',
            // Organization = Company, Title = Designation, Location = District
            org1Type: 'Work',
            org1Name: 'HR Manager Home Nursing Care',
            org1YomiName: '',
            org1Title: designation,
            org1Department: '',
            org1Symbol: '',
            org1Location: district,
            org1JobDescription: '',
            org2Type: '',
            org2Name: '',
            org2YomiName: '',
            org2Title: '',
            org2Department: '',
            org2Symbol: '',
            org2Location: '',
            org2JobDescription: '',
            relation1Type: '',
            relation1Value: '',
            relation2Type: '',
            relation2Value: '',
            website1Type: '',
            website1Value: '',
            website2Type: '',
            website2Value: '',
            website3Type: '',
            website3Value: ''
        };
    });
    
    await csvWriter.writeRecords(records);
    console.log(`\n✅ Success! Google Contacts CSV generated at: ${OUTPUT_PATH}`);
    console.log(`\n📋 Contact fields now include:`);
    console.log(`   - Name: Employee name`);
    console.log(`   - Occupation: Designation`);
    console.log(`   - Location: District`);
    console.log(`   - Organization: HR Manager Home Nursing Care`);
    console.log(`   - Organization Title: Designation`);
    console.log(`   - Organization Location: District`);
    console.log(`   - Address: District, Karachi, Pakistan`);
    console.log(`   - Phone numbers (callable)`);
}

exportContacts().catch(console.error);
