import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useTodos } from "./useTodos"
import { createWrapper } from "../test/testUtils"
import * as apiModule from "../api/todos"
import type { Todo } from "@bmad-todo/shared"

vi.mock("../api/todos")
const mockGetTodos = vi.mocked(apiModule.getTodos)

const todos: Todo[] = [
  {
    id: "1",
    text: "Buy milk",
    isCompleted: false,
    createdAt: new Date().toISOString()
  }
]

describe("useTodos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns todos on success", async () => {
    mockGetTodos.mockResolvedValue(todos)
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(todos)
  })

  it("returns error state on failure", async () => {
    mockGetTodos.mockRejectedValue(new Error("Network error"))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Network error")
  })

  it("starts in pending state", () => {
    mockGetTodos.mockReturnValue(new Promise(() => {}))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
  })
})
