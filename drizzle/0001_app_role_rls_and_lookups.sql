-- App role, grants, forced RLS and lookup rows (spec Q-FND-2, design m1-data-model).
-- Migrations run as the table owner. The app connects as a login role that is a
-- member of toptop_app; toptop_app does not own the tables and cannot bypass RLS.
-- No password is set here: the login role is created outside the repo (Q-SEC-3).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'toptop_app') THEN
    CREATE ROLE toptop_app NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO toptop_app;--> statement-breakpoint

-- Auth tables: Better Auth reads and writes them before a Business is chosen (D-1).
GRANT SELECT, INSERT, UPDATE, DELETE ON "user", "session", "account", "verification", "organization", "member", "invitation" TO toptop_app;--> statement-breakpoint

-- Lookup lists: read-only for the app.
GRANT SELECT ON "seller_type", "platform", "record_source", "module", "permission_level" TO toptop_app;--> statement-breakpoint

-- Tenant tables: RLS by Business, forced so that the owner is filtered too.
GRANT SELECT, INSERT, UPDATE, DELETE ON "shop" TO toptop_app;--> statement-breakpoint
ALTER TABLE "shop" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

INSERT INTO "seller_type" ("code", "sort_order", "is_active") VALUES
  ('individual', 1, true),
  ('household_business', 2, true);--> statement-breakpoint
INSERT INTO "platform" ("code", "sort_order") VALUES
  ('tiktok_shop', 1),
  ('shopee', 2);--> statement-breakpoint
INSERT INTO "record_source" ("code") VALUES
  ('platform_api'),
  ('import_file'),
  ('manual_entry');--> statement-breakpoint
INSERT INTO "module" ("code", "sort_order", "grantable_to_user") VALUES
  ('overview', 1, true),
  ('sales', 2, true),
  ('marketing', 3, true),
  ('inventory', 4, true),
  ('supplier', 5, true),
  ('finance', 6, true),
  ('tax', 7, false),
  ('reports', 8, true);--> statement-breakpoint
INSERT INTO "permission_level" ("code", "rank") VALUES
  ('view', 1);
