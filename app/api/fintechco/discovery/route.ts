import Anthropic from '@anthropic-ai/sdk';
import { encodeEvent, type StreamEvent } from '@/lib/agent/streamProtocol';
import { DISCOVERY_PERSONAS, buildDiscoverySystemPrompt, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

const KICKOFF_MESSAGE = 'Begin the discovery session and ask your first question.';

export async function POST(req: Request) {
  const body = (await req.json()) as { persona?: DiscoveryPersona; history?: HistoryMessage[] };
  const { persona, history = [] } = body;

  if (!persona || !(persona in DISCOVERY_PERSONAS)) {
    return new Response(JSON.stringify({ error: 'Invalid persona' }), { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = history.length > 0
    ? history.map((m) => ({ role: m.role, content: m.content }))
    : [{ role: 'user', content: KICKOFF_MESSAGE }];

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const emit = (event: StreamEvent) => writer.write(encoder.encode(encodeEvent(event)));

  (async () => {
    const messageId = crypto.randomUUID();
    emit({ type: 'message_start', messageId });

    try {
      const stream = client.messages.stream({
        model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildDiscoverySystemPrompt(persona),
        messages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          // API chunks can be coarse; re-split for smooth client rendering.
          for (let i = 0; i < event.delta.text.length; i += 16) {
            emit({ type: 'text_delta', delta: event.delta.text.slice(i, i + 16) });
          }
        }
      }

      const final = await stream.finalMessage();
      emit({ type: 'message_stop', stopReason: final.stop_reason ?? 'end_turn' });
    } catch (err) {
      emit({ type: 'error', code: 'discovery_error', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
