# Copilot Instructions

This is a instructions file for GitHub Copilot. It uses Markdown to describe coding style and conventions for this project.
Copilot should follow these rules when generating or editing code in this repo.

---

## Prime directive

- Produce **production-ready, type-safe, accessible, secure** code.
- Default to **boring, maintainable** solutions.
- Prefer **small diffs** and **clear file paths** in responses.
- If repo context is missing (schemas, DB client, existing patterns), ask for the relevant file(s) before large refactors.

---

## Stack assumptions

- **Next.js 16+**, **TypeScript (strict)**, **App Router only**
- Styling: **Tailwind CSS** + **CSS Modules** (preferred for complex styles)
- Components: **Radix UI primitives** preferred (unstyled), custom components are allowed/encouraged when better for DX and accessibility
- Auth: **Clerk**
- Data: **Supabase + Prisma 7**
- State: **Zustand** for global UI state; **React state** for local state
- Fetching/caching: **TanStack Query**, always behind wrappers/hooks (no raw `useQuery` scattered everywhere)
- Validation: **Zod** for every external input, centralized to avoid duplication

---

## Folder conventions (preferred)

- `src/app/` — routes, layouts, route handlers (`route.ts`)
- `src/components/` — shared UI components
- `src/features/` — feature-scoped code (UI + hooks + actions + queries)
- `src/styles/` — CSS Modules (complex styling lives here)
- `src/lib/db/` — Prisma + Supabase clients and DB helpers
- `src/conf/` — env + constants + zod schemas/validators
- `src/lib/auth/` (optional) — auth helpers/wrappers (Clerk server helpers, guards, role checks)

---

## Standard feature folder template (required)

Each feature lives in `src/features/<feature>/` and should follow this template:

- `src/features/<feature>/components/` — feature UI components
- `src/features/<feature>/api.ts` — fetchers (network/DB boundaries only, no React)
- `src/features/<feature>/queries.ts` — TanStack Query wrappers/hooks + query keys
- `src/features/<feature>/actions.ts` — Server Actions for CUD + form submissions
- `src/features/<feature>/schema.ts` — feature-specific Zod schema re-exports (import from `src/conf/schemas.ts` when possible)
- `src/features/<feature>/types.ts` (optional) — feature types if needed
- `src/features/<feature>/index.ts` (optional) — public exports for clean imports

Rules:
- Components import **hooks/wrappers**, not raw fetchers.
- Server Actions live in `actions.ts` (or `actions/*` if large).
- Keep browser-only code out of server modules and DB code.

---

## Imports

- Prefer path alias imports: `@/…`
- Relative imports like `../../..` are allowed but discouraged; use them only within a small local folder boundary.

---

## TypeScript rules (strict)

- No `any`. Use `unknown` + narrowing, or Zod parsing.
- Avoid unsafe casts (`as X`) unless unavoidable; add a comment explaining why.
- Exported functions/hooks should have explicit return types when non-trivial.
- Prefer `as const` and discriminated unions for state machines and action results.

---

## Next.js rules (App Router only)

### Server vs Client components

- Default to **Server Components**.
- Use `"use client"` only when needed (state, effects, browser APIs, Radix interactive components).
- Keep client components **leaf-level**; do not pull heavy server modules into the client bundle.

### Mutations & API style (use best judgment)

Use **Server Actions** for:
- Create/Update/Delete mutations
- Form submissions
- In-repo mutations where HTTP is not required

Use **Route Handlers (`route.ts`)** for:
- Streaming responses (AI / LLM / SSE / Web Streams)
- Webhooks
- Custom headers, cookies, redirects, status codes, CORS control
- Public/explicit HTTP APIs (mobile clients, third parties, internal HTTP boundary)

If unsure: default to **Server Actions** for app-internal mutations, and **Route Handlers** when HTTP behavior matters.

---

## Styling rules (Tailwind + CSS Modules)

### Default styling

- Prefer **Tailwind** for:
  - layout, spacing, flex/grid, quick composition
  - small visual tweaks

- Prefer **CSS Modules in `src/styles/`** for:
  - complex visuals (gradients, masks, animations, pseudo-elements)
  - multi-state styling (hover/active/selected variants)
  - reusable “designy” component skins

### Mixing Tailwind + CSS Modules

- Do not heavily mix both in the same component.
- If using CSS Modules, Tailwind should be limited to layout-only (e.g., `flex`, `gap`, `w-full`), not full design systems.

### className composition

- Always use `clsx` for combining strings and module classes.
- Prefer grouped Tailwind strings for readability:

```
className={clsx(
  "mr-2",
  "flex items-center gap-2",
  "px-2 py-1",
  "bg-white dark:bg-black",
  "rounded-md",
  styles.Button,
)}
```

---

## Components (Radix-first)

- Prefer Radix primitives for accessible patterns (dialogs, dropdowns, popovers, tabs, etc.).
- Build custom wrappers around Radix for:
  - consistent styling API
  - consistent props/types
  - consistent accessibility defaults

- Custom non-Radix components are allowed when:
  - Radix is overkill
  - the custom approach is clearer
  - accessibility is preserved or improved
  - better DX or performance can be achieved with a custom solution

---

## Authentication (Clerk)

- Use Clerk as the default authentication provider.
- Prefer auth checks on the server (Server Components, Server Actions, Route Handlers).
- Keep auth helper wrappers in `src/lib/auth/` (e.g., “require user”, “optional user”, “role check”).
- Do not leak auth/session details to the client unnecessarily.
- Protected routes should either:
  - gate on the server and render an appropriate state, or
  - redirect using Next.js routing patterns, depending on the feature.

---

## Configuration: constants + env (bullet-proof)

### Constants

- Put constants in `src/conf/constants.ts`.
- No magic values sprinkled across the codebase.

### Environment variables

Rules:
- **Hard rule:** Never read `process.env` outside `src/conf/env.ts`.
- Provide Vercel-friendly fallback behavior:
  - prefer `NEXT_PUBLIC_*` in the browser
  - fall back to non-public name on the server
  - if missing, return falsy values that fail loudly in consumers

Recommended pattern:

```
/* src/conf/env.ts */
type EnvKey = "SUPABASE_URL" | "SUPABASE_ANON_KEY" | "DATABASE_URL";

function readEnv(key: EnvKey): string {
  const publicKey = `NEXT_PUBLIC_${key}` as const;
  return (
    process.env[publicKey] ?? process.env[key] ?? "" /* falsy on purpose */
  );
}

export const env = {
  supabaseUrl: readEnv("SUPABASE_URL"),
  supabaseAnonKey: readEnv("SUPABASE_ANON_KEY"),
  databaseUrl: readEnv("DATABASE_URL"),
} as const;

/* Use only in server-only codepaths to crash early with a clear error */
export function requireEnv(value: string, name: EnvKey): string {
  if (!value) {
    throw new Error(
      `Missing env: ${name}. Set NEXT_PUBLIC_${name} (client) or ${name} (server).`,
    );
  }
  return value;
}
```

---

## Validation: Zod everywhere (centralized)

- Validate every external input:
  - route params, search params, request bodies
  - form submissions
  - webhook payloads
- Centralize schemas to avoid duplication:
  - `src/conf/validators.ts` OR `src/conf/schemas.ts`
- Prefer schema reuse rather than rewriting similar shapes in multiple places.
- Parse early, return typed values.

Example convention:
- `src/conf/schemas.ts` exports Zod schemas
- Feature code imports schemas and uses `schema.parse(...)` at the boundary

---

## Data layer: Supabase + Prisma (in `src/lib/db/`)

- All DB/client initialization lives in `src/lib/db/`.
- No DB client creation inside React components.

Suggested files:
- `src/lib/db/prisma.ts` — Prisma singleton
- `src/lib/db/supabase/server.ts` — server supabase client
- `src/lib/db/supabase/browser.ts` — browser supabase client (NEXT_PUBLIC keys only)
- `src/lib/db/index.ts` — re-exports

Rules:
- Server code can use `requireEnv(...)` to fail fast.
- Client code must never rely on non-public env vars.

---

## Querying: TanStack Query behind wrappers only

- Never scatter raw `useQuery` calls in components.
- Create feature wrappers:
  - fetcher: `src/features/<feature>/api.ts`
  - query keys + hooks: `src/features/<feature>/queries.ts`
- Components import hooks, not the raw fetcher.

Example conventions:
- `getTrack(trackId)` fetcher
- `useTrackQuery(trackId)` hook (internally calls `useQuery`)

---

## State: Zustand + React state

- Use Zustand for cross-app UI state:
  - player controls, modals, global toggles
- Use local React state for local component-only state.

---

## Error handling

- Prefer clear, actionable errors.
- At boundaries (DB/network), wrap in `try/catch` and return safe messages.
- Avoid leaking secrets or internal stack traces to the client.

---

## Accessibility (non-negotiable)

- Clickable things are `<button>` or `<a>`, not `<div>`.
- Use proper labels for inputs.
- Ensure Radix components preserve keyboard navigation.
- Add `aria-*` where necessary.

---

## Testing (baseline expectations)

- Prefer E2E tests with Playwright for critical flows.
- Add `data-testid` attributes for stable selectors when needed.
- Tests should be deterministic: avoid fixed sleeps, prefer Playwright auto-waits.