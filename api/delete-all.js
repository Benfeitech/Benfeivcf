// api/delete-all.js
import { supabaseAdmin } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { password } = req.body ?? {};

    // Password check
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // IMPORTANT: Supabase disallows delete() without any filter in some setups.
    // We use a safe condition that matches all rows: neq('id', 0)
    // (works for UUIDs/ints because id won't equal 0). If you prefer another
    // condition, change it to suit your schema.
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .delete()
      .neq("id", 0)
      .select("id");

    if (error) {
      console.error("Supabase delete-all error:", error);
      throw error;
    }

    const deletedCount = (data && data.length) || 0;

    return res.json({
      message: "All contacts deleted successfully",
      deleted: deletedCount,
      ids: data ? data.map((r) => r.id) : [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete all contacts" });
  }
      }
