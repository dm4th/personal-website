'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type VoiceInputMode = 'agent' | 'memo';

export function useVoiceInput({ onFinalTranscript }: { onFinalTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Stable ref so ws.onmessage never closes over a stale callback
  const onFinalRef = useRef(onFinalTranscript);
  useEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopListening = useCallback(() => {
    // Terminate session — AssemblyAI bills until explicit terminate or 3-hour cap
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
    }
    wsRef.current?.close();
    wsRef.current = null;

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;

    setIsListening(false);
    setPartialTranscript('');
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;
    setError(null);

    try {
      // 1. Mint a short-lived single-use token server-side
      const tokenRes = await fetch('/api/agent/voice-token');
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not get voice token');
      }
      const { token } = await tokenRes.json();

      // 2. Open mic stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // 3. AudioContext at 16kHz — browser resamples automatically, no manual downsampling needed
      const ctx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = ctx;

      await ctx.audioWorklet.addModule('/audio-processor.js');
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
      workletNodeRef.current = worklet;

      // 4. Connect to AssemblyAI via temp token — never expose API key client-side
      const ws = new WebSocket(
        `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro&token=${token}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setIsListening(true);
        // Wire: worklet PCM chunks → WS binary frames
        worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };
        source.connect(worklet);
        // Don't connect worklet to destination — we don't want mic playback
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string);
        if (msg.type !== 'Turn') return;
        setPartialTranscript(msg.transcript);
        if (msg.end_of_turn && msg.transcript.trim()) {
          const final = msg.transcript;
          stopListening();
          onFinalRef.current(final);
        }
      };

      ws.onerror = () => {
        setError('Voice connection failed');
        stopListening();
      };

      ws.onclose = (e) => {
        if (e.code === 3007) setError('Audio chunks too small — check AudioWorklet buffer size');
        if (e.code === 1008) setError('AssemblyAI auth failed — check API key');
        setIsListening(false);
      };
    } catch (err) {
      setError(String(err));
      stopListening();
    }
  }, [isListening, stopListening]);

  return { isListening, partialTranscript, error, startListening, stopListening };
}
