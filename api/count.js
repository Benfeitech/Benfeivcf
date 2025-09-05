// api/count.js
import { supabaseAdmin } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { count, error } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
}
