/**
 * Sidebar generators for auto-generated sections
 * These functions generate sidebar items for dynamic content
 */

import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { SidebarItem } from '../openapi';
import { compareVersions } from '../versions';

/**
 * Extract title from markdown file (first # heading)
 */
function extractTitleFromMarkdown(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Generate sidebar items from a directory
 * Reads markdown files and extracts titles for labels
 */
export function generateDirSidebarItems(
  dirPath: string,
  linkBase: string
): SidebarItem[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    return files
      .filter((f) => f.isFile() && f.name.endsWith('.md'))
      .map((f) => {
        const fileName = f.name.replace(/\.md$/, '');
        const filePath = path.join(dirPath, f.name);
        let orderKey = fileName;

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const { data: frontmatter } = matter(content);
          if (frontmatter.id !== undefined) {
            orderKey = String(frontmatter.id);
          }
        } catch {
          // ignore frontmatter parse failures and fallback to filename
        }

        const title = extractTitleFromMarkdown(filePath) || fileName;

        return {
          text: title,
          link: `${linkBase}/${fileName}`,
          orderKey,
        };
      })
      .sort((a, b) => {
        const aNum = Number((a as SidebarItem & { orderKey?: string }).orderKey);
        const bNum = Number((b as SidebarItem & { orderKey?: string }).orderKey);
        const aIsNum = Number.isFinite(aNum);
        const bIsNum = Number.isFinite(bNum);

        if (aIsNum && bIsNum) return aNum - bNum;
        if (aIsNum) return -1;
        if (bIsNum) return 1;
        return ((a as SidebarItem & { orderKey?: string }).orderKey || '').localeCompare(
          (b as SidebarItem & { orderKey?: string }).orderKey || ''
        );
      })
      .map(({ text, link }) => ({ text, link }));
  } catch {
    return [];
  }
}

/**
 * Generate sidebar items for release notes
 * Reads markdown files from history directory and sorts by semantic version (descending)
 */
export function generateReleaseNotesSidebarItems(
  historyDir: string,
  linkBase: string
): SidebarItem[] {
  if (!fs.existsSync(historyDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(historyDir, { withFileTypes: true });
    const releaseNotes = files
      .filter(
        (f) => f.isFile() && f.name.endsWith('.md') && f.name !== 'index.md'
      )
      .map((f) => {
        const fileName = f.name.replace(/\.md$/, '');
        const filePath = path.join(historyDir, f.name);
        const title = extractTitleFromMarkdown(filePath) || fileName;

        return {
          version: fileName,
          text: title,
          link: `${linkBase}/${fileName}`,
        };
      })
      .filter((item) => /^\d+\.\d+\.\d+$/.test(item.version)) // Only semantic versions
      .sort((a, b) => compareVersions(b.version, a.version)); // Descending order

    return releaseNotes.map(({ text, link }) => ({ text, link }));
  } catch {
    return [];
  }
}

/**
 * Load all release notes content and combine them
 * Returns combined markdown content sorted by version (descending)
 */
export function loadReleaseNotesContent(historyDir: string): string {
  if (!fs.existsSync(historyDir)) {
    return '';
  }

  try {
    const files = fs.readdirSync(historyDir, { withFileTypes: true });
    const releaseNotes = files
      .filter(
        (f) => f.isFile() && f.name.endsWith('.md') && f.name !== 'index.md'
      )
      .map((f) => {
        const fileName = f.name.replace(/\.md$/, '');
        const filePath = path.join(historyDir, f.name);

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          return {
            version: fileName,
            content: content.trim(),
          };
        } catch {
          return null;
        }
      })
      .filter(
        (item): item is { version: string; content: string } => item !== null
      )
      .filter((item) => /^\d+\.\d+\.\d+$/.test(item.version)) // Only semantic versions
      .sort((a, b) => compareVersions(b.version, a.version)); // Descending order

    // Join with stronger separator between versions
    // Use a more visible separator and add spacing before each version
    return releaseNotes
      .map((item, index) => {
        // Add separator before each version except the first
        const separator = index > 0 ? '\n\n---\n\n' : '';
        return separator + item.content;
      })
      .join('');
  } catch {
    return '';
  }
}
