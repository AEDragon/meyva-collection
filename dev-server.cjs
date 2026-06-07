// Serveur local de prévisualisation — meyva collection
// Lancer :  node dev-server.js     puis ouvrir  http://localhost:5173
//
// Sert les fichiers du site (index.html, styles.css, assets…).
// Les routes /api/* ne tournent pas en local : la page retombe automatiquement
// sur le catalogue de base, donc tu peux voir tous tes changements de design.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 5173;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath.indexOf('/api/') === 0) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end('{"error":"API non disponible en local (prévisualisation design uniquement)"}');
    return;
  }
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('\n  meyva collection — aperçu local prêt :');
  console.log('  →  http://localhost:' + PORT + '\n');
});
