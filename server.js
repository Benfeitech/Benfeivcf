const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Session store in memory
let sessions = {}; // { sessionId: { name, expiresAt, whatsappLink, contacts: [] } }

// ========== Create Session ==========
app.post("/api/session", (req, res) => {
  const { sessionName, duration, whatsappLink } = req.body;
  if (!sessionName || !duration || !whatsappLink) {
    return res.status(400).json({ error: "All fields required" });
  }

  const sessionId = uuidv4();
  const expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000; // days in ms

  sessions[sessionId] = {
    name: sessionName,
    expiresAt,
    whatsappLink,
    contacts: [],
  };

  res.json({ link: `/upload.html?sessionId=${sessionId}` });
});

// ========== Get Session ==========
app.get("/api/session/:id", (req, res) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

// ========== Upload Contact ==========
app.post("/api/session/:id/contact", (req, res) => {
  const { name, phone } = req.body;
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (Date.now() > session.expiresAt) {
    return res.status(400).json({ error: "Session expired" });
  }

  // Prevent duplicates
  if (session.contacts.find(c => c.phone === phone)) {
    return res.json({ message: "Contact already exists" });
  }

  session.contacts.push({ name, phone });
  res.json({ message: "Contact uploaded successfully" });
});

// ========== Download VCF ==========
app.get("/api/session/:id/download", (req, res) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (Date.now() < session.expiresAt) {
    return res.status(400).json({ error: "Session not expired yet" });
  }

  let vcfData = "";
  session.contacts.forEach(contact => {
    vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nTEL:${contact.phone}\nEND:VCARD\n`;
  });

  res.setHeader("Content-Type", "text/vcard");
  res.setHeader("Content-Disposition", `attachment; filename="${session.name}.vcf"`);
  res.send(vcfData);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
