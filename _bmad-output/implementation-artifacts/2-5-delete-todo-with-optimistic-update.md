# Story 2.5: Delete Todo with Optimistic Update

Status: done

## Story

As a user,
I want to delete a todo instantly so that my list stays clean without waiting on the server,
So that removing a task feels as immediate as completing one.

## Acceptance Criteria

1. **Given** a todo in the list **When** I click its delete button **Then** the item is immediately removed from the list before the API responds (FR5, FR12).

2. **Given** an optimistic delete is in flight **When** the API call succeeds **Then** the removed state is confirmed and the list is in sync with the server.

3. **Given** an optimistic delete is in flight **When** the API call fails **Then** the item reappears in the list at its original position and a user-facing error message is shown (FR13, FR16).

4. **Given** a todo is deleted **When** focus is evaluated **Then** focus moves to the next todo in the list, or to the `AddTodoForm` input if the list is now empty (FR19).

5. **Given** the delete button **When** inspected **Then** it has an accessible label (e.g., `aria-label="Delete: Buy milk"`) and is keyboard operable (FR17, FR18).

6. **Given** `TodoItem.test.tsx` and `useDeleteTodo.test.ts` **When** run with Vitest **Then** all tests pass covering: optimistic delete, successful confirmation, rollback on error, and focus management.

## Implementation Notes

- `useDeleteTodo.ts`: `onMutate` removes item from cache; `onError` restores from snapshot
- `TodoItem.tsx`: delete button receives `nextItemRef` and `addFormRef` props; `onSuccess` focuses next or add-form input
- Focus management: `TodoApp.tsx` passes `inputRef` down via `TodoList` → `TodoItem`
- Tests in `TodoItem.test.tsx` and `hooks/useDeleteTodo.test.ts` — all passing
