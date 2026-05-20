import { auth } from '@clerk/nextjs/server';
import { runAgent, type AgentMessage } from '@/lib/agent/runAgent';
import { encodeEvent } from '@/lib/agent/streamProtocol';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();

  let body: { prompt?: string; history?: AgentMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { prompt, history = [] } = body;
  if (!prompt || typeof prompt !== 'string') {
    return new Response('Missing prompt', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const writer = new WritableStream<Uint8Array>({
        write(chunk) { controller.enqueue(chunk); },
        close() { controller.close(); },
        abort(err) { controller.error(err); },
      }).getWriter();

      try {
        await runAgent(prompt, history, writer, userId);
      } catch (err) {
        const event = encodeEvent({ type: 'error', code: 'agent_error', message: String(err) });
        controller.enqueue(encoder.encode(event));
      } finally {
        writer.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
