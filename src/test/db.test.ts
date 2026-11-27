import { afterEach, expect, it } from "vitest";
import { createTestDb } from "./db";

let close: (() => Promise<void>) | undefined;

afterEach(async () => {
  await close?.();
  close = undefined;
});

it("runs SQL against an in-memory Postgres", async () => {
  const { client } = await createTestDb();
  close = () => client.close();

  const result = await client.query<{ answer: number }>("select 42 as answer");

  expect(result.rows[0].answer).toBe(42);
});
