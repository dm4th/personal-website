import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { db } from '@/lib/db/client';
import { googleOAuthTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function getEncKey(): Buffer {
  const key = process.env.TOKEN_ENC_KEY ?? '';
  if (key.length < 64) throw new Error('TOKEN_ENC_KEY must be a 64-char hex string');
  return Buffer.from(key.slice(0, 64), 'hex');
}

export function encryptToken(plaintext: string): string {
  const key = getEncKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptToken(enc: string): string {
  const key = getEncKey();
  const [ivB64, tagB64, ctB64] = enc.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export async function getDannyAccessToken(): Promise<string> {
  const rows = await db
    .select()
    .from(googleOAuthTokens)
    .where(eq(googleOAuthTokens.subjectType, 'danny'))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Danny's Google Calendar isn't connected. Run: node --env-file=.env.local --experimental-strip-types scripts/bootstrap_danny_oauth.ts");
  }

  const accessToken = decryptToken(row.accessToken);
  const refreshToken = decryptToken(row.refreshToken);

  // Return existing if still valid (>5 min buffer)
  if (row.expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return accessToken;
  }

  // Refresh
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const json = await res.json();

  const expiresAt = new Date(Date.now() + json.expires_in * 1000);
  await db
    .update(googleOAuthTokens)
    .set({ accessToken: encryptToken(json.access_token), expiresAt, updatedAt: new Date() })
    .where(eq(googleOAuthTokens.subjectType, 'danny'));

  return json.access_token as string;
}

export async function storeDannyTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await db.delete(googleOAuthTokens).where(eq(googleOAuthTokens.subjectType, 'danny'));
  await db.insert(googleOAuthTokens).values({
    subjectType: 'danny',
    accessToken: encryptToken(accessToken),
    refreshToken: encryptToken(refreshToken),
    expiresAt,
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}
