// lib/supabaseServer.js
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using service role key (server-side only)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
