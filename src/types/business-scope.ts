import type { z } from 'zod';
import type { businessScopeSchema } from '@/schemas';

export type BusinessScope = z.infer<typeof businessScopeSchema>;
