import { useRef } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorProvider } from "./context/ErrorContext"
import { ErrorBanner } from "./components/ErrorBanner"
import { TodoList } from "./components/TodoList"
import { AddTodoForm } from "./components/AddTodoForm"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1
    }
  }
})

function TodoAppInner() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='app-container'>
      <header className='app-header'>
        <h1>Todo List</h1>
      </header>
      <main className='app-main'>
        <ErrorBanner />
        <AddTodoForm inputRef={inputRef} />
        <TodoList
          addFormRef={inputRef as React.RefObject<HTMLElement | null>}
        />
      </main>
    </div>
  )
}

export function TodoApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <TodoAppInner />
      </ErrorProvider>
    </QueryClientProvider>
  )
}
