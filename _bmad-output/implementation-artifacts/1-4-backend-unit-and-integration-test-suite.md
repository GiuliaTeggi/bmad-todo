# Story 1.4: Backend Unit and Integration Test Suite

Status: done

## Story

As a developer,
I want a Vitest test suite for all API routes and the database layer,
so that backend behaviour is verified and regressions are caught.

## Acceptance Criteria

- `pnpm test` in `apps/backend` passes — all tests pass
- Coverage ≥70% of backend source files
- Every endpoint (GET, POST, PATCH, DELETE) is tested for: happy path, 400 validation error, 404 not-found error, and 500 internal error
- Tests use isolated DB state (mocked — no live DB needed)
- Fastify app imported from `app.ts` (not `server.ts`)

## Tasks / Subtasks

- [x] Task 1: Verify existing tests cover schema and migrate modules
- [x] Task 2: Ensure routes/todos.test.ts covers all endpoints (GET, POST, PATCH, DELETE) for happy path, 400, 404, and 500
- [x] Task 3: Create db/client.test.ts covering getDb() singleton behavior
- [x] Task 4: Configure Vitest coverage (vitest.config.ts + @vitest/coverage-v8)
- [x] Task 5: Achieve ≥70% statement coverage across backend source files
- [x] Task 6: All tests pass with pnpm test

## Dev Notes

Tests use Vitest with vi.mock() for DB isolation. No live database required. App imported from app.ts (not server.ts) to keep listen() out of tests.

`client.test.ts` uses `vi.resetModules()` + dynamic imports in each test to reset the module-level `_db` singleton between tests.

### Coverage Results

| File            | % Stmts | % Branch | % Funcs | % Lines |
| --------------- | ------- | -------- | ------- | ------- |
| All files       | 92.3    | 90.9     | 100     | 92.3    |
| app.ts          | 84.44   | 75       | 100     | 84.44   |
| db/client.ts    | 100     | 100      | 100     | 100     |
| db/migrate.ts   | 76.31   | 77.77    | 100     | 76.31   |
| db/schema.ts    | 100     | 100      | 100     | 100     |
| routes/todos.ts | 100     | 100      | 100     | 100     |

### Test Count

29 tests across 4 test files, all passing.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6
