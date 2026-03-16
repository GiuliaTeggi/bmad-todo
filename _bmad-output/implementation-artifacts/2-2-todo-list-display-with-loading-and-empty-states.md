# Story 2.2: Todo List Display with Loading and Empty States

Status: done

## Story

As a user,
I want to see my full list of todos when I open the app, with clear loading and empty states,
So that I always know what's on my list or that it's empty.

## Acceptance Criteria

1. **Given** the app loads and todos are being fetched **When** the initial network request is in flight **Then** a loading indicator (spinner or skeleton) is visible (FR14).

2. **Given** the app has loaded and there are todos **When** the list renders **Then** each todo is displayed with its text and a visual distinction between active (unchecked) and completed (strikethrough/dimmed) items (FR1, FR2).

3. **Given** the database contains no todos **When** the list renders **Then** a meaningful empty state message is shown instead of a blank list (FR6).

4. **Given** `TodoList.tsx` and `TodoItem.tsx` **When** inspected **Then** the list has `role="list"` and each item has `role="listitem"` **And** an ARIA live region announces changes to the list to screen readers (FR18).

5. **Given** `TodoList.test.tsx` and `TodoItem.test.tsx` **When** run with Vitest **Then** all tests pass, covering: loading state render, empty state render, and populated list render.

## Tasks / Subtasks

- [ ] Task 1: Create TodoItem component (AC: 2, 4)
  - [ ] 1.1 Create `apps/frontend/src/components/TodoItem.tsx` with text display and completed styling
  - [ ] 1.2 Add checkbox and delete button placeholders (full impl in 2.4 and 2.5)

- [ ] Task 2: Create TodoList component (AC: 1, 2, 3, 4)
  - [ ] 2.1 Create `apps/frontend/src/components/TodoList.tsx` with loading, empty, and list states
  - [ ] 2.2 Add ARIA live region for dynamic list changes

- [ ] Task 3: Add tests (AC: 5)
  - [ ] 3.1 Create `apps/frontend/src/components/TodoList.test.tsx`
  - [ ] 3.2 Create `apps/frontend/src/components/TodoItem.test.tsx`
