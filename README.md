# TopTop

An online shop management platform for TikTok Shop and Shopee sellers in Vietnam: sales, marketing, inventory, suppliers, finance, tax, reports and an AI assistant in one app.

## Fixed rules

- Only the Admin can edit or enter data; Users are view-only.
- The Tax tab is always hidden from Users.
- The System Admin does not automatically get access to finance or tax data.
- The app does not calculate tax; it only manages tax information.

## Build Plan

136 tickets across 9 milestones (M1–M9), with a Vietnamese/English toggle (English by default), light and dark themes, and an architecture and tech stack section.

- In this repo: [`.artifacts/toptop-build-plan.html`](.artifacts/toptop-build-plan.html) (open it in a browser)
- Online version: https://claude.ai/artifact/YRix9AvmjDcds8r2FmyyuY

## Tech stack

- Next.js on Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`)
- Tailwind CSS and shadcn/ui
- Neon PostgreSQL (Singapore) with Drizzle ORM, connected through Hyperdrive
- Better Auth (Google sign-in, Organization plugin: each Business is an organization that holds many shops)
- One adapter shape for TikTok Shop, Shopee and CSV; webhooks through Cloudflare Queues
- Ask AI uses the Claude API (Admin only, read-only tools, cannot read Tax data)
- Tests: Vitest and Testing Library (tests first), Playwright for 4 flows, and API-level permission-matrix tests for role scenarios
