// routes/count.js
import express from "express";
import { supabaseAdmin } from "../lib/supabaseServer.js";

const router = express.Router();

router.get("/contacts/count", async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ count: count ?? 0 });
  } catch (err) {
    console.error("Error fetching contacts count:", err);
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

export default router;
