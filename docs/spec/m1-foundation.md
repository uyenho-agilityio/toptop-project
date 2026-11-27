# Spec: M1 Foundation (data model, isolation, shell, shared display)

**Tickets:** T-01, T-02, T-03, T-04, T-05, T-06, T-07
**Milestone:** M1

## Decisions

| ID | Answer | Date |
| --- | --- | --- |
| Q-FND-1 | **No.** M1 does not add orders or cost tables and does not process cost or profit. M4 adds them. T-01 stays as written in the Build Plan. | 2026-11-26, product owner |
| Q-FND-2 | **Two layers of tenant isolation, both in M1.** (1) A shared query helper that requires a Business id; every read and write goes through it. (2) Postgres row-level security (RLS) on every table that holds Business data: a policy compares the row's Business id with the request's Business, which is set per request inside a transaction. The app connects with a database role that is not the table owner and cannot bypass RLS. Why both: the helper alone fails open when one query forgets the filter; RLS makes a forgotten filter return no rows. Neon's HTTP driver cannot hold a transaction, so the app uses the Neon serverless pool driver (WebSocket) for tenant queries. | 2026-11-27, product owner |
| Q-FND-3 | Migrations use Drizzle Kit (the stack already uses Drizzle ORM). | 2026-11-26, product owner accepted the proposed default |
| Q-FND-4 | Compact amounts on cards and full amounts in tables, as in the Prototype. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-5 | Fixed Vietnam time for the whole app in M1. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-6 | The AI entry is a header button shown to Admins only (Brief 9, Prototype); its behavior arrives in M7. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-7 | Menu items open a "coming soon" placeholder page until their module ships. | 2026-11-26, product owner accepted the proposed defau| Q-SEC-1 | **Authorization is checked on the server for every API route and server action.** Deny by default: a route with no explicit permission check is rejected. The UI guard is only a convenience. | 2026-11-27, product owner |
| Q-SEC-2 | **Input is validated on the server** with a schema (Zod) for every API route and server action: unknown fields are dropped, wrong types are rejected with a clear error. Database access goes through Drizzle with bound parameters; no SQL is built by joining strings. | 2026-11-27, product owner |
| Q-SEC-3 | **Secrets are read only from environment variables** (Cloudflare secrets in production). No secret is committed, logged or sent to the browser; only variables deliberately prefixed `NEXT_PUBLIC_` reach the client. The app fails at startup when a required secret is missing. | 2026-11-27, product owner |
| Q-SEC-4 | **Rate limits** on sign-in and on invitations: sign-in attempts 10 per minute per IP; creating invitations 20 per hour per Admin; accepting an invitation 10 per minute per IP. Over the limit: HTTP 429 with a clear message. These are the M1 defaults and can be tuned in configuration. | 2026-11-27, product owner |
| Q-SEC-5 | **Secure cookies and CSRF.** The session cookie is `HttpOnly`, `Secure` and `SameSite=Lax`. State-changing requests use POST (never GET) and Better Auth's origin check. | 2026-11-27, product owner |
| Q-SEC-6 | **Invitation tokens** are random (at least 32 bytes), stored only as a hash, single-use and expire after 7 days (see `m1-auth-permissions.md`). | 2026-11-27, product owner |
| Q-SEC-7 | **Basic security headers** on every response: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `frame-ancestors 'none'` (clickjacking). A full Content-Security-Policy is added in M8 (hardening). | 2026-11-27, product owner |
lt |

## Sources

- Brief 2.5 (Designed to grow), 3 (Application structure), 7 (Data sources, "unavailable data is identified as unavailable"), 9 (UI/UX layout and design principles).
- Prototype: `sideHtml()` (sidebar), `headHtml()` (header), `kpi()` (metric card), `money()`, `pct()`, `fmtDate()` (formatting), `can()` (what the menu shows).
- Plan: Decisions (Organization, Database, Hosting), Data model, Rules ("Data rules").

## Behavior

### Data model (T-01)

- **No orders or cost tables in M1.** Cost and profit are processed from M4 on (Build Plan, tickets T-26 to T-28). M4 adds the orders and cost tables then. The M1 model only has to stay open to that: a later milestone can add tables without restructuring Business, shop, permission or source records.
- A Business holds one or more shops. Each Business is one Better Auth organization (Plan, Decisions, 2026-11-26).
- An account can later belong to several Businesses, with a different role in each. M1 only needs the structure to allow it (Brief 2.5).
- Permissions are rows of (user, module, level). Only View and No Access are offered now. More levels and roles must be addable without a structural change (Brief 2.5).
- The taxpayer profile and each platform connection are their own records, apart from Business and shop.
- Seller type is a list with Individual and Household business. Company can be added later without redesigning data.
- Every record that comes from outside carries a source (platform API, import file or manual entry).
- Product attributes are configuration, not fixed columns (Brief 2.5). This does not need tables in M1, but the model must not block it.
- The ER diagram is reviewed and approved before T-02 and later tickets start.

### Data isolation (T-02)

- Every read and write is scoped to one Business. A request without a Business scope is rejected.
- An Admin of Business A can never read or write Business B data. This has an automated test.
- Isolation has two layers: the shared query helper and row-level security in Postgres (Q-FND-2). Both are in M1.

### Source of each record (T-03)

- A shared field and a shared display component with three values: platform API, import file, manual entry.
- The label shows in tables and detail views. M1 only ships the field and the component, because no sourced record exists until M2.

### "Not available yet" convention (T-04)

- One shared component renders a missing value as "not available yet". It applies to cards, tables and charts (Brief 7: "never shown as a fabricated zero").
- A real zero renders as 0.
- "Missing" means data was not entered or not synced. The caller tells the component which case applies.

### Formatting (T-05)

- Money is VND with thousands separators. Dates use Vietnam time. One shared helper follows the active language (see `m1-i18n-theme-seed.md`).
- The Prototype shows how the two languages differ: Vietnamese uses a decimal comma and `d/m/yyyy`, English uses a decimal point and `Mon d, yyyy`.

### App shell and menu (T-06)

- Sidebar: Business selector, the eight modules in this order: Overview, Sales, Marketing, Inventory, Supplier, Finance, Tax, Reports; then Settings, then the user profile (Brief 9).
- A User sees only the modules granted, never the Tax tab (Brief 9, Brief 2.3). An Admin also sees Settings. The AI Assistant entry is shown to Admins only (Ask AI is Admin only, see `m1-auth-permissions.md`). The Prototype hides Settings from Users and from the System Admin.
- The System Admin does not see the Business workspace shell. They see the separate System Console (see `m1-system-admin.md`).
- Header: page title, Business and shop context, the shared period filter (see `m1-period-filter.md`), and quick actions.
- Tablet and phone: the menu becomes a drawer. The Prototype's breakpoints are 560, 900 and 1100 px wide.
- The Business selector in M1 is display-only. The Prototype shows a note that an account belongs to one Business for now (Brief 2.5).

### Metric card component (T-07)

- Parts: label, value, sub line, change versus previous period, one-line explanation (Brief, Module 01).
- States: normal, and "not available yet" (T-04). A negative profit value uses a negative style.
- A card links to its module. If the user cannot open that module, the card is not rendered at all (Brief, Module 01).
- The change line takes its value and format from the metrics engine (see `m1-metrics-engine.md`). The component does not compute anything.

### Security baseline (T-02, T-09, T-11, T-12, T-14)

These measures are required in M1 (Q-FND-2, Q-SEC-1 to Q-SEC-7). They are not optional and not added later.

- **Tenant isolation:** the shared query helper plus row-level security (Q-FND-2). A query run without a Business context returns no rows and the helper rejects it.
- **Server-side authorization** on every API route and server action, deny by default (Q-SEC-1).
- **Input validation** with a schema on every API route and server action, and bound parameters for every query (Q-SEC-2).
- **Secrets** only from environment variables, never committed, logged or sent to the browser (Q-SEC-3).
- **Rate limits** on sign-in and invitations (Q-SEC-4).
- **Cookies and CSRF:** `HttpOnly`, `Secure`, `SameSite=Lax`, POST for changes, origin check (Q-SEC-5).
- **Invitation tokens:** random, hashed at rest, single-use, 7-day expiry (Q-SEC-6).
- **Security headers** (Q-SEC-7).

## Edge cases

- A request carries a Business id the account does not belong to: reject, do not return an empty list.
- A record with no known source: the label shows "unknown source" rather than being blank.
- A card receives a null value and a non-null change: show "not available yet" and no change.
- Very large amounts: the helper must not overflow or lose digits; VND has no decimals.
- A User with access to zero modules still sees the shell, with an empty state (Prototype: route `none`).

## Acceptance criteria

- [ ] The ER diagram covers Business, shops, per-user per-module permissions, taxpayer profile, platform connection, seller type list, record source, and is approved.
- [ ] A query without a Business scope is rejected, and the test "Admin of Business A cannot read Business B data" passes.
- [ ] A record shows its source label in a table and in a detail view.
- [ ] The shared component shows "not available yet" for missing data and 0 for a real zero, in a card, a table and a chart.
- [ ] Money and dates render correctly in Vietnamese and in English, using Vietnam time.
- [ ] The shell shows only the modules a User may open, never Tax, and switches to a drawer menu on tablet and phone.
- [ ] A metric card renders its label, value, sub line, change and explanation, supports the missing-data state, and links to its module.
- [ ] Tenant tables have row-level security: a query run with no Business context returns no rows, and a query for another Business returns none of its rows, even when the app code forgets the filter.
- [ ] Every API route and server action has an explicit permission check and a validation schema; a route without them is rejected (a test lists the routes and fails on any that lack one).
- [ ] Rate limits answer HTTP 429 on sign-in and on invitations; cookies are `HttpOnly`, `Secure` and `SameSite=Lax`; the security headers are present on responses.
- [ ] No secret is in the repository or in the client bundle, and the app refuses to start when a required secret is missing.

## Out of scope for M1

- The data change log (T-08, M2) and per-shop filters (M2).
- Real module screens behind the menu items.
- Orders and cost tables (M4).
