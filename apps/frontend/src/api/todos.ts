import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest
} from "@bmad-todo/shared"

const BASE_URL = "/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos`)
  return handleResponse<Todo[]>(res)
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return handleResponse<Todo>(res)
}

export async function toggleTodo(
  id: string,
  data: UpdateTodoRequest
): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return handleResponse<Todo>(res)
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" })
  return handleResponse<void>(res)
}
