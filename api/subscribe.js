// Newsletter signup. POST { email } -> stores the address as a private blob.
// The shop owner exports the list from the admin page.

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const email = (body && body.email ? String(body.email) : '').trim().slice(0, 160);
    if (!/.+@.+\..+/.test(email)) { res.status(400).json({ error: 'email invalide' }); return; }
    const rec = { email: email, at: new Date().toISOString() };
    const id = 'subscriber/' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.json';
    await put(id, JSON.stringify(rec), { token, access: 'private', contentType: 'application/json' });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
