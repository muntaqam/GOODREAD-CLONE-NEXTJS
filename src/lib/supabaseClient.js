import { createClient } from '@supabase/supabase-js';

// Retrieve your SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase dashboard or environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// console.log('SUPABASE_URL:', SUPABASE_URL);
// console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

// Create and export the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
