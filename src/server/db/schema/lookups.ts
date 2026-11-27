import 'server-only';

import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';

// Lookup lists. Rows are filled by migrations and read-only for the app role.
// Labels are i18n keys in `src/i18n/messages`, not columns.

export const sellerType = pgTable('seller_type', {
  code: text().primaryKey(),
  sortOrder: integer().notNull(),
  isActive: boolean().notNull().default(true),
});

export const platform = pgTable('platform', {
  code: text().primaryKey(),
  sortOrder: integer().notNull(),
});

export const recordSource = pgTable('record_source', {
  code: text().primaryKey(),
});

// `module` is reserved in Next.js lint, so the export is `appModule`.
export const appModule = pgTable('module', {
  code: text().primaryKey(),
  sortOrder: integer().notNull(),
  grantableToUser: boolean().notNull().default(true),
});

export const permissionLevel = pgTable('permission_level', {
  code: text().primaryKey(),
  rank: integer().notNull(),
});
