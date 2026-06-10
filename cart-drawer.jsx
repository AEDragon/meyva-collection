/* global React, ProductSwatch, Icon */

function CartDrawer({ open, onClose, cart, updateQty, removeItem }) {
  const items = cart;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const shipping = subtotal > 0 ? 8 : 0;
  const total = subtotal + shipping;

  const checkout = () => window.open('https://instagram.com/meyva__collection', '_blank');

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'drawer-backdrop' + (open ? ' open' : ''), onClick: onClose }),
    React.createElement('aside', { className: 'drawer' + (open ? ' open' : '') },
      React.createElement('div', { className: 'drawer-head' },
        React.createElement('h3', null, 'Ton panier (', items.reduce((s, i) => s + i.qty, 0), ')'),
        React.createElement('button', { className: 'nav-icon-btn', onClick: onClose, 'aria-label': 'Fermer' },
          React.createElement(Icon.close))
      ),
      React.createElement('div', { className: 'drawer-body' },
        items.length === 0
          ? React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px', color: 'var(--ink-soft)' } },
              React.createElement('div', { className: 'serif', style: { fontSize: 24, color: 'var(--ink)', marginBottom: 8 } }, 'Ton panier est vide'),
              React.createElement('p', { style: { fontSize: 14 } }, 'Ajoute des petites choses jolies.')
            )
          : items.map((item, idx) => React.createElement('div', { key: idx, className: 'cart-line' },
              React.createElement('div', { className: 'cart-line-thumb' },
                item.image
                  ? React.createElement('img', { src: item.image, alt: item.name, className: 'product-photo', loading: 'lazy' })
                  : React.createElement(ProductSwatch, { name: item.swatch })
              ),
              React.createElement('div', null,
                React.createElement('div', { className: 'cart-line-name' }, item.name),
                React.createElement('div', { className: 'cart-line-cat' },
                  item.option && item.option.tier ? item.option.tier.qty + ' photos' : item.cat
                ),
                React.createElement('div', { className: 'qty', style: { marginTop: 8 } },
                  React.createElement('button', { onClick: () => updateQty(idx, Math.max(1, item.qty - 1)) }, '−'),
                  React.createElement('span', null, item.qty),
                  React.createElement('button', { onClick: () => updateQty(idx, item.qty + 1) }, '+')
                )
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 16 } },
                  (item.unitPrice * item.qty) + ' DT'),
                React.createElement('button', {
                  onClick: () => removeItem(idx),
                  style: { background: 'none', border: 'none', fontSize: 12, color: 'var(--ink-soft)', textDecoration: 'underline', padding: 0, marginTop: 8, cursor: 'pointer' },
                }, 'Retirer')
              )
            ))
      ),
      items.length > 0 && React.createElement('div', { className: 'drawer-foot' },
        React.createElement('div', { className: 'cart-row' },
          React.createElement('span', null, 'Sous-total'),
          React.createElement('span', null, subtotal + ' DT')
        ),
        React.createElement('div', { className: 'cart-row' },
          React.createElement('span', null, 'Livraison'),
          React.createElement('span', null, shipping + ' DT')
        ),
        React.createElement('div', { className: 'cart-total' },
          React.createElement('span', null, 'Total'),
          React.createElement('span', null, total + ' DT')
        ),
        React.createElement('div', { className: 'checkout-note' },
          'Le paiement et la confirmation se font directement par message Instagram.'),
        React.createElement('button', { className: 'btn btn-pink', style: { width: '100%' }, onClick: checkout },
          React.createElement(Icon.insta),
          'Confirmer la commande sur Instagram'
        )
      )
    )
  );
}

window.CartDrawer = CartDrawer;
