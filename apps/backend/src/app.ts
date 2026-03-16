import Fastify from "fastify"
import type { FastifyError } from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import {
  serializerCompiler,
  validatorCompiler
} from "fastify-type-provider-zod"
import { todosPlugin } from "./routes/todos.js"

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test"
  })

  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"]
      }
    }
  })

  app.register(cors, {
    origin: process.env.FRONTEND_ORIGIN || true
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        error: {
          message: error.message,
          code: "VALIDATION_ERROR"
        }
      })
    }
    app.log.error(error)
    return reply.status(500).send({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR"
      }
    })
  })

  app.get("/health", async () => {
    return { status: "ok" }
  })

  app.register(todosPlugin, { prefix: "/api" })

  return app
}
