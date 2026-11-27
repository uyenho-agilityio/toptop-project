# TopTop

Online shop management SaaS for TikTok Shop and Shopee sellers in Vietnam. Read `README.md` first, then `docs/intent`, `docs/spec` and `docs/tickets`.

## Rules

- Everything in the repo (code, commits, PRs, docs, tickets) is written in English.
- Commits: one line, Conventional Commits (`feat: ...`, `docs: ...`). No body, no trailers.
- Branches: one branch and one PR per ticket, started from `origin/main`. Never push to `main`.
- PR body has two sections: `Summary` and `Notes for review`.
- Code style: TypeScript only, and every function is an arrow function (ESLint `func-style`).
- Styling: write styles inline as Tailwind utility classes in `className`; no per-component CSS files, CSS modules or custom classes. `src/themes/globals.css` holds only the most global CSS (Tailwind import, base `body` styles). Colors, spacing, radii and fonts are theme tokens (CSS variables in `@theme`), not hard-coded values.
- Import a folder through its `index.ts` with the alias: `@/utils`, `@/hooks`, `@/services`, not `@/utils/cn` (ESLint `no-restricted-imports`). Every folder in `src/` has an `index.ts` that exports its modules (`themes` holds CSS only). An `index.ts` only re-exports: no constants, functions or other code in it; put them in their own file (for example `src/constants/time.ts`) and export that file from the `index.ts`.
- Server code (`src/server`: db, auth, env) starts each file with `import "server-only"`. `src/services` only holds client-side calls to the API, built on `httpClient`. Translations live in `src/i18n/messages`.
- `src/` layout: `app`, `constants`, `schemas`, `types`, `stores`, `hooks`, `services` (`httpClient` and shared methods), `utils`, `server`, `i18n`, `themes` (Tailwind and global CSS), `components`, `components/commons` (shared app components), `components/ui` (shadcn/ui primitives, generated). No `lib`.
- Tests first: a file in `src/constants`, `src/schemas`, `src/stores`, `src/hooks`, `src/services`, `src/utils`, `src/components/<Name>` or `src/components/commons/<Name>` needs its test file before it is written (hook `require-test-first`). `src/components/ui`, `src/types`, `src/themes`, `src/server` and `src/i18n` are not checked.
- Tenant isolation is mandatory: every query goes through the shared Business-scoped helper, and tenant tables have RLS (spec Q-FND-2).
- Server-side authorization, Zod validation and secrets from environment variables only (spec Q-SEC-1 to Q-SEC-7).
- Never edit an existing file in `drizzle/`; generate a new migration. `docs/intent` and `docs/spec` are approved docs: ask before changing them.

## Sub-agents

- `spec-checker`: checks a ticket's work against its acceptance criteria and spec.
- `rls-auditor`: audits Business (tenant) isolation.
