import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { contentTypes, publicFiles } from './files.mjs';

export function createStaticServer(directory) {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed.');
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Invalid request.');
      return;
    }
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!publicFiles.includes(name)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Page not found.');
      return;
    }
    try {
      const data = await readFile(resolve(directory, name));
      response.writeHead(200, { 'Content-Type': contentTypes[extname(name)] ?? 'application/octet-stream', 'Content-Length': data.byteLength });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('This file is unavailable. Run npm run build if serving dist.');
    }
  });
}
