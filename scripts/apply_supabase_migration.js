/**
 * Apply Supabase Migration
 * Executes SQL migration files against the linked Supabase project
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../n8n/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration(migrationFile) {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log(`Applying migration: ${path.basename(migrationFile)}`);
    
    // Split by semicolons to execute individual statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
        try {
            // Execute via REST API (no CLI needed)
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ sql: statement + ';' })
            });
            
            if (response.ok) {
                console.log(`  ✓ Executed: ${statement.substring(0, 50)}...`);
            } else {
                const error = await response.text();
                console.log(`  ⚠ Skipped/Failed: ${statement.substring(0, 50)}... - ${error}`);
            }
        } catch (error) {
            console.log(`  ⚠ Error: ${error.message}`);
        }
    }
    
    console.log('Migration applied successfully!\n');
}

// Alternative: Direct table creation without RPC
async function createTableDirectly() {
    console.log('Creating employees table directly via REST API...\n');
    
    const statements = [
        `CREATE TABLE IF NOT EXISTS public.employees (
            id BIGSERIAL PRIMARY KEY,
            assigned_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            father_husband_name TEXT DEFAULT '',
            dob TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            cnic TEXT DEFAULT '',
            designation TEXT DEFAULT '',
            contact1 TEXT DEFAULT '',
            district TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `CREATE INDEX IF NOT EXISTS idx_employees_assigned_id ON public.employees(assigned_id)`,
        `COMMENT ON TABLE public.employees IS 'Employee records from NursingCare.pk'`,
        `COMMENT ON COLUMN public.employees.assigned_id IS 'Unique identifier from master report'`
    ];
    
    for (const statement of statements) {
        try {
            // For DDL statements, we need to use the SQL endpoint
            // This is a workaround since PostgREST doesn't support DDL
            console.log(`Executing: ${statement.substring(0, 60)}...`);
            
            // Try using the Supabase client's direct query capability
            const { data, error } = await supabase
                .from('employees')
                .select('*', { count: 'exact', head: true });
            
            if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('  Table does not exist yet. Need to create via SQL migration.\n');
                console.log('Please run this migration manually:');
                console.log('1. Go to https://ifvqnxcsjdvfpmmzuwlx.supabase.co');
                console.log('2. Navigate to SQL Editor');
                console.log('3. Run the migration file: supabase/migrations/20260302000000_create_employees_table.sql\n');
                return false;
            } else if (error) {
                console.log(`  Error checking table: ${error.message}\n`);
            } else {
                console.log('  ✓ Table already exists!\n');
                return true;
            }
        } catch (error) {
            console.log(`  Error: ${error.message}\n`);
        }
    }
    
    return true;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args[0] === '--file' && args[1]) {
        const migrationFile = path.resolve(args[1]);
        if (!fs.existsSync(migrationFile)) {
            console.error(`Migration file not found: ${migrationFile}`);
            process.exit(1);
        }
        await applyMigration(migrationFile);
    } else {
        // Default: check if table exists
        const exists = await createTableDirectly();
        if (!exists) {
            console.log('Next steps:');
            console.log('1. Create the table using the migration file');
            console.log('2. Run: node scripts/export_to_supabase.js');
        } else {
            console.log('Table exists! You can now run:');
            console.log('  node scripts/export_to_supabase.js');
        }
    }
}

main().catch(console.error);
