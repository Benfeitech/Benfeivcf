const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// In-memory store (use DB in production)
const sessions = {};

// ====== Serve static files ======
app.use(express.static(path.join(__dirname, "public")));

// ====== Routes ======

// Home → Session creation page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create session
app.post("/api/create-session", (req, res) => {
  const { sessionName, whatsappLink, durationMinutes } = req.body;

  const sessionId = uuidv4();
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;

  sessions[sessionId] = {
    sessionName,
    whatsappLink,
    expiresAt,
    contacts: []
  };

  // Send back link to upload page
  res.json({ link: `/api/${sessionId}/upload` });
});

// Serve upload page
app.get("/api/:sessionId/upload", (req, res) => {
  const { sessionId } = req.params;
  if (!sessions[sessionId]) {
    return res.status(404).send("❌ Invalid session link");
  }
  res.sendFile(path.join(__dirname, "public", "create.html"));
});

// Session info (used by upload page JS)
app.get("/api/session-info/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];

  if (!session) return res.status(404).json({ error: "Invalid session link" });

  res.json({
    sessionName: session.sessionName,
    whatsappLink: session.whatsappLink,
    expiresAt: session.expiresAt
  });
});

// Upload a contact
app.post("/api/:sessionId/upload", (req, res) => {
  const { sessionId } = req.params;
  const { name, phone } = req.body;

  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Invalid session" });

  if (Date.now() > session.expiresAt) {
    return res.status(400).json({ error: "Session expired" });
  }

  // Check duplicate
  const exists = session.contacts.find(c => c.phone === phone);
  if (exists) return res.status(400).json({ error: "Contact already exists" });

  session.contacts.push({ name, phone });
  res.json({ success: true });
});

// Download contacts as VCF
app.get("/api/:sessionId/download", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  if (!session) return res.status(404).send("Invalid session");

  let vcf = "";
  session.contacts.forEach(c => {
    vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL:${c.phone}\nEND:VCARD\n`;
  });

  res.setHeader("Content-disposition", "attachment; filename=contacts.vcf");
  res.setHeader("Content-type", "text/vcard");
  res.send(vcf);
});

// ====== Start server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  
