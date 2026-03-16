import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Todo } from "@bmad-todo/shared"
import { toggleTodo } from "../api/todos"
import { TODOS_QUERY_KEY } from "./useTodos"
import { useError } from "../context/ErrorContext"

interface ToggleArgs {
  id: string
  isCompleted: boolean
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  const { setError } = useError()

  return useMutation({
    mutationFn: ({ id, isCompleted }: ToggleArgs) =>
      toggleTodo(id, { isCompleted }),

    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, isCompleted } : t))
      )

      return { previous }
    },

    onError: (_err, _args, context) => {
      queryClient.setQueryData(TODOS_QUERY_KEY, context?.previous)
      setError("Failed to update todo. Please try again.")
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
    }
  })
}
