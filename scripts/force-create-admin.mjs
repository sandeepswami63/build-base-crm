import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually to ensure variables are loaded
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      // Remove inline comments
      value = value.split(' #')[0].trim();
      // Remove quotes if present
      value = value.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('⏳ Attempting to force-create or update admin user...');
  
  // First list users to see if they exist
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  const existingUser = listData?.users?.find(u => u.email === 'sandeepswami63@gmail.com');

  if (existingUser) {
    console.log('⚠️ User already exists! Updating password and confirming email...');
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: '123456', email_confirm: true }
    );
    
    if (error) {
      console.error('❌ Failed to update existing user:', error.message);
    } else {
      console.log('✅ Successfully recovered and updated admin user!');
      console.log('User ID:', data?.user?.id);
      console.log('Email:', data?.user?.email);
    }
  } else {
    console.log('User does not exist. Creating new account...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'sandeepswami63@gmail.com',
      password: '123456',
      email_confirm: true,
    });

    if (error) {
      console.error('❌ Failed to create admin user:', error.message);
    } else {
      console.log('✅ Successfully created admin user!');
      console.log('User ID:', data?.user?.id);
      console.log('Email:', data?.user?.email);
    }
  }
}

createAdmin();
