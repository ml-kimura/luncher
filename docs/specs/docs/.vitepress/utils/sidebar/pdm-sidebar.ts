import fs from 'fs';
import path from 'path';
import { localeConfigs } from '../../locales';
import { parseHclFile } from '../database/hcl-parser';
import { getObjectTypeHclFiles } from '../database/pdm-source';
import { SidebarItem } from '../openapi';

type SidebarCacheEntry = {
  signature: string;
  items: SidebarItem[];
};

type GlobalWithPdmSidebarCache = typeof globalThis & {
  __pdmSidebarCache__?: Map<string, SidebarCacheEntry>;
};

const globalWithPdmSidebarCache = globalThis as GlobalWithPdmSidebarCache;
const pdmSidebarCache =
  globalWithPdmSidebarCache.__pdmSidebarCache__ ??
  (globalWithPdmSidebarCache.__pdmSidebarCache__ = new Map<string, SidebarCacheEntry>());

function cloneSidebarItems(items: SidebarItem[]): SidebarItem[] {
  return structuredClone(items);
}

/**
 * Generate sidebar items for database PDM documentation
 * Scans HCL files to create links for dynamic routes
 */
export function generatePdmSidebarItems(docsDir: string, version: string, locale: string): SidebarItem[] {
  const baseLink = `/${locale}/${version}/database/pdm`;

  /** Object types that only have an index page (no per-object detail route). */
  const indexOnlyObjectTypes = new Set(['schema']);

  const objectTypes = [
    'schema',
    'table',
    'view',
    'materialized_view',
    'function',
    'procedure',
    'sequence',
    'trigger',
    'domain',
    'enum',
    'extension',
  ];

  const cacheKey = `${docsDir}:${version}:${locale}`;
  const objectTypeHclFiles = new Map<string, string[]>();
  const signatureParts = [`erd:${fs.existsSync(path.join(docsDir, 'public', version, 'erd', 'index.html'))}`];

  for (const objectType of objectTypes) {
    const hclFiles = getObjectTypeHclFiles(docsDir, version, objectType);
    objectTypeHclFiles.set(objectType, hclFiles);
    if (hclFiles.length === 0) {
      continue;
    }
    const fileStamp = hclFiles
      .map((hclPath) => `${hclPath}:${fs.statSync(hclPath).mtimeMs}`)
      .join('|');
    signatureParts.push(`${objectType}:${hclFiles.length}:${fileStamp}`);
  }

  const sourceSignature = signatureParts.join('||');
  const cached = pdmSidebarCache.get(cacheKey);
  if (cached && cached.signature === sourceSignature) {
    return cloneSidebarItems(cached.items);
  }

  const items: SidebarItem[] = [];

  /**
   * Liam ERD（docs/public/{version}/erd または docs/public/erd を配信）。
   * ディレクトリ URL（…/erd/）はクライアントルーターが横取りして 404 になりやすいので index.html を明示する。
   */
  const versionedErdHtml = path.join(docsDir, 'public', version, 'erd', 'index.html');
  const erdLink = fs.existsSync(versionedErdHtml) ? `/${version}/erd/index.html` : `/erd/index.html`;
  const erdLabel = localeConfigs[locale]?.pdmUi.erd ?? 'ER diagram';
  items.push({
    text: erdLabel,
    link: erdLink,
    target: '_blank',
    rel: 'noopener noreferrer',
  });

  for (const objectType of objectTypes) {
    const hclFiles = objectTypeHclFiles.get(objectType) ?? [];
    if (hclFiles.length === 0) {
      continue;
    }
    process.stdout.write(
      `[PDM Sidebar] ${locale}/${version} Found ${hclFiles.length} HCL files for ${objectType}\n`
    );

    const typeItems: SidebarItem[] = [];

    // Add index page for the type
    typeItems.push({
      text: 'Index',
      link: `${baseLink}/${objectType}/`,
    });

    // Add individual object pages
    const objects = [];
    for (const hclPath of hclFiles) {
      const hclContent = fs.readFileSync(hclPath, 'utf-8');
      const parsed = parseHclFile(hclContent, objectType);

      if (!parsed) {
        process.stdout.write(
          `[PDM Sidebar] locale=${locale} version=${version} objectType=${objectType} parseFailed path=${hclPath}\n`
        );
        continue;
      }
      objects.push(parsed);
    }

    // Sort objects by name
    objects.sort((a, b) => a!.name.localeCompare(b!.name));

    if (!indexOnlyObjectTypes.has(objectType)) {
      for (const obj of objects) {
        typeItems.push({
          text: obj!.name, // Use physical name instead of logical name
          link: `${baseLink}/${objectType}/${obj!.name}`,
        });
      }
    }

    // Add group for this object type
    // We can use a simple mapping for type labels or pass them in
    const typeLabel = objectType.charAt(0).toUpperCase() + objectType.slice(1);

    items.push({
      text: typeLabel,
      collapsed: false,
      items: typeItems,
    });
  }

  pdmSidebarCache.set(cacheKey, {
    signature: sourceSignature,
    items: cloneSidebarItems(items),
  });

  return items;
}
