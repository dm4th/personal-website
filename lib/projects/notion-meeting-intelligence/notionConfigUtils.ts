import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, notionConfigs } from '@/lib/db/schema';
import { decryptToken } from '@/lib/auth/googleOAuth';

async function getDbUser(clerkUserId: string) {
  const rows = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return rows[0] ?? null;
}

export async function getDecryptedToken(clerkUserId: string): Promise<string | null> {
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return null;

  const rows = await db
    .select({ integrationToken: notionConfigs.integrationToken })
    .from(notionConfigs)
    .where(eq(notionConfigs.userId, dbUser.id))
    .limit(1);

  const enc = rows[0]?.integrationToken;
  if (!enc) return null;
  return decryptToken(enc);
}
