# M1 questions: audit and resolution (2026-11-26)

The audit of every question that was still open at the top of the M1 specs. The tables below keep the original grouping. All are now resolved; the final answer for each is in the spec under "Resolved questions".

**Result: 0 open questions.** All 48 questions are resolved, each with the decision recorded in its spec under "Resolved questions". On 2026-11-26 the product owner decided five ids (one Admin per Business, invitations single-use with a 7-day expiry, order counting as the Prototype, default language English) and accepted the proposed default for the other 29. Earlier decisions closed the rest.

## Closed in this audit

| ID | Decision | Where it was decided |
| --- | --- | --- |
| Q-AUTH-3 | Invitations are manual links; the app does not email them. | Build Plan, Decisions, "Sign-in ... invites by manual link" (Uyn, 2026-11-25); Architecture "System Admin ... sends the owner an invite link". |
| Q-SEED-2 | The M1 seed holds accounts, Businesses, shops and permissions only. | Follows "M1 does not process cost or profit and has no orders or cost tables" (Uyn, 2026-11-26). |

## (b) Needed a decision (5), decided 2026-11-26

| ID | Question | Decision |
| --- | --- | --- |
| Q-AUTH-10, Q-SYS-4 (same question) | Can a Business have more than one Admin? | Decided: one Admin per Business. |
| Q-AUTH-4 | Does an invitation link expire, and can it be used twice? Which statuses exist besides Invited and revoked? | Decided: single use, expires after 7 days; statuses Invited, Accepted, Revoked, Expired. |
| Q-ENG-4 | Does "order count" include cancelled and returned orders? Is net revenue the value of orders that are neither cancelled nor returned? | Decided: as the Prototype. Order count includes cancelled and returned orders; net revenue sums only orders that are neither cancelled nor returned. |
| Q-I18N-1 | Which language does a new visitor see first? | Decided: English by default, Vietnamese through the toggle. |

Q-AUTH-10 and Q-SYS-4 are the same question, so the 5 ids are 4 distinct decisions.

## (c) A detail for the ticket (29), proposed default accepted 2026-11-26

| ID | Detail | Default now in the spec (source) |
| --- | --- | --- |
| Q-AUTH-5 | Must the accepting Google email match the invited email? | Yes (Prototype invites "by Google email"). |
| Q-AUTH-6 | Can someone already in another Business accept an invite? | No, one Business per account in M1 (Brief 2.5, Prototype Business selector). |
| Q-AUTH-7 | What does a removed User see? | Blocked like any uninvited person (follows invite-only sign-in). |
| Q-AUTH-9 | What does T-14 deliver with no cards or exports yet? | The enforcement layer (route guard, API check, data filter) that later features must call. |
| Q-AUTH-11 | Session length. | Better Auth default. |
| Q-AUTH-12 | Can a User see Settings read-only? | No, hidden (Prototype). |
| Q-FND-2 | How is the Business filter enforced? | A shared query helper plus the T-02 test. |
| Q-FND-3 | Migration tool. | Drizzle Kit (the stack already uses Drizzle ORM). |
| Q-FND-4 | Money format. | Compact on cards, full amounts in tables (Prototype). |
| Q-FND-5 | Time zone. | Fixed Vietnam time (T-05). |
| Q-FND-6 | Where is the AI entry? | Header button, Admin only (Brief 9, Prototype, Ask AI decision). |
| Q-FND-7 | What do menu items open before their module exists? | A "coming soon" placeholder page. |
| Q-I18N-2 | Where are language and theme stored? | In the browser in M1 (Prototype `tt-lang`, `tt-theme`). |
| Q-I18N-3 | i18n library. | One standard Next.js library, chosen when T-129 starts (not named in the Plan). |
| Q-I18N-4 | Language in the URL? | No, a stored setting (Prototype). |
| Q-THEME-1 | Third "system" state on the toggle? | Follow the system until the user toggles (Prototype, T-130). |
| Q-ENG-2 | What does the engine read in M1? | A typed list of order records passed in; M4 adds the database read. |
| Q-ENG-3 | Sample dataset for the engine test. | A small generated dataset like the Prototype's, with expected numbers written down. |
| Q-ENG-6 | How is "unavailable" signalled? | A null value plus a reason. |
| Q-ENG-7 | Money type. | Integer VND. |
| Q-ENG-8 | Comparison kinds and "flat" threshold. | As the Prototype `delta()`. |
| Q-PER-2 | Which modules show the filter? | As the Prototype (Overview, Sales, Marketing, Finance, Supplier period only). The Plan says the Prototype decides interface. |
| Q-PER-3 | Default period. | Weekly (Prototype). |
| Q-PER-4 | URL format. | Query parameters for period and dates; platform and shop join in M2. |
| Q-PER-5 | Custom range limits. | Only future dates blocked (Prototype). |
| Q-PER-6 | Where is the compared period named? | In the header of pages with the filter (Prototype). |
| Q-SYS-5 | Account and Business statuses. | Active and suspended (Brief 8, Prototype); "lock" and "deactivate" in T-125 mean the same. |
| Q-SYS-6 | M1 audit log scope. | Store who, what and when for each System Admin action; the viewer is M7. |
| Q-SYS-7 | M1 Console scope. | Lists of Businesses and users with their status; no dashboard or monitoring (M7). |

The Plan's own footer says "the Product Brief decides scope, permissions and fixed rules; the Prototype decides interface and interaction". That is why most (c) defaults follow the Prototype.

## Build Plan PR (#3)

The Build Plan PR has no questions of its own. The wording of T-127 and T-128 ("invitations" and "pending invitations" instead of approvals) was confirmed by the product owner on 2026-11-26. It mirrors the decisions above.
