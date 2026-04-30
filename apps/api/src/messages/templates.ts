import { API_MESSAGE_DEFINITIONS } from './codes.js';
import type { ApiMessageCode as ApiMessageCodeValue } from './types.js';

export type MessageLocale = 'ja' | 'en';

type ApiMessageDefinition = (typeof API_MESSAGE_DEFINITIONS)[number];
type ApiMessageKey = ApiMessageDefinition['key'];

const API_MESSAGE_DEFINITION_BY_CODE = new Map<ApiMessageCodeValue, ApiMessageDefinition>(
  API_MESSAGE_DEFINITIONS.map((item) => [item.code, item])
);

export const ApiMessageCode = Object.freeze(
  Object.fromEntries(API_MESSAGE_DEFINITIONS.map((item) => [item.key, item.code])) as Record<ApiMessageKey, string>
) as { readonly [K in ApiMessageKey]: Extract<ApiMessageDefinition, { key: K }>['code'] };

export const getApiMessageTemplate = (code: ApiMessageCodeValue, locale: MessageLocale): string => {
  const definition = API_MESSAGE_DEFINITION_BY_CODE.get(code);
  if (!definition) {
    throw new Error(`API message code not found: ${code}`);
  }
  return definition.message[locale];
};

export const formatMessageTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
