/* global React */
const { PHOTO_TIERS } = window.MEYVA_DATA;

function PriceLadder({ activeQty, onPick }) {
  return React.createElement('div', { className: 'ladder' },
    PHOTO_TIERS.map(t =>
      React.createElement('div', {
        key: t.qty,
        className: 'ladder-row' + (activeQty === t.qty ? ' active' : ''),
        onClick: () => onPick && onPick(t),
      },
        React.createElement('div', null,
          React.createElement('span', { className: 'ladder-qty' }, t.qty),
          React.createElement('span', { className: 'ladder-label' }, 'photos')
        ),
        React.createElement('span', { className: 'ladder-arrow' }, '\u2192'),
        React.createElement('span', { className: 'ladder-price' },
          t.price,
          React.createElement('small', null, 'DT')
        ),
        React.createElement('span', null)
      )
    )
  );
}

window.PriceLadder = PriceLadder;
