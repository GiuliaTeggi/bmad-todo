import { describe, it, expect, vi, beforeEach } from "vitest"
import { getTodos, createTodo, toggleTodo, deleteTodo } from "./todos"
import type { Todo } from "@bmad-todo/shared"

const mockTodo: Todo = {
  id: "1",
  text: "Test todo",
  isCompleted: false,
  createdAt: new Date().toISOString()
}

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body)
  })
}

describe("todos API", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("getTodos", () => {
    it("returns array of todos on success", async () => {
      vi.stubGlobal("fetch", mockFetch(200, [mockTodo]))
      const result = await getTodos()
      expect(result).toEqual([mockTodo])
    })

    it("throws with error message from response body", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetch(500, { error: { message: "Server error" } })
      )
      await expect(getTodos()).rejects.toThrow("Server error")
    })

    it("falls back to status code when body has no message", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          json: vi.fn().mockRejectedValue(new Error("not json"))
        })
      )
      await expect(getTodos()).rejects.toThrow("Request failed: 503")
    })
  })

  describe("createTodo", () => {
    it("posts and returns the created todo", async () => {
      vi.stubGlobal("fetch", mockFetch(201, mockTodo))
      const result = await createTodo({ text: "Test todo" })
      expect(result).toEqual(mockTodo)
    })

    it("throws on error response", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetch(400, { error: { message: "Bad request" } })
      )
      await expect(createTodo({ text: "" })).rejects.toThrow("Bad request")
    })
  })

  describe("toggleTodo", () => {
    it("patches and returns the updated todo", async () => {
      const updated = { ...mockTodo, isCompleted: true }
      vi.stubGlobal("fetch", mockFetch(200, updated))
      const result = await toggleTodo("1", { isCompleted: true })
      expect(result).toEqual(updated)
    })

    it("throws on error response", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetch(404, { error: { message: "Not found" } })
      )
      await expect(toggleTodo("bad-id", { isCompleted: true })).rejects.toThrow(
        "Not found"
      )
    })
  })

  describe("deleteTodo", () => {
    it("sends DELETE and resolves on 204", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, status: 204, json: vi.fn() })
      )
      await expect(deleteTodo("1")).resolves.toBeUndefined()
    })

    it("throws on error response", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetch(500, { error: { message: "Server error" } })
      )
      await expect(deleteTodo("1")).rejects.toThrow("Server error")
    })
  })
})
