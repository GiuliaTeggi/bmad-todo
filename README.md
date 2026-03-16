# bmad-todo

A simple full-stack todo application built to learn and explore the **BMAD (Breakthrough Method of Agile AI-Driven Development)** methodology and its workflows (https://docs.bmad-method.org/). The app was designed, planned, and implemented entirely through BMAD agents and workflows — from product brief and architecture through to working code.

## BMAD Methodology

This app was built end-to-end using the [BMAD method](https://github.com/bmad-ai/bmad-method) — an AI-driven agile development framework that uses specialised agents to guide each phase of the software lifecycle.

### Agents used

| Agent            | Persona | Role in this project                                       |
| ---------------- | ------- | ---------------------------------------------------------- |
| **Analyst**      | Mary    | Created the product brief and conducted domain research    |
| **PM**           | John    | Wrote the PRD and defined epics and user stories           |
| **Architect**    | Winston | Designed the system architecture and technical stack       |
| **UX Designer**  | Sally   | Produced UX design directions and the design specification |
| **Scrum Master** | Bob     | Prepared and sequenced implementation stories              |
| **Developer**    | Amelia  | Implemented each story with TDD                            |
| **QA**           | Quinn   | Defined the E2E test suite                                 |

### Workflows used

| Phase          | Workflow                                              |
| -------------- | ----------------------------------------------------- |
| Discovery      | Product brief creation, domain research               |
| Planning       | PRD creation, architecture design, UX design          |
| Implementation | Story creation, story execution (dev), E2E test suite |

## Technical Artifacts

All planning and implementation documentation generated during the BMAD workflow is stored in [`_bmad-output/`](_bmad-output/).

### Planning artifacts (`_bmad-output/planning-artifacts/`)

| File                                                                                                              | Description                                 |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [product-brief](/_bmad-output/planning-artifacts/product-brief-bmad-todo-2026-03-10.md)                           | Initial product brief and project scope     |
| [prd.md](/_bmad-output/planning-artifacts/prd.md)                                                                 | Product Requirements Document               |
| [architecture.md](/_bmad-output/planning-artifacts/architecture.md)                                               | System architecture and technical decisions |
| [epics.md](/_bmad-output/planning-artifacts/epics.md)                                                             | Epics and user stories                      |
| [ux-design-specification.md](/_bmad-output/planning-artifacts/ux-design-specification.md)                         | UX design specification                     |
| [ux-design-directions.html](/_bmad-output/planning-artifacts/ux-design-directions.html)                           | UX design directions (visual)               |
| [implementation-readiness-report](/_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-10.md) | Pre-implementation readiness review         |

### Implementation artifacts (`_bmad-output/implementation-artifacts/`)

Each story was documented as an implementation artifact before coding began:

| File                                                                                                                | Description                              |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [1-1](/_bmad-output/implementation-artifacts/1-1-initialize-monorepo-workspace.md)                                  | Initialise monorepo workspace            |
| [1-2](/_bmad-output/implementation-artifacts/1-2-todo-database-schema-and-migrations.md)                            | Database schema and migrations           |
| [1-3](/_bmad-output/implementation-artifacts/1-3-todo-rest-api-endpoints.md)                                        | REST API endpoints                       |
| [1-4](/_bmad-output/implementation-artifacts/1-4-backend-unit-and-integration-test-suite.md)                        | Backend unit and integration tests       |
| [2-1](/_bmad-output/implementation-artifacts/2-1-project-foundation-react-app-with-tanstack-query-and-api-layer.md) | React app foundation with TanStack Query |
| [2-2](/_bmad-output/implementation-artifacts/2-2-todo-list-display-with-loading-and-empty-states.md)                | Todo list display                        |
| [2-3](/_bmad-output/implementation-artifacts/2-3-create-todo-with-optimistic-update.md)                             | Create todo with optimistic update       |
| [2-4](/_bmad-output/implementation-artifacts/2-4-toggle-todo-completion-with-optimistic-update.md)                  | Toggle completion with optimistic update |
| [2-5](/_bmad-output/implementation-artifacts/2-5-delete-todo-with-optimistic-update.md)                             | Delete todo with optimistic update       |
| [2-6](/_bmad-output/implementation-artifacts/2-6-responsive-layout-accessibility-audit-and-css-foundations.md)      | Responsive layout and accessibility      |
| [3-1](/_bmad-output/implementation-artifacts/3-1-docker-compose-infrastructure.md)                                  | Docker Compose infrastructure            |
| [3-2](/_bmad-output/implementation-artifacts/3-2-playwright-end-to-end-test-suite.md)                               | Playwright E2E test suite                |

## Tech Stack

### Frontend (`apps/frontend`)

| Category      | Technology               |
| ------------- | ------------------------ |
| Framework     | React 19                 |
| Build tool    | Vite 6                   |
| Language      | TypeScript (strict)      |
| Data fetching | TanStack Query v5        |
| Unit testing  | Vitest + Testing Library |
| E2E testing   | Playwright               |

### Backend (`apps/backend`)

| Category     | Technology          |
| ------------ | ------------------- |
| Framework    | Fastify 5           |
| Language     | TypeScript (strict) |
| Validation   | Zod                 |
| ORM          | Drizzle ORM         |
| Database     | PostgreSQL 17       |
| Unit testing | Vitest              |

### Shared (`packages/shared`)

| Category | Technology                                |
| -------- | ----------------------------------------- |
| Language | TypeScript                                |
| Purpose  | Shared types between frontend and backend |

### Infrastructure

| Category         | Technology     |
| ---------------- | -------------- |
| Monorepo         | npm workspaces |
| Containerisation | Docker Compose |
| Dev runtime      | Node.js 22     |

## Project Structure

```
apps/
  frontend/   — Vite React SPA (port 5173 in dev)
  backend/    — Fastify REST API (port 3000 in dev)
packages/
  shared/     — Shared TypeScript types (@bmad-todo/shared)
```

## Running Locally

### Prerequisites

- Node.js 20+
- Docker (for the PostgreSQL database)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start the PostgreSQL database container
docker compose up db -d

# 4. Run database migrations
npm run db:migrate

# 5. Start both frontend and backend in watch mode
npm run dev
```

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:3000

### Individual workspace commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# E2E tests (requires running stack)
npm run test:e2e --workspace=apps/frontend
```

### Run the full stack with Docker Compose

```bash
# Start everything (db + backend + frontend)
docker compose up

# Rebuild images after code changes
docker compose build
```

App: http://localhost:8080

## Environment Variables

See [.env.example](.env.example) for all available variables and their defaults.
