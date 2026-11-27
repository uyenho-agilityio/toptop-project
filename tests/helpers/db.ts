import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { resolve } from 'node:path';
import { schema } from '@/server/db';

const migrationsFolder = resolve(process.cwd(), 'drizzle');

// In-memory Postgres for tests (PGlite) with every migration in ./drizzle applied.
// It connects as the superuser, which bypasses RLS: seed data first, then call
// `actAsApp()` so the rest of the test runs as the app role, as in production.
export const createTestDb = async () => {
  const client = new PGlite();
  await client.waitReady;
  const db = drizzle(client, { schema, casing: 'snake_case' });
  await migrate(db, { migrationsFolder });

  const actAsApp = async () => {
    await client.exec('set role toptop_app');
  };

  return { db, client, actAsApp };
};

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

const { invitation, member, organization, shop, user } = schema;

const inAWeek = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// Two Businesses, each with its Admin, one pending invitation and its shops.
export const seedTwoBusinesses = async (db: TestDb['db']) => {
  await db.insert(user).values([
    { id: 'user-a', name: 'Admin A', email: 'admin-a@example.com' },
    { id: 'user-b', name: 'Admin B', email: 'admin-b@example.com' },
  ]);
  await db.insert(organization).values([
    {
      id: 'biz-a',
      name: 'Business A',
      slug: 'business-a',
      sellerTypeCode: 'individual',
    },
    {
      id: 'biz-b',
      name: 'Business B',
      slug: 'business-b',
      sellerTypeCode: 'household_business',
    },
  ]);
  await db.insert(member).values([
    {
      id: 'member-a',
      organizationId: 'biz-a',
      userId: 'user-a',
      role: 'admin',
    },
    {
      id: 'member-b',
      organizationId: 'biz-b',
      userId: 'user-b',
      role: 'admin',
    },
  ]);
  await db.insert(invitation).values([
    {
      id: 'invite-a',
      organizationId: 'biz-a',
      email: 'invitee-a@example.com',
      role: 'user',
      expiresAt: inAWeek(),
      inviterId: 'user-a',
    },
    {
      id: 'invite-b',
      organizationId: 'biz-b',
      email: 'invitee-b@example.com',
      role: 'user',
      expiresAt: inAWeek(),
      inviterId: 'user-b',
    },
  ]);
  await db.insert(shop).values([
    {
      businessId: 'biz-a',
      name: 'A TikTok',
      platformCode: 'tiktok_shop',
      sourceCode: 'manual_entry',
    },
    {
      businessId: 'biz-a',
      name: 'A Shopee',
      platformCode: 'shopee',
      sourceCode: 'manual_entry',
    },
    {
      businessId: 'biz-b',
      name: 'B TikTok',
      platformCode: 'tiktok_shop',
      sourceCode: 'manual_entry',
    },
  ]);
};
