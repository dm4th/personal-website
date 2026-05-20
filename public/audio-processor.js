/**
 * AudioWorklet processor — runs on a dedicated audio thread.
 * No ES module imports allowed here; this file is loaded standalone.
 *
 * Converts Float32 mic samples to Int16 PCM and batches them into
 * ~100ms chunks (1600 samples at 16 kHz) before posting to the main thread.
 * AssemblyAI requires 50–1000ms per chunk (code 3007 if violated).
 *
 * process() is called every 128 samples (~8ms at 16kHz) — we must buffer.
 */
class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
    // 1600 samples = 100ms at 16 kHz — safely within the 50–1000ms window
    this._TARGET = 1600;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true; // no input this frame — stay alive

    for (let i = 0; i < channel.length; i++) {
      // Float32 [-1,1] → Int16 [-32768,32767], clamped to avoid overflow
      const s = Math.max(-32768, Math.min(32767, Math.round(channel[i] * 32767)));
      this._buf.push(s);
    }

    if (this._buf.length >= this._TARGET) {
      const pcm = new Int16Array(this._buf);
      // Zero-copy transfer — moves the buffer to main thread without cloning
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
      this._buf = [];
    }

    return true; // returning false would destroy the processor
  }
}

registerProcessor('pcm-processor', PcmProcessor);
