import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, projectRoot } from './files.mjs';
import { validateSource } from './validate.mjs';

async function rejectLinks(path) {
  try {
    if ((await lstat(path)).isSymbolicLink()) throw new Error(`Build target must not be a symbolic link: ${path}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function listFiles(directory, prefix = '') {
  const found = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const name = `${prefix}${item.name}`;
    if (item.isSymbolicLink()) throw new Error(`Unexpected link in build output: ${name}`);
    if (item.isDirectory()) found.push(...await listFiles(resolve(directory, item.name), `${name}/`));
    else found.push(name);
  }
  return found;
}

export async function build() {
  const report = await validateSource();
  const destination = resolve(projectRoot, 'dist');
  // Resolve and check the exact target before writing. No recursive removal is used.
  if (dirname(destination) !== projectRoot) throw new Error('Build destination is outside the project.');
  await rejectLinks(destination);
  await mkdir(destination, { recursive: true });
  const unexpected = (await listFiles(destination)).filter((name) => !publicFiles.includes(name));
  if (unexpected.length) throw new Error(`Unrecognised files in dist; review them before building: ${unexpected.join(', ')}`);
  for (const name of publicFiles) {
    const target = resolve(destination, name);
    const inside = relative(destination, target);
    if (inside.startsWith('..') || isAbsolute(inside)) throw new Error('Unsafe output path.');
    await rejectLinks(dirname(target));
    await rejectLinks(target);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(projectRoot, name), target);
  }
  return { ...report, destination };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await build();
  process.stdout.write(`Built ${report.files} public files into ${report.destination}\n`);
}
