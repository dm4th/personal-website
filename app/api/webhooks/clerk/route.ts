import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { upsertUser, deleteUserByClerkId } from '@/lib/db/queries/users';

type ClerkEmailAddress = { email_address: string; id: string };

type ClerkUserEventData = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name?: string | null;
  last_name?: string | null;
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('CLERK_WEBHOOK_SECRET not configured', { status: 500 });
  }

  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let event: { type: string; data: ClerkUserEventData };
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const { type, data } = event;

  if (type === 'user.created' || type === 'user.updated') {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    if (!primaryEmail) return new Response('No primary email', { status: 400 });

    const displayName =
      [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

    await upsertUser(data.id, primaryEmail.email_address, displayName ?? undefined);
  }

  if (type === 'user.deleted') {
    await deleteUserByClerkId(data.id);
  }

  return new Response('OK', { status: 200 });
}
