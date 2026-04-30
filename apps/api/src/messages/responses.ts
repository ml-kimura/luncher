import { z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiMessageCode } from './types.js';
import { formatMessageTemplate, getApiMessageTemplate, type MessageLocale } from './templates.js';

export enum ApiResponseStatus {
  Ok = 'ok',
  Error = 'error',
}

const baseErrorResponseSchema = z
  .object({
    status: z.literal(ApiResponseStatus.Error),
    code: z.string(),
    message: z.string(),
  })
  .openapi('ErrorResponse');

export type ErrorResponseBody = z.infer<typeof baseErrorResponseSchema>;

const DEFAULT_LOCALE: MessageLocale = 'ja';

const resolveLocale = (): MessageLocale => DEFAULT_LOCALE;

export const buildErrorBody = (code: ApiMessageCode, values: Record<string, string> = {}): ErrorResponseBody => {
  const template = getApiMessageTemplate(code, resolveLocale());
  return {
    status: ApiResponseStatus.Error,
    code,
    message: formatMessageTemplate(template, values),
  };
};

export const errorResponseSchema = (code?: ApiMessageCode, values: Record<string, string> = {}) => {
  if (!code) {
    return baseErrorResponseSchema;
  }
  return z.object({
    status: z.literal(ApiResponseStatus.Error).openapi({
      example: ApiResponseStatus.Error,
    }),
    code: z.string().openapi({
      example: code,
    }),
    message: z.string().openapi({
      example: buildErrorBody(code, values).message,
    }),
  });
};

export const errorJson = <S extends ContentfulStatusCode>(
  c: Context,
  status: S,
  code: ApiMessageCode,
  values: Record<string, string> = {}
) => c.json(buildErrorBody(code, values), status);
