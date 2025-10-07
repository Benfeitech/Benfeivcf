// api/delete.js
import { supabaseAdmin } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { phone, id, password } = req.body ?? {};

    // Password check
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Require either phone or id
    if (!phone && !id) {
      return res.status(400).json({ error: "Provide phone or id to delete" });
    }

    // Normalize phone (if provided)
    const normalizedPhone = phone ? String(phone).trim() : null;

    // Delete by id if provided, otherwise by phone
    let query = supabaseAdmin.from("contacts").delete();

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("phone", normalizedPhone);
    }

    // return deleted rows so we can see if anything was removed
    const { data, error } = await query.select("id");

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json({
      message: "Contact deleted successfully",
      deleted: data.length,
      ids: data.map((r) => r.id),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete contact" });
  }
      }
