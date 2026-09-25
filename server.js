'use strict';
/**
 * Zero-dependency static file server for /public with clean-URL routing.
 *
 * A request for "/about" is served from "public/about/index.html" (the
 * build script writes every page as a real directory + index.html, so this
 * needs no rewriting — it just resolves the file the same way a directory
 * index normally would). Requests for an actual file ("/assets/css/site.css")
 * are served as-is. Anything that matches nothing gets public/404.html with
 * a 404 status, so a hard refresh on any route always returns a real page
 * instead of a host's generic error screen.
 *
 * Usage: node server.js [port]   (defaults to PORT env var, then 3000)
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, 'public');
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

/** Resolves a URL path to a file under ROOT, following the same rules a static host would. */
function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  let candidate = path.join(ROOT, safe);
  if (!candidate.startsWith(ROOT)) return null; // path traversal guard

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    candidate = path.join(candidate, 'index.html');
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;

  // "/about" with no trailing slash and no extension -> "/about/index.html"
  if (!path.extname(candidate)) {
    const asDir = path.join(ROOT, safe, 'index.html');
    if (fs.existsSync(asDir)) return asDir;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url);
  if (file) {
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
    return;
  }
  const notFound = path.join(ROOT, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFound).pipe(res);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`[server] RealMovingCanada is running at http://localhost:${PORT}`);
});
