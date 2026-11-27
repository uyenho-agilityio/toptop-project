import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import type { Db } from "@/db";
import type { ServerEnv } from "@/types/env";

// Each Business is one Better Auth organization that holds many shops.
// Roles, invitations, rate limits and the auth tables arrive with the M1 auth tickets.
export const createAuth = (db: Db, env: ServerEnv) =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "pg" }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [organization(), nextCookies()],
  });
