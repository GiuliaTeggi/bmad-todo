import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorProvider } from "../context/ErrorContext"
import type { ReactNode } from "react"

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>{children}</ErrorProvider>
      </QueryClientProvider>
    )
  }

  return { queryClient, Wrapper }
}
