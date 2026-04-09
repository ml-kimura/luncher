/**
 * OpenAPI/Swagger utilities
 * Handles discovery and sidebar generation for OpenAPI specs
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { createOpenApiSpec, useSidebar } from 'vitepress-openapi';

/**
 * Sidebar item type (matches VitePress sidebar structure)
 */
export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
  target?: string;
  rel?: string;
}

/**
 * OpenAPI spec info
 */
export interface OpenApiSpec {
  /** Spec identifier (e.g., 'pet' from 'openapi-pet.yml') */
  id: string;
  /** Title from spec's info.title */
  title: string;
  /** Full path to the spec file */
  filePath: string;
  /** Parsed spec content */
  spec: Record<string, unknown>;
}

function resolveOpenApiSourcePath(
  docsDir: string,
  version: string,
  fileName: string
): string | null {
  const publicDir = path.resolve(docsDir, '..', 'public');
  const versionedOpenApiDir = path.join(publicDir, version, 'openapi');
  const sharedOpenApiDir = path.join(publicDir, 'openapi');

  if (fs.existsSync(versionedOpenApiDir)) {
    const versionedFilePath = path.join(versionedOpenApiDir, fileName);
    if (fs.existsSync(versionedFilePath)) {
      return versionedFilePath;
    }
  }

  const sharedFilePath = path.join(sharedOpenApiDir, fileName);
  if (fs.existsSync(sharedFilePath)) {
    return sharedFilePath;
  }

  return null;
}

function listOpenApiFileNames(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  try {
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter(
        (file) =>
          file.isFile() &&
          file.name.startsWith('openapi-') &&
          file.name.endsWith('.yml')
      )
      .map((file) => file.name);
  } catch (error) {
    process.stderr.write(`Error reading OpenAPI directory ${dirPath}: ${String(error)}\n`);
    return [];
  }
}

/**
 * Discover all OpenAPI spec files in a version's api directory
 * Files should be named 'openapi-xxx.yml' where xxx is the identifier
 */
export function discoverOpenApiSpecs(
  docsDir: string,
  version: string,
  locale = ''
): OpenApiSpec[] {
  void locale;
  const specs: OpenApiSpec[] = [];
  const publicDir = path.resolve(docsDir, '..', 'public');
  const versionedOpenApiDir = path.join(publicDir, version, 'openapi');
  const sharedOpenApiDir = path.join(publicDir, 'openapi');

  const fileNames = new Set<string>([
    ...listOpenApiFileNames(sharedOpenApiDir),
    ...listOpenApiFileNames(versionedOpenApiDir),
  ]);

  for (const fileName of fileNames) {
    const id = fileName.replace(/^openapi-/, '').replace(/\.yml$/, '');
    const filePath = resolveOpenApiSourcePath(docsDir, version, fileName);
    if (!filePath) {
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const spec = yaml.load(content) as Record<string, unknown>;
      const info = spec.info as { title?: string } | undefined;
      const title = info?.title || id;

      specs.push({ id, title, filePath, spec });
    } catch (error) {
      process.stderr.write(`Error loading OpenAPI spec ${filePath}: ${String(error)}\n`);
    }
  }

  return specs.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Generate OpenAPI sidebar items for multiple specs
 * Each spec becomes a collapsible group with tag-based subgroups
 */
export function generateOpenApiSidebar(
  docsDir: string,
  version: string,
  locale: string
): SidebarItem[] {
  const specs = discoverOpenApiSpecs(docsDir, version, locale);
  const prefix = `/${locale}`;

  return specs.map((specInfo) => {
    const openapi = createOpenApiSpec({ spec: specInfo.spec });
    const sidebar = useSidebar({
      spec: openapi.spec,
      linkPrefix: `${prefix}/${version}/api/${specInfo.id}/operations/`,
    });

    // generateSidebarGroups returns tag-based groups
    const tagGroups = sidebar.generateSidebarGroups() as SidebarItem[];

    return {
      text: specInfo.title,
      collapsed: false,
      items: tagGroups,
    };
  });
}
