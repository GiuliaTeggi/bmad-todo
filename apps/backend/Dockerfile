# ─── Stage 1: TypeScript Build ─────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests first (layer-cache: these change rarely)
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

RUN npm ci

# Copy source (changes more frequently)
COPY packages/shared/src ./packages/shared/src
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/

# Compile TypeScript
RUN npm run build --workspace=apps/backend

# Copy SQL migration files — tsc does not emit non-TS assets
RUN cp -r apps/backend/src/db/migrations apps/backend/dist/db/migrations


# ─── Stage 2: Production Runtime ───────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Copy workspace manifests and install production dependencies only
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

RUN npm ci --omit=dev

# Compiled server code + migration SQL files
COPY --from=build /app/apps/backend/dist ./dist

# Tell Node.js that dist/ contains ES modules (avoids reparsing warning)
RUN echo '{"type":"module"}' > dist/package.json

ENV NODE_ENV=production

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
