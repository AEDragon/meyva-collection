// Catalogue API for meyva collection — lets the shop owner manage products herself.
//
// GET  /api/products            -> public: returns the catalog overlay { overrides, custom, hidden, categories }
// POST /api/products            -> admin: save the whole overlay (x-admin-key)
// POST /api/products?image=1     -> admin: upload a public product image, returns { url }
//
// The overlay is merged on top of the built-in PRODUCTS list in the storefront,
// so the base catalog keeps working even if this blob is missing/empty.

import { put, list, get } from '@vercel/blob';

const PATH = 'catalog/catalog.json';
const EMPTY = { overrides: {}, custom: [], hidden: [], categories: [] };

function isAdmin(req) {
  const key = String((req.query && req.query.key) || req.headers['x-admin-key'] || '').trim();
  const expected = String(process.env.ADMIN_KEY || '').trim();
  return !!(expected && key === expected);
}

function s(v, max) { return String(v == null ? '' : v).slice(0, max); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

// Champs qu'un propriétaire peut modifier (le reste de la structure produit est figé).
const TEXT_FIELDS = {
  name: 200, name_en: 200, desc: 600, desc_en: 600, long: 2500, long_en: 2500,
  secondary: 120, secondary_en: 120, cat: 60, image: 600, badge: 60,
};

function cleanFields(o) {
  o = o || {};
  const out = {};
  Object.keys(TEXT_FIELDS).forEach((k) => { if (o[k] != null) out[k] = s(o[k], TEXT_FIELDS[k]); });
  if (o.price != null) out.price = num(o.price);
  if (o.fromPrice != null) out.fromPrice = num(o.fromPrice);
  if (o.soldOut != null) out.soldOut = !!o.soldOut;
  return out;
}

function cleanCustom(c) {
  c = c || {};
  const id = /^custom-[A-Za-z0-9_-]+$/.test(String(c.id || '')) ? String(c.id) : ('custom-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  const f = cleanFields(c);
  return Object.assign({
    id: id,
    custom: true,
    name: s(c.name || 'Produit', 200),
    cat: s(c.cat || 'Autres', 60),
    price: num(c.price),
  }, f);
}

function cleanCatalog(body) {
  const ov = (body && body.overrides && typeof body.overrides === 'object') ? body.overrides : {};
  const overrides = {};
  Object.keys(ov).slice(0, 200).forEach((id) => {
    const key = s(id, 80);
    if (key) overrides[key] = cleanFields(ov[id]);
  });
  const custom = Array.isArray(body && body.custom) ? body.custom.slice(0, 200).map(cleanCustom) : [];
  const hidden = Array.isArray(body && body.hidden)
    ? body.hidden.slice(0, 200).map((x) => s(x, 80)).filter(Boolean)
    : [];
  const categories = Array.isArray(body && body.categories)
    ? body.categories.slice(0, 40).map((x) => s(x, 60)).filter(Boolean)
    : [];
  return { overrides, custom, hidden, categories };
}

async function readCatalog(token) {
  try {
    const { blobs } = await list({ prefix: PATH, token });
    if (!blobs.length) return EMPTY;
    const g = await get(PATH, { token, access: 'private' });
    const txt = await new Response(g.stream).text();
    const j = JSON.parse(txt);
    return {
      overrides: (j && j.overrides) || {},
      custom: Array.isArray(j && j.custom) ? j.custom : [],
      hidden: Array.isArray(j && j.hidden) ? j.hidden : [],
      categories: Array.isArray(j && j.categories) ? j.categories : [],
    };
  } catch (e) { return EMPTY; }
}

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }

  try {
    if (req.method === 'GET') {
      const catalog = await readCatalog(token);
      // Cache court côté CDN : le storefront récupère vite, mais les mises à jour
      // se voient en quelques secondes.
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=60');
      res.status(200).json({ catalog });
      return;
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) { res.status(401).json({ error: 'non autorisé' }); return; }
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

      // Upload d'une image de produit (publique, pour l'affichage boutique)
      if ((req.query && req.query.image) || (body && body.op === 'image')) {
        const name = s(body && body.name, 120) || 'image';
        const type = s(body && body.type, 80) || 'image/jpeg';
        const dataBase64 = body && body.dataBase64;
        if (!dataBase64) { res.status(400).json({ error: 'image manquante' }); return; }
        const buf = Buffer.from(String(dataBase64), 'base64');
        if (buf.length > 6 * 1024 * 1024) { res.status(413).json({ error: 'image trop lourde (max 6 Mo)' }); return; }
        const safe = name.replace(/[^A-Za-z0-9._-]/g, '_');
        const blob = await put('product/' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe, buf, {
          token, access: 'public', contentType: type,
        });
        res.status(200).json({ ok: true, url: blob.url });
        return;
      }

      // Sauvegarde du catalogue complet
      const catalog = cleanCatalog(body);
      await put(PATH, JSON.stringify(catalog), {
        token, access: 'private', contentType: 'application/json', allowOverwrite: true,
      });
      res.status(200).json({ ok: true, catalog });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String((e && e.message) || e) });
  }
}
