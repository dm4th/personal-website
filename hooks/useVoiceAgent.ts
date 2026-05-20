'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type VoiceAgentPhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

const SYSTEM_PROMPT = `You are a voice assistant embedded in Dan Mathieson's personal website. Visitors ask you about Dan's professional background, work history, and fit for roles.

Content map (use this to pick the right category when searching):
- Work history, roles, deals, metrics, team leadership → category='career'
- Claude Code, this personal website, AI tooling Dan built → category='projects'
- AI/ML concepts, models, frameworks Dan knows → category='ai-ml'
- Personal background, values, interests → category='about-me'

Rules:
- Speak naturally and conversationally — no markdown, no bullet lists, no headers.
- Keep responses to 2-3 sentences max unless asked to elaborate.
- Always use search_dans_background before answering factual questions. Pick the category from the content map.
- If a grep search returns "No matches" with a list of available files, immediately follow up with a read of the most relevant file.
- Emphasize Dan's professional impact, leadership, and measurable outcomes. Mention side projects only when directly relevant.
- First word must be content — never start with "Sure", "Great", "Of course", or "Let me".
- Numbers naturally: "around 75 out of 100" not "75/100".
- Never read URLs or file paths aloud.
- If asked to analyze a job, ask the visitor to share the job URL or paste the description.`;

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    name: 'search_dans_background',
    description: "Search Dan Mathieson's career, project, and background files for factual information. Use action='grep' with a keyword to find relevant content, action='list' to browse available files, or action='read' to read a specific file.",
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'read', 'grep'],
          description: 'list: show available files; read: read a specific file; grep: search for a keyword',
        },
        pattern: { type: 'string', description: 'Search keyword (required for grep)' },
        path: { type: 'string', description: 'File path (required for read)' },
        category: {
          type: 'string',
          description: 'Optional category: about-me, career, ai-ml, projects',
        },
      },
      required: ['action'],
    },
  },
  {
    type: 'function',
    name: 'analyze_job_fit',
    description: 'Analyze how well Dan fits a specific job. Provide either a job URL or a pasted job description.',
    parameters: {
      type: 'object',
      properties: {
        jobUrl: { type: 'string', description: 'URL of the job posting' },
        jobDescription: { type: 'string', description: 'Full text of the job description' },
      },
    },
  },
  {
    type: 'function',
    name: 'submit_job_lead',
    description: "Log a job opportunity into Dan's tracker. Use when a visitor mentions a role they think Dan should know about.",
    parameters: {
      type: 'object',
      properties: {
        opportunityTitle: { type: 'string', description: 'Job title' },
        company: { type: 'string', description: 'Company name' },
        jobUrl: { type: 'string', description: 'Job posting URL (optional)' },
        contactName: { type: 'string', description: "Visitor's name (optional)" },
        contactInfo: { type: 'string', description: "Visitor's contact info (optional)" },
        notes: { type: 'string', description: 'Any additional context' },
      },
      required: ['opportunityTitle', 'company'],
    },
  },
];

const TOOL_ROUTE: Record<string, string> = {
  search_dans_background: '/api/agent/voice-tools/search',
  analyze_job_fit: '/api/agent/voice-tools/fit',
  submit_job_lead: '/api/agent/voice-tools/lead',
};

export function useVoiceAgent() {
  const [phase, setPhase] = useState<VoiceAgentPhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef(0);
  const activeRef = useRef(true);
  const sessionReadyRef = useRef(false);
  const phaseRef = useRef<VoiceAgentPhase>('idle');
  // Store in-flight tool fetch Promises — reply.done awaits them so results arrive before we transition
  const pendingToolPromisesRef = useRef<Array<Promise<{ call_id: string; result: string }>>>([]);

  useEffect(() => () => { activeRef.current = false; }, []);

  const teardown = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
      }
      wsRef.current.close(1000, 'user_disconnect');
      wsRef.current = null;
    }

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    sessionReadyRef.current = false;
    phaseRef.current = 'idle';
    pendingToolPromisesRef.current = [];

    if (activeRef.current) {
      setPhase('idle');
      setTranscript('');
      setActiveTool(null);
      setLastSearch(null);
    }
  }, []);

  const playPcm16Chunk = useCallback((b64: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const samples = bytes.length / 2;
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(samples);
    for (let i = 0; i < samples; i++) float32[i] = int16[i] / 32768;

    const buffer = ctx.createBuffer(1, samples, 24000);
    buffer.copyToChannel(float32, 0);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    src.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
  }, []);

  // Start the tool fetch and enqueue the Promise — reply.done awaits all promises before sending
  const handleToolCall = useCallback((callId: string, name: string, args: Record<string, unknown>) => {
    if (name === 'search_dans_background' && args.pattern) {
      setLastSearch(String(args.pattern));
    }

    const route = TOOL_ROUTE[name];

    const promise: Promise<{ call_id: string; result: string }> = (async () => {
      let result: string;
      if (!route) {
        result = JSON.stringify(`Unknown tool: ${name}`);
      } else {
        try {
          const res = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
          });
          const data = await res.json();
          result = JSON.stringify(String(data.result ?? data.error ?? 'Done.'));
        } catch (err) {
          result = JSON.stringify(`Tool error: ${String(err)}`);
        }
      }
      return { call_id: callId, result };
    })();

    pendingToolPromisesRef.current.push(promise);
  }, []);

  const connect = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'error') return;
    setError(null);
    setPhase('connecting');
    phaseRef.current = 'connecting';

    try {
      const tokenRes = await fetch('/api/agent/voice-agent-token');
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not get voice agent token');
      }
      const { token } = await tokenRes.json();

      // echoCancellation on, noiseSuppression off — AAI runs server-side noise cancel; stacking both adds artifacts
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false },
        video: false,
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = ctx;
      // Browsers suspend AudioContext by default — async chain breaks the gesture scope
      await ctx.resume();
      await ctx.audioWorklet.addModule('/voice-agent-processor.js');

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const worklet = new AudioWorkletNode(ctx, 'voice-agent-processor');
      workletNodeRef.current = worklet;

      // Auth goes in the URL — browser WS cannot set Authorization headers
      const ws = new WebSocket(`wss://agents.assemblyai.com/v1/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[VoiceAgent] WS opened — sending session.update');
        // Send session config immediately on open
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            system_prompt: SYSTEM_PROMPT,
            output: { voice: 'james' },
            input: {
              turn_detection: {
                vad_threshold: 0.5,
                min_silence: 1200,
                max_silence: 4000,
                interrupt_response: true,
              },
            },
            tools: TOOL_DEFINITIONS,
          },
        }));

        // Wire worklet → WS, but only send audio after session.ready
        worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (ws.readyState !== WebSocket.OPEN || !sessionReadyRef.current) return;
          const bytes = new Uint8Array(e.data);
          let b64 = '';
          for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
          ws.send(JSON.stringify({ type: 'input.audio', audio: btoa(b64) }));
        };
        source.connect(worklet);
      };

      ws.onmessage = (e) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(e.data as string);
        } catch {
          console.log('[VoiceAgent] non-JSON message:', e.data);
          return;
        }

        const type = msg.type as string;
        // Log everything except audio chunks (too noisy)
        if (type !== 'reply.audio') {
          console.log('[VoiceAgent] ←', type, JSON.stringify(msg).slice(0, 200));
        }

        if (type === 'session.ready') {
          sessionReadyRef.current = true;
          if (activeRef.current) { phaseRef.current = 'listening'; setPhase('listening'); }
        }

        // transcript.user.delta = partial, transcript.user = final
        if (type === 'transcript.user.delta' || type === 'transcript.user') {
          setTranscript(String(msg.transcript ?? ''));
        }

        if (type === 'reply.started') {
          if (activeRef.current) { phaseRef.current = 'thinking'; setPhase('thinking'); }
        }

        if (type === 'reply.audio') {
          if (activeRef.current) { phaseRef.current = 'speaking'; setPhase('speaking'); }
          if (msg.data) playPcm16Chunk(msg.data as string);
        }

        if (type === 'reply.done') {
          const status = (msg as { status?: string }).status;
          const promises = pendingToolPromisesRef.current.splice(0);

          if (status === 'interrupted') {
            // Flush audio queue and discard any in-flight tool fetches
            if (audioCtxRef.current) nextPlayTimeRef.current = audioCtxRef.current.currentTime;
            if (activeRef.current) { phaseRef.current = 'listening'; setPhase('listening'); setActiveTool(null); }
            setTranscript('');
          } else if (promises.length > 0) {
            // Stay in 'thinking' while fetches complete, then send results and transition
            Promise.all(promises).then((results) => {
              for (const tr of results) {
                wsRef.current?.send(JSON.stringify({ type: 'tool.result', call_id: tr.call_id, result: tr.result }));
              }
              if (activeRef.current) { phaseRef.current = 'listening'; setPhase('listening'); setActiveTool(null); }
              setTranscript('');
            });
          } else {
            // No tool calls — clean transition to listening
            if (activeRef.current) { phaseRef.current = 'listening'; setPhase('listening'); setActiveTool(null); }
            setTranscript('');
          }
        }

        if (type === 'tool.call') {
          if (activeRef.current) { phaseRef.current = 'thinking'; setPhase('thinking'); }
          const toolName = msg.name as string;
          setActiveTool(toolName);
          // arguments arrives as a parsed object, not a string
          handleToolCall(
            msg.call_id as string,
            toolName,
            (msg.arguments ?? {}) as Record<string, unknown>,
          );
        }

        if (type === 'session.error') {
          if (activeRef.current) {
            setError(String(msg.message ?? msg.error ?? 'Voice agent error'));
            phaseRef.current = 'error';
            setPhase('error');
          }
        }
      };

      ws.onerror = (e) => {
        console.log('[VoiceAgent] WS error', e);
        if (activeRef.current) {
          setError('Voice connection failed');
          phaseRef.current = 'error';
          setPhase('error');
        }
      };

      ws.onclose = (e) => {
        console.log('[VoiceAgent] WS closed — code:', e.code, 'reason:', e.reason, 'wasClean:', e.wasClean);

        // Null the ref immediately so teardown() skips the Terminate send
        wsRef.current = null;

        // Always clean up audio/mic regardless of close reason
        sourceNodeRef.current?.disconnect(); sourceNodeRef.current = null;
        workletNodeRef.current?.disconnect(); workletNodeRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null;
        audioCtxRef.current?.close().catch(() => {}); audioCtxRef.current = null;
        nextPlayTimeRef.current = 0;
        sessionReadyRef.current = false;
        pendingToolPromisesRef.current = [];
        const priorPhase = phaseRef.current;
        phaseRef.current = 'idle';

        if (activeRef.current) {
          // If session.error already fired, preserve that error — don't let a clean close wipe it
          if (priorPhase === 'error') {
            // keep existing error state
          } else if (e.wasClean && e.code === 1000) {
            // wasClean + code 1000 = we called disconnect() ourselves — silent idle
            setPhase('idle');
            setTranscript('');
          } else {
            // Any abnormal close: show the reason so we can debug
            const msg = e.reason || `Connection closed (code ${e.code})`;
            setError(msg);
            phaseRef.current = 'error';
            setPhase('error');
          }
        }
      };
    } catch (err) {
      if (activeRef.current) {
        setError(String(err));
        setPhase('error');
      }
      teardown();
    }
  }, [phase, playPcm16Chunk, handleToolCall, teardown]);

  const disconnect = useCallback(() => {
    teardown();
  }, [teardown]);

  useEffect(() => {
    return () => {
      teardown();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { phase, transcript, error, activeTool, lastSearch, connect, disconnect };
}
