import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const appRoot = resolve(dirname(__filename), '..');

const versionArg = process.argv.find((arg) => arg.startsWith('--version='));
const version = versionArg?.split('=')[1];

if (!version) {
  throw new Error('Missing required argument: --version=<semver>');
}

const sourcePath = resolve(appRoot, 'messages.yml');
const targetPath = resolve(appRoot, '..', '..', 'docs', 'specs', 'docs', 'public', version, 'batch', 'messages.yml');

mkdirSync(dirname(targetPath), { recursive: true });
cpSync(sourcePath, targetPath);

process.stdout.write(`Copied messages.yml to ${targetPath}\n`);
