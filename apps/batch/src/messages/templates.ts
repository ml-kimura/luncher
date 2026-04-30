import { BATCH_MESSAGE_DEFINITIONS } from './codes.js';
import type { BatchMessageCode as BatchMessageCodeValue } from './types.js';

export type MessageLocale = 'ja' | 'en';

type BatchMessageDefinition = (typeof BATCH_MESSAGE_DEFINITIONS)[number];
type BatchMessageKey = BatchMessageDefinition['key'];

const BATCH_MESSAGE_DEFINITION_BY_CODE = new Map<BatchMessageCodeValue, BatchMessageDefinition>(
  BATCH_MESSAGE_DEFINITIONS.map((item) => [item.code, item])
);

export const BatchMessageCode = Object.freeze(
  Object.fromEntries(BATCH_MESSAGE_DEFINITIONS.map((item) => [item.key, item.code])) as Record<BatchMessageKey, string>
) as { readonly [K in BatchMessageKey]: Extract<BatchMessageDefinition, { key: K }>['code'] };

export const getBatchMessageTemplate = (code: BatchMessageCodeValue, locale: MessageLocale): string => {
  const definition = BATCH_MESSAGE_DEFINITION_BY_CODE.get(code);
  if (!definition) {
    throw new Error(`Batch message code not found: ${code}`);
  }
  return definition.message[locale];
};

export const formatMessageTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
