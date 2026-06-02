/* global React */
// Polaroid cluster hero visual — 6 polaroids loosely arranged in a heart shape,
// connected by a curved warm-yellow LED string with little dots.

function PolaroidCluster() {
  // Heart-ish positions (left%, top%, rotation deg, tone)
  const polaroids = [
    { l: 12, t: 18, r: -10, tone: 1 },
    { l: 38, t: 8,  r: 4,   tone: 3 },
    { l: 64, t: 18, r: 9,   tone: 2 },
    { l: 22, t: 44, r: 6,   tone: 4 },
    { l: 56, t: 44, r: -6,  tone: 5 },
    { l: 38, t: 64, r: 2,   tone: 7 },
  ];

  // LED dot positions along a curve threading the cluster
  const ledDots = [];
  const path = [
    [4, 10], [14, 14], [26, 18], [38, 12], [50, 14], [62, 18], [74, 14], [84, 22],
    [80, 38], [70, 46], [58, 48], [46, 50], [34, 48], [22, 50], [14, 54], [20, 66],
    [32, 70], [44, 76], [56, 72], [68, 70], [78, 64], [82, 78], [70, 84], [54, 88], [40, 86], [26, 84], [14, 80],
  ];
  path.forEach((p, i) => ledDots.push({ x: p[0], y: p[1], i }));

  // Build SVG path string for the wire
  const wirePath = path.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ');

  return React.createElement('div', { className: 'polaroid-cluster' },
    // LED wire layer
    React.createElement('svg', {
      className: 'led-line',
      viewBox: '0 0 100 100',
      preserveAspectRatio: 'none',
      style: { width: '100%', height: '100%', position: 'absolute', inset: 0 },
    },
      React.createElement('path', {
        d: wirePath,
        stroke: '#2a2422',
        strokeWidth: '0.3',
        fill: 'none',
        opacity: '0.5',
      }),
      ledDots.map(d =>
        React.createElement('g', { key: d.i },
          React.createElement('circle', { cx: d.x, cy: d.y, r: '1.6', fill: '#f5cf6e', opacity: '0.35' }),
          React.createElement('circle', { cx: d.x, cy: d.y, r: '0.8', fill: '#fff5d4' })
        )
      )
    ),
    // Polaroids layer
    polaroids.map((p, i) =>
      React.createElement('div', {
        key: i,
        className: 'polaroid',
        style: {
          left: p.l + '%',
          top: p.t + '%',
          transform: 'rotate(' + p.r + 'deg)',
          zIndex: 2 + i,
        },
      },
        React.createElement('div', { className: 'polaroid-clip' }),
        React.createElement('div', { className: 'polaroid-photo tone-' + p.tone })
      )
    )
  );
}

window.PolaroidCluster = PolaroidCluster;
