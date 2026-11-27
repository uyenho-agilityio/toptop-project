# Spec: M1 Period Filter

**Tickets:** T-21, T-22, T-24
**Milestone:** M1

## Decisions

| ID | Answer | Date |
| --- | --- | --- |
| Q-PER-1 | **Follow the Prototype.** Daily = today, Weekly = the last 7 days including today, Monthly = from the 1st of this month to today. The compared period is always the same number of days directly before the current one (so Monthly on Nov 23 compares Nov 1 to 23 with Oct 9 to 31, not with the whole of October). | 2026-11-26, product owner |
| Q-PER-2 | As in the Prototype: the filter shows on Overview, Sales, Marketing and Finance (with platform and shop later), and on Supplier with the period only. It is not shown on Inventory, Tax or Reports. | 2026-11-26, product owner accepted the proposed default |
| Q-PER-3 | The default period is Weekly. | 2026-11-26, product owner accepted the proposed default |
| Q-PER-4 | Query parameters for the period and custom dates; platform and shop join in M2. No saved default across sessions. | 2026-11-26, product owner accepted the proposed default |
| Q-PER-5 | Only future dates are blocked, as in the Prototype. | 2026-11-26, product owner accepted the proposed default |
| Q-PER-6 | The compared period is shown in the header of pages that have the filter, as in the Prototype. | 2026-11-26, product owner accepted the proposed default |

## Sources

- Brief 4 (Module 01: Overview, "Filters" paragraph and card changes), 9 (Header).
- Prototype: `curRange()`, `rangeLabel()`, `fmtDate()`, `filterBar()`, `headHtml()`, `ACT.period`, `openCal()`, `calShow()`, `ACT.calnav`, `ACT.calpick`, `ACT.calok`, `FILT`.
- Plan: tickets T-21, T-22, T-24 and the Decisions table (file and URL conventions are not stated).

## Behavior

### Quick periods (T-21)

- Three buttons: Daily, Weekly, Monthly, plus a Custom button next to them (Brief, Module 01).
- One selection is shared by every module that shows the filter. Switching module keeps it (T-24).
- Each period is compared with the one right before it. The compared range is shown with the current range, for example "Nov 17, 2026 – Nov 23, 2026 vs Nov 10, 2026 – Nov 16, 2026" (Prototype `headHtml()`).
- Calculation (Prototype `curRange()`, confirmed in Q-PER-1):
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
- First day of the month: Monthly has one day, and its comparison range is one day. (Follows from the Q-PER-1 rule)
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
