import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { build } from './build.mjs';
import { createStaticServer } from './server.mjs';
import { publicFiles, projectRoot, contentTypes } from './files.mjs';
import { extname } from 'node:path';

const report = await build();
for (const name of publicFiles) {
  assert.deepEqual(await readFile(resolve(projectRoot, name)), await readFile(resolve(report.destination, name)), `Build differs from source: ${name}`);
}

const server = createStaticServer(report.destination);
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const name of publicFiles) {
    const response = await fetch(`${base}/${name}`, { signal: AbortSignal.timeout(3000) });
    assert.equal(response.status, 200, `${name} should be served.`);
    assert.equal(response.headers.get('content-type'), contentTypes[extname(name)]);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(resolve(report.destination, name)));
  }
  const homepage = await fetch(`${base}/`, { signal: AbortSignal.timeout(3000) });
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /id="hero-heading"/);
  const head = await fetch(`${base}/`, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  for (const path of ['/README.md', '/package.json', '/scripts/dev.mjs', '/.env', '/..%2FAGENTS.md', '/missing-page']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(3000) });
    assert.equal(response.status, 404, `Non-public path should not be served: ${path}`);
  }
  const post = await fetch(`${base}/`, { method: 'POST', signal: AbortSignal.timeout(3000) });
  assert.equal(post.status, 405);
  console.log(`PASS: ${report.files} public files, ${report.anchors} unique IDs, ${report.externalLinks} external links.`);
  console.log('PASS: local links, safe build contents, metadata, private-data check and JavaScript syntax.');
  console.log('PASS: HTTP assets, homepage, HEAD, private-file exclusion and invalid method handling.');
  console.log('Visual and keyboard review in a browser is still recommended before publication.');
} finally {
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
}
