import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { schema } from '@/server/db';

// In-memory Postgres for tests (PGlite). Apply migrations from ./drizzle here once they exist.
export const createTestDb = async () => {
  const client = new PGlite();
  await client.waitReady;
  return { db: drizzle(client, { schema }), client };
};
