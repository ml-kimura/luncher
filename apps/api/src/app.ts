import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

export const createApp = () => {
  const app = new OpenAPIHono();

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
