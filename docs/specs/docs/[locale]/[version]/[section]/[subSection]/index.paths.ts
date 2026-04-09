import path from 'path';
import { localeConfigs } from '../../../../.vitepress/config';
import { docsDir } from '../../../../.vitepress/utils/paths';
import { loadDocsFromDir } from '../../../../.vitepress/utils/docLoader';
import { getVersions } from '../../../../.vitepress/utils/versions';

export default {
  async paths() {
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        section: string;
        subSection: string;
        title: string;
        description: string;
        listLabel: string;
        fields: string;
        items: string;
      };
    }> = [];

    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);

      if (localeVersions.length === 0) {
        continue;
      }

      const localeConfig = localeConfigs[locale];
      const docSections = localeConfig.docSections || {};

      for (const version of localeVersions) {
        for (const [section, subSections] of Object.entries(docSections)) {
          for (const [subSection, labels] of Object.entries(subSections)) {
            const dirPath = path.resolve(docsDir, locale, version, section, subSection);
            const items = loadDocsFromDir(dirPath, `/${locale}/${version}/${section}/${subSection}`);

            allPaths.push({
              params: {
                locale,
                version,
                section,
                subSection,
                title: labels.title,
                description: labels.description,
                listLabel: labels.listLabel,
                fields: JSON.stringify(labels.fields),
                items: JSON.stringify(items),
              },
            });
          }
        }
      }
    }

    return allPaths;
  },
};
