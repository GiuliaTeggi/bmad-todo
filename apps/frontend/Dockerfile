# ─── Stage 1: Vite Production Build ────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests first (layer-cache: these change rarely)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

# Copy source (changes more frequently)
COPY packages/shared/src ./packages/shared/src
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/index.html ./apps/frontend/
COPY apps/frontend/vite.config.ts ./apps/frontend/
COPY apps/frontend/tsconfig.json ./apps/frontend/

# Build the Vite production bundle
RUN pnpm --filter @bmad-todo/frontend build


# ─── Stage 2: nginx Static Server ──────────────────────────────────────────
FROM nginx:alpine AS serve

COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
