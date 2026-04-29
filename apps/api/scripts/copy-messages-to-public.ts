import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const appRoot = resolve(dirname(__filename), '..');

const versionArg = process.argv.find((arg) => arg.startsWith('--version='));
const version = versionArg?.split('=')[1] || '1.0.0';

const targetDir = resolve(appRoot, '..', '..', 'docs', 'specs', 'docs', 'public', version, 'api');
const copyTargetFiles = ['messages.yml', 'openapi-app.yml'] as const;

for (const fileName of copyTargetFiles) {
  const sourcePath = resolve(appRoot, fileName);
  const targetPath = resolve(targetDir, fileName);
  mkdirSync(dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath);
  process.stdout.write(`Copied ${sourcePath} to ${targetPath}\n`);
}
