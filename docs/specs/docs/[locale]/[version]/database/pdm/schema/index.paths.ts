import fs from 'fs';
import { localeConfigs, type PdmUiLabels } from '../../../../../.vitepress/locales';
import { getLocalizedMetadata, parseHclFile } from '../../../../../.vitepress/utils/database/hcl-parser';
import { getObjectTypeHclFiles } from '../../../../../.vitepress/utils/database/pdm-source';
import { docsDir } from '../../../../../.vitepress/utils/paths';
import { compareVersions, getVersions } from '../../../../../.vitepress/utils/versions';

type Locale = 'ja' | 'en';

interface SchemaIndexPathParams {
  locale: Locale;
  version: string;
  data: {
    locale: Locale;
    version: string;
    objectType: string;
    title: string;
    objects: Array<{ name: string; description: string }>;
    pdmUi: PdmUiLabels;
  };
}

export default {
  paths() {
    const paths: Array<{ params: SchemaIndexPathParams }> = [];

    const locales = ['ja', 'en'] as const;
    const versions = Array.from(
      new Set(locales.flatMap((locale) => getVersions(docsDir, locale, false)))
    ).sort((a, b) => compareVersions(b, a));

    const objectType = 'schema';

    const typeLabels: Record<string, { ja: string; en: string }> = {
      schema: { ja: 'スキーマ', en: 'Schemas' },
    };

    for (const version of versions) {
      const hclFiles = getObjectTypeHclFiles(docsDir, version, objectType);
      if (hclFiles.length === 0) continue;

      const parsedObjects = hclFiles
        .map((hclPath) => {
          const hclContent = fs.readFileSync(hclPath, 'utf-8');
          return parseHclFile(hclContent, objectType);
        })
        .filter((obj) => obj !== null);

      for (const locale of locales) {
        const objects = parsedObjects.map((obj) => {
          const localized = getLocalizedMetadata(obj!.metadata, locale);
          return {
            name: obj!.name,
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
