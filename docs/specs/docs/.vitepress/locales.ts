/**
 * Centralized locale configuration
 * Locale-specific labels and settings are loaded from YAML files in ./locales/
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, 'locales');

/**
 * Field definition for tables (columns in list, fields in basic info)
 */
export interface FieldDef {
  /** Data field key (id, title, description, or custom field from frontmatter) */
  key: string;
  /** Field/column header label */
  label: string;
}

/**
 * Section labels for document lists (screen, batch)
 */
export interface SectionLabels {
  title: string;
  description: string;
  listLabel: string;
  /** Title for basic info section in detail pages */
  infoTitle: string;
  /** Field definitions for both list table and detail page basic info */
  fields: FieldDef[];
}

/**
 * Message page labels
 */
export interface MessageLabels {
  title: string;
  description: string;
  code: string;
  message: string;
  info: string;
  warning: string;
  error: string;
  fatal: string;
}

/**
 * Navigation item configuration
 */
export interface NavItem {
  key: string;
  label: string;
  path: string;
}

/**
 * Document sections configuration
 * Maps section (screen, batch) to subsections (design, flow)
 */
export interface DocSections {
  [section: string]: {
    [subSection: string]: SectionLabels;
  };
}

/** Glossary sidebar / uncategorized routing labels */
export interface GlossaryUiLabels {
  uncategorized: string;
  categoriesGroup: string;
}

/** PDM table/schema pages and PDM sidebar (ERD link) */
export interface PdmUiLabels {
  erd: string;
  physicalName: string;
  logicalName: string;
  description: string;
  columnsSection: string;
  sqlType: string;
  pkUniqueIndexSection: string;
  name: string;
  constraintKind: string;
  columns: string;
  none: string;
  referenceConstraints: string;
  refTable: string;
  refColumns: string;
  checkExclusiveSection: string;
  condition: string;
}

/**
 * Complete locale configuration
 */
export interface LocaleConfig {
  /** Display label for language switcher */
  label: string;
  /** Language code (e.g., 'ja', 'en') */
  lang: string;
  /** Navigation items */
  navItems: NavItem[];
  /** Sidebar section labels */
  sidebarLabels: Record<string, string>;
  /** Footer content */
  footer: {
    message: string;
    copyright: string;
  };
  /** Document sections (screen, batch with design, flow subsections) */
  docSections: DocSections;
  /** Message page labels */
  messageLabels: MessageLabels;
  /** OpenAPI i18n messages */
  openapiMessages: Record<string, string>;
  /** Glossary UI (uncategorized label, sidebar group title) */
  glossaryUi: GlossaryUiLabels;
  /** PDM documentation table/schema labels */
  pdmUi: PdmUiLabels;
  /** Feature descriptions for home page */
  featureDescriptions?: Record<string, string>;
  /** Raw features configuration from YAML */
  features?: Record<string, Feature>;
}

/**
 * Feature definition in YAML
 */
interface Feature {
  label: string;
  path?: string;
  items?: Record<string, string>;
  description?: string;
  icon?: string;
  name?: string;
  text?: string;
}

/**
 * Raw locale configuration from YAML
 */
interface RawLocaleConfig extends Omit<
  LocaleConfig,
  'navItems' | 'sidebarLabels' | 'featureDescriptions'
> {
  features: Record<string, Feature>;
}

/**
 * Load locale configuration from YAML file
 */
function loadLocaleConfig(filename: string): LocaleConfig {
  const filePath = path.resolve(localesDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rawConfig = yaml.load(content) as RawLocaleConfig;

  // Transform features into navItems and sidebarLabels
  const navItems: NavItem[] = [];
  const sidebarLabels: Record<string, string> = {};
  const featureDescriptions: Record<string, string> = {};

  for (const [key, feature] of Object.entries(rawConfig.features || {})) {
    // Build navItems
    if (feature.path !== undefined) {
      navItems.push({
        key,
        label: feature.label,
        path: feature.path,
      });
    }

    // Build sidebarLabels
    sidebarLabels[key] = feature.label;
    if (feature.items) {
      for (const [itemKey, itemLabel] of Object.entries(feature.items)) {
        // camelCase: screen + Flow -> screenFlow
        const compositeKey =
          key + itemKey.charAt(0).toUpperCase() + itemKey.slice(1);
        sidebarLabels[compositeKey] = itemLabel;
      }
    }

    // Store feature descriptions for home page
    if (feature.description) {
      featureDescriptions[key] = feature.description;
    }
  }

  return {
    ...rawConfig,
    navItems,
    sidebarLabels,
    featureDescriptions,
    features: rawConfig.features,
  };
}

/**
 * Discover all locale YAML files in the locales directory
 * Returns a map of locale code to filename (e.g., { ja: "ja.yml", en: "en.yml" })
 */
function discoverLocaleFiles(): Record<string, string> {
  if (!fs.existsSync(localesDir)) {
    return {};
  }

  const files = fs.readdirSync(localesDir, { withFileTypes: true });
  const localeFiles: Record<string, string> = {};

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.yml')) {
      const localeCode = file.name.replace(/\.yml$/, '');
      localeFiles[localeCode] = file.name;
    }
  }

  return localeFiles;
}

/**
 * Load all locale configurations from YAML files
 */
export function loadAllLocaleConfigs(): Record<string, LocaleConfig> {
  const localeFiles = discoverLocaleFiles();
  const configs: Record<string, LocaleConfig> = {};

  for (const [localeCode, filename] of Object.entries(localeFiles)) {
    const config = loadLocaleConfig(filename);
    configs[localeCode] = config;
  }

  return configs;
}

/** Single load shared by VitePress config, sidebars, and dynamic routes */
export const localeConfigs = loadAllLocaleConfigs();
