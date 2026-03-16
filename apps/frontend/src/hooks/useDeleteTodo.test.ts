import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useDeleteTodo } from "./useDeleteTodo"
import { createWrapper } from "../test/testUtils"
import * as apiModule from "../api/todos"
import type { Todo } from "@bmad-todo/shared"

vi.mock("../api/todos")
const mockDeleteTodo = vi.mocked(apiModule.deleteTodo)

const todo1: Todo = {
  id: "1",
  text: "Buy milk",
  isCompleted: false,
  createdAt: new Date().toISOString()
}
const todo2: Todo = {
  id: "2",
  text: "Walk dog",
  isCompleted: false,
  createdAt: new Date().toISOString()
}

describe("useDeleteTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("optimistically removes the todo from the list", async () => {
    mockDeleteTodo.mockResolvedValue(undefined)
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [todo1, todo2])
    const { result } = renderHook(() => useDeleteTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: "1" })
    })

    await waitFor(() => {
      const todos = queryClient.getQueryData<Todo[]>(["todos"])
      expect(todos?.find((t) => t.id === "1")).toBeUndefined()
    })
  })

  it("rolls back on error — todo reappears in list", async () => {
    mockDeleteTodo.mockRejectedValue(new Error("Network error"))
    const { Wrapper, queryClient } = createWrapper()
    queryClient.setQueryData(["todos"], [todo1, todo2])
    const { result } = renderHook(() => useDeleteTodo(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: "1" })
    })

    await waitFor(() => {
      expect(result.current.isError || result.current.isIdle).toBeTruthy()
    })

    const todos = queryClient.getQueryData<Todo[]>(["todos"])
    expect(todos?.find((t) => t.id === "1")).toBeDefined()
  })
})
