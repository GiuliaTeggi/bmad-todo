import { buildApp } from './app.js'
import { runMigrations } from './db/migrate.js'

const app = buildApp()

const start = async () => {
  try {
    await runMigrations()
  } catch (err) {
    console.error('Failed to run database migrations — aborting startup')
    process.exit(1)
  }

  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Backend listening on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
