const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let sessions = {}; // { sessionId: { sessionName, expiresAt, whatsappLink, contacts: [] } }

// ========== Create Session ==========
app.post("/api/session", (req, res) => {
  const { sessionName, duration, whatsappLink } = req.body;
  const sessionId = uuidv4();

  const expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000;
  sessions[sessionId] = { sessionName, duration, whatsappLink, expiresAt, contacts: [] };

  // Build base URL dynamically from request
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({
    message: "Session created",
    sessionId,
    uploadPage: `${baseUrl}/index.html?sid=${sessionId}`,  // 👈 user page
    adminPage: `${baseUrl}/admin.html?sid=${sessionId}`    // 👈 admin page
  });
});

// ========== Get Session Info ==========
app.get("/api/:sessionId/info", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  res.json({
    sessionName: session.sessionName,
    expiresAt: session.expiresAt,
    whatsappLink: session.whatsappLink
  });
});


// ========== Upload Contact ==========
app.post("/api/:sessionId/upload", (req, res) => {
  const { sessionId } = req.params;
  const { name, phone } = req.body;

  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (Date.now() > session.expiresAt) {
    delete sessions[sessionId];
    return res.status(400).json({ error: "This session has expired" });
  }

  const exists = session.contacts.find(c => c.phone === phone);
  if (exists) {
    return res.status(400).json({ error: "Contact already exists" });
  }

  session.contacts.push({ name, phone });
  res.json({ message: "Contact uploaded successfully" });
});

// ========== Download VCF ==========
app.get("/api/:sessionId/download", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];

  if (!session) return res.status(404).send("Session not found");

  let vcfContent = "";
  session.contacts.forEach(c => {
    vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL:${c.phone}\nEND:VCARD\n`;
  });

  res.setHeader("Content-disposition", `attachment; filename=${session.sessionName}.vcf`);
  res.setHeader("Content-type", "text/vcard");
  res.send(vcfContent);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
