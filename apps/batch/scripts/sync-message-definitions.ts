import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BATCH_MESSAGE_DEFINITIONS } from '../src/messages/codes.js';

interface MessagesYaml {
  messages: Array<{
    code: string;
    message: {
      ja: string;
      en: string;
    };
  }>;
}

const appRoot = resolve(process.cwd());
const HEADER = '# Batch messages configuration (source of truth)';

const escapeYamlSingleQuoted = (value: string): string => value.replace(/'/g, "''");

const renderMessagesYml = (messages: MessagesYaml['messages']): string => {
  const rows = [HEADER, 'messages:'];
  for (const item of messages) {
    rows.push(`  - code: ${item.code}`);
    rows.push('    message:');
    rows.push(`      ja: '${escapeYamlSingleQuoted(item.message.ja)}'`);
    rows.push(`      en: '${escapeYamlSingleQuoted(item.message.en)}'`);
  }
  return `${rows.join('\n')}\n`;
};

const syncMessageCodes = async () => {
  const messagesPath = resolve(appRoot, 'messages.yml');
  const raw = await readFile(messagesPath, 'utf-8');
  const messages: MessagesYaml['messages'] = BATCH_MESSAGE_DEFINITIONS.map((item) => ({
    code: item.code,
    message: {
      ja: item.message.ja,
      en: item.message.en,
    },
  }));

  const formattedYaml = renderMessagesYml(messages);

  if (formattedYaml !== raw) {
    await writeFile(messagesPath, formattedYaml, 'utf-8');
    process.stdout.write('messages.yml を code 定義から再生成しました\n');
    return;
  }

  process.stdout.write('messages.yml は最新です\n');
};

await syncMessageCodes();
