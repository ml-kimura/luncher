import path from 'path';
import { localeConfigs } from '../../../.vitepress/config';
import { docsDir } from '../../../.vitepress/utils/paths';
import { loadReleaseNotesContent } from '../../../.vitepress/utils/sidebar/generators';
import { getVersions } from '../../../.vitepress/utils/versions';

export default {
  async paths() {
    // VitePress evaluates this file once and generates paths for all locale/version combinations
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        description: string;
        content: string;
      };
    }> = [];

    // Generate paths for all locales
    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);

      if (localeVersions.length === 0) {
        continue;
      }

      const localeConfig = localeConfigs[locale];
      const historyDescription = localeConfig.features?.history?.description || '';

      for (const version of localeVersions) {
        const historyDir = path.resolve(docsDir, locale, version, 'history');
        const content = loadReleaseNotesContent(historyDir);

        allPaths.push({
          params: {
            locale: locale,
            version: version,
            description: historyDescription,
            content: content,
          },
        });
      }
    }

    return allPaths;
  },
};
