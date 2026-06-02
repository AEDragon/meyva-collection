// Customer file upload (custom stickers, certificates…).
// POST { name, type, dataBase64 } -> stores the file as a private blob and
// returns its path. The path is then attached to the order; the shop owner
// downloads it from the admin page via GET /api/orders?file=<path>.

import { put } from '@vercel/blob';

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (base64 of ~3.7 MB file)

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const dataBase64 = body && body.dataBase64;
    if (!dataBase64) { res.status(400).json({ error: 'aucun fichier' }); return; }

    const buf = Buffer.from(String(dataBase64), 'base64');
    if (!buf.length) { res.status(400).json({ error: 'fichier vide' }); return; }
    if (buf.length > MAX_BYTES) { res.status(413).json({ error: 'fichier trop lourd' }); return; }

    const safe = String(body.name || 'fichier').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80) || 'fichier';
    const path = 'upload/' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe;
    await put(path, buf, {
      token,
      access: 'private',
      contentType: body.type || 'application/octet-stream',
    });
    res.status(200).json({ ok: true, path: path, name: safe });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
