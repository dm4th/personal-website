import { create } from 'zustand';
import type { StreamEvent } from '@/lib/agent/streamProtocol';
import { DISCOVERY_INTRO_MESSAGE, DISCOVERY_PERSONAS, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';

export type DiscoveryMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Subject marker the assistant message arrived with ('0', '1', ... or 'done'). */
  marker?: string;
  /** Client-only message (the static welcome): shown and persisted, but never sent to the model. */
  local?: boolean;
  /** Second bubble of a single model reply, split at the [BREAK] token. */
  continuation?: boolean;
};

export type TranscriptEntry = {
  question: string;
  answer: string;
};

type DiscoveryState = {
  persona: DiscoveryPersona | null;
  conversationId: string | null;
  messages: DiscoveryMessage[];
  transcript: TranscriptEntry[];
  currentSubject: number;
  isStreaming: boolean;
  completed: boolean;
  visitorLabel: string;
  submitted: boolean;
  setVisitorLabel: (label: string) => void;
  submitResponse: () => Promise<void>;
  selectPersona: (persona: DiscoveryPersona) => Promise<void>;
  send: (text: string) => Promise<void>;
  reset: () => void;
};

/**
 * Strips the leading [S:n] / [S:done] protocol marker from a streaming
 * assistant message. Deltas are buffered only until the marker is resolved
 * (closing bracket seen, or the text clearly is not a marker), then text
 * flows through untouched.
 */
function createMarkerParser(onText: (t: string) => void, onMarker: (m: string) => void) {
  let buf = '';
  let resolved = false;

  const resolve = (marker: string | null, rest: string) => {
    resolved = true;
    if (marker !== null) onMarker(marker);
    const text = marker !== null ? rest.replace(/^\s+/, '') : rest;
    if (text) onText(text);
  };

  return {
    push(delta: string) {
      if (resolved) {
        onText(delta);
        return;
      }
      buf += delta;
      const trimmed = buf.trimStart();
      const end = buf.indexOf(']');
      if (end !== -1) {
        const match = buf.slice(0, end + 1).match(/^\s*\[S:([a-z0-9]+)\]$/i);
        if (match) resolve(match[1].toLowerCase(), buf.slice(end + 1));
        else resolve(null, buf);
      } else if (buf.length > 16 || (trimmed.length > 0 && !trimmed.startsWith('['))) {
        // No closing bracket and either too long or clearly not a marker.
        resolve(null, buf);
      }
    },
    flush() {
      if (!resolved && buf) resolve(null, buf);
    },
  };
}

/**
 * Splits one streamed model reply into bubbles at each [BREAK] token, and
 * strips the leading [S:n] marker from every bubble (the model is told not to
 * repeat the marker after a break, but a fresh parser per bubble makes a
 * repeated marker harmless). The token may straddle 16-char deltas, so any
 * tail that could be a prefix of [BREAK] is held back until disambiguated.
 */
function createSegmentedStream(
  onText: (text: string, bubble: number) => void,
  onMarker: (marker: string) => void,
) {
  const TOKEN = '[BREAK]';
  let bubble = 0;
  let parser = createMarkerParser((t) => onText(t, 0), onMarker);
  let pending = '';

  const advance = () => {
    parser.flush();
    bubble++;
    const b = bubble;
    parser = createMarkerParser((t) => onText(t, b), () => {});
  };

  return {
    push(delta: string) {
      pending += delta;
      for (;;) {
        const idx = pending.indexOf(TOKEN);
        if (idx !== -1) {
          parser.push(pending.slice(0, idx));
          advance();
          pending = pending.slice(idx + TOKEN.length).replace(/^\s+/, '');
          continue;
        }
        // Hold back a tail that might be the start of a split [BREAK]
        let hold = 0;
        for (let k = Math.min(TOKEN.length - 1, pending.length); k > 0; k--) {
          if (pending.endsWith(TOKEN.slice(0, k))) {
            hold = k;
            break;
          }
        }
        const emit = pending.slice(0, pending.length - hold);
        if (emit) parser.push(emit);
        pending = pending.slice(pending.length - hold);
        return;
      }
    },
    flush() {
      if (pending) parser.push(pending);
      pending = '';
      parser.flush();
    },
  };
}

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

/**
 * Runs one assistant reply: streams into the placeholder message, opens a new
 * continuation bubble at each [BREAK], then tidies whitespace and drops any
 * empty continuation bubble once the stream ends.
 */
async function runAssistantTurn(
  persona: DiscoveryPersona,
  history: { role: 'user' | 'assistant'; content: string }[],
  firstAssistantId: string,
): Promise<void> {
  const bubbleIds = [firstAssistantId];
  const { setState } = useFintechcoDiscoveryStore;

  const segmented = createSegmentedStream(
    (text, bubble) => {
      if (bubble >= bubbleIds.length) {
        const id = crypto.randomUUID();
        bubbleIds.push(id);
        setState((state) => ({
          messages: [...state.messages, { id, role: 'assistant', text: '', continuation: true }],
        }));
      }
      const id = bubbleIds[bubble];
      setState((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, text: m.text + text } : m)),
      }));
    },
    (marker) => applyMarker(marker, firstAssistantId),
  );

  try {
    await streamTurn(persona, history, (delta) => segmented.push(delta));
  } finally {
    segmented.flush();
    setState((state) => ({
      messages: state.messages
        .map((m) => (bubbleIds.includes(m.id) ? { ...m, text: m.text.trim() } : m))
        .filter((m) => !(bubbleIds.includes(m.id) && m.continuation && !m.text)),
    }));
  }
}

// The model must see its own prior markers and [BREAK] tokens or it stops
// emitting them, so history re-prefixes each assistant message and rejoins
// split bubbles into the single reply the model originally produced.
// Client-only messages (the static welcome) never reach the model.
function toHistory(messages: DiscoveryMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  const out: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of messages) {
    if (m.local) continue;
    const prev = out[out.length - 1];
    if (m.role === 'assistant' && m.continuation && prev?.role === 'assistant') {
      prev.content += `\n[BREAK]\n${m.text}`;
      continue;
    }
    out.push({
      role: m.role,
      content: m.role === 'assistant' && m.marker ? `[S:${m.marker}] ${m.text}` : m.text,
    });
  }
  return out;
}

async function persistDraft() {
  // Runs after the marker is processed, so `completed` reflects [S:done]: a
  // visitor who finishes the conversation but never clicks Done still gets a
  // complete badge; Done's only remaining job is attaching the name.
  const { conversationId, persona, transcript, messages, completed } = useFintechcoDiscoveryStore.getState();
  if (!conversationId || !persona) return;
  try {
    await fetch('/api/fintechco/discovery/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, persona, transcript, messages, completed }),
    });
  } catch {
    // fire-and-forget: swallow errors silently
  }
}

export const useFintechcoDiscoveryStore = create<DiscoveryState>()((set, get) => ({
  persona: null,
  conversationId: null,
  messages: [],
  transcript: [],
  currentSubject: 0,
  isStreaming: false,
  completed: false,
  visitorLabel: '',
  submitted: false,

  setVisitorLabel: (label) => set({ visitorLabel: label }),

  submitResponse: async () => {
    const { conversationId, persona, transcript, messages, visitorLabel, submitted } = get();
    if (!persona || !conversationId || submitted) return;

    set({ submitted: true });
    try {
      const res = await fetch('/api/fintechco/discovery/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, persona, visitorLabel: visitorLabel || undefined, transcript, messages, completed: true }),
      });
      if (!res.ok) set({ submitted: false });
    } catch {
      set({ submitted: false });
    }
  },

  selectPersona: async (persona) => {
    set({
      persona,
      conversationId: crypto.randomUUID(),
      messages: [],
      transcript: [],
      currentSubject: 0,
      completed: false,
      submitted: false,
      visitorLabel: '',
      isStreaming: true,
    });

    // Two-message opener: a static welcome lands instantly, then the model's
    // first question streams in as a separate bubble.
    const assistantId = crypto.randomUUID();
    set({
      messages: [
        { id: crypto.randomUUID(), role: 'assistant', text: DISCOVERY_INTRO_MESSAGE, local: true },
        { id: assistantId, role: 'assistant', text: '' },
      ],
    });

    try {
      await runAssistantTurn(persona, [], assistantId);
    } finally {
      set({ isStreaming: false });
    }
  },

  send: async (text) => {
    const { persona, messages } = get();
    if (!persona) throw new Error('No persona selected');
    if (get().isStreaming) throw new Error('Already streaming');
    if (get().completed) throw new Error('Conversation completed');

    const subjects = DISCOVERY_PERSONAS[persona].questionSubjects;
    const subjectLabel = subjects[Math.min(get().currentSubject, subjects.length - 1)].subject;

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const updatedMessages: DiscoveryMessage[] = [
      ...messages,
      { id: userId, role: 'user', text },
      { id: assistantId, role: 'assistant', text: '' },
    ];
    set((state) => ({
      messages: updatedMessages,
      transcript: [...state.transcript, { question: subjectLabel, answer: text }],
      isStreaming: true,
    }));

    try {
      await runAssistantTurn(persona, toHistory(updatedMessages.slice(0, -1)), assistantId);
    } finally {
      set({ isStreaming: false });
    }

    // Fire-and-forget persist after every completed turn; captures partial responses
    // even if the visitor closes the tab before clicking Done.
    void persistDraft();
  },

  // Clears the conversation so a return visit starts fresh at the persona
  // chooser. Called after navigating back to the portal.
  reset: () =>
    set({
      persona: null,
      conversationId: null,
      messages: [],
      transcript: [],
      currentSubject: 0,
      isStreaming: false,
      completed: false,
      visitorLabel: '',
      submitted: false,
    }),
}));

function applyMarker(marker: string, assistantId: string) {
  useFintechcoDiscoveryStore.setState((state) => ({
    messages: state.messages.map((m) => (m.id === assistantId ? { ...m, marker } : m)),
    ...(marker === 'done'
      ? { completed: true }
      : Number.isInteger(Number(marker))
        ? { currentSubject: Number(marker) }
        : {}),
  }));
}
