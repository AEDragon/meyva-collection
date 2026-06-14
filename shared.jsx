/* global React, ProductSwatch */
const Icon = {
  search: () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('circle', { cx: 11, cy: 11, r: 7 }),
    React.createElement('line', { x1: 16, y1: 16, x2: 21, y2: 21 })
  ),
  heart: () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('path', { d: 'M12 21s-7-4.5-9.5-9C.7 8.6 2.5 4 6.5 4c2 0 3.5 1.2 5.5 3.5C13.8 5.2 15.5 4 17.5 4c4 0 5.8 4.6 4 8-2.5 4.5-9.5 9-9.5 9z' })
  ),
  bag: () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('path', { d: 'M5 8h14l-1.2 12.3a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 8z' }),
    React.createElement('path', { d: 'M9 8V6a3 3 0 0 1 6 0v2' })
  ),
  close: () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 }),
    React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 })
  ),
  insta: () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 5 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 4 }),
    React.createElement('circle', { cx: 17.5, cy: 6.5, r: 0.8, fill: 'currentColor' })
  ),
  truck: () => React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('rect', { x: 1, y: 6, width: 13, height: 11 }),
    React.createElement('path', { d: 'M14 9h4l3 3v5h-7' }),
    React.createElement('circle', { cx: 5, cy: 18, r: 2 }),
    React.createElement('circle', { cx: 17, cy: 18, r: 2 })
  ),
  gift: () => React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('rect', { x: 3, y: 8, width: 18, height: 4 }),
    React.createElement('rect', { x: 5, y: 12, width: 14, height: 9 }),
    React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 21 }),
    React.createElement('path', { d: 'M12 8s-3-5-6-3 1 5 6 3M12 8s3-5 6-3-1 5-6 3' })
  ),
  spark: () => React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('path', { d: 'M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M5.5 18.5l4 -4M14.5 9.5l4 -4' })
  ),
};

function UtilityBar({ lang, setLang }) {
  return React.createElement('div', { className: 'utility-bar' },
    React.createElement('div', { className: 'lang-toggle' },
      React.createElement('button', { className: lang === 'fr' ? 'active' : '', onClick: () => setLang('fr') }, 'FR'),
      React.createElement('span', { className: 'sep' }, '|'),
      React.createElement('button', { className: lang === 'ar' ? 'active' : '', onClick: () => setLang('ar') }, '\u0639')
    ),
    React.createElement('div', null, 'Frais de livraison : 8 DT partout en Tunisie')
  );
}

function Logo() {
  return React.createElement('div', { className: 'nav-logo-mark' },
    React.createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'var(--pink-deep)' },
      React.createElement('path', { d: 'M12 21s-7-4.5-9.5-9C.7 8.6 2.5 4 6.5 4c2 0 3.5 1.2 5.5 3.5C13.8 5.2 15.5 4 17.5 4c4 0 5.8 4.6 4 8-2.5 4.5-9.5 9-9.5 9z' })
    )
  );
}

function Nav({ page, setPage, cartCount, openCart }) {
  const links = [
    { id: 'home', label: 'Accueil' },
    { id: 'shop', label: 'Boutique' },
    { id: 'product', label: 'Pack Polaroid' },
    { id: 'about', label: 'À propos' },
  ];
  return React.createElement('nav', { className: 'nav' },
    React.createElement('div', { className: 'nav-links' },
      links.map(l => React.createElement('button', {
        key: l.id,
        onClick: () => setPage(l.id),
        className: page === l.id ? 'active' : '',
      }, l.label))
    ),
    React.createElement('div', { className: 'nav-logo', onClick: () => setPage('home') },
      React.createElement(Logo, null),
      React.createElement('div', { className: 'nav-logo-text' }, 'meyva ', React.createElement('em', null, 'collection'))
    ),
    React.createElement('div', { className: 'nav-right' },
      React.createElement('button', { className: 'nav-icon-btn', 'aria-label': 'Recherche' }, React.createElement(Icon.search)),
      React.createElement('a', { className: 'nav-icon-btn', href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener', 'aria-label': 'Instagram' }, React.createElement(Icon.insta)),
      React.createElement('button', { className: 'nav-icon-btn', onClick: openCart, 'aria-label': 'Panier' },
        React.createElement(Icon.bag),
        cartCount > 0 && React.createElement('span', { className: 'cart-count' }, cartCount)
      )
    )
  );
}

function ProductCard({ product, onOpen }) {
  return React.createElement('article', { className: 'product-card' + (product.soldOut ? ' is-soldout' : ''), onClick: () => onOpen(product) },
    React.createElement('div', { className: 'product-thumb' },
      product.soldOut
        ? React.createElement('span', { className: 'product-badge sold-out-badge' }, 'Épuisé')
        : product.badge && React.createElement('span', { className: 'product-badge' }, product.badge),
      React.createElement('div', { className: 'product-thumb-inner' },
        React.createElement(ProductSwatch, { name: product.swatch })
      ),
      React.createElement('div', { className: 'product-quick' }, 'Voir le produit')
    ),
    React.createElement('div', null,
      React.createElement('div', { className: 'product-cat' }, product.cat),
      React.createElement('div', { className: 'product-meta' },
        React.createElement('h3', { className: 'product-name' }, product.name),
        React.createElement('span', { className: 'product-price' },
          product.tiers ? 'dès ' + product.fromPrice + ' DT' : product.price + ' DT'
        )
      ),
      product.secondary && React.createElement('div', { style: { fontSize: 12, color: 'var(--pink-deep)', marginTop: 4 } }, product.secondary)
    )
  );
}

function Footer() {
  return React.createElement('footer', { className: 'footer' },
    React.createElement('div', { className: 'footer-grid' },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 } },
          React.createElement(Logo, null),
          React.createElement('div', { style: { fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 } },
            'meyva ', React.createElement('em', { className: 'serif-italic', style: { color: 'var(--pink)' } }, 'collection'))
        ),
        React.createElement('p', { style: { fontSize: 14, opacity: 0.75, lineHeight: 1.6, maxWidth: 320, margin: 0 } },
          'Petits objets doux, photos polaroid et cadeaux personnalisés. Livré partout en Tunisie 🇹🇳')
      ),
      React.createElement('div', null,
        React.createElement('h4', null, 'Boutique'),
        React.createElement('ul', null,
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Pack Polaroid + LED')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Stickers')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Posters')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Bougies')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Certificats'))
        )
      ),
      React.createElement('div', null,
        React.createElement('h4', null, 'Aide'),
        React.createElement('ul', null,
          React.createElement('li', null, React.createElement('a', { href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener' }, 'Nous contacter')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Livraison')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'Comment commander')),
          React.createElement('li', null, React.createElement('a', { href: '#' }, 'FAQ'))
        )
      ),
      React.createElement('div', { className: 'newsletter' },
        React.createElement('h4', null, 'Reste au courant'),
        React.createElement('p', { style: { fontSize: 13, opacity: 0.75, marginTop: 0, marginBottom: 14 } },
          'Nouveautés et drops, une fois par mois.'),
        React.createElement('input', { placeholder: 'ton@email.com' }),
        React.createElement('button', { className: 'btn btn-pink', style: { width: '100%' } }, 'S\u2019inscrire')
      )
    ),
    React.createElement('div', { className: 'footer-bottom' },
      React.createElement('span', null, '© 2026 meyva collection'),
      React.createElement('span', { className: 'footer-tagline' },
        'Made with ', React.createElement('em', null, 'love'), ' in Tunis · صنع بالحب في تونس'),
      React.createElement('a', { href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener', style: { display: 'flex', alignItems: 'center', gap: 6 } },
        React.createElement(Icon.insta), '@meyva__collection')
    )
  );
}

Object.assign(window, { Nav, Footer, ProductCard, UtilityBar, Icon, Logo });
