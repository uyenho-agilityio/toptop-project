# Milestone 1 Intent: Foundation and Access

**Milestone:** M1, "Foundation and access" (29 tickets, see `docs/tickets/`)
**Source:** Build Plan, section 5 (Milestones and tasks)

## Goal

Milestone 1 sets up the app shell, the extensible data model, invite-only Google sign-in, per-module permissions, the shared period filter and the metrics engine. It is the base every later module builds on, so the rules that must never break are enforced here first: only the Admin edits data, Users are view-only, the Tax tab is always hidden from Users, the System Admin gets no automatic access to finance or tax data, and the app never calculates tax. Data is isolated per Business, every record can carry its source, and missing data is shown as "not available yet" instead of 0. All numbers come from one metrics engine, so later screens agree with each other.

## Definition of done

An Admin can sign in and invite a User. The User sees only the modules they were granted, view-only. The Tax tab is hidden from Users. A System Admin creates a Business and invites its Admin. A person without an invitation sees a notice that they have no access yet and should contact an Admin. The permission tests pass.

## Changes from the Build Plan

These follow decisions of 2026-11-26. The Build Plan HTML is updated to match in a separate PR (branch `docs/remove-t123-from-m1`).

- **Sign-in is invite-only.** There is no Pending state. This changes T-09 and T-10, and removes T-123 (review registrations), since there is no waiting list.
- **Invites:** an invited Admin gets all modules; an invited User gets none until an Admin assigns them (T-11, T-13, T-124).
- **Ask AI is Admin only** (already a Plan decision).
- **Cost and profit stay out of M1** (T-26 to T-28 remain in M4, and M4 adds the orders and cost tables). T-25 is narrowed to net revenue and order count; T-29 stays as a rule for M4.

## Out of scope for M1

- Connecting TikTok Shop or Shopee, and importing or entering business data (M2).
- Orders and cost tables, and any cost or profit processing (M4).
- Any module screen with real business data: Overview, Sales, Finance and the rest (M3 onward).
- Costs, cost of goods and fixed-expense allocation (M4, tickets T-26 to T-28).
- Automatic sync from the platforms (M9).

## Where the details are

- Capability specs: `docs/spec/` (one file per capability group, each starting with its decisions).
- Tickets: `docs/tickets/T-xx.md`.
- The decisions behind M1 (2026-11-26) are listed at the top of each spec.
