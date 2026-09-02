import { EqualizerPreset } from '../types';

interface ProceduralState {
  isPlaying: boolean;
  bpm: number;
  intervalId: number | null;
  step: number;
  genre: string;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private isEqEnabled: boolean = true;
  private currentFrequencyData: Uint8Array | null = null;
  private currentPlayingUrl: string | null = null;

  // Procedural Music Synthesizer for Demo & Offline Tracks
  private synthState: ProceduralState = {
    isPlaying: false,
    bpm: 122,
    intervalId: null,
    step: 0,
    genre: 'Synthpop',
  };
  private synthGainNode: GainNode | null = null;

  private eqFrequencies = [60, 230, 910, 3600, 14000];

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.preload = 'auto';

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.65; // Snappy, punchy visual response to beats
      this.analyser.minDecibels = -80;
      this.analyser.maxDecibels = -12;
      this.currentFrequencyData = new Uint8Array(this.analyser.frequencyBinCount);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 1.0;

      this.bassFilter = this.ctx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 100;
      this.bassFilter.gain.value = 0;

      this.trebleFilter = this.ctx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 8000;
      this.trebleFilter.gain.value = 0;

      // 5 EQ Filters
      this.eqFilters = this.eqFrequencies.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === this.eqFrequencies.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      this.compressorNode = this.ctx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -12;
      this.compressorNode.knee.value = 30;
      this.compressorNode.ratio.value = 6;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;

      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
      }

      // Synth Sub-Mixer Gain
      this.synthGainNode = this.ctx.createGain();
      this.synthGainNode.gain.value = 0.85;

      // Connect Media Element Source
      this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);

      // Connect both Media Element and Synth into the master effect chain
      this.sourceNode.connect(this.bassFilter);
      this.synthGainNode.connect(this.bassFilter);

      let lastNode: AudioNode = this.bassFilter;

      lastNode.connect(this.trebleFilter);
      lastNode = this.trebleFilter;

      this.eqFilters.forEach((f) => {
        lastNode.connect(f);
        lastNode = f;
      });

      lastNode.connect(this.compressorNode);
      lastNode = this.compressorNode;

      if (this.pannerNode) {
        lastNode.connect(this.pannerNode);
        lastNode = this.pannerNode;
      }

      lastNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio initialization fallback:', e);
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }
    }
  }

  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignored
      }
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    this.init();
    return this.audioElement;
  }

  /**
   * Play real audio track via HTML5 audio element to activate Android notification & lock screen
   */
  public async playTrack(
    url?: string,
    startTime = 0,
    genre = 'EDM / Dance',
    songId = 'song-1'
  ): Promise<boolean> {
    this.init();
    await this.resumeContext();

    // 1-second silent audio loop fallback so Android MediaSession notification & lock screen stay active
    const SILENT_AUDIO_LOOP = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    const targetUrl = url || SILENT_AUDIO_LOOP;

    if (this.audioElement) {
      try {
        if (targetUrl !== this.currentPlayingUrl) {
          this.currentPlayingUrl = targetUrl;
          this.audioElement.src = targetUrl;
          if (targetUrl === SILENT_AUDIO_LOOP) {
            this.audioElement.loop = true;
          } else {
            this.audioElement.loop = false;
          }
          this.audioElement.currentTime = startTime;
        } else if (startTime > 0 && Math.abs(this.audioElement.currentTime - startTime) > 1) {
          this.audioElement.currentTime = startTime;
        }

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.warn('Audio play fallback:', err);
      }
    }

    if (!url) {
      this.startProcedural(genre, songId);
    } else {
      this.stopProcedural();
    }

    return true;
  }

  public pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.stopProcedural();
  }

  public seek(time: number) {
    if (this.audioElement && this.currentPlayingUrl) {
      this.audioElement.currentTime = time;
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    if (this.synthGainNode && this.ctx) {
      this.synthGainNode.gain.setValueAtTime(clamped * 0.85, this.ctx.currentTime);
    }
  }

  public setSpeed(speed: number) {
    if (this.audioElement) {
      this.audioElement.playbackRate = speed;
    }
    if (this.synthState.isPlaying) {
      this.synthState.bpm = Math.round(124 * speed);
      this.restartSynthTimer();
    }
  }

  public setEqualizerPreset(preset: EqualizerPreset, enabled = true) {
    this.init();
    this.isEqEnabled = enabled;
    if (!this.ctx) return;

    this.eqFilters.forEach((filter, i) => {
      const targetGain = enabled ? (preset.gains[i] ?? 0) : 0;
      filter.gain.setValueAtTime(targetGain, this.ctx!.currentTime);
    });

    if (this.bassFilter) {
      const bassGain = enabled && preset.bassBoost ? (preset.bassBoost / 100) * 12 : 0;
      this.bassFilter.gain.setValueAtTime(bassGain, this.ctx.currentTime);
    }

    if (this.trebleFilter) {
      const trebleGain = enabled && preset.trebleBoost ? (preset.trebleBoost / 100) * 12 : 0;
      this.trebleFilter.gain.setValueAtTime(trebleGain, this.ctx.currentTime);
    }
  }

  public setCustomBand(index: number, gainDb: number) {
    this.init();
    if (!this.ctx || !this.eqFilters[index]) return;
    this.eqFilters[index].gain.setValueAtTime(this.isEqEnabled ? gainDb : 0, this.ctx.currentTime);
  }

  public setBassBoost(level: number) {
    this.init();
    if (!this.ctx || !this.bassFilter) return;
    const db = (level / 100) * 15;
    this.bassFilter.gain.setValueAtTime(this.isEqEnabled ? db : 0, this.ctx.currentTime);
  }

  public setTrebleBoost(level: number) {
    this.init();
    if (!this.ctx || !this.trebleFilter) return;
    const db = (level / 100) * 15;
    this.trebleFilter.gain.setValueAtTime(this.isEqEnabled ? db : 0, this.ctx.currentTime);
  }

  public setVirtualizer(level: number) {
    this.init();
    if (!this.ctx || !this.pannerNode) return;
    const pan = ((level - 50) / 100) * 0.4;
    this.pannerNode.pan.setValueAtTime(pan, this.ctx.currentTime);
  }

  public toggleEq(enabled: boolean) {
    this.isEqEnabled = enabled;
  }

  /**
   * Returns current real-time FFT frequency bytes from AnalyserNode
   */
  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.currentFrequencyData) {
      this.analyser.getByteFrequencyData(this.currentFrequencyData);
      return this.currentFrequencyData;
    }
    return new Uint8Array(64);
  }

  // =========================================================================
  // HIGH-ENERGY PROCEDURAL MUSIC & BEAT SYNTHESIZER
  // (Plays real kick, bass, snare, hi-hats & melodic synth into Web Audio)
  // =========================================================================

  private startProcedural(genre: string, songId: string) {
    this.stopProcedural();
    this.init();
    if (!this.ctx || !this.synthGainNode) return;

    let bpm = 124;
    if (genre.includes('Hip-Hop') || genre.includes('Desi')) bpm = 94;
    else if (genre.includes('Chill') || genre.includes('Acoustic') || genre.includes('Melody')) bpm = 88;
    else if (genre.includes('Carnatic') || genre.includes('Rock')) bpm = 118;
    else if (genre.includes('EDM') || genre.includes('Dance') || genre.includes('Synthpop')) bpm = 128;

    this.synthState = {
      isPlaying: true,
      bpm,
      intervalId: null,
      step: 0,
      genre,
    };

    this.restartSynthTimer();
  }

  private restartSynthTimer() {
    if (this.synthState.intervalId) {
      clearInterval(this.synthState.intervalId);
    }

    const stepDurationMs = (60 / this.synthState.bpm / 4) * 1000; // 16th note steps

    this.synthState.intervalId = window.setInterval(() => {
      this.triggerSynthStep();
    }, stepDurationMs);
  }

  public stopProcedural() {
    this.synthState.isPlaying = false;
    if (this.synthState.intervalId) {
      clearInterval(this.synthState.intervalId);
      this.synthState.intervalId = null;
    }
  }

  private triggerSynthStep() {
    if (!this.ctx || !this.synthState.isPlaying || !this.synthGainNode) return;

    const step = this.synthState.step % 16;
    this.synthState.step++;
    const now = this.ctx.currentTime;

    // 1. Kick Drum on beats 0, 4, 8, 12 (with EDM syncopation on 14)
    const isKick = step === 0 || step === 4 || step === 8 || step === 12 || (step === 14 && Math.random() > 0.4);
    if (isKick) {
      this.playKick(now);
    }

    // 2. Snare / Clap on beats 4, 12
    if (step === 4 || step === 12) {
      this.playSnare(now);
    }

    // 3. Hi-Hats on every 16th or 8th note
    const isHiHat = step % 2 === 0 || step === 3 || step === 7 || step === 11 || step === 15;
    if (isHiHat) {
      const isAccent = step % 4 === 2;
      this.playHiHat(now, isAccent);
    }

    // 4. Heavy Bassline
    const bassNotes = [55, 55, 65.4, 73.4, 82.4, 65.4, 55, 49]; // A1, C2, D2, E2...
    if (step % 2 === 0) {
      const noteIdx = Math.floor(step / 2) % bassNotes.length;
      const freq = bassNotes[noteIdx];
      this.playBassNote(now, freq);
    }

    // 5. Melodic Synth Chord / Arpeggio
    const melodyScale = [220, 261.63, 329.63, 392.0, 440, 523.25, 659.25];
    if (step % 2 === 1 || step === 0 || step === 6 || step === 10) {
      const note = melodyScale[(step * 3) % melodyScale.length];
      this.playSynthNote(now, note);
    }
  }

  private playKick(time: number) {
    if (!this.ctx || !this.synthGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Rapid pitch drop creates intense punchy 808 kick punch
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.09);

    gain.gain.setValueAtTime(1.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.29);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.synthGainNode) return;

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.1);
    oscGain.gain.setValueAtTime(0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.synthGainNode);
    osc.start(time);
    osc.stop(time + 0.13);

    // Noise clap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.synthGainNode);

    noise.start(time);
    noise.stop(time + 0.16);
  }

  private playHiHat(time: number, isAccent: boolean) {
    if (!this.ctx || !this.synthGainNode) return;

    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.4 : 0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private playBassNote(time: number, freq: number) {
    if (!this.ctx || !this.synthGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + 0.18);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.21);
  }

  private playSynthNote(time: number, freq: number) {
    if (!this.ctx || !this.synthGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.22);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.25);
  }
}

export const audioEngine = new AudioEngine();
