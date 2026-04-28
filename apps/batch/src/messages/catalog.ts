import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

interface MessageItem {
  code: string;
  ja: string;
  en: string;
}

export interface MessageCatalog {
  getTemplateByCode: (code: string, locale: "ja" | "en") => string;
}

const __filename = fileURLToPath(import.meta.url);
const DEFAULT_MESSAGES_YAML_PATH = resolve(__filename, "..", "..", "..", "messages.yml");

let cachedCatalog: MessageCatalog | null = null;

const parseMessagesYml = (raw: string): MessageItem[] => {
  const lines = raw.split(/\r?\n/);
  const items: MessageItem[] = [];

  let current: MessageItem | null = null;
  for (const line of lines) {
    const codeMatch = line.match(/^\s*-\s*code:\s*([A-Z0-9-]+)\s*$/);
    if (codeMatch) {
      if (current) items.push(current);
      current = { code: codeMatch[1], ja: "", en: "" };
      continue;
    }

    if (!current) continue;

    const jaMatch = line.match(/^\s*ja:\s*'(.*)'\s*$/);
    if (jaMatch) {
      current.ja = jaMatch[1];
      continue;
    }

    const enMatch = line.match(/^\s*en:\s*'(.*)'\s*$/);
    if (enMatch) {
      current.en = enMatch[1];
    }
  }

  if (current) items.push(current);
  return items;
};

export const loadMessageCatalog = (): MessageCatalog => {
  if (cachedCatalog) return cachedCatalog;

  const yamlPath = process.env.BATCH_MESSAGES_YAML_PATH ?? DEFAULT_MESSAGES_YAML_PATH;
  const raw = readFileSync(yamlPath, "utf-8");
  const items = parseMessagesYml(raw);
  const map = new Map(items.map((item) => [item.code, item]));

  cachedCatalog = {
    getTemplateByCode: (code, locale) => {
      const item = map.get(code);
      if (!item) {
        throw new Error(`Message code not found in YAML: ${code}`);
      }
      const value = item[locale];
      if (!value) {
        throw new Error(`Message template is empty for code=${code} locale=${locale}`);
      }
      return value;
    },
  };

  return cachedCatalog;
};

export const formatTemplate = (
  template: string,
  values: Record<string, string>,
): string =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
