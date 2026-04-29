import { OpenAPIHono } from '@hono/zod-openapi';
import { apiLogger as logger } from './logger.js';
import { registerRoutes } from './routes/index.js';

export const createApp = () => {
  const app = new OpenAPIHono();

  app.use('*', async (c, next) => {
    const startedAt = Date.now();
    await next();
    logger.info('request completed', {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - startedAt,
    });
  });

  registerRoutes(app);

  return app;
};
