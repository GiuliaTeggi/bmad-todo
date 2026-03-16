import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { TodoItem } from "./TodoItem"
import { createWrapper } from "../test/testUtils"
import type { Todo } from "@bmad-todo/shared"

const mockToggleMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock("../hooks/useToggleTodo", () => ({
  useToggleTodo: () => ({ mutate: mockToggleMutate, isPending: false })
}))
vi.mock("../hooks/useDeleteTodo", () => ({
  useDeleteTodo: () => ({ mutate: mockDeleteMutate, isPending: false })
}))

const activeTodo: Todo = {
  id: "1",
  text: "Buy milk",
  isCompleted: false,
  createdAt: new Date().toISOString()
}

const completedTodo: Todo = {
  id: "2",
  text: "Walk dog",
  isCompleted: true,
  createdAt: new Date().toISOString()
}

describe("TodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders todo text", () => {
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={activeTodo} />, { wrapper: Wrapper })
    expect(screen.getByText("Buy milk")).toBeInTheDocument()
  })

  it("renders checkbox unchecked for active todo", () => {
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={activeTodo} />, { wrapper: Wrapper })
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).not.toBeChecked()
  })

  it("renders checkbox checked for completed todo", () => {
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={completedTodo} />, { wrapper: Wrapper })
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeChecked()
  })

  it("has completed style class when todo is completed", () => {
    const { Wrapper } = createWrapper()
    const { container } = render(<TodoItem todo={completedTodo} />, {
      wrapper: Wrapper
    })
    expect(container.querySelector(".todo-item--completed")).toBeInTheDocument()
  })

  it("calls toggle mutation when checkbox is clicked", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={activeTodo} />, { wrapper: Wrapper })
    await user.click(screen.getByRole("checkbox"))
    expect(mockToggleMutate).toHaveBeenCalledWith({
      id: "1",
      isCompleted: true
    })
  })

  it("calls delete mutation when delete button is clicked", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={activeTodo} />, { wrapper: Wrapper })
    await user.click(screen.getByRole("button", { name: /delete/i }))
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      { id: "1" },
      expect.any(Object)
    )
  })

  it("delete button has accessible label", () => {
    const { Wrapper } = createWrapper()
    render(<TodoItem todo={activeTodo} />, { wrapper: Wrapper })
    const btn = screen.getByRole("button", { name: /delete: buy milk/i })
    expect(btn).toBeInTheDocument()
  })
})
