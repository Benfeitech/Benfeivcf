// /api/upload-contact.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function normalizePhone(p) {
  return String(p || "").replace(/\D/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const { sessionId, name, phone } = req.body;
    if (!sessionId || !name || !phone) return res.status(400).json({ success: false, message: "Missing fields" });

    // Check session exists
    const { data: session } = await supabase.from("sessions").select("id").eq("id", sessionId).single();
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    // Check duplicates (normalize digits)
    const { data: existing } = await supabase.from("contacts").select("phone_number").eq("session_id", sessionId);
    const incomingNorm = normalizePhone(phone);
    if ((existing || []).some(c => normalizePhone(c.phone_number) === incomingNorm)) {
      return res.status(200).json({ success: false, exists: true, message: "Contact already exists" });
    }

    // Insert
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ session_id: sessionId, name, phone_number: phone }])
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: "Contact uploaded successfully", contact: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}
