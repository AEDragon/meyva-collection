// Order API for meyva collection.
// POST /api/orders  -> create an order (open to customers)
// GET  /api/orders?key=ADMIN_KEY -> list all orders (admin only)
//
// Orders are stored as individual private blobs (order/<id>.json) in the
// linked Vercel Blob store, so concurrent orders never overwrite each other.

import { put, list, get, del } from '@vercel/blob';

const PREFIX = 'order/';

// Admin auth: the owner access key (?key= or x-admin-key header).
function isAdmin(req) {
  const key = String((req.query && req.query.key) || req.headers['x-admin-key'] || '').trim();
  const expected = String(process.env.ADMIN_KEY || '').trim();
  return !!(expected && key === expected);
}

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

// Visuel choisi : on n'accepte qu'un chemin d'asset du site (pas d'URL arbitraire).
function cleanAsset(v) {
  const s = String(v == null ? '' : v);
  return /^assets\/[A-Za-z0-9_./-]+$/.test(s) ? s : '';
}
function cleanItem(it) {
  it = it || {};
  const opt = it.option;
  let option = null;
  if (opt) {
    option = {};
    if (opt.tier) option.tier = { qty: Number(opt.tier.qty) || 0, price: Number(opt.tier.price) || 0 };
    if (opt.model) {
      option.model = { label: clean(opt.model.label, 80) };
      const img = cleanAsset(opt.model.img);
      if (img) option.model.img = img;
    }
    if (Array.isArray(opt.posters)) {
      option.posters = opt.posters.slice(0, 30).map((p) => {
        if (p && typeof p === 'object') {
          const o = { label: clean(p.label, 80) };
          const img = cleanAsset(p.img);
          if (img) o.img = img;
          return o;
        }
        return { label: clean(p, 80) };
      });
    }
  }
  return {
    name: clean(it.name, 120),
    qty: Number(it.qty) || 1,
    unitPrice: Number(it.unitPrice) || 0,
    cat: clean(it.cat, 40),
    option: option,
  };
}

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
        items: Array.isArray(body.items) ? body.items.slice(0, 50).map(cleanItem) : [],
        files: Array.isArray(body.files)
          ? body.files.slice(0, 20).map((fl) => ({ path: clean(fl && fl.path, 200), name: clean(fl && fl.name, 120) })).filter((fl) => fl.path)
          : [],
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
      if (!isAdmin(req)) {
        res.status(401).json({ error: 'non autorisé' });
        return;
      }
      // Stream a single uploaded customer file (admin download)
      const filePath = req.query && req.query.file;
      if (filePath) {
        if (!/^upload\/[A-Za-z0-9_.\-]+$/.test(String(filePath))) {
          res.status(400).json({ error: 'chemin invalide' });
          return;
        }
        const g = await get(String(filePath), { token, access: 'private' });
        const ab = await new Response(g.stream).arrayBuffer();
        const fname = String(filePath).split('-').slice(2).join('-') || 'fichier';
        res.setHeader('Content-Type', (g && g.contentType) || 'application/octet-stream');
        res.setHeader('Content-Disposition', 'inline; filename="' + fname + '"');
        res.status(200).send(Buffer.from(ab));
        return;
      }
      // List newsletter subscribers (admin)
      if (req.query && req.query.subs) {
        const { blobs } = await list({ prefix: 'subscriber/', token });
        const subs = await Promise.all(blobs.map(async (b) => {
          try { const g = await get(b.pathname, { token, access: 'private' }); return JSON.parse(await new Response(g.stream).text()); }
          catch (e) { return null; }
        }));
        res.status(200).json({ subscribers: subs.filter(Boolean) });
        return;
      }
      const orders = await readAll(token);
      res.status(200).json({ orders });
      return;
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) {
        res.status(401).json({ error: 'non autorisé' });
        return;
      }
      const id = (req.query && req.query.id) || req.headers['x-order-id'];
      if (!id || !/^CMD-[0-9]+-[0-9]+$/.test(String(id))) {
        res.status(400).json({ error: 'id de commande invalide' });
        return;
      }
      await del(PREFIX + id + '.json', { token });
      res.status(200).json({ ok: true, id: id });
      return;
    }

    if (req.method === 'PATCH') {
      if (!isAdmin(req)) { res.status(401).json({ error: 'non autorisé' }); return; }
      const id = (req.query && req.query.id) || req.headers['x-order-id'];
      if (!id || !/^CMD-[0-9]+-[0-9]+$/.test(String(id))) { res.status(400).json({ error: 'id invalide' }); return; }
      const paid = String((req.query && req.query.status) || '') === 'paid';
      const pathname = PREFIX + id + '.json';
      let order;
      try { const g = await get(pathname, { token, access: 'private' }); order = JSON.parse(await new Response(g.stream).text()); }
      catch (e) { res.status(404).json({ error: 'commande introuvable' }); return; }
      order.status = paid ? 'payé' : 'nouveau';
      order.paidAt = paid ? new Date().toISOString() : null;
      await put(pathname, JSON.stringify(order), { token, access: 'private', contentType: 'application/json', allowOverwrite: true });
      res.status(200).json({ ok: true, status: order.status });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
