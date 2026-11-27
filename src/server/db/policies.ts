import 'server-only';

import { sql } from 'drizzle-orm';
import { pgPolicy } from 'drizzle-orm/pg-core';

// The one RLS policy of every tenant table (Q-FND-2): a row is visible and
// writable only when its business_id equals the transaction's Business, set by
// `withBusiness`. With no Business set, current_setting returns null and no
// row matches. FORCE ROW LEVEL SECURITY is set in the migration.
export const businessIsolation = (name: string) =>
  pgPolicy(name, {
    for: 'all',
    using: sql`business_id = current_setting('app.business_id', true)`,
    withCheck: sql`business_id = current_setting('app.business_id', true)`,
  });
