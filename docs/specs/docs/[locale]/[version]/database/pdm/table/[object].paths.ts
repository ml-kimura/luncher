import fs from 'fs';
import { localeConfigs, type PdmUiLabels } from '../../../../../.vitepress/locales';
import {
  type ForeignKey,
  type Index,
  getLocalizedMetadata,
  parseHclFile,
  type UniqueConstraint,
} from '../../../../../.vitepress/utils/database/hcl-parser';
import { getObjectTypeHclFiles } from '../../../../../.vitepress/utils/database/pdm-source';
import { docsDir } from '../../../../../.vitepress/utils/paths';
import { compareVersions, getVersions } from '../../../../../.vitepress/utils/versions';

type Locale = 'ja' | 'en';

interface TableObjectColumnView {
  name: string;
  type: string;
  logical_name: string;
  description: string;
  not_null?: boolean;
  default?: string;
  pk_order?: number;
}

interface TableObjectPageData {
  locale: Locale;
  version: string;
  objectType: string;
  objectName: string;
  title: string;
  description: string;
  columns: TableObjectColumnView[] | undefined;
  primary_keys?: { name: string; columns: string[] }[];
  foreign_keys?: ForeignKey[];
  unique_constraints?: UniqueConstraint[];
  indexes?: Index[];
  pdmUi: PdmUiLabels;
}

interface TableObjectPathParams {
  locale: Locale;
  version: string;
  object: string;
  data: TableObjectPageData;
}

export default {
  paths() {
    const paths: Array<{ params: TableObjectPathParams }> = [];

    // Locales to generate for
    const locales = ['ja', 'en'] as const;
    const versions = Array.from(
      new Set(locales.flatMap((locale) => getVersions(docsDir, locale, false)))
    ).sort((a, b) => compareVersions(b, a));

    // Object type is hardcoded to "table" for this template
    const objectType = 'table';

    for (const version of versions) {
      const hclFiles = getObjectTypeHclFiles(docsDir, version, objectType);
      if (hclFiles.length === 0) continue;

      for (const hclPath of hclFiles) {
        const hclContent = fs.readFileSync(hclPath, 'utf-8');
        const parsed = parseHclFile(hclContent, objectType);

        if (!parsed) continue;

        // Generate a page for each locale
        for (const locale of locales) {
          const localized = getLocalizedMetadata(parsed.metadata, locale);

          const columns = parsed.columns?.map((col) => {
            const colLocalized = getLocalizedMetadata(col.metadata, locale);
            return {
              name: col.name,
              type: col.type,
              logical_name: colLocalized.logical_name,
              description: colLocalized.description,
              not_null: col.not_null,
              default: col.default,
              pk_order: col.pk_order,
            };
          });

          paths.push({
            params: {
              locale,
              version,
              object: parsed.name,
              data: {
                locale,
                version,
                objectType,
                objectName: parsed.name,
                title: localized.logical_name,
                description: localized.description,
                columns,
                primary_keys: parsed.primary_keys,
                foreign_keys: parsed.foreign_keys,
                unique_constraints: parsed.unique_constraints,
                indexes: parsed.indexes,
                pdmUi: localeConfigs[locale].pdmUi,
              },
            },
          });
        }
      }
    }

    return paths;
  },
};
