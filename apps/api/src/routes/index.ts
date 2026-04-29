import { OpenAPIHono } from '@hono/zod-openapi';
import { healthRoutes } from './health.js';
import { lunchEntryReactionRoutes } from './lunchEntryReaction.js';

export const registerRoutes = (app: OpenAPIHono) => {
  app.route('/', healthRoutes);
  app.route('/internal/events', lunchEntryReactionRoutes);
};
