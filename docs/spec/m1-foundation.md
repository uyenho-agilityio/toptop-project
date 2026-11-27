# Spec: M1 Foundation (data model, isolation, shell, shared display)

**Tickets:** T-01, T-02, T-03, T-04, T-05, T-06, T-07
**Milestone:** M1

## Decisions

| ID | Answer | Date |
| --- | --- | --- |
| Q-FND-1 | **No.** M1 does not add orders or cost tables and does not process cost or profit. M4 adds them. T-01 stays as written in the Build Plan. | 2026-11-26, product owner |
| Q-FND-2 | A shared query helper that requires a Business id, plus the T-02 test. Row-level security can be added later. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-3 | Migrations use Drizzle Kit (the stack already uses Drizzle ORM). | 2026-11-26, product owner accepted the proposed default |
| Q-FND-4 | Compact amounts on cards and full amounts in tables, as in the Prototype. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-5 | Fixed Vietnam time for the whole app in M1. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-6 | The AI entry is a header button shown to Admins only (Brief 9, Prototype); its behavior arrives in M7. | 2026-11-26, product owner accepted the proposed default |
| Q-FND-7 | Menu items open a "coming soon" placeholder page until their module ships. | 2026-11-26, product owner accepted the proposed default |

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

## Edge cases

- A request carries a Business id the account does not belong to: reject, do not return an empty list. (Proposed)
- A record with no known source: the label shows "unknown source" rather than being blank. (Proposed)
- A card receives a null value and a non-null change: show "not available yet" and no change. (Proposed)
- Very large amounts: the helper must not overflow or lose digits; VND has no decimals. (Proposed; see Q-FND-4)
- A User with access to zero modules still sees the shell, with an empty state (Prototype: route `none`).

## Acceptance criteria

- [ ] The ER diagram covers Business, shops, per-user per-module permissions, taxpayer profile, platform connection, seller type list, record source, and is approved.
- [ ] A query without a Business scope is rejected, and the test "Admin of Business A cannot read Business B data" passes.
- [ ] A record shows its source label in a table and in a detail view.
- [ ] The shared component shows "not available yet" for missing data and 0 for a real zero, in a card, a table and a chart.
- [ ] Money and dates render correctly in Vietnamese and in English, using Vietnam time.
- [ ] The shell shows only the modules a User may open, never Tax, and switches to a drawer menu on tablet and phone.
- [ ] A metric card renders its label, value, sub line, change and explanation, supports the missing-data state, and links to its module.

## Out of scope for M1

- The data change log (T-08, M2) and per-shop filters (M2).
- Real module screens behind the menu items.
- Orders and cost tables (M4).
