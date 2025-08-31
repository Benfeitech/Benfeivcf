const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { saveSession, getSession, uploadContact, generateVCF } = require("./supabase");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create session
app.post("/create-session", async (req, res) => {
  const { sessionName, whatsappLink, expiresIn } = req.body;
  if (!sessionName || !whatsappLink || !expiresIn) {
    return res.json({ success: false, error: "All fields required" });
  }
  try {
    const session = await saveSession(sessionName, whatsappLink, expiresIn);
    res.json({
      success: true,
      url: `https://benfeivcf.vercel.app//session.html?id=${session.id}`, // adjust when deploying
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get session
app.get("/session/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const session = await getSession(id);
    if (!session) return res.json({ success: false, error: "Not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Upload contact
app.post("/upload-contact/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  try {
    const result = await uploadContact(id, name, phone);
    if (!result.success) return res.json(result);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Download VCF
app.get("/download-vcf/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const vcf = await generateVCF(id);
    res.setHeader("Content-Type", "text/vcard");
    res.setHeader("Content-Disposition", `attachment; filename=session-${id}.vcf`);
    res.send(vcf);
  } catch (err) {
    res.status(500).send("Error generating VCF");
  }
});

// Start server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
        
