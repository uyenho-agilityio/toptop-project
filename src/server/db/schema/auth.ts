import 'server-only';

import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sellerType } from './lookups';

// Better Auth tables (core and Organization plugin). The keys keep Better Auth's
// field names; columns are snake_case through Drizzle `casing`. They have no
// tenant RLS (decision D-1): code outside the auth layer reads `member` and
// `invitation` only through the Business-scoped helper.

const createdAt = () =>
  timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const user = pgTable(
  'user',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    // Added by TopTop (T-125).
    status: text().notNull().default('active'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [
    check('user_status_check', sql`${table.status} in ('active', 'suspended')`),
  ],
);

export const session = pgTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // The request's Business, set by the Organization plugin.
    activeOrganizationId: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index('account_user_id_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index('verification_identifier_idx').on(table.identifier)],
);

// One Business.
export const organization = pgTable(
  'organization',
  {
    id: text().primaryKey(),
    name: text().notNull().unique(),
    slug: text().notNull().unique(),
    logo: text(),
    metadata: text(),
    // Added by TopTop. Nullable until Business creation (T-122) sets it.
    sellerTypeCode: text().references(() => sellerType.code, {
      onDelete: 'restrict',
    }),
    status: text().notNull().default('active'),
    createdAt: createdAt(),
  },
  table => [
    check(
      'organization_status_check',
      sql`${table.status} in ('active', 'suspended')`,
    ),
  ],
);

export const member = pgTable(
  'member',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text().notNull(),
    createdAt: createdAt(),
  },
  table => [
    index('member_organization_id_idx').on(table.organizationId),
    index('member_user_id_idx').on(table.userId),
    // Target of composite foreign keys from tenant tables (member_permission, T-13).
    uniqueIndex('member_organization_id_id_key').on(
      table.organizationId,
      table.id,
    ),
    // One Admin per Business (Q-AUTH-10).
    uniqueIndex('member_one_admin_per_business')
      .on(table.organizationId)
      .where(sql`${table.role} = 'admin'`),
    check('member_role_check', sql`${table.role} in ('admin', 'user')`),
  ],
);

export const invitation = pgTable(
  'invitation',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text().notNull(),
    role: text(),
    status: text().notNull().default('pending'),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    inviterId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  table => [
    index('invitation_organization_id_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email),
  ],
);
