# Spec: M1 System Admin (System Console basics)

**Tickets:** T-122, T-123, T-124, T-125
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-SYS-1 | When the configured System Admin email signs in for the first time, does it become System Admin directly (no Pending step)? What happens when the configured email changes: does the previous person lose access? | First-run setup and security. | T-122 |
| Q-SYS-2 | **Reject.** T-123 says "approve or reject", but neither the Brief nor the Prototype defines rejection. What does a rejected account see, can it register again, and is the reason recorded? | Behavior and data for a rejected status. | T-123 |
| Q-SYS-3 | Approval and Business creation: Brief 2.4 lists them as separate steps and the Plan has separate tickets (T-123, T-124), while the Prototype does both in one dialog ("Approve and assign as Admin": new or existing Business). Which flow? Can a person be approved but not yet assigned, and what do they see? | Flow and screens. | T-123, T-124 |
| Q-SYS-4 | The Prototype lets the System Admin assign a person to an existing Business as an Admin. Can a Business have more than one Admin? (Same as Q-AUTH-10.) | Roles and member management. | T-124 |
| Q-SYS-5 | Status words differ: T-125 says "Lock, unlock, deactivate", Brief 8 says "Activate or suspend", the Prototype only toggles active and suspended. Which statuses exist for accounts and Businesses? | Data model and wording. | T-125 |
| Q-SYS-6 | Log: Brief 8 says every System Admin action goes to an audit log, T-125 says "with a log", and the log viewer is in M7 (`syslog`). In M1, do we store the entries only? Which fields, and for how long? | What T-123 to T-125 must write. | T-123 to T-125 |
| Q-SYS-7 | Brief 8 describes a dashboard, user management, Business management and monitoring. M1 covers review, create, status. Does the M1 Console also need the user details panel and the Business member list that the Prototype has? | Console scope in M1. | T-123 to T-125 |

## Sources

- Brief 2.1 (System Admin), 2.4 (Registration and onboarding), 8 (System Console), 11 (Acceptance criteria).
- Prototype: `PAGES.console`, `ACT['u-appr']`, `ACT['u-appr-go']`, `ACT['b-add']`, `ACT['b-add-go']`, `ACT['u-sus']`, `ACT['b-sus']`, `ACT['b-mem']`, `ACT['u-det']`, `SYS_LOG`, `pendingView()`.
- Plan: Fixed product rules, Roles and permissions (System Admin row), Decisions (Organization), Architecture ("Inviting Business owners").

## Behavior

### A single System Admin (T-122)

- There is exactly one System Admin. Their email is set in server configuration (Brief 2.1; Plan, Roles).
- There is no screen to create another. The role cannot be granted through any API.
- The System Admin lands in the System Console, a separate interface from the Business workspace (Brief 8, Brief 9).

### Review registrations (T-123)

- The console lists accounts with status Pending: name, email, request date.
- The System Admin can approve or reject each one. Approving leads to Business assignment (T-124). See Q-SYS-2 and Q-SYS-3.
- Approving, rejecting and assigning each write a log entry.

### Create a Business and assign an Admin (T-124)

- The System Admin creates a new Business and assigns an approved person as its Admin (Brief 2.4). The person becomes the Business's Admin with access to all modules.
- The Prototype offers a new Business (name required) or an existing one, and in the Business dialog lists only users who do not belong to a Business yet.
- A Business is one Better Auth organization (Plan, Decisions). It starts active and with no data.
- The System Admin can view a Business's member list (name, role, modules). That is account information, not business data (Prototype `ACT['b-mem']`, Brief 8).

### Manage account and Business status (T-125)

- Lock, unlock or deactivate (wording: Q-SYS-5) an account or a Business. Each change writes a log entry.
- A locked account, or a member of a locked Business, sees the blocked screen on the next request (Prototype `pendingView()`). No data is deleted.
- The System Admin sees account details only: email, role, Business, status and granted modules. Never business or tax data (Prototype `ACT['u-det']`, T-17).

## Edge cases

- The configured email is missing or invalid at startup: no System Admin exists; the app must still start and show no console to anyone, and log a clear configuration error. (Proposed)
- Approving an account that is no longer Pending (another tab already handled it): the action fails with a clear message, not a duplicate assignment. (Proposed)
- Creating a Business with an empty or duplicate name: validation error. (Prototype requires a name; duplicate rule is Proposed)
- Suspending the account of a Business's only Admin: allowed, and the Business keeps its other members. (Proposed)
- The System Admin cannot suspend their own account. (Proposed)
- A suspended Business is re-activated: members regain access with the same grants. (Follows Prototype behavior of `b-sus` toggle)

## Acceptance criteria

- [ ] Only the configured email can be System Admin; no screen or API creates another.
- [ ] The Console lists Pending accounts and lets the System Admin approve them; rejection works as decided in Q-SYS-2.
- [ ] The System Admin can create a Business and assign an approved person as its Admin; that person lands in the Business with every module.
- [ ] The System Admin can lock, unlock or deactivate accounts and Businesses; affected users are blocked on their next request.
- [ ] Every approval, rejection, assignment and status change is logged with who, what and when.
- [ ] The System Admin cannot reach any Business's Finance or Tax data (also covered by T-17).

## Out of scope for M1

- System dashboard, operations monitoring, the log viewer and the Console overview (M7: `sysmon`, `syslog`, `sysov`).
