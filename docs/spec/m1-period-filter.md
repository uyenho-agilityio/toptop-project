# Spec: M1 Period Filter

**Tickets:** T-21, T-22, T-24
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-PER-1 | What exactly are the three periods and their comparison? The Prototype uses Daily = today, Weekly = the last 7 days including today, Monthly = from the 1st of this month to today. The compared period is always the same number of days directly before the current one (so Monthly on Nov 23 compares Nov 1 to 23 with Oct 9 to 31, not with the whole of October). Brief says only "each compared with the previous period". Is this the intended rule? | Every number on every screen depends on it. | T-21 |
| Q-PER-2 | Brief 4 says one shared filter for every module. The Prototype shows it on Overview, Sales, Marketing, Finance and (period only) Supplier, and not on Inventory, Tax or Reports. Which modules show it? | Header layout and the scope of "shared". | T-21 |
| Q-PER-3 | Which period is selected on first load? The Prototype starts on Weekly. | Default state and URL default. | T-21, T-24 |
| Q-PER-4 | URL format for T-24 ("filters live in the URL and can be shared"), and whether the platform and shop filters (built in M2) are part of it now. Is a saved default across sessions also wanted? | A shared link must restore the same view. | T-24 |
| Q-PER-5 | Limits on a custom range: the Prototype blocks only future dates. Is there a maximum length or an earliest date (for example before the Business was created)? | Performance of the engine and calendar behavior. | T-22 |
| Q-PER-6 | Brief says the compared period is "named once, under the greeting" (Overview). The Prototype prints it in the header of every page that has the filter. Which is wanted? | T-21 AC wording. | T-21 |

## Sources

- Brief 4 (Module 01: Overview, "Filters" paragraph and card changes), 9 (Header).
- Prototype: `curRange()`, `rangeLabel()`, `fmtDate()`, `filterBar()`, `headHtml()`, `ACT.period`, `openCal()`, `calShow()`, `ACT.calnav`, `ACT.calpick`, `ACT.calok`, `FILT`.
- Plan: tickets T-21, T-22, T-24 and the Decisions table (file and URL conventions are not stated).

## Behavior

### Quick periods (T-21)

- Three buttons: Daily, Weekly, Monthly, plus a Custom button next to them (Brief, Module 01).
- One selection is shared by every module that shows the filter. Switching module keeps it (T-24).
- Each period is compared with the one right before it. The compared range is shown with the current range, for example "Nov 17, 2026 – Nov 23, 2026 vs Nov 10, 2026 – Nov 16, 2026" (Prototype `headHtml()`).
- Reference calculation (Prototype `curRange()`), to be confirmed in Q-PER-1:
  - Daily: from = to = today.
  - Weekly: from = today - 6 days, to = today.
  - Monthly: from = the 1st of today's month, to = today.
  - Custom: from and to as picked.
  - `days = to - from + 1`; previous range ends the day before `from` and has the same `days`.

### Custom range (T-22)

- Pressing Custom opens a calendar popup with month navigation.
- First click sets the start date. Second click sets the end date. If the second date is before the first, the two are swapped (Prototype `ACT.calpick`).
- Future dates cannot be picked.
- OK applies the range. It does nothing until a start date exists. A single click followed by OK gives a one-day range.
- While Custom is active the three quick buttons are not pressed and do not apply. Pressing one returns to quick mode (Brief, Module 01).
- Reopening the popup shows the current custom range pre-selected.

### Keep filters across modules (T-24)

- The selected period and custom dates are part of the URL. Copying the URL reproduces the view.
- Moving between modules keeps the selection.
- Priority P1 in the Plan.

## Edge cases

- Custom range where start is after end: swap them, never error. (Prototype)
- Custom period selected but dates missing in the URL: fall back to the Prototype default (today - 13 days to today). (Prototype `curRange()`)
- Invalid or tampered URL values: fall back to the default period, no error page. (Proposed)
- First day of the month: Monthly has one day, and its comparison range is one day. (Follows from Q-PER-1 rule)
- Language switch: labels and date text change, the selected range does not. (Proposed)
- The previous range reaches before the oldest data: the engine reports "not available yet" for the change, not a change from 0. (Proposed, from the "not available yet" convention in `m1-foundation.md`)

## Acceptance criteria

- [ ] Daily, Weekly and Monthly buttons exist, are shared by every module that shows the filter, and each compares with the period right before it.
- [ ] The current range and the compared range are displayed together.
- [ ] A calendar popup picks a start and an end date; a reversed pick is swapped; future dates are disabled.
- [ ] While Custom is active the quick buttons stop applying; pressing one returns to quick mode.
- [ ] The selection is in the URL; opening the URL elsewhere shows the same range.
- [ ] Switching modules keeps the selection.
- [ ] Range calculation has unit tests for every period, month boundaries, leap years and the custom range.

## Out of scope for M1

- The platform and shop filters (M2, ticket `platshop`).
- Wiring each module's data to the filter (modules ship in M3 onward).
- Daily-period charts that show 14 days (the Prototype's `chartRange()`); that belongs to the chart tickets in M4.
