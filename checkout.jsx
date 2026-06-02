/* global React, Icon */

// Commande client → enregistrement central (API /api/orders + Vercel Blob)
// → export au format mescolis.tn. Paiement en espèces à la livraison.
// NOTE : index.html est la version exécutée. Ce fichier est un miroir source.

const ORDERS_KEY = 'meyva_orders_v1';
function loadOrders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; } }
function saveOrders(list) { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); }

function orderDesignation(o) {
  return (o.items || []).map(i => {
    const q = i.option && i.option.tier ? (i.option.tier.qty + ' photos') : null;
    return i.name + (q ? ' (' + q + ')' : '') + ' x' + i.qty;
  }).join(' + ');
}
function csvEscape(v) { v = (v == null ? '' : String(v)); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }

// Colonnes EXACTES attendues par mescolis.tn (onglet « import-modele »)
const MESCOLIS_COLS = ['destinataire_nom', 'adresse', 'ville', 'gouvernerat', 'telephone', 'telephone2', 'nombre_de_colis', 'prix', 'designation'];
function orderToMescolisRow(o) {
  return [o.nom, o.adresse, o.ville, o.gouvernorat, o.telephone, o.telephone2 || '', o.colis || 1, o.total, orderDesignation(o)];
}
function buildMescolisCSV(orders) {
  const rows = [MESCOLIS_COLS.join(',')];
  orders.forEach(o => rows.push(orderToMescolisRow(o).map(csvEscape).join(',')));
  return '﻿' + rows.join('\r\n'); // BOM => Excel ouvre en UTF-8
}
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
function stamp() { const d = new Date(); const z = n => String(n).padStart(2, '0'); return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()); }

function Field({ label, children, error, required }) {
  return React.createElement('label', { className: 'field' + (error ? ' field-err' : '') },
    React.createElement('span', { className: 'field-label' }, label, required && React.createElement('span', { className: 'req' }, ' *')),
    children,
    error && React.createElement('span', { className: 'field-msg' }, error)
  );
}

function Checkout({ cart, onPlaced, setPage }) {
  const D = window.MEYVA_DATA;
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const shipping = cart.length ? (D.DELIVERY_FEE || 8) : 0;
  const total = subtotal + shipping;
  const [f, setF] = React.useState({ nom: '', telephone: '', telephone2: '', gouvernorat: '', ville: '', adresse: '', note: '' });
  const [errors, setErrors] = React.useState({});
  const [placed, setPlaced] = React.useState(null);
  const [sending, setSending] = React.useState(false);
  const set = (k, v) => setF(s => Object.assign({}, s, { [k]: v }));

  if (placed) {
    return React.createElement('section', { className: 'checkout-done' },
      React.createElement('div', { className: 'check-badge' }, '✓'),
      React.createElement('h1', { className: 'serif' }, 'Commande enregistrée !'),
      React.createElement('p', null, 'Merci ', React.createElement('strong', null, placed.nom), '. Ta commande ', React.createElement('strong', null, placed.id), ' est bien enregistrée.'),
      React.createElement('p', { className: 'muted' }, 'Paiement en espèces à la livraison · Total à payer : ', React.createElement('strong', null, placed.total + ' DT'), ' (livraison incluse).'),
      React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' } },
        React.createElement('button', { className: 'btn btn-pink', onClick: () => setPage('shop') }, 'Continuer mes achats'),
        React.createElement('a', { className: 'btn btn-outline', href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener' }, React.createElement(Icon.insta), '@meyva__collection')
      )
    );
  }

  if (!cart.length) {
    return React.createElement('section', { className: 'checkout-done' },
      React.createElement('h1', { className: 'serif' }, 'Ton panier est vide'),
      React.createElement('p', { className: 'muted' }, 'Ajoute des produits avant de passer commande.'),
      React.createElement('button', { className: 'btn btn-pink', style: { marginTop: 16 }, onClick: () => setPage('shop') }, 'Voir la boutique')
    );
  }

  const validate = () => {
    const e = {};
    if (!f.nom.trim()) e.nom = 'Indique ton nom et prénom.';
    if (!/^[0-9+\s]{6,}$/.test(f.telephone.trim())) e.telephone = 'Numéro de téléphone valide requis.';
    if (!f.gouvernorat) e.gouvernorat = 'Choisis ton gouvernorat.';
    if (!f.ville.trim()) e.ville = 'Indique ta ville.';
    if (!f.adresse.trim()) e.adresse = 'Indique ton adresse de livraison.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = async () => {
    if (!validate()) { window.scrollTo(0, 0); return; }
    if (sending) return;
    const order = {
      id: 'CMD-' + Date.now(),
      createdAt: new Date().toISOString(),
      nom: f.nom.trim(), telephone: f.telephone.trim(), telephone2: f.telephone2.trim(),
      gouvernorat: f.gouvernorat, ville: f.ville.trim(), adresse: f.adresse.trim(), note: f.note.trim(),
      items: cart.map(i => ({ name: i.name, qty: i.qty, option: i.option, unitPrice: i.unitPrice, cat: i.cat })),
      subtotal: subtotal, shipping: shipping, total: total, colis: 1, status: 'nouveau',
    };
    const list = loadOrders(); list.push(order); saveOrders(list); // sauvegarde locale de secours
    setSending(true);
    try {
      await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
    } catch (e) { /* fallback: commande conservée localement */ }
    setSending(false);
    onPlaced && onPlaced();
    setPlaced(order);
    window.scrollTo(0, 0);
  };

  const input = (k, type) => React.createElement('input', { className: 'inp', type: type || 'text', value: f[k], onChange: e => set(k, e.target.value) });

  return React.createElement('section', { className: 'checkout' },
    React.createElement('div', { className: 'checkout-form' },
      React.createElement('div', { className: 'section-eyebrow' }, 'Commande'),
      React.createElement('h1', { className: 'serif checkout-title' }, 'Tes ', React.createElement('em', { className: 'serif-italic' }, 'coordonnées')),
      React.createElement('p', { className: 'muted', style: { marginTop: 4 } }, 'Paiement en espèces à la livraison. Livraison partout en Tunisie en 2–4 jours.'),
      React.createElement('div', { className: 'form-grid' },
        React.createElement(Field, { label: 'Nom et prénom', required: true, error: errors.nom }, input('nom')),
        React.createElement(Field, { label: 'Téléphone', required: true, error: errors.telephone }, input('telephone', 'tel')),
        React.createElement(Field, { label: 'Téléphone secondaire' }, input('telephone2', 'tel')),
        React.createElement(Field, { label: 'Gouvernorat', required: true, error: errors.gouvernorat },
          React.createElement('select', { className: 'inp', value: f.gouvernorat, onChange: e => set('gouvernorat', e.target.value) },
            React.createElement('option', { value: '' }, '— Choisir —'),
            (D.GOUVERNORATS || []).map(g => React.createElement('option', { key: g, value: g }, g))
          )
        ),
        React.createElement(Field, { label: 'Ville / localité', required: true, error: errors.ville }, input('ville')),
        React.createElement(Field, { label: 'Adresse de livraison', required: true, error: errors.adresse },
          React.createElement('textarea', { className: 'inp', rows: 2, value: f.adresse, onChange: e => set('adresse', e.target.value) })
        ),
        React.createElement(Field, { label: 'Note (optionnel)' },
          React.createElement('textarea', { className: 'inp', rows: 2, value: f.note, onChange: e => set('note', e.target.value) })
        )
      )
    ),
    React.createElement('aside', { className: 'order-summary' },
      React.createElement('h3', null, 'Ta commande'),
      cart.map((i, idx) => React.createElement('div', { key: idx, className: 'sum-line' },
        React.createElement('span', null, i.name, i.option && i.option.tier ? ' · ' + i.option.tier.qty + ' photos' : '', ' × ' + i.qty),
        React.createElement('span', null, (i.unitPrice * i.qty) + ' DT')
      )),
      React.createElement('div', { className: 'sum-line muted' }, React.createElement('span', null, 'Sous-total'), React.createElement('span', null, subtotal + ' DT')),
      React.createElement('div', { className: 'sum-line muted' }, React.createElement('span', null, 'Livraison'), React.createElement('span', null, shipping + ' DT')),
      React.createElement('div', { className: 'sum-total' }, React.createElement('span', null, 'Total'), React.createElement('span', null, total + ' DT')),
      React.createElement('button', { className: 'btn btn-pink', style: { width: '100%', marginTop: 16 }, onClick: submit, disabled: sending },
        sending ? 'Envoi…' : 'Confirmer la commande'),
      React.createElement('p', { className: 'muted', style: { fontSize: 12, marginTop: 10, textAlign: 'center' } }, 'Aucun paiement en ligne — tu payes en espèces à la réception.')
    )
  );
}

function OrderAdmin() {
  const [orders, setOrders] = React.useState([]);
  const [adminKey, setAdminKey] = React.useState(localStorage.getItem('meyva_admin_key') || '');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const loadServer = async (k) => {
    const key = (k != null ? k : adminKey).trim();
    if (!key) { setStatus('Entre la clé admin pour charger les commandes du serveur.'); return; }
    localStorage.setItem('meyva_admin_key', key);
    setLoading(true); setStatus('Chargement depuis le serveur…');
    try {
      const r = await fetch('/api/orders?key=' + encodeURIComponent(key));
      if (r.status === 401) { setStatus('Clé admin incorrecte.'); setLoading(false); return; }
      if (!r.ok) { setStatus('Erreur serveur (' + r.status + ').'); setLoading(false); return; }
      const j = await r.json();
      setOrders(j.orders || []);
      setStatus((j.orders || []).length + ' commande(s) chargée(s) depuis le serveur.');
    } catch (e) { setStatus('Impossible de joindre le serveur (disponible uniquement sur le site en ligne).'); }
    setLoading(false);
  };
  const loadLocal = () => { setOrders(loadOrders()); setStatus('Commandes locales (cet appareil uniquement).'); };
  const exportCSV = () => { if (!orders.length) return; downloadFile('commandes-mescolis-' + stamp() + '.csv', buildMescolisCSV(orders), 'text/csv;charset=utf-8'); };

  React.useEffect(() => { if (adminKey) loadServer(adminKey); }, []);

  return React.createElement('section', { className: 'admin' },
    React.createElement('div', { className: 'section-eyebrow' }, 'Espace boutique'),
    React.createElement('h1', { className: 'serif checkout-title' }, 'Commandes ', React.createElement('em', { className: 'serif-italic' }, 'reçues')),
    React.createElement('div', { className: 'admin-keybar' },
      React.createElement('input', { className: 'inp', style: { maxWidth: 280 }, type: 'password', placeholder: 'Clé admin', value: adminKey, onChange: e => setAdminKey(e.target.value) }),
      React.createElement('button', { className: 'btn btn-pink', onClick: () => loadServer(), disabled: loading }, loading ? 'Chargement…' : 'Charger les commandes'),
      React.createElement('button', { className: 'btn btn-outline', onClick: loadLocal }, 'Cet appareil')
    ),
    status && React.createElement('p', { className: 'muted', style: { fontSize: 13 } }, status),
    React.createElement('div', { className: 'admin-bar' },
      React.createElement('div', { className: 'admin-stats' },
        React.createElement('span', null, React.createElement('strong', null, orders.length), ' commande' + (orders.length > 1 ? 's' : '')),
        React.createElement('span', null, 'Total : ', React.createElement('strong', null, revenue + ' DT'))
      ),
      React.createElement('button', { className: 'btn btn-pink', onClick: exportCSV, disabled: !orders.length }, 'Exporter pour mescolis.tn (CSV)')
    ),
    React.createElement('p', { className: 'muted', style: { fontSize: 13 } }, 'Le fichier CSV reprend exactement les colonnes du modèle mescolis.tn : destinataire_nom, adresse, ville, gouvernerat, telephone, telephone2, nombre_de_colis, prix, designation.'),
    orders.length === 0
      ? React.createElement('div', { className: 'admin-empty' }, 'Aucune commande chargée. Entre ta clé admin puis clique « Charger les commandes » pour voir les commandes reçues sur le site.')
      : React.createElement('div', { className: 'admin-table-wrap' },
          React.createElement('table', { className: 'admin-table' },
            React.createElement('thead', null, React.createElement('tr', null,
              ['#', 'Date', 'Nom', 'Tél', 'Gouvernorat', 'Ville', 'Adresse', 'Articles', 'Total'].map(h => React.createElement('th', { key: h }, h))
            )),
            React.createElement('tbody', null,
              orders.slice().reverse().map(o => React.createElement('tr', { key: o.id },
                React.createElement('td', null, (o.id || '').replace('CMD-', '#')),
                React.createElement('td', null, (o.createdAt || '').slice(0, 10)),
                React.createElement('td', null, o.nom),
                React.createElement('td', null, o.telephone),
                React.createElement('td', null, o.gouvernorat),
                React.createElement('td', null, o.ville),
                React.createElement('td', null, o.adresse),
                React.createElement('td', null, orderDesignation(o)),
                React.createElement('td', null, o.total + ' DT')
              ))
            )
          )
        )
  );
}

Object.assign(window, { Checkout, OrderAdmin, buildMescolisCSV, loadOrders });
