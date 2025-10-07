import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/api/delete-all", async (req, res) => {
  const { password } = req.body;

  // ✅ Password check
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ message: "Unauthorized" });

  try {
    // ⚠️ Delete all rows in "contacts"
    const { error } = await supabase.from("contacts").delete().neq("id", 0);
    if (error) throw error;

    res.json({ message: "All contacts deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting all contacts" });
  }
});
