import { createContext, useContext, useState, type ReactNode } from "react"

interface ErrorContextValue {
  errorMessage: string | null
  setError: (msg: string | null) => void
}

const ErrorContext = createContext<ErrorContextValue>({
  errorMessage: null,
  setError: () => {}
})

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorMessage, setError] = useState<string | null>(null)
  return (
    <ErrorContext.Provider value={{ errorMessage, setError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
