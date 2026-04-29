import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { runHealthCheck } from '@packages/db';
import { MediaType } from '../http/media-type.js';
import { apiLogger as logger } from '../logger.js';
import { ApiMessageCode } from '../messages/codes.js';
import { ApiResponseStatus, errorJson, errorResponseSchema } from '../messages/responses.js';
import { ApiRouteTag } from './tags.js';

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  tags: [ApiRouteTag.System],
  responses: {
    200: {
      description: 'API and DB health check status',
      content: {
        [MediaType.ApplicationJson]: {
          schema: z.object({
            status: z.literal(ApiResponseStatus.Ok),
          }),
        },
      },
    },
    500: {
      description: 'Health check failed (DB query failed)',
      content: {
        [MediaType.ApplicationJson]: {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

export const healthRoutes = new OpenAPIHono();

healthRoutes.openapi(healthRoute, async (c) => {
  try {
    await runHealthCheck();
    return c.json({ status: ApiResponseStatus.Ok }, 200);
  } catch (error) {
    logger.error('health check failed', { error });
    return errorJson(c, 500, ApiMessageCode.FatalInternalError);
  }
});
