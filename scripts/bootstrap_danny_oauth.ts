/**
 * One-time bootstrap: link Dan's Google Calendar to the site.
 *
 * Prerequisites:
 *   1. Create OAuth 2.0 credentials in Google Cloud Console as type "Desktop app"
 *      (Web app type won't work - OOB flow requires Desktop app credentials)
 *   2. Enable the Google Calendar API in the same project
 *   3. Set these in .env.local:
 *        GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 *        TOKEN_ENC_KEY (64-char hex - generate with: openssl rand -hex 32)
 *        NEON_DATABASE_URL
 *
 * Run with:
 *   node --env-file=.env.local --experimental-strip-types scripts/bootstrap_danny_oauth.ts
 */

import * as readline from 'readline';
import { createCipheriv, randomBytes } from 'crypto';
import { neon } from '@neondatabase/serverless';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌  Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env.local');
  process.exit(1);
}
if (!process.env.TOKEN_ENC_KEY || process.env.TOKEN_ENC_KEY.length < 64) {
  console.error('❌  TOKEN_ENC_KEY must be a 64-char hex string. Generate one with: openssl rand -hex 32');
  process.exit(1);
}
if (!process.env.NEON_DATABASE_URL) {
  console.error('❌  Missing NEON_DATABASE_URL in .env.local');
  process.exit(1);
}

function encryptToken(plaintext: string): string {
  const key = Buffer.from(process.env.TOKEN_ENC_KEY!.slice(0, 64), 'hex');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n=== Google Calendar Bootstrap ===\n');
console.log('1. Open this URL in your browser (sign in as your Google account):');
console.log(`\n   ${authUrl}\n`);
console.log('2. Grant the calendar permissions.');
console.log('3. Copy the authorization code and paste it below.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste authorization code: ', async (code) => {
  rl.close();
  console.log('\nExchanging code for tokens…');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.error('❌  Token exchange failed:', await tokenRes.text());
    process.exit(1);
  }

  const tokens = await tokenRes.json();
  if (!tokens.refresh_token) {
    console.error('❌  No refresh_token returned. Make sure you used prompt=consent and Desktop app credentials.');
    process.exit(1);
  }

  const encAccess = encryptToken(tokens.access_token);
  const encRefresh = encryptToken(tokens.refresh_token);
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const sql = neon(process.env.NEON_DATABASE_URL!);

  // Clear existing danny row then insert fresh
  await sql`DELETE FROM google_oauth_tokens WHERE subject_type = 'danny'`;
  await sql`
    INSERT INTO google_oauth_tokens
      (id, subject_type, user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'danny', NULL, ${encAccess}, ${encRefresh}, ${expiresAt},
       ARRAY['https://www.googleapis.com/auth/calendar.readonly',
             'https://www.googleapis.com/auth/calendar.events'],
       now(), now())
  `;

  console.log('\n✓ Tokens stored and encrypted in the database.');
  console.log("  Dan's Google Calendar is now connected.\n");
  process.exit(0);
});
