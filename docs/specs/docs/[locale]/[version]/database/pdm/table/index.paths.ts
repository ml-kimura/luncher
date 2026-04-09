import fs from 'fs';
import { localeConfigs, type PdmUiLabels } from '../../../../../.vitepress/locales';
import { getLocalizedMetadata, parseHclFile } from '../../../../../.vitepress/utils/database/hcl-parser';
import { getObjectTypeHclFiles } from '../../../../../.vitepress/utils/database/pdm-source';
import { docsDir } from '../../../../../.vitepress/utils/paths';
import { compareVersions, getVersions } from '../../../../../.vitepress/utils/versions';

type Locale = 'ja' | 'en';

interface TableIndexPathParams {
  locale: Locale;
  version: string;
  data: {
    locale: Locale;
    version: string;
    objectType: string;
    title: string;
    objects: Array<{ name: string; logical_name: string; description: string }>;
    pdmUi: PdmUiLabels;
  };
}

export default {
  paths() {
    const paths: Array<{ params: TableIndexPathParams }> = [];

    // Locales to generate for
    const locales = ['ja', 'en'] as const;
    const versions = Array.from(
      new Set(locales.flatMap((locale) => getVersions(docsDir, locale, false)))
    ).sort((a, b) => compareVersions(b, a));

    // Object type is hardcoded to "table" for this template (directory is "tables")
    const objectType = 'table';

    // Type labels for different locales
    const typeLabels: Record<string, { ja: string; en: string }> = {
      table: { ja: 'テーブル', en: 'Tables' },
    };

    for (const version of versions) {
      const hclFiles = getObjectTypeHclFiles(docsDir, version, objectType);
      if (hclFiles.length === 0) continue;

      // Parse all objects for this type
      const parsedObjects = hclFiles
        .map((hclPath) => {
          const hclContent = fs.readFileSync(hclPath, 'utf-8');
          return parseHclFile(hclContent, objectType);
        })
        .filter((obj) => obj !== null);

      // Generate an index page for each locale
      for (const locale of locales) {
        const objects = parsedObjects.map((obj) => {
          const localized = getLocalizedMetadata(obj!.metadata, locale);
          return {
            name: obj!.name,
            logical_name: localized.logical_name,
            description: localized.description,
          };
        });

        paths.push({
          params: {
            locale,
            version,
            data: {
              locale,
              version,
              objectType,
              title: typeLabels[objectType]?.[locale as 'ja' | 'en'] || objectType,
              objects,
              pdmUi: localeConfigs[locale].pdmUi,
            },
          },
        });
      }
    }

    return paths;
  },
};
