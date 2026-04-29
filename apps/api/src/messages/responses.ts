import { z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { formatTemplate, loadMessageCatalog, type MessageLocale } from './catalog.js';

export const errorResponseSchema = z
  .object({
    status: z.literal('error'),
    code: z.string(),
    message: z.string(),
  })
  .openapi('ErrorResponse');

export type ErrorResponseBody = z.infer<typeof errorResponseSchema>;

const DEFAULT_LOCALE: MessageLocale = 'ja';

const resolveLocale = (): MessageLocale => DEFAULT_LOCALE;

export const buildErrorBody = (code: string, values: Record<string, string> = {}): ErrorResponseBody => {
  const catalog = loadMessageCatalog();
  const template = catalog.getTemplateByCode(code, resolveLocale());
  return {
    status: 'error',
    code,
    message: formatTemplate(template, values),
  };
};

export const errorJson = <S extends ContentfulStatusCode>(
  c: Context,
  status: S,
  code: string,
  values: Record<string, string> = {}
) => c.json(buildErrorBody(code, values), status);
