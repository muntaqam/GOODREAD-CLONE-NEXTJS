import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY; // Replace with your public anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;