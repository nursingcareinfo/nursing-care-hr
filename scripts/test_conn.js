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

async function test() {
    console.log('Testing Supabase connection...');
    const { data, count, error } = await supabase.from('staff').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success! Count:', count);
    }
}

test();
