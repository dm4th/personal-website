import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StreamEvent } from '@/lib/agent/streamProtocol';

export type PanelState = 'collapsed' | 'sidebar' | 'expanded';

export type TextPart = { type: 'text'; text: string };
export type ToolUsePart = {
  type: 'tool_use';
  toolUseId: string;
  name: string;
  displayInput: string;
  status: 'pending' | 'success' | 'error';
  summary?: string;
  payload?: unknown;
};
export type MessagePart = TextPart | ToolUsePart;

export type UIMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
};

type AgentState = {
  panelState: PanelState;
  messages: UIMessage[];
  isStreaming: boolean;
  nudgeDismissed: boolean;
  sessionId: string | null;
  setPanelState: (s: PanelState) => void;
  togglePanel: () => void;
  dismissNudge: () => void;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      panelState: 'sidebar',
      messages: [],
      isStreaming: false,
      nudgeDismissed: false,
      sessionId: null,

      setPanelState: (s) => set({ panelState: s }),

      togglePanel: () =>
        set((state) => ({
          panelState: state.panelState === 'collapsed' ? 'sidebar' : 'collapsed',
        })),

      dismissNudge: () => set({ nudgeDismissed: true }),

      clearMessages: () => set({ messages: [] }),

      sendMessage: async (prompt: string) => {
        const { messages } = get();
        if (get().isStreaming) return;

        // Ensure we have a session ID
        let { sessionId } = get();
        if (!sessionId) {
          try {
            const res = await fetch('/api/agent/session', { method: 'POST' });
            if (res.ok) {
              const json = await res.json();
              sessionId = json.sessionId as string;
              set({ sessionId });
            }
          } catch { /* non-blocking */ }
        }

        // Add user message
        const userMsg: UIMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          parts: [{ type: 'text', text: prompt }],
        };

        // Stub assistant message that we'll fill in
        const assistantId = crypto.randomUUID();
        const assistantMsg: UIMessage = {
          id: assistantId,
          role: 'assistant',
          parts: [],
        };

        set({ messages: [...messages, userMsg, assistantMsg], isStreaming: true });

        // Build history for the API (text messages only, no tool parts)
        const history = get()
          .messages.slice(0, -1) // exclude the stub we just added
          .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.parts.some((p) => p.type === 'text')))
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.parts
              .filter((p): p is TextPart => p.type === 'text')
              .map((p) => p.text)
              .join(''),
          }));

        try {
          const res = await fetch('/api/agent/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, history }),
          });

          if (!res.ok || !res.body) throw new Error('Stream failed');

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const updateAssistant = (updater: (msg: UIMessage) => UIMessage) => {
            set((state) => ({
              messages: state.messages.map((m) => (m.id === assistantId ? updater(m) : m)),
            }));
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const data = line.startsWith('data: ') ? line.slice(6) : line;
              if (!data.trim()) continue;

              let event: StreamEvent;
              try {
                event = JSON.parse(data);
              } catch {
                continue;
              }

              if (event.type === 'text_delta') {
                updateAssistant((msg) => {
                  const parts = [...msg.parts];
                  const last = parts[parts.length - 1];
                  if (last?.type === 'text') {
                    return { ...msg, parts: [...parts.slice(0, -1), { type: 'text', text: last.text + event.delta }] };
                  }
                  return { ...msg, parts: [...parts, { type: 'text', text: event.delta }] };
                });
              }

              if (event.type === 'tool_use_start') {
                updateAssistant((msg) => ({
                  ...msg,
                  parts: [
                    ...msg.parts,
                    {
                      type: 'tool_use',
                      toolUseId: event.toolUseId,
                      name: event.name,
                      displayInput: event.displayInput,
                      status: 'pending',
                    } satisfies ToolUsePart,
                  ],
                }));
              }

              if (event.type === 'tool_result') {
                updateAssistant((msg) => ({
                  ...msg,
                  parts: msg.parts.map((p) =>
                    p.type === 'tool_use' && p.toolUseId === event.toolUseId
                      ? { ...p, status: event.status, summary: event.summary, payload: event.payload }
                      : p,
                  ),
                }));
              }

              if (event.type === 'error') {
                updateAssistant((msg) => ({
                  ...msg,
                  parts: [...msg.parts, { type: 'text', text: `Error: ${event.message}` }],
                }));
              }
            }
          }
        } catch (err) {
          updateAssistantPart(set, assistantId, [{ type: 'text', text: `Error: ${String(err)}` }]);
        } finally {
          set({ isStreaming: false });
          // Persist messages to DB (best-effort)
          const { sessionId: sid } = get();
          if (sid) {
            const finalMessages = get().messages;
            const assistantMsg = finalMessages.find((m) => m.id === assistantId);
            const assistantText = assistantMsg?.parts
              .filter((p): p is TextPart => p.type === 'text')
              .map((p) => p.text)
              .join('') ?? '';
            fetch('/api/agent/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: sid, userText: prompt, assistantText }),
            }).catch(() => {});
          }
        }
      },
    }),
    {
      name: 'agent-store',
      partialize: (state) => ({
        panelState: state.panelState,
        nudgeDismissed: state.nudgeDismissed,
        sessionId: state.sessionId,
      }),
    },
  ),
);

function updateAssistantPart(
  set: (fn: (s: AgentState) => Partial<AgentState>) => void,
  id: string,
  parts: MessagePart[],
) {
  set((state) => ({
    messages: state.messages.map((m) => (m.id === id ? { ...m, parts } : m)),
  }));
}
