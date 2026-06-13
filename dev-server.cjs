// Serveur local de prévisualisation + API — meyva collection
// Lancer :  node dev-server.cjs     puis ouvrir  http://localhost:5173
//
// Contrairement à l'ancienne version, ce serveur fait TOURNER les routes /api/*
// en local, avec un stockage sur disque dans le dossier .data/ (ignoré par git).
// Tu peux donc tout tester localement, exactement comme sur Vercel :
//   • ajouter / modifier / supprimer des produits
//   • ajouter des annonces et des événements
//   • passer des commandes (elles apparaissent dans l'admin)
//   • importer plusieurs photos par produit
//
// Code d'accès admin en local :  ADMIN_KEY (variable d'env) ou « meyva » par défaut.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 5173;
const ADMIN_KEY = String(process.env.ADMIN_KEY || 'meyva').trim();

// ── Dossiers de stockage local (équivalent du Vercel Blob) ──────────────────
const DATA = path.join(ROOT, '.data');
const DIR = {
  orders: path.join(DATA, 'orders'),
  uploads: path.join(DATA, 'uploads'),      // fichiers clients  → chemin "upload/<nom>"
  public: path.join(DATA, 'public'),         // images produits   → URL "/blob/<nom>"
  subs: path.join(DATA, 'subscribers'),
};
const CATALOG_FILE = path.join(DATA, 'catalog.json');
Object.values(DIR).forEach((d) => fs.mkdirSync(d, { recursive: true }));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const mimeFor = (p) => MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';

// ── Helpers ─────────────────────────────────────────────────────────────────
function sendJSON(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}
function isAdmin(req, query) {
  const key = String((query && query.key) || req.headers['x-admin-key'] || '').trim();
  return !!(ADMIN_KEY && key === ADMIN_KEY);
}
const s = (v, max) => String(v == null ? '' : v).slice(0, max);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

// ── Catalogue : nettoyage (miroir de api/products.js, avec images[] + fields[]) ─
const EMPTY = { overrides: {}, custom: [], hidden: [], categories: [], news: [], events: [] };
const TEXT_FIELDS = {
  name: 200, name_en: 200, desc: 600, desc_en: 600, long: 2500, long_en: 2500,
  secondary: 120, secondary_en: 120, cat: 60, image: 600, badge: 60,
};
function cleanImages(v) {
  return Array.isArray(v) ? v.slice(0, 24).map((x) => s(x, 600)).filter(Boolean) : [];
}
function cleanSpecs(v) {
  return Array.isArray(v)
    ? v.slice(0, 24).map((f) => ({
        label: s(f && f.label, 80), value: s(f && f.value, 400),
        label_en: s(f && f.label_en, 80), value_en: s(f && f.value_en, 400),
      })).filter((x) => x.label || x.value)
    : [];
}
function cleanTiers(v) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 24)
    .map((tr) => ({ qty: Math.max(1, Math.round(num(tr && tr.qty))), price: num(tr && tr.price) }))
    .filter((tr) => tr.qty > 0).sort((a, b) => a.qty - b.qty);
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
  return Object.assign({
    id, custom: true, name: s(c.name || 'Produit', 200), cat: s(c.cat || 'Autres', 60), price: num(c.price),
  }, cleanFields(c));
}
function cleanPost(p) {
  p = p || {};
  const id = /^post-[A-Za-z0-9_-]+$/.test(String(p.id || '')) ? String(p.id) : ('post-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  return {
    id, title: s(p.title, 160), title_en: s(p.title_en, 160), body: s(p.body, 1200), body_en: s(p.body_en, 1200),
    date: s(p.date, 40), location: s(p.location, 160), location_en: s(p.location_en, 160), image: s(p.image, 600), link: s(p.link, 600),
  };
}
function cleanCatalog(body) {
  const ov = (body && body.overrides && typeof body.overrides === 'object') ? body.overrides : {};
  const overrides = {};
  Object.keys(ov).slice(0, 200).forEach((id) => { const k = s(id, 80); if (k) overrides[k] = cleanFields(ov[id]); });
  return {
    overrides,
    custom: Array.isArray(body && body.custom) ? body.custom.slice(0, 200).map(cleanCustom) : [],
    hidden: Array.isArray(body && body.hidden) ? body.hidden.slice(0, 200).map((x) => s(x, 80)).filter(Boolean) : [],
    categories: Array.isArray(body && body.categories) ? body.categories.slice(0, 40).map((x) => s(x, 60)).filter(Boolean) : [],
    news: Array.isArray(body && body.news) ? body.news.slice(0, 60).map(cleanPost) : [],
    events: Array.isArray(body && body.events) ? body.events.slice(0, 60).map(cleanPost) : [],
  };
}
function readCatalog() {
  try { return Object.assign({}, EMPTY, JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))); }
  catch (e) { return Object.assign({}, EMPTY); }
}

// ── Commandes : nettoyage (miroir de api/orders.js) ─────────────────────────
const cl = (v, max) => String(v == null ? '' : v).slice(0, max);
function cleanProductImage(v) {
  const x = String(v == null ? '' : v).slice(0, 600);
  return (
    /^assets\/[A-Za-z0-9_./-]+$/.test(x) ||
    /^\/api\/products\?img=[A-Za-z0-9_.%\-/]+$/.test(x) ||
    /^\/blob\/[A-Za-z0-9_.\-]+$/.test(x) ||
    /^https:\/\/[\w.\-/%]+$/.test(x)
  ) ? x : '';
}
function cleanItem(it) {
  it = it || {};
  const opt = it.option; let option = null;
  if (opt) {
    option = {};
    if (opt.tier) option.tier = { qty: Number(opt.tier.qty) || 0, price: Number(opt.tier.price) || 0 };
    if (opt.model) { option.model = { label: cl(opt.model.label, 80) }; if (opt.model.img) option.model.img = cl(opt.model.img, 600); }
    if (Array.isArray(opt.posters)) option.posters = opt.posters.slice(0, 30).map((p) => (p && typeof p === 'object') ? Object.assign({ label: cl(p.label, 80) }, p.img ? { img: cl(p.img, 600) } : {}) : { label: cl(p, 80) });
    if (Array.isArray(opt.styles)) option.styles = opt.styles.slice(0, 20).map((x) => cl(x, 40)).filter(Boolean);
  }
  return { name: cl(it.name, 120), qty: Number(it.qty) || 1, unitPrice: Number(it.unitPrice) || 0, cat: cl(it.cat, 40), image: cleanProductImage(it.image), option };
}

// ── Routeur API ─────────────────────────────────────────────────────────────
async function handleApi(req, res, urlPath, query) {
  // ----- /api/products -----
  if (urlPath === '/api/products') {
    if (req.method === 'GET') {
      // Proxy d'image produit privée (miroir de prod : /api/products?img=product/<nom>)
      if (query && query.img) {
        const ip = String(query.img);
        if (!/^product\/[A-Za-z0-9_.\-]+$/.test(ip)) return sendJSON(res, 400, { error: 'chemin invalide' });
        const local = path.join(DIR.public, path.basename(ip));
        if (!fs.existsSync(local)) return sendJSON(res, 404, { error: 'introuvable' });
        res.writeHead(200, { 'Content-Type': mimeFor(local), 'Cache-Control': 'public, max-age=31536000, immutable' });
        return res.end(fs.readFileSync(local));
      }
      return sendJSON(res, 200, { catalog: readCatalog() });
    }
    if (req.method === 'POST') {
      if (!isAdmin(req, query)) return sendJSON(res, 401, { error: 'non autorisé' });
      const body = await readBody(req);
      // Upload d'une image produit → renvoie l'URL du proxy (comme en prod)
      if ((query && query.image) || (body && body.op === 'image')) {
        const buf = Buffer.from(String(body.dataBase64 || ''), 'base64');
        if (!buf.length) return sendJSON(res, 400, { error: 'image manquante' });
        if (buf.length > 6 * 1024 * 1024) return sendJSON(res, 413, { error: 'image trop lourde (max 6 Mo)' });
        const safe = s(body.name || 'image', 120).replace(/[^A-Za-z0-9._-]/g, '_');
        const fn = Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe;
        fs.writeFileSync(path.join(DIR.public, fn), buf);
        return sendJSON(res, 200, { ok: true, url: '/api/products?img=product/' + fn });
      }
      const catalog = cleanCatalog(body);
      fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
      return sendJSON(res, 200, { ok: true, catalog });
    }
    return sendJSON(res, 405, { error: 'method not allowed' });
  }

  // ----- /api/orders -----
  if (urlPath === '/api/orders') {
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body || !body.nom || !body.telephone) return sendJSON(res, 400, { error: 'champs requis manquants (nom, telephone)' });
      const id = 'CMD-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
      const order = {
        id, createdAt: new Date().toISOString(),
        nom: cl(body.nom, 120), telephone: cl(body.telephone, 40), telephone2: cl(body.telephone2, 40),
        gouvernorat: cl(body.gouvernorat, 60), ville: cl(body.ville, 80), adresse: cl(body.adresse, 300), note: cl(body.note, 500),
        items: Array.isArray(body.items) ? body.items.slice(0, 50).map(cleanItem) : [],
        files: Array.isArray(body.files) ? body.files.slice(0, 120).map((fl) => {
          const out = { path: cl(fl && fl.path, 200), name: cl(fl && fl.name, 120) };
          if (fl && fl.item) out.item = cl(fl.item, 120);
          if (fl && Number.isFinite(Number(fl.itemIdx))) out.itemIdx = Number(fl.itemIdx);
          return out;
        }).filter((fl) => fl.path) : [],
        subtotal: num(body.subtotal), shipping: num(body.shipping), total: num(body.total), colis: Number(body.colis) || 1, status: 'nouveau',
      };
      fs.writeFileSync(path.join(DIR.orders, id + '.json'), JSON.stringify(order, null, 2));
      return sendJSON(res, 200, { ok: true, id });
    }
    if (req.method === 'GET') {
      if (!isAdmin(req, query)) return sendJSON(res, 401, { error: 'non autorisé' });
      // Téléchargement d'un fichier client
      if (query && query.file) {
        const fp = String(query.file);
        if (!/^upload\/[A-Za-z0-9_.\-]+$/.test(fp)) return sendJSON(res, 400, { error: 'chemin invalide' });
        const local = path.join(DIR.uploads, fp.slice('upload/'.length));
        if (!fs.existsSync(local)) return sendJSON(res, 404, { error: 'introuvable' });
        res.writeHead(200, { 'Content-Type': mimeFor(local), 'Content-Disposition': 'inline; filename="' + path.basename(local) + '"' });
        return res.end(fs.readFileSync(local));
      }
      // Abonnés newsletter
      if (query && query.subs) {
        const subs = fs.readdirSync(DIR.subs).filter((f) => f.endsWith('.json')).map((f) => { try { return JSON.parse(fs.readFileSync(path.join(DIR.subs, f), 'utf8')); } catch (e) { return null; } }).filter(Boolean);
        return sendJSON(res, 200, { subscribers: subs });
      }
      const orders = fs.readdirSync(DIR.orders).filter((f) => f.endsWith('.json'))
        .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(DIR.orders, f), 'utf8')); } catch (e) { return null; } })
        .filter(Boolean).sort((a, b) => (String(a.createdAt) < String(b.createdAt) ? -1 : 1));
      return sendJSON(res, 200, { orders });
    }
    if (req.method === 'DELETE') {
      if (!isAdmin(req, query)) return sendJSON(res, 401, { error: 'non autorisé' });
      const id = (query && query.id) || req.headers['x-order-id'];
      if (!id || !/^CMD-[0-9]+-[0-9]+$/.test(String(id))) return sendJSON(res, 400, { error: 'id de commande invalide' });
      const fp = path.join(DIR.orders, id + '.json');
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      return sendJSON(res, 200, { ok: true, id });
    }
    if (req.method === 'PATCH') {
      if (!isAdmin(req, query)) return sendJSON(res, 401, { error: 'non autorisé' });
      const id = (query && query.id) || req.headers['x-order-id'];
      if (!id || !/^CMD-[0-9]+-[0-9]+$/.test(String(id))) return sendJSON(res, 400, { error: 'id invalide' });
      const fp = path.join(DIR.orders, id + '.json');
      if (!fs.existsSync(fp)) return sendJSON(res, 404, { error: 'commande introuvable' });
      const paid = String((query && query.status) || '') === 'paid';
      const order = JSON.parse(fs.readFileSync(fp, 'utf8'));
      order.status = paid ? 'payé' : 'nouveau';
      order.paidAt = paid ? new Date().toISOString() : null;
      fs.writeFileSync(fp, JSON.stringify(order, null, 2));
      return sendJSON(res, 200, { ok: true, status: order.status });
    }
    return sendJSON(res, 405, { error: 'method not allowed' });
  }

  // ----- /api/upload (fichiers clients, privés) -----
  if (urlPath === '/api/upload') {
    if (req.method !== 'POST') return sendJSON(res, 405, { error: 'method not allowed' });
    const body = await readBody(req);
    const buf = Buffer.from(String(body.dataBase64 || ''), 'base64');
    if (!buf.length) return sendJSON(res, 400, { error: 'aucun fichier' });
    if (buf.length > 5 * 1024 * 1024) return sendJSON(res, 413, { error: 'fichier trop lourd' });
    const safe = s(body.name || 'fichier', 80).replace(/[^a-zA-Z0-9_.-]/g, '_') || 'fichier';
    const fn = Date.now() + '-' + Math.floor(Math.random() * 1e6) + '-' + safe;
    fs.writeFileSync(path.join(DIR.uploads, fn), buf);
    return sendJSON(res, 200, { ok: true, path: 'upload/' + fn, name: safe });
  }

  // ----- /api/subscribe -----
  if (urlPath === '/api/subscribe') {
    if (req.method !== 'POST') return sendJSON(res, 405, { error: 'method not allowed' });
    const body = await readBody(req);
    const email = s(body.email, 160).trim();
    if (!/.+@.+\..+/.test(email)) return sendJSON(res, 400, { error: 'email invalide' });
    const fn = Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.json';
    fs.writeFileSync(path.join(DIR.subs, fn), JSON.stringify({ email, at: new Date().toISOString() }));
    return sendJSON(res, 200, { ok: true });
  }

  return sendJSON(res, 404, { error: 'route inconnue' });
}

// ── Serveur ─────────────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const u = new URL(req.url || '/', 'http://localhost');
  let urlPath = decodeURIComponent(u.pathname);
  const query = Object.fromEntries(u.searchParams.entries());

  // Routes API
  if (urlPath.indexOf('/api/') === 0) {
    try { await handleApi(req, res, urlPath, query); }
    catch (e) { sendJSON(res, 500, { error: 'server error', detail: String((e && e.message) || e) }); }
    return;
  }

  // Images produits stockées localement (/blob/<nom>)
  if (urlPath.indexOf('/blob/') === 0) {
    const local = path.join(DIR.public, path.basename(urlPath));
    if (fs.existsSync(local)) { res.writeHead(200, { 'Content-Type': mimeFor(local), 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(local)); }
    res.writeHead(404); return res.end('Not found');
  }

  // Fichiers statiques
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeFor(filePath) });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('\n  meyva collection — serveur local prêt (API incluse) :');
  console.log('  →  http://localhost:' + PORT);
  console.log('  Code admin local : « ' + ADMIN_KEY +' »  (change-le avec  ADMIN_KEY=...)\n');
});
