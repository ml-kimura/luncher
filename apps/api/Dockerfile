FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY src ./src
EXPOSE 8787
CMD ["node", "src/index.mjs"]
