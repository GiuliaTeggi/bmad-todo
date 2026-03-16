import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useToggleTodo } from "./useToggleTodo"
import { createWrapper } from "../test/testUtils"
import * as apiModule from "../api/todos"
import type { Todo } from "@bmad-todo/shared"

vi.mock("../api/todos")
const mockToggleTodo = vi.mocked(apiModule.toggleTodo)

const initialTodo: Todo = {
  id: "1",
  text: "Buy milk",
  isCompleted: false,
  createdAt: new Date().toISOString()
}

describe("useToggleTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("optimistically toggles the todo", async () => {
    mockToggleTodo.mockResolvedValue({ ...initialTodo, isCompleted: true })
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [initialTodo])
    const { result } = renderHook(() => useToggleTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: "1", isCompleted: true })
    })

    await waitFor(() => {
      const todos = queryClient.getQueryData<Todo[]>(["todos"])
      expect(todos?.find((t) => t.id === "1")?.isCompleted).toBe(true)
    })
  })

  it("rolls back on error", async () => {
    mockToggleTodo.mockRejectedValue(new Error("Network error"))
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [initialTodo])
    const { result } = renderHook(() => useToggleTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: "1", isCompleted: true })
    })

    await waitFor(() => {
      expect(result.current.isError || result.current.isIdle).toBeTruthy()
    })

    const todos = queryClient.getQueryData<Todo[]>(["todos"])
    expect(todos?.find((t) => t.id === "1")?.isCompleted).toBe(false)
  })
})
