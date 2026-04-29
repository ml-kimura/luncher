import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { localeConfigs } from '../../../.vitepress/config';
import { docsDir } from '../../../.vitepress/utils/paths';
import { getVersions } from '../../../.vitepress/utils/versions';

// Supported sections that can have messages
const SECTIONS = ['screen', 'batch', 'api'] as const;
type Section = (typeof SECTIONS)[number];

interface Message {
  code: string;
  message: { ja: string; en: string };
}

interface MessagesYaml {
  messages: Message[];
}

function loadMessagesYaml(version: string, section: Section): MessagesYaml | null {
  const versionedPath = path.resolve(docsDir, 'public', version, section, 'messages.yml');
  const defaultPath =
    section === 'batch'
      ? path.resolve(docsDir, '..', '..', '..', 'apps', 'batch', 'messages.yml')
      : section === 'api'
        ? path.resolve(docsDir, '..', '..', '..', 'apps', 'api', 'messages.yml')
        : path.resolve(docsDir, 'public', section, 'messages.yml');
  const yamlPath = fs.existsSync(versionedPath) ? versionedPath : defaultPath;

  if (!fs.existsSync(yamlPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(yamlPath, 'utf-8');
    return yaml.load(content) as MessagesYaml;
  } catch (error) {
    process.stderr.write(`Error loading messages.yml from ${yamlPath}: ${String(error)}\n`);
    return null;
  }
}

interface GroupedMessages {
  info: { code: string; message: string }[];
  warning: { code: string; message: string }[];
  error: { code: string; message: string }[];
  fatal: { code: string; message: string }[];
}

function groupMessagesByPrefix(messages: Message[], lang: string): GroupedMessages {
  const grouped: GroupedMessages = {
    info: [],
    warning: [],
    error: [],
    fatal: [],
  };

  for (const msg of messages) {
    const prefix = msg.code.charAt(0).toUpperCase();
    const item = {
      code: msg.code,
      message: msg.message[lang as keyof typeof msg.message],
    };

    switch (prefix) {
      case 'I':
        grouped.info.push(item);
        break;
      case 'W':
        grouped.warning.push(item);
        break;
      case 'E':
        grouped.error.push(item);
        break;
      case 'F':
        grouped.fatal.push(item);
        break;
    }
  }

  return grouped;
}

export default {
  async paths() {
    // VitePress evaluates this file once and generates paths for all locale/version combinations
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        section: Section;
        title: string;
        description: string;
        labels: string;
        messages: string;
      };
    }> = [];

    // Generate paths for all locales
    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);

      if (localeVersions.length === 0) {
        continue;
      }

      const localeConfig = localeConfigs[locale];
      const lang = localeConfig.lang;

      for (const version of localeVersions) {
        for (const section of SECTIONS) {
          const messagesData = loadMessagesYaml(version, section);
          // Generate path even if messages.yml doesn't exist (empty messages)
          const grouped = messagesData
            ? groupMessagesByPrefix(messagesData.messages, lang)
            : { info: [], warning: [], error: [], fatal: [] };
          const labels = localeConfig.messageLabels;

          allPaths.push({
            params: {
              locale: locale,
              version: version,
              section: section,
              title: labels.title,
              description: labels.description,
              labels: JSON.stringify({
                code: labels.code,
                message: labels.message,
                info: labels.info,
                warning: labels.warning,
                error: labels.error,
                fatal: labels.fatal,
              }),
              messages: JSON.stringify(grouped),
            },
          });
        }
      }
    }

    return allPaths;
  },
};
