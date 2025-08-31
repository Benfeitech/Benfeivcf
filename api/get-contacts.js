// /api/get-contacts.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const sessionId = req.query.sessionId || req.query.id;
    if (!sessionId) return res.status(400).json({ success: false, message: "Missing session id" });

    const { data, error } = await supabase.from("contacts").select("*").eq("session_id", sessionId);
    if (error) throw error;
    return res.status(200).json({ success: true, contacts: data || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}
