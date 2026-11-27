import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/auth";
import { createDb } from "@/db";
import { getServerEnv } from "@/lib/env";

function handlers() {
  const env = getServerEnv();
  return toNextJsHandler(createAuth(createDb(env.DATABASE_URL), env));
}

export function GET(request: Request) {
  return handlers().GET(request);
}

export function POST(request: Request) {
  return handlers().POST(request);
}
