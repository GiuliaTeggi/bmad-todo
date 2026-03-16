import { useQuery } from "@tanstack/react-query"
import { getTodos } from "../api/todos"

export const TODOS_QUERY_KEY = ["todos"] as const

export function useTodos() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: getTodos
  })
}
