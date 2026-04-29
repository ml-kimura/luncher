import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BATCH_MESSAGE_CODE_ENTRIES, BATCH_MESSAGE_CODES } from '../src/messages/codes.js';

interface MessageItem {
  code: string;
  constName?: string;
  ja?: string;
  en?: string;
}

const appRoot = resolve(process.cwd());
const messagesPath = resolve(appRoot, 'messages.yml');
const HEADER = '# Batch messages configuration (source of truth)';

const toUpperSnakeCaseFromKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toUpperCase();

const escapeYamlSingleQuoted = (value: string): string => value.replace(/'/g, "''");

const parseMessagesYml = (raw: string): MessageItem[] => {
  const lines = raw.split(/\r?\n/);
  const items: MessageItem[] = [];
  let current: MessageItem | null = null;

  for (const line of lines) {
    const codeMatch = line.match(/^\s*-\s*code:\s*([A-Z0-9-]+)\s*$/);
    if (codeMatch) {
      if (current) items.push(current);
      current = { code: codeMatch[1] };
      continue;
    }

    if (!current) continue;

    const constMatch = line.match(/^\s*const:\s*([A-Z0-9_]+)\s*$/);
    if (constMatch) {
      current.constName = constMatch[1];
      continue;
    }

    const jaMatch = line.match(/^\s*ja:\s*'?(.*?)'?\s*$/);
    if (jaMatch) {
      current.ja = jaMatch[1];
      continue;
    }

    const enMatch = line.match(/^\s*en:\s*'?(.*?)'?\s*$/);
    if (enMatch) {
      current.en = enMatch[1];
    }
  }

  if (current) items.push(current);
  return items;
};

const renderMessagesYml = (items: MessageItem[]): string => {
  const rows = [HEADER, 'messages:'];
  for (const item of items) {
    rows.push(`  - code: ${item.code}`);
    rows.push(`    const: ${item.constName}`);
    rows.push('    message:');
    rows.push(`      ja: '${escapeYamlSingleQuoted(item.ja ?? '')}'`);
    rows.push(`      en: '${escapeYamlSingleQuoted(item.en ?? '')}'`);
  }
  return `${rows.join('\n')}\n`;
};

const raw = await readFile(messagesPath, 'utf-8');
const items = parseMessagesYml(raw);
const codeSet = new Set(BATCH_MESSAGE_CODES);
const expectedConstByCode: Map<string, string> = new Map(
  BATCH_MESSAGE_CODE_ENTRIES.map(([key, code]) => [code, toUpperSnakeCaseFromKey(key)])
);

const existingByCode = new Map(items.map((item) => [item.code, item]));
const extraInYaml = items
  .map((item) => item.code)
  .filter((code) => !codeSet.has(code as (typeof BATCH_MESSAGE_CODES)[number]));
if (extraInYaml.length > 0) {
  throw new Error(`messages.yml に codes.ts 未定義のコードがあります: ${extraInYaml.join(', ')}`);
}

let changed = false;
for (const code of BATCH_MESSAGE_CODES) {
  const expectedConst = expectedConstByCode.get(code);
  if (!expectedConst) throw new Error(`codes.ts のエントリ解決に失敗しました: ${code}`);
  if (!existingByCode.has(code)) {
    existingByCode.set(code, {
      code,
      constName: expectedConst,
      ja: `TODO: ${code} のメッセージを設定してください`,
      en: `TODO: Set message for ${code}`,
    });
    changed = true;
  }
}

const orderedItems: MessageItem[] = [];
for (const code of BATCH_MESSAGE_CODES) {
  const item = existingByCode.get(code);
  if (!item) continue;
  const expectedConst = expectedConstByCode.get(code);
  if (!expectedConst) throw new Error(`codes.ts のエントリ解決に失敗しました: ${code}`);

  if (!item.constName) {
    item.constName = expectedConst;
    changed = true;
  } else if (item.constName !== expectedConst) {
    throw new Error(
      `messages.yml の const が不正です: code=${code}, const=${item.constName}, expected=${expectedConst}`
    );
  }

  if (item.ja == null) {
    item.ja = `TODO: ${code} のメッセージを設定してください`;
    changed = true;
  }
  if (item.en == null) {
    item.en = `TODO: Set message for ${code}`;
    changed = true;
  }

  orderedItems.push(item);
}

if (changed) {
  await writeFile(messagesPath, renderMessagesYml(orderedItems), 'utf-8');
  process.stdout.write('messages.yml の code/const 定義を同期しました\n');
}
