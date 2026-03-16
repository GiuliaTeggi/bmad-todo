import type { Todo } from "@bmad-todo/shared"
import { useToggleTodo } from "../hooks/useToggleTodo"
import { useDeleteTodo } from "../hooks/useDeleteTodo"

interface TodoItemProps {
  todo: Todo
  liRef?: (el: HTMLLIElement | null) => void
  nextItemRef?: React.RefObject<HTMLElement | null>
  addFormRef?: React.RefObject<HTMLElement | null>
}

export function TodoItem({
  todo,
  liRef,
  nextItemRef,
  addFormRef
}: TodoItemProps) {
  const toggleMutation = useToggleTodo()
  const deleteMutation = useDeleteTodo()

  function handleToggle() {
    toggleMutation.mutate({ id: todo.id, isCompleted: !todo.isCompleted })
  }

  function handleDelete() {
    deleteMutation.mutate(
      { id: todo.id },
      {
        onSuccess: () => {
          // Focus management: move to next item or add form
          const target = nextItemRef?.current ?? addFormRef?.current
          if (target instanceof HTMLElement) {
            target.focus()
          }
        }
      }
    )
  }

  return (
    <li
      ref={liRef}
      className={`todo-item${todo.isCompleted ? " todo-item--completed" : ""}`}
      role='listitem'
    >
      <label className='todo-item__label'>
        <input
          type='checkbox'
          className='todo-item__checkbox'
          checked={todo.isCompleted}
          onChange={handleToggle}
          aria-label={`Mark "${todo.text}" as ${todo.isCompleted ? "active" : "completed"}`}
        />
        <span className='todo-item__text'>{todo.text}</span>
      </label>
      <button
        type='button'
        className='todo-item__delete'
        onClick={handleDelete}
        aria-label={`Delete: ${todo.text}`}
      >
        ✕
      </button>
    </li>
  )
}
