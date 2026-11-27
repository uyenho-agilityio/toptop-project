import 'server-only';

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Tenant queries need a transaction (RLS context, spec Q-FND-2), so this uses the
// Neon serverless Pool (WebSocket), not the HTTP driver. The connection string
// must be for the app role (`toptop_app`), never the table owner.
export const createDb = (connectionString: string) => {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema, casing: 'snake_case' });
};

export type Db = ReturnType<typeof createDb>;
