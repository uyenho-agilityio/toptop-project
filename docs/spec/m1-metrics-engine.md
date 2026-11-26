# Spec: M1 Metrics Engine

**Tickets:** T-25, T-29
**Milestone:** M1

> **Scope narrowed (decision of 2026-11-26).** In M1 the engine computes **net revenue and order count** only. Cost and profit (fees, shipping, packaging, cost of goods, fixed-expense allocation, profit) stay in M4 (tickets T-26 to T-28), and M4 adds the orders and cost tables. T-29 stays as a rule: when M4 produces profit, its change is shown as an amount of money. The Build Plan HTML is updated to match in a separate PR (`docs/remove-t123-from-m1`).

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-ENG-2 | **Input shape.** M1 has no orders table (Q-FND-1, resolved) and no data is imported until M2. What does the engine read in M1, and how do its tests load records? Proposed: the engine is a pure function over a typed list of order records, so M4 only adds the database read path. | The engine cannot be tested without it. | T-25 |
| Q-ENG-3 | "Tested against a sample dataset": which dataset, and where do the expected numbers come from? T-134 (seed) is a separate ticket and T-25 does not depend on it. | Golden values for the test. | T-25, T-134 |
| Q-ENG-4 | Net revenue and order count. In the Prototype, order count is all orders in range (cancelled and returned included), and net revenue is the value of orders that are neither cancelled nor returned, after discounts. Brief 4 (Finance) lists "gross sales, seller-funded discounts, refunds and returns, net revenue". Is the Prototype's definition the intended one, and should "order count" in M1 mean all orders or only valid ones? | The first line of every report and card. | T-25 |
| Q-ENG-6 | Unavailable data (Brief 7): the engine must say a value is unavailable, never 0. How does it signal this (a null with a reason, or a separate status)? | Needed by T-04, T-07 and every module. | T-25 |
| Q-ENG-7 | Money type and rounding: integer VND or decimal. | Totals must match across screens. | T-25 |
| Q-ENG-8 | Which comparison kind each metric uses (percent, amount, percentage points) and when a change counts as "flat". The Prototype uses a 0.05 percentage-point or 1 VND threshold and shows a dash when the previous value is 0. | Output of the engine's change object. | T-29 |

## Resolved questions

| ID | Answer | Date |
| --- | --- | --- |
| Q-ENG-1 | **T-25 is narrowed to net revenue and order count. T-29 stays as a rule for M4.** Cost and profit are not processed in M1. | 2026-11-26, product owner |

Questions about fees, shipping, packaging, cost of goods and allocation (Prototype `PLAT`, `SHIP_COST`, `PACK_COST`, `perOrder()`, `fixedBetween()`) belong to M4 and are not raised here.

## Sources

- Brief 4 (Module 01 card definitions and change rule), 7 (Data sources, "unavailable data").
- Prototype: `calc()` (order and net revenue part), `valid()`, `netAll()`, `delta()`, `money()`.
- Plan: Data rules ("One source of numbers", "A profit change is always an amount of money"), epic E04.

## Behavior

### Shared engine (T-25)

- One module computes the numbers. Every screen, report, alert and AI answer reads from it and never recalculates (Plan, Data rules).
- It is a pure function: given a Business scope, a date range and the order records, it returns a metrics object. The same call is made for the previous range to get the comparison.
- M1 metrics, from the Prototype `calc()` (to confirm in Q-ENG-4):

| Metric | Definition in the Prototype |
| --- | --- |
| Order count | Count of all orders in range and in the selected shops. |
| Valid order | Not cancelled and not returned. |
| Net revenue | Sum of order value over valid orders (value = quantity x price - discount). |

- Metrics that depend on inputs that do not exist yet (everything about cost and profit) are returned as unavailable, never 0 (Brief 7).
- The engine is built so M4 can add cost and profit metrics without changing how callers read it.

### Change versus previous period (T-29)

- The engine returns, for each metric, the current value, the previous value and the change.
- **Profit change is always an amount of money, never a percentage**, because a percentage of a loss misleads (Brief, Module 01; Plan, Data rules). M1 has no profit yet, so in M1 this is a rule the change helper supports and tests, and M4 applies it.
- Other metrics return a percentage or an amount, chosen per card. Rates are compared in percentage points in the Prototype.
- Direction is good or bad depending on the metric: a rise in cost is bad (Prototype `delta()` flag `inv`).
- If the previous value is 0 or unavailable, the percentage change is unavailable; the card shows a dash or "not available yet".

## Edge cases

- Range with no orders: order count is 0 and net revenue is 0. (Prototype)
- All orders in range cancelled or returned: net revenue is 0, order count is not. (Prototype)
- A previous range with no orders: the percentage change is unavailable, not infinity. (Prototype `delta()`)
- Floating point drift: totals shown on different screens must be identical for the same input. See Q-ENG-7.

## Acceptance criteria

- [ ] A single module exposes net revenue and order count for a Business scope and range, and no other code recalculates them.
- [ ] The results match a documented sample dataset (Q-ENG-3).
- [ ] Missing inputs produce "unavailable", not 0.
- [ ] The change helper returns current value, previous value and change, and returns a profit change as an amount of money, never a percentage (covered by a unit test).
- [ ] Other metrics return percentage or amount, with direction (good or bad).
- [ ] The engine is covered by unit tests for empty ranges, zero previous value and all-cancelled ranges.

## Out of scope for M1

- Cost and profit: platform fees, transaction fees, shipping, packaging, cost of goods, fixed-expense allocation, profit before tax (M4, T-26 to T-28).
- Orders and cost tables, and screens or imports that fill them.
- POAS, ROAS, cash flow and runway (M5).
