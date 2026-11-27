import type { z } from 'zod';
import type { serverEnvSchema } from '@/schemas';

export type ServerEnv = z.infer<typeof serverEnvSchema>;
