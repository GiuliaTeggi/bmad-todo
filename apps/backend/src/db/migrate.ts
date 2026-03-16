import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const sql = postgres(url, { max: 1 })
  const db = drizzle(sql)

  try {
    await migrate(db, {
      migrationsFolder: join(__dirname, "migrations")
    })
  } catch (err) {
    // Log a sanitised message — never expose the full DATABASE_URL (it contains credentials)
    console.error(
      "Database migration failed:",
      err instanceof Error ? err.message : "Unknown error"
    )
    throw err
  } finally {
    await sql.end()
  }
}

// Allow running directly: tsx src/db/migrate.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then(() => {
      console.log("Migrations completed successfully")
      process.exit(0)
    })
    .catch(() => {
      process.exit(1)
    })
}
