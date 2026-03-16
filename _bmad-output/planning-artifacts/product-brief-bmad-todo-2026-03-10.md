---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-03-10
author: Giulia
---

# Product Brief: bmad-todo

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

bmad-todo is a full-stack personal task management application built by and for a senior developer. Its primary purpose is to serve as a high-quality learning vehicle for the BMAD methodology, producing a reference-grade implementation that demonstrates what a small, deliberately scoped product looks like when built with rigorozus process: structured planning, solid architecture, comprehensive testing, and containerized deployment.

The application intentionally keeps its feature surface minimal — create, view, complete, and delete todos — so that all engineering effort goes into doing those things _exceptionally well_ rather than broadly.

---

## Core Vision

### Problem Statement

A senior developer learning the BMAD methodology has no suitable reference project: existing todo apps are either too trivial (no tests, no architecture, no deployment story) or too complex to serve as a clean learning example. There is no personal task management tool that also serves as a demonstrable example of BMAD-guided full-stack development done right.

### Problem Impact

Without a well-structured reference project, learning the BMAD process remains abstract. A poorly built reference app undermines trust in the methodology itself. The absence of a personal tool built to one's own standards means either tolerating subpar solutions or going without.

### Why Existing Solutions Fall Short

Off-the-shelf todo apps (Todoist, Things, Apple Reminders) are black boxes — no visibility into architecture, no learning value. Open-source examples are typically low-quality throwaway demos: no meaningful test coverage, no containerization, no consideration of extensibility. They demonstrate what to build, not _how_ to build it well.

### Proposed Solution

A minimal but production-quality full-stack todo application, built end-to-end through the BMAD methodology. The stack should be chosen for technical excellence: a fast, schema-driven backend (Fastify), a modern reactive frontend, a containerized deployment via Docker Compose, 70%+ meaningful test coverage, 5+ Playwright E2E tests, and zero critical accessibility violations. The app should feel complete and polished despite its narrow scope.

### Key Differentiators

- **Process integrity**: Every decision traceable back to BMAD artifacts (PRD → Architecture → Stories → Implementation)
- **Technical rigour**: Test coverage, containerization, and accessibility as first-class requirements — not afterthoughts
- **Extensibility by design**: Architecture explicitly leaves the door open for auth and multi-user without over-engineering v1
- **Senior dev ergonomics**: Stack choices and conventions reflect the taste and standards of an experienced engineer, not a tutorial audience

---

## Target Users

### Primary Users

**Giulia — Senior Developer & Solo User**

A senior software developer who uses the app as both a personal productivity tool and a technical reference implementation. She accesses it primarily from a browser tab on desktop during work, or occasionally via mobile for a quick glance. Her tasks are personal in nature — errands, reminders, project to-dos — and she expects the app to _just work_ without onboarding or explanation.

Her motivations are dual: she wants a reliable personal task manager, and she wants to see her own engineering standards reflected in the product. The "aha!" moment is watching the full stack work end-to-end in real time — a new todo appearing instantly after creation, then a satisfying animation as it's marked complete. That moment validates both the UX polish and the technical correctness of the implementation.

She tolerates zero jank. If something feels laggy or broken, she'll notice immediately.

### Secondary Users

**Husband / Familiar Non-Technical User**

An occasional user who might browse the app on mobile. Represents the "non-developer" bar — the UI and interactions should be intuitive enough that someone with no context can use it without explanation.

**Colleague / Developer Peer**

A technical peer who might be shown the app as a demo or BMAD reference. Their lens is evaluative — they're looking at code quality, architecture choices, and test coverage as much as the feature itself.

### User Journey

| Stage                 | Experience                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Opening the app**   | Immediately sees their todo list (or a clean empty state) — no login, no onboarding                         |
| **Creating a task**   | Types a description, submits — task appears instantly in the list                                           |
| **Completing a task** | Taps/clicks to mark done — visual change (strikethrough or fade) with a small animation confirms the action |
| **Deleting a task**   | Removes a task cleanly, list updates without page reload                                                    |
| **Returning later**   | All tasks persisted across sessions — nothing lost after a refresh                                          |

---

## Success Metrics

### Primary Definition of Success

Success for bmad-todo is the **complete, end-to-end delivery of the project through the BMAD methodology** — from product brief through to a deployed, tested application. The process _is_ the product for this project. A finished artifact trail (brief → PRD → architecture → stories → implementation) is itself a primary deliverable alongside the working app.

### User Success

- A user (technical or non-technical) can open the app and complete all core actions — create, complete, delete a todo — without any guidance or explanation
- The app works correctly across desktop and mobile browsers
- Tasks persist across page refreshes and sessions without data loss
- Interactions feel instantaneous; no visible lag under normal conditions
- A developer peer reviewing the app would describe the experience as "smooth and polished"

### Technical Quality Bar

| Requirement                    | Target                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Unit/integration test coverage | ≥ 70% meaningful coverage                                                              |
| E2E test scenarios             | ≥ 5 passing Playwright tests                                                           |
| Containerised deployment       | `docker-compose up` runs the full app successfully                                     |
| Accessibility                  | Zero critical WCAG violations                                                          |
| API & component design         | Best practices applied throughout (schema validation, error handling, typed contracts) |
| Security                       | No critical OWASP Top 10 issues (XSS, injection, etc.)                                 |

### Reference Quality Bar

- The codebase is readable and well-structured — a colleague could onboard to it without a walkthrough
- Every architectural and implementation decision is traceable to a BMAD planning artifact
- The project serves as a credible, reusable reference for "BMAD done right" on a full-stack TypeScript app

### Business Objectives

N/A — this is a personal learning project. There are no revenue, growth, or commercial targets.

### What Success Is NOT

- Daily active usage or user retention are not goals
- Feature completeness beyond the defined MVP scope is not a success criterion
- A Lighthouse score threshold, bundle size, or API response time SLA are not hard targets — though best practices in these areas are expected

---

## MVP Scope

### Core Features

- **View todos** — Display the full list of todos on load, with clear visual distinction between active and completed items
- **Create a todo** — Add a new task with a text description; appears instantly in the list
- **Complete a todo** — Toggle completion status on individual items; visual feedback (strikethrough/animation) confirms the action
- **Mark all as complete** — Single action to mark all active todos as done at once
- **Delete a todo** — Remove a task permanently; list updates without page reload
- **Persistence** — All todos survive page refresh and session restart
- **Responsive layout** — Works on desktop and mobile browsers
- **Empty, loading, and error states** — Polished handling of all non-happy-path UI states

### Out of Scope for MVP

The following are explicitly excluded from v1:

- User authentication and accounts
- Multi-user or collaboration features
- Task prioritisation or ordering
- Due dates and reminders / notifications
- Search or filtering by status/category
- Tags, labels, or categories
- Drag-and-drop reordering
- Clear all completed (bulk delete)

### MVP Success Criteria

- All core actions work correctly end-to-end (frontend → API → persistence)
- Application runs via `docker-compose up` with no manual setup
- ≥ 70% meaningful test coverage
- ≥ 5 passing Playwright E2E tests
- Zero critical WCAG accessibility violations
- No critical security issues (XSS, injection, etc.)

### Future Vision

The architecture should not prevent the addition of user authentication and multi-user support in a future iteration. Beyond that, no future features are planned or committed.
