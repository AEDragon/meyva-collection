/* global React, ReactDOM, useLang, t, Field, SWATCHES, downloadFile, stamp, buildMescolisCSV, orderDesignation, mergeContent */

// Dashboard admin (commandes + contenu du site). index.html est la version
// exécutée ; ce fichier est un miroir source.

// ── admin dashboard ───────────────────────────────────────────────────────────
// Espace boutique protégé par Clerk : commandes + édition de tout le contenu
// du site (produits, prix, promos, annonces, événements, réglages). Le contenu
// est tenu dans un brouillon local et publié d'un coup via PUT /api/content.

function genId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4); }

// Brouillon par défaut : copie profonde des données actuellement affichées.
function defaultDraft() {
  const D = window.MEYVA_DATA;
  return JSON.parse(JSON.stringify({
    products: D.PRODUCTS,
    comingSoon: D.COMING_SOON,
    promos: D.PROMOS,
    posts: D.POSTS || [],
    events: D.EVENTS || [],
    photoTiers: D.PHOTO_TIERS,
    photoTiersKit: D.PHOTO_TIERS_KIT,
    deliveryFee: D.DELIVERY_FEE,
  }));
}

// Document publié -> brouillon complet (les clés manquantes retombent sur les défauts).
function normalizeDraft(doc) {
  const base = defaultDraft();
  const out = {};
  Object.keys(base).forEach((k) => {
    if (k === 'deliveryFee') out[k] = typeof doc[k] === 'number' ? doc[k] : base[k];
    else out[k] = Array.isArray(doc[k]) ? doc[k] : base[k];
  });
  return JSON.parse(JSON.stringify(out));
}

// Opérations immuables sur une liste du brouillon (update / move / delete / add).
function listOps(key, setDraft) {
  return {
    upd: (i, patch) => setDraft(d => ({ ...d, [key]: d[key].map((x, j) => (j === i ? { ...x, ...patch } : x)) })),
    move: (i, dir) => setDraft(d => {
      const a = d[key].slice(); const j = i + dir;
      if (j < 0 || j >= a.length) return d;
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      return { ...d, [key]: a };
    }),
    del: (i) => setDraft(d => ({ ...d, [key]: d[key].filter((x, j) => j !== i) })),
    add: (item) => setDraft(d => ({ ...d, [key]: d[key].concat([item]) })),
  };
}

// Authentification admin : session Clerk si disponible, sinon le code
// d'accès boutique (ADMIN_KEY) mémorisé sur l'appareil. Les trois APIs
// (/api/orders, /api/content, /api/media) acceptent les deux.
const ADMIN_KEY_STORE = 'meyva_admin_key';
function getStoredKey() { try { return localStorage.getItem(ADMIN_KEY_STORE) || ''; } catch (e) { return ''; } }
function setStoredKey(k) { try { localStorage.setItem(ADMIN_KEY_STORE, k); } catch (e) {} }
function clearStoredKey() { try { localStorage.removeItem(ADMIN_KEY_STORE); } catch (e) {} }

async function adminAuthHeaders() {
  try {
    const tok = window.Clerk && window.Clerk.session ? await window.Clerk.session.getToken() : null;
    if (tok) return { Authorization: 'Bearer ' + tok };
  } catch (e) { /* Clerk indisponible -> code boutique */ }
  const key = getStoredKey();
  if (key) return { 'x-admin-key': key };
  return null;
}

// Upload d'une image de site (publique) via /api/media — renvoie son URL.
async function uploadMedia(file) {
  const b64 = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(',')[1]);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  const auth = await adminAuthHeaders();
  const r = await fetch('/api/media', {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, auth || {}),
    body: JSON.stringify({ name: file.name, type: file.type, dataBase64: b64 }),
  });
  if (!r.ok) {
    let msg = ''; try { const j = await r.json(); msg = j.error || ''; } catch (e) {}
    throw new Error(msg || 'HTTP ' + r.status);
  }
  return (await r.json()).url;
}

// ── petits champs de formulaire admin ─────────────────────────────────────────
function AdmIn({ label, value, onChange, type, placeholder }) {
  return (
    <Field label={label}>
      <input className="inp" type={type || 'text'} value={value == null ? '' : value} placeholder={placeholder || ''} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

function AdmNum({ label, value, onChange, step }) {
  return (
    <Field label={label}>
      <input className="inp" type="number" step={step || '0.1'} value={value == null ? '' : value} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    </Field>
  );
}

function AdmArea({ label, value, onChange, rows }) {
  return (
    <Field label={label}>
      <textarea className="inp" rows={rows || 3} value={value == null ? '' : value} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

function AdmChk({ label, checked, onChange }) {
  return (
    <label className="adm-chk">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function AdmSel({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select className="inp" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function ImagePicker({ value, onChange }) {
  const lang = useLang();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const pick = async (e) => {
    const fl = (e.target.files && e.target.files[0]) || null;
    e.target.value = '';
    if (!fl) return;
    if (fl.size > 4 * 1024 * 1024) { setErr(t(lang, 'da_img_toobig')); return; }
    setBusy(true); setErr('');
    try { onChange(await uploadMedia(fl)); }
    catch (ex) { setErr(t(lang, 'da_img_fail') + (ex && ex.message ? ' · ' + ex.message : '')); }
    setBusy(false);
  };
  return (
    <div className="img-picker">
      <div className="img-picker-row">
        {value
          ? <img className="img-picker-thumb" src={value} alt="" />
          : <div className="img-picker-thumb img-picker-empty">—</div>}
        <label className="btn btn-outline img-picker-btn">
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" style={{ display: 'none' }} onChange={pick} disabled={busy} />
          {busy ? t(lang, 'da_img_uploading') : t(lang, 'da_img_choose')}
        </label>
        {value && <button type="button" className="link-btn" onClick={() => onChange('')}>{t(lang, 'da_img_remove')}</button>}
      </div>
      <input className="inp" placeholder={t(lang, 'da_img_url')} value={value || ''} onChange={e => onChange(e.target.value)} />
      {err && <div className="field-msg">{err}</div>}
    </div>
  );
}

function RowBtns({ onEdit, editing, onUp, onDown, onDel }) {
  const lang = useLang();
  return (
    <div className="adm-rowbtns">
      {onUp && <button type="button" className="btn-file" onClick={onUp} aria-label="Monter">↑</button>}
      {onDown && <button type="button" className="btn-file" onClick={onDown} aria-label="Descendre">↓</button>}
      <button type="button" className="btn-file" onClick={onEdit}>{editing ? t(lang, 'da_done') : t(lang, 'da_edit')}</button>
      <button type="button" className="btn-delete" onClick={onDel}>{t(lang, 'da_delete')}</button>
    </div>
  );
}

const SWATCH_OPTIONS = Object.keys(SWATCHES).map(s => ({ value: s, label: s }));

// ── onglet commandes (ancien OrderAdmin, sans la partie connexion) ───────────
function OrdersPanel() {
  const lang = useLang();
  const [orders, setOrders] = React.useState([]);
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState('');
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const loadServer = async () => {
    setLoading(true); setStatus(t(lang, 'ad_st_loading'));
    try {
      const auth = await adminAuthHeaders();
      if (!auth) { setStatus(t(lang, 'ad_st_expired')); setLoading(false); return; }
      const r = await fetch('/api/orders', { headers: auth });
      if (r.status === 401) { setStatus(t(lang, 'ad_st_denied')); setLoading(false); return; }
      if (!r.ok) { setStatus(t(lang, 'ad_st_srverr') + ' (' + r.status + ').'); setLoading(false); return; }
      const j = await r.json();
      setOrders(j.orders || []);
      setStatus((j.orders || []).length + ' ' + t(lang, 'ad_st_loaded1'));
    } catch (e) { setStatus(t(lang, 'ad_st_unreach')); }
    setLoading(false);
  };
  const exportCSV = () => { if (!orders.length) return; downloadFile('commandes-mescolis-' + stamp() + '.csv', buildMescolisCSV(orders), 'text/csv;charset=utf-8'); };

  const deleteOrder = async (id) => {
    if (!window.confirm(t(lang, 'admin_delete_confirm'))) return;
    setDeleting(id);
    try {
      const auth = await adminAuthHeaders();
      const r = await fetch('/api/orders?id=' + encodeURIComponent(id), { method: 'DELETE', headers: auth || {} });
      if (!r.ok) { setStatus(t(lang, 'admin_delete_fail') + ' (' + r.status + ').'); setDeleting(''); return; }
      setOrders(prev => prev.filter(o => o.id !== id));
      setStatus(t(lang, 'admin_deleted'));
    } catch (e) { setStatus(t(lang, 'admin_delete_fail') + '.'); }
    setDeleting('');
  };

  const openFile = async (path) => {
    try {
      const auth = await adminAuthHeaders();
      const r = await fetch('/api/orders?file=' + encodeURIComponent(path), { headers: auth || {} });
      if (!r.ok) { setStatus(t(lang, 'ad_st_srverr') + ' (' + r.status + ').'); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { setStatus(t(lang, 'ad_st_unreach')); }
  };

  React.useEffect(() => { loadServer(); }, []);

  return (
    <div className="adm-panel">
      {status && <p className="muted" style={{ fontSize: 13 }}>{status}</p>}
      <div className="admin-bar">
        <div className="admin-stats">
          <span><strong>{orders.length}</strong>{' ' + (orders.length > 1 ? t(lang, 'ad_orders') : t(lang, 'ad_order'))}</span>
          <span>{t(lang, 'ad_total')}<strong>{window.money(revenue)}</strong></span>
        </div>
        <button className="btn btn-outline" onClick={loadServer} disabled={loading}>{loading ? t(lang, 'ad_loading2') : t(lang, 'ad_refresh')}</button>
        <button className="btn btn-pink" onClick={exportCSV} disabled={!orders.length}>{t(lang, 'ad_export')}</button>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{t(lang, 'ad_csvnote')}</p>
      {orders.length === 0
        ? <div className="admin-empty">{t(lang, 'ad_empty')}</div>
        : <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr>
                {['#', t(lang, 'ad_h_date'), t(lang, 'ad_h_name'), t(lang, 'ad_h_tel'), t(lang, 'ad_h_gov'), t(lang, 'ad_h_city'), t(lang, 'ad_h_addr'), t(lang, 'ad_h_items'), t(lang, 'ad_h_total'), t(lang, 'ad_h_files'), t(lang, 'ad_h_action')].map((h, hi) => <th key={hi}>{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.slice().reverse().map((o) => (
                  <tr key={o.id}>
                    <td>{o.id.replace('CMD-', '#')}</td>
                    <td>{(o.createdAt || '').slice(0, 10)}</td>
                    <td>{o.nom}</td>
                    <td>{o.telephone}</td>
                    <td>{o.gouvernorat}</td>
                    <td>{o.ville}</td>
                    <td>{o.adresse}</td>
                    <td>{orderDesignation(o)}</td>
                    <td>{window.money(o.total)}</td>
                    <td>
                      {(o.files && o.files.length)
                        ? o.files.map((fl, fi) => <button key={fi} className="btn-file" onClick={() => openFile(fl.path)} title={fl.name}>{'📎 ' + t(lang, 'ad_file')}</button>)
                        : <span className="muted">—</span>}
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => deleteOrder(o.id)} disabled={deleting === o.id}>
                        {deleting === o.id ? t(lang, 'ad_deleting') : t(lang, 'ad_delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
    </div>
  );
}

// ── onglet produits (+ bientôt disponible) ────────────────────────────────────
function ProductsPanel({ draft, setDraft, notify }) {
  const lang = useLang();
  const [openId, setOpenId] = React.useState('');
  const ops = listOps('products', setDraft);
  const cs = listOps('comingSoon', setDraft);
  const cats = [];
  draft.products.forEach(p => { if (p.cat && !cats.includes(p.cat)) cats.push(p.cat); });

  const pricingOf = (p) => (p.tiers ? (p.tierSet === 'kit' ? 'kit' : 'prints') : 'fixed');
  const setPricing = (i, v) => {
    if (v === 'fixed') { ops.upd(i, { tiers: false, tierSet: undefined, fromPrice: undefined }); return; }
    const list = v === 'kit' ? draft.photoTiersKit : draft.photoTiers;
    const first = list && list[0] ? list[0].price : 0;
    ops.upd(i, { tiers: true, tierSet: v, fromPrice: first, price: first });
  };

  const addProduct = () => {
    const id = genId('prod');
    ops.add({ id, name: '', cat: cats[0] || 'Divers', price: 0, desc: '', swatch: 'stickers-pink' });
    setOpenId(id);
  };

  const launchCs = (i) => {
    const item = draft.comingSoon[i];
    if (!item) return;
    const id = genId('prod');
    setDraft(d => ({
      ...d,
      comingSoon: d.comingSoon.filter((x, j) => j !== i),
      products: d.products.concat([{ id, name: item.name, cat: cats[0] || 'Divers', price: 0, desc: item.teaser || '', image: item.image, swatch: item.swatch || 'stickers-pink' }]),
    }));
    setOpenId(id);
    notify('« ' + item.name + ' » ' + t(lang, 'da_cs_launched'));
  };

  const addCs = () => {
    const id = genId('cs');
    cs.add({ id, name: '', cat: 'Bientôt', eta: 'Bientôt', teaser: '', swatch: 'photos' });
    setOpenId(id);
  };

  return (
    <div className="adm-panel">
      <h3 className="adm-h">{t(lang, 'da_products_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_products_sub')}</p>
      <datalist id="meyva-cats">{cats.map(c => <option key={c} value={c} />)}</datalist>
      <div className="adm-list">
        {draft.products.map((p, i) => (
          <div key={p.id} className="adm-item">
            <div className="adm-row">
              <div className="adm-row-main">
                <span className="adm-row-name">{(p.featured ? '⭐ ' : '') + (p.name || '')}{!p.name && <em className="muted">{t(lang, 'da_new_product')}</em>}</span>
                <span className="adm-row-meta">{p.cat} · {p.tiers ? t(lang, 'price_from') + ' ' + window.money(p.fromPrice || 0) : window.money(p.price || 0)}</span>
              </div>
              <RowBtns
                editing={openId === p.id}
                onEdit={() => setOpenId(openId === p.id ? '' : p.id)}
                onUp={() => ops.move(i, -1)}
                onDown={() => ops.move(i, 1)}
                onDel={() => { if (window.confirm(t(lang, 'da_confirm_delete'))) ops.del(i); }}
              />
            </div>
            {openId === p.id && (
              <div className="adm-form">
                <AdmIn label={t(lang, 'da_f_name')} value={p.name} onChange={v => ops.upd(i, { name: v })} />
                <Field label={t(lang, 'da_f_cat')}>
                  <input className="inp" list="meyva-cats" value={p.cat || ''} onChange={e => ops.upd(i, { cat: e.target.value })} />
                </Field>
                <AdmSel label={t(lang, 'da_f_pricing')} value={pricingOf(p)} onChange={v => setPricing(i, v)} options={[
                  { value: 'fixed', label: t(lang, 'da_pricing_fixed') },
                  { value: 'prints', label: t(lang, 'da_pricing_prints') },
                  { value: 'kit', label: t(lang, 'da_pricing_kit') },
                ]} />
                {!p.tiers && <AdmNum label={t(lang, 'da_f_price')} value={p.price} onChange={v => ops.upd(i, { price: v })} />}
                {p.tiers && <AdmIn label={t(lang, 'da_f_kitnote')} value={p.kitNote} onChange={v => ops.upd(i, { kitNote: v })} />}
                <AdmIn label={t(lang, 'da_f_badge')} value={p.badge} onChange={v => ops.upd(i, { badge: v })} />
                <AdmIn label={t(lang, 'da_f_secondary')} value={p.secondary} onChange={v => ops.upd(i, { secondary: v })} />
                <AdmArea label={t(lang, 'da_f_desc')} value={p.desc} onChange={v => ops.upd(i, { desc: v })} rows={2} />
                <AdmArea label={t(lang, 'da_f_long')} value={p.long} onChange={v => ops.upd(i, { long: v })} rows={4} />
                <Field label={t(lang, 'da_f_image')}>
                  <ImagePicker value={p.image} onChange={v => ops.upd(i, { image: v || undefined })} />
                </Field>
                {!p.image && <AdmSel label={t(lang, 'da_f_swatch')} value={p.swatch || 'stickers-pink'} onChange={v => ops.upd(i, { swatch: v })} options={SWATCH_OPTIONS} />}
                <div className="adm-chks">
                  <AdmChk label={t(lang, 'da_f_featured')} checked={p.featured} onChange={v => ops.upd(i, { featured: v })} />
                  <AdmChk label={t(lang, 'da_f_upload')} checked={p.upload} onChange={v => ops.upd(i, { upload: v })} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-pink adm-add" onClick={addProduct}>+ {t(lang, 'da_new_product')}</button>

      <h3 className="adm-h" style={{ marginTop: 40 }}>{t(lang, 'da_cs_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_cs_sub')}</p>
      <div className="adm-list">
        {draft.comingSoon.length === 0 && <p className="muted">{t(lang, 'da_none')}</p>}
        {draft.comingSoon.map((c, i) => (
          <div key={c.id} className="adm-item">
            <div className="adm-row">
              <div className="adm-row-main">
                <span className="adm-row-name">{c.name || ''}{!c.name && <em className="muted">{t(lang, 'da_new_cs')}</em>}</span>
                <span className="adm-row-meta">{c.eta}</span>
              </div>
              <div className="adm-rowbtns">
                <button type="button" className="btn-file" onClick={() => launchCs(i)}>{t(lang, 'da_cs_launch')}</button>
                <button type="button" className="btn-file" onClick={() => setOpenId(openId === c.id ? '' : c.id)}>{openId === c.id ? t(lang, 'da_done') : t(lang, 'da_edit')}</button>
                <button type="button" className="btn-delete" onClick={() => { if (window.confirm(t(lang, 'da_confirm_delete'))) cs.del(i); }}>{t(lang, 'da_delete')}</button>
              </div>
            </div>
            {openId === c.id && (
              <div className="adm-form">
                <AdmIn label={t(lang, 'da_f_name')} value={c.name} onChange={v => cs.upd(i, { name: v })} />
                <AdmIn label={t(lang, 'da_f_eta')} value={c.eta} onChange={v => cs.upd(i, { eta: v })} />
                <AdmArea label={t(lang, 'da_f_teaser')} value={c.teaser} onChange={v => cs.upd(i, { teaser: v })} rows={3} />
                <Field label={t(lang, 'da_f_image')}>
                  <ImagePicker value={c.image} onChange={v => cs.upd(i, { image: v || undefined })} />
                </Field>
                {!c.image && <AdmSel label={t(lang, 'da_f_swatch')} value={c.swatch || 'photos'} onChange={v => cs.upd(i, { swatch: v })} options={SWATCH_OPTIONS} />}
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-outline adm-add" onClick={addCs}>+ {t(lang, 'da_new_cs')}</button>
    </div>
  );
}

// ── onglet promos ─────────────────────────────────────────────────────────────
function PromosPanel({ draft, setDraft }) {
  const lang = useLang();
  const [openId, setOpenId] = React.useState('');
  const ops = listOps('promos', setDraft);
  const cats = [];
  draft.products.forEach(p => { if (p.cat && !cats.includes(p.cat)) cats.push(p.cat); });
  const add = () => {
    const id = genId('promo');
    ops.add({ id, title: '', badge: '', highlight: '', sub: '', cta: '', goCat: cats[0] || '', swatch: 'stickers-pink' });
    setOpenId(id);
  };
  return (
    <div className="adm-panel">
      <h3 className="adm-h">{t(lang, 'da_promos_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_promos_sub')}</p>
      <div className="adm-list">
        {draft.promos.length === 0 && <p className="muted">{t(lang, 'da_none')}</p>}
        {draft.promos.map((p, i) => (
          <div key={p.id} className="adm-item">
            <div className="adm-row">
              <div className="adm-row-main">
                <span className="adm-row-name">{p.highlight || p.title || ''}{!(p.highlight || p.title) && <em className="muted">{t(lang, 'da_new_promo')}</em>}</span>
                <span className="adm-row-meta">{p.badge}</span>
              </div>
              <RowBtns
                editing={openId === p.id}
                onEdit={() => setOpenId(openId === p.id ? '' : p.id)}
                onUp={() => ops.move(i, -1)}
                onDown={() => ops.move(i, 1)}
                onDel={() => { if (window.confirm(t(lang, 'da_confirm_delete'))) ops.del(i); }}
              />
            </div>
            {openId === p.id && (
              <div className="adm-form">
                <AdmIn label={t(lang, 'da_f_title')} value={p.title} onChange={v => ops.upd(i, { title: v })} />
                <AdmIn label={t(lang, 'da_f_badge2')} value={p.badge} onChange={v => ops.upd(i, { badge: v })} />
                <AdmIn label={t(lang, 'da_f_highlight')} value={p.highlight} onChange={v => ops.upd(i, { highlight: v })} />
                <AdmIn label={t(lang, 'da_f_sub')} value={p.sub} onChange={v => ops.upd(i, { sub: v })} />
                <AdmIn label={t(lang, 'da_f_cta')} value={p.cta} onChange={v => ops.upd(i, { cta: v })} />
                <AdmSel label={t(lang, 'da_f_gocat')} value={p.goCat || ''} onChange={v => ops.upd(i, { goCat: v })} options={[{ value: '', label: '—' }].concat(cats.map(c => ({ value: c, label: c })))} />
                <Field label={t(lang, 'da_f_image')}>
                  <ImagePicker value={p.image} onChange={v => ops.upd(i, { image: v || undefined })} />
                </Field>
                {!p.image && <AdmSel label={t(lang, 'da_f_swatch')} value={p.swatch || 'stickers-pink'} onChange={v => ops.upd(i, { swatch: v })} options={SWATCH_OPTIONS} />}
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-pink adm-add" onClick={add}>+ {t(lang, 'da_new_promo')}</button>
    </div>
  );
}

// ── onglet annonces ───────────────────────────────────────────────────────────
function PostsPanel({ draft, setDraft }) {
  const lang = useLang();
  const [openId, setOpenId] = React.useState('');
  const ops = listOps('posts', setDraft);
  const add = () => { const id = genId('post'); ops.add({ id, title: '', date: '', text: '', published: true }); setOpenId(id); };
  return (
    <div className="adm-panel">
      <h3 className="adm-h">{t(lang, 'da_posts_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_posts_sub')}</p>
      <div className="adm-list">
        {draft.posts.length === 0 && <p className="muted">{t(lang, 'da_none')}</p>}
        {draft.posts.map((p, i) => (
          <div key={p.id} className="adm-item">
            <div className="adm-row">
              <div className="adm-row-main">
                <span className="adm-row-name">{p.title || ''}{!p.title && <em className="muted">{t(lang, 'da_new_post')}</em>}</span>
                <span className="adm-row-meta">{p.date}{p.published === false ? ' · ' + t(lang, 'da_unpublished') : ''}</span>
              </div>
              <RowBtns
                editing={openId === p.id}
                onEdit={() => setOpenId(openId === p.id ? '' : p.id)}
                onUp={() => ops.move(i, -1)}
                onDown={() => ops.move(i, 1)}
                onDel={() => { if (window.confirm(t(lang, 'da_confirm_delete'))) ops.del(i); }}
              />
            </div>
            {openId === p.id && (
              <div className="adm-form">
                <AdmIn label={t(lang, 'da_f_title')} value={p.title} onChange={v => ops.upd(i, { title: v })} />
                <AdmIn label={t(lang, 'da_f_date')} value={p.date} onChange={v => ops.upd(i, { date: v })} />
                <AdmArea label={t(lang, 'da_f_text')} value={p.text} onChange={v => ops.upd(i, { text: v })} rows={4} />
                <AdmIn label={t(lang, 'da_f_link')} value={p.link} onChange={v => ops.upd(i, { link: v })} placeholder="https://…" />
                <AdmIn label={t(lang, 'da_f_linklabel')} value={p.linkLabel} onChange={v => ops.upd(i, { linkLabel: v })} />
                <Field label={t(lang, 'da_f_image')}>
                  <ImagePicker value={p.image} onChange={v => ops.upd(i, { image: v || undefined })} />
                </Field>
                <div className="adm-chks">
                  <AdmChk label={t(lang, 'da_f_published')} checked={p.published !== false} onChange={v => ops.upd(i, { published: v })} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-pink adm-add" onClick={add}>+ {t(lang, 'da_new_post')}</button>
    </div>
  );
}

// ── onglet événements ─────────────────────────────────────────────────────────
function EventsPanel({ draft, setDraft }) {
  const lang = useLang();
  const [openId, setOpenId] = React.useState('');
  const ops = listOps('events', setDraft);
  const add = () => { const id = genId('event'); ops.add({ id, title: '', date: '', place: '', text: '', published: true }); setOpenId(id); };
  return (
    <div className="adm-panel">
      <h3 className="adm-h">{t(lang, 'da_events_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_events_sub')}</p>
      <div className="adm-list">
        {draft.events.length === 0 && <p className="muted">{t(lang, 'da_none')}</p>}
        {draft.events.map((ev, i) => (
          <div key={ev.id} className="adm-item">
            <div className="adm-row">
              <div className="adm-row-main">
                <span className="adm-row-name">{ev.title || ''}{!ev.title && <em className="muted">{t(lang, 'da_new_event')}</em>}</span>
                <span className="adm-row-meta">{[ev.date, ev.place].filter(Boolean).join(' · ')}{ev.published === false ? ' · ' + t(lang, 'da_unpublished') : ''}</span>
              </div>
              <RowBtns
                editing={openId === ev.id}
                onEdit={() => setOpenId(openId === ev.id ? '' : ev.id)}
                onUp={() => ops.move(i, -1)}
                onDown={() => ops.move(i, 1)}
                onDel={() => { if (window.confirm(t(lang, 'da_confirm_delete'))) ops.del(i); }}
              />
            </div>
            {openId === ev.id && (
              <div className="adm-form">
                <AdmIn label={t(lang, 'da_f_title')} value={ev.title} onChange={v => ops.upd(i, { title: v })} />
                <AdmIn label={t(lang, 'da_f_date')} value={ev.date} onChange={v => ops.upd(i, { date: v })} />
                <AdmIn label={t(lang, 'da_f_place')} value={ev.place} onChange={v => ops.upd(i, { place: v })} />
                <AdmArea label={t(lang, 'da_f_text')} value={ev.text} onChange={v => ops.upd(i, { text: v })} rows={3} />
                <AdmIn label={t(lang, 'da_f_link')} value={ev.link} onChange={v => ops.upd(i, { link: v })} placeholder="https://…" />
                <AdmIn label={t(lang, 'da_f_linklabel')} value={ev.linkLabel} onChange={v => ops.upd(i, { linkLabel: v })} />
                <Field label={t(lang, 'da_f_image')}>
                  <ImagePicker value={ev.image} onChange={v => ops.upd(i, { image: v || undefined })} />
                </Field>
                <div className="adm-chks">
                  <AdmChk label={t(lang, 'da_f_published')} checked={ev.published !== false} onChange={v => ops.upd(i, { published: v })} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-pink adm-add" onClick={add}>+ {t(lang, 'da_new_event')}</button>
    </div>
  );
}

// ── onglet réglages ───────────────────────────────────────────────────────────
function TiersTable({ label, list, onChange }) {
  const lang = useLang();
  const upd = (i, patch) => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="adm-tiers">
      <h4 className="adm-h4">{label}</h4>
      <div className="adm-tiers-row adm-tiers-head"><span>{t(lang, 'da_tier_qty')}</span><span>{t(lang, 'da_tier_price')}</span><span /></div>
      {list.map((row, i) => (
        <div key={i} className="adm-tiers-row">
          <input className="inp" type="number" step="1" min="1" value={row.qty} onChange={e => upd(i, { qty: Number(e.target.value) })} />
          <input className="inp" type="number" step="0.5" min="0" value={row.price} onChange={e => upd(i, { price: Number(e.target.value) })} />
          <button type="button" className="btn-delete" onClick={() => onChange(list.filter((x, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="link-btn" onClick={() => onChange(list.concat([{ qty: list.length ? list[list.length - 1].qty + 10 : 10, price: 0 }]))}>+ {t(lang, 'da_tier_add')}</button>
    </div>
  );
}

function SettingsPanel({ draft, setDraft, notify }) {
  const lang = useLang();
  const [restoring, setRestoring] = React.useState(false);
  const restorePrev = async () => {
    setRestoring(true);
    try {
      const r = await fetch('/api/content?prev=1', { cache: 'no-store' });
      const j = r.ok ? await r.json() : null;
      if (!j || !j.content) { notify(t(lang, 'da_restore_none')); setRestoring(false); return; }
      setDraft(normalizeDraft(j.content));
      notify(t(lang, 'da_restore_loaded'));
    } catch (e) { notify(t(lang, 'da_restore_none')); }
    setRestoring(false);
  };
  return (
    <div className="adm-panel">
      <h3 className="adm-h">{t(lang, 'da_settings_title')}</h3>
      <p className="muted adm-sub">{t(lang, 'da_settings_sub')}</p>
      <div style={{ maxWidth: 260 }}>
        <AdmNum label={t(lang, 'da_delivery')} value={draft.deliveryFee} onChange={v => setDraft(d => ({ ...d, deliveryFee: v }))} />
      </div>
      <div className="adm-tiers-wrap">
        <TiersTable label={t(lang, 'da_tiers_prints')} list={draft.photoTiers} onChange={v => setDraft(d => ({ ...d, photoTiers: v }))} />
        <TiersTable label={t(lang, 'da_tiers_kit')} list={draft.photoTiersKit} onChange={v => setDraft(d => ({ ...d, photoTiersKit: v }))} />
      </div>
      <h4 className="adm-h4" style={{ marginTop: 28 }}>{t(lang, 'da_restore')}</h4>
      <p className="muted" style={{ fontSize: 13 }}>{t(lang, 'da_restore_hint')}</p>
      <button type="button" className="btn btn-outline" onClick={restorePrev} disabled={restoring}>{t(lang, 'da_restore_btn')}</button>
    </div>
  );
}

// ── le dashboard (porte d'entrée Clerk + onglets + brouillon + publication) ───
function AdminDashboard() {
  const lang = useLang();
  // Connexion : code d'accès boutique (mémorisé sur l'appareil) en priorité,
  // sinon session Clerk si elle est configurée.
  const [authState, setAuthState] = React.useState(() => (getStoredKey() ? 'signedIn' : 'loading')); // loading | signedOut | signedIn | error
  const [authMode, setAuthMode] = React.useState(() => (getStoredKey() ? 'key' : ''));
  const [userEmail, setUserEmail] = React.useState('');
  const signInRef = React.useRef(null);
  const [keyInput, setKeyInput] = React.useState('');
  const [keyBusy, setKeyBusy] = React.useState(false);
  const [keyErr, setKeyErr] = React.useState('');
  const [tab, setTab] = React.useState('orders');
  const [draft, setDraft] = React.useState(null);
  const [savedJson, setSavedJson] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [note, setNote] = React.useState('');

  // Initialise Clerk and track sign-in state (le code boutique reste prioritaire)
  React.useEffect(() => {
    let mounted = true, unsub = null;
    (window.__clerkReady || Promise.reject(new Error('no clerk'))).then((clerk) => {
      const sync = () => {
        if (!mounted) return;
        if (clerk.user) {
          setAuthMode('clerk');
          setAuthState('signedIn');
          setUserEmail((clerk.user.primaryEmailAddress && clerk.user.primaryEmailAddress.emailAddress) || '');
        } else if (!getStoredKey()) {
          setAuthState('signedOut');
        }
      };
      sync();
      unsub = clerk.addListener(sync);
    }).catch(() => { if (mounted && !getStoredKey()) setAuthState('error'); });
    return () => { mounted = false; if (typeof unsub === 'function') unsub(); };
  }, []);

  // Vérifie le code d'accès contre l'API commandes, puis le mémorise.
  const submitKey = async () => {
    const k = keyInput.trim();
    if (!k || keyBusy) return;
    setKeyBusy(true); setKeyErr('');
    try {
      const r = await fetch('/api/orders', { headers: { 'x-admin-key': k } });
      if (r.status === 401) { setKeyErr(t(lang, 'da_key_bad')); setKeyBusy(false); return; }
      if (!r.ok) { setKeyErr(t(lang, 'ad_st_srverr') + ' (' + r.status + ')'); setKeyBusy(false); return; }
      setStoredKey(k);
      setKeyInput('');
      setAuthMode('key');
      setAuthState('signedIn');
    } catch (e) { setKeyErr(t(lang, 'ad_st_unreach')); }
    setKeyBusy(false);
  };

  const signOut = () => {
    clearStoredKey();
    try { if (window.Clerk && window.Clerk.user) window.Clerk.signOut(); } catch (e) {}
    setAuthMode('');
    setUserEmail('');
    setDraft(null); setSavedJson(''); setNote('');
    setAuthState('signedOut');
  };

  // Mount Clerk's sign-in widget while signed out
  React.useEffect(() => {
    if (authState === 'signedOut' && signInRef.current && window.Clerk) {
      window.Clerk.mountSignIn(signInRef.current);
      const node = signInRef.current;
      return () => { try { window.Clerk.unmountSignIn(node); } catch (e) {} };
    }
  }, [authState]);

  // Charge le contenu publié dans le brouillon une fois connecté
  const loadContent = async () => {
    try {
      const r = await fetch('/api/content?fresh=1', { cache: 'no-store' });
      const j = r.ok ? await r.json() : null;
      const d = j && j.content ? normalizeDraft(j.content) : defaultDraft();
      setDraft(d); setSavedJson(JSON.stringify(d));
      if (!(j && j.content)) setNote(t(lang, 'da_using_defaults'));
    } catch (e) {
      const d = defaultDraft();
      setDraft(d); setSavedJson(JSON.stringify(d));
      setNote(t(lang, 'da_using_defaults'));
    }
  };
  React.useEffect(() => { if (authState === 'signedIn') loadContent(); }, [authState]);

  const dirty = draft != null && JSON.stringify(draft) !== savedJson;

  const save = async () => {
    if (!draft || saving) return;
    if (draft.products.some(p => !String(p.name || '').trim())) { setNote(t(lang, 'da_val_name')); return; }
    setSaving(true); setNote('');
    try {
      const auth = await adminAuthHeaders();
      if (!auth) { setNote(t(lang, 'ad_st_expired')); setSaving(false); return; }
      const r = await fetch('/api/content', {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, auth),
        body: JSON.stringify(draft),
      });
      if (!r.ok) {
        let msg = ''; try { const j = await r.json(); msg = j.error || ''; } catch (e) {}
        setNote(t(lang, 'da_save_fail') + ' (' + r.status + (msg ? ' · ' + msg : '') + ')');
        setSaving(false); return;
      }
      setSavedJson(JSON.stringify(draft));
      setNote(t(lang, 'da_saved'));
      // Met aussi à jour le storefront ouvert dans cet onglet, sans rechargement.
      if (window.__meyvaApplyContent) window.__meyvaApplyContent(JSON.parse(JSON.stringify(draft)));
    } catch (e) { setNote(t(lang, 'da_save_fail') + '.'); }
    setSaving(false);
  };

  const discard = () => {
    if (!dirty) return;
    if (!window.confirm(t(lang, 'da_confirm_discard'))) return;
    setDraft(JSON.parse(savedJson));
    setNote('');
  };

  const Title = <h1 className="serif checkout-title">{t(lang, 'da_t1')}<em className="serif-italic">{t(lang, 'da_em')}</em></h1>;
  const Eyebrow = <div className="section-eyebrow">{t(lang, 'ad_eyebrow')}</div>;

  const KeyForm = (
    <div className="admin-keyform">
      <p className="muted" style={{ marginBottom: 8 }}>{t(lang, 'da_key_label')}</p>
      <div className="admin-keyrow">
        <input
          className="inp" type="password" autoComplete="current-password"
          placeholder={t(lang, 'da_key_ph')} value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitKey(); }}
        />
        <button className="btn btn-pink" onClick={submitKey} disabled={keyBusy}>
          {keyBusy ? t(lang, 'da_key_checking') : t(lang, 'da_key_btn')}
        </button>
      </div>
      {keyErr && <p className="field-msg" style={{ marginTop: 8 }}>{keyErr}</p>}
    </div>
  );

  if (authState === 'loading') {
    return <section className="admin">{Eyebrow}{Title}<p className="muted">{t(lang, 'ad_loading')}</p></section>;
  }
  if (authState === 'error') {
    // Clerk indisponible (ex. hors-ligne / non configuré) : le code marche quand même.
    return <section className="admin">{Eyebrow}{Title}{KeyForm}</section>;
  }
  if (authState === 'signedOut') {
    return (
      <section className="admin">
        {Eyebrow}{Title}
        <p className="muted" style={{ marginBottom: 20 }}>{t(lang, 'ad_signin_sub')}</p>
        {KeyForm}
        <p className="muted admin-or">{t(lang, 'da_or')}</p>
        <div className="admin-signin" ref={signInRef} />
      </section>
    );
  }

  const TABS = [
    { id: 'orders', label: t(lang, 'da_tab_orders') },
    { id: 'products', label: t(lang, 'da_tab_products') },
    { id: 'promos', label: t(lang, 'da_tab_promos') },
    { id: 'posts', label: t(lang, 'da_tab_posts') },
    { id: 'events', label: t(lang, 'da_tab_events') },
    { id: 'settings', label: t(lang, 'da_tab_settings') },
  ];

  let panel = null;
  if (tab === 'orders') panel = <OrdersPanel />;
  else if (!draft) panel = <p className="muted">{t(lang, 'da_loading')}</p>;
  else if (tab === 'products') panel = <ProductsPanel draft={draft} setDraft={setDraft} notify={setNote} />;
  else if (tab === 'promos') panel = <PromosPanel draft={draft} setDraft={setDraft} />;
  else if (tab === 'posts') panel = <PostsPanel draft={draft} setDraft={setDraft} />;
  else if (tab === 'events') panel = <EventsPanel draft={draft} setDraft={setDraft} />;
  else if (tab === 'settings') panel = <SettingsPanel draft={draft} setDraft={setDraft} notify={setNote} />;

  return (
    <section className="admin">
      {Eyebrow}
      {Title}
      <div className="admin-userbar">
        <span className="muted" style={{ fontSize: 13 }}>
          {authMode === 'key' ? t(lang, 'da_key_mode') : t(lang, 'ad_connected') + (userEmail ? ' : ' + userEmail : '')}
        </span>
        <button className="btn btn-outline" onClick={signOut}>{t(lang, 'ad_signout')}</button>
      </div>
      <div className="cat-tabs admin-tabs">
        {TABS.map(tb => (
          <button key={tb.id} className={'cat-tab' + (tab === tb.id ? ' active' : '')} onClick={() => setTab(tb.id)}>{tb.label}</button>
        ))}
      </div>
      {note && <p className="muted adm-note">{note}</p>}
      {panel}
      {dirty && (
        <div className="admin-savebar">
          <span className="admin-savebar-label">{t(lang, 'da_dirty')}</span>
          <button className="btn btn-outline" onClick={discard} disabled={saving}>{t(lang, 'da_discard')}</button>
          <button className="btn btn-pink" onClick={save} disabled={saving}>{saving ? t(lang, 'da_saving') : t(lang, 'da_save')}</button>
        </div>
      )}
    </section>
  );
}

window.Checkout = Checkout;
window.AdminDashboard = AdminDashboard;
Object.assign(window, { OrdersPanel, ProductsPanel, PromosPanel, PostsPanel, EventsPanel, SettingsPanel, ImagePicker, defaultDraft, normalizeDraft });
window.buildMescolisCSV = buildMescolisCSV;
window.loadOrders = loadOrders;
