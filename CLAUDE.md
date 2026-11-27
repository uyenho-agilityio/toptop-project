# TopTop

Online shop management SaaS for TikTok Shop and Shopee sellers in Vietnam. Read `README.md` first, then `docs/intent`, `docs/spec` and `docs/tickets`.

## Rules

- Everything in the repo (code, commits, PRs, docs, tickets) is written in English.
- Commits: one line, Conventional Commits (`feat: ...`, `docs: ...`). No body, no trailers.
- Branches: one branch and one PR per ticket, started from `origin/main`. Never push to `main`.
- PR body has two sections: `Summary` and `Notes for review`.
- Code style: TypeScript only, and every function is an arrow function (ESLint `func-style`).
- `src/` layout: `app`, `constants`, `schemas`, `types`, `stores`, `hooks`, `services` (`httpClient` and shared methods), `utils`, `themes` (Tailwind and global CSS), `components`, `components/commons` (shared app components), `components/ui` (shadcn/ui primitives, generated). No `lib`.
- Tests first: a file in `src/constants`, `src/schemas`, `src/stores`, `src/hooks`, `src/services`, `src/utils`, `src/components/<Name>` or `src/components/commons/<Name>` needs its test file before it is written (hook `require-test-first`). `src/components/ui`, `src/types` and `src/themes` are not checked.
- Tenant isolation is mandatory: every query goes through the shared Business-scoped helper, and tenant tables have RLS (spec Q-FND-2).
- Server-side authorization, Zod validation and secrets from environment variables only (spec Q-SEC-1 to Q-SEC-7).
- Never edit an existing file in `drizzle/`; generate a new migration. `docs/intent` and `docs/spec` are approved docs: ask before changing them.

## Sub-agents

- `spec-checker`: checks a ticket's work against its acceptance criteria and spec.
- `rls-auditor`: audits Business (tenant) isolation.
