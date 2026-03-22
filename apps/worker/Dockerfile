FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/domain/package.json packages/domain/
COPY packages/ai/package.json packages/ai/
COPY packages/database/package.json packages/database/
COPY packages/graph/package.json packages/graph/
COPY packages/storage/package.json packages/storage/
COPY packages/parsing/package.json packages/parsing/
RUN pnpm install --frozen-lockfile

# --- build ---
FROM deps AS build
COPY . .
RUN pnpm --filter @sagepoint/database db:generate
RUN pnpm --filter @sagepoint/worker^... build
RUN pnpm --filter @sagepoint/worker build
RUN pnpm deploy --filter @sagepoint/worker --prod --legacy /app/prod
RUN cp -r /app/apps/worker/dist /app/prod/dist

# --- runner ---
FROM node:24-alpine AS runner
RUN apk add --no-cache dumb-init fontconfig freetype
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/prod .
USER node
CMD ["dumb-init", "node", "dist/main.js"]
