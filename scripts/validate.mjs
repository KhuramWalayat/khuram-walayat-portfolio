import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { publicFiles, projectRoot } from './files.mjs';

export async function validateSource() {
  const issues = [];
  const html = await readFile(resolve(projectRoot, 'index.html'), 'utf8');
  const css = await readFile(resolve(projectRoot, 'styles.css'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (ids.length !== new Set(ids).size) issues.push('HTML contains duplicate IDs.');

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (value.startsWith('#')) {
      if (!ids.includes(value.slice(1))) issues.push(`Missing anchor target: ${value}`);
    } else if (value.startsWith('https://')) {
      try { new URL(value); } catch { issues.push(`Invalid external URL: ${value}`); }
    } else if (!publicFiles.includes(value)) {
      issues.push(`Unrecognised local resource: ${value}`);
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer/.test(match[0])) {
      issues.push('An external new-tab link is missing safe rel attributes.');
    }
  }

  for (const required of ['<html lang="en">', 'name="viewport"', 'name="description"', 'class="skip-link"', '<main id="main">']) {
    if (!html.includes(required)) issues.push(`Missing document accessibility/metadata: ${required}`);
  }
  if ((html.match(/<h1\b/g) ?? []).length !== 1) issues.push('The document needs exactly one h1.');
  if ((html.match(/class="research-case"/g) ?? []).length !== 3) issues.push('Expected three research case studies.');
  if (!css.includes('prefers-reduced-motion')) issues.push('Reduced-motion support is missing.');
  if (!css.includes(':focus-visible')) issues.push('Keyboard focus styling is missing.');
  if (html.includes('\u2014')) issues.push('Replace em dashes with short sentences.');
  if (/<form\b|href="#"|javascript:|TODO|lorem ipsum/i.test(html)) issues.push('Remove placeholder or nonfunctional UI.');
  // Keep checks generic. Never embed private example values in public source.
  if (/\b[A-Z]{1,2}\d[A-Z\d]?\s+\d[A-Z]{2}\b|\b[A-Z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail)\.[A-Z]{2,}\b|(?:\+44|0044)\s*\d[\d\s()-]{8,}|date of birth|salary|passport|national insurance/i.test(html)) {
    issues.push('Private personal information must not be included in the public page.');
  }

  for (const name of publicFiles) {
    const info = await stat(resolve(projectRoot, name));
    if (!info.isFile() || info.size === 0) issues.push(`Missing or empty public file: ${name}`);
  }
  for (const name of ['assets/favicon.svg', 'assets/flow-field.svg']) {
    const svg = await readFile(resolve(projectRoot, name), 'utf8');
    if (!svg.includes('viewBox=') || !svg.includes('xmlns="http://www.w3.org/2000/svg"')) issues.push(`Invalid SVG wrapper: ${name}`);
    if (/<script\b|<foreignObject\b|(?:href|src)="https?:/i.test(svg)) issues.push(`Unexpected active or external SVG content: ${name}`);
  }
  const pkg = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
  if (Object.keys(pkg.dependencies ?? {}).length || Object.keys(pkg.devDependencies ?? {}).length) issues.push('This project should remain dependency-free.');
  const vercel = JSON.parse(await readFile(resolve(projectRoot, 'vercel.json'), 'utf8'));
  if (vercel.outputDirectory !== 'dist' || vercel.buildCommand !== 'npm run build') issues.push('Vercel build configuration is inconsistent.');
  execFileSync(process.execPath, ['--check', resolve(projectRoot, 'app.js')], { stdio: 'pipe' });
  if (issues.length) throw new Error(issues.join('\n'));
  return { files: publicFiles.length, anchors: ids.length, externalLinks: [...html.matchAll(/href="https:\/\//g)].length };
}
