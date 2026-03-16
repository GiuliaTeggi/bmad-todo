# Story 1.2: Todo Database Schema and Migrations

Status: done

## Story

As a developer,
I want a PostgreSQL `todos` table managed by Drizzle ORM with automated migrations,
so that the application can persist todo data reliably with full type safety.

## Acceptance Criteria

1. **Given** a running PostgreSQL instance (via `DATABASE_URL` env var) **When** the backend initialises **Then** the Drizzle migration runs automatically and creates the `todos` table

2. **Given** the `todos` table **When** the schema is inspected **Then** it has columns: `id` (uuid, primary key), `text` (varchar, not null), `is_completed` (boolean, default false), `created_at` (timestamp with timezone, default now()), `user_id` (uuid, nullable — future auth placeholder) **And** all column names are `snake_case`

3. **Given** the Drizzle query layer **When** results are returned from a select query **Then** fields are fully typed in TypeScript with `camelCase` names (`isCompleted`, `createdAt`)

4. **Given** the migration files **When** committed to the repository **Then** a SQL file exists at `apps/backend/src/db/migrations/0000_init.sql`

## Tasks / Subtasks

- [x] Task 1: Install Drizzle ORM and related dependencies (AC: 1, 3)
  - [x] 1.1 Install `drizzle-orm` and `postgres` (npm driver) as runtime dependencies in `apps/backend`
  - [x] 1.2 Install `drizzle-kit` as a dev dependency in `apps/backend`
  - [x] 1.3 Install `@types/pg` is NOT needed — using `postgres` (the modern driver). Confirm `postgres` types are bundled.

- [x] Task 2: Create `apps/backend/src/db/schema.ts` (AC: 2, 3)
  - [x] 2.1 Define `todos` table using `pgTable` from `drizzle-orm/pg-core`
  - [x] 2.2 Add column `id`: `uuid()` primary key, `defaultRandom()`
  - [x] 2.3 Add column `text`: `varchar({ length: 500 }).notNull()`
  - [x] 2.4 Add column `is_completed`: `boolean().default(false).notNull()`
  - [x] 2.5 Add column `created_at`: `timestamp({ withTimezone: true }).defaultNow().notNull()`
  - [x] 2.6 Add column `user_id`: `uuid()` (nullable — no `.notNull()`)
  - [x] 2.7 Export `todosTable` and infer TypeScript types: `export type Todo = typeof todosTable.$inferSelect`

- [x] Task 3: Configure Drizzle Kit (`drizzle.config.ts` at backend root) (AC: 4)
  - [x] 3.1 Create `apps/backend/drizzle.config.ts` using `defineConfig` from `drizzle-kit`
  - [x] 3.2 Set `schema: 'src/db/schema.ts'`, `out: 'src/db/migrations'`, `dialect: 'postgresql'`
  - [x] 3.3 Set `dbCredentials: { url: process.env.DATABASE_URL! }` — never hardcode credentials

- [x] Task 4: Generate initial migration (AC: 4)
  - [x] 4.1 Run `pnpm drizzle-kit generate` in `apps/backend` to produce the SQL migration file
  - [x] 4.2 Verify `apps/backend/src/db/migrations/0000_init.sql` exists and contains the `CREATE TABLE todos` DDL with all expected columns

- [x] Task 5: Create `apps/backend/src/db/migrate.ts` (AC: 1)
  - [x] 5.1 Import `drizzle` from `drizzle-orm/postgres-js`, `migrate` from `drizzle-orm/postgres-js/migrator`, and `postgres` from `postgres`
  - [x] 5.2 Export an async `runMigrations()` function that connects, runs `migrate()`, and closes the connection
  - [x] 5.3 Handle errors gracefully: catch and log (without exposing DATABASE_URL) then re-throw so server.ts can exit

- [x] Task 6: Create `apps/backend/src/db/client.ts` (AC: 1, 3)
  - [x] 6.1 Create a `postgres` SQL client reading `DATABASE_URL` from `process.env`
  - [x] 6.2 Create and export a `db` instance using `drizzle(sql, { schema })` with the schema imported from `schema.ts`
  - [x] 6.3 Do NOT crash at import time if `DATABASE_URL` is missing — defer the error until first use

- [x] Task 7: Wire migration into `apps/backend/src/server.ts` (AC: 1)
  - [x] 7.1 Import `runMigrations` from `./db/migrate.js`
  - [x] 7.2 Call `await runMigrations()` in `server.ts` BEFORE calling `app.listen()` — NOT inside `buildApp()`
  - [x] 7.3 If `runMigrations()` throws, log the error and call `process.exit(1)`

- [x] Task 8: Add `db:generate` and `db:migrate` scripts to `apps/backend/package.json` (AC: 4)
  - [x] 8.1 Add script `"db:generate": "drizzle-kit generate"` to `apps/backend/package.json`
  - [x] 8.2 Add script `"db:migrate": "tsx src/db/migrate.ts"` to `apps/backend/package.json`

- [x] Task 9: Write unit tests for schema and migrate module (AC: 1, 2, 3)
  - [x] 9.1 Create `apps/backend/src/db/schema.test.ts` — verify all column names, types, and defaults using Drizzle schema introspection (no live DB needed)
  - [x] 9.2 Create `apps/backend/src/db/migrate.test.ts` — mock the `postgres` client and `drizzle-orm` migrate function; verify `runMigrations()` calls migrate and closes the connection; verify it re-throws on error

## Dev Notes

### Architecture Decisions That Must Be Followed

- **PostgreSQL driver: `postgres` npm package** — NOT `pg`. This is the modern TypeScript-native driver that pairs well with Drizzle.
- **`snake_case` column names** — DB columns are always snake_case. Drizzle maps them to camelCase TypeScript properties automatically via `.$inferSelect`.
- **`migrate()` in `server.ts`, NOT in `buildApp()`** — `app.ts` / `buildApp()` must remain free of DB calls so unit tests can import it without a live DB connection.
- **`DATABASE_URL` is the only connection mechanism** — never hardcode credentials or use per-field connection params. Read exclusively from `process.env.DATABASE_URL`.
- **Migration output directory: `src/db/migrations`** — this is relative to `apps/backend`, so the full path is `apps/backend/src/db/migrations/`.

### Security (OWASP Compliance)

- Never log the full `DATABASE_URL` — it contains credentials. Log a sanitised version (`postgres://***@host/db`) or just `"DB connection error"`.
- SQL injection is not possible through Drizzle ORM parameterised queries — no raw SQL strings passed to the DB.
- `DATABASE_URL` must be read from env, never hardcoded.

### Project Structure Notes

Files to create in this story:

```
apps/backend/
  drizzle.config.ts            # Drizzle Kit config
  src/
    db/
      schema.ts                # Table definition + inferred types
      client.ts                # Drizzle client (exports `db`)
      migrate.ts               # runMigrations() function
      migrations/
        0000_init.sql          # Generated by drizzle-kit generate
      schema.test.ts           # Unit tests — schema introspection
      migrate.test.ts          # Unit tests — migrate mock
    server.ts                  # Modified: call runMigrations() before listen()
```

Files to modify:

- `apps/backend/src/server.ts` — add `runMigrations()` call before `app.listen()`
- `apps/backend/package.json` — add `drizzle-orm`, `postgres` runtime deps; `drizzle-kit` dev dep; `db:generate` and `db:migrate` scripts

### Drizzle Schema — Exact Implementation

```typescript
// apps/backend/src/db/schema.ts
import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"

export const todosTable = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: varchar("text", { length: 500 }).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userId: uuid("user_id") // nullable — future auth placeholder
})

export type Todo = typeof todosTable.$inferSelect
export type NewTodo = typeof todosTable.$inferInsert
```

Note: the key in the object (`isCompleted`, `createdAt`, `userId`) is the TypeScript/camelCase name. The string argument (`'is_completed'`, `'created_at'`, `'user_id'`) is the actual DB column name. Drizzle handles the mapping.

### `@bmad-todo/shared` Alignment

The `packages/shared/src/types.ts` `Todo` interface uses camelCase (`isCompleted`, `createdAt`). The Drizzle `$inferSelect` type will also produce camelCase keys because the object keys in `pgTable` are camelCase. These align perfectly — no transformation layer needed.

### References

- [Source: architecture.md#Data Architecture] — Drizzle ORM, Drizzle Kit, postgres driver, `DATABASE_URL`
- [Source: architecture.md#Naming Patterns] — snake_case DB columns, camelCase TS identifiers
- [Source: architecture.md#Structure Patterns] — `apps/backend/src/db/` directory layout
- [Source: architecture.md#Authentication & Security] — OWASP compliance, no hardcoded credentials
- [Source: epics.md#Story 1.2] — Acceptance criteria and column definitions

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5

### Debug Log References

### Completion Notes List

### File List
