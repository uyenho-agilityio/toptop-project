import { toNextJsHandler } from 'better-auth/next-js';
import { createAuth, createDb, getServerEnv } from '@/server';

const handlers = () => {
  const env = getServerEnv();
  return toNextJsHandler(createAuth(createDb(env.DATABASE_URL), env));
};

export const GET = (request: Request) => handlers().GET(request);

export const POST = (request: Request) => handlers().POST(request);
