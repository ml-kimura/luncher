export interface LocaleVersionContext {
  locale: string;
  version: string;
}

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

export function extractLocaleVersion(pathname: string): LocaleVersionContext | null {
  const pathOnly = pathname.split('?')[0].split('#')[0];
  const segments = pathOnly.split('/').filter(Boolean);

  const specsIndex = segments.indexOf('specs');
  if (specsIndex < 0 || specsIndex + 2 >= segments.length) {
    return null;
  }

  const locale = segments[specsIndex + 1];
  const version = segments[specsIndex + 2];

  if (!locale || !version || !SEMVER_PATTERN.test(version)) {
    return null;
  }

  return { locale, version };
}

/**
 * Resolve a URL from a path relative to `{locale}/{version}`.
 * Example:
 * - currentPath: /specs/ja/1.0.0/screen/design/scr-001.html
 * - fromVersionPath: screen/messages.html#E001
 * - result: /specs/ja/1.0.0/screen/messages.html#E001
 */
export function resolveVersionedUrl(
  currentPath: string,
  fromVersionPath: string
): string {
  if (/^https?:\/\//.test(fromVersionPath)) {
    return fromVersionPath;
  }

  if (fromVersionPath.startsWith('/specs/')) {
    return fromVersionPath;
  }

  const normalizedPath = fromVersionPath.replace(/^\//, '');
  const context = extractLocaleVersion(currentPath);

  if (!context) {
    return `/${normalizedPath}`;
  }

  return `/specs/${context.locale}/${context.version}/${normalizedPath}`;
}
