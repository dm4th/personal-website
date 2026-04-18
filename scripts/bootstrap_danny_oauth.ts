/**
 * One-time bootstrap: link Dan's Google Calendar to the site.
 *
 * Run with:
 *   node --env-file=.env.local --experimental-strip-types scripts/bootstrap_danny_oauth.ts
 *
 * Requires env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 *                    NEON_DATABASE_URL, TOKEN_ENC_KEY
 */

import * as readline from 'readline';
import { storeDannyTokens } from '../lib/auth/googleOAuth';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // out-of-band — no local server needed

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET');
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n=== Dan\'s Google Calendar Bootstrap ===\n');
console.log('1. Open this URL in your browser (sign in as your Google account):');
console.log(`\n   ${authUrl}\n`);
console.log('2. Grant the calendar permissions.');
console.log('3. Copy the authorization code shown and paste it below.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste authorization code: ', async (code) => {
  rl.close();

  console.log('\nExchanging code for tokens…');

  const res = await fetch('https://oauth2.googleapis.com/token', {
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

  if (!res.ok) {
    const text = await res.text();
    console.error('Token exchange failed:', text);
    process.exit(1);
  }

  const json = await res.json();

  if (!json.refresh_token) {
    console.error('No refresh_token in response. Make sure you used prompt=consent.');
    console.error('Response:', JSON.stringify(json, null, 2));
    process.exit(1);
  }

  await storeDannyTokens(json.access_token, json.refresh_token, json.expires_in);

  console.log('\n✓ Tokens stored and encrypted in the database.');
  console.log('  Dan\'s Google Calendar is now connected.\n');
  process.exit(0);
});
