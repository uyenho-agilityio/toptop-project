# TopTop

Nền tảng quản lý shop online cho người bán TikTok Shop và Shopee ở Việt Nam: bán hàng, marketing, tồn kho, nhà cung cấp, tài chính, thuế, báo cáo và Trợ lý AI trong một app.

## Quy tắc cố định

- Chỉ Admin được sửa hoặc nhập dữ liệu; User chỉ xem.
- Tab Thuế luôn ẩn với User.
- System Admin không tự động có quyền xem tài chính hay thuế.
- App không tính thuế, chỉ quản lý thông tin.

## Build Plan

136 ticket chia 9 milestone (M1–M9), song ngữ VI/EN, sáng/tối, kèm phần kiến trúc và tech stack.

- Trong repo: [`.artifacts/toptop-build-plan.html`](.artifacts/toptop-build-plan.html) (mở bằng trình duyệt)
- Bản online: https://claude.ai/artifact/YRix9AvmjDcds8r2FmyyuY

## Tech stack

- Next.js trên Cloudflare Workers qua OpenNext (`@opennextjs/cloudflare`)
- Tailwind CSS + shadcn/ui
- Neon PostgreSQL (Singapore) + Drizzle ORM, kết nối qua Hyperdrive
- Better Auth (Google sign-in, Organization plugin: mỗi Business là một organization, chứa nhiều shop)
- Adapter chung cho TikTok Shop, Shopee và CSV; webhook qua Cloudflare Queues
- Ask AI dùng Claude API (chỉ Admin, tool chỉ đọc, không đọc dữ liệu Thuế)
- Test: Vitest + Testing Library, Playwright cho 4 luồng chính
