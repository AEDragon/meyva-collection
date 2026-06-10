/* global React, ProductSwatch */

// "Bientôt disponible" — montre les produits préparés mais pas encore lancés.
// Aperçu uniquement : pas de bouton d'ajout au panier, on réserve par Instagram.

function ComingSoonCard({ product }) {
  return React.createElement('article', { className: 'product-card coming-soon-card' },
    React.createElement('div', { className: 'product-thumb' },
      React.createElement('span', { className: 'product-badge cs-badge' }, product.eta || 'Bientôt'),
      React.createElement('div', { className: 'product-thumb-inner cs-thumb-inner' },
        product.image
          ? React.createElement('img', { src: product.image, alt: product.name, className: 'product-photo', loading: 'lazy' })
          : React.createElement(ProductSwatch, { name: product.swatch })
      ),
      React.createElement('div', { className: 'cs-veil' },
        React.createElement('span', { className: 'cs-veil-text' }, 'Bientôt disponible')
      )
    ),
    React.createElement('div', null,
      React.createElement('div', { className: 'product-cat' }, product.cat),
      React.createElement('div', { className: 'product-meta' },
        React.createElement('h3', { className: 'product-name' }, product.name)
      ),
      product.teaser && React.createElement('p', { className: 'cs-teaser' }, product.teaser)
    )
  );
}

function ComingSoon() {
  const items = (window.MEYVA_DATA && window.MEYVA_DATA.COMING_SOON) || [];
  if (!items.length) return null;

  return React.createElement('section', { className: 'section coming-soon' },
    React.createElement('div', { className: 'section-head' },
      React.createElement('div', null,
        React.createElement('div', { className: 'section-eyebrow' }, 'En préparation'),
        React.createElement('h2', { className: 'section-title' },
          'Bientôt ', React.createElement('em', null, 'disponible'))
      ),
      React.createElement('a', {
        href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener',
        className: 'section-link',
      }, 'Être prévenu(e) →')
    ),
    React.createElement('div', { className: 'product-grid' },
      items.map(p => React.createElement(ComingSoonCard, { key: p.id, product: p }))
    ),
    React.createElement('p', { className: 'cs-note' },
      'Ces nouveautés ne sont pas encore en vente. Écris-nous sur Instagram pour les réserver ou être prévenu(e) du lancement.')
  );
}

Object.assign(window, { ComingSoon, ComingSoonCard });
