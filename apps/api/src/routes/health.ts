import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { runHealthCheck } from '@packages/db';
import { createLogger } from '@packages/logger';
import { errorJson, errorResponseSchema } from '../messages/responses.js';

const logger = createLogger({ service: 'api' });

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  tags: ['system'],
  responses: {
    200: {
      description: 'API and DB health check status',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ok'),
          }),
        },
      },
    },
    500: {
      description: 'Health check failed (DB query failed)',
      content: {
        'application/json': {
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
    return c.json({ status: 'ok' }, 200);
  } catch (error) {
    logger.error('health check failed', { error });
    return errorJson(c, 500, 'F-API-001');
  }
});
