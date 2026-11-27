# Spec: M1 System Admin (System Console basics)

**Tickets:** T-122, T-124, T-125

> **T-123 (Review registrations) is removed from M1** (decision of 2026-11-26). Sign-in is invite-only, so there are no Pending accounts to review. Creating a Business and inviting its Admin is covered by T-124.
**Milestone:** M1

## Decisions

| ID | Answer | Date |
| --- | --- | --- |
| Q-SYS-3 | **T-123 is removed from M1.** With invite-only sign-in there is no waiting list to review; T-124 covers creating a Business and inviting its Admin. | 2026-11-26, product owner |
| Q-SYS-1b | **When `SYSTEM_ADMIN_EMAIL` changes, the previous System Admin loses access immediately.** The role is read from the config, so the old account is treated as an ordinary account with no invitation (blocked). | 2026-11-26, product owner |
| Q-SYS-1 | **The first System Admin is set by an email in server configuration.** The config key is `SYSTEM_ADMIN_EMAIL` (placeholder name; the real value is set per environment by the product owner and is never committed to the repo). When that Google account signs in, it becomes the System Admin without an invitation. Options (b) one-time script and (c) first sign-in on an empty database were not chosen. | 2026-11-26, product owner |
| Q-SYS-4 | **One Admin per Business** (same answer as Q-AUTH-10). Creating a Business creates its single Admin invitation. | 2026-11-26, product owner |
| Q-SYS-5 | Statuses are active and suspended (Brief 8, Prototype). "Lock, unlock, deactivate" in T-125 mean suspend and activate. | 2026-11-26, product owner accepted the proposed default |
| Q-SYS-6 | Store who, what and when for each System Admin action. The log viewer is M7. | 2026-11-26, product owner accepted the proposed default |
| Q-SYS-7 | The M1 Console has lists of Businesses and users with status and the actions in T-124 and T-125. Dashboard and monitoring are M7. | 2026-11-26, product owner accepted the proposed default |

## Sources

- Brief 2.1 (System Admin), 2.4 (Registration and onboarding; the Pending step in it is replaced by the invite-only rule), 8 (System Console), 11 (Acceptance criteria).
- Prototype: `PAGES.console`, `ACT['u-appr']`, `ACT['u-appr-go']`, `ACT['b-add']`, `ACT['b-add-go']`, `ACT['u-sus']`, `ACT['b-sus']`, `ACT['b-mem']`, `ACT['u-det']`, `SYS_LOG`, `pendingView()`.
- Plan: Fixed product rules, Roles and permissions (System Admin row), Decisions (Organization), Architecture ("Inviting Business owners").

## Behavior

### A single System Admin (T-122)

- There is exactly one System Admin (Brief 2.1; Plan, Roles). Their email is set in server configuration under `SYSTEM_ADMIN_EMAIL` (Q-SYS-1). The `SYSTEM_ADMIN_EMAIL` account is the only one that can sign in without an invitation.
- There is no screen to create another. The role cannot be granted through any API.
- The System Admin lands in the System Console, a separate interface from the Business workspace (Brief 8, Brief 9).

### Create a Business and assign an Admin (T-124)

- The System Admin creates a new Business and invites a person as its Admin (Plan Architecture: the System Admin sends the owner an invite link). The invited Admin gets **all modules** (Q-AUTH-2).
- Each Business has exactly one Admin (Q-SYS-4). The Prototype's option to assign a person to an existing Business is not part of M1. The Business name is required, and the person is chosen by email, not from a list of registered users.
- A Business is one Better Auth organization (Plan, Decisions). It starts active and with no data.
- The System Admin can view a Business's member list (name, role, modules). That is account information, not business data (Prototype `ACT['b-mem']`, Brief 8).

### Manage account and Business status (T-125)

- Lock, unlock or deactivate (wording: Q-SYS-5) an account or a Business. Each change writes a log entry.
- A locked account, or a member of a locked Business, sees the blocked screen on the next request (Prototype `pendingView()`). No data is deleted.
- The System Admin sees account details only: email, role, Business, status and granted modules. Never business or tax data (Prototype `ACT['u-det']`, T-17).

## Edge cases

- `SYSTEM_ADMIN_EMAIL` is missing or invalid at startup: no System Admin exists; the app must still start and show no console to anyone, and log a clear configuration error.
- Inviting the same email twice: the second request fails with a clear message, not a duplicate.
- Creating a Business with an empty or duplicate name: validation error. (Prototype requires a name)
- Suspending the account of a Business's Admin: allowed; its Users keep their access, because suspending an account does not suspend its Business. (Prototype `pendingView()`)
- The System Admin cannot suspend their own account.
- A suspended Business is re-activated: members regain access with the same grants. (Follows Prototype behavior of `b-sus` toggle)

## Acceptance criteria

- [ ] Only the `SYSTEM_ADMIN_EMAIL` account can be System Admin and sign in without an invitation; no screen or API creates another.
- [ ] The System Admin can create a Business and invite a person as its Admin; that person lands in the Business with every module.
- [ ] The System Admin can lock, unlock or deactivate accounts and Businesses; affected users are blocked on their next request.
- [ ] Every invitation, assignment and status change is logged with who, what and when.
- [ ] The System Admin cannot reach any Business's Finance or Tax data (also covered by T-17).

## Out of scope for M1

- System dashboard, operations monitoring, the log viewer and the Console overview (M7: `sysmon`, `syslog`, `sysov`).
