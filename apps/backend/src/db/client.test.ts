import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("postgres", () => ({
  default: vi.fn().mockReturnValue({})
}))

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn().mockReturnValue({ _: "mock-db" })
}))

describe("getDb()", () => {
  const originalUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    delete process.env.DATABASE_URL
  })

  afterEach(() => {
    if (originalUrl !== undefined) {
      process.env.DATABASE_URL = originalUrl
    } else {
      delete process.env.DATABASE_URL
    }
  })

  it("throws when DATABASE_URL is not set", async () => {
    const { getDb } = await import("../db/client.js")
    expect(() => getDb()).toThrow(
      "DATABASE_URL environment variable is not set"
    )
  })

  it("returns a db instance when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test"
    const { getDb } = await import("../db/client.js")
    const db = getDb()
    expect(db).toEqual({ _: "mock-db" })
  })

  it("returns the same instance on second call (singleton)", async () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test"
    const { getDb } = await import("../db/client.js")
    const db1 = getDb()
    const db2 = getDb()
    expect(db1).toBe(db2)
  })
})
