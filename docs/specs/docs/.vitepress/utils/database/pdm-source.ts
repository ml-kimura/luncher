import fs from 'fs';
import path from 'path';

const SHARED_DB_ROOT = ['shared'];
const ATLAS_DB_ROOT = ['..', '..', '..', 'packages', 'db', 'atlas'];

export type PdmSourceKind = 'shared' | 'atlas';

export interface PdmSource {
  kind: PdmSourceKind;
  rootDir: string;
}

/**
 * Resolve PDM source for a version.
 * - Prefer docs/shared/<version>/database when present
 * - Fallback to packages/db/atlas otherwise
 */
export function resolvePdmSource(docsDir: string, version: string): PdmSource {
  const sharedDbDir = path.join(docsDir, ...SHARED_DB_ROOT, version, 'database');
  if (fs.existsSync(sharedDbDir)) {
    return {
      kind: 'shared',
      rootDir: sharedDbDir,
    };
  }

  const atlasDir = path.resolve(docsDir, ...ATLAS_DB_ROOT);
  return {
    kind: 'atlas',
    rootDir: atlasDir,
  };
}

function listHclFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHclFilesRecursively(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.hcl')) {
      files.push(entryPath);
    }
  }
  return files;
}

/**
 * Get HCL files for a given objectType from resolved source.
 * Shared source supports all object types in per-type directories.
 * Atlas fallback currently supports table objects from atlas/tables.
 */
export function getObjectTypeHclFiles(docsDir: string, version: string, objectType: string): string[] {
  const source = resolvePdmSource(docsDir, version);
  const typeDir = path.join(source.rootDir, `${objectType}s`);
  return listHclFilesRecursively(typeDir);
}
