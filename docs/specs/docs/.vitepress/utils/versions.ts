import fs from 'fs';
import path from 'path';

/**
 * Semantic version pattern (e.g., 1.0.0, 2.1.3)
 */
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Compare two semantic version strings
 * Returns: negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string) => {
    const parts = v.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  };

  const vA = parseVersion(a);
  const vB = parseVersion(b);

  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  return vA.patch - vB.patch;
}

/**
 * Check if a directory name is a semantic version
 */
function isVersion(name: string): boolean {
  return VERSION_PATTERN.test(name);
}

/**
 * Get list of version directories
 * @param docsDir - Base docs directory path
 * @param lang - Language/locale code (required, e.g., 'ja', 'en')
 * @param sorted - Whether to sort by semantic version descending (default: true)
 */
export function getVersions(
  docsDir: string,
  lang: string,
  sorted = true
): string[] {
  const dir = path.resolve(docsDir, lang);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const versions = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => isVersion(name));

  if (sorted) {
    return versions.sort((a, b) => compareVersions(b, a));
  }

  return versions;
}
