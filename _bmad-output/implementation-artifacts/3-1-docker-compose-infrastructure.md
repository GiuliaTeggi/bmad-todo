# Story 3.1: Docker Compose Infrastructure

Status: done

## Story

As a developer,
I want a single `docker-compose up` command to start the frontend, backend, and database with no manual setup,
So that the full application stack can be run by anyone from a clean checkout.

## Acceptance Criteria

1. **Given** a clean checkout with Docker installed **When** `docker-compose up` is run from the workspace root **Then** all three services start: `frontend` (port 80), `backend` (port 3000 internal), `db` (PostgreSQL, internal only) **And** the frontend is accessible in a browser at `http://localhost`.

2. **Given** the Docker Compose setup **When** the `backend` service starts **Then** database migrations run automatically before the API begins accepting requests **And** the backend connects to `db` using the `DATABASE_URL` environment variable.

3. **Given** `docker-compose down` followed by `docker-compose up` **When** the stack restarts **Then** all previously created todos are still present (named volume persists PostgreSQL data) (FR7, FR8).

4. **Given** the `frontend` Dockerfile **When** inspected **Then** it is multi-stage: `node:22-alpine` build stage producing a Vite production build, served by `nginx:alpine` **And** `nginx.conf` proxies `/api/*` requests to the `backend` service.

5. **Given** the `backend` Dockerfile **When** inspected **Then** it is multi-stage: `node:22-alpine` build stage compiling TypeScript, running in a lean production `node:22-alpine` image.

6. **Given** the `.env.example` file **When** inspected **Then** it documents all required environment variables (`DATABASE_URL`, `FRONTEND_ORIGIN`, `NODE_ENV`) **And** no secrets or real credentials are hardcoded anywhere in the repository (NFR4).

## Implementation Notes

- `docker-compose.yml` at workspace root — 3 services: `db`, `backend`, `frontend`
- `db` service: `postgres:17-alpine` with named volume `postgres_data` for persistence; healthcheck via `pg_isready` ensures backend waits for DB before starting
- `backend` service: built with `context: .` (workspace root) so multi-stage Dockerfile can access all monorepo packages; `DATABASE_URL` and `FRONTEND_ORIGIN` set via environment; `depends_on: db: condition: service_healthy`
- `frontend` service: static Vite build served by `nginx:alpine` on port 80; port 80 is the only externally exposed port
- `apps/backend/Dockerfile` multi-stage:
  - Stage `build`: installs all deps, compiles TypeScript, copies SQL migration files to `dist/db/migrations/` (tsc doesn't copy non-TS files), runs `pnpm deploy --prod` to produce a flat production node_modules
  - Stage `production`: copies flat `node_modules` from deploy + compiled `dist/`; no pnpm required at runtime; `CMD ["node", "dist/server.js"]`
- `apps/frontend/Dockerfile` multi-stage:
  - Stage `build`: installs deps, runs `vite build`
  - Stage `serve` (nginx:alpine): copies `dist/` to nginx html root + `nginx.conf`
- `apps/frontend/nginx.conf`: proxies all `/api/` requests to `http://backend:3000`; SPA fallback with `try_files $uri $uri/ /index.html`
- `.env.example`: already documented `DATABASE_URL`, `FRONTEND_ORIGIN`, `NODE_ENV`
- No secrets hardcoded — credentials in docker-compose are for local development only (default postgres user/pass on a local container)
- `.dockerignore` at workspace root to exclude `node_modules/`, `dist/`, coverage, and test artefacts from build context
