// pages/api/contacts/count.js
import { supabaseAdmin } from "../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // count number of rows in contacts table
    const { count, error } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching contacts count:", err.message);
    return res.status(500).json({ error: "Failed to fetch count" });
  }
}
