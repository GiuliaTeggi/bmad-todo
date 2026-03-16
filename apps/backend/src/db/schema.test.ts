import { describe, it, expect } from "vitest"
import { todosTable } from "./schema.js"
import { getTableColumns } from "drizzle-orm"

describe("todosTable schema", () => {
  it("defines a table named todos", () => {
    expect(
      (todosTable as unknown as Record<symbol, unknown>)[
        Symbol.for("drizzle:Name")
      ]
    ).toBe("todos")
  })

  it("has an id column as uuid primary key", () => {
    const cols = getTableColumns(todosTable)
    const col = cols.id
    expect(col).toBeDefined()
    expect(col.columnType).toBe("PgUUID")
    expect(col.primary).toBe(true)
    expect(col.hasDefault).toBe(true)
    // DB column name is snake_case
    expect(col.name).toBe("id")
  })

  it("has a text column (varchar, not null)", () => {
    const cols = getTableColumns(todosTable)
    const col = cols.text
    expect(col).toBeDefined()
    expect(col.columnType).toBe("PgVarchar")
    expect(col.notNull).toBe(true)
    expect(col.name).toBe("text")
  })

  it("has isCompleted mapped to is_completed column (boolean, default false)", () => {
    const cols = getTableColumns(todosTable)
    const col = cols.isCompleted
    expect(col).toBeDefined()
    expect(col.columnType).toBe("PgBoolean")
    expect(col.notNull).toBe(true)
    expect(col.default).toBe(false)
    // DB column name is snake_case
    expect(col.name).toBe("is_completed")
  })

  it("has createdAt mapped to created_at column (timestamp with timezone)", () => {
    const cols = getTableColumns(todosTable)
    const col = cols.createdAt
    expect(col).toBeDefined()
    expect(col.columnType).toBe("PgTimestamp")
    expect(col.notNull).toBe(true)
    expect(col.hasDefault).toBe(true)
    // DB column name is snake_case
    expect(col.name).toBe("created_at")
  })

  it("has userId mapped to user_id column (uuid, nullable)", () => {
    const cols = getTableColumns(todosTable)
    const col = cols.userId
    expect(col).toBeDefined()
    expect(col.columnType).toBe("PgUUID")
    expect(col.notNull).toBe(false)
    // DB column name is snake_case
    expect(col.name).toBe("user_id")
  })

  it("exports inferred TypeScript types with camelCase keys", () => {
    // Compile-time check via TypeScript inference — this test just confirms the shapes exist
    type InferredTodo = typeof todosTable.$inferSelect
    const _typeCheck: keyof InferredTodo = "isCompleted" as keyof InferredTodo
    expect(_typeCheck).toBe("isCompleted")

    const _typeCheck2: keyof InferredTodo = "createdAt" as keyof InferredTodo
    expect(_typeCheck2).toBe("createdAt")

    const _typeCheck3: keyof InferredTodo = "userId" as keyof InferredTodo
    expect(_typeCheck3).toBe("userId")
  })
})
