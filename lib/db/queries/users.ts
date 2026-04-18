import { eq } from 'drizzle-orm';
import { db } from '../client';
import { users } from '../schema';

export async function upsertUser(clerkUserId: string, email: string, displayName?: string) {
  const [user] = await db
    .insert(users)
    .values({ clerkUserId, email, displayName })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email, displayName },
    })
    .returning();
  return user;
}

export async function getUserByClerkId(clerkUserId: string) {
  return db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) });
}

export async function deleteUserByClerkId(clerkUserId: string) {
  await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
}
