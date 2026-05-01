import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { runHealthCheck } from '@packages/db';
import { MediaType } from '../http/media-type.js';
import { apiLogger as logger } from '../logger.js';
import { ApiResponseStatus, errorJson, errorResponseSchema } from '../messages/responses.js';
import { ApiMessageCode } from '../messages/templates.js';
import { commandStatusSchema } from './response-policy.js';
import { withApiKind } from './route-meta.js';
import { ApiRouteTag } from './tags.js';

const healthRoute = createRoute(
  withApiKind(
    {
      method: 'get',
      path: '/health',
      operationId: 'getHealth',
      tags: [ApiRouteTag.System],
      summary: 'ヘルスチェック',
      description: 'サービス稼働と DB 接続を確認',
      responses: {
        200: {
          description: 'API and DB health check status',
          content: {
            [MediaType.ApplicationJson]: {
              schema: commandStatusSchema(),
            },
          },
        },
        500: {
          description: 'Health check failed (DB query failed)',
          content: {
            [MediaType.ApplicationJson]: {
              schema: errorResponseSchema(ApiMessageCode.FatalInternalError),
            },
          },
        },
      },
    },
    'command'
  )
);

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
