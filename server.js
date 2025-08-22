const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Storage folder for sessions
const DATA_DIR = path.join(__dirname, "sessions");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Upload contact (simple JSON format)
app.post("/upload", (req, res) => {
  const { session, name, phone } = req.body;
  if (!session || !name || !phone) {
    return res.status(400).send("Missing required fields.");
  }

  const sessionFile = path.join(DATA_DIR, `${session}.json`);
  let contacts = [];

  if (fs.existsSync(sessionFile)) {
    contacts = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
  }

  // Check for duplicates
  if (contacts.some(c => c.phone === phone)) {
    return res.send("Contact already exists.");
  }

  contacts.push({ name, phone });
  fs.writeFileSync(sessionFile, JSON.stringify(contacts, null, 2));

  res.send("Contact uploaded successfully.");
});

// Download as VCF
app.get("/download/:session", (req, res) => {
  const sessionFile = path.join(DATA_DIR, `${req.params.session}.json`);
  if (!fs.existsSync(sessionFile)) {
    return res.status(404).send("Session not found.");
  }

  const contacts = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
  let vcfData = "";

  contacts.forEach(contact => {
    vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nTEL:${contact.phone}\nEND:VCARD\n`;
  });

  res.setHeader("Content-Disposition", `attachment; filename=${req.params.session}.vcf`);
  res.setHeader("Content-Type", "text/vcard");
  res.send(vcfData);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
