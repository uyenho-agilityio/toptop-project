# Spec: M1 Metrics Engine

**Tickets:** T-25, T-29
**Milestone:** M1

> **Scope narrowed (decision of 2026-11-26).** In M1 the engine computes **net revenue and order count** only. Cost and profit (fees, shipping, packaging, cost of goods, fixed-expense allocation, profit) stay in M4 (tickets T-26 to T-28), and M4 adds the orders and cost tables. T-29 stays as a rule: when M4 produces profit, its change is shown as an amount of money. The Build Plan HTML is updated to match in a separate PR (`docs/remove-t123-from-m1`).

## Open questions

None. Every question is resolved; see the next section.

## Resolved questions

| ID | Answer | Date |
| --- | --- | --- |
| Q-ENG-1 | **T-25 is narrowed to net revenue and order count. T-29 stays as a rule for M4.** Cost and profit are not processed in M1. | 2026-11-26, product owner |

Questions about fees, shipping, packaging, cost of goods and allocation (Prototype `PLAT`, `SHIP_COST`, `PACK_COST`, `perOrder()`, `fixedBetween()`) belong to M4 and are not raised here.
| Q-ENG-2 | The engine is a pure function over a typed list of order records passed in. M4 adds the database read. | 2026-11-26, product owner accepted the proposed default |
| Q-ENG-3 | The engine test uses a small generated dataset like the Prototype's, with the expected numbers written down in the test. | 2026-11-26, product owner accepted the proposed default |
| Q-ENG-4 | **Follow the Prototype exactly.** Order count is every order in the range and selected shops, including cancelled and returned orders (Prototype `calc()`: `m.n++` before the status check). Net revenue is the sum of order value over orders that are neither cancelled nor returned; orders still in progress (to ship, shipping) and completed orders count as valid. Order value is quantity x price - discount. | 2026-11-26, product owner |
| Q-ENG-6 | An unavailable value is a null plus a reason. | 2026-11-26, product owner accepted the proposed default |
| Q-ENG-7 | Money is integer VND. | 2026-11-26, product owner accepted the proposed default |
| Q-ENG-8 | As the Prototype `delta()`: percent change is flat under 0.05%, amount change is flat under 1 VND, percentage-point change is flat under 0.05, and a dash is shown when the previous value is 0. | 2026-11-26, product owner accepted the proposed default |

## Sources

- Brief 4 (Module 01 card definitions and change rule), 7 (Data sources, "unavailable data").
- Prototype: `calc()` (order and net revenue part), `valid()`, `netAll()`, `delta()`, `money()`.
- Plan: Data rules ("One source of numbers", "A profit change is always an amount of money"), epic E04.

## Behavior

### Shared engine (T-25)

- One module computes the numbers. Every screen, report, alert and AI answer reads from it and never recalculates (Plan, Data rules).
- It is a pure function: given a Business scope, a date range and the order records, it returns a metrics object. The same call is made for the previous range to get the comparison.
- M1 metrics, exactly as the Prototype `calc()` computes them (Q-ENG-4):

| Metric | Definition in the Prototype |
| --- | --- |
| Order count | Count of all orders in range and in the selected shops, including cancelled and returned orders. |
| Valid order | Not cancelled and not returned. |
| Net revenue | Sum of order value over valid orders (value = quantity x price - discount). Cancelled and returned orders are left out; completed and in-progress orders are included. |

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
