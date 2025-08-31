// /api/download-vcf.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function escapeV(s = "") { return String(s).replace(/\r?\n/g, " ").replace(/,/g, "\\,"); }

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const sessionId = req.query.sessionId || req.query.id;
    if (!sessionId) return res.status(400).json({ success: false, message: "Missing session id" });

    const { data: session, error: sErr } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
    if (sErr || !session) return res.status(404).json({ success: false, message: "Session not found" });

    const now = new Date();
    const expires = new Date(session.expires_at);
    if (now < expires) return res.status(403).json({ success: false, message: "Session has not expired yet" });

    const { data: contacts, error: cErr } = await supabase.from("contacts").select("*").eq("session_id", sessionId);
    if (cErr) throw cErr;

    let vcf = "";
    (contacts || []).forEach(c => {
      vcf += "BEGIN:VCARD\nVERSION:3.0\n";
      vcf += `FN:${escapeV(c.name || c.full_name || "")}\n`;
      vcf += `TEL;TYPE=CELL:${escapeV(c.phone_number || c.phone || "")}\n`;
      vcf += "END:VCARD\n";
    });

    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="contacts-${sessionId}.vcf"`);
    res.status(200).send(vcf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}
