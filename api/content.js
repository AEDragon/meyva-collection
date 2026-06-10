// Site content API for meyva collection.
// GET  /api/content          -> current content document (public; storefront + admin)
// GET  /api/content?prev=1   -> previous saved version (admin restore)
// PUT  /api/content          -> save a new content document (admin only)
//
// The document holds everything the shop owner can edit from the dashboard:
// products, photo price tiers, promos, coming-soon items, posts (annonces),
// events (événements) and the delivery fee. It is stored as a single private
// blob (content/site.json); each save keeps the previous version in
// content/site-prev.json so one bad save can be undone from the dashboard.

import { put, get } from '@vercel/blob';
import { verifyToken } from '@clerk/backend';

const DOC_PATH = 'content/site.json';
const PREV_PATH = 'content/site-prev.json';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

// Admin auth: a signed-in Clerk session (verified server-side) OR the legacy
// access key as a fallback — same rule as /api/orders.
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

async function readDoc(path, token) {
  try {
    const g = await get(path, { token, access: 'private' });
    const txt = await new Response(g.stream).text();
    return JSON.parse(txt);
  } catch (e) { return null; }
}

// ── sanitization ──────────────────────────────────────────────────────────────
// Every field the dashboard can write is re-validated here: strings are
// length-capped, numbers coerced, unknown fields dropped. Never trust the client.

const MAX = { products: 200, comingSoon: 60, promos: 30, posts: 100, events: 100, tiers: 30 };

function str(v, max) { return String(v == null ? '' : v).slice(0, max).trim(); }
function num(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function bool(v) { return v === true; }
function published(v) { return v !== false; } // default true for older docs
function urlish(v) {
  const s = str(v, 500);
  return /^(https?:\/\/|assets\/|\/)[^\s"'<>]+$/.test(s) ? s : '';
}
function slug(v, fallback) {
  const s = str(v, 60).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || fallback;
}
function arr(v, max) { return Array.isArray(v) ? v.slice(0, max) : []; }

function sanitizeProduct(p, i) {
  p = p || {};
  const tiers = bool(p.tiers);
  return {
    id: slug(p.id, 'prod-' + i),
    name: str(p.name, 140),
    cat: str(p.cat, 40) || 'Divers',
    price: num(p.price, 0),
    fromPrice: tiers ? num(p.fromPrice, num(p.price, 0)) : undefined,
    badge: str(p.badge, 80) || undefined,
    secondary: str(p.secondary, 80) || undefined,
    image: urlish(p.image) || undefined,
    swatch: str(p.swatch, 40) || undefined,
    desc: str(p.desc, 500),
    long: str(p.long, 1500) || undefined,
    tiers: tiers || undefined,
    tierSet: tiers ? (p.tierSet === 'kit' ? 'kit' : 'prints') : undefined,
    kitNote: str(p.kitNote, 300) || undefined,
    upload: bool(p.upload) || undefined,
    featured: bool(p.featured) || undefined,
  };
}

function sanitizeComingSoon(c, i) {
  c = c || {};
  return {
    id: slug(c.id, 'cs-' + i),
    name: str(c.name, 140),
    cat: 'Bientôt',
    eta: str(c.eta, 40) || 'Bientôt',
    teaser: str(c.teaser, 400),
    image: urlish(c.image) || undefined,
    swatch: str(c.swatch, 40) || undefined,
  };
}

function sanitizePromo(p, i) {
  p = p || {};
  return {
    id: slug(p.id, 'promo-' + i),
    title: str(p.title, 80),
    badge: str(p.badge, 40),
    highlight: str(p.highlight, 160),
    sub: str(p.sub, 160),
    cta: str(p.cta, 60) || undefined,
    goCat: str(p.goCat, 40) || undefined,
    image: urlish(p.image) || undefined,
    swatch: str(p.swatch, 40) || undefined,
  };
}

function sanitizePost(p, i) {
  p = p || {};
  return {
    id: slug(p.id, 'post-' + i),
    title: str(p.title, 140),
    date: str(p.date, 60),
    text: str(p.text, 1200),
    image: urlish(p.image) || undefined,
    link: urlish(p.link) || undefined,
    linkLabel: str(p.linkLabel, 60) || undefined,
    published: published(p.published),
  };
}

function sanitizeEvent(e, i) {
  e = e || {};
  return {
    id: slug(e.id, 'event-' + i),
    title: str(e.title, 140),
    date: str(e.date, 80),
    place: str(e.place, 140),
    text: str(e.text, 1000),
    image: urlish(e.image) || undefined,
    link: urlish(e.link) || undefined,
    linkLabel: str(e.linkLabel, 60) || undefined,
    published: published(e.published),
  };
}

function sanitizeTiers(list) {
  const seen = new Set();
  return arr(list, MAX.tiers)
    .map((t) => ({ qty: Math.max(1, Math.round(num(t && t.qty, 0))), price: Math.max(0, num(t && t.price, 0)) }))
    .filter((t) => t.qty > 0 && !seen.has(t.qty) && seen.add(t.qty))
    .sort((a, b) => a.qty - b.qty);
}

function dropEmpty(o) {
  const out = {};
  Object.keys(o).forEach((k) => { if (o[k] !== undefined) out[k] = o[k]; });
  return out;
}

function sanitizeDoc(body) {
  body = body && typeof body === 'object' ? body : {};
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    products: arr(body.products, MAX.products).map((p, i) => dropEmpty(sanitizeProduct(p, i))).filter((p) => p.name),
    comingSoon: arr(body.comingSoon, MAX.comingSoon).map((c, i) => dropEmpty(sanitizeComingSoon(c, i))).filter((c) => c.name),
    promos: arr(body.promos, MAX.promos).map((p, i) => dropEmpty(sanitizePromo(p, i))).filter((p) => p.highlight || p.title),
    posts: arr(body.posts, MAX.posts).map((p, i) => dropEmpty(sanitizePost(p, i))).filter((p) => p.title),
    events: arr(body.events, MAX.events).map((e, i) => dropEmpty(sanitizeEvent(e, i))).filter((e) => e.title),
    photoTiers: sanitizeTiers(body.photoTiers),
    photoTiersKit: sanitizeTiers(body.photoTiersKit),
    deliveryFee: Math.min(100, Math.max(0, num(body.deliveryFee, 8))),
  };
}

// ── handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { res.status(500).json({ error: 'storage not configured' }); return; }

  try {
    if (req.method === 'GET') {
      const wantPrev = req.query && req.query.prev;
      const doc = await readDoc(wantPrev ? PREV_PATH : DOC_PATH, token);
      if (req.query && (req.query.fresh || wantPrev)) {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        // Public storefront reads: cache 60 s at the edge so a save shows up fast
        // without hammering Blob storage on every visit.
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      }
      res.status(200).json({ content: doc });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!(await isAdmin(req))) {
        res.status(401).json({ error: 'non autorisé' });
        return;
      }
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
      if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
        res.status(400).json({ error: 'document invalide (products manquant)' });
        return;
      }
      const doc = sanitizeDoc(body);
      if (!doc.products.length) {
        res.status(400).json({ error: 'au moins un produit est requis' });
        return;
      }

      // Keep the previous version so the dashboard can restore it.
      const current = await readDoc(DOC_PATH, token);
      if (current) {
        await put(PREV_PATH, JSON.stringify(current), {
          token, access: 'private', contentType: 'application/json', allowOverwrite: true,
        });
      }
      await put(DOC_PATH, JSON.stringify(doc), {
        token, access: 'private', contentType: 'application/json', allowOverwrite: true,
      });
      res.status(200).json({ ok: true, updatedAt: doc.updatedAt });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e && e.message || e) });
  }
}
