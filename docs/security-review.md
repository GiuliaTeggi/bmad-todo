# Security Review — bmad-todo

**Date:** 2026-03-16  
**Reviewed by:** GitHub Copilot (AI-assisted review)  
**Scope:** Full-stack codebase — `apps/backend`, `apps/frontend`, `packages/shared`, Dockerfiles, `docker-compose.yml`, `nginx.conf`  
**Methodology:** Static code analysis against [OWASP Top 10](https://owasp.org/www-project-top-ten/) and common web security best practices.

---

## Summary

| #   | Finding                                    | Severity       | Status    |
| --- | ------------------------------------------ | -------------- | --------- |
| S1  | nginx serving SPA with no security headers | Medium         | **Fixed** |
| S2  | `:id` route param not validated as UUID    | Low            | **Fixed** |
| S3  | esbuild advisory in drizzle-kit (dev dep)  | Low (dev-only) | Accepted  |
| S4  | CORS wildcard fallback in dev              | Info           | Accepted  |
| S5  | No API rate limiting                       | Info           | Accepted  |

Overall risk level: **Low** — no critical or high severity findings.

---

## Detailed Findings

### S1 — nginx serving SPA with no security headers _(Medium — Fixed)_

**Location:** `apps/frontend/nginx.conf`

**Description:**  
The nginx server that serves the React SPA had no HTTP security response headers. Without these, browsers apply no restrictions on framing, MIME sniffing, or resource loading origins — leaving the app open to clickjacking and content injection via third-party resources.

**Remediation applied:**  
Added the following headers at the `server` block level in `nginx.conf`:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none';" always;
```

- **`X-Content-Type-Options: nosniff`** — prevents MIME-type sniffing attacks
- **`X-Frame-Options: DENY`** — prevents clickjacking via iframes (also enforced by `frame-ancestors 'none'` in CSP)
- **`Referrer-Policy`** — limits referrer information sent to third parties
- **`Content-Security-Policy`** — restricts resource loading to same origin only; `unsafe-inline` for styles is required since Vite injects critical CSS as inline `<style>` tags

---

### S2 — `:id` route param not validated as UUID _(Low — Fixed)_

**Location:** `apps/backend/src/routes/todos.ts` — `todoParamsSchema`

**Description:**  
The `id` path parameter in `PATCH /api/todos/:id` and `DELETE /api/todos/:id` was validated only as `z.string()`. Any non-UUID string (e.g. `"abc"`, `"../etc"`) would pass validation, reach the database, and cause PostgreSQL to throw `invalid input syntax for type uuid` — which was caught and returned as a generic 500. This leaks no data but produces an incorrect HTTP status code and wastes a database round-trip.

**Remediation applied:**  
Changed the schema to `z.string().uuid(...)`:

```ts
const todoParamsSchema = z.object({
  id: z.string().uuid("Invalid todo ID format")
})
```

Non-UUID IDs now return a `400 Bad Request` with a `VALIDATION_ERROR` code before any database interaction.

---

### S3 — esbuild advisory in drizzle-kit (dev dependency, not in production) _(Low — Accepted)_

**Location:** `npm audit` report — `node_modules/drizzle-kit` → `@esbuild-kit/esm-loader` → `esbuild <=0.24.2`

**Advisory:** [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) — esbuild dev server can be queried by any website when running.

**Assessment:**  
`drizzle-kit` is a **dev-only dependency** used to run database migrations during development (`npm run db:migrate`). It is excluded from production Docker images via `npm ci --omit=dev`. The vulnerability only applies when a dev server is actively running and exposed — it has no impact on the deployed application.

**Decision:** Accept risk. The fix (`npm audit fix --force`) would downgrade `drizzle-kit` to a breaking version (0.18.1). Monitor for a non-breaking patch release.

---

### S4 — CORS wildcard fallback in development _(Info — Accepted)_

**Location:** `apps/backend/src/app.ts`

```ts
app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || true
})
```

**Description:**  
When `FRONTEND_ORIGIN` is not set, `@fastify/cors` is configured with `origin: true`, which reflects any origin. In production (Docker Compose), `FRONTEND_ORIGIN` is explicitly set to `http://localhost:8080`, so the correct single-origin restriction applies. The fallback only activates in local development where no env var is configured.

**Decision:** Accept risk for local development. No change needed. For future hardening, consider defaulting to `http://localhost:5173` instead of `true`.

---

### S5 — No API rate limiting _(Info — Accepted)_

**Location:** `apps/backend/src/app.ts`

**Description:**  
No rate limiting is applied to any API endpoint. An unauthenticated client can make unlimited requests. For a single-user local application this is an acceptable trade-off. For any public deployment, rate limiting (e.g. via `@fastify/rate-limit`) should be added.

**Decision:** Out of scope for v1. Document as a known limitation.

---

## Confirmed Non-Issues (OWASP Top 10 Checklist)

| OWASP Category                    | Assessment                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **A01 Broken Access Control**     | No auth in v1 by design; no multi-user data isolation required                                                        |
| **A02 Cryptographic Failures**    | No sensitive data stored; no auth tokens; database credentials handled via env vars only                              |
| **A03 Injection — SQL**           | Drizzle ORM with parameterized queries throughout; no raw SQL; `eq()` operator used for all filtering                 |
| **A03 Injection — XSS**           | React renders all user content as text nodes (JSX `{todo.text}`); no `dangerouslySetInnerHTML` anywhere in codebase   |
| **A03 Injection — Command**       | No shell command execution anywhere in the codebase                                                                   |
| **A04 Insecure Design**           | Internal errors are caught and returned as generic messages; stack traces never exposed in API responses              |
| **A05 Security Misconfiguration** | `@fastify/helmet` applied with explicit CSP directives; non-root users in both Docker containers (S1 fixed, S2 fixed) |
| **A06 Vulnerable Components**     | One dev-only advisory (S3, accepted); no production-runtime vulnerabilities found                                     |
| **A07 Auth Failures**             | No authentication implemented (by design for v1)                                                                      |
| **A08 Data Integrity**            | Zod validates all incoming request bodies; shared type contracts between frontend and backend                         |
| **A09 Logging Failures**          | Fastify structured logging enabled in production; errors logged server-side before returning generic messages         |
| **A10 SSRF**                      | Backend makes no outbound HTTP requests based on user input                                                           |
