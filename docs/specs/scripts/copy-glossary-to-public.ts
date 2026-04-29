import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const specsRoot = resolve(dirname(__filename), '..');

const versionArg = process.argv.find((arg) => arg.startsWith('--version='));
const version = versionArg?.split('=')[1];

if (!version) {
  throw new Error('Missing required argument: --version=<semver>');
}

const sourcePath = resolve(specsRoot, 'docs', 'public', 'glossary.yml');
const targetPath = resolve(specsRoot, 'docs', 'public', version, 'glossary.yml');

mkdirSync(dirname(targetPath), { recursive: true });
cpSync(sourcePath, targetPath);

process.stdout.write(`Copied glossary.yml to ${targetPath}\n`);
