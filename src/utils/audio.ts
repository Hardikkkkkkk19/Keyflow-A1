import { SoundPreset, KeyboardStyle } from "../types";

class KeyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6; // Default 60%

  constructor() {
    if (typeof window !== "undefined") {
      const savedVol = localStorage.getItem("keyflow_audio_volume");
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) {
          this.volume = Math.max(0, Math.min(1, parsed));
        }
      }
      const savedMute = localStorage.getItem("keyflow_audio_muted");
      if (savedMute !== null) {
        this.isMuted = savedMute === "true";
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMuted(): boolean {
    return this.isMuted || this.volume === 0;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol / 100));
    this.isMuted = this.volume === 0;
    if (typeof window !== "undefined") {
      localStorage.setItem("keyflow_audio_volume", this.volume.toString());
      localStorage.setItem("keyflow_audio_muted", this.isMuted.toString());
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("keyflow_audio_muted", this.isMuted.toString());
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("keyflow_audio_muted", this.isMuted.toString());
    }
  }

  /**
   * Main keypress audio trigger.
   * Resolves the active style or preset and triggers the corresponding synthesis engine.
   */
  public playKeySound(
    presetOrStyle?: SoundPreset | KeyboardStyle | string,
    keyType: "normal" | "space" | "enter" | "backspace" | "error" = "normal",
    styleOverride?: KeyboardStyle,
  ) {
    if (this.isMuted || this.volume === 0 || presetOrStyle === "silent") return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      if (keyType === "error") {
        this.playErrorSound(now, masterGain);
        return;
      }

      // Determine active keyboard sound style
      let activeStyle: KeyboardStyle = "classic";

      if (styleOverride) {
        activeStyle = styleOverride;
      } else if (
        presetOrStyle === "classic" ||
        presetOrStyle === "cyber" ||
        presetOrStyle === "aurora" ||
        presetOrStyle === "mechanical"
      ) {
        activeStyle = presetOrStyle as KeyboardStyle;
      } else if (presetOrStyle === "tactile" || presetOrStyle === "creamy") {
        activeStyle = presetOrStyle === "creamy" ? "aurora" : "mechanical";
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("keyflow_keyboard_style") as KeyboardStyle;
        if (stored && ["classic", "cyber", "aurora", "mechanical"].includes(stored)) {
          activeStyle = stored;
        }
      }

      // Route to dedicated synthesizer for the active style
      switch (activeStyle) {
        case "cyber":
          this.playCyberSound(now, masterGain, keyType);
          break;
        case "aurora":
          this.playAuroraSound(now, masterGain, keyType);
          break;
        case "mechanical":
          this.playProMechanicalSound(now, masterGain, keyType);
          break;
        case "classic":
        default:
          this.playClassicSound(now, masterGain, keyType);
          break;
      }
    } catch {
      // Ignore web audio exceptions on suspended/blocked contexts
    }
  }

  /**
   * 1. CLASSIC — Clean Mechanical
   * Short crisp key press, soft mechanical click, balanced volume.
   */
  private playClassicSound(
    now: number,
    masterGain: GainNode,
    keyType: "normal" | "space" | "enter" | "backspace",
  ) {
    if (!this.ctx) return;

    const dur = keyType === "space" ? 0.045 : 0.035;

    // Filtered noise buffer for click actuation
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    let centerFreq = 2100 + (Math.random() * 200 - 100);
    if (keyType === "space") centerFreq = 1100;
    if (keyType === "enter") centerFreq = 1500;
    if (keyType === "backspace") centerFreq = 1800;

    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(2.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // High click transient
    const transient = this.ctx.createOscillator();
    const transientGain = this.ctx.createGain();
    transient.type = "sine";
    const startFreq = keyType === "space" ? 1800 : 2800;
    transient.frequency.setValueAtTime(startFreq, now);
    transient.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    transientGain.gain.setValueAtTime(0.2, now);
    transientGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    // Soft bottom-out thud
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = "sine";
    const thudFreq = keyType === "space" ? 110 : 160;
    thud.frequency.setValueAtTime(thudFreq, now);
    thud.frequency.exponentialRampToValueAtTime(50, now + dur);

    thudGain.gain.setValueAtTime(0.18, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Connections
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    transient.connect(transientGain);
    transientGain.connect(masterGain);

    thud.connect(thudGain);
    thudGain.connect(masterGain);

    noise.start(now);
    transient.start(now);
    thud.start(now);

    noise.stop(now + dur);
    transient.stop(now + 0.012);
    thud.stop(now + dur);
  }

  /**
   * 2. CYBER NEON — Futuristic Electronic
   * Short digital/electronic click with synthetic tone (futuristic HUD click).
   */
  private playCyberSound(
    now: number,
    masterGain: GainNode,
    keyType: "normal" | "space" | "enter" | "backspace",
  ) {
    if (!this.ctx) return;

    const dur = keyType === "space" ? 0.03 : 0.022;

    // Dual synth oscillators for electronic click timbre
    const oscSaw = this.ctx.createOscillator();
    const oscSquare = this.ctx.createOscillator();
    const synthGain = this.ctx.createGain();

    oscSaw.type = "sawtooth";
    oscSquare.type = "square";

    const baseFreq = keyType === "space" ? 1400 : 2400 + (Math.random() * 150 - 75);
    oscSaw.frequency.setValueAtTime(baseFreq, now);
    oscSaw.frequency.exponentialRampToValueAtTime(400, now + dur);

    oscSquare.frequency.setValueAtTime(baseFreq * 0.7, now);
    oscSquare.frequency.exponentialRampToValueAtTime(250, now + dur);

    synthGain.gain.setValueAtTime(0.25, now);
    synthGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // High Q Resonant Biquad Filter for HUD console sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(6.0, now);

    // Digital Chirp Transient
    const chirp = this.ctx.createOscillator();
    const chirpGain = this.ctx.createGain();
    chirp.type = "sine";
    chirp.frequency.setValueAtTime(4500, now);
    chirp.frequency.exponentialRampToValueAtTime(1200, now + 0.008);

    chirpGain.gain.setValueAtTime(0.2, now);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    oscSaw.connect(filter);
    oscSquare.connect(filter);
    filter.connect(synthGain);
    synthGain.connect(masterGain);

    chirp.connect(chirpGain);
    chirpGain.connect(masterGain);

    oscSaw.start(now);
    oscSquare.start(now);
    chirp.start(now);

    oscSaw.stop(now + dur);
    oscSquare.stop(now + dur);
    chirp.stop(now + 0.008);
  }

  /**
   * 3. AURORA GLASS — Soft Glass / Tap
   * Light airy tap, soft rounded glass transient, delicate & crystalline.
   */
  private playAuroraSound(
    now: number,
    masterGain: GainNode,
    keyType: "normal" | "space" | "enter" | "backspace",
  ) {
    if (!this.ctx) return;

    const dur = keyType === "space" ? 0.045 : 0.035;

    // Crystal glass tone harmonics
    const fundamental = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();

    fundamental.type = "sine";
    overtone.type = "sine";

    const baseFreq = keyType === "space" ? 1100 : 1550 + (Math.random() * 100 - 50);
    fundamental.frequency.setValueAtTime(baseFreq, now);
    fundamental.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + dur);

    overtone.frequency.setValueAtTime(baseFreq * 2, now);
    overtone.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + dur);

    toneGain.gain.setValueAtTime(0.22, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Airy finger landing transient
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = "highpass";
    hpFilter.frequency.setValueAtTime(4000, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    fundamental.connect(toneGain);
    overtone.connect(toneGain);
    toneGain.connect(masterGain);

    noise.connect(hpFilter);
    hpFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    fundamental.start(now);
    overtone.start(now);
    noise.start(now);

    fundamental.stop(now + dur);
    overtone.stop(now + dur);
    noise.stop(now + 0.015);
  }

  /**
   * 4. PRO MECHANICAL — Deep Mechanical ("Thock")
   * Deep low-mid click/thock character, heavy switch actuation, physical depth.
   */
  private playProMechanicalSound(
    now: number,
    masterGain: GainNode,
    keyType: "normal" | "space" | "enter" | "backspace",
  ) {
    if (!this.ctx) return;

    const dur = keyType === "space" ? 0.06 : 0.045;

    // Deep "Thock" resonant sweep
    const thockOsc = this.ctx.createOscillator();
    const thockGain = this.ctx.createGain();

    thockOsc.type = "triangle";
    const startFreq = keyType === "space" ? 220 : 340 + (Math.random() * 40 - 20);
    const endFreq = keyType === "space" ? 40 : 60;

    thockOsc.frequency.setValueAtTime(startFreq, now);
    thockOsc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    thockGain.gain.setValueAtTime(0.38, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Tactile switch stem bump noise
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = "lowpass";
    lpFilter.frequency.setValueAtTime(1100, now);
    lpFilter.Q.setValueAtTime(1.6, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Sub-housing acoustic thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + dur);

    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    thockOsc.connect(thockGain);
    thockGain.connect(masterGain);

    noise.connect(lpFilter);
    lpFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    subOsc.connect(subGain);
    subGain.connect(masterGain);

    thockOsc.start(now);
    noise.start(now);
    subOsc.start(now);

    thockOsc.stop(now + dur);
    noise.stop(now + dur);
    subOsc.stop(now + dur);
  }

  /**
   * Low pitch error warning
   */
  private playErrorSound(now: number, masterGain: GainNode) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const audioEngine = new KeyAudioEngine();
