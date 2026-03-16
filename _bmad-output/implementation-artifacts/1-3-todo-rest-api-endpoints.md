# Story 1.3: Todo REST API Endpoints

Status: done

## Story

As a developer,
I want all four CRUD REST API endpoints for todos with Zod schema validation and standard error responses,
So that any client can manage todos over HTTP with guaranteed input safety.

## Acceptance Criteria

**Given** the backend is running
**When** `GET /api/todos` is called
**Then** the response is `200 OK` with an array `[{ id, text, isCompleted, createdAt }]`
**And** an empty database returns `[]`

**Given** the backend is running
**When** `POST /api/todos` is called with `{ "text": "Buy milk" }`
**Then** the response is `201 Created` with `{ id, text, isCompleted: false, createdAt }`
**And** the record is persisted in the database

**Given** `POST /api/todos` is called with an empty `text` or missing body
**When** the request is processed
**Then** the response is `400 Bad Request` with `{ "error": { "message": "...", "code": "VALIDATION_ERROR" } }`
**And** no record is created

**Given** a todo with a known `id`
**When** `PATCH /api/todos/:id` is called
**Then** the response is `200 OK` with the updated todo (`isCompleted` toggled)

**Given** a todo with a known `id`
**When** `DELETE /api/todos/:id` is called
**Then** the response is `204 No Content`
**And** the record no longer exists in the database

**Given** a non-existent `id`
**When** `PATCH` or `DELETE` is called
**Then** the response is `404 Not Found` with `{ "error": { "message": "...", "code": "TODO_NOT_FOUND" } }`

**Given** any API error
**When** the response is returned
**Then** it never contains a stack trace, SQL error message, or internal system detail

**Given** the Fastify server starts
**When** any response is returned
**Then** `@fastify/helmet` security headers are present
**And** CORS allows only the origin specified in the `FRONTEND_ORIGIN` environment variable

## Tasks / Subtasks

- [x] Task 1: Create `apps/backend/src/routes/todos.ts` (AC: 1–7)
  - [x] 1.1 Define Zod schemas for POST body (`text`: non-empty string, max 500 chars) and PATCH body (`isCompleted`: boolean)
  - [x] 1.2 Implement `GET /todos` — select all rows from `todosTable`, return formatted array
  - [x] 1.3 Implement `POST /todos` — insert row, return 201 with created todo
  - [x] 1.4 Implement `PATCH /todos/:id` — update `isCompleted`, return 200 or 404
  - [x] 1.5 Implement `DELETE /todos/:id` — delete row, return 204 or 404
  - [x] 1.6 Add `formatTodo` helper to convert DB row to API response shape (ISO date strings, omit userId)
  - [x] 1.7 Never expose internal DB errors — catch all errors and return `INTERNAL_ERROR`

- [x] Task 2: Modify `apps/backend/src/app.ts` (AC: 8)
  - [x] 2.1 Register `@fastify/helmet` with CSP restricting `defaultSrc` and `scriptSrc` to `'self'`
  - [x] 2.2 Register `@fastify/cors` with `origin: process.env.FRONTEND_ORIGIN || true`
  - [x] 2.3 Set `validatorCompiler` and `serializerCompiler` from `fastify-type-provider-zod`
  - [x] 2.4 Add global `setErrorHandler` mapping `error.validation` → 400 VALIDATION_ERROR, else 500 INTERNAL_ERROR
  - [x] 2.5 Register `todosPlugin` with prefix `/api`

- [x] Task 3: Create `apps/backend/src/routes/todos.test.ts` (AC: 1–7)
  - [x] 3.1 Mock `getDb()` with `vi.mock` — no live DB required
  - [x] 3.2 Test `GET /api/todos` — happy path (array of todos) and empty array
  - [x] 3.3 Test `POST /api/todos` — happy path (201), empty text (400), missing text (400)
  - [x] 3.4 Test `PATCH /api/todos/:id` — happy path (200 updated todo), not found (404)
  - [x] 3.5 Test `DELETE /api/todos/:id` — happy path (204), not found (404)

- [x] Task 4: Validate
  - [x] 4.1 All 20 tests pass (`pnpm test` in `apps/backend`)
  - [x] 4.2 Zero TypeScript errors (`pnpm lint` in `apps/backend`)

## Dev Notes

- Used `fastify.withTypeProvider<ZodTypeProvider>()` in the plugin for typed body/params access
- `formatTodo` converts `createdAt: Date` → ISO 8601 string and omits `userId` from responses
- `setErrorHandler<FastifyError>` in `app.ts` maps Fastify/Zod validation errors to `400 VALIDATION_ERROR`; all other errors to `500 INTERNAL_ERROR`
- `schema.test.ts` had a pre-existing TypeScript error (`symbol` index on PgTable) — fixed with `as unknown as Record<symbol, unknown>` double cast

## Dev Agent Record

- **Agent**: dev (Amelia)
- **Model**: claude-sonnet-4-6
- **Date**: 2026-03-10
- **Files Created**:
  - `apps/backend/src/routes/todos.ts`
  - `apps/backend/src/routes/todos.test.ts`
  - `_bmad-output/implementation-artifacts/1-3-todo-rest-api-endpoints.md`
- **Files Modified**:
  - `apps/backend/src/app.ts`
  - `apps/backend/src/db/schema.test.ts` (pre-existing TS error fix)
- **Test Results**: 20/20 tests passed
- **Lint Results**: 0 TypeScript errors
