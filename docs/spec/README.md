# Milestone 1 specs

One spec per capability group. Each spec lists its decisions first, then the sources it relies on, the behavior, edge cases and acceptance criteria.

| Spec | Tickets |
| --- | --- |
| [m1-foundation.md](m1-foundation.md) | T-01, T-02, T-03, T-04, T-05, T-06, T-07 |
| [m1-auth-permissions.md](m1-auth-permissions.md) | T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19 |
| [m1-period-filter.md](m1-period-filter.md) | T-21, T-22, T-24 |
| [m1-metrics-engine.md](m1-metrics-engine.md) | T-25, T-29 |
| [m1-system-admin.md](m1-system-admin.md) | T-122, T-124, T-125 |
| [m1-i18n-theme-seed.md](m1-i18n-theme-seed.md) | T-129, T-130, T-134 |

## Conventions

- **Brief** means `.artifacts/product-brief.html`. Citations use its section numbers, for example "Brief 2.3".
- **Prototype** means `.artifacts/prototype.html`. It has no section numbers, so citations name the screen or function, for example "Prototype `curRange()`".
- **Plan** means `.artifacts/toptop-build-plan.html`. Citations use its section titles and ticket ids.
- "Proposed" marks an edge-case rule that no source states. It is the default the ticket uses and can be changed in review.
- Decision ids such as `Q-FND-1` are listed in each spec under "Decisions".
