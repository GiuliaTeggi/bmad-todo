import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import { ErrorProvider, useError } from "./ErrorContext"

function TestComponent() {
  const { errorMessage, setError } = useError()
  return (
    <div>
      <span data-testid='message'>{errorMessage ?? "none"}</span>
      <button onClick={() => setError("oops")}>set error</button>
      <button onClick={() => setError(null)}>clear error</button>
    </div>
  )
}

describe("ErrorContext", () => {
  it("provides null errorMessage by default", () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    expect(screen.getByTestId("message")).toHaveTextContent("none")
  })

  it("sets an error message", async () => {
    const user = userEvent.setup()
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    await user.click(screen.getByText("set error"))
    expect(screen.getByTestId("message")).toHaveTextContent("oops")
  })

  it("clears an error message", async () => {
    const user = userEvent.setup()
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    await user.click(screen.getByText("set error"))
    await user.click(screen.getByText("clear error"))
    expect(screen.getByTestId("message")).toHaveTextContent("none")
  })
})
