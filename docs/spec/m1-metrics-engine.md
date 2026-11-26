# Spec: M1 Metrics Engine

**Tickets:** T-25, T-29
**Milestone:** M1

## Open questions

| ID | Question | Why it matters | Tickets |
| --- | --- | --- | --- |
| Q-ENG-1 | **Scope against M4.** T-25 says the engine computes gross sales, net revenue, cost of goods, costs and profit. Tickets T-26 (fees, shipping, packaging per order), T-27 (cost of goods per product) and T-28 (fixed-expense allocation) are in M4. What must M1 deliver: the engine structure and the revenue and order metrics only, or the full chain? | Decides the size of T-25 and what its tests can cover. | T-25 |
| Q-ENG-2 | **Input shape.** What data does the engine read (orders, order lines, costs, ad spend, expenses)? The tables are not in T-01 (see Q-FND-1), and no data is imported until M2. | The engine cannot be written or tested without it. | T-25 |
| Q-ENG-3 | "Tested against a sample dataset": which dataset, and where do the expected numbers come from? T-134 (seed) is a separate ticket and T-25 does not depend on it. | Golden values for the test. | T-25, T-134 |
| Q-ENG-4 | Net revenue. In the Prototype, gross sales is the sum over all orders of quantity x price (cancelled and returned included), and net revenue is the value of orders that are neither cancelled nor returned, after discounts. Brief 4 (Finance) lists "gross sales, seller-funded discounts, refunds and returns, net revenue". Do cancelled orders belong in the "refunds and returns" line, and is the Prototype's definition the intended one? | The first line of every P&L. | T-25 |
| Q-ENG-5 | Platform fee, transaction fee, per-order fixed fee, shipping and packaging are constants in the Prototype (`PLAT`, `SHIP_COST`, `PACK_COST`). Where do real values come from (settlement data, per-platform settings, Admin input)? The Prototype also charges shipping on returned orders. | Meaning of every cost line. | T-25 (and M4 T-26) |
| Q-ENG-6 | Unavailable and incomplete data (Brief 7): the engine must say a value is unavailable (not 0) and flag "incomplete cost data" wherever profit is an estimate. The Prototype engine has no such flag. How does the engine signal each case? | Needed by T-04, T-07 and every module. | T-25 |
| Q-ENG-7 | Money type and rounding: integer VND or decimal, and when to round (fees such as 5% of an order produce fractions). | Totals must match across screens. | T-25 |
| Q-ENG-8 | Which comparison kind each metric uses (percent, amount, percentage points) and when a change counts as "flat". T-29 only fixes profit as an amount. The Prototype uses a 0.05 percentage-point or 1 VND threshold and shows a dash when the previous value is 0. | Output of the engine's change object. | T-29 |

## Sources

- Brief 4 (Module 01 card definitions and change rule; Module 06 Finance "Profit and loss"; Module 03 ROAS note), 7 (Data sources).
- Prototype: `calc()`, `perOrder()`, `netAll()`, `fixedBetween()`, `monthlyFixed()`, `valid()`, `delta()`, `money()`.
- Plan: Data rules ("One source of numbers", "A profit change is always an amount of money"), epic E04.

## Behavior

### Shared engine (T-25)

- One module computes the numbers. Every screen, report, alert and AI answer reads from it and never recalculates (Plan, Data rules).
- It is a pure function: given a Business scope, a date range and the records, it returns a metrics object. The same call is made for the previous range to get the comparison.
- Reference definitions from the Prototype `calc()` (to confirm under Q-ENG-1, Q-ENG-4 and Q-ENG-5):

| Metric | Definition in the Prototype |
| --- | --- |
| Orders | Count of all orders in range and in the selected shops. |
| Valid order | Not cancelled and not returned. |
| Gross sales | Sum of quantity x price over all orders in range. |
| Discounts | Sum of order discounts over all orders. |
| Net revenue | Sum of order value over valid orders (value = gross - discount). |
| Completed, cancelled, returned orders | Counts by status; rates are each count divided by all orders. |
| Average order value | Net revenue / valid orders. |
| Cost of goods | Quantity x product cost over valid orders. |
| Variable costs | Platform fee + transaction fee + shipping + packaging + affiliate commission + ads. |
| Gross profit | Net revenue - cost of goods. |
| Contribution profit | Gross profit - variable costs. |
| Fixed expenses | Monthly fixed total split per day by month length, times the selected shops' share of net revenue. |
| Operating profit | Contribution profit - fixed expenses. |
| Profit before tax | Operating profit + other income - other expenses (both also allocated by revenue share). |
| Profit margin | Profit before tax / net revenue; unavailable when net revenue is 0 or less. |
| ROAS | Ad-attributed net revenue / ad spend; unavailable when ad spend is 0. |

- Metrics that depend on inputs that do not exist yet are returned as unavailable, never 0 (Brief 7).
- When the cost inputs are incomplete, profit is returned together with an "estimated" flag (Brief 7). See Q-ENG-6.

### Change versus previous period (T-29)

- The engine returns, for each metric, the current value, the previous value and the change.
- **Profit change is always an amount of money, never a percentage**, because a percentage of a loss misleads (Brief, Module 01; Plan, Data rules).
- Other metrics return a percentage or an amount, chosen per card. Rates (margin, cancel rate) are compared in percentage points in the Prototype.
- Direction is good or bad depending on the metric: a rise in cost is bad (Prototype `delta()` flag `inv`).
- If the previous value is 0 or unavailable, the percentage change is unavailable; the card shows a dash or "not available yet".

## Edge cases

- Range with no orders: counts are 0, money totals are 0, ratios are unavailable. (Prototype: `aov` 0, `margin` null, `roas` null)
- Net revenue is 0 or negative: margin unavailable. (Prototype)
- A Business with only some shops connected: the engine includes only live shops (Prototype `okShop()`, `liveShop()`). The shop and platform filters themselves arrive in M2.
- Fixed expenses allocated to a subset of shops use the subset's share of net revenue. If all shops have 0 revenue the share is 0. (Prototype)
- Month with 28, 29, 30 and 31 days splits fixed cost per day accordingly. (Prototype `fixedBetween()`)
- Floating point drift: totals shown on different screens must be identical for the same input. See Q-ENG-7.

## Acceptance criteria

- [ ] A single module exposes the metrics for a Business scope and range, and no other code recalculates them.
- [ ] Gross sales, net revenue, cost of goods, costs and profit are computed per the agreed definitions (after Q-ENG-1, Q-ENG-4 and Q-ENG-5 are answered).
- [ ] The results match a documented sample dataset (Q-ENG-3).
- [ ] Missing inputs produce "unavailable", not 0, and incomplete cost data produces an "estimated" flag.
- [ ] The profit change is always returned as an amount of money.
- [ ] Other metrics return percentage or amount per card, with direction (good or bad).
- [ ] The engine is covered by unit tests for empty ranges, zero previous value, negative profit and shop subsets.

## Out of scope for M1

- Per-order fee, shipping and packaging calculation, cost of goods per product, and fixed-expense allocation as separate features (T-26 to T-28, M4), unless Q-ENG-1 is answered otherwise.
- POAS, cash flow and runway (M5).
