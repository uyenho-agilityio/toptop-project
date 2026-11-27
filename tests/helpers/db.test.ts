// @vitest-environment node
import { afterEach, expect, it } from 'vitest';
import { createTestDb, type TestDb } from './db';

// Booting PGlite and applying the migrations takes a few seconds.
const bootTimeout = 30_000;

let testDb: TestDb | undefined;

afterEach(async () => {
  await testDb?.client.close();
  testDb = undefined;
});

it(
  'runs SQL against an in-memory Postgres',
  async () => {
    testDb = await createTestDb();

    const result = await testDb.client.query<{ answer: number }>(
      'select 42 as answer',
    );

    expect(result.rows[0].answer).toBe(42);
  },
  bootTimeout,
);

it(
  'applies the migrations and switches to the app role',
  async () => {
    testDb = await createTestDb();
    await testDb.actAsApp();

    const result = await testDb.client.query<{ role: string }>(
      'select current_user as role',
    );

    expect(result.rows[0].role).toBe('toptop_app');
  },
  bootTimeout,
);
