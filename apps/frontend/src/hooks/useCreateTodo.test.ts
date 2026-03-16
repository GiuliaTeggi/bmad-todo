import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useCreateTodo } from "./useCreateTodo"
import { createWrapper } from "../test/testUtils"
import * as apiModule from "../api/todos"
import type { Todo } from "@bmad-todo/shared"

vi.mock("../api/todos")
const mockCreateTodo = vi.mocked(apiModule.createTodo)

const newTodo: Todo = {
  id: "server-id-1",
  text: "Buy milk",
  isCompleted: false,
  createdAt: new Date().toISOString()
}

describe("useCreateTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("adds todo to cache optimistically", async () => {
    mockCreateTodo.mockResolvedValue(newTodo)
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [])
    const { result } = renderHook(() => useCreateTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate("Buy milk")
    })

    await waitFor(() => {
      const todos = queryClient.getQueryData<Todo[]>(["todos"])
      expect(todos?.some((t) => t.text === "Buy milk")).toBe(true)
    })
  })

  it("rolls back optimistic update on error", async () => {
    mockCreateTodo.mockRejectedValue(new Error("Network error"))
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [])
    const { result } = renderHook(() => useCreateTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate("Buy milk")
    })

    await waitFor(() => {
      expect(result.current.isError || result.current.isIdle).toBeTruthy()
    })

    const todos = queryClient.getQueryData<Todo[]>(["todos"])
    expect(
      todos?.some(
        (t) => t.text === "Buy milk" && !t.id.startsWith("optimistic")
      )
    ).toBe(false)
  })
})
