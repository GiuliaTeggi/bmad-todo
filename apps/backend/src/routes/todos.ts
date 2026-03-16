import type { FastifyPluginAsync } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { getDb } from "../db/client.js"
import { todosTable } from "../db/schema.js"

const createTodoBodySchema = z.object({
  text: z
    .string()
    .min(1, "Text cannot be empty")
    .max(500, "Text cannot exceed 500 characters")
})

const updateTodoBodySchema = z.object({
  isCompleted: z.boolean()
})

const todoParamsSchema = z.object({
  id: z.string().uuid("Invalid todo ID format")
})

function formatTodo(row: {
  id: string
  text: string
  isCompleted: boolean
  createdAt: Date
  userId: string | null
}) {
  return {
    id: row.id,
    text: row.text,
    isCompleted: row.isCompleted,
    createdAt: row.createdAt.toISOString()
  }
}

function internalError() {
  return { error: { message: "Internal server error", code: "INTERNAL_ERROR" } }
}

function notFoundError() {
  return { error: { message: "Todo not found", code: "TODO_NOT_FOUND" } }
}

export const todosPlugin: FastifyPluginAsync = async (fastify) => {
  const f = fastify.withTypeProvider<ZodTypeProvider>()

  f.get("/todos", async (_request, reply) => {
    try {
      const db = getDb()
      const todos = await db.select().from(todosTable)
      return reply.send(todos.map(formatTodo))
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send(internalError())
    }
  })

  f.post(
    "/todos",
    { schema: { body: createTodoBodySchema } },
    async (request, reply) => {
      try {
        const db = getDb()
        const [todo] = await db
          .insert(todosTable)
          .values({ text: request.body.text })
          .returning()
        return reply.status(201).send(formatTodo(todo))
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(internalError())
      }
    }
  )

  f.patch(
    "/todos/:id",
    { schema: { params: todoParamsSchema, body: updateTodoBodySchema } },
    async (request, reply) => {
      try {
        const db = getDb()
        const [todo] = await db
          .update(todosTable)
          .set({ isCompleted: request.body.isCompleted })
          .where(eq(todosTable.id, request.params.id))
          .returning()

        if (!todo) {
          return reply.status(404).send(notFoundError())
        }
        return reply.send(formatTodo(todo))
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(internalError())
      }
    }
  )

  f.delete(
    "/todos/:id",
    { schema: { params: todoParamsSchema } },
    async (request, reply) => {
      try {
        const db = getDb()
        const [deleted] = await db
          .delete(todosTable)
          .where(eq(todosTable.id, request.params.id))
          .returning()

        if (!deleted) {
          return reply.status(404).send(notFoundError())
        }
        return reply.status(204).send()
      } catch (err) {
        fastify.log.error(err)
        return reply.status(500).send(internalError())
      }
    }
  )
}
