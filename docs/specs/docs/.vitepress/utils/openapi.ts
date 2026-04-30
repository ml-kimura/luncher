/**
 * OpenAPI/Swagger utilities
 * Handles discovery and sidebar generation for OpenAPI specs
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { createOpenApiSpec, useSidebar } from 'vitepress-openapi';

import { publicDir, workspaceRootDir } from './paths';

function openapiLayoutDirs(version: string) {
  return {
    versioned: path.join(publicDir, version, 'openapi'),
    original: path.join(workspaceRootDir, 'apps', 'api'),
  } as const;
}

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

function resolveOpenApiSourcePath(version: string, fileName: string): string | null {
  const { versioned, original } = openapiLayoutDirs(version);

  if (fs.existsSync(versioned)) {
    const versionedFilePath = path.join(versioned, fileName);
    if (fs.existsSync(versionedFilePath)) {
      return versionedFilePath;
    }
  }

  const originalFilePath = path.join(original, fileName);
  if (fs.existsSync(originalFilePath)) {
    return originalFilePath;
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
      .filter((file) => file.isFile() && file.name.startsWith('openapi-') && file.name.endsWith('.yml'))
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
export function discoverOpenApiSpecs(version: string): OpenApiSpec[] {
  const specs: OpenApiSpec[] = [];
  const { versioned, original } = openapiLayoutDirs(version);

  const fileNames = new Set<string>([...listOpenApiFileNames(original), ...listOpenApiFileNames(versioned)]);

  for (const fileName of fileNames) {
    const id = fileName.replace(/^openapi-/, '').replace(/\.yml$/, '');
    const filePath = resolveOpenApiSourcePath(version, fileName);
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
export function generateOpenApiSidebar(version: string, locale: string): SidebarItem[] {
  const specs = discoverOpenApiSpecs(version);
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
