import { NextResponse } from 'next/server';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

export async function GET() {
  const keyId = process.env.DOCWOW_AWS_ACCESS_KEY_ID;
  const secret = process.env.DOCWOW_AWS_SECRET_ACCESS_KEY;
  const region = process.env.DOCWOW_AWS_REGION ?? 'us-east-1';

  if (!keyId || !secret) {
    return NextResponse.json({
      error: 'Missing credentials',
      keyIdSet: !!keyId,
      secretSet: !!secret,
    });
  }

  try {
    const sts = new STSClient({
      region,
      credentials: { accessKeyId: keyId, secretAccessKey: secret },
    });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    return NextResponse.json({
      ok: true,
      account: identity.Account,
      arn: identity.Arn,
      keyIdPrefix: keyId.slice(0, 8) + '...',
    });
  } catch (e) {
    return NextResponse.json({
      error: (e as Error).message,
      keyIdPrefix: keyId.slice(0, 8) + '...',
      keyIdLength: keyId.length,
      secretLength: secret.length,
    });
  }
}
