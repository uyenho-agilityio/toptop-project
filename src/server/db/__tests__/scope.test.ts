// @vitest-environment node
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  createTestDb,
  seedTwoBusinesses,
  type TestDb,
} from '../../../../tests/helpers/db';
import { listInvitations, listMembers, listShops } from '../queries';
import { invitation, member, shop } from '../schema';
import { withBusiness } from '../scope';

let testDb: TestDb;

// Booting PGlite and applying the migrations takes a few seconds.
beforeAll(async () => {
  testDb = await createTestDb();
  await seedTwoBusinesses(testDb.db);
  // From here on, every query runs as the app role, as in production.
  await testDb.actAsApp();
}, 30_000);

afterAll(async () => {
  await testDb.client.close();
});

const adminA = { businessId: 'biz-a', userId: 'user-a' };
const adminB = { businessId: 'biz-b', userId: 'user-b' };

describe('withBusiness', () => {
  it('rejects a call with no Business and never runs the queries', async () => {
    const run = vi.fn();

    await expect(
      withBusiness(testDb.db, { businessId: '', userId: 'user-a' }, run),
    ).rejects.toThrow(/Business/);
    await expect(
      withBusiness(
        testDb.db,
        { userId: 'user-a' } as unknown as typeof adminA,
        run,
      ),
    ).rejects.toThrow(/Business/);
    expect(run).not.toHaveBeenCalled();
  });

  it('rejects a user who is not a member of the Business', async () => {
    const run = vi.fn();

    // Admin of Business A asks for Business B.
    await expect(
      withBusiness(testDb.db, { businessId: 'biz-b', userId: 'user-a' }, run),
    ).rejects.toThrow(/not a member/);
    expect(run).not.toHaveBeenCalled();
  });

  it('sets app.business_id and app.user_id in the same transaction', async () => {
    // set_config(..., true) lasts only until the transaction ends, so a later
    // statement sees the values only when both run in one transaction.
    const settings = await withBusiness(testDb.db, adminA, async ({ tx }) => {
      const result = await tx.execute<{ business_id: string; user_id: string }>(
        sql`select current_setting('app.business_id', true) as business_id,
                   current_setting('app.user_id', true) as user_id`,
      );
      return result.rows[0];
    });

    expect(settings).toEqual({ business_id: 'biz-a', user_id: 'user-a' });
  });

  it('clears the Business context when the transaction ends', async () => {
    await withBusiness(testDb.db, adminA, async () => undefined);

    const result = await testDb.db.execute<{ business_id: string | null }>(
      sql`select nullif(current_setting('app.business_id', true), '') as business_id`,
    );

    expect(result.rows[0].business_id).toBeNull();
  });
});

describe('Business isolation (Q-FND-2)', () => {
  it('lets the Admin of Business A read only Business A shops', async () => {
    const shops = await withBusiness(testDb.db, adminA, listShops);

    expect(shops.map(row => row.name).sort()).toEqual(['A Shopee', 'A TikTok']);
  });

  it('does not let the Admin of Business A read Business B data, even with a direct filter', async () => {
    const rows = await withBusiness(testDb.db, adminA, ({ tx }) =>
      tx
        .select()
        .from(shop)
        .where(sql`${shop.businessId} = 'biz-b'`),
    );

    expect(rows).toEqual([]);
  });

  it('returns only the current Business when a query forgets the filter (RLS)', async () => {
    const rows = await withBusiness(testDb.db, adminB, ({ tx }) =>
      tx.select().from(shop),
    );

    expect(rows.map(row => row.businessId)).toEqual(['biz-b']);
  });

  it('returns no rows for a query with no Business context', async () => {
    const rows = await testDb.db.select().from(shop);

    expect(rows).toEqual([]);
  });

  it('rejects a write with no Business context', async () => {
    await expect(
      testDb.db.insert(shop).values({
        businessId: 'biz-a',
        name: 'No context',
        platformCode: 'shopee',
        sourceCode: 'manual_entry',
      }),
    ).rejects.toThrow();
  });

  it('rejects a write into another Business', async () => {
    await expect(
      withBusiness(testDb.db, adminA, ({ tx }) =>
        tx.insert(shop).values({
          businessId: 'biz-b',
          name: 'Planted in B',
          platformCode: 'shopee',
          sourceCode: 'manual_entry',
        }),
      ),
    ).rejects.toThrow();

    const bShops = await withBusiness(testDb.db, adminB, listShops);
    expect(bShops.map(row => row.name)).toEqual(['B TikTok']);
  });

  it('lets a Business write its own rows', async () => {
    await withBusiness(testDb.db, adminA, ({ tx }) =>
      tx.insert(shop).values({
        businessId: 'biz-a',
        name: 'A Manual',
        platformCode: 'shopee',
        sourceCode: 'manual_entry',
      }),
    );

    const shops = await withBusiness(testDb.db, adminA, listShops);
    expect(shops.map(row => row.name)).toContain('A Manual');
  });
});

describe('members and invitations through the helper (decision D-1)', () => {
  it('returns only the current Business members', async () => {
    const members = await withBusiness(testDb.db, adminA, listMembers);

    expect(members.map(row => row.organizationId)).toEqual(['biz-a']);
  });

  it('returns only the current Business invitations', async () => {
    const invitations = await withBusiness(testDb.db, adminB, listInvitations);

    expect(invitations.map(row => row.email)).toEqual([
      'invitee-b@example.com',
    ]);
  });

  it('keeps the auth tables readable for Better Auth, with no Business context', async () => {
    const members = await testDb.db.select().from(member);
    const invitations = await testDb.db.select().from(invitation);

    expect(members).toHaveLength(2);
    expect(invitations).toHaveLength(2);
  });
});

describe('app database role', () => {
  it('does not own the tables and cannot bypass RLS', async () => {
    const result = await testDb.db.execute<{
      bypass: boolean;
      owns_shop: boolean;
      forced: boolean;
    }>(
      sql`select r.rolbypassrls as bypass,
                 pg_has_role(current_user, c.relowner, 'MEMBER') as owns_shop,
                 c.relforcerowsecurity as forced
            from pg_roles r, pg_class c
           where r.rolname = current_user and c.relname = 'shop'`,
    );

    expect(result.rows[0]).toEqual({
      bypass: false,
      owns_shop: false,
      forced: true,
    });
  });
});
