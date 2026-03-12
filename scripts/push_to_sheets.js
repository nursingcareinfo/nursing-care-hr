/**
 * Push Staff Data to Google Apps Script Web App
 * Run with: node scripts/push_to_sheets.js
 */

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://script.google.com/macros/s/AKfycby28svFrw8At96G5sqgXH4sopdTA6Kx6hnrJt-1-NFtiR7ZHAqbH8p3TEtiA4PA7ZtUbA/exec';
const DATA_FILE = './data/master_report/master_staff_report.md';

async function parseMarkdownStaffData() {
    const fs = require('fs');
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const lines = content.split('\n');
    
    const staff = [];
    for (const line of lines) {
        if (!line.includes('|') || line.includes('---') || line.includes('Assigned ID')) {
            continue;
        }
        
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length >= 9) {
            staff.push({
                assignedId: cols[0],
                name: cols[1],
                fatherHusbandName: cols[2],
                dob: cols[3],
                gender: cols[4],
                cnic: cols[5],
                designation: cols[6],
                contact1: cols[7],
                district: cols[8]
            });
        }
    }
    return staff;
}

async function pushToWebApp(data) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const url = new URL(WEB_APP_URL);
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log('📊 Parsing staff data...');
    const staff = await parseMarkdownStaffData();
    console.log(`   Found ${staff.length} staff records`);
    
    if (WEB_APP_URL.includes('YOUR_WEB_APP_URL_HERE')) {
        console.error('\n❌ Please set WEB_APP_URL environment variable');
        process.exit(1);
    }
    
    console.log(`\n🚀 Pushing to ${WEB_APP_URL}...`);
    
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const record of staff) {
        try {
            const response = await pushToWebApp(record);
            // Handle redirects if response is HTML
            if (response.includes('Moved Temporarily') || response.includes('Page not found')) {
                failed++;
                continue;
            }
            const result = JSON.parse(response);
            if (result.success) {
                imported += result.imported || 1;
                skipped += result.skipped || 0;
            } else {
                failed++;
            }
        } catch (e) {
            failed++;
        }
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
}

main().catch(console.error);
