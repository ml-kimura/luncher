import { localeConfigs } from '../../../../.vitepress/config';
import { docsDir } from '../../../../.vitepress/utils/paths';
import {
  groupGlossaryTermsByCategory,
  loadGlossaryYaml,
  uncategorizedLabel,
} from '../../../../.vitepress/utils/glossary-data';
import { getVersions } from '../../../../.vitepress/utils/versions';

export default {
  async paths() {
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        category: string;
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

      for (const version of localeVersions) {
        const glossaryData = loadGlossaryYaml(docsDir, version);
        if (!glossaryData?.terms) {
          continue;
        }

        const { categorized: categorizedTerms, uncategorized } = groupGlossaryTermsByCategory(
          glossaryData.terms,
          locale
        );

        for (const [category, terms] of Array.from(categorizedTerms.entries())) {
          allPaths.push({
            params: {
              locale,
              version,
              category,
              title: category,
              description: `Glossary terms for ${category}`,
              terms: JSON.stringify(terms),
            },
          });
        }

        if (uncategorized.length > 0) {
          const categoryName = uncategorizedLabel(locale);
          allPaths.push({
            params: {
              locale,
              version,
              category: categoryName,
              title: categoryName,
              description: `Uncategorized glossary terms`,
              terms: JSON.stringify(uncategorized),
            },
          });
        }
      }
    }

    return allPaths;
  },
};
