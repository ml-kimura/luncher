ARG VARIANT=24.14-bookworm-slim
FROM node:${VARIANT} AS base
LABEL version="1.0.0" 
LABEL description="API container for MSS App \
See https://turborepo.dev/docs/guides/tools/docker See https://hono.dev/docs/getting-started/nodejs#building-deployment"

WORKDIR /app

ARG TURBO_VERSION=2.6.3
RUN npm install -g \
  corepack \
  turbo@${TURBO_VERSION} \
 && corepack enable

FROM base AS prepare

COPY . .
RUN pnpm turbo prune --scope=api --docker

FROM base AS builder

COPY --from=prepare /app/out/json/ .
# --frozen-lockfile を付けるために完全なロックファイルを使う。
COPY --from=prepare /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prepare /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=api

FROM node:${VARIANT} AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodejs

# pnpm の解決にルート node_modules（.pnpm 含む）が必要
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=nodejs:nodejs /app/packages/logger ./packages/logger

USER nodejs

ENV NODE_ENV=production
ENV PORT=8787
ENV TZ=Asia/Tokyo

EXPOSE 8787

CMD ["node", "apps/api/dist/index.js"]
