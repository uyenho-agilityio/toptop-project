# Milestone 1 Intent: Foundation and Access

**Milestone:** M1, "Foundation and access" (30 tickets, see `docs/tickets/`)
**Source:** Build Plan, section 5 (Milestones and tasks)

## Goal

Milestone 1 sets up the app shell, the extensible data model, Google sign-in, per-module permissions, the shared period filter and the metrics engine. It is the base every later module builds on, so the rules that must never break are enforced here first: only the Admin edits data, Users are view-only, the Tax tab is always hidden from Users, the System Admin gets no automatic access to finance or tax data, and the app never calculates tax. Data is isolated per Business, every record can carry its source, and missing data is shown as "not available yet" instead of 0. All numbers come from one metrics engine, so later screens agree with each other.

## Definition of done

An Admin can sign in and invite a User. The User sees only the modules they were granted, view-only. The Tax tab is hidden from Users. A System Admin approves sign-ups and creates a Business. The permission tests pass.

## Out of scope for M1

- Connecting TikTok Shop or Shopee, and importing or entering business data (M2).
- Any module screen with real business data: Overview, Sales, Finance and the rest (M3 onward).
- Costs, cost of goods and fixed-expense allocation inside the metrics engine (M4, tickets T-26 to T-28).
- Automatic sync from the platforms (M9).

## Where the details are

- Capability specs: `docs/spec/` (one file per capability group, each starting with its open questions).
- Tickets: `docs/tickets/T-xx.md`.
- Unresolved questions are collected at the top of each spec. Nothing in M1 should be built on an open question without an answer from the product owner.
