import { createOpenApiSpec, useSidebar } from 'vitepress-openapi';
import { localeConfigs } from '../../../.vitepress/config';
import { docsDir } from '../../../.vitepress/utils/paths';
import { discoverOpenApiSpecs } from '../../../.vitepress/utils/openapi';
import { getVersions } from '../../../.vitepress/utils/versions';

interface SpecInfo {
  id: string;
  title: string;
  description: string;
  link: string;
}

/**
 * Get the first operation link from an OpenAPI spec
 * Uses vitepress-openapi's sidebar generation to get the actual first operation
 */
function getFirstOperationLink(spec: Record<string, unknown>, linkPrefix: string): string | null {
  try {
    const openapi = createOpenApiSpec({ spec });
    const sidebar = useSidebar({
      spec: openapi.spec,
      linkPrefix,
    });

    const tagGroups = sidebar.generateSidebarGroups() as Array<{
      text?: string;
      link?: string;
      items?: Array<{ text?: string; link?: string; items?: unknown[] }>;
    }>;

    // Find the first operation link in the sidebar structure
    for (const group of tagGroups) {
      if (group.items) {
        for (const item of group.items) {
          if (item.link) {
            // Extract operationId from link (e.g., "./operations/listPets" -> "listPets")
            const match = item.link.match(/\/operations\/([^/]+)$/);
            if (match) {
              return match[1];
            }
          }
          // Check nested items (if any)
          if (item.items && item.items.length > 0) {
            const firstNested = item.items[0] as { link?: string };
            if (firstNested?.link) {
              const match = firstNested.link.match(/\/operations\/([^/]+)$/);
              if (match) {
                return match[1];
              }
            }
          }
        }
      }
    }
  } catch (error) {
    process.stderr.write(
      `Error generating sidebar for first operation: ${String(error)}\n`
    );
  }

  return null;
}

export default {
  async paths() {
    // VitePress provides context including the current locale from the path
    // We generate paths for all locale/version combinations
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        specs: string;
        designTitle: string;
        designDescription: string;
        designLink: string;
      };
    }> = [];

    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);

      for (const version of localeVersions) {
        const specs = discoverOpenApiSpecs(docsDir, version, locale);
        const specInfos: SpecInfo[] = specs.map((spec) => {
          const linkPrefix = `./${spec.id}/operations/`;
          const firstOperationId = getFirstOperationLink(spec.spec, linkPrefix);
          const link = firstOperationId ? `./${spec.id}/operations/${firstOperationId}` : '#';
          const info = spec.spec.info as { description?: string } | undefined;
          const description = info?.description?.split('\n')[0] || '';
          return {
            id: spec.id,
            title: spec.title,
            description,
            link,
          };
        });

        allPaths.push({
          params: {
            locale: locale,
            version: version,
            specs: JSON.stringify(specInfos),
            designTitle: localeConfigs[locale]?.docSections?.api?.design?.title || 'API Design',
            designDescription:
              localeConfigs[locale]?.docSections?.api?.design?.description ||
              'API design documents.',
            designLink: `./design/`,
          },
        });
      }
    }

    return allPaths;
  },
};
