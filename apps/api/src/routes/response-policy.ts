import { z } from '@hono/zod-openapi';
import { ApiResponseStatus } from '../messages/responses.js';

const commandBaseSchema = z.object({
  status: z.literal(ApiResponseStatus.Ok).openapi({
    example: ApiResponseStatus.Ok,
  }),
});

export const commandStatusSchema = () => commandBaseSchema;

export const commandResultSchema = <TResult extends z.ZodTypeAny, TPayload extends z.ZodRawShape>(
  result: TResult,
  payload: TPayload
) =>
  commandBaseSchema.extend({
    result,
    ...payload,
  });

export const resourceSuccessSchema = <TSchema extends z.ZodTypeAny>(resource: TSchema) => resource;
