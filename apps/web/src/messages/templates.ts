import { WEB_MESSAGE_DEFINITIONS } from './codes.js';
import type { WebMessageCode as WebMessageCodeValue } from './types.js';

export type MessageLocale = 'ja' | 'en';

type WebMessageDefinition = (typeof WEB_MESSAGE_DEFINITIONS)[number];
type WebMessageKey = WebMessageDefinition['key'];

const WEB_MESSAGE_DEFINITION_BY_CODE = new Map<WebMessageCodeValue, WebMessageDefinition>(
  WEB_MESSAGE_DEFINITIONS.map((item) => [item.code, item])
);

export const WebMessageCode = Object.freeze(
  Object.fromEntries(WEB_MESSAGE_DEFINITIONS.map((item) => [item.key, item.code])) as Record<WebMessageKey, string>
) as { readonly [K in WebMessageKey]: Extract<WebMessageDefinition, { key: K }>['code'] };

export const getWebMessageTemplate = (code: WebMessageCodeValue, locale: MessageLocale): string => {
  const definition = WEB_MESSAGE_DEFINITION_BY_CODE.get(code);
  if (!definition) {
    throw new Error(`Web message code not found: ${code}`);
  }
  return definition.message[locale];
};

export const formatMessageTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
