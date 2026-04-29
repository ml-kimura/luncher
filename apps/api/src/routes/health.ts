import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { runHealthCheck } from '@packages/db';
import { createLogger } from '@packages/logger';

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
          schema: z.object({
            status: z.literal('error'),
          }),
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
    return c.json({ status: 'error' }, 500);
  }
});
