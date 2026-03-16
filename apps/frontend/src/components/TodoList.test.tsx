import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { TodoList } from "./TodoList"
import { createWrapper } from "../test/testUtils"
import * as useTodosModule from "../hooks/useTodos"
import type { UseQueryResult } from "@tanstack/react-query"
import type { Todo } from "@bmad-todo/shared"

vi.mock("../hooks/useTodos")
vi.mock("../hooks/useToggleTodo", () => ({
  useToggleTodo: () => ({ mutate: vi.fn(), isPending: false })
}))
vi.mock("../hooks/useDeleteTodo", () => ({
  useDeleteTodo: () => ({ mutate: vi.fn(), isPending: false })
}))

const mockUseTodos = vi.mocked(useTodosModule.useTodos)

function makeQueryResult<T>(
  overrides: Partial<UseQueryResult<T>>
): UseQueryResult<T> {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    status: "pending",
    fetchStatus: "idle",
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isRefetching: false,
    isStale: false,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    refetch: vi.fn(),
    promise: Promise.resolve(undefined as T),
    ...overrides
  } as unknown as UseQueryResult<T>
}

describe("TodoList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows a loading state when fetching", () => {
    mockUseTodos.mockReturnValue(
      makeQueryResult<Todo[]>({ isPending: true, isLoading: true })
    )
    const { Wrapper } = createWrapper()
    render(<TodoList />, { wrapper: Wrapper })
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("shows empty state when no todos", () => {
    mockUseTodos.mockReturnValue(
      makeQueryResult<Todo[]>({
        isPending: false,
        isSuccess: true,
        data: [],
        status: "success"
      })
    )
    const { Wrapper } = createWrapper()
    render(<TodoList />, { wrapper: Wrapper })
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it("renders a list of todos", () => {
    const todos: Todo[] = [
      {
        id: "1",
        text: "Buy milk",
        isCompleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        text: "Walk dog",
        isCompleted: true,
        createdAt: new Date().toISOString()
      }
    ]
    mockUseTodos.mockReturnValue(
      makeQueryResult<Todo[]>({
        isPending: false,
        isSuccess: true,
        data: todos,
        status: "success"
      })
    )
    const { Wrapper } = createWrapper()
    render(<TodoList />, { wrapper: Wrapper })
    expect(screen.getByText("Buy milk")).toBeInTheDocument()
    expect(screen.getByText("Walk dog")).toBeInTheDocument()
  })

  it("list has role=list and items have role=listitem", () => {
    const todos: Todo[] = [
      {
        id: "1",
        text: "Buy milk",
        isCompleted: false,
        createdAt: new Date().toISOString()
      }
    ]
    mockUseTodos.mockReturnValue(
      makeQueryResult<Todo[]>({
        isPending: false,
        isSuccess: true,
        data: todos,
        status: "success"
      })
    )
    const { Wrapper } = createWrapper()
    render(<TodoList />, { wrapper: Wrapper })
    expect(screen.getByRole("list")).toBeInTheDocument()
    expect(screen.getByRole("listitem")).toBeInTheDocument()
  })
})
