# Story 2.3: Create Todo with Optimistic Update

Status: done

## Story

As a user,
I want to type a task and press Enter to add it to my list instantly,
So that the app feels responsive and my workflow is uninterrupted even on a slow connection.

## Acceptance Criteria

1. **Given** the `AddTodoForm` is visible **When** I type text and submit (Enter key or submit button) **Then** the new todo appears in the list immediately before the API call completes (FR3, FR10).

2. **Given** an optimistic create is in flight **When** the API call succeeds **Then** the optimistic item is replaced by the server-confirmed item seamlessly.

3. **Given** an optimistic create is in flight **When** the API call fails **Then** the optimistic item is removed from the list and a user-facing error message is shown (FR13, FR16).

4. **Given** the form is submitted with an empty input **When** the submission is attempted **Then** the form does not submit and shows a validation hint **And** focus remains in the input field.

5. **Given** a successful create **When** the todo is added **Then** the input field is cleared and focus returns to the input (FR19).

6. **Given** the submit button **When** inspected **Then** it has an accessible label and is keyboard operable (FR17, FR18).

7. **Given** `AddTodoForm.test.tsx` and `useCreateTodo.test.ts` **When** run with Vitest **Then** all tests pass covering: successful submit, empty input prevention, and optimistic rollback on error.

## Implementation Notes

- `AddTodoForm.tsx` handles form validation and submission
- `useCreateTodo.ts` performs `onMutate`/`onError`/`onSettled` optimistic update pattern
- Error shown via `ErrorContext` / `ErrorBanner` component
- Tests in `AddTodoForm.test.tsx` and `hooks/useCreateTodo.test.ts` — all 7 tests passing
