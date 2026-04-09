/**
 * Sidebar builder utilities
 * Helper functions to build sidebar configurations
 */

import fs from 'fs';
import path from 'path';
import { SidebarItem } from '../openapi';
import { generateDirSidebarItems } from './generators';

/**
 * Build sidebar for a specific locale and version
 */
export interface SidebarBuilderContext {
  locale: string;
  version: string;
  base: string;
  baseDir: string;
  labels: Record<string, string>;
  docsDir: string;
}

/**
 * Create a sidebar item with auto-generated directory content
 */
export function createDirGroup(
  context: SidebarBuilderContext,
  section: string,
  subSection: string,
  label: string
): SidebarItem {
  const dirPath = path.join(context.baseDir, section, subSection);
  const autoItems = generateDirSidebarItems(
    dirPath,
    `${context.base}/${section}/${subSection}`
  );

  const groupItems: SidebarItem[] = [
    {
      text: context.labels.overview,
      link: `${context.base}/${section}/${subSection}/`,
    },
    ...autoItems,
  ];

  return {
    text: label,
    collapsed: false,
    items: groupItems,
  };
}

/**
 * Check if messages.yml exists for a section
 */
export function hasMessagesFile(
  context: SidebarBuilderContext,
  section: string
): boolean {
  const messagesYamlPath = path.join(context.baseDir, section, 'messages.yml');
  return fs.existsSync(messagesYamlPath);
}
