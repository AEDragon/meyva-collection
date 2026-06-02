/* global React, ProductSwatch */

// Section « Grande promotion spéciale » — affiche les offres en cours
// (depuis window.MEYVA_DATA.PROMOS). index.html est la version exécutée ;
// ce fichier est un miroir source.

function PromoCard({ promo, setPage }) {
  return React.createElement('article', { className: 'promo-card' },
    React.createElement('span', { className: 'promo-badge' }, promo.badge),
    React.createElement('div', { className: 'promo-art' },
      React.createElement(ProductSwatch, { name: promo.swatch })
    ),
    React.createElement('div', { className: 'promo-eyebrow' }, promo.title),
    React.createElement('h3', { className: 'promo-highlight' }, promo.highlight),
    React.createElement('p', { className: 'promo-sub' }, promo.sub),
    React.createElement('button', { className: 'btn btn-pink', style: { marginTop: 4 }, onClick: () => setPage && setPage('shop') }, promo.cta || 'J’en profite')
  );
}

function Promos({ setPage }) {
  const items = (window.MEYVA_DATA && window.MEYVA_DATA.PROMOS) || [];
  if (!items.length) return null;

  return React.createElement('section', { className: 'section promos' },
    React.createElement('div', { className: 'promos-head' },
      React.createElement('div', { className: 'section-eyebrow', style: { color: 'var(--pink-deep)' } }, 'Offres limitées'),
      React.createElement('h2', { className: 'section-title' },
        'Grande promotion ', React.createElement('em', null, 'spéciale'), ' !')
    ),
    React.createElement('div', { className: 'promo-grid' },
      items.map(p => React.createElement(PromoCard, { key: p.id, promo: p, setPage: setPage }))
    ),
    React.createElement('p', { className: 'promos-foot' }, 'Offres limitées — profitez-en maintenant !')
  );
}

Object.assign(window, { Promos, PromoCard });
