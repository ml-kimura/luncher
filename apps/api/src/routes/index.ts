import { OpenAPIHono } from '@hono/zod-openapi';
import { healthRoutes } from './health.js';

export const registerRoutes = (app: OpenAPIHono) => {
  app.route('/', healthRoutes);
};
