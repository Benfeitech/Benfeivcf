import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/api/delete", async (req, res) => {
  const { phone, password } = req.body;

  // ✅ Password check
  if (password !== ADMIN_PASSWORD) 
    return res.status(401).json({ message: "Unauthorized" });

  try {
    // 🔥 Delete contact with matching phone
    const { error, count } = await supabase
      .from("contacts")
      .delete()
      .eq("phone", phone)
      .select("id", { count: "exact" });

    if (error) throw error;

    if (count === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: `Contact with phone ${phone} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting contact" });
  }
});
