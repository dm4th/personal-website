// Typed SSE event schema shared between server (route.ts) and client (store/AgentPanel)

export type StreamEvent =
  | { type: 'message_start'; messageId: string }
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_use_start'; toolUseId: string; name: string; displayInput: string }
  | { type: 'tool_result'; toolUseId: string; status: 'success' | 'error'; summary: string; payload?: unknown }
  | { type: 'auth_required'; reason: string; toolName: string }
  | { type: 'message_stop'; stopReason: string }
  | { type: 'error'; code: string; message: string }
  // Fired as each dimension sub-agent completes, before the full tool_result arrives.
  // Allows the UI to progressively render dimension scores while others are still running.
  | { type: 'dimension_score'; toolUseId: string; key: string; score: { score: number; rationale: string; citations: string[] } };

export function encodeEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function parseEvent(raw: string): StreamEvent | null {
  const line = raw.startsWith('data: ') ? raw.slice(6) : raw;
  try {
    return JSON.parse(line) as StreamEvent;
  } catch {
    return null;
  }
}
