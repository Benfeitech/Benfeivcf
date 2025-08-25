const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let sessions = {}; // { sessionId: { name, expiresAt, whatsappLink, contacts: [] } }

// ========== Create Session ==========
app.post("/api/create-session", (req, res) => {
  const { sessionName, duration, whatsappLink } = req.body;
  if (!sessionName || !duration) {
    return res.status(400).json({ error: "Session name and duration are required" });
  }

  if (duration < 1 || duration > 5) {
    return res.status(400).json({ error: "Duration must be between 1 and 5 days" });
  }

  const sessionId = uuidv4();
  const expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000; // days → ms

  sessions[sessionId] = {
    name: sessionName,
    expiresAt,
    whatsappLink,
    contacts: []
  };

  res.json({ sessionId });
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

  res.setHeader("Content-disposition", `attachment; filename=${session.name}.vcf`);
  res.setHeader("Content-type", "text/vcard");
  res.send(vcfContent);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));const expiresAt = now + durationMs;


const session = {
id,
name: sanitized,
ownerToken,
createdAt: now,
expiresAt,
contacts: []
};


const file = path.join(SESSIONS_DIR, id + '.json');
fs.writeFileSync(file, JSON.stringify(session, null, 2));


const host = req.get('host');
const protocol = req.protocol;
const uploadLink = `${protocol}://${host}/session/${id}`;
const ownerLink = `${protocol}://${host}/download/${id}?token=${ownerToken}`;


res.json({ id, uploadLink, ownerLink, expiresAt });
});


// Get session metadata
app.get('/api/session/:id', (req, res) => {
const id = req.params.id;
const file = path.join(SESSIONS_DIR, id + '.json');
if (!fs.existsSync(file)) return res.status(404).json({ error: 'Session not found' });
const session = JSON.parse(fs.readFileSync(file));
const now = Date.now();
const expired = now > session.expiresAt;
res.json({ id: session.id, name: session.name, expiresAt: session.expiresAt, expired, count: session.contacts.length });
});


// Upload contact
app.post('/api/session/:id/upload', (req, res) => {
const id = req.params.id;
const { name, phone } = req.body;
if (!name || !phone) return res.status(400).json({ error: 'Missing fields' });


const file = path.join(SESSIONS_DIR, id + '.json');
if (!fs.existsSync(file)) return res.status(404).json({ error: 'Session not found' });


const session = JSON.parse(fs.readFileSync(file));
const now = Date.now();
if (now > session.expiresAt) {
return res.status(403).json({ error: 'Session expired' });
}


// Simple phone sanitization: remove non-digits and keep plus
const sanitizedPhone = ('' + phone).replace(/[^0-9+]/g, '');
