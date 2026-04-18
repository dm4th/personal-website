import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { createGuestSession, createUserSession, claimGuestSessions } from '@/lib/db/queries/sessions';
import { getUserByClerkId } from '@/lib/db/queries/users';

const COOKIE_NAME = 'hs_sid';
const GUEST_COOKIE = 'hs_gid';

/** Encrypt a string value with AES-256-GCM using TOKEN_ENC_KEY */
function encrypt(plain: string): string {
  const key = Buffer.from(process.env.TOKEN_ENC_KEY!, 'hex');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

/** Decrypt value encrypted by encrypt() */
function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split('.');
  const key = Buffer.from(process.env.TOKEN_ENC_KEY!, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(dataHex, 'hex')).toString('utf8') + decipher.final('utf8');
}

export async function POST() {
  const cookieStore = await cookies();
  const { userId: clerkUserId } = await auth();

  // ── Authenticated user ────────────────────────────────────────────────────
  if (clerkUserId) {
    const user = await getUserByClerkId(clerkUserId);
    if (!user) return new Response('User not found', { status: 404 });

    // Claim any prior guest sessions
    const guestCookie = cookieStore.get(GUEST_COOKIE);
    if (guestCookie) {
      try {
        const guestCookieId = decrypt(guestCookie.value);
        await claimGuestSessions(guestCookieId, user.id);
      } catch {}
      cookieStore.delete(GUEST_COOKIE);
    }

    // Return or create a session for this user
    const existingSessionId = cookieStore.get(COOKIE_NAME)?.value;
    if (existingSessionId) return Response.json({ sessionId: existingSessionId });

    const session = await createUserSession(user.id);
    cookieStore.set(COOKIE_NAME, session.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json({ sessionId: session.id });
  }

  // ── Guest ─────────────────────────────────────────────────────────────────
  const existingSessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (existingSessionId) return Response.json({ sessionId: existingSessionId });

  const guestId = randomBytes(16).toString('hex');
  const session = await createGuestSession(guestId);

  // Session id in a plain cookie for reference, encrypted guest id in a separate cookie
  cookieStore.set(COOKIE_NAME, session.id, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set(GUEST_COOKIE, encrypt(guestId), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ sessionId: session.id });
}
