// Order API for meyva collection.
// POST /api/orders  -> create an order (open to customers)
// GET  /api/orders?key=ADMIN_KEY -> list all orders (admin only)
//
// Orders are stored as individual private blobs (order/<id>.json) in the
// linked Vercel Blob store, so concurrent orders never overwrite each other.

import { put, list, get } from '@vercel/blob';

const PREFIX = 'order/';

async function readAll(token) {
  const { blobs } = await list({ prefix: PREFIX, token });
  const orders = await Promise.all(blobs.map(async (b) => {
    try {
      const g = await get(b.pathname, { token, access: 'private' });
      const txt = await new Response(g.stream).text();
      return JSON.parse(txt);
    } catch (e) { return null; }
  }));
  return orders
    .filter(Boolean)
    .sort((a, b) => (String(a.createdAt) < String(b.createdAt) ? -1 : 1));
}

function clean(v, max) { return String(v == null ? '' : v).slice(0, max); }

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }

  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      if (!body || !body.nom || !body.telephone) {
        res.status(400).json({ error: 'champs requis manquants (nom, telephone)' });
        return;
      }
      const id = 'CMD-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
      const order = {
        id: id,
        createdAt: new Date().toISOString(),
        nom: clean(body.nom, 120),
        telephone: clean(body.telephone, 40),
        telephone2: clean(body.telephone2, 40),
        gouvernorat: clean(body.gouvernorat, 60),
        ville: clean(body.ville, 80),
        adresse: clean(body.adresse, 300),
        note: clean(body.note, 500),
        items: Array.isArray(body.items) ? body.items.slice(0, 50) : [],
        subtotal: Number(body.subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        total: Number(body.total) || 0,
        colis: Number(body.colis) || 1,
        status: 'nouveau',
      };
      await put(PREFIX + id + '.json', JSON.stringify(order), {
        token, access: 'private', contentType: 'application/json',
      });
      res.status(200).json({ ok: true, id: id });
      return;
    }

    if (req.method === 'GET') {
      const key = (req.query && req.query.key) || req.headers['x-admin-key'];
      if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
        res.status(401).json({ error: 'non autorisé' });
        return;
      }
      const orders = await readAll(token);
      res.status(200).json({ orders });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
