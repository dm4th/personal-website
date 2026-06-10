import { create } from 'zustand';
import type { StreamEvent } from '@/lib/agent/streamProtocol';
import { DISCOVERY_PERSONAS, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';

export type DiscoveryMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type TranscriptEntry = {
  question: string;
  answer: string;
};

type DiscoveryState = {
  persona: DiscoveryPersona | null;
  messages: DiscoveryMessage[];
  transcript: TranscriptEntry[];
  questionIndex: number;
  isStreaming: boolean;
  completed: boolean;
  visitorLabel: string;
  submitted: boolean;
  setVisitorLabel: (label: string) => void;
  submitResponse: () => Promise<void>;
  selectPersona: (persona: DiscoveryPersona) => Promise<void>;
  send: (text: string) => Promise<void>;
};

async function streamTurn(
  persona: DiscoveryPersona,
  history: { role: 'user' | 'assistant'; content: string }[],
  onDelta: (delta: string) => void,
): Promise<void> {
  const res = await fetch('/api/fintechco/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona, history }),
  });

  if (!res.ok || !res.body) throw new Error('Discovery stream failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

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

      if (event.type === 'text_delta') onDelta(event.delta);
    }
  }
}

function toHistory(messages: DiscoveryMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  return messages.map((m) => ({ role: m.role, content: m.text }));
}

export const useFintechcoDiscoveryStore = create<DiscoveryState>()((set, get) => ({
  persona: null,
  messages: [],
  transcript: [],
  questionIndex: 0,
  isStreaming: false,
  completed: false,
  visitorLabel: '',
  submitted: false,

  setVisitorLabel: (label) => set({ visitorLabel: label }),

  submitResponse: async () => {
    const { persona, transcript, messages, visitorLabel, submitted } = get();
    if (!persona || submitted) return;

    set({ submitted: true });
    try {
      const res = await fetch('/api/fintechco/discovery/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, visitorLabel: visitorLabel || undefined, transcript, messages }),
      });
      if (!res.ok) set({ submitted: false });
    } catch {
      set({ submitted: false });
    }
  },

  selectPersona: async (persona) => {
    set({
      persona,
      messages: [],
      transcript: [],
      questionIndex: 0,
      completed: false,
      submitted: false,
      isStreaming: true,
    });

    const assistantId = crypto.randomUUID();
    set({ messages: [{ id: assistantId, role: 'assistant', text: '' }] });

    try {
      await streamTurn(persona, [], (delta) => {
        set((state) => ({
          messages: state.messages.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)),
        }));
      });
    } finally {
      set({ isStreaming: false });
    }
  },

  send: async (text) => {
    const { persona, messages, transcript, questionIndex } = get();
    if (!persona) throw new Error('No persona selected');
    if (get().isStreaming) throw new Error('Already streaming');
    if (get().completed) throw new Error('Conversation completed');
    if (questionIndex >= DISCOVERY_PERSONAS[persona].questions.length) throw new Error('No more questions');

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const updatedMessages: DiscoveryMessage[] = [
      ...messages,
      { id: userId, role: 'user', text },
      { id: assistantId, role: 'assistant', text: '' },
    ];
    set({ messages: updatedMessages, isStreaming: true });

    await streamTurn(persona, toHistory(updatedMessages), (delta) => {
      set((state) => ({
        messages: state.messages.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)),
      }));
    });

    const newIndex = questionIndex + 1;
    set({
      isStreaming: false,
      transcript: [...transcript, { question: DISCOVERY_PERSONAS[persona].questions[questionIndex], answer: text }],
      questionIndex: newIndex,
      completed: newIndex >= DISCOVERY_PERSONAS[persona].questions.length,
    });
  },
}));
