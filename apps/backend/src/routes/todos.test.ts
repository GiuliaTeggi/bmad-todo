import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { buildApp } from "../app.js"
import { getDb } from "../db/client.js"

vi.mock("../db/client.js", () => ({
  getDb: vi.fn()
}))

const mockGetDb = vi.mocked(getDb)

const mockTodoRow = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  text: "Test todo",
  isCompleted: false,
  createdAt: new Date("2026-03-10T12:00:00.000Z"),
  userId: null
}

const mockTodoResponse = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  text: "Test todo",
  isCompleted: false,
  createdAt: "2026-03-10T12:00:00.000Z"
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/todos", () => {
  it("returns array of todos", async () => {
    mockGetDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([mockTodoRow])
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({ method: "GET", url: "/api/todos" })
    await app.close()

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual([mockTodoResponse])
  })

  it("returns empty array when no todos exist", async () => {
    mockGetDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([])
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({ method: "GET", url: "/api/todos" })
    await app.close()

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual([])
  })
})

describe("POST /api/todos", () => {
  it("creates a new todo", async () => {
    mockGetDb.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTodoRow])
        })
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Test todo" }
    })
    await app.close()

    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.body)).toEqual(mockTodoResponse)
  })

  it("returns 400 when text is empty", async () => {
    const app = buildApp()
    const response = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "" }
    })
    await app.close()

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error.code).toBe("VALIDATION_ERROR")
  })

  it("returns 400 when text is missing", async () => {
    const app = buildApp()
    const response = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: {}
    })
    await app.close()

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error.code).toBe("VALIDATION_ERROR")
  })
})

describe("PATCH /api/todos/:id", () => {
  it("updates a todo", async () => {
    const updatedRow = { ...mockTodoRow, isCompleted: true }
    const updatedResponse = { ...mockTodoResponse, isCompleted: true }

    mockGetDb.mockReturnValue({
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRow])
          })
        })
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({
      method: "PATCH",
      url: `/api/todos/${mockTodoRow.id}`,
      payload: { isCompleted: true }
    })
    await app.close()

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(updatedResponse)
  })

  it("returns 404 when todo not found", async () => {
    mockGetDb.mockReturnValue({
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([])
          })
        })
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-0000-0000-000000000000",
      payload: { isCompleted: true }
    })
    await app.close()

    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body).error.code).toBe("TODO_NOT_FOUND")
  })
})

describe("DELETE /api/todos/:id", () => {
  it("deletes a todo", async () => {
    mockGetDb.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTodoRow])
        })
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({
      method: "DELETE",
      url: `/api/todos/${mockTodoRow.id}`
    })
    await app.close()

    expect(response.statusCode).toBe(204)
  })

  it("returns 404 when todo not found", async () => {
    mockGetDb.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([])
        })
      })
    } as any)

    const app = buildApp()
    const response = await app.inject({
      method: "DELETE",
      url: "/api/todos/00000000-0000-0000-0000-000000000000"
    })
    await app.close()

    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body).error.code).toBe("TODO_NOT_FOUND")
  })
})

describe("GET /health", () => {
  it("returns ok status", async () => {
    const app = buildApp()
    const response = await app.inject({ method: "GET", url: "/health" })
    await app.close()

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ status: "ok" })
  })
})

describe("500 error paths", () => {
  it("GET /api/todos returns 500 when db throws", async () => {
    mockGetDb.mockImplementation(() => {
      throw new Error("DB error")
    })

    const app = buildApp()
    const response = await app.inject({ method: "GET", url: "/api/todos" })
    await app.close()

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).error.code).toBe("INTERNAL_ERROR")
  })

  it("POST /api/todos returns 500 when db throws", async () => {
    mockGetDb.mockImplementation(() => {
      throw new Error("DB error")
    })

    const app = buildApp()
    const response = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Test" }
    })
    await app.close()

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).error.code).toBe("INTERNAL_ERROR")
  })

  it("PATCH /api/todos/:id returns 500 when db throws", async () => {
    mockGetDb.mockImplementation(() => {
      throw new Error("DB error")
    })

    const app = buildApp()
    const response = await app.inject({
      method: "PATCH",
      url: `/api/todos/${mockTodoRow.id}`,
      payload: { isCompleted: true }
    })
    await app.close()

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).error.code).toBe("INTERNAL_ERROR")
  })

  it("DELETE /api/todos/:id returns 500 when db throws", async () => {
    mockGetDb.mockImplementation(() => {
      throw new Error("DB error")
    })

    const app = buildApp()
    const response = await app.inject({
      method: "DELETE",
      url: `/api/todos/${mockTodoRow.id}`
    })
    await app.close()

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).error.code).toBe("INTERNAL_ERROR")
  })
})

describe("PATCH /api/todos/:id validation", () => {
  it("returns 400 when isCompleted is missing", async () => {
    const app = buildApp()
    const response = await app.inject({
      method: "PATCH",
      url: `/api/todos/${mockTodoRow.id}`,
      payload: {}
    })
    await app.close()

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).error.code).toBe("VALIDATION_ERROR")
  })
})
