import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(__dirname, '..');
const tmpErd = '/tmp/erd';
const publicErd = path.join(pkgRoot, '../../docs/specs/docs/public/erd');

process.stdout.write(`\nGenerating ERD to ${tmpErd}...\n`);
execFileSync(
  'pnpm',
  [
    'exec',
    'liam',
    'erd',
    'build',
    '--input',
    'src/schema.ts',
    '--format',
    'drizzle',
    '--output-dir',
    tmpErd,
  ],
  {
    cwd: pkgRoot,
    stdio: 'inherit',
  },
);

fs.mkdirSync(path.dirname(publicErd), { recursive: true });

process.stdout.write(`\nRemoving ${publicErd}...\n`);
const rm = spawnSync('rm', ['-rf', publicErd], { stdio: 'inherit' });
if (rm.status !== 0) {
  throw new Error(`rm -rf failed (exit ${rm.status ?? 'unknown'})`);
}

process.stdout.write(`\nMoving ${tmpErd} to ${publicErd}...\n`);
const mv = spawnSync('mv', [tmpErd, publicErd], { stdio: 'inherit' });
if (mv.status !== 0) {
  throw new Error(`mv failed (exit ${mv.status ?? 'unknown'})`);
}

process.stdout.write('\nDone.\n');
