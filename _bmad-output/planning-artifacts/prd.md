---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-02b-vision",
    "step-02c-executive-summary",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain",
    "step-06-innovation",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nonfunctional",
    "step-11-polish"
  ]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-bmad-todo-2026-03-10.md"
workflowType: "prd"
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document - bmad-todo

**Author:** Giulia
**Date:** 2026-03-10

## Executive Summary

bmad-todo is a minimal, production-quality full-stack todo application built end-to-end through the BMAD methodology. Its purpose is dual: a reliable personal task manager for a single senior developer, and a reference-grade implementation demonstrating what rigorous BMAD-guided development looks like on a full-stack TypeScript project. The feature surface is intentionally narrow — create, view, complete, and delete todos — so that all engineering effort goes into doing those things exceptionally well. Technical quality is first-class: ≥70% meaningful test coverage, ≥5 Playwright E2E tests, Docker Compose deployment, zero critical accessibility violations, and no OWASP Top 10 security issues.

### What Makes This Special

Every existing todo app is either a black box (commercial tools) or a throwaway demo (open-source examples with no tests, no containerisation, no architectural consideration). bmad-todo fills a gap: a narrowly scoped product built with the same discipline as production software. The differentiator is process integrity — every decision is traceable from brief → PRD → architecture → stories → implementation. The core insight is that a well-executed small project is more valuable as a learning reference than a complex one: narrow scope lets the engineering standards, not the feature count, be the thing that impresses.

## Project Classification

- **Project Type:** Full-stack web application (SPA + REST API)
- **Domain:** Personal productivity (general)
- **Complexity:** Low — standard CRUD, straightforward persistence, no regulated domain
- **Project Context:** Greenfield — net-new application, no existing codebase

## Success Criteria

### User Success

- A user (technical or non-technical) can open the app and complete all core actions — create, complete, delete a todo — without any guidance or explanation
- Tasks persist across page refreshes and sessions with no data loss
- Interactions feel instantaneous under normal conditions; UI updates optimistically without waiting on server round-trips
- Works correctly on desktop and mobile browsers
- A developer peer reviewing the app would describe the experience as "smooth and polished"

### Business Success

This is a personal learning project with no commercial targets. Success is a complete end-to-end BMAD delivery: a finished artifact trail — brief → PRD → architecture → stories → implementation — alongside a working, deployed application. The artifact trail is itself a primary deliverable.

### Technical Success

| Requirement                    | Target                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Unit/integration test coverage | ≥70% meaningful coverage                                                      |
| E2E test scenarios             | ≥5 passing Playwright tests                                                   |
| Containerised deployment       | `docker-compose up` runs the full app with no manual setup                    |
| Accessibility                  | Zero critical WCAG violations                                                 |
| Security                       | No critical OWASP Top 10 issues (XSS, injection, etc.)                        |
| API & component design         | Best practices throughout: schema validation, error handling, typed contracts |
| Code readability               | A colleague could onboard to the codebase without a walkthrough               |

### Measurable Outcomes

- All core actions work correctly end-to-end (frontend → API → persistence)
- Every architectural and implementation decision is traceable to a BMAD planning artifact
- The project serves as a credible, reusable reference for "BMAD done right" on a full-stack TypeScript application

## Product Scope

**MVP Approach:** Experience MVP — the minimum set of features that delivers a complete, polished end-to-end experience. Not validating a market hypothesis; producing a reference-quality BMAD implementation. Solo developer (Giulia), no external team coordination.

### MVP — Minimum Viable Product

Supports user journeys 1, 2, and 3 (daily use, error recovery, non-technical casual visitor).

- **View todos** — Display the full list on load, with clear visual distinction between active and completed items
- **Create a todo** — Add a new task with a text description; appears instantly in the list (optimistic update)
- **Complete a todo** — Toggle completion status; visual feedback (strikethrough/animation) confirms the action
- **Delete a todo** — Remove a task permanently; list updates without page reload
- **Persistence** — All todos survive page refresh and session restart
- **Responsive layout** — Works on desktop and mobile browsers
- **Empty and loading states** — Clean empty state message when no todos exist; loading indicator on initial data fetch
- **Error feedback** — Backend handles errors gracefully; frontend displays a user-facing error message when an API call fails

### Post-MVP

- Mark all as complete (single bulk action)
- User authentication and accounts
- Due dates and reminders
- Task prioritisation or ordering
- Search or filtering by status/category
- Tags, labels, or categories
- Drag-and-drop reordering
- Clear all completed (bulk delete)

### Future Vision

- Multi-user and collaboration features
- Notifications and calendar/email integrations
- Architecture explicitly leaves the door open for auth and multi-user without over-engineering v1

## User Journeys

### Journey 1 — Giulia: Daily Use (Primary Happy Path)

It's Monday morning. Giulia opens a new browser tab. The app loads instantly — her todo list from Friday is right there, no login, no spinner, no onboarding. She types a reminder ("Book car service"), hits enter, and it appears at the top of the list immediately. During the day she knocks off two tasks, clicking the checkbox on each — a satisfying strikethrough animation confirms the action. At end of day she deletes the ones she no longer needs. She closes the tab. On Tuesday, everything is exactly where she left it.

### Journey 2 — Giulia: Error Recovery (Edge Case)

Giulia adds a task while on a flaky connection. The todo appears immediately (optimistic update), but the server call fails. The app shows a clear error state with a visual indicator on the failed item and a retry affordance. She retries; it saves. If she misses it and refreshes, the app is consistent with the server state — nothing is silently lost without feedback.

### Journey 3 — Husband: Non-Technical Casual Visitor

Giulia's husband picks up her laptop and sees the app open. He doesn't know what it is, but it's obvious — it's a list. He adds "buy milk" without asking how anything works, then marks it done when he gets home. Nothing confused him. Nothing broke. The interactions are self-evident on mobile without any instruction.

### Journey 4 — Colleague: Technical Evaluator

A developer peer is shown the app as a BMAD reference. They click around briefly, then ask to see the codebase. They pull it, run `docker-compose up`, and it just works. They read a test file, check the API schema, browse the component structure. Their verdict: "Clean. Solid test coverage. I can see where everything is."

### Journey Requirements Summary

| Capability                                      | Revealed By   |
| ----------------------------------------------- | ------------- |
| Optimistic UI updates on create/complete/delete | Journeys 1, 2 |
| Persistent state across sessions and refreshes  | Journey 1     |
| Error/failed-request feedback with retry        | Journey 2     |
| Zero-onboarding UX, self-evident interactions   | Journey 3     |
| Responsive layout (mobile)                      | Journey 3     |
| `docker-compose up` one-command deployment      | Journey 4     |
| Meaningful test coverage + typed API contracts  | Journey 4     |

## Technical Context

### Architecture

- Single-page application (SPA) — no full page reloads on CRUD operations
- REST API backend; frontend communicates via HTTP/JSON
- Optimistic UI updates: UI state reflects user actions immediately, with error rollback on server failure
- No server-side rendering required; client-side rendering is sufficient
- No real-time multi-user collaboration; single-user application

### Browser Support

| Browser              | Support Level |
| -------------------- | ------------- |
| Chrome (latest)      | Full          |
| Firefox (latest)     | Full          |
| Safari (latest)      | Full          |
| Edge (latest)        | Full          |
| Mobile Safari (iOS)  | Full          |
| Chrome for Android   | Full          |
| IE / legacy browsers | Not supported |

### Responsive Design

- Mobile-first layout; fully functional on screens from 375px width upward
- Touch-friendly interaction targets (minimum 44×44px per WCAG 2.5.5)
- No native device features required

### SEO

Not applicable — personal productivity tool, not intended for public indexing.

## Functional Requirements

### Todo Management

- **FR1:** Users can view a list of all todos
- **FR2:** Users can see a clear visual distinction between active and completed todos
- **FR3:** Users can create a new todo with a text description
- **FR4:** Users can toggle the completion status of an individual todo
- **FR5:** Users can delete an individual todo
- **FR6:** Users can see a meaningful empty state when no todos exist

### Data Persistence

- **FR7:** The system persists all todos across page refreshes
- **FR8:** The system persists all todos across browser sessions
- **FR9:** All todo state is stored server-side and treated as authoritative

### Optimistic UI

- **FR10:** The UI reflects a newly created todo immediately, without waiting for server confirmation
- **FR11:** The UI reflects a toggled completion status immediately, without waiting for server confirmation
- **FR12:** The UI reflects a deleted todo immediately, without waiting for server confirmation
- **FR13:** The UI reverts an optimistic change if the corresponding API call fails

### Feedback & States

- **FR14:** Users see a loading indicator while todos are being fetched on initial load
- **FR15:** Users see visual confirmation (animation/strikethrough) when a todo is marked complete
- **FR16:** Users see a user-facing error message when an API call fails

### Accessibility & Responsive Design

- **FR17:** All interactive elements are keyboard accessible
- **FR18:** All interactive elements are screen-reader compatible with appropriate ARIA labels
- **FR19:** Focus is managed correctly after dynamic content changes (create, delete)
- **FR20:** The UI is fully functional on screen widths from 375px upward
- **FR21:** The UI is fully functional on touch-based mobile devices

### API & Backend

- **FR22:** The backend exposes RESTful API endpoints for all todo operations (list, create, complete, delete)
- **FR23:** The backend validates all incoming request data against a defined schema
- **FR24:** The backend returns appropriate HTTP error responses with descriptive error information

### Deployment

- **FR25:** The full application stack starts with a single `docker-compose up` command with no manual setup

## Non-Functional Requirements

### Performance

- The application initial load completes within 2 seconds on a standard broadband connection
- All todo create, complete, and delete operations update the UI within one animation frame via optimistic updates — perceived latency is effectively zero
- API responses for all CRUD operations complete within 500ms under normal conditions

### Security

- No critical OWASP Top 10 vulnerabilities (injection, XSS, broken access control, etc.)
- All API inputs are validated and sanitised server-side before processing
- The application does not expose internal error details in API responses (stack traces, database errors)
- Dependencies are sourced from trusted package registries and kept reasonably up to date

### Accessibility

- WCAG 2.1 AA compliance — zero critical violations as reported by an automated audit tool (e.g., axe)
- All interactive elements are operable via keyboard alone
- All meaningful UI elements have accessible names (via labels or ARIA)
- Colour contrast ratios meet WCAG AA minimums for all text and interactive elements

### Reliability

- All todo mutations (create, complete, delete) are either confirmed persisted or the user is notified of failure — no silent data loss
- The application handles API failures gracefully without crashing or entering an unrecoverable state
- Data is consistent between the frontend and backend after any operation completes or fails
