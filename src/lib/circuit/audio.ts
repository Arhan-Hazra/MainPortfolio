// Circuit Sound Synthesizer via Web Audio API
// Ambient rhythmic system beeps, transformer hum, Tesla coil arc sizzle, short-circuit boom & zzzz, and mechanical clicks.

class CircuitAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientHumOsc: OscillatorNode | null = null;
  private beepTimer: NodeJS.Timeout | null = null;

  // Tesla coil sizzle nodes
  private teslaOsc: OscillatorNode | null = null;
  private teslaGain: GainNode | null = null;
  private teslaFilter: BiquadFilterNode | null = null;
  private teslaNoiseSource: AudioBufferSourceNode | null = null;
  private teslaNoiseGain: GainNode | null = null;
  private isTeslaActive: boolean = false;

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.025, this.ctx?.currentTime || 0);
    }
    if (this.isMuted && this.isTeslaActive) {
      this.stopTeslaCoilSizzle();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // 1. Subtle, rhythmic clean system ticks (NO heavy idle machine hum)
  public startAmbientSystemLoop() {
    if (this.ambientHumOsc) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Periodic subtle clean high-tech micro-beeps (no heavy idle machine hum)
      const scheduleBeeps = () => {
        if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
          this.playRhythmicBeep();
        }
        this.beepTimer = setTimeout(scheduleBeeps, 4500 + Math.random() * 2500);
      };
      this.beepTimer = setTimeout(scheduleBeeps, 2000);
    } catch {
      // Ignore
    }
  }

  public stopAmbientSystemLoop() {
    if (this.ambientHumOsc) {
      try {
        this.ambientHumOsc.stop();
        this.ambientHumOsc = null;
      } catch {
        // Ignore
      }
    }
    if (this.beepTimer) {
      clearTimeout(this.beepTimer);
      this.beepTimer = null;
    }
  }

  private playRhythmicBeep() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = Math.random() > 0.5 ? 1760 : 880;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.018, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 2. High-Voltage Tesla Coil Arc Sizzle Sound Effect
  public startTeslaCoilSizzle(intensity: number = 0.5) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!this.isTeslaActive) {
      this.isTeslaActive = true;
      const t = ctx.currentTime;

      // Modulated sawtooth for electrical plasma discharge
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);

      // Harsh bandpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.Q.setValueAtTime(6.0, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.24 * intensity, t + 0.04);

      // White noise crackle buffer
      const bufferLen = Math.floor(ctx.sampleRate * 0.15);
      const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferLen; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.7;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2800, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16 * intensity, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.start(t);
      noiseSource.start(t);

      this.teslaOsc = osc;
      this.teslaGain = gain;
      this.teslaFilter = filter;
      this.teslaNoiseSource = noiseSource;
      this.teslaNoiseGain = noiseGain;
    } else if (this.teslaGain && this.teslaFilter) {
      const t = ctx.currentTime;
      const targetFreq = 2600 + Math.random() * 1800;
      this.teslaFilter.frequency.setValueAtTime(targetFreq, t);
      this.teslaGain.gain.setValueAtTime(0.35 * Math.min(1.4, intensity), t);
      if (this.teslaNoiseGain) {
        this.teslaNoiseGain.gain.setValueAtTime(0.24 * Math.min(1.4, intensity), t);
      }
    }
  }

  public stopTeslaCoilSizzle() {
    if (!this.isTeslaActive) return;
    this.isTeslaActive = false;
    const ctx = this.ctx;
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      if (this.teslaGain) {
        this.teslaGain.gain.linearRampToValueAtTime(0.0001, t + 0.04);
        this.teslaGain = null;
      }
      if (this.teslaNoiseGain) {
        this.teslaNoiseGain.gain.linearRampToValueAtTime(0.0001, t + 0.04);
        this.teslaNoiseGain = null;
      }
      if (this.teslaOsc) {
        this.teslaOsc.stop(t + 0.05);
        this.teslaOsc = null;
      }
      if (this.teslaNoiseSource) {
        this.teslaNoiseSource.stop(t + 0.05);
        this.teslaNoiseSource = null;
      }
    } catch {
      // Ignore
    }
  }

  // Aliases for compatibility
  public startSparkBuzz(intensity: number = 0.5) {
    this.startTeslaCoilSizzle(intensity);
  }

  public stopSparkBuzz() {
    this.stopTeslaCoilSizzle();
  }

  // 3. Short Circuit Explosion (Loud 'boom' + violent 'zzzz')
  public playShortCircuitExplosion() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopTeslaCoilSizzle();

    const t = ctx.currentTime;

    // Sub-bass heavy thud (dropping pitch 170Hz -> 18Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(170, t);
    subOsc.frequency.exponentialRampToValueAtTime(18, t + 0.9);

    subGain.gain.setValueAtTime(0.95, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 1.0);

    // Blast wave noise
    const bufferLen = Math.floor(ctx.sampleRate * 0.75);
    const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferLen * 0.22));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const blastFilter = ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(5000, t);
    blastFilter.frequency.exponentialRampToValueAtTime(180, t + 0.7);

    const blastGain = ctx.createGain();
    blastGain.gain.setValueAtTime(0.88, t);
    blastGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    noiseSource.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(ctx.destination);
    noiseSource.start(t);
    noiseSource.stop(t + 0.8);

    // Electrical 'zzzz' arc sizzle
    const zzzzOsc = ctx.createOscillator();
    const zzzzGain = ctx.createGain();
    const zzzzFilter = ctx.createBiquadFilter();

    zzzzOsc.type = 'sawtooth';
    zzzzOsc.frequency.setValueAtTime(150, t);

    zzzzFilter.type = 'bandpass';
    zzzzFilter.frequency.setValueAtTime(3200, t);
    zzzzFilter.Q.setValueAtTime(5.5, t);

    zzzzGain.gain.setValueAtTime(0.45, t);
    zzzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    zzzzOsc.connect(zzzzFilter);
    zzzzFilter.connect(zzzzGain);
    zzzzGain.connect(ctx.destination);
    zzzzOsc.start(t);
    zzzzOsc.stop(t + 0.6);
  }

  public playOverloadBoom() {
    this.playShortCircuitExplosion();
  }

  // 4. Socket Snap / Mechanical Relay Click
  public playSnapSound(isDisconnect: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isDisconnect ? 'sawtooth' : 'triangle';
    const startFreq = isDisconnect ? 3200 : 900;
    const endFreq = isDisconnect ? 600 : 2800;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.035);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  // 5. Sequential Freefall Snap Clicks (during gravity reassembly)
  public playSequentialAssemblyClicks(count: number = 12) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const baseTime = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const delay = i * 0.09;
      this.playRelayClick(baseTime + delay);
    }
  }

  // 6. Initial Boot Hum Sound
  public playBootSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    this.playRelayClick(t);
    this.playRelayClick(t + 0.1);

    const swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.type = 'sine';
    swell.frequency.setValueAtTime(220, t + 0.12);
    swell.frequency.exponentialRampToValueAtTime(880, t + 0.5);

    swellGain.gain.setValueAtTime(0.001, t + 0.12);
    swellGain.gain.linearRampToValueAtTime(0.2, t + 0.4);
    swellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    swell.connect(swellGain);
    swellGain.connect(ctx.destination);
    swell.start(t + 0.12);
    swell.stop(t + 0.65);

    setTimeout(() => {
      this.startAmbientSystemLoop();
    }, 600);
  }

  private playRelayClick(time: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4200, time);
    osc.frequency.exponentialRampToValueAtTime(450, time + 0.015);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.018);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.02);
  }
}

export const circuitAudio = new CircuitAudioController();
