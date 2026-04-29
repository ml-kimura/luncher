import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { parse, stringify } from 'yaml';
import { API_MESSAGE_CODE_ENTRIES, API_MESSAGE_CODES } from '../src/messages/codes.js';

interface MessagesYaml {
  messages: Array<{
    code: string;
    const?: string;
    message: {
      ja: string;
      en: string;
    };
  }>;
}

const appRoot = resolve(process.cwd());

const toUpperSnakeCaseFromKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toUpperCase();

const syncMessageCodes = async () => {
  const messagesPath = resolve(appRoot, 'messages.yml');
  const raw = await readFile(messagesPath, 'utf-8');
  const parsed = (parse(raw) as MessagesYaml | null) ?? { messages: [] };
  const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
  const ymlCodes = messages.map((item) => item.code);
  const ymlCodeSet = new Set(ymlCodes);
  const expectedConstByCode: Map<string, string> = new Map(
    API_MESSAGE_CODE_ENTRIES.map(([key, code]) => [code, toUpperSnakeCaseFromKey(key)])
  );
  let needsWrite = false;

  const missingInYaml = API_MESSAGE_CODES.filter((code) => !ymlCodeSet.has(code));
  for (const code of missingInYaml) {
    const expectedConst = expectedConstByCode.get(code);
    if (!expectedConst) {
      throw new Error(`code.ts のエントリ解決に失敗しました: ${code}`);
    }
    messages.push({
      code,
      const: expectedConst,
      message: {
        ja: `TODO: ${code} のメッセージを設定してください`,
        en: `TODO: Set message for ${code}`,
      },
    });
    needsWrite = true;
  }

  const codeSet = new Set(API_MESSAGE_CODES);
  const extraInYaml = ymlCodes.filter((code) => !codeSet.has(code as (typeof API_MESSAGE_CODES)[number]));
  if (extraInYaml.length > 0) {
    throw new Error(`messages.yml に code.ts 未定義のコードがあります: ${extraInYaml.join(', ')}`);
  }

  for (const message of messages) {
    const expectedConst = expectedConstByCode.get(message.code);
    if (!expectedConst) {
      throw new Error(`code.ts に未定義のコードです: ${message.code}`);
    }
    if (!message.const) {
      message.const = expectedConst;
      needsWrite = true;
      continue;
    }
    if (message.const !== expectedConst) {
      throw new Error(
        `messages.yml の const が不正です: code=${message.code}, const=${message.const}, expected=${expectedConst}`
      );
    }
  }

  if (needsWrite) {
    const yamlOutput = stringify({ messages });
    const prettierConfig = (await prettier.resolveConfig(messagesPath)) ?? {};
    const formattedYaml = await prettier.format(yamlOutput, {
      ...prettierConfig,
      filepath: messagesPath,
      parser: 'yaml',
    });
    await writeFile(messagesPath, formattedYaml, 'utf-8');
    if (missingInYaml.length > 0) {
      process.stdout.write(`messages.yml に不足コードを追加: ${missingInYaml.join(', ')}\n`);
    }
    process.stdout.write('messages.yml の const を同期しました\n');
  }
};

await syncMessageCodes();
