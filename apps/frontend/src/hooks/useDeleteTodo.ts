import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Todo } from "@bmad-todo/shared"
import { deleteTodo } from "../api/todos"
import { TODOS_QUERY_KEY } from "./useTodos"
import { useError } from "../context/ErrorContext"

interface DeleteArgs {
  id: string
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  const { setError } = useError()

  return useMutation({
    mutationFn: ({ id }: DeleteArgs) => deleteTodo(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
        (old ?? []).filter((t) => t.id !== id)
      )

      return { previous }
    },

    onError: (_err, _args, context) => {
      queryClient.setQueryData(TODOS_QUERY_KEY, context?.previous)
      setError("Failed to delete todo. Please try again.")
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
    }
  })
}
