// /api/create-session.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const { sessionName, duration, whatsappLink } = req.body;
    if (!sessionName || !duration || !whatsappLink) return res.status(400).json({ success: false, message: "Missing fields" });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(duration));

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ name: sessionName, whatsapp_link: whatsappLink, expires_at: expiresAt }])
      .select()
      .single();

    if (error) throw error;

    const sessionId = data.id;
    const uploadUrl = `/upload.html?id=${sessionId}`;
    const sessionUrl = `/session.html?id=${sessionId}`;

    return res.status(200).json({ success: true, sessionId, uploadUrl, sessionUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}
