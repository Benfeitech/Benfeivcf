// /api/get-session.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const sessionId = req.query.id || req.query.sessionId;
    if (!sessionId) return res.status(400).json({ success: false, message: "Missing session id" });

    const { data, error } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
    if (error) return res.status(404).json({ success: false, message: "Session not found" });
    return res.status(200).json({ success: true, session: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
  }
                              
