---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: complete
completedAt: "2026-03-10"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-bmad-todo-2026-03-10.md"
workflowType: "architecture"
project_name: "bmad-todo"
user_name: "Giulia"
date: "2026-03-10"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (25 total):**
Organized into 7 categories: Todo Management (FR1–FR6), Data Persistence (FR7–FR9), Optimistic UI (FR10–FR13), Feedback & States (FR14–FR16), Accessibility & Responsive Design (FR17–FR21), API & Backend (FR22–FR24), and Deployment (FR25).

The single most architecturally significant constraint is the **optimistic UI pattern** (FR10–FR13): all three mutation operations must update the UI immediately and roll back on server failure. This drives the choice of client-side state management and the structure of the API layer.

**Non-Functional Requirements:**

- Performance: 2s initial load; API responses ≤500ms; UI mutations are perceived as instant via optimistic updates
- Security: OWASP Top 10 compliance; all inputs validated and sanitised server-side; no internal errors exposed in API responses
- Accessibility: WCAG 2.1 AA — zero critical violations; full keyboard operability; ARIA on all meaningful elements
- Reliability: No silent data loss; graceful error handling with user notification; consistent frontend/backend state after any operation

**Scale & Complexity:**

- Primary domain: Full-stack web (SPA + REST API)
- Complexity level: Low — standard CRUD, single user, no real-time collaboration, bounded dataset
- Estimated architectural components: 4–5 (frontend SPA, REST API server, persistence layer, shared type contracts, Docker Compose orchestration)

### Technical Constraints & Dependencies

- **TypeScript full-stack** — shared type contracts between frontend and backend are an expected standard
- **Fastify backend** — called out explicitly in the product brief; schema-driven validation aligns with FR23 (validate all incoming data)
- **Docker Compose deployment** — containerisation is a hard requirement from day one, not a post-build operation (FR25)
- **No auth in v1** — architecture must remain auth-ready (door open for future multi-user) without implementing it now
- **No SSR required** — client-side rendering is sufficient per PRD technical context

### Cross-Cutting Concerns Identified

- **Optimistic state management & rollback** — affects every mutation in the frontend layer
- **Error handling & user feedback** — all API failures must surface to the user; no silent failures at any layer
- **Input validation** — must occur server-side (FR23); frontend validation is UX-only
- **Accessibility** — WCAG 2.1 AA compliance affects every interactive component; focus management after dynamic changes (FR17–FR21)
- **Security** — input sanitisation and OWASP compliance span both frontend (XSS prevention) and backend (injection, error detail leakage)
- **Typed API contracts** — a shared type/schema layer between frontend and backend reduces implementation conflicts
- **Testability** — ≥70% unit/integration coverage + ≥5 Playwright E2E tests requires architecture that supports both levels of testing from the start

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (SPA + REST API) — TypeScript throughout.

### Starter Options Considered

| Option                        | Frontend            | Backend        | Monorepo Layer           |
| ----------------------------- | ------------------- | -------------- | ------------------------ |
| **pnpm workspaces + Vite** ✅ | Vite 6 + React + TS | Fastify 5 + TS | pnpm workspaces (native) |
| Nx monorepo                   | Vite + React + TS   | Fastify + TS   | Nx                       |
| Turborepo                     | Vite + React + TS   | Fastify + TS   | Turborepo                |

### Selected Approach: pnpm workspaces monorepo

**Rationale:**

- Fastify is a fixed constraint from the product brief — well-suited for a schema-validated, high-performance REST API
- Vite + React + TypeScript is the industry standard for fast, modern SPAs without SSR overhead (SSR is explicitly not required)
- pnpm workspaces provides shared TypeScript type contracts between frontend and backend with zero additional tooling
- Nx and Turborepo offer value at scale; for a 2-app monorepo with a reference-quality mandate, simpler is better

**Initialization Commands:**

```bash
# Bootstrap workspace
mkdir bmad-todo && cd bmad-todo
pnpm init
# Add pnpm-workspace.yaml with packages: [apps/*, packages/*]

# Frontend SPA
pnpm create vite@latest apps/frontend -- --template react-ts

# Backend (scaffolded manually)
mkdir -p apps/backend && cd apps/backend && pnpm init
pnpm add fastify @fastify/cors fastify-type-provider-zod zod
pnpm add -D typescript tsx @types/node

# Shared types package
mkdir -p packages/shared && cd packages/shared && pnpm init
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript throughout (strict mode); Node.js runtime for backend; browser runtime for frontend.

**Frontend Tooling (Vite 6 + React 19 + TS):**

- ESBuild-powered dev server (near-instant HMR)
- Rollup-based production build
- PostCSS pipeline ready; CSS Modules or plain CSS
- Vitest for frontend unit/integration tests (co-located with Vite config)
- Playwright installed separately for E2E

**Backend Framework (Fastify 5 + Zod):**

- Schema-driven request validation via `fastify-type-provider-zod` (aligns with FR23)
- `@fastify/cors` for cross-origin API access during development
- `tsx` for TypeScript execution in development (no compile step in dev)
- **Node.js built-in test runner (`node:test`)** for backend unit/integration tests — zero additional test dependencies

**Shared Package:**

- `packages/shared` exposes TypeScript types for API request/response contracts
- Both frontend and backend import from `@bmad-todo/shared` — single source of truth for the API surface

**Testing Infrastructure:**

- Frontend unit/integration: Vitest
- Backend unit/integration: `node:test` (Node.js built-in test runner)
- E2E: Playwright (configured against the running SPA + API)

**Docker Compose:**

- `apps/frontend/Dockerfile` (multi-stage: build → serve via nginx)
- `apps/backend/Dockerfile` (multi-stage: build → node production)
- `docker-compose.yml` at workspace root — single `docker-compose up` command

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Database: PostgreSQL + Drizzle ORM
- Frontend state & data fetching: TanStack Query v5
- API design: REST with standard conventions
- Deployment: Docker Compose (frontend + backend + database)

**Important Decisions (Shape Architecture):**

- No client-side router — single-screen SPA
- Shared TypeScript types via `packages/shared`
- Zod schemas as single source of truth for API validation and type inference

**Deferred Decisions (Post-MVP):**

- Authentication strategy (JWT / session-based) — architecture leaves this door open
- Multi-user data isolation
- Environment-specific CORS configuration hardening

---

### Data Architecture

**Database: PostgreSQL (latest stable)**

- Rationale: Production-grade reference value; mirrors patterns real teams use; Docker Compose naturally accommodates a `db` service
- Deployed as a separate container in Docker Compose; backend connects via environment variable `DATABASE_URL`
- Auth-ready: schema designed with a nullable `user_id` column placeholder so adding multi-user in future requires additive migration only

**Query Layer: Drizzle ORM**

- TypeScript-first, schema-defined; zero-overhead query builder with full type inference
- Drizzle Kit manages migrations (`drizzle-kit generate` / `drizzle-kit migrate`)
- Schema defined in `apps/backend/src/db/schema.ts` — single source of truth for the database shape

**Data Validation:**

- Zod schemas define the API contract (request/response shapes)
- `fastify-type-provider-zod` wires Zod directly into Fastify's schema validation pipeline
- Drizzle schema and Zod schemas are kept separate; Zod types exported via `packages/shared` for frontend consumption
- No raw user input ever reaches the database without passing through Zod validation first

**Migration Approach:**

- Drizzle Kit generates SQL migration files committed to the repository
- Migrations run automatically on container startup via an init script

---

### Authentication & Security

**v1: No authentication** — single-user, no login required

- Architecture is auth-ready: API routes structured so an auth middleware layer can be inserted without restructuring (e.g., Fastify hooks at the plugin level)
- Future: JWT-based authentication via `@fastify/jwt` is the expected path

**Security Baseline (v1):**

- All request bodies validated by Zod before any processing (FR23) — guards against injection
- Fastify never returns stack traces or internal DB errors in API responses (NFR: no internal error leakage)
- `@fastify/helmet` adds standard HTTP security headers
- Content-Security-Policy set to restrict script sources (XSS mitigation)
- Dependencies managed via pnpm lockfile; no `*` version ranges

---

### API & Communication Patterns

**API Style: REST over HTTP/JSON**

| Operation       | Method   | Path             |
| --------------- | -------- | ---------------- |
| List all todos  | `GET`    | `/api/todos`     |
| Create todo     | `POST`   | `/api/todos`     |
| Toggle complete | `PATCH`  | `/api/todos/:id` |
| Delete todo     | `DELETE` | `/api/todos/:id` |

**Error Response Format:**

```json
{
  "error": {
    "message": "Human-readable message",
    "code": "MACHINE_READABLE_CODE"
  }
}
```

- No stack traces, no internal DB error strings exposed (OWASP)
- HTTP status codes used correctly (200, 201, 400, 404, 500)

**API Versioning:** None in v1 — single consumer (the frontend), no external API users

**CORS:** Permissive in development; restricted to the frontend origin in production via `FRONTEND_ORIGIN` environment variable

---

### Frontend Architecture

**Rendering: Client-side SPA (no SSR)**

- Vite 6 + React 19 + TypeScript strict mode
- No client-side router — application renders a single screen; no navigation required

**State & Data Fetching: TanStack Query v5**

- All server state managed by TanStack Query: loading, error, and success states handled declaratively
- Optimistic updates via `useMutation` with `onMutate` (apply optimistic change), `onError` (rollback to previous state), `onSettled` (re-sync with server) — covers FR10–FR13 completely
- Query invalidation on successful mutations keeps the list consistent with server state

**Component Structure:**

- Flat, feature-co-located: `src/components/TodoList`, `src/components/TodoItem`, `src/components/AddTodoForm`
- No global state library needed — TanStack Query is the sole source of truth for server data; local UI state (input values, focus) stays in component state

**Styling:**

- Plain CSS with CSS custom properties for theming — no build-time CSS framework dependency
- Mobile-first responsive layout; touch targets ≥44×44px (WCAG 2.5.5)

**Accessibility:**

- ARIA live regions announce dynamic list changes to screen readers
- Focus managed explicitly after create (input cleared and refocused) and delete (focus moved to next item or input)
- Colour contrast verified against WCAG AA at design time

---

### Infrastructure & Deployment

**Docker Compose Services:**

```
frontend   — nginx serving the Vite production build (port 80)
backend    — Node.js Fastify API (port 3000)
db         — PostgreSQL (port 5432, internal only)
```

- Frontend container: multi-stage Dockerfile (node:alpine build → nginx:alpine serve)
- Backend container: multi-stage Dockerfile (node:alpine build → production node)
- `db` service uses a named volume for data persistence across `docker-compose down/up`
- Environment variables: `DATABASE_URL`, `FRONTEND_ORIGIN`, `NODE_ENV` — no secrets hardcoded

**Local Development (without Docker):**

- `pnpm dev` in workspace root starts frontend (Vite) and backend (tsx watch) concurrently
- Local `.env` file for `DATABASE_URL` pointing to a local Postgres instance or Docker-started db service

**No CI/CD in v1** — personal project, no remote deployment target. Quality bar (tests, linting) enforced by pre-commit hooks (Husky + lint-staged) or run manually.

---

### Decision Impact Analysis

**Implementation Sequence:**

1. Workspace scaffold (pnpm workspaces, `packages/shared`, tsconfigs)
2. Backend: Fastify server, Drizzle schema, PostgreSQL connection, migrations
3. Backend: REST API endpoints with Zod validation
4. Backend: `node:test` test suite
5. Frontend: Vite React app, TanStack Query setup, components
6. Frontend: Optimistic update mutations for all three operations
7. Frontend: Vitest unit tests
8. Docker Compose: Dockerfiles + compose file + startup validation
9. Playwright: E2E test suite (≥5 scenarios)

**Cross-Component Dependencies:**

- `packages/shared` must be defined before frontend or backend can use typed API contracts
- PostgreSQL schema (Drizzle) must be stable before API endpoints are implemented
- API endpoints must be stable before frontend mutations and Playwright tests are written

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

9 areas where AI agents could diverge without explicit rules: database naming, API naming, TypeScript file naming, test placement, API response shape, error format, date/null handling, optimistic update implementation, and import path conventions.

---

### Naming Patterns

**Database Naming Conventions (Drizzle schema):**

- Table names: `snake_case` plural — e.g., `todos`
- Column names: `snake_case` — e.g., `created_at`, `is_completed`
- Primary key: always `id`
- Foreign keys: `{table_singular}_id` — e.g., `user_id` (for future auth)

**API Naming Conventions:**

- Resource paths: lowercase plural nouns — `/api/todos`, `/api/todos/:id`
- Route parameters: `:id` (Fastify convention)
- Query parameters: `camelCase` — e.g., `?pageSize=10`
- No trailing slashes on any route

**Code Naming Conventions:**

- TypeScript files: `camelCase.ts` for utilities/services, `PascalCase.tsx` for React components
- React components: `PascalCase` — e.g., `TodoItem`, `AddTodoForm`
- Hooks: `useCamelCase` — e.g., `useTodos`, `useCreateTodo`
- Functions/variables: `camelCase` throughout
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants
- Zod schemas: `camelCase` with `Schema` suffix — e.g., `createTodoSchema`, `todoSchema`

---

### Structure Patterns

**Project Organization:**

```
apps/backend/src/
  routes/         — Fastify route plugins (one file per resource)
  db/
    schema.ts     — Drizzle table definitions
    migrations/   — Generated SQL migration files
    index.ts      — DB connection instance
  plugins/        — Fastify plugins (cors, helmet, etc.)
  types/          — Backend-only types not in shared package
  app.ts          — Fastify app factory (no listen() call — for testability)
  server.ts       — Entry point (calls app.ts, calls listen())

apps/frontend/src/
  components/     — React components (one file per component)
  hooks/          — TanStack Query hooks (useTodos, useCreateTodo, etc.)
  api/            — Raw fetch functions (called by hooks, not components)
  types/          — Frontend-only types
  main.tsx        — Entry point
  App.tsx         — Root component
```

**Test File Placement:**

- Backend: co-located alongside source — `routes/todos.test.ts` next to `routes/todos.ts`
- Frontend: co-located alongside source — `components/TodoItem.test.tsx` next to `TodoItem.tsx`
- E2E: `apps/frontend/e2e/` — Playwright tests isolated from unit tests

**Shared Package:**

```
packages/shared/src/
  types.ts        — TypeScript interfaces for API request/response bodies
  index.ts        — Re-exports everything
```

---

### Format Patterns

**API Response Format:**

- Success responses return the resource or array directly — no wrapper envelope:
  - `GET /api/todos` → `[{ id, text, isCompleted, createdAt }]`
  - `POST /api/todos` → `{ id, text, isCompleted, createdAt }`
  - `PATCH /api/todos/:id` → `{ id, text, isCompleted, createdAt }`
  - `DELETE /api/todos/:id` → `204 No Content` (empty body)
- Rationale: wrappers add ceremony for a single-consumer API

**Error Response Format:**

```json
{
  "error": {
    "message": "Human-readable description",
    "code": "SNAKE_CASE_CODE"
  }
}
```

- Error codes: `TODO_NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`
- HTTP status: 400 (validation), 404 (not found), 500 (server error)
- Never expose: stack traces, SQL error messages, internal identifiers

**Data Field Naming in JSON:**

- All JSON fields use `camelCase` — e.g., `isCompleted`, `createdAt`
- Drizzle maps `snake_case` DB columns → `camelCase` in query results via column aliases
- Dates: ISO 8601 strings (`2026-03-10T12:00:00.000Z`) — never Unix timestamps

**Null Handling:**

- Omit optional fields if null rather than returning `null` — keeps payloads clean
- Exception: fields the frontend must explicitly handle may be `null`

---

### Communication Patterns

**TanStack Query Conventions:**

- Query keys: array form with resource name first — `['todos']`, `['todos', id]`
- One custom hook per operation: `useTodos()`, `useCreateTodo()`, `useToggleTodo()`, `useDeleteTodo()`
- Hooks live in `src/hooks/` — components never call `fetch` directly
- `api/todos.ts` contains the raw fetch functions; hooks import from there

**Optimistic Update Pattern (mandatory for all mutations):**

```ts
useMutation({
  mutationFn: ...,
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previous = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], /* apply optimistic change */)
    return { previous }
  },
  onError: (_err, _variables, context) => {
    queryClient.setQueryData(['todos'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

All three mutations (create, toggle, delete) MUST follow this exact pattern.

---

### Process Patterns

**Error Handling:**

- Backend: all route handlers wrapped in try/catch; errors mapped to the standard error format before `reply.send()`
- Frontend: TanStack Query `onError` callback handles mutation failures; `isError` state on `useQuery` handles fetch failures
- User-facing errors: displayed inline near the affected component for mutations; banner for initial fetch failure
- Console logging: `console.error` in development for debugging; no user-visible technical details ever

**Loading State Patterns:**

- Initial fetch: show a skeleton/spinner using TanStack Query `isPending` on `useQuery`
- Mutations: UI updates optimistically — no per-mutation loading spinner needed
- No global loading state — all loading is local to the component that triggered it

**Input Validation Timing:**

- Server-side: all inputs validated by Zod on every request (always, not just in dev)
- Frontend: minimal UX validation only (e.g., prevent submitting empty todo text) — not a substitute for server validation

---

### Enforcement Guidelines

**All AI Agents MUST:**

- Use `camelCase` for all JSON fields and TypeScript identifiers
- Use `snake_case` for all database column names in Drizzle schema
- Return errors in the `{ error: { message, code } }` format — never raw Error objects
- Implement all three mutations with the full `onMutate` / `onError` / `onSettled` pattern
- Never call `fetch` directly from a React component — always via a hook in `src/hooks/`
- Never expose internal error details (stack traces, SQL errors) in API responses
- Place tests co-located with source files (not in a separate `__tests__` directory)
- Import from `@bmad-todo/shared` for shared types — never duplicate type definitions

**Anti-Patterns to Avoid:**

- ❌ `PascalCase` or `snake_case` JSON fields in API responses
- ❌ Returning `{ data: {...} }` envelopes from the REST API
- ❌ Calling `queryClient.invalidateQueries` without also handling `onMutate` rollback
- ❌ `console.log` left in production code
- ❌ Hardcoded `DATABASE_URL` or other secrets in source files
- ❌ Duplicating shared types between frontend and backend instead of using `packages/shared`

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad-todo/
├── README.md
├── package.json                        # Workspace root — scripts only, no dependencies
├── pnpm-workspace.yaml                 # Declares apps/* and packages/*
├── .gitignore
├── .env.example                        # Documents required env vars (no secrets)
├── docker-compose.yml                  # Orchestrates frontend + backend + db
│
├── apps/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts              # Vite + Vitest config
│   │   ├── index.html
│   │   ├── Dockerfile                  # Multi-stage: build → nginx:alpine
│   │   ├── nginx.conf                  # Serves SPA + proxies /api to backend
│   │   ├── playwright.config.ts
│   │   ├── e2e/
│   │   │   ├── todos.spec.ts           # ≥5 Playwright E2E scenarios
│   │   │   └── fixtures/
│   │   │       └── index.ts
│   │   └── src/
│   │       ├── main.tsx                # React entry point
│   │       ├── App.tsx                 # Root component — renders TodoApp
│   │       ├── App.css                 # Global styles + CSS custom properties
│   │       ├── api/
│   │       │   └── todos.ts            # Raw fetch functions (getTodos, createTodo, etc.)
│   │       ├── components/
│   │       │   ├── TodoApp.tsx         # Top-level layout + QueryClientProvider
│   │       │   ├── TodoApp.test.tsx
│   │       │   ├── TodoList.tsx        # Renders list, loading, empty, error states
│   │       │   ├── TodoList.test.tsx
│   │       │   ├── TodoItem.tsx        # Single todo row — toggle + delete
│   │       │   ├── TodoItem.test.tsx
│   │       │   ├── AddTodoForm.tsx     # Controlled input + submit
│   │       │   ├── AddTodoForm.test.tsx
│   │       │   ├── ErrorMessage.tsx    # Reusable inline error display
│   │       │   └── LoadingSpinner.tsx
│   │       └── hooks/
│   │           ├── useTodos.ts         # useQuery — fetches todo list
│   │           ├── useTodos.test.ts
│   │           ├── useCreateTodo.ts    # useMutation + optimistic create
│   │           ├── useCreateTodo.test.ts
│   │           ├── useToggleTodo.ts    # useMutation + optimistic toggle
│   │           ├── useToggleTodo.test.ts
│   │           ├── useDeleteTodo.ts    # useMutation + optimistic delete
│   │           └── useDeleteTodo.test.ts
│   │
│   └── backend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile                  # Multi-stage: build → node:alpine production
│       └── src/
│           ├── server.ts               # Entry point — calls app(), calls listen()
│           ├── app.ts                  # Fastify app factory (exported for tests)
│           ├── plugins/
│           │   ├── cors.ts             # @fastify/cors — env-driven origin config
│           │   ├── helmet.ts           # @fastify/helmet — security headers
│           │   └── db.ts               # Drizzle + pg pool — registered as Fastify plugin
│           ├── routes/
│           │   ├── todos.ts            # GET /api/todos, POST /api/todos
│           │   ├── todos.test.ts
│           │   ├── todo.ts             # PATCH /api/todos/:id, DELETE /api/todos/:id
│           │   └── todo.test.ts
│           └── db/
│               ├── schema.ts           # Drizzle table definitions
│               ├── index.ts            # Drizzle + pg pool instance (exported)
│               └── migrations/         # SQL files generated by drizzle-kit
│                   └── 0000_init.sql
│
└── packages/
    └── shared/
        ├── package.json                # name: "@bmad-todo/shared"
        ├── tsconfig.json
        └── src/
            ├── types.ts                # Todo, CreateTodoRequest, UpdateTodoRequest
            └── index.ts                # Re-exports from types.ts
```

### Architectural Boundaries

**API Boundaries:**

| Boundary           | In                                                           | Out                                                   |
| ------------------ | ------------------------------------------------------------ | ----------------------------------------------------- |
| Frontend → Backend | HTTP/JSON to `/api/*` (nginx proxy in Docker; direct in dev) | Typed responses from `@bmad-todo/shared`              |
| Backend → Database | Drizzle ORM queries via pg pool                              | Typed row objects via Drizzle schema                  |
| Request entry      | Fastify route plugin (`routes/todos.ts`)                     | Validated + typed via Zod + fastify-type-provider-zod |
| Error exit         | Any caught error                                             | Mapped to `{ error: { message, code } }` — never raw  |

**Component Boundaries (Frontend):**

- `TodoApp` owns the `QueryClientProvider` — no other component touches TanStack Query setup
- `components/` are presentational — they receive props or call hooks; they never call `fetch` directly
- `hooks/` own all server state — they call functions from `api/todos.ts`
- `api/todos.ts` owns all HTTP details — URL construction, headers, JSON parsing

**Data Boundaries:**

- `packages/shared/src/types.ts` is the contract — both sides import from here; neither defines their own copy
- Drizzle `schema.ts` is the DB source of truth — `packages/shared` types are derived from API shapes, not DB shapes directly
- The `db/` module is only imported by `plugins/db.ts` — routes access the DB via the Fastify instance (`request.server.db`), never by importing the pool directly

---

### Requirements to Structure Mapping

**FR Category → Location:**

| FR Category                            | Files                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Todo Management (FR1–FR6)              | `components/TodoList.tsx`, `components/TodoItem.tsx`, `routes/todos.ts`                   |
| Data Persistence (FR7–FR9)             | `db/schema.ts`, `db/migrations/`, `plugins/db.ts`                                         |
| Optimistic UI (FR10–FR13)              | `hooks/useCreateTodo.ts`, `hooks/useToggleTodo.ts`, `hooks/useDeleteTodo.ts`              |
| Feedback & States (FR14–FR16)          | `components/LoadingSpinner.tsx`, `components/ErrorMessage.tsx`, `hooks/useTodos.ts`       |
| Accessibility & Responsive (FR17–FR21) | `App.css`, all `components/*.tsx` (ARIA attrs inline)                                     |
| API & Backend (FR22–FR24)              | `routes/todos.ts`, `routes/todo.ts`, `plugins/`                                           |
| Deployment (FR25)                      | `docker-compose.yml`, `apps/frontend/Dockerfile`, `apps/backend/Dockerfile`, `nginx.conf` |

**Cross-Cutting Concerns → Location:**

| Concern          | Location                                                          |
| ---------------- | ----------------------------------------------------------------- |
| Input validation | `routes/todos.ts` + `routes/todo.ts` via Zod schemas              |
| Security headers | `plugins/helmet.ts`                                               |
| CORS policy      | `plugins/cors.ts`                                                 |
| Shared types     | `packages/shared/src/types.ts`                                    |
| Error format     | Enforced in every route handler catch block                       |
| Accessibility    | CSS custom properties in `App.css`; ARIA inline in each component |

---

### Integration Points

**Internal Communication:**

- Frontend hooks → `api/todos.ts` functions → `fetch('/api/todos')`
- nginx (`nginx.conf`) proxies `/api/*` → `backend:3000` inside Docker network
- Backend routes → `request.server.db` (Drizzle instance) → PostgreSQL

**Data Flow (Create Todo example):**

```
AddTodoForm (submit)
  → useCreateTodo.onMutate  (optimistic: add to cache)
  → api/todos.ts createTodo()  (POST /api/todos)
    → Fastify route validates with Zod
    → Drizzle INSERT into todos table
    → Returns new Todo row
  → onSettled: invalidate ['todos'] query
  → useTodos re-fetches → list synced with server
  // On failure: onError restores previous cache
```

**External Integrations:** None in v1.

---

### Development Workflow

**Local development:**

```bash
pnpm dev          # workspace root — starts frontend (Vite) + backend (tsx watch) concurrently
pnpm test         # runs all unit/integration tests (Vitest + node:test)
pnpm test:e2e     # runs Playwright against locally running app
```

**Docker:**

```bash
docker-compose up --build   # full stack: frontend + backend + postgres
```

**Database migrations:**

```bash
pnpm --filter backend drizzle-kit generate   # generate migration from schema diff
pnpm --filter backend drizzle-kit migrate    # apply pending migrations
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible. Vite 6 + React 19 + TanStack Query v5 form a coherent frontend layer. Fastify 5 + fastify-type-provider-zod + Drizzle ORM + PostgreSQL form a coherent backend layer. pnpm workspaces connects them with zero additional tooling. No version conflicts identified.

**Pattern Consistency:**
The mandatory optimistic update hook pattern directly implements the TanStack Query v5 API. The `app.ts` factory (no `listen()`) is the standard Fastify testability pattern enabling `node:test` route tests. The `request.server.db` access enforces the data boundary decision. Naming conventions (camelCase JSON, snake_case DB, PascalCase components) are internally consistent with no contradictions.

**Structure Alignment:**
The project structure directly supports every architectural decision: `plugins/` for Fastify extensibility (auth-ready path), `hooks/` + `api/` separation for the fetch boundary, `packages/shared` for typed contracts, co-located tests for coverage requirements.

---

### Requirements Coverage Validation ✅

**Functional Requirements (all 25 covered):**

| FR Category                            | Architectural Coverage                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Todo Management (FR1–FR6)              | `TodoList`, `TodoItem`, `AddTodoForm` components + `GET/POST/PATCH/DELETE` routes    |
| Data Persistence (FR7–FR9)             | PostgreSQL + Drizzle + named Docker volume for cross-session persistence             |
| Optimistic UI (FR10–FR13)              | Mandatory `onMutate`/`onError`/`onSettled` hook pattern — all three mutations        |
| Feedback & States (FR14–FR16)          | `LoadingSpinner` (isPending), `ErrorMessage` (isError), TanStack Query state         |
| Accessibility & Responsive (FR17–FR21) | ARIA inline per component, mobile-first CSS, 44×44px touch targets, focus management |
| API & Backend (FR22–FR24)              | Fastify routes, Zod schema validation, standardized error response format            |
| Deployment (FR25)                      | `docker-compose.yml` + two multi-stage Dockerfiles + nginx reverse proxy             |

**Non-Functional Requirements:**

- Performance ✅ — Vite optimised build, nginx static serving, optimistic UI = zero perceived latency for mutations; 2s initial load achievable with lean bundle
- Security ✅ — `@fastify/helmet` headers, Zod validation on every request, no error detail leakage, no hardcoded secrets, pnpm lockfile
- Accessibility ✅ — WCAG 2.1 AA: ARIA, keyboard focus management, CSS contrast properties
- Reliability ✅ — TanStack Query rollback pattern prevents silent data loss; error format standard prevents unhandled states

---

### Gap Analysis Results

**Critical Gaps:** None — no blocking implementation gaps identified.

**Minor Gaps Resolved:**

- **Primary key type**: `todos.id` → integer auto-increment (`serial` in PostgreSQL). Simple, sequential, sufficient for a single-user app.
- **Concurrency tool for `pnpm dev`**: Use `concurrently` package at workspace root to start Vite and `tsx watch` in parallel.
- **Drizzle column types**: `id serial PRIMARY KEY`, `text text NOT NULL`, `is_completed boolean NOT NULL DEFAULT false`, `created_at timestamp NOT NULL DEFAULT now()` — to be confirmed in schema implementation story.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low — standard CRUD, single user)
- [x] Technical constraints identified (Fastify, TypeScript, Docker Compose)
- [x] Cross-cutting concerns mapped (9 identified and addressed)

**✅ Architectural Decisions**

- [x] Critical decisions documented (PostgreSQL, Drizzle, TanStack Query, no router)
- [x] Technology stack fully specified
- [x] Integration patterns defined (REST, nginx proxy, shared types)
- [x] Security considerations addressed (helmet, Zod, OWASP baseline)

**✅ Implementation Patterns**

- [x] Naming conventions established (camelCase JSON, snake_case DB, PascalCase components)
- [x] Structure patterns defined (co-located tests, hooks/api separation)
- [x] Optimistic update pattern specified with exact code template
- [x] Error handling and loading state patterns documented
- [x] Anti-patterns explicitly listed

**✅ Project Structure**

- [x] Complete directory structure defined (down to individual files)
- [x] Component boundaries established
- [x] Integration points mapped (nginx proxy, `request.server.db`)
- [x] All FR categories mapped to specific files

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High** — low-complexity project, well-understood stack, all decisions made, all patterns specified.

**Key Strengths:**

- Optimistic UI pattern fully specified with code template — highest-risk area de-risked
- Auth-ready without over-engineering: `plugins/` extension point + nullable `user_id` placeholder for future migration
- Shared types package prevents the most common full-stack type drift
- `app.ts` factory pattern makes backend fully testable without a live network connection
- No unnecessary abstractions for a low-complexity project

**Areas for Future Enhancement (Post-MVP):**

- Add `@fastify/jwt` plugin for authentication
- Add `user_id` FK migration when multi-user is needed
- Consider rate limiting (`@fastify/rate-limit`) before any public exposure
- CI/CD pipeline (GitHub Actions) if the project moves beyond personal use

---

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented — do not introduce alternative patterns
- Use the mandatory optimistic update hook template for all three mutations
- Never call `fetch` directly from a React component — always via `src/hooks/`
- Never duplicate types from `packages/shared` — import from `@bmad-todo/shared`
- Place tests co-located with source — not in a separate `__tests__` directory
- Never expose internal error details in API responses

**First Implementation Priority:**

```bash
# Step 1: Scaffold the monorepo workspace
mkdir bmad-todo && cd bmad-todo
pnpm init
# Create pnpm-workspace.yaml, root tsconfig, .gitignore, .env.example
# Then scaffold apps/frontend, apps/backend, packages/shared
```
