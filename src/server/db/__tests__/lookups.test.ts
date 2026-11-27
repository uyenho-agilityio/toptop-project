// @vitest-environment node
import { asc } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb, type TestDb } from '../../../../tests/helpers/db';
import {
  appModule,
  permissionLevel,
  platform,
  recordSource,
  sellerType,
} from '../schema';

let testDb: TestDb;

// Booting PGlite and applying the migrations takes a few seconds.
beforeAll(async () => {
  testDb = await createTestDb();
  await testDb.actAsApp();
}, 30_000);

afterAll(async () => {
  await testDb.client.close();
});

describe('lookup lists filled by the migrations', () => {
  it('has the seller types, Company not yet', async () => {
    const rows = await testDb.db
      .select()
      .from(sellerType)
      .orderBy(asc(sellerType.sortOrder));

    expect(rows.map(row => row.code)).toEqual([
      'individual',
      'household_business',
    ]);
  });

  it('has the platforms', async () => {
    const rows = await testDb.db
      .select()
      .from(platform)
      .orderBy(asc(platform.sortOrder));

    expect(rows.map(row => row.code)).toEqual(['tiktok_shop', 'shopee']);
  });

  it('has the record sources', async () => {
    const rows = await testDb.db.select().from(recordSource);

    expect(rows.map(row => row.code).sort()).toEqual([
      'import_file',
      'manual_entry',
      'platform_api',
    ]);
  });

  it('has the modules in menu order, Tax not grantable to a User', async () => {
    const rows = await testDb.db
      .select()
      .from(appModule)
      .orderBy(asc(appModule.sortOrder));

    expect(rows.map(row => row.code)).toEqual([
      'overview',
      'sales',
      'marketing',
      'inventory',
      'supplier',
      'finance',
      'tax',
      'reports',
    ]);
    expect(
      rows.filter(row => !row.grantableToUser).map(row => row.code),
    ).toEqual(['tax']);
  });

  it('has the View permission level only', async () => {
    const rows = await testDb.db.select().from(permissionLevel);

    expect(rows.map(row => row.code)).toEqual(['view']);
  });

  it('is read-only for the app role', async () => {
    await expect(
      testDb.db.insert(platform).values({ code: 'lazada', sortOrder: 3 }),
    ).rejects.toThrow();
  });
});
