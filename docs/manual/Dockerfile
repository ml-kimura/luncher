# Build arguments
ARG NODE_VERSION=22
ARG PNPM_VERSION=latest
ARG NGINX_VERSION=alpine

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install pnpm
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION}

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY docs/manual/package.json ./docs/manual/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY docs/manual/ ./docs/manual/

# Build VitePress (static docs)
RUN pnpm --filter @docs/manual build

# Build MCP server (if tsconfig.build.json exists)
RUN if [ -f docs/manual/tsconfig.build.json ]; then \
      pnpm --filter @docs/manual run build:server 2>/dev/null || true; \
    fi

# Production stage
# Production stage
ARG NGINX_VERSION=alpine
FROM nginx:${NGINX_VERSION}

# Copy nginx config
COPY docs/nginx.conf /etc/nginx/nginx.conf

# Copy built VitePress site
COPY --from=builder /app/docs/manual/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
