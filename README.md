# bmad-todo

A minimal, production-quality full-stack todo application built end-to-end through the BMAD methodology.

## Stack

- **Frontend:** Vite 6 + React 19 + TypeScript (strict)
- **Backend:** Fastify 5 + Zod + TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Monorepo:** pnpm workspaces
- **Deployment:** Docker Compose

## Project Structure

```
apps/
  frontend/   — Vite React SPA (port 5173 in dev)
  backend/    — Fastify REST API (port 3000 in dev)
packages/
  shared/     — Shared TypeScript types (@bmad-todo/shared)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for full stack via Docker Compose)

### Local Development

```bash
# Install dependencies
pnpm install

# Start both frontend and backend in watch mode
pnpm dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

### Run with Docker Compose

```bash
# Copy and configure environment variables
cp .env.example .env

# Start the full stack (frontend + backend + PostgreSQL)
docker-compose up
```

App: http://localhost

### Testing

```bash
# Run all tests
pnpm test

# E2E tests (requires running stack)
pnpm --filter @bmad-todo/frontend test:e2e
```

## Environment Variables

See `.env.example` for all required variables.
