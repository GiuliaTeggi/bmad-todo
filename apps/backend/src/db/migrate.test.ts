import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock the drizzle-orm/postgres-js/migrator module
vi.mock("drizzle-orm/postgres-js/migrator", () => ({
  migrate: vi.fn().mockResolvedValue(undefined)
}))

// Mock drizzle-orm/postgres-js
vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn().mockReturnValue({ _: "mock-drizzle-instance" })
}))

// Mock the postgres driver
const mockSqlEnd = vi.fn().mockResolvedValue(undefined)
const mockSql = Object.assign(vi.fn(), { end: mockSqlEnd })
vi.mock("postgres", () => ({
  default: vi.fn().mockReturnValue(mockSql)
}))

describe("runMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSql.end = mockSqlEnd
    process.env.DATABASE_URL = "postgres://test:test@localhost/testdb"
  })

  afterEach(() => {
    delete process.env.DATABASE_URL
  })

  it("calls migrate with the correct migrations folder", async () => {
    const { runMigrations } = await import("./migrate.js")
    const { migrate } = await import("drizzle-orm/postgres-js/migrator")

    await runMigrations()

    expect(migrate).toHaveBeenCalledOnce()
    const [, options] = (migrate as ReturnType<typeof vi.fn>).mock.calls[0] as [
      unknown,
      { migrationsFolder: string }
    ]
    expect(options.migrationsFolder).toContain("migrations")
  })

  it("closes the postgres connection after migration", async () => {
    const { runMigrations } = await import("./migrate.js")

    await runMigrations()

    expect(mockSqlEnd).toHaveBeenCalledOnce()
  })

  it("closes the connection even when migration throws", async () => {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator")
    ;(migrate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Migration failed")
    )

    const { runMigrations } = await import("./migrate.js")

    await expect(runMigrations()).rejects.toThrow("Migration failed")
    expect(mockSqlEnd).toHaveBeenCalledOnce()
  })

  it("throws if DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL

    // Need to re-import to get fresh module without cached DATABASE_URL check
    const { runMigrations } = await import("./migrate.js")

    await expect(runMigrations()).rejects.toThrow("DATABASE_URL")
  })
})
