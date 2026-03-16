import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ErrorBanner } from "./ErrorBanner"
import { useError } from "../context/ErrorContext"

vi.mock("../context/ErrorContext")

const mockUseError = vi.mocked(useError)
const mockSetError = vi.fn()

describe("ErrorBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when there is no error", () => {
    mockUseError.mockReturnValue({ errorMessage: null, setError: mockSetError })
    const { container } = render(<ErrorBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the error message in an alert", () => {
    mockUseError.mockReturnValue({
      errorMessage: "Something went wrong",
      setError: mockSetError
    })
    render(<ErrorBanner />)
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong")
  })

  it("calls setError(null) when dismiss button is clicked", async () => {
    mockUseError.mockReturnValue({
      errorMessage: "Error!",
      setError: mockSetError
    })
    const user = userEvent.setup()
    render(<ErrorBanner />)
    await user.click(screen.getByRole("button", { name: /dismiss/i }))
    expect(mockSetError).toHaveBeenCalledWith(null)
  })
})
