export interface Todo {
  id: string
  text: string
  isCompleted: boolean
  createdAt: string // ISO 8601 string
}

export interface CreateTodoRequest {
  text: string
}

export interface UpdateTodoRequest {
  isCompleted: boolean
}
