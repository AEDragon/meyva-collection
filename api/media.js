// Admin media upload (product / post / event images shown on the site).
// POST { name, type, dataBase64 } -> stores a PUBLIC blob under media/ and
// returns its URL, ready to be saved in the content document.
// Unlike /api/upload (private customer files), this endpoint is admin-only
// and the files it stores are publicly readable — they are site images.

import { put } from '@vercel/blob';
import { verifyToken } from '@clerk/backend';

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB binary
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

async function isAdmin(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (auth.startsWith('Bearer ') && process.env.CLERK_SECRET_KEY) {
    try {
      await verifyToken(auth.slice(7), { secretKey: process.env.CLERK_SECRET_KEY });
      return true;
    } catch (e) { /* fall through to key check */ }
  }
  const key = (req.query && req.query.key) || req.headers['x-admin-key'];
  if (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY) return true;
  return false;
}

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }

  try {
    if (!(await isAdmin(req))) { res.status(401).json({ error: 'non autorisé' }); return; }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const dataBase64 = body && body.dataBase64;
    if (!dataBase64) { res.status(400).json({ error: 'aucun fichier' }); return; }

    const type = String(body.type || '');
    if (!ALLOWED_TYPES.includes(type)) {
      res.status(415).json({ error: 'format non supporté (JPG, PNG, WebP, GIF, AVIF)' });
      return;
    }

    const buf = Buffer.from(String(dataBase64), 'base64');
    if (!buf.length) { res.status(400).json({ error: 'fichier vide' }); return; }
    if (buf.length > MAX_BYTES) { res.status(413).json({ error: 'fichier trop lourd (max 4 Mo)' }); return; }

    const safe = String(body.name || 'image').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80) || 'image';
    const path = 'media/' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe;
    const blob = await put(path, buf, { token, access: 'public', contentType: type });
    res.status(200).json({ ok: true, url: blob.url, path: path });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
