import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AddTodoForm } from "./AddTodoForm"
import { createWrapper } from "../test/testUtils"

const mockMutate = vi.fn()

vi.mock("../hooks/useCreateTodo", () => ({
  useCreateTodo: () => ({
    mutate: mockMutate,
    isPending: false
  })
}))

describe("AddTodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the input and submit button", () => {
    const { Wrapper } = createWrapper()
    render(<AddTodoForm />, { wrapper: Wrapper })
    expect(
      screen.getByPlaceholderText(/what needs to be done/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /add todo/i })
    ).toBeInTheDocument()
  })

  it("calls createTodo mutate when valid text is submitted", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<AddTodoForm />, { wrapper: Wrapper })
    await user.type(
      screen.getByPlaceholderText(/what needs to be done/i),
      "Buy milk"
    )
    await user.click(screen.getByRole("button", { name: /add todo/i }))
    expect(mockMutate).toHaveBeenCalledWith("Buy milk", expect.any(Object))
  })

  it("does not submit when input is empty", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<AddTodoForm />, { wrapper: Wrapper })
    await user.click(screen.getByRole("button", { name: /add todo/i }))
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it("shows validation message when submitting empty input", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<AddTodoForm />, { wrapper: Wrapper })
    await user.click(screen.getByRole("button", { name: /add todo/i }))
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
  })

  it("submits on Enter key press", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<AddTodoForm />, { wrapper: Wrapper })
    await user.type(
      screen.getByPlaceholderText(/what needs to be done/i),
      "Buy milk{Enter}"
    )
    expect(mockMutate).toHaveBeenCalledWith("Buy milk", expect.any(Object))
  })
})
