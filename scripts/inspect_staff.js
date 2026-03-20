const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../n8n/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_KEY);

async function inspectTable() {
    console.log('Inspecting staff table structure...');
    const { data, error } = await supabase.from('staff').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else if (data.length > 0) {
        console.log('Columns found in staff table:');
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data found in staff table.');
    }
}

inspectTable();
