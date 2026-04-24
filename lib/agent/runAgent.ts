import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './systemPrompt';
import { TOOL_DEFINITIONS, runTool } from './tools';
import { encodeEvent, type StreamEvent } from './streamProtocol';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_TURNS = 10;

export type AgentMessage = Anthropic.MessageParam;

/**
 * Runs the agent tool loop, writing SSE events to the provided WritableStreamDefaultWriter.
 * Handles multi-turn tool use automatically.
 */
export async function runAgent(
  userPrompt: string,
  history: AgentMessage[],
  writer: WritableStreamDefaultWriter<Uint8Array>,
  userId?: string | null,
): Promise<void> {
  const encoder = new TextEncoder();

  const emit = (event: StreamEvent) => {
    writer.write(encoder.encode(encodeEvent(event)));
  };

  const messages: AgentMessage[] = [
    ...history,
    { role: 'user', content: userPrompt },
  ];

  const messageId = crypto.randomUUID();
  emit({ type: 'message_start', messageId });

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages,
      tools: TOOL_DEFINITIONS as unknown as Anthropic.Tool[],
      stream: false,
    });

    // Emit text content
    for (const block of response.content) {
      if (block.type === 'text') {
        // Stream text in small chunks so it feels live
        for (let i = 0; i < block.text.length; i += 16) {
          emit({ type: 'text_delta', delta: block.text.slice(i, i + 16) });
        }
      }
    }

    // End of conversation
    if (response.stop_reason === 'end_turn') {
      emit({ type: 'message_stop', stopReason: 'end_turn' });
      messages.push({ role: 'assistant', content: response.content });
      break;
    }

    // Tool use turn
    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        const displayInput = JSON.stringify(block.input, null, 2).slice(0, 200);
        emit({ type: 'tool_use_start', toolUseId: block.id, name: block.name, displayInput });

        // Auth-gate check: gated tools require userId
        const GATED_TOOLS = ['send_email_to_danny', 'confirm_meeting', 'generate_application_materials'];
        if (GATED_TOOLS.includes(block.name) && !userId) {
          emit({ type: 'auth_required', reason: 'Sign in to use this feature', toolName: block.name });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: 'Authentication required' }),
            is_error: true,
          });
          continue;
        }

        const result = await runTool(block.name, block.input as Record<string, unknown>);

        emit({
          type: 'tool_result',
          toolUseId: block.id,
          status: result.isError ? 'error' : 'success',
          summary: result.summary,
          payload: JSON.parse(result.content),
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result.content,
          is_error: result.isError,
        });
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // Unexpected stop reason
    emit({ type: 'message_stop', stopReason: response.stop_reason ?? 'unknown' });
    break;
  }
}
