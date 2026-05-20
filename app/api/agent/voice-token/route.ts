import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AssemblyAI key not configured' }, { status: 500 });

  let res: Response;
  try {
    res = await fetch('https://streaming.assemblyai.com/v3/token?expires_in_seconds=60', {
      headers: { authorization: apiKey },
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not reach AssemblyAI — check network (${msg})` },
      { status: 503 },
    );
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Token mint failed: ${text}` }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ token: data.token });
}
