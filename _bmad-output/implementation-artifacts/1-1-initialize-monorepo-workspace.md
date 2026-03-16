# Story 1.1: Initialize Monorepo Workspace

Status: done

## Story

As a developer,
I want a working pnpm workspaces monorepo with a shared TypeScript types package,
so that I can build the frontend and backend with shared, type-safe API contracts from the start.

## Acceptance Criteria

1. **Given** a clean checkout **When** I run `pnpm install` **Then** `apps/frontend`, `apps/backend`, and `packages/shared` workspaces all resolve correctly **And** `packages/shared` is importable as `@bmad-todo/shared` from both apps.

2. **Given** the workspace setup **When** I inspect TypeScript configuration **Then** strict mode is enabled in all packages **And** `packages/shared/src/index.ts` exports `Todo`, `CreateTodoRequest`, and `UpdateTodoRequest` interfaces.

3. **Given** the root `package.json` **When** inspected **Then** it contains no direct dependencies (workspace root has scripts only) **And** `pnpm-workspace.yaml` declares `apps/*` and `packages/*`.

4. **Given** a clean checkout **When** I run `pnpm dev` at the workspace root **Then** the Vite dev server starts on port 5173 and the backend starts on port 3000 concurrently.

## Tasks / Subtasks

- [x] Task 1: Scaffold the workspace root (AC: 3)
  - [x] 1.1 Create `package.json` at workspace root with scripts only (`dev`, `build`, `test`, `lint`) — no dependencies
  - [x] 1.2 Create `pnpm-workspace.yaml` declaring `packages: ['apps/*', 'packages/*']`
  - [x] 1.3 Create `.gitignore` covering `node_modules`, `dist`, `.env`, `*.local`
  - [x] 1.4 Create `.env.example` documenting `DATABASE_URL`, `FRONTEND_ORIGIN`, `NODE_ENV`
  - [x] 1.5 Create workspace root `tsconfig.base.json` with `strict: true` and path references
  - [x] 1.6 Create `README.md` with project overview and dev setup instructions

- [x] Task 2: Bootstrap `apps/frontend` (AC: 1, 4)
  - [x] 2.1 Run `pnpm create vite@latest apps/frontend -- --template react-ts` (or scaffold manually to match)
  - [x] 2.2 Add `@bmad-todo/shared` as a workspace dependency in `apps/frontend/package.json`
  - [x] 2.3 Configure `apps/frontend/tsconfig.json` to extend `../../tsconfig.base.json` and enable strict mode
  - [x] 2.4 Verify Vite dev server starts on port 5173 with no errors

- [x] Task 3: Bootstrap `apps/backend` (AC: 1, 4)
  - [x] 3.1 Create `apps/backend/package.json` with `name: "@bmad-todo/backend"`
  - [x] 3.2 Install backend runtime dependencies: `fastify`, `@fastify/cors`, `@fastify/helmet`, `fastify-type-provider-zod`, `zod`
  - [x] 3.3 Install backend dev dependencies: `typescript`, `tsx`, `@types/node`
  - [x] 3.4 Add `@bmad-todo/shared` as a workspace dependency
  - [x] 3.5 Configure `apps/backend/tsconfig.json` to extend `../../tsconfig.base.json` and enable strict mode
  - [x] 3.6 Create minimal `apps/backend/src/server.ts` entry point that starts Fastify on port 3000
  - [x] 3.7 Create `apps/backend/src/app.ts` as the Fastify app factory (no `listen()` call — for testability)
  - [x] 3.8 Verify backend starts with `pnpm dev` in `apps/backend`

- [x] Task 4: Create `packages/shared` (AC: 1, 2)
  - [x] 4.1 Create `packages/shared/package.json` with `name: "@bmad-todo/shared"`, `main: "src/index.ts"`, and `exports` field
  - [x] 4.2 Create `packages/shared/tsconfig.json` extending base config
  - [x] 4.3 Create `packages/shared/src/types.ts` with the following exported interfaces:
    - `Todo` — `{ id: string; text: string; isCompleted: boolean; createdAt: string }`
    - `CreateTodoRequest` — `{ text: string }`
    - `UpdateTodoRequest` — `{ isCompleted: boolean }`
  - [x] 4.4 Create `packages/shared/src/index.ts` that re-exports everything from `types.ts`
  - [x] 4.5 Verify `@bmad-todo/shared` can be imported in both `apps/frontend` and `apps/backend`

- [x] Task 5: Wire `pnpm dev` concurrently (AC: 4)
  - [x] 5.1 Install `concurrently` at workspace root as a `devDependency`
  - [x] 5.2 Wire the root `dev` script: `concurrently "pnpm --filter @bmad-todo/frontend dev" "pnpm --filter @bmad-todo/backend dev"`
  - [x] 5.3 Verify running `pnpm dev` at workspace root starts both Vite (port 5173) and Fastify (port 3000)

## Dev Notes

### Architecture Decisions That Must Be Followed

- **Monorepo tool: pnpm workspaces** — Do NOT use npm workspaces or Yarn. This is a hard requirement from the architecture.
- **No Nx or Turborepo** — plain pnpm workspaces; simpler is better for this 2-app scope.
- **Strict TypeScript everywhere** — `strict: true` must be set in all `tsconfig.json` files. No exceptions.
- **Root `package.json` must have no direct dependencies** — only `devDependencies` (e.g., `concurrently`) and `scripts`.
- **`packages/shared` is the single source of truth for API types** — do NOT duplicate type definitions in frontend or backend.
- **`app.ts` vs `server.ts` separation is mandatory** — `app.ts` is the Fastify factory (no `listen()`), `server.ts` calls `listen()`. This allows backend unit tests to import `app.ts` without starting the HTTP server.

### Shared Package — Exact Types to Export

```typescript
// packages/shared/src/types.ts

export interface Todo {
  id: string
  text: string
  isCompleted: boolean
  createdAt: string // ISO 8601 string
}

export interface CreateTodoRequest {
  text: string
}

export interface UpdateTodoRequest {
  isCompleted: boolean
}
```

These types are used in Story 1.3 (REST API endpoints) and Story 2.1 (frontend API layer). Getting them right now prevents rework later.

### Project Directory Structure to Follow

The architecture defines the exact structure (see [architecture.md](_bmad-output/planning-artifacts/architecture.md)). Key paths created in this story:

```
bmad-todo/
├── package.json                 # Root — scripts only
├── pnpm-workspace.yaml          # apps/*, packages/*
├── tsconfig.base.json           # Base TS config (strict: true)
├── .gitignore
├── .env.example
├── README.md
├── apps/
│   ├── frontend/
│   │   ├── package.json         # name: "@bmad-todo/frontend"
│   │   ├── tsconfig.json        # extends ../../tsconfig.base.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       └── App.tsx
│   └── backend/
│       ├── package.json         # name: "@bmad-todo/backend"
│       ├── tsconfig.json        # extends ../../tsconfig.base.json
│       └── src/
│           ├── app.ts           # Fastify factory
│           └── server.ts        # Entry point
└── packages/
    └── shared/
        ├── package.json         # name: "@bmad-todo/shared"
        ├── tsconfig.json
        └── src/
            ├── types.ts
            └── index.ts
```

### Naming Conventions (from architecture)

- Package names: `@bmad-todo/frontend`, `@bmad-todo/backend`, `@bmad-todo/shared`
- TypeScript files: `camelCase.ts` for utilities/services, `PascalCase.tsx` for React components
- All `tsconfig.json` files extend the base config and must not weaken `strict: true`

### Backend Initial Setup Notes

This story only scaffolds the backend — no routes, database, or middleware yet. The minimal `app.ts` should:

- Create a Fastify instance with `logger: true` in development
- Export the app without calling `listen()`

The minimal `server.ts` should:

- Import app from `./app`
- Call `app.listen({ port: 3000, host: '0.0.0.0' })`

Do NOT add Drizzle, routes, or plugins yet — those are Story 1.2 and 1.3.

### Frontend Initial Setup Notes

The Vite scaffold via `pnpm create vite@latest` will produce a working React + TS app. Clean up the default Vite boilerplate:

- `App.tsx` can be a minimal placeholder (e.g., renders `<h1>bmad-todo</h1>`)
- Remove the default Vite CSS and counter component
- `main.tsx` should remain as the React entry point

Do NOT add TanStack Query, components, or hooks yet — those are Epic 2.

### `tsconfig.base.json` Reference

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Frontend and backend `tsconfig.json` files extend this and add any app-specific overrides (e.g., `"jsx": "react-jsx"` for frontend).

### Environment Variables

`.env.example` must document these three (no values — just keys with comments):

```
DATABASE_URL=           # PostgreSQL connection string, e.g. postgres://user:pass@localhost:5432/bmad_todo
FRONTEND_ORIGIN=        # Allowed CORS origin for backend in production, e.g. http://localhost
NODE_ENV=               # development | production
```

### Security Notes

- No secrets in the repository — `.env` must be in `.gitignore`
- `.env.example` documents keys only, no real credentials
- `pnpm-lock.yaml` must be committed (lockfile integrity, OWASP NFR7)

### References

- [Source: architecture.md — Starter Template Evaluation] — pnpm workspaces rationale and initialization commands
- [Source: architecture.md — Project Structure & Boundaries] — complete directory structure spec
- [Source: architecture.md — Naming Patterns] — package and file naming conventions
- [Source: architecture.md — Enforcement Guidelines] — strict mode requirement
- [Source: epics.md — Story 1.1 Acceptance Criteria] — full BDD acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

- Removed `erasableSyntaxOnly: true` from `apps/frontend/tsconfig.json` — option is not recognized by TypeScript 5.7.x (available in TS 5.8+). Strict mode requirements are fully satisfied by `strict: true` in `tsconfig.base.json`.

### Completion Notes List

- All workspace scaffolding was pre-created; verified every file matches story requirements.
- `pnpm install` resolves all 4 workspace packages correctly; `@bmad-todo/shared` linked as `workspace:*` in both `apps/backend` and `apps/frontend`.
- TypeScript strict mode confirmed: backend `tsc --noEmit` and frontend `tsc --noEmit` both exit clean.
- Fastify `buildApp()` factory tested: starts, registers `GET /health`, and closes without errors — no HTTP server required for unit testing (app.ts/server.ts separation intact).
- Root `package.json` has no `dependencies` field — only `devDependencies: { concurrently }` and `scripts`. AC 3 satisfied.
- `pnpm dev` root script wired with concurrently to start Vite (port 5173) and Fastify (port 3000) in parallel. AC 4 satisfied.
- `.env` in `.gitignore`; `.env.example` documents keys only — no real credentials committed. Security notes satisfied.

### Code Review Fixes (2026-03-10)

- **[H1-FIXED]** Added `"lint": "tsc --noEmit"` to `apps/backend/package.json` — backend had no lint script, causing root `pnpm lint` to fail.
- **[H1-FIXED]** Changed `apps/frontend/package.json` lint script from `eslint .` to `tsc --noEmit` — ESLint is not installed/configured in this scaffold; TypeScript type-checking serves as the lint step.
- **[H2-FIXED]** Changed `apps/backend/package.json` test script from `node --import tsx --test src/**/*.test.ts` to `vitest run --passWithNoTests` — the Node test runner glob failed with ENOENT on macOS when no `.test.ts` files exist. Added `vitest ^3.0.2` to backend devDependencies.
- **[M2-FIXED]** Removed `"noEmit": true` from `apps/backend/tsconfig.json` — it was contradictory with `outDir: "dist"` and required the non-standard `--noEmit false` override in the build script. Simplified build script to `"tsc"`.
- **[M1-FIXED]** Added `pnpm-lock.yaml` to story File List — lockfile was present and required (OWASP NFR7) but undocumented.
- **[M3-FIXED]** Added `apps/frontend/.gitignore` to story File List — Vite scaffold creates this file; it existed on disk but was missing from documentation.

### File List

- package.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- tsconfig.base.json
- .gitignore
- .env.example
- README.md
- apps/frontend/.gitignore
- apps/frontend/package.json
- apps/frontend/tsconfig.json
- apps/frontend/vite.config.ts
- apps/frontend/index.html
- apps/frontend/src/main.tsx
- apps/frontend/src/App.tsx
- apps/backend/package.json
- apps/backend/tsconfig.json
- apps/backend/src/app.ts
- apps/backend/src/server.ts
- packages/shared/package.json
- packages/shared/tsconfig.json
- packages/shared/src/types.ts
- packages/shared/src/index.ts

## Change Log

- 2026-03-10: Verified and validated full monorepo scaffold. Removed unsupported `erasableSyntaxOnly` compiler option from `apps/frontend/tsconfig.json` (TS 5.7 incompatible). All ACs verified — story marked ready for review.
- 2026-03-10: Code review completed (Quinn/QA). Fixed 2 HIGH + 3 MEDIUM issues: broken lint scripts (H1), broken backend test script (H2), backend tsconfig noEmit contradiction (M2), missing pnpm-lock.yaml and apps/frontend/.gitignore from File List (M1, M3). All ACs implemented. Story status set to done.
