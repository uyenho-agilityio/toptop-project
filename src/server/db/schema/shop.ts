import 'server-only';

import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { businessIsolation } from '../policies';
import { organization } from './auth';
import { platform, recordSource } from './lookups';

// Tenant table: RLS by Business (Q-FND-2).
export const shop = pgTable(
  'shop',
  {
    id: uuid().primaryKey().defaultRandom(),
    businessId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    name: text().notNull(),
    platformCode: text()
      .notNull()
      .references(() => platform.code, { onDelete: 'restrict' }),
    status: text().notNull().default('active'),
    sourceCode: text()
      .notNull()
      .references(() => recordSource.code, { onDelete: 'restrict' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => [
    index('shop_business_id_idx').on(table.businessId),
    unique('shop_business_id_name_key').on(table.businessId, table.name),
    // Targets of composite foreign keys from platform_connection (M2) and orders (M4).
    unique('shop_business_id_id_key').on(table.businessId, table.id),
    unique('shop_business_id_id_platform_code_key').on(
      table.businessId,
      table.id,
      table.platformCode,
    ),
    check('shop_status_check', sql`${table.status} in ('active', 'inactive')`),
    businessIsolation('shop_business_isolation'),
  ],
);
