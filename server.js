const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');


const app = express();
const PORT = process.env.PORT || 3000;


const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');


// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Create session
app.post('/api/create-session', (req, res) => {
const { sessionName, durationMinutes } = req.body;
if (!sessionName || !durationMinutes) return res.status(400).json({ error: 'Missing fields' });


const id = uuidv4().slice(0, 8);
const ownerToken = uuidv4();
const sanitized = sanitize(sessionName).slice(0, 40) || 'session';
const now = Date.now();
const durationMs = Number(durationMinutes) * 60 * 1000;
const expiresAt = now + durationMs;


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
