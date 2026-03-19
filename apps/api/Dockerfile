FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/domain/package.json packages/domain/
COPY packages/ai/package.json packages/ai/
COPY packages/database/package.json packages/database/
COPY packages/graph/package.json packages/graph/
COPY packages/storage/package.json packages/storage/
RUN pnpm install --frozen-lockfile

# --- build ---
FROM deps AS build
COPY . .
RUN pnpm --filter @sagepoint/database db:generate
RUN pnpm --filter @sagepoint/api... build
RUN pnpm deploy --filter @sagepoint/api --prod --legacy /app/prod
RUN cp -r /app/apps/api/dist /app/prod/dist
RUN cp /app/packages/database/prisma/schema.prisma /app/prod/schema.prisma
RUN cd /app/prod && npx prisma generate --schema=schema.prisma && rm schema.prisma

# --- runner (slim = glibc, fewer CVEs, better perf under load than musl) ---
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/prod .
USER node
EXPOSE 3001
CMD ["dumb-init", "node", "dist/main.js"]
