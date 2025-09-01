// api/download.js
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function escapeVC(s){ return (s||'').toString().replace(/\r?\n/g,'\\n').replace(/,/g,'\\,'); }

module.exports = async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts?select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const rows = await r.json();
    const vcf = rows.map(row => {
      const fn = escapeVC(row.name || '');
      const tel = (row.phone || '').toString();
      return `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${fn}\r\nTEL;TYPE=CELL:${tel}\r\nEND:VCARD\r\n`;
    }).join('');
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.vcf"');
    res.status(200).send(vcf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
