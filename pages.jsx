/* global React, ProductCard, ProductSwatch, PolaroidCluster, Icon, ComingSoon */

function Home({ products, setPage, openProduct }) {
  // Mise en avant pilotée par le flag `featured` (modifiable depuis le
  // dashboard) ; sans aucun flag, les 4 premiers produits font l'affaire.
  const flagged = products.filter(p => p.featured);
  const featured = (flagged.length ? flagged : products).slice(0, 4);
  const featuredIds = featured.map(p => p.id);
  const more = products.filter(p => !featuredIds.includes(p.id)).slice(0, 4);

  return React.createElement(React.Fragment, null,
    // HERO
    React.createElement('section', { className: 'hero' },
      React.createElement('div', { className: 'hero-text' },
        React.createElement('span', { className: 'hero-eyebrow' }, 'Boutique virtuelle'),
        React.createElement('h1', { className: 'hero-title' },
          'Des petites choses qui font ',
          React.createElement('em', null, 'sourire')
        ),
        React.createElement('p', { className: 'hero-sub' },
          'Photos polaroid, stickers, posters et bougies — pour ta chambre, pour offrir, pour te faire plaisir.'),
        React.createElement('div', { className: 'hero-cta' },
          React.createElement('button', { className: 'btn btn-pink', onClick: () => setPage('shop') }, 'Voir la boutique'),
          React.createElement('a', {
            className: 'btn btn-outline',
            href: 'https://instagram.com/meyva__collection',
            target: '_blank',
            rel: 'noopener',
          }, React.createElement(Icon.insta), '@meyva__collection')
        )
      ),
      React.createElement('div', { className: 'hero-img' },
        React.createElement('div', { className: 'aura-bg' }),
        React.createElement(PolaroidCluster, null)
      )
    ),

    // FEATURE BAND
    React.createElement('div', { className: 'feature-row' },
      React.createElement('div', { className: 'feature' },
        React.createElement('div', { className: 'feature-icon' }, React.createElement(Icon.truck)),
        React.createElement('h5', null, 'Livraison 8 DT'),
        React.createElement('p', null, 'Partout en Tunisie, en 2–4 jours')
      ),
      React.createElement('div', { className: 'feature' },
        React.createElement('div', { className: 'feature-icon' }, React.createElement(Icon.gift)),
        React.createElement('h5', null, 'Personnalisable'),
        React.createElement('p', null, 'Tes photos, ton texte, ton mix')
      ),
      React.createElement('div', { className: 'feature' },
        React.createElement('div', { className: 'feature-icon' }, React.createElement(Icon.spark)),
        React.createElement('h5', null, 'Commande sur Insta'),
        React.createElement('p', null, 'Confirmation et paiement par DM')
      )
    ),

    // FEATURED
    React.createElement('section', { className: 'section' },
      React.createElement('div', { className: 'section-head' },
        React.createElement('div', null,
          React.createElement('div', { className: 'section-eyebrow' }, 'Sélection'),
          React.createElement('h2', { className: 'section-title' },
            'Les ', React.createElement('em', null, 'préférés'), ' de la maison')
        ),
        React.createElement('button', { className: 'section-link', onClick: () => setPage('shop') }, 'Tout voir →')
      ),
      React.createElement('div', { className: 'product-grid' },
        featured.map(p => React.createElement(ProductCard, { key: p.id, product: p, onOpen: openProduct }))
      )
    ),

    // STORY BAND
    React.createElement('section', { className: 'story-band' },
      React.createElement('div', { className: 'story-band-inner' },
        React.createElement('h2', null,
          'Imprime tes souvenirs,', React.createElement('br'),
          'décore ta ', React.createElement('em', null, 'chambre.')),
        React.createElement('p', null,
          'Le pack signature : tes photos préférées en mini-format polaroid, avec des clips en bois et une guirlande LED chaude. À toi de choisir combien de photos.'),
        React.createElement('button', {
          className: 'btn btn-pink',
          style: { marginTop: 28 },
          onClick: () => setPage('product'),
        }, 'Découvrir le pack')
      )
    ),

    // ALSO
    React.createElement('section', { className: 'section' },
      React.createElement('div', { className: 'section-head' },
        React.createElement('div', null,
          React.createElement('div', { className: 'section-eyebrow' }, 'Aussi en boutique'),
          React.createElement('h2', { className: 'section-title' }, 'Tout le reste.')
        )
      ),
      React.createElement('div', { className: 'product-grid' },
        more.map(p => React.createElement(ProductCard, { key: p.id, product: p, onOpen: openProduct }))
      )
    ),

    // ANNONCES (« Quoi de neuf ? ») — contenu géré depuis le dashboard
    React.createElement(window.NewsSection, null),

    // COMING SOON
    React.createElement(window.ComingSoon, null),

    // INSTA STRIP
    React.createElement('section', { className: 'section', style: { paddingTop: 0 } },
      React.createElement('div', { className: 'section-head' },
        React.createElement('div', null,
          React.createElement('div', { className: 'section-eyebrow' }, '@meyva__collection'),
          React.createElement('h2', { className: 'section-title' },
            'Sur ', React.createElement('em', null, 'Instagram'))
        ),
        React.createElement('a', {
          href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener',
          className: 'section-link',
        }, 'Suivre →')
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, maxWidth: 1280, margin: '0 auto' } },
        ['pack', 'photos', 'stickers-pink', 'poster-aura', 'bougie', 'certificat'].map((s, i) =>
          React.createElement('div', { key: i, style: { aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' } },
            React.createElement(ProductSwatch, { name: s })
          )
        )
      )
    )
  );
}

function Shop({ products, categories, openProduct }) {
  const [cat, setCat] = React.useState('Tout');
  const [sort, setSort] = React.useState('featured');
  let list = cat === 'Tout' ? products : products.filter(p => p.cat === cat);
  if (sort === 'price-asc') list = [...list].sort((a, b) => (a.fromPrice || a.price) - (b.fromPrice || b.price));
  if (sort === 'price-desc') list = [...list].sort((a, b) => (b.fromPrice || b.price) - (a.fromPrice || a.price));

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'shop-head' },
      React.createElement('div', { style: { fontSize: 13, color: 'var(--pink-deep)', marginBottom: 12 } }, 'Boutique'),
      React.createElement('h1', null, 'Toute la ', React.createElement('em', { className: 'serif-italic' }, 'collection')),
      React.createElement('p', null, list.length + ' articles · livraison partout en Tunisie')
    ),
    React.createElement('div', { className: 'shop-bar' },
      React.createElement('div', { className: 'cat-tabs' },
        categories.map(c => React.createElement('button', {
          key: c,
          className: 'cat-tab' + (cat === c ? ' active' : ''),
          onClick: () => setCat(c),
        }, c))
      ),
      React.createElement('div', { className: 'shop-meta' },
        'Trier :',
        React.createElement('select', { value: sort, onChange: e => setSort(e.target.value) },
          React.createElement('option', { value: 'featured' }, 'Sélection'),
          React.createElement('option', { value: 'price-asc' }, 'Prix croissant'),
          React.createElement('option', { value: 'price-desc' }, 'Prix décroissant')
        )
      )
    ),
    React.createElement('div', { className: 'shop-grid' },
      React.createElement('div', { className: 'product-grid' },
        list.map(p => React.createElement(ProductCard, { key: p.id, product: p, onOpen: openProduct }))
      )
    )
  );
}

function ProductDetail({ product, products, addToCart, openProduct, setPage }) {
  const [qty, setQty] = React.useState(1);
  const [tier, setTier] = React.useState(product.tiers ? 10 : null);
  const [added, setAdded] = React.useState(false);
  const PriceLadder = window.PriceLadder;
  const tiers = window.MEYVA_DATA.PHOTO_TIERS;
  const activeTier = tiers.find(t => t.qty === tier);
  const unitPrice = product.tiers ? (activeTier ? activeTier.price : product.fromPrice) : product.price;
  const total = unitPrice * qty;
  const related = products.filter(p => p.id !== product.id && p.cat === product.cat).slice(0, 4);

  const onAdd = () => {
    addToCart(product, qty, product.tiers ? { tier: activeTier } : null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return React.createElement(React.Fragment, null,
    React.createElement('div', { style: { padding: '20px 40px 0', maxWidth: 1280, margin: '0 auto', fontSize: 13, color: 'var(--ink-soft)' } },
      React.createElement('button', { onClick: () => setPage('home'), style: { background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 } }, 'Accueil'),
      ' / ',
      React.createElement('button', { onClick: () => setPage('shop'), style: { background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 } }, 'Boutique'),
      ' / ', product.name
    ),
    React.createElement('section', { className: 'pdp' },
      React.createElement('div', { className: 'pdp-gallery' },
        React.createElement('div', { className: 'pdp-main' },
          product.id === 'pack-polaroid-led'
            ? React.createElement(window.PolaroidCluster, null)
            : React.createElement(ProductSwatch, { name: product.swatch })
        ),
        React.createElement('div', { className: 'pdp-thumbs' },
          [product.swatch, 'photos', 'pack', 'certificat'].map((s, i) =>
            React.createElement('div', { key: i, className: 'pdp-thumb' + (i === 0 ? ' active' : '') },
              React.createElement(ProductSwatch, { name: s })
            )
          )
        )
      ),
      React.createElement('div', { className: 'pdp-info' },
        React.createElement('div', { className: 'pdp-cat' }, product.cat),
        React.createElement('h1', { className: 'pdp-name' }, product.name),
        React.createElement('div', { className: 'pdp-price' },
          (product.tiers ? unitPrice : product.price) + ' DT',
          product.tiers && React.createElement('small', null, '· dès ' + product.fromPrice + ' DT'),
          product.secondary && !product.tiers && React.createElement('small', null, '· ' + product.secondary)
        ),
        React.createElement('p', { className: 'pdp-desc' }, product.long || product.desc),

        product.tiers && React.createElement('div', { className: 'pdp-section' },
          React.createElement('h4', null, 'Choisis ton pack'),
          React.createElement(PriceLadder, { activeQty: tier, onPick: t => setTier(t.qty) }),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.5 } },
            'Le pack inclut : photos imprimées + clips en bois + guirlande LED chaude à piles. ',
            'Envoie-nous tes photos par message Instagram après la commande.')
        ),

        React.createElement('div', { className: 'pdp-section' },
          React.createElement('h4', null, 'Quantité'),
          React.createElement('div', { className: 'qty' },
            React.createElement('button', { onClick: () => setQty(Math.max(1, qty - 1)) }, '−'),
            React.createElement('span', null, qty),
            React.createElement('button', { onClick: () => setQty(qty + 1) }, '+')
          )
        ),

        React.createElement('div', { className: 'pdp-cta' },
          product.soldOut
            ? React.createElement(React.Fragment, null,
                React.createElement('button', { className: 'btn btn-pink', disabled: true }, 'Épuisé — bientôt de retour'),
                React.createElement('a', {
                  className: 'btn btn-outline', style: { marginTop: 10 },
                  href: 'https://instagram.com/meyva__collection', target: '_blank', rel: 'noopener',
                }, React.createElement(Icon.insta), 'Réserver sur Instagram')
              )
            : React.createElement('button', { className: 'btn btn-pink', onClick: onAdd },
                added ? '✓ Ajouté au panier' : 'Ajouter — ' + total + ' DT'
              )
        ),

        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, paddingTop: 18, borderTop: '1px solid var(--line)', fontSize: 13 } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 } }, 'Livraison'),
            React.createElement('div', null, '8 DT · 2–4 j')
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 } }, 'Paiement'),
            React.createElement('div', null, 'À la livraison')
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 } }, 'Confirmation'),
            React.createElement('div', null, 'Par Instagram')
          )
        )
      )
    ),

    related.length > 0 && React.createElement('section', { className: 'section', style: { paddingTop: 40 } },
      React.createElement('div', { className: 'section-head' },
        React.createElement('h2', { className: 'section-title' }, 'Tu aimeras aussi')
      ),
      React.createElement('div', { className: 'product-grid' },
        related.map(p => React.createElement(ProductCard, { key: p.id, product: p, onOpen: openProduct }))
      )
    )
  );
}

function About({ setPage }) {
  return React.createElement('section', { style: { padding: '96px 40px', maxWidth: 760, margin: '0 auto', textAlign: 'center' } },
    React.createElement('div', { className: 'section-eyebrow' }, 'À propos'),
    React.createElement('h1', { className: 'serif', style: { fontSize: 64, lineHeight: 1.05, margin: '12px 0 32px', letterSpacing: '-0.02em' } },
      'Des petites choses,', React.createElement('br'),
      React.createElement('em', { className: 'serif-italic', style: { color: 'var(--pink-deep)' } }, 'beaucoup d\u2019amour.')),
    React.createElement('p', { style: { fontSize: 18, lineHeight: 1.8, color: 'var(--ink-soft)', textAlign: 'left' } },
      'Meyva collection, c\u2019est une petite boutique tunisienne qui fait des objets pour décorer ta chambre, ',
      'offrir à tes amies, ou simplement te faire plaisir. Photos polaroid, stickers, posters, bougies, ',
      'certificats personnalisés — tout est à petit prix et livré partout en Tunisie.'),
    React.createElement('p', { style: { fontSize: 18, lineHeight: 1.8, color: 'var(--ink-soft)', textAlign: 'left', marginTop: 18 } },
      'Tout passe par Instagram : tu choisis ton produit, tu nous envoies un message avec tes photos ou ton texte, ',
      'et on s\u2019occupe du reste. Paiement à la livraison.'),
    React.createElement('a', {
      className: 'btn btn-pink',
      href: 'https://instagram.com/meyva__collection',
      target: '_blank', rel: 'noopener',
      style: { marginTop: 40, display: 'inline-flex' },
    }, '@meyva__collection sur Instagram')
  );
}

Object.assign(window, { Home, Shop, ProductDetail, About });
