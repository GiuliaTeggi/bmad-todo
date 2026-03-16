import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Todo } from "@bmad-todo/shared"
import { createTodo } from "../api/todos"
import { TODOS_QUERY_KEY } from "./useTodos"
import { useError } from "../context/ErrorContext"

export function useCreateTodo() {
  const queryClient = useQueryClient()
  const { setError } = useError()

  return useMutation({
    mutationFn: (text: string) => createTodo({ text }),

    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

      const optimistic: Todo = {
        id: `optimistic-${Date.now()}`,
        text,
        isCompleted: false,
        createdAt: new Date().toISOString()
      }

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => [
        ...(old ?? []),
        optimistic
      ])

      return { previous }
    },

    onError: (_err, _text, context) => {
      queryClient.setQueryData(TODOS_QUERY_KEY, context?.previous)
      setError("Failed to create todo. Please try again.")
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
    }
  })
}
