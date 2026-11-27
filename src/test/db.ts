import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/db/schema";

// In-memory Postgres for tests (PGlite). Apply migrations from ./drizzle here once they exist.
export async function createTestDb() {
  const client = new PGlite();
  await client.waitReady;
  return { db: drizzle(client, { schema }), client };
}
