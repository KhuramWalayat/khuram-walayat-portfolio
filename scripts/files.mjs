import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Only this explicit allowlist can enter the public build or be served in development.
export const publicFiles = Object.freeze([
  'index.html',
  'styles.css',
  'app.js',
  'assets/favicon.svg',
  'assets/flow-field.svg',
]);

export const contentTypes = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
});
