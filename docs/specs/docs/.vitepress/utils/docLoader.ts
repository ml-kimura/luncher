import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export interface DocItem {
  id: string;
  title: string;
  link: string;
  [key: string]: string | undefined;
}

function compareDocOrder(aId: string, bId: string): number {
  const aNum = Number(aId);
  const bNum = Number(bId);
  const aIsNum = Number.isFinite(aNum);
  const bIsNum = Number.isFinite(bNum);

  if (aIsNum && bIsNum) return aNum - bNum;
  if (aIsNum) return -1;
  if (bIsNum) return 1;
  return aId.localeCompare(bId);
}

/**
 * Rule for extracting metadata from markdown
 */
export interface ExtractRule {
  /** Label/key for the extracted value */
  label: string;
  /** Regular expression pattern to match */
  pattern: RegExp;
  /** Capture group number to extract (default: 1) */
  group?: number;
}

/**
 * Default extraction rules for title and description
 */
export const defaultExtractRules: ExtractRule[] = [
  { label: 'title', pattern: /^#\s+(.+)$/m },
  { label: 'description', pattern: /^#\s+.+\n\n([^#\n].+)/m },
];

/**
 * Extract metadata from markdown file using configurable rules
 * @param filePath - Path to the markdown file
 * @param rules - Array of extraction rules (defaults to title and description)
 * @returns Object with extracted values keyed by label
 */
export function extractMetaFromMarkdown(
  filePath: string,
  rules: ExtractRule[] = defaultExtractRules
): Record<string, string | undefined> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result: Record<string, string | undefined> = {};

    for (const rule of rules) {
      const match = content.match(rule.pattern);
      const groupIndex = rule.group ?? 1;
      result[rule.label] = match?.[groupIndex]?.trim();
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Load document list from a directory
 * Reads frontmatter from each markdown file and returns all fields
 */
export function loadDocsFromDir(dirPath: string, linkBase: string): DocItem[] {
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
        const content = fs.readFileSync(filePath, 'utf-8');

        // Parse frontmatter
        const { data: frontmatter } = matter(content);

        // Get id and title from frontmatter, or extract from content
        const id = frontmatter.id || fileName;
        const title = frontmatter.title || '';

        // Build doc item with all frontmatter fields
        const docItem: DocItem = {
          id: String(id),
          title: String(title),
          link: `${linkBase}/${fileName}`,
        };

        // Add all other frontmatter fields
        for (const [key, value] of Object.entries(frontmatter)) {
          if (key !== 'id' && key !== 'title' && value !== undefined) {
            docItem[key] = String(value);
          }
        }

        return docItem;
      })
      .sort((a, b) => compareDocOrder(a.id, b.id));
  } catch {
    return [];
  }
}
