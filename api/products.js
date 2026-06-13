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
const EMPTY = { overrides: {}, custom: [], hidden: [], categories: [], news: [], events: [] };

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

// Galerie : jusqu'à 24 photos par produit (URLs d'images déjà téléversées).
function cleanImages(v) {
  return Array.isArray(v) ? v.slice(0, 24).map((x) => s(x, 600)).filter(Boolean) : [];
}
// Champs personnalisés : liste de { libellé, valeur } (+ versions EN facultatives).
function cleanSpecs(v) {
  return Array.isArray(v)
    ? v.slice(0, 24).map((f) => ({
        label: s(f && f.label, 80), value: s(f && f.value, 400),
        label_en: s(f && f.label_en, 80), value_en: s(f && f.value_en, 400),
      })).filter((x) => x.label || x.value)
    : [];
}

// Paliers de prix : liste de { qty, price } (ex. 1 -> 10 DT, 2 -> 14 DT).
function cleanTiers(v) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 24)
    .map((t) => ({ qty: Math.max(1, Math.round(num(t && t.qty))), price: num(t && t.price) }))
    .filter((t) => t.qty > 0)
    .sort((a, b) => a.qty - b.qty);
}

function cleanFields(o) {
  o = o || {};
  const out = {};
  Object.keys(TEXT_FIELDS).forEach((k) => { if (o[k] != null) out[k] = s(o[k], TEXT_FIELDS[k]); });
  if (o.price != null) out.price = num(o.price);
  if (o.fromPrice != null) out.fromPrice = num(o.fromPrice);
  if (o.soldOut != null) out.soldOut = !!o.soldOut;
  if (o.images != null) out.images = cleanImages(o.images);
  if (o.fields != null) out.fields = cleanSpecs(o.fields);
  if (o.priceTiers != null) out.priceTiers = cleanTiers(o.priceTiers);
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
  const news = Array.isArray(body && body.news) ? body.news.slice(0, 60).map(cleanPost) : [];
  const events = Array.isArray(body && body.events) ? body.events.slice(0, 60).map(cleanPost) : [];
  return { overrides, custom, hidden, categories, news, events };
}

// Annonces (news) et Événements partagent la même structure de fiche.
function cleanPost(p) {
  p = p || {};
  const id = /^post-[A-Za-z0-9_-]+$/.test(String(p.id || '')) ? String(p.id) : ('post-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  return {
    id: id,
    title: s(p.title, 160), title_en: s(p.title_en, 160),
    body: s(p.body, 1200), body_en: s(p.body_en, 1200),
    date: s(p.date, 40), location: s(p.location, 160), location_en: s(p.location_en, 160),
    image: s(p.image, 600), link: s(p.link, 600),
  };
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
      news: Array.isArray(j && j.news) ? j.news : [],
      events: Array.isArray(j && j.events) ? j.events : [],
    };
  } catch (e) { return EMPTY; }
}

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }

  try {
    if (req.method === 'GET') {
      // Image publique (produits / annonces / événements) : le store est privé,
      // donc on relaie l'image via ce point d'accès (limité au préfixe "product/").
      const imgPath = req.query && req.query.img;
      if (imgPath) {
        if (!/^product\/[A-Za-z0-9_.\-]+$/.test(String(imgPath))) { res.status(400).json({ error: 'chemin invalide' }); return; }
        try {
          const g = await get(String(imgPath), { token, access: 'private' });
          const ab = await new Response(g.stream).arrayBuffer();
          res.setHeader('Content-Type', (g && g.contentType) || 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.status(200).send(Buffer.from(ab));
        } catch (e) { res.status(404).end(); }
        return;
      }
      const catalog = await readCatalog(token);
      // Pas de cache : toute modification du propriétaire est visible immédiatement.
      res.setHeader('Cache-Control', 'no-store');
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
        const pathname = 'product/' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe;
        const blob = await put(pathname, buf, {
          token, access: 'private', contentType: type, addRandomSuffix: false,
        });
        // Le store est privé : on renvoie l'URL du proxy public (GET ?img=).
        res.status(200).json({ ok: true, url: '/api/products?img=' + encodeURIComponent(blob.pathname || pathname) });
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
