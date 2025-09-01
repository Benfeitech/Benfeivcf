// api/upload.js
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    let body = req.body;
    if (!body || Object.keys(body).length === 0) {
      try { body = JSON.parse(req?.rawBody || '{}'); } catch(e){ body = {}; }
    }
    const { name, phone } = body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const normalized = ('' + phone).replace(/[^\d+]/g, '');
    const checkUrl = `${SUPABASE_URL}/rest/v1/contacts?phone=eq.${encodeURIComponent(normalized)}&select=*`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    const checkResp = await fetch(checkUrl, { headers });
    const existing = await checkResp.json();
    if (existing.length) return res.status(200).json({ exists: true });

    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ name: name || null, phone: normalized })
    });
    const inserted = await insertResp.json();
    return res.status(200).json({ success: true, inserted: inserted[0] || inserted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
                        
