# Spec: M1 System Admin (System Console basics)

**Tickets:** T-122, T-123, T-124, T-125
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-SYS-1b | When the System Admin changes (the config email is changed and the app is redeployed), does the previous System Admin lose access at once? Proposed: yes, because the role is read from the config on every request. | Security of role changes. | T-122 |
| Q-SYS-3 | With no Pending list, what does T-123 "Review registrations" become? Options to decide: drop it, or keep a list of blocked sign-in attempts the System Admin can act on by sending an invitation. | T-123 has no purpose as written. | T-123, T-124 |
| Q-SYS-4 | The Prototype lets the System Admin assign a person to an existing Business as an Admin. Can a Business have more than one Admin? (Same as Q-AUTH-10.) | Roles and member management. | T-124 |
| Q-SYS-5 | Status words differ: T-125 says "Lock, unlock, deactivate", Brief 8 says "Activate or suspend", the Prototype only toggles active and suspended. Which statuses exist for accounts and Businesses? | Data model and wording. | T-125 |
| Q-SYS-6 | Log: Brief 8 says every System Admin action goes to an audit log, T-125 says "with a log", and the log viewer is in M7 (`syslog`). In M1, do we store the entries only? Which fields, and for how long? | What T-123 to T-125 must write. | T-123 to T-125 |
| Q-SYS-7 | Brief 8 describes a dashboard, user management, Business management and monitoring. M1 covers review, create, status. Does the M1 Console also need the user details panel and the Business member list that the Prototype has? | Console scope in M1. | T-123 to T-125 |

## Resolved questions

| ID | Answer | Date |
| --- | --- | --- |
| Q-SYS-1 | **The first System Admin is set by an email in server configuration.** The config key is `SYSTEM_ADMIN_EMAIL` (placeholder name; the real value is set per environment by the product owner and is never committed to the repo). When that Google account signs in, it becomes the System Admin without an invitation. Options (b) one-time script and (c) first sign-in on an empty database were not chosen. | 2026-11-26, product owner |

## Sources

- Brief 2.1 (System Admin), 2.4 (Registration and onboarding; the Pending step in it is replaced by the invite-only rule), 8 (System Console), 11 (Acceptance criteria).
- Prototype: `PAGES.console`, `ACT['u-appr']`, `ACT['u-appr-go']`, `ACT['b-add']`, `ACT['b-add-go']`, `ACT['u-sus']`, `ACT['b-sus']`, `ACT['b-mem']`, `ACT['u-det']`, `SYS_LOG`, `pendingView()`.
- Plan: Fixed product rules, Roles and permissions (System Admin row), Decisions (Organization), Architecture ("Inviting Business owners").

## Behavior

### A single System Admin (T-122)

- There is exactly one System Admin (Brief 2.1; Plan, Roles). Their email is set in server configuration under `SYSTEM_ADMIN_EMAIL` (Q-SYS-1, resolved). The `SYSTEM_ADMIN_EMAIL` account is the only one that can sign in without an invitation.
- There is no screen to create another. The role cannot be granted through any API.
- The System Admin lands in the System Console, a separate interface from the Business workspace (Brief 8, Brief 9).

### Review registrations (T-123, blocked by Q-SYS-3)

- The Build Plan describes a list of Pending accounts with approve and reject. Sign-in is now invite-only (Q-AUTH-1), so there are no Pending accounts. What this ticket delivers is open (Q-SYS-3). Do not build it until that is answered.
- Whatever it becomes, each action writes a log entry.

### Create a Business and assign an Admin (T-124)

- The System Admin creates a new Business and invites a person as its Admin (Plan Architecture: the System Admin sends the owner an invite link). The invited Admin gets **all modules** (Q-AUTH-2, resolved).
- The Prototype offers a new Business (name required) or an existing one, and in the Business dialog lists only users who do not belong to a Business yet. With invite-only sign-in the person is chosen by email, not from a list of registered users.
- A Business is one Better Auth organization (Plan, Decisions). It starts active and with no data.
- The System Admin can view a Business's member list (name, role, modules). That is account information, not business data (Prototype `ACT['b-mem']`, Brief 8).

### Manage account and Business status (T-125)

- Lock, unlock or deactivate (wording: Q-SYS-5) an account or a Business. Each change writes a log entry.
- A locked account, or a member of a locked Business, sees the blocked screen on the next request (Prototype `pendingView()`). No data is deleted.
- The System Admin sees account details only: email, role, Business, status and granted modules. Never business or tax data (Prototype `ACT['u-det']`, T-17).

## Edge cases

- `SYSTEM_ADMIN_EMAIL` is missing or invalid at startup: no System Admin exists; the app must still start and show no console to anyone, and log a clear configuration error. (Proposed)
- Inviting the same email twice: the second request fails with a clear message, not a duplicate. (Proposed)
- Creating a Business with an empty or duplicate name: validation error. (Prototype requires a name; duplicate rule is Proposed)
- Suspending the account of a Business's only Admin: allowed, and the Business keeps its other members. (Proposed)
- The System Admin cannot suspend their own account. (Proposed)
- A suspended Business is re-activated: members regain access with the same grants. (Follows Prototype behavior of `b-sus` toggle)

## Acceptance criteria

- [ ] Only the `SYSTEM_ADMIN_EMAIL` account can be System Admin and sign in without an invitation; no screen or API creates another.
- [ ] The Console covers registrations as decided in Q-SYS-3.
- [ ] The System Admin can create a Business and invite a person as its Admin; that person lands in the Business with every module.
- [ ] The System Admin can lock, unlock or deactivate accounts and Businesses; affected users are blocked on their next request.
- [ ] Every invitation, assignment and status change (and any approval or rejection that Q-SYS-3 keeps) is logged with who, what and when.
- [ ] The System Admin cannot reach any Business's Finance or Tax data (also covered by T-17).

## Out of scope for M1

- System dashboard, operations monitoring, the log viewer and the Console overview (M7: `sysmon`, `syslog`, `sysov`).
