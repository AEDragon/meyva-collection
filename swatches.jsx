/* global React */
// Visual swatches for product thumbnails — minimal SVG/CSS placeholders.

const SWATCHES = {
  pack: () => React.createElement('div', { style: { width: '100%', height: '100%', position: 'relative', background: 'var(--pink-pale)', overflow: 'hidden' } },
    // mini polaroid cluster
    [
      { l: 18, t: 18, r: -8, tone: '#c9bfae' },
      { l: 50, t: 22, r: 6, tone: '#d9d2c8' },
      { l: 32, t: 50, r: -4, tone: '#e0cab4' },
    ].map((p, i) => React.createElement('div', {
      key: i,
      style: {
        position: 'absolute', left: p.l + '%', top: p.t + '%', width: '34%', aspectRatio: '0.85',
        background: 'white', padding: '8%', paddingBottom: '20%',
        border: '1px solid var(--line)',
        transform: 'rotate(' + p.r + 'deg)',
      },
    }, React.createElement('div', { style: { width: '100%', aspectRatio: 1, background: p.tone } }))),
    // led dots
    React.createElement('svg', { viewBox: '0 0 100 100', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' }, preserveAspectRatio: 'none' },
      [[10, 30], [25, 12], [50, 10], [75, 14], [90, 30], [85, 60], [70, 80], [40, 85], [15, 75]].map((p, i) =>
        React.createElement('circle', { key: i, cx: p[0], cy: p[1], r: 1.6, fill: '#f5cf6e' })
      )
    )
  ),
  photos: () => React.createElement('div', { style: { width: '100%', height: '100%', background: 'var(--pink-pale)', position: 'relative' } },
    [{ l: 22, t: 18, r: -6 }, { l: 38, t: 30, r: 4 }, { l: 28, t: 48, r: -3 }].map((p, i) =>
      React.createElement('div', { key: i, style: {
        position: 'absolute', left: p.l + '%', top: p.t + '%', width: '40%', aspectRatio: 0.82,
        background: 'white', padding: '8%', paddingBottom: '22%',
        border: '1px solid var(--line)',
        transform: 'rotate(' + p.r + 'deg)',
      } }, React.createElement('div', { style: { width: '100%', aspectRatio: 1, background: ['#c9bfae','#d9d2c8','#e0cab4'][i] } }))
    )
  ),
  'stickers-pink': () => React.createElement('div', { style: { width: '100%', height: '100%', background: '#fce8f0', display: 'grid', placeItems: 'center' } },
    React.createElement('svg', { viewBox: '0 0 100 100', style: { width: '70%' } },
      React.createElement('circle', { cx: 30, cy: 30, r: 14, fill: '#f4a8c8', stroke: '#fff', strokeWidth: 1.5 }),
      React.createElement('path', { d: 'M55 25 L75 25 L70 45 L50 45 Z', fill: '#f5cf6e', stroke: '#fff', strokeWidth: 1.5, transform: 'rotate(-8 62 35)' }),
      React.createElement('circle', { cx: 70, cy: 65, r: 10, fill: '#d96a9a', stroke: '#fff', strokeWidth: 1.5 }),
      React.createElement('path', { d: 'M25 60 q5 -10 12 0 q5 -10 12 0 q-5 12 -12 12 q-7 0 -12 -12 z', fill: '#d96a9a', stroke: '#fff', strokeWidth: 1.5 }),
      React.createElement('text', { x: 42, y: 90, fontFamily: 'Fraunces', fontSize: 9, fill: '#2a2422', fontStyle: 'italic' }, 'mood'),
    )
  ),
  'stickers-anime': () => React.createElement('div', { style: { width: '100%', height: '100%', background: '#fce8f0', display: 'grid', placeItems: 'center' } },
    React.createElement('svg', { viewBox: '0 0 100 100', style: { width: '70%' } },
      React.createElement('circle', { cx: 35, cy: 35, r: 16, fill: '#f4a8c8', stroke: '#2a2422', strokeWidth: 1 }),
      React.createElement('circle', { cx: 30, cy: 32, r: 1.5, fill: '#2a2422' }),
      React.createElement('circle', { cx: 40, cy: 32, r: 1.5, fill: '#2a2422' }),
      React.createElement('path', { d: 'M30 40 q5 4 10 0', stroke: '#2a2422', strokeWidth: 1, fill: 'none' }),
      React.createElement('path', { d: 'M65 25 L72 18 L72 30 Z', fill: '#d96a9a', stroke: '#2a2422', strokeWidth: 1 }),
      React.createElement('path', { d: 'M58 60 l8 -4 l4 8 l-8 4 z', fill: '#f5cf6e', stroke: '#2a2422', strokeWidth: 1 }),
      React.createElement('path', { d: 'M30 70 l4 -6 l4 6 l-4 6 z', fill: '#d96a9a', stroke: '#2a2422', strokeWidth: 1 }),
    )
  ),
  'stickers-y2k': () => React.createElement('div', { style: { width: '100%', height: '100%', background: '#fce8f0', display: 'grid', placeItems: 'center' } },
    React.createElement('svg', { viewBox: '0 0 100 100', style: { width: '70%' } },
      // butterfly
      React.createElement('path', { d: 'M50 40 q-12 -14 -22 -8 q-6 8 4 16 q-10 6 -2 14 q14 4 20 -10 z M50 40 q12 -14 22 -8 q6 8 -4 16 q10 6 2 14 q-14 4 -20 -10 z', fill: '#d4a8e8', stroke: '#2a2422', strokeWidth: 1 }),
      // star
      React.createElement('path', { d: 'M22 18 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 z', fill: '#f5cf6e', stroke: '#2a2422', strokeWidth: 1 }),
      React.createElement('path', { d: 'M82 78 l2 5 l5 1 l-4 3 l1 5 l-4 -2 l-4 2 l1 -5 l-4 -3 l5 -1 z', fill: '#f4a8c8', stroke: '#2a2422', strokeWidth: 1 }),
    )
  ),
  'poster-vintage': () => React.createElement('div', { style: { width: '100%', height: '100%', background: 'var(--cream-deep)', display: 'grid', placeItems: 'center', padding: '12%' } },
    React.createElement('div', { style: { width: '70%', aspectRatio: '0.71', background: 'white', border: '1px solid var(--line)', padding: '8%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
      ['#c9bfae', '#d9d2c8', '#e8d4b8', '#c8b8a8'].map((c, i) =>
        React.createElement('div', { key: i, style: { background: c } })
      )
    )
  ),
  'poster-aura': () => React.createElement('div', { style: { width: '100%', height: '100%', background: 'var(--cream-deep)', display: 'grid', placeItems: 'center', padding: '12%' } },
    React.createElement('div', {
      style: {
        width: '70%', aspectRatio: '0.71', background: 'white', border: '1px solid var(--line)', padding: '8%',
      }
    },
      React.createElement('div', {
        style: {
          width: '100%', height: '100%',
          background: 'radial-gradient(circle at 30% 40%, #f4a8c8, transparent 50%), radial-gradient(circle at 70% 70%, #d4a8e8, transparent 55%), radial-gradient(circle at 50% 20%, #f5cf6e, transparent 45%), #fce8f0',
        }
      })
    )
  ),
  bougie: () => React.createElement('div', { style: { width: '100%', height: '100%', background: 'var(--pink-pale)', display: 'grid', placeItems: 'center' } },
    React.createElement('svg', { viewBox: '0 0 100 100', style: { width: '50%' } },
      React.createElement('rect', { x: 32, y: 30, width: 36, height: 55, rx: 2, fill: '#fff5e8', stroke: '#2a2422', strokeWidth: 0.8 }),
      React.createElement('rect', { x: 36, y: 36, width: 28, height: 44, fill: '#f4a8c8', opacity: 0.5 }),
      React.createElement('line', { x1: 50, y1: 18, x2: 50, y2: 30, stroke: '#2a2422', strokeWidth: 1 }),
      React.createElement('path', { d: 'M48 14 q2 -4 2 0 q-2 4 0 4 q2 0 0 -4', fill: '#f5cf6e' }),
      React.createElement('text', { x: 50, y: 60, fontFamily: 'Fraunces', fontSize: 6, textAnchor: 'middle', fontStyle: 'italic', fill: '#2a2422' }, 'rose'),
    )
  ),
  certificat: () => React.createElement('div', { style: { width: '100%', height: '100%', background: 'var(--cream-deep)', display: 'grid', placeItems: 'center', padding: '14%' } },
    React.createElement('div', { style: { width: '100%', aspectRatio: 1.4, background: '#fffbf5', border: '1px solid var(--ink)', padding: '8%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 } },
      React.createElement('div', { style: { fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 14, color: 'var(--pink-deep)' }, className: 'serif-italic' }, 'certificat'),
      React.createElement('div', { style: { width: '60%', height: 1, background: 'var(--line)' } }),
      React.createElement('div', { style: { fontSize: 8, color: 'var(--ink-soft)' } }, 'pour ___'),
    )
  ),
};

function ProductSwatch({ name }) {
  const Sw = SWATCHES[name] || SWATCHES.pack;
  return React.createElement(Sw);
}

window.ProductSwatch = ProductSwatch;
