import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local
const envPath = 'c:\\Users\\h\\.gemini\\antigravity\\scratch\\saas-crm\\.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key present:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n⏳ Attempting login...\n');

const startTime = Date.now();
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'sandeepswami63@gmail.com',
    password: '123456',
  });
  const elapsed = Date.now() - startTime;
  
  if (error) {
    console.error('❌ Login FAILED (' + elapsed + 'ms):', error.message);
  } else if (data && data.session) {
    console.log('✅ Login SUCCESS (' + elapsed + 'ms)!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
  } else {
    console.log('⚠️ No session (' + elapsed + 'ms)');
  }
} catch (err) {
  const elapsed = Date.now() - startTime;
  console.error('💥 Exception (' + elapsed + 'ms):', err.message);
}
