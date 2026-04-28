ARG VARIANT=24.14-bookworm-slim
FROM node:${VARIANT} AS base
LABEL version="1.0.0" 
LABEL description="Web container for MSS App \
See https://turborepo.dev/docs/guides/tools/docker"

WORKDIR /app

ARG TURBO_VERSION=2.6.3
RUN npm install -g \
  corepack \
  turbo@${TURBO_VERSION} \
 && corepack enable

FROM base AS prepare

COPY . .
RUN pnpm turbo prune --scope=web --docker

FROM base AS builder

COPY --from=prepare /app/out/json/ .
# --frozen-lockfile を付けるために完全なロックファイルを使う。
COPY --from=prepare /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prepare /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm turbo build --filter=web

FROM node:${VARIANT} AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Asia/Tokyo

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
