import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

type DbClient = PostgresJsDatabase<typeof schema>

let _db: DbClient | null = null

/**
 * Returns the lazy-initialised Drizzle db singleton.
 * Throws at first call (not at import time) if DATABASE_URL is not set.
 */
export function getDb(): DbClient {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  _db = drizzle(postgres(url), { schema })
  return _db
}
