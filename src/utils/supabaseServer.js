// src/utils/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // Use the same URL as the client-side
  process.env.SUPABASE_SERVICE_KEY      // Use the service key for server-side interactions
);

export default supabaseServer;
