# Spec: M1 Auth and Permissions

**Tickets:** T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-AUTH-3 | Invitation delivery: the Decisions say "invites by manual link", while T-11 says "Send the invitation". Does the app email the link, or does the Admin copy it? | Email sending is not in the stack list. | T-11 |
| Q-AUTH-4 | Invitation lifecycle: T-11 names the status "Invited" and revoke. Are there more statuses (accepted, expired, revoked)? Does a link expire, and is it single use? | Needed for the acceptance test of T-12. | T-11, T-12 |
| Q-AUTH-5 | Must the Google account that accepts an invitation have the same email as the invited address? | A mismatch could let the wrong person join. | T-12 |
| Q-AUTH-6 | The Prototype gives each account one Business. Can an invited person who already belongs to another Business accept? Brief 2.5 only says "later". | Edge case in T-12 and in `m1-system-admin.md`. | T-12 |
| Q-AUTH-7 | Removing a User (T-18): the Prototype sets them back to Pending with no Business and no modules. With invite-only sign-in there is no Pending state, so the account simply loses membership and is blocked at next sign-in unless invited again. Confirm. | Defines what the removed person sees at next sign-in. | T-18 |
| Q-AUTH-9 | T-14 lists "cards, charts, reports, exports and AI" (AI is now Admin-only, see Resolved). None of these exist in M1. Is M1 expected to deliver only the enforcement layer (route guard, API check, data filter) that those features must use later? | Defines what can be tested in M1. | T-14 |
| Q-AUTH-10 | Can a Business have more than one Admin? Brief 2.2 calls the Admin "the Business owner" and the Prototype lets the System Admin approve a person into an existing Business as another Admin. | Affects T-18 (who can be removed) and the Business-switching edge cases. | T-13, T-18, T-124 |
| Q-AUTH-11 | "Keep the session" (T-09): how long does a session last? | Security and UX. | T-09 |
| Q-AUTH-12 | Is the User allowed to see the Settings area in read-only form, for example the member list? The Prototype hides Settings from Users completely, and Brief 6 says only the Admin changes settings. | Menu and route guard. | T-06, T-15 |

## Resolved questions

| ID | Answer | Date |
| --- | --- | --- |
| Q-AUTH-1 | **Sign-in is invite-only.** Only an invited person can get in. A new user with no invitation is blocked. There is no Pending state and no self-registration. This is a change from the Build Plan tickets T-09, T-10 and T-123, which assumed Pending accounts; it follows the Plan's Architecture section ("Anyone not invited cannot get in"). What a blocked person sees is set in the next row (Q-SYS-2). The first System Admin is the `SYSTEM_ADMIN_EMAIL` account, the one exception to invite-only (Q-SYS-1, resolved in `m1-system-admin.md`). | 2026-11-26, product owner |
| Q-SYS-2 | **A person with no invitation sees a notice** saying they have no access yet and should contact an Admin. | 2026-11-26, product owner |
| Q-AUTH-2 | **An invited Admin gets all modules. An invited User gets no modules until an Admin assigns them.** The invite form does not choose modules for a User. | 2026-11-26, product owner |
| Q-AUTH-8 | **Ask AI is Admin only.** Users have no Ask AI at all: no button, and the API rejects them. The Plan decision of 2026-11-26 stands; Brief 2.3 and 5.4 are out of date on this point. | 2026-11-26, product owner |

## Sources

- Brief 2.1 to 2.4 (roles, registration), 2.3 (User rules, "Permission model (MVP)"), 6.4 (Members and permissions), 11 (Acceptance criteria).
- Prototype: `loginView()`, `registerModal()`, `pendingView()`, `can()`, `routeOk()`, `firstRoute()`, `ACT.perm`, `ACT['inv-user']`, `ACT['rm-user']`, `sideHtml()`.
- Plan: Fixed product rules, Roles and permissions, Decisions (Sign-in, Organization), Testing.

## Behavior

### Sign-in and session (T-09)

- Google is the only sign-in method (Plan, Decisions). Better Auth handles it.
- Sign in, sign out and keep the session.
- Sign-in is **invite-only** (Q-AUTH-1, resolved). A Google account with no invitation is blocked: no account record gives it access, and every API rejects it. There is no Pending state and no self-registration form (Prototype `registerModal()` is not built).
- After sign-in the landing page is: the System Console for the System Admin; otherwise the first module the user may open, in menu order; a user with no module sees an empty "no access yet" state (Prototype `firstRoute()`).

### Blocked screen for people without access (T-10, replaces "Pending approval screen")

- A signed-in Google account with no invitation, a removed member, a locked account or a member of a locked Business is blocked. Every API rejects it.
- A person with no invitation sees a notice: they have no access yet, and should contact an Admin (Q-SYS-2, resolved). The only action is to sign out. Exact wording is a copy task for the i18n catalog.
- The locked-account wording follows the Prototype `pendingView()` (ticket T-125).

### Admin invites a User (T-11)

- The Admin enters an email. The invited person becomes a User with **no modules** (Q-AUTH-2, resolved). The invitation has the status Invited and can be revoked. See Q-AUTH-3 and Q-AUTH-4 for delivery and lifecycle.
- A User is the only role an Admin can invite. Admin and System Admin accounts come only from the System Admin (Brief 2.1, 2.4). An Admin invited by the System Admin gets all modules (see `m1-system-admin.md`).

### User accepts the invitation (T-12)

- The invited person opens the link, signs in with Google and lands in the right Business with the access granted. A User with no modules sees the empty state described above.

### Grant access per module (T-13)

- One level per User per module: View or No Access. Modules: Overview, Sales, Marketing, Inventory, Supplier, Finance, Tax, Reports (Brief 3).
- A new User has no modules until an Admin assigns them (Q-AUTH-2, resolved). An invited Admin has all modules and it cannot be reduced.
- Changes take effect immediately: the next request is checked against the new grant (Prototype applies a checkbox change at once and shows a toast).
- Tax cannot be granted (see T-16).

### Enforce permissions in the UI and the API (T-14)

- UI: route guards hide and block routes the user may not open.
- API: every endpoint checks the caller's role, Business and module grant. The UI check is only a convenience.
- Ask AI is Admin only (Q-AUTH-8, resolved): Users have no Ask AI button, and the AI API rejects them.
- Data lookups for a granted module return only that module's data. Overview shows only the modules the user may open (Brief, Module 01).
- Check order for a request: authenticated, status active, Business active, role, module grant.
- The same check functions are the ones reports, exports and Ask AI must call in later milestones (see Q-AUTH-9).

### Users are view-only (T-15)

- Add, edit, delete and import buttons are hidden or disabled for Users.
- The API rejects every write from a User. The Plan's Testing section requires a permission-matrix test at API level (Vitest).
- Users can still export CSV for granted modules (Plan, Roles).

### Tax tab hidden from Users (T-16)

- Tax is not in the menu, not reachable by URL and not reachable by API for a User.
- There is no setting that grants Tax. An attempt to store a Tax grant is rejected by the server (Prototype `can()` returns false for Tax for every non-Admin).
- Finance is separate: a User can open it only when granted (Brief 2.3).

### System Admin has no automatic finance and tax access (T-17)

- The System Admin cannot read a Business's Finance or Tax data, or any other Business data. The module checks above return No Access for the System Admin role (Prototype `can()` returns false for all modules).
- An automated test proves it.

### Manage members (T-18)

- A member list with role and access. The Admin can edit access, revoke an invitation and remove a User (Brief 6.4).
- Removal takes effect at once. See Q-AUTH-7.

### Personal profile and sign out (T-19)

- Shows name, email, role and Business. The user can change language and theme (see `m1-i18n-theme-seed.md`) and sign out.
- Priority P1 in the Plan.

## Edge cases

- A User's grant changes while they are signed in: the next request uses the new grant. (Plan T-13 "take effect immediately")
- A User is removed, suspended or their Business is suspended while signed in: the next request is rejected and the pending/suspended screen appears. (Proposed, consistent with Prototype `pendingView()`)
- A person with no invitation signs in with Google: blocked, no record that grants access is created. (Q-AUTH-1)
- A User opens a module URL they cannot access: redirect to their first allowed module, not an error page showing that the module exists. (Proposed)
- A User calls a Tax API directly: rejected, with no data in the response and no hint whether Tax data exists. (T-16 "not reachable by ... API")
- An invitation is accepted twice, or after revocation: rejected. (Proposed; see Q-AUTH-4)
- The first sign-in of the account in `SYSTEM_ADMIN_EMAIL`: allowed without an invitation and becomes System Admin (`m1-system-admin.md`, Q-SYS-1).

## Acceptance criteria

- [ ] A user can sign in with Google, sign out and stay signed in across page reloads.
- [ ] A Google account with no invitation is blocked and every API call is rejected.
- [ ] An Admin can create an invitation for a User and revoke it; its status is visible.
- [ ] An invited person can open the link, sign in and land in the right Business with exactly the access granted.
- [ ] An Admin can grant and revoke View per module for a User; a new User has none until assigned; an invited Admin has all; a change applies on the next request.
- [ ] A User has no Ask AI button and the AI API rejects the User.
- [ ] Route guards in the UI and permission checks on every API are in place, and a permission-matrix test over role x module passes.
- [ ] A User cannot add, edit, delete or import anything: UI controls are locked and the API rejects the write.
- [ ] A User cannot reach Tax by menu, URL or API, and no Tax grant can be stored.
- [ ] A System Admin cannot read any Business Finance or Tax data; the test is automated.
- [ ] The member list shows role and access and supports edit, revoke and remove.
- [ ] The profile shows name, email, role and Business, and offers language, theme and sign out.

## Out of scope for M1

- Edit levels beyond View, and roles beyond the three (Brief 2.5).
- Ask AI itself (M7); only the Admin-only rule is fixed here.
- Self-registration and a Pending list (removed by the invite-only rule).
- The data change log for Admin edits (M2).
