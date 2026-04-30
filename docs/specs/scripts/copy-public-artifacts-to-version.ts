import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const specsRoot = resolve(dirname(__filename), '..');

const versionArg = process.argv.find((arg) => arg.startsWith('--version='));
const version = versionArg?.split('=')[1] || '1.0.0';

const publicRoot = resolve(specsRoot, 'docs', 'public');

const artifacts = [
  { name: 'glossary.yml', isDirectory: false },
  { name: 'erd', isDirectory: true },
] as const;

for (const artifact of artifacts) {
  const sourcePath = resolve(publicRoot, artifact.name);
  const targetPath = resolve(publicRoot, version, artifact.name);

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing artifact source: ${sourcePath}`);
  }

  if (existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
  }

  mkdirSync(dirname(targetPath), { recursive: true });

  const result = spawnSync('cp', ['-rf', sourcePath, targetPath], {
    cwd: specsRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`cp -rf failed (exit ${result.status ?? 'unknown'}): ${sourcePath} -> ${targetPath}`);
  }

  process.stdout.write(`Copied ${artifact.name} to ${targetPath}\n`);
}
