import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { sessions } from '../schema';

export async function createGuestSession(guestCookieId: string) {
  const [session] = await db
    .insert(sessions)
    .values({ guestCookieId })
    .returning();
  return session;
}

export async function createUserSession(userId: string) {
  const [session] = await db
    .insert(sessions)
    .values({ userId })
    .returning();
  return session;
}

export async function getSessionById(id: string) {
  return db.query.sessions.findFirst({ where: eq(sessions.id, id) });
}

/** Claim all guest sessions + messages + emails for a newly registered user. */
export async function claimGuestSessions(guestCookieId: string, userId: string) {
  await db
    .update(sessions)
    .set({ userId, guestCookieId: null, updatedAt: new Date() })
    .where(and(eq(sessions.guestCookieId, guestCookieId), eq(sessions.userId, null as unknown as string)));
}
