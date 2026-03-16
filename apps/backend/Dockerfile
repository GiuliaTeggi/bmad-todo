# ─── Stage 1: TypeScript Build ─────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests first (layer-cache: these change rarely)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile

# Copy source (changes more frequently)
COPY packages/shared/src ./packages/shared/src
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/

# Compile TypeScript
RUN pnpm --filter @bmad-todo/backend build

# Copy SQL migration files — tsc does not emit non-TS assets
RUN cp -r apps/backend/src/db/migrations apps/backend/dist/db/migrations

# Bundle production node_modules into /deploy (flat, no pnpm virtual store)
RUN pnpm --filter @bmad-todo/backend deploy --prod /deploy


# ─── Stage 2: Production Runtime ───────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Flat production node_modules from pnpm deploy (no devDependencies)
COPY --from=build /deploy/node_modules ./node_modules

# Compiled server code + migration SQL files
COPY --from=build /app/apps/backend/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
