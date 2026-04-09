import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { localeConfigs } from '../locales';

export interface GlossaryTerm {
  id: string;
  word: string;
  category?: string;
  synonyms?: string[];
  definition: string;
  i18n?: {
    [locale: string]: {
      word: string;
      category?: string;
      synonyms?: string[];
      definition: string;
    };
  };
}

export interface GlossaryYaml {
  terms: GlossaryTerm[];
}

/** URL セグメント・サイドバーで未分類用語を束ねるときのラベル（locale と一致させること） */
export function uncategorizedLabel(locale: string): string {
  return localeConfigs[locale]?.glossaryUi.uncategorized ?? 'Other';
}

export function resolveGlossaryYamlPath(docsDir: string, version: string): string {
  return path.join(docsDir, 'shared', version, 'glossary.yml');
}

/**
 * glossary.yml を読み込む。ファイルが無い場合は null（ログなし）。
 * 読み取り／パース失敗時は stderr に1行出して null。
 */
export function loadGlossaryYaml(docsDir: string, version: string): GlossaryYaml | null {
  const yamlPath = resolveGlossaryYamlPath(docsDir, version);
  if (!fs.existsSync(yamlPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(yamlPath, 'utf-8');
    return yaml.load(content) as GlossaryYaml;
  } catch (e) {
    process.stderr.write(`Error loading glossary.yml from ${yamlPath}: ${String(e)}\n`);
    return null;
  }
}

export function groupGlossaryTermsByCategory(
  terms: GlossaryTerm[],
  locale: string
): {
  categorized: Map<string, GlossaryTerm[]>;
  uncategorized: GlossaryTerm[];
} {
  const categorized = new Map<string, GlossaryTerm[]>();
  const uncategorized: GlossaryTerm[] = [];

  for (const term of terms) {
    let category = term.category;
    const localized = term.i18n?.[locale];
    if (localized?.category) {
      category = localized.category;
    }

    if (category) {
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category)!.push(term);
    } else {
      uncategorized.push(term);
    }
  }

  return { categorized, uncategorized };
}
