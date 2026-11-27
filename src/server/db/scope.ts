import 'server-only';

import { and, eq, sql, type ExtractTablesWithRelations } from 'drizzle-orm';
import type {
  PgDatabase,
  PgQueryResultHKT,
  PgTransaction,
} from 'drizzle-orm/pg-core';
import { businessScopeSchema } from '@/schemas';
import type { BusinessScope } from '@/types';
import * as schema from './schema';

type Schema = typeof schema;

// Any Drizzle Postgres database on this schema: Neon in the app, PGlite in tests.
export type TenantDatabase = PgDatabase<PgQueryResultHKT, Schema>;

export type TenantTransaction = PgTransaction<
  PgQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

type TransactionOf<D extends TenantDatabase> = Parameters<
  Parameters<D['transaction']>[0]
>[0];

export type BusinessContext<Tx = TenantTransaction> = BusinessScope & {
  tx: Tx;
};

// The shared Business-scoped helper (spec Q-FND-2). Every tenant read and write
// runs inside it:
// 1. rejects a call with no Business or no user;
// 2. opens a transaction and checks that the user is a member of the Business;
// 3. sets app.business_id and app.user_id for that transaction only, so RLS
//    returns and accepts only this Business's rows;
// 4. runs the queries, which also filter by `businessId` (both layers).
export const withBusiness = async <D extends TenantDatabase, R>(
  db: D,
  scope: BusinessScope,
  run: (context: BusinessContext<TransactionOf<D>>) => Promise<R>,
): Promise<R> => {
  const parsed = businessScopeSchema.safeParse(scope);
  if (!parsed.success) {
    throw new Error(
      `Tenant query rejected: ${parsed.error.issues.map(issue => issue.message).join(', ')}`,
    );
  }
  const { businessId, userId } = parsed.data;

  return db.transaction(async tx => {
    const membership = await tx
      .select({ id: schema.member.id })
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, businessId),
          eq(schema.member.userId, userId),
        ),
      )
      .limit(1);
    if (membership.length === 0) {
      throw new Error(
        'Tenant query rejected: user is not a member of this Business',
      );
    }

    await tx.execute(
      sql`select set_config('app.business_id', ${businessId}, true), set_config('app.user_id', ${userId}, true)`,
    );

    return run({ tx: tx as TransactionOf<D>, businessId, userId });
  });
};
