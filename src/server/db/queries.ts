import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { invitation, member, shop } from './schema';
import type { BusinessContext } from './scope';

// Business-scoped reads. Each one runs inside `withBusiness` and filters by the
// context's Business, on top of RLS (Q-FND-2). `member` and `invitation` have no
// RLS (decision D-1), so this filter is their only guard outside Better Auth.

export const listShops = ({ tx, businessId }: BusinessContext) =>
  tx
    .select()
    .from(shop)
    .where(eq(shop.businessId, businessId))
    .orderBy(asc(shop.name));

export const listMembers = ({ tx, businessId }: BusinessContext) =>
  tx
    .select()
    .from(member)
    .where(eq(member.organizationId, businessId))
    .orderBy(asc(member.createdAt));

export const listInvitations = ({ tx, businessId }: BusinessContext) =>
  tx
    .select()
    .from(invitation)
    .where(eq(invitation.organizationId, businessId))
    .orderBy(asc(invitation.createdAt));
