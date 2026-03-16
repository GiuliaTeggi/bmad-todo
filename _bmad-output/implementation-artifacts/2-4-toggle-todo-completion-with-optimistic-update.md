# Story 2.4: Toggle Todo Completion with Optimistic Update

Status: done

## Story

As a user,
I want to click a checkbox to instantly mark a todo as done or undone, with a visual strikethrough animation,
So that I get immediate, satisfying feedback when I complete a task.

## Acceptance Criteria

1. **Given** an active todo in the list **When** I click its checkbox **Then** the item is immediately shown as completed (strikethrough + visual style change) before the API responds (FR4, FR11, FR15).

2. **Given** an optimistic toggle is in flight **When** the API call succeeds **Then** the completed state is confirmed and the list is in sync with the server.

3. **Given** an optimistic toggle is in flight **When** the API call fails **Then** the item reverts to its previous state and a user-facing error message is shown (FR13, FR16).

4. **Given** a completed todo **When** I click its checkbox again **Then** the item is immediately shown as active (strikethrough removed).

5. **Given** the checkbox element **When** inspected **Then** it is a native `<input type="checkbox">` with `aria-label` (FR18) **And** it is operable via keyboard (Space key toggles) (FR17).

6. **Given** `TodoItem.test.tsx` and `useToggleTodo.test.ts` **When** run with Vitest **Then** all tests pass covering: optimistic toggle, successful confirmation, and rollback on error.

## Implementation Notes

- `useToggleTodo.ts`: `onMutate` applies optimistic `isCompleted` flip; `onError` restores previous list
- `TodoItem.tsx`: native checkbox; `.todo-item--completed` class applies strikethrough via CSS transition
- Tests in `TodoItem.test.tsx` (7 tests) and `hooks/useToggleTodo.test.ts` (2 tests) — all passing
