import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"

export const todosTable = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: varchar("text", { length: 500 }).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userId: uuid("user_id")
})

export type Todo = typeof todosTable.$inferSelect
export type NewTodo = typeof todosTable.$inferInsert
