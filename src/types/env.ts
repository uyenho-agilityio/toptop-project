import type { z } from 'zod';
import type { serverEnvSchema } from '@/schemas/env';

export type ServerEnv = z.infer<typeof serverEnvSchema>;
