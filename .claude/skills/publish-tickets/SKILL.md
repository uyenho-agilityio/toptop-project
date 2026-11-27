---
name: publish-tickets
description: Publish the ticket files of one TopTop milestone as GitHub Issues, then write each issue number back into its ticket file. Run once per milestone. Use when the user asks to publish, create issues for, or sync tickets of a milestone (e.g. "publish M1 tickets").
---

# publish-tickets

Turns `docs/tickets/T-xx.md` files of **one milestone** into GitHub Issues and records the issue number in each ticket's frontmatter. It runs **once per milestone**. It never re-publishes a ticket that already has an issue.

This skill only publishes. It does not implement tickets (that is `do-task`, one ticket per branch and PR) and it never edits intent, spec or ticket content other than the `issue` field.

## Input

- Milestone, e.g. `M1`. If the user does not name one, ask.
- Ticket files: `docs/tickets/T-*.md`. Select files whose frontmatter has `milestone: <milestone>`.

## Ticket file format

```
---
id: T-01
title: "Design the extensible data model"
milestone: M1
epic: "E01 Foundation and shared"
feature: "F-01 Data model and Business isolation"
role: "System"
priority: P0
size: L
points: 5
depends_on: [T-09]
spec: docs/spec/m1-foundation.md
issue: 31          # added by this skill
---

# T-01: Design the extensible data model

## User story ...
## Acceptance criteria ...
## Dependencies ...
## Size ...
## Spec ...
```

## Steps

1. **Collect.** List ticket files of the milestone. Skip every file whose frontmatter already has an `issue:` field. If nothing is left, report "nothing to publish" and stop.
2. **Guard against duplicates.** List existing issues of the repo (open and closed) whose title starts with `T-xx:`. If an issue for a ticket already exists but the file has no `issue:` field, do not create a new one: reuse its number and only write it back.
3. **Dry run.** Show the user the count, the ticket ids, and one sample issue (title, labels, body). Wait for approval before creating anything, unless the user already asked to publish that milestone in this request. Creating issues is outward-facing and hard to undo.
4. **Create issues**, in ticket id order, one per ticket:
   - **Title:** `T-xx: <title>` (the frontmatter `id` and `title`).
   - **Body:** the ticket file without the frontmatter and without the `# T-xx: ...` heading, preceded by one line: ``Ticket file: [`docs/tickets/T-xx.md`](<blob url on main>)``. Rewrite relative links (e.g. `../spec/m1-foundation.md`) to absolute blob URLs on the default branch so they work from an issue.
   - **Labels:** `ticket`, `<milestone>` (e.g. `M1`), `<priority>` (e.g. `P0`), `size: <size>`, `epic: <epic>` (e.g. `epic: E02 Accounts and permissions`). Labels that do not exist yet are created by GitHub when the issue is created. A label name may not contain a comma and must be at most 50 characters: drop commas and shorten if needed (e.g. `epic: E03 Period platform and shop filters`).
   - **No assignee, no GitHub Milestone object, no project board.** Labels carry the milestone.
5. **Write back.** For each created issue, add `issue: <number>` as the last line of that ticket's frontmatter. Change nothing else in the file.
6. **Commit and PR.** Branch `chore/publish-tickets-<milestone>` from the default branch. One commit, one line, Conventional Commits, English, no body and no trailers, e.g. `chore: link M1 tickets to their GitHub issues`. Open one PR.
   - PR body has two sections only: `## Summary` (milestone, issue count, first and last issue number) and `## Notes for review` (anything unusual, such as a reused issue).
7. **Report.** Issue numbers (first and last, or a table `T-xx -> #n`), the PR link.

## Rules

- Run once per milestone. Re-running only picks up tickets without `issue:` (for example a ticket added later) and never touches the others.
- Never edit or close an existing issue, and never delete issues.
- If creating an issue fails midway, stop, write back the numbers created so far, and report which tickets are still unpublished. Do not retry blindly: check the issue list first (step 2).
- Dependencies stay as ticket ids (`T-09`) in the issue body. Do not rewrite them to issue numbers.
- All content written to GitHub or the repo is in English.
