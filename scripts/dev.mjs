import { resolve } from 'node:path';
import { projectRoot } from './files.mjs';
import { createStaticServer } from './server.mjs';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = Number(portIndex >= 0 ? args[portIndex + 1] : (process.env.PORT ?? 3000));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Use a port between 1 and 65535.');
const directory = args.includes('--dist') ? resolve(projectRoot, 'dist') : projectRoot;
const server = createStaticServer(directory);
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Try npm run dev -- --port 3001` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio ready: http://127.0.0.1:${port}`);
  console.log(`Serving ${args.includes('--dist') ? 'the production build' : 'source files'}. Refresh the browser after edits.`);
  console.log('Press Ctrl+C to stop.');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
