class VoiceAgentProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
    this._TARGET = 1200; // 50ms at 24kHz
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      const s = Math.max(-32768, Math.min(32767, Math.round(channel[i] * 32767)));
      this._buf.push(s);
    }
    if (this._buf.length >= this._TARGET) {
      const pcm = new Int16Array(this._buf.splice(0, this._TARGET));
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}

registerProcessor('voice-agent-processor', VoiceAgentProcessor);
