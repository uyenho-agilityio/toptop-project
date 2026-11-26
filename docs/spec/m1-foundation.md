# Spec: M1 Foundation (data model, isolation, shell, shared display)

**Tickets:** T-01, T-02, T-03, T-04, T-05, T-06, T-07
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-FND-1 | T-01 lists Business, shops, permissions, taxpayer profile, platform connections and seller type, but not orders, products, costs or ad spend. Does the ER diagram include the normalized commerce records (Brief 7), or does each later milestone add its own tables? | The metrics engine (T-25) needs an input shape, and T-25 depends only on T-01. | T-01, T-25 |
| Q-FND-2 | How is "every query filters by Business" enforced: a shared query helper in code, Postgres row-level security, or both? | The Plan states the rule and a test, not the mechanism. The choice changes how T-02 is built and tested. | T-02 |
| Q-FND-3 | Migrations: which tool runs them and how are they managed? | The Plan marks this "Not decided yet" (Data model section). The first schema ships in this milestone. | T-01 |
| Q-FND-4 | Money display: T-05 says "VND with separators". The Prototype shows compact amounts on cards ("1,2 triệu", "1.2M ₫", "tỷ"/"B") and full amounts elsewhere. Which format applies where? | One shared helper has to cover both. | T-05, T-07 |
| Q-FND-5 | Time zone: T-05 says "Vietnam time", while Brief 6.1 makes time zone a Business setting. Is Vietnam time fixed for the whole app in M1? | Period boundaries (T-21) depend on it. | T-05, T-21 |
| Q-FND-6 | The Plan puts the AI Assistant in the sidebar (T-06). Brief 9 and the Prototype put it behind one shared button in the header. In M1, where does the AI entry appear, and does it exist at all before M7? | Layout of the shell. | T-06 |
| Q-FND-7 | The eight module screens do not exist until M3 to M7. What does a menu item open in M1: a placeholder page, or is the item hidden until its module ships? | T-06 AC "Sidebar with 8 modules". | T-06 |

## Sources

- Brief 2.5 (Designed to grow), 3 (Application structure), 7 (Data sources, "unavailable data is identified as unavailable"), 9 (UI/UX layout and design principles).
- Prototype: `sideHtml()` (sidebar), `headHtml()` (header), `kpi()` (metric card), `money()`, `pct()`, `fmtDate()` (formatting), `can()` (what the menu shows).
- Plan: Decisions (Organization, Database, Hosting), Data model, Rules ("Data rules").

## Behavior

### Data model (T-01)

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
- A User sees only the modules granted, never the Tax tab (Brief 9, Brief 2.3). An Admin also sees Settings. The Prototype hides Settings from Users and from the System Admin.
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

- [ ] The ER diagram covers Business, shops, per-user per-module permissions, taxpayer profile, platform connection, seller type list and record source, and is approved.
- [ ] A query without a Business scope is rejected, and the test "Admin of Business A cannot read Business B data" passes.
- [ ] A record shows its source label in a table and in a detail view.
- [ ] The shared component shows "not available yet" for missing data and 0 for a real zero, in a card, a table and a chart.
- [ ] Money and dates render correctly in Vietnamese and in English, using Vietnam time.
- [ ] The shell shows only the modules a User may open, never Tax, and switches to a drawer menu on tablet and phone.
- [ ] A metric card renders its label, value, sub line, change and explanation, supports the missing-data state, and links to its module.

## Out of scope for M1

- The data change log (T-08, M2) and per-shop filters (M2).
- Real module screens behind the menu items.
