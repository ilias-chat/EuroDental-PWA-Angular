const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const publicDirectory = path.join(__dirname, 'www');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const requestedFile = path.resolve(publicDirectory, relativePath);
  const insidePublicDirectory = requestedFile === publicDirectory || requestedFile.startsWith(`${publicDirectory}${path.sep}`);

  if (!insidePublicDirectory) {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  fs.stat(requestedFile, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(response, requestedFile);
      return;
    }

    // Angular routes are client-side routes, so serve the shell as a fallback.
    sendFile(response, path.join(publicDirectory, 'index.html'));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`EuroDental PWA listening on port ${port}`);
});
