import type { AudioNoiseType, TickingSoundType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a soothing polyphonic zen completion chime using native Web Audio oscillators
 */
export function playCompletionChime(volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Harmonic frequencies: E5, G#5, B5, E6 (Major 9th / Zen bell aura)
    const frequencies = [659.25, 830.61, 987.77, 1318.51];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      // Soft envelope
      const startTime = now + index * 0.06;
      const duration = 2.2 - index * 0.2;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18 * volume, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  } catch (err) {
    console.warn('Web Audio chime could not play:', err);
  }
}

/**
 * Clock Ticking Generator Class
 * Synthesizes realistic mechanical clock escapements & pendulum acoustics
 */
export class ClockTickingGenerator {
  private ctx: AudioContext | null = null;
  private currentVolume: number = 0.4;
  private currentType: TickingSoundType = 'antique-pendulum';

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
  }

  public setType(type: TickingSoundType) {
    this.currentType = type;
  }

  /**
   * Play an authentic single tick or tock
   */
  public playTick(isEvenTick: boolean = true, customType?: TickingSoundType, customVolume?: number) {
    const type = customType ?? this.currentType ?? 'antique-pendulum';
    const rawVolume = typeof customVolume === 'number' && !isNaN(customVolume) ? customVolume : this.currentVolume;
    const volume = Math.max(0, Math.min(1, typeof rawVolume === 'number' && !isNaN(rawVolume) ? rawVolume : 0.45));

    if (type === 'none' || volume <= 0.01) return;

    try {
      this.ctx = getAudioContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      switch (type) {
        case 'antique-pendulum':
          this.playGrandfatherTick(isEvenTick, volume);
          break;
        case 'pocket-watch':
          this.playPocketWatchTick(isEvenTick, volume);
          break;
        case 'antique-wooden':
          this.playWoodenClockTick(isEvenTick, volume);
          break;
        case 'chronometer':
          this.playChronometerTick(isEvenTick, volume);
          break;
        case 'soft-tick':
          this.playSoftTick(volume);
          break;
        default:
          this.playGrandfatherTick(isEvenTick, volume);
          break;
      }
    } catch (err) {
      console.warn('Could not play mechanical clock tick:', err);
    }
  }

  /**
   * Antique Grandfather Clock: Rich alternating tick-tock with acoustic wooden case resonance
   */
  private playGrandfatherTick(isEven: boolean, vol: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Escapement click frequency: Tick (1450Hz) vs Tock (1020Hz)
    const clickFreq = isEven ? 1480 : 1020;
    const bodyFreq = isEven ? 320 : 230;

    // 1. Sharp mechanical escapement impulse
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(clickFreq, now);
    oscClick.frequency.exponentialRampToValueAtTime(clickFreq * 0.5, now + 0.015);

    gainClick.gain.setValueAtTime(0.001, now);
    gainClick.gain.linearRampToValueAtTime(0.45 * vol, now + 0.002);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    oscClick.connect(gainClick);
    gainClick.connect(this.ctx.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.03);

    // 2. Wooden clockcase acoustic resonance
    const oscBody = this.ctx.createOscillator();
    const gainBody = this.ctx.createGain();
    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(bodyFreq, now);
    oscBody.frequency.exponentialRampToValueAtTime(bodyFreq * 0.8, now + 0.05);

    gainBody.gain.setValueAtTime(0.001, now);
    gainBody.gain.linearRampToValueAtTime(0.28 * vol, now + 0.004);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, now + (isEven ? 0.06 : 0.08));

    oscBody.connect(gainBody);
    gainBody.connect(this.ctx.destination);
    oscBody.start(now);
    oscBody.stop(now + 0.09);

    // 3. Noise transient (pallet impact against tooth)
    this.playNoiseTransient(now, 1600, 0.01, 0.2 * vol);
  }

  /**
   * Vintage Pocket Watch: Fast, crisp, crisp jewel pallet-drop double-click
   */
  private playPocketWatchTick(isEven: boolean, vol: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = isEven ? 3400 : 3100;

    // Pulse 1: Pallet jewel strike
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, now);
    gain1.gain.setValueAtTime(0.35 * vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.012);

    // Pulse 2: Tooth drop (15ms delayed micro-tick)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 0.8, now + 0.015);
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.25 * vol, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.015);
    osc2.stop(now + 0.03);
  }

  /**
   * Antique Wooden Wall Clock: Warm, muted, organic timber escapement
   */
  private playWoodenClockTick(isEven: boolean, vol: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pitch = isEven ? 680 : 540;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4 * vol, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    this.playNoiseTransient(now, 500, 0.012, 0.18 * vol);
  }

  /**
   * Antique Marine Chronometer: High precision heavy brass escapement with metallic shimmer
   */
  private playChronometerTick(isEven: boolean, vol: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pitch = isEven ? 1920 : 1680;

    // Brass click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28 * vol, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.022);

    // Brass bell harmonic overtone
    const oscBell = this.ctx.createOscillator();
    const gainBell = this.ctx.createGain();
    oscBell.type = 'sine';
    oscBell.frequency.setValueAtTime(pitch * 2.15, now);
    gainBell.gain.setValueAtTime(0.12 * vol, now);
    gainBell.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscBell.connect(gainBell);
    gainBell.connect(this.ctx.destination);
    oscBell.start(now);
    oscBell.stop(now + 0.05);
  }

  /**
   * Whisper Soft Modern Click
   */
  private playSoftTick(vol: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);
    gain.gain.setValueAtTime(0.2 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  private playNoiseTransient(time: number, filterFreq: number, duration: number, vol: number) {
    if (!this.ctx) return;
    const safeVol = Math.max(0.0001, isNaN(vol) ? 0.2 : vol);
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.max(20, filterFreq), time);
    filter.Q.setValueAtTime(4.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(safeVol, time);
    gain.gain.linearRampToValueAtTime(0.0001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(time);
  }
}

export const clockTickingSound = new ClockTickingGenerator();

/**
 * Ambient Noise Generator Class
 * Generates procedural audio:
 * Brown, White, Rain, Binaural Alpha Beats, Ocean Surf, Cozy Campfire, Forest Stream, Zen Singing Bowl, Twilight Birds
 */
export class AmbientNoiseGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSourceNodes: (AudioNode | { stop: () => void } | number)[] = [];
  private currentType: AudioNoiseType = 'none';
  private currentVolume: number = 0.4;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = getAudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + 0.1);
    }
  }

  public start(type: AudioNoiseType, volume?: number) {
    if (volume !== undefined) this.currentVolume = volume;
    if (type === 'none') {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopSources();
    this.currentType = type;
    this.isPlaying = true;

    try {
      switch (type) {
        case 'brown':
          this.startBrownNoise();
          break;
        case 'white':
          this.startWhiteNoise();
          break;
        case 'rain':
          this.startRainEffect();
          break;
        case 'binaural':
          this.startBinauralBeats();
          break;
        case 'ocean':
          this.startOceanWaves();
          break;
        case 'campfire':
          this.startCampfire();
          break;
        case 'stream':
          this.startForestStream();
          break;
        case 'zen-bowl':
          this.startZenSingingBowl();
          break;
        case 'birds':
          this.startTwilightBirds();
          break;
      }
    } catch (err) {
      console.warn('Error starting ambient noise generator:', err);
    }
  }

  public stop() {
    this.stopSources();
    this.isPlaying = false;
    this.currentType = 'none';
  }

  private stopSources() {
    this.currentSourceNodes.forEach((node) => {
      try {
        if (typeof node === 'number') {
          clearInterval(node);
          clearTimeout(node);
        } else if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        if (typeof node === 'object' && 'disconnect' in node && typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.currentSourceNodes = [];
  }

  /**
   * Brown noise: low-frequency random walk filtered for deep warmth
   */
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.currentSourceNodes.push(whiteNoise, filter);
  }

  /**
   * White noise: smooth balanced focus noise
   */
  private startWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.masterGain);
    noiseSource.start();

    this.currentSourceNodes.push(noiseSource, filter);
  }

  /**
   * Rain simulation: Pink/Brown noise with resonant bandpass oscillation
   */
  private startRainEffect() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      left[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08;
      right[i] = (b0 + b1 + b2 + (Math.random() * 2 - 1) * 0.5362) * 0.08;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(this.masterGain);

    source.start();
    lfo.start();

    this.currentSourceNodes.push(source, filter, lfo, lfoGain);
  }

  /**
   * Binaural Beats (10Hz Alpha Waves)
   */
  private startBinauralBeats() {
    if (!this.ctx || !this.masterGain) return;

    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(216, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(226, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.15, this.ctx.currentTime);

    oscLeft.connect(gainL);
    gainL.connect(merger, 0, 0);

    oscRight.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.currentSourceNodes.push(oscLeft, oscRight, gainL, gainR, merger);
  }

  /**
   * Ocean Waves: Breathing rhythmic ocean swells with beach surf wash
   */
  private startOceanWaves() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let lastLeft = 0;
    let lastRight = 0;
    for (let i = 0; i < bufferSize; i++) {
      lastLeft = (lastLeft + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      lastRight = (lastRight + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      left[i] = lastLeft * 2.8;
      right[i] = lastRight * 2.8;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Resonant lowpass modulated by a slow 0.12Hz wave cycle (8.3s cycle)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.masterGain);

    source.start();
    lfo.start();

    this.currentSourceNodes.push(source, filter, lfo, lfoGain, swellGain);
  }

  /**
   * Cozy Campfire: Low warm rumble + procedural randomized snapping crackles
   */
  private startCampfire() {
    if (!this.ctx || !this.masterGain) return;

    // Base warm ember drone
    const bufferSize = 2 * this.ctx.sampleRate;
    const rumbleBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const out = rumbleBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      last = (last + 0.015 * (Math.random() * 2 - 1)) / 1.015;
      out[i] = last * 2.2;
    }

    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(this.masterGain);
    rumbleSource.start();

    this.currentSourceNodes.push(rumbleSource, rumbleFilter);

    // Random crackle and ember pop generator
    const crackleInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.45) {
        const now = this.ctx.currentTime;
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        const popFilter = this.ctx.createBiquadFilter();

        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(Math.random() * 1200 + 400, now);
        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(Math.random() * 2000 + 800, now);
        popFilter.Q.setValueAtTime(5, now);

        const dur = Math.random() * 0.015 + 0.005;
        popGain.gain.setValueAtTime(0.2 * this.currentVolume, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(this.masterGain);

        popOsc.start(now);
        popOsc.stop(now + dur + 0.01);
      }
    }, 120);

    this.currentSourceNodes.push(crackleInterval);
  }

  /**
   * Forest Mountain Stream: Fresh bubbling brook with dual modulated bandpass filters
   */
  private startForestStream() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.18;
      right[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(520, this.ctx.currentTime);
    filter1.Q.setValueAtTime(3.5, this.ctx.currentTime);

    const lfo1 = this.ctx.createOscillator();
    lfo1.frequency.setValueAtTime(0.38, this.ctx.currentTime);
    const lfoGain1 = this.ctx.createGain();
    lfoGain1.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo1.connect(lfoGain1);
    lfoGain1.connect(filter1.frequency);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(980, this.ctx.currentTime);
    filter2.Q.setValueAtTime(4.0, this.ctx.currentTime);

    const lfo2 = this.ctx.createOscillator();
    lfo2.frequency.setValueAtTime(0.55, this.ctx.currentTime);
    const lfoGain2 = this.ctx.createGain();
    lfoGain2.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo2.connect(lfoGain2);
    lfoGain2.connect(filter2.frequency);

    source.connect(filter1);
    source.connect(filter2);
    filter1.connect(this.masterGain);
    filter2.connect(this.masterGain);

    source.start();
    lfo1.start();
    lfo2.start();

    this.currentSourceNodes.push(source, filter1, filter2, lfo1, lfo2, lfoGain1, lfoGain2);
  }

  /**
   * Tibetan Zen Singing Bowl: Pure harmonic meditation drone with shimmering acoustic beatings
   */
  private startZenSingingBowl() {
    if (!this.ctx || !this.masterGain) return;

    // Harmonic singing bowl frequencies: Fundamental (216Hz), 2nd (540Hz), 3rd (864Hz), Shimmer (1512Hz)
    const partials = [
      { freq: 216, gain: 0.35 },
      { freq: 217.2, gain: 0.3 }, // subtle detune for hypnotic phase beating
      { freq: 540, gain: 0.18 },
      { freq: 864, gain: 0.1 },
      { freq: 1512, gain: 0.05 },
    ];

    partials.forEach((p) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, this.ctx.currentTime);

      // Tremolo shimmer
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(p.gain * 0.35, this.ctx.currentTime);

      gain.gain.setValueAtTime(p.gain, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();

      this.currentSourceNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  /**
   * Twilight Birds & Gentle Rustling Breeze
   */
  private startTwilightBirds() {
    if (!this.ctx || !this.masterGain) return;

    // Gentle canopy breeze
    const bufferSize = 2 * this.ctx.sampleRate;
    const breezeBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = breezeBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const breezeSource = this.ctx.createBufferSource();
    breezeSource.buffer = breezeBuffer;
    breezeSource.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    breezeSource.connect(breezeFilter);
    breezeFilter.connect(this.masterGain);
    breezeSource.start();

    this.currentSourceNodes.push(breezeSource, breezeFilter);

    // Periodic gentle bird call
    const birdInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.4) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseF = Math.random() * 400 + 2600;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseF, now);
        osc.frequency.linearRampToValueAtTime(baseF + 600, now + 0.06);
        osc.frequency.linearRampToValueAtTime(baseF + 200, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12 * this.currentVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    }, 2800);

    this.currentSourceNodes.push(birdInterval);
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      type: this.currentType,
      volume: this.currentVolume,
    };
  }
}

export const ambientSound = new AmbientNoiseGenerator();
