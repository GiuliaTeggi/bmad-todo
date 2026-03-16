# Story 2.1: Project Foundation — React App with TanStack Query and API Layer

Status: done

## Story

As a developer,
I want a scaffolded Vite/React/TypeScript frontend connected to the live backend via TanStack Query,
So that I have a working foundation before building any UI components.

## Acceptance Criteria

1. **Given** the frontend workspace **When** `pnpm dev` runs in `apps/frontend` **Then** the Vite dev server starts on port 5173 without errors.

2. **Given** the app is running **When** `GET /api/todos` is called via the `useTodos` hook **Then** TanStack Query fetches and caches the list of todos from the backend **And** `isPending`, `isError`, and `data` states are correctly modelled.

3. **Given** the `api/todos.ts` module **When** inspected **Then** it contains raw fetch functions (`getTodos`, `createTodo`, `toggleTodo`, `deleteTodo`) that import request/response types from `@bmad-todo/shared` **And** no React component imports from `api/todos.ts` directly — only hooks in `src/hooks/` do.

4. **Given** a `QueryClientProvider` wrapping the app **When** the app renders **Then** it is located in `TodoApp.tsx` and no other component creates a `QueryClient`.

## Tasks / Subtasks

- [ ] Task 1: Install TanStack Query (AC: 2, 4)
  - [ ] 1.1 Add `@tanstack/react-query` to `apps/frontend` dependencies
  - [ ] 1.2 Add `@tanstack/react-query-devtools` as a devDependency

- [ ] Task 2: Create API layer (AC: 3)
  - [ ] 2.1 Create `apps/frontend/src/api/todos.ts` with `getTodos`, `createTodo`, `toggleTodo`, `deleteTodo`
  - [ ] 2.2 Import types from `@bmad-todo/shared`

- [ ] Task 3: Create hooks (AC: 2)
  - [ ] 3.1 Create `apps/frontend/src/hooks/useTodos.ts` using `useQuery`

- [ ] Task 4: Create TodoApp with QueryClientProvider (AC: 4)
  - [ ] 4.1 Create `apps/frontend/src/TodoApp.tsx` with `QueryClient` and `QueryClientProvider`
  - [ ] 4.2 Update `App.tsx` to render `TodoApp`

## Dev Notes

- Use `@tanstack/react-query` v5
- All fetch functions in `src/api/todos.ts` must use the native fetch API
- The API base URL is `/api` (proxied by Vite to `http://localhost:3000`)
- Query key for todos list: `['todos']`
