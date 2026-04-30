import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(__dirname, '..');
const publicErd = path.join(pkgRoot, '../../docs/specs/docs/public/erd');
const tmpErd = '/tmp/erd';

fs.mkdirSync(path.dirname(publicErd), { recursive: true });

process.stdout.write(`\nRemoving ${publicErd}...\n`);
const rm = spawnSync('rm', ['-rf', publicErd], { stdio: 'inherit' });
if (rm.status !== 0) {
  throw new Error(`rm -rf failed (exit ${rm.status ?? 'unknown'})`);
}

// Match default touch/mkdir style permissions (files: 644, dirs: 755).
const originalUmask = process.umask(0o022);

try {
  process.stdout.write(`\nRemoving ${tmpErd}...\n`);
  const rmTmp = spawnSync('rm', ['-rf', tmpErd], { stdio: 'inherit' });
  if (rmTmp.status !== 0) {
    throw new Error(`rm -rf tmp failed (exit ${rmTmp.status ?? 'unknown'})`);
  }

  fs.mkdirSync(tmpErd, { recursive: true });

  process.stdout.write(`\nGenerating ERD to ${tmpErd}...\n`);
  execFileSync(
    'pnpm',
    ['exec', 'liam', 'erd', 'build', '--input', 'src/schema.ts', '--format', 'drizzle', '--output-dir', tmpErd],
    {
      cwd: pkgRoot,
      stdio: 'inherit',
    }
  );

  const generatedRoot = fs.existsSync(path.join(tmpErd, 'erd')) ? path.join(tmpErd, 'erd') : tmpErd;
  process.stdout.write(`\nMoving ${generatedRoot} to ${publicErd}...\n`);
  const mv = spawnSync('mv', [generatedRoot, publicErd], { stdio: 'inherit' });
  if (mv.status !== 0) {
    throw new Error(`mv failed (exit ${mv.status ?? 'unknown'})`);
  }
} finally {
  process.umask(originalUmask);
}

process.stdout.write('\nDone.\n');
