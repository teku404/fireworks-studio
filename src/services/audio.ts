class FireworkAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.7;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.reverbNode = this.createReverb();
      this.reverbNode.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  toggleMute(): boolean {
    this.enabled = !this.enabled;
    this.setVolume(this.volume);
    return this.enabled;
  }

  private createReverb(): ConvolverNode {
    const rate = this.ctx!.sampleRate;
    const length = rate * 2.5;
    const decay = 2.0;
    const buffer = this.ctx!.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const factor = Math.exp(-i / (rate * (decay / 4)));
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    const convolver = this.ctx!.createConvolver();
    convolver.buffer = buffer;
    return convolver;
  }

  playLaunch(isRocket = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.18);
    gain.gain.setValueAtTime(0.6 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.23);
    if (isRocket) this.playRocketWhistle(t);
  }

  private playRocketWhistle(startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = startTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.8);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.value = 4.0;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.9);
  }

  playExplosion(caliber = 6, hasCrackles = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const power = Math.min(1.4, Math.max(0.4, caliber / 6));
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 * power, t);
    osc.frequency.exponentialRampToValueAtTime(24, t + 0.45 * power);
    oscGain.gain.setValueAtTime(0.8 * this.volume, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 * power);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.52 * power);
    const bufferSize = this.ctx.sampleRate * (1.2 * power);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000 * power, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.9 * power);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * this.volume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1 * power);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    if (this.reverbNode) {
      const reverbSend = this.ctx.createGain();
      reverbSend.gain.setValueAtTime(0.35 * power, t);
      filter.connect(reverbSend);
      reverbSend.connect(this.reverbNode);
    }
    whiteNoise.start(t);
    whiteNoise.stop(t + 1.2 * power);
    if (hasCrackles) {
      setTimeout(() => this.playCrackles(12 + Math.floor(Math.random() * 8)), 250);
    }
  }

  playCrackles(count = 12) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 0.7;
      setTimeout(() => {
        if (!this.ctx || !this.enabled || !this.masterGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 1400, t);
        gain.gain.setValueAtTime(0.18 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t);
        osc.stop(t + 0.05);
      }, delay * 1000);
    }
  }

  playSizzle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, t);
    gain.gain.setValueAtTime(0.08 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }
}

export const soundEngine = new FireworkAudioEngine();
