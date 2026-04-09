import fs from 'fs';
import { SidebarItem } from '../openapi';
import { localeConfigs } from '../../locales';
import {
  groupGlossaryTermsByCategory,
  loadGlossaryYaml,
  resolveGlossaryYamlPath,
  uncategorizedLabel,
} from '../glossary-data';

/**
 * Generate sidebar items for glossary grouped by categories
 */
export function generateGlossarySidebarItems(
  docsDir: string,
  version: string,
  locale: string
): SidebarItem[] {
  const base = `/${locale}/${version}`;
  const yamlPath = resolveGlossaryYamlPath(docsDir, version);
  const glossaryData = loadGlossaryYaml(docsDir, version);

  if (!glossaryData) {
    if (!fs.existsSync(yamlPath)) {
      process.stderr.write(
        `Error generating glossary sidebar: glossary.yml not found: ${yamlPath}\n`
      );
    }
    return [];
  }

  if (!glossaryData.terms) {
    return [];
  }

  const { categorized: categorizedTerms, uncategorized } = groupGlossaryTermsByCategory(
    glossaryData.terms,
    locale
  );

  const items: SidebarItem[] = [];

  const sortedCategories = Array.from(categorizedTerms.keys()).sort();

  const categoryLinks: SidebarItem[] = [];

  for (const category of sortedCategories) {
    categoryLinks.push({
      text: category,
      link: `${base}/glossary/category/${category}`,
    });
  }

  if (uncategorized.length > 0) {
    const label = uncategorizedLabel(locale);
    categoryLinks.push({
      text: label,
      link: `${base}/glossary/category/${label}`,
    });
  }

  if (categoryLinks.length > 0) {
    const categoryLabel = localeConfigs[locale]?.glossaryUi.categoriesGroup ?? 'Categories';
    items.push({
      text: categoryLabel,
      items: categoryLinks,
    });
  }

  return items;
}
