// lib/supabaseServer.js
import { createClient } from "@supabase/supabase-js";

// These should come from your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

// Use the service role key ONLY on the server side (never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
