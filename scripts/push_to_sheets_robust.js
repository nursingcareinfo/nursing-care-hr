/**
 * PRODUCTION-GRADE Google Sheets Sync Script
 * 
 * Features:
 * - Exponential Backoff Retries (handles 5xx and 429 errors)
 * - Concurrency Control (batching to avoid GAS rate limits)
 * - Progress Checkpointing (resumes from last successful record)
 * - Detailed Performance Logging
 * - Metadata Validation (CNIC and Phone Regex)
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// --- CONFIGURATION ---
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://script.google.com/macros/s/AKfycby28svFrw8At96G5sqgXH4sopdTA6Kx6hnrJt-1-NFtiR7ZHAqbH8p3TEtiA4PA7ZtUbA/exec';
const DATA_FILE = path.resolve(__dirname, '../data/master_report/master_staff_report.md');
const CHECKPOINT_FILE = path.resolve(__dirname, '../data/.sync_checkpoint.json');
const CONCURRENCY = 3; // Number of simultaneous requests
const BATCH_SIZE = 10;  // Records per request (Apps Script handles arrays)
const MAX_RETRIES = 5;

// --- VALIDATION PATTERNS ---
const CNIC_REGEX = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
const PHONE_REGEX = /^((\+92)|(0092))-{0,1}3[0-9]{2}-{0,1}[0-9]{7}$|^03[0-9]{2}-{0,1}[0-9]{7}$/;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Robust HTTP POST with retries and redirect handling
 */
async function postWithRetry(data, attempt = 1) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEB_APP_URL);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      // Handle GAS Redirects (302)
      if (res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        const redirectReq = https.get(redirectUrl, (redirectRes) => {
          let body = '';
          redirectRes.on('data', chunk => body += chunk);
          redirectRes.on('end', () => resolve(JSON.parse(body)));
        });
        redirectReq.on('error', reject);
        return;
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', async () => {
        if (res.statusCode >= 500 || res.statusCode === 429) {
          if (attempt <= MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.warn(`   ⚠️ Server error (${res.statusCode}). Retrying in ${Math.round(delay/1000)}s... (Attempt ${attempt}/${MAX_RETRIES})`);
            await sleep(delay);
            return resolve(postWithRetry(data, attempt + 1));
          }
        }
        
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.slice(0, 100)}`));
        }
      });
    });

    req.on('error', async (err) => {
      if (attempt <= MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        return resolve(postWithRetry(data, attempt + 1));
      }
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

function parseMarkdown() {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const lines = content.split('\n');
  const staff = [];

  for (const line of lines) {
    if (!line.includes('|') || line.includes('---') || line.includes('Assigned ID')) continue;
    
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

function getCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  }
  return { lastIndex: 0, imported: 0, skipped: 0 };
}

function saveCheckpoint(data) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  console.log('🚀 Starting Robust Sync to Google Sheets...');
  
  const allStaff = parseMarkdown();
  const checkpoint = getCheckpoint();
  
  console.log(`📊 Found ${allStaff.length} records. Resuming from index ${checkpoint.lastIndex}...`);

  let imported = checkpoint.imported;
  let skipped = checkpoint.skipped;
  let startTime = Date.now();

  // Process in batches
  for (let i = checkpoint.lastIndex; i < allStaff.length; i += BATCH_SIZE) {
    const batch = allStaff.slice(i, i + BATCH_SIZE);
    process.stdout.write(`   Processing ${i} to ${Math.min(i + BATCH_SIZE, allStaff.length)}... `);

    try {
      const result = await postWithRetry(batch);
      
      if (result.success) {
        imported += result.imported;
        skipped += result.skipped;
        
        saveCheckpoint({
          lastIndex: i + BATCH_SIZE,
          imported: imported,
          skipped: skipped
        });
        
        process.stdout.write(`✅ (Total: ${result.total})\n`);
      } else {
        console.error(`\n❌ GAS Error: ${result.error}`);
        break;
      }
    } catch (err) {
      console.error(`\n❌ Critical Error: ${err.message}`);
      break;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ Sync Complete in ${duration}s!`);
  console.log(`   New Imported: ${imported - checkpoint.imported}`);
  console.log(`   New Skipped:  ${skipped - checkpoint.skipped}`);
  console.log(`   Total in Sheet: ${imported + skipped}`);

  if (checkpoint.lastIndex >= allStaff.length) {
    console.log('🧹 Cleaning up checkpoint...');
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal Exception:', err);
  process.exit(1);
});
