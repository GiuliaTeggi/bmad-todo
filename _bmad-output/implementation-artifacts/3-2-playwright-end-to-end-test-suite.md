# Story 3.2: Playwright End-to-End Test Suite

Status: done

## Story

As a developer,
I want ≥5 Playwright E2E tests that verify the full application works end-to-end against the running stack,
So that critical user journeys are regression-tested at the integration level.

## Acceptance Criteria

1. **Given** the full stack running (via Docker Compose or local `pnpm dev`) **When** `pnpm test:e2e` runs **Then** all Playwright tests pass.

2. **Given** the E2E suite **When** inspected **Then** it contains at minimum these 5 scenarios:
   1. **Create a todo** — type text, submit, verify it appears in the list
   2. **Toggle a todo complete** — click checkbox, verify it is checked
   3. **Toggle a todo back to active** — click checkbox again, verify unchecked
   4. **Delete a todo** — click delete button, verify item is removed from the list
   5. **Persistence** — create a todo, reload the page, verify it is still present

3. **Given** an E2E test runs **When** it asserts on the todo list **Then** it uses accessible queries (by role/label) rather than CSS selectors or test IDs wherever possible.

4. **Given** the Playwright configuration (`playwright.config.ts`) **When** inspected **Then** it targets `http://localhost` (production Docker stack) or a configurable `BASE_URL` environment variable **And** E2E test files live in `apps/frontend/e2e/todos.spec.ts`.

## Implementation Notes

- `apps/frontend/playwright.config.ts`: testDir `./e2e`, `baseURL` defaults to `http://localhost` (overridable via `BASE_URL` env var), chromium only, sequential tests (`fullyParallel: false`), 30s timeout
- `apps/frontend/e2e/todos.spec.ts`: 5 tests inside a `describe` block; each test creates its own uniquely-suffixed todo to avoid cross-test interference
- All 5 assertions use `page.getByLabel(...)` and `page.getByRole(...)` — no CSS selectors or `data-testid` attributes
- Checkbox aria-label matches the `TodoItem.tsx` pattern: `Mark "{text}" as completed` (when active) / `Mark "{text}" as active` (when completed)
- Delete button aria-label matches `TodoItem.tsx` pattern: `Delete: {text}`
- Input label: `New todo` (via the `<label for="new-todo-input">` in `AddTodoForm.tsx`)
- `beforeEach` navigates to `/` and waits for the add-form input to be visible to confirm the app has loaded
- `pnpm test:e2e` script already exists in `apps/frontend/package.json` — no changes needed
- Playwright browsers must be installed before first run: `npx playwright install chromium`
