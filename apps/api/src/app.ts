import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createLogger } from "@packages/logger";

const logger = createLogger({ service: "api" });

export const createApp = () => {
  const app = new OpenAPIHono();

  app.use("*", async (c, next) => {
    const startedAt = Date.now();
    await next();
    logger.info("request completed", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - startedAt,
    });
  });

  app.get("/", (c) => c.json({ status: "ok", service: "api" }));

  const healthRoute = createRoute({
    method: "get",
    path: "/health",
    operationId: "getHealth",
    tags: ["system"],
    responses: {
      200: {
        description: "API health status",
        content: {
          "application/json": {
            schema: z.object({
              status: z.literal("ok"),
            }),
          },
        },
      },
    },
  });

  app.openapi(healthRoute, (c) => c.json({ status: "ok" }));

  return app;
};
