import { localeConfigs } from '../../../.vitepress/config';
import { docsDir } from '../../../.vitepress/utils/paths';
import { loadGlossaryYaml } from '../../../.vitepress/utils/glossary-data';
import { getVersions } from '../../../.vitepress/utils/versions';

export default {
  async paths() {
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        title: string;
        description: string;
        terms: string;
      };
    }> = [];

    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);

      if (localeVersions.length === 0) {
        continue;
      }

      const localeConfig = localeConfigs[locale];
      const glossaryLabel = localeConfig.sidebarLabels.glossary || 'Glossary';
      const glossaryDescription =
        localeConfig.features?.glossary?.description || 'Definitions of terms used in the system';

      for (const version of localeVersions) {
        const glossaryData = loadGlossaryYaml(docsDir, version);
        const terms = glossaryData?.terms || [];

        allPaths.push({
          params: {
            locale: locale,
            version: version,
            title: glossaryLabel,
            description: glossaryDescription,
            terms: JSON.stringify(terms),
          },
        });
      }
    }

    return allPaths;
  },
};
