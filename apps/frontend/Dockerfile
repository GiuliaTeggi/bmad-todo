# ─── Stage 1: Vite Production Build ────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests first (layer-cache: these change rarely)
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

RUN npm ci

# Copy source (changes more frequently)
COPY packages/shared/src ./packages/shared/src
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/index.html ./apps/frontend/
COPY apps/frontend/vite.config.ts ./apps/frontend/
COPY apps/frontend/tsconfig.json ./apps/frontend/

# Build the Vite production bundle
RUN npm run build --workspace=apps/frontend


# ─── Stage 2: nginx Static Server ──────────────────────────────────────────
FROM nginx:alpine AS serve

COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Allow the nginx user to write its cache and PID file when running non-root
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80
