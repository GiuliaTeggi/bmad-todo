import { useRef } from "react"
import { useTodos } from "../hooks/useTodos"
import { TodoItem } from "./TodoItem"

interface TodoListProps {
  addFormRef?: React.RefObject<HTMLElement | null>
}

export function TodoList({ addFormRef }: TodoListProps) {
  const { data: todos, isPending, isError, error } = useTodos()
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  if (isPending) {
    return (
      <div
        className='todo-list__loading'
        role='status'
        aria-live='polite'
        aria-label='Loading todos'
      >
        <div className='spinner' aria-hidden='true' />
        <span className='visually-hidden'>Loading your todos…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='todo-list__error' role='alert'>
        <p>Failed to load todos: {error?.message ?? "Unknown error"}</p>
      </div>
    )
  }

  return (
    <section aria-label='Todo list'>
      <div
        aria-live='polite'
        aria-atomic='false'
        className='visually-hidden'
        id='todo-list-announcer'
      />
      {todos.length === 0 ? (
        <p className='todo-list__empty'>No todos yet — add one above!</p>
      ) : (
        <ul className='todo-list' role='list' aria-label='Your todos'>
          {todos.map((todo, index) => {
            const nextTodo = todos[index + 1]
            const nextItemRef = nextTodo
              ? {
                  current: itemRefs.current.get(nextTodo.id) ?? null
                }
              : undefined

            return (
              <TodoItem
                key={todo.id}
                todo={todo}
                liRef={(el) => {
                  if (el) {
                    itemRefs.current.set(todo.id, el)
                  } else {
                    itemRefs.current.delete(todo.id)
                  }
                }}
                nextItemRef={nextItemRef as React.RefObject<HTMLElement | null>}
                addFormRef={addFormRef}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}
