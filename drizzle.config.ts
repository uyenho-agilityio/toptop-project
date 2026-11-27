import { defineConfig } from 'drizzle-kit';

// `server-only` in the schema needs the react-server condition: run through `pnpm db:generate`.

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema/index.ts',
  casing: 'snake_case',
  out: './drizzle',
  // Migrations run as the table owner; the app's DATABASE_URL is the app role.
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
  },
});
