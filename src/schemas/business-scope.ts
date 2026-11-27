import { z } from 'zod';

// The Business and user a tenant query runs for (spec Q-FND-2). Both are
// required: a request without a Business scope is rejected.
export const businessScopeSchema = z.object({
  businessId: z
    .string({ error: 'A Business is required' })
    .trim()
    .min(1, 'A Business is required'),
  userId: z
    .string({ error: 'A signed-in user is required' })
    .trim()
    .min(1, 'A signed-in user is required'),
});
