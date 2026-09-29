// Web Audio API based ambient sound generator for E-Visit (Temple Bells, Dhaak, Tanpura, Conch)
class TempleAudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private tanpuraOsc: OscillatorNode | null = null;
  private tanpuraGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play brass temple bell chime with rich harmonic overtones
  public playTempleBell() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Bell fundamentals & harmonics
      const frequencies = [587.33, 1174.66, 1760.0, 2349.32]; // D5 note with resonant partials

      frequencies.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.2 / (i + 1);
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 - i * 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      console.warn('Audio context unavailable', e);
    }
  }

  // Play Kolkata Durga Puja Dhaak percussion beat pattern
  public playDhaakBeat() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const strokes = [0, 0.18, 0.36, 0.48, 0.72, 0.90]; // Dhaak rhythm pattern

      strokes.forEach((timeOffset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        // Pitch envelope for drum membrane impact
        const basePitch = idx % 3 === 0 ? 110 : 155;
        osc.frequency.setValueAtTime(basePitch * 1.8, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(basePitch, now + timeOffset + 0.08);

        gain.gain.setValueAtTime(0.35, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.2);
      });
    } catch (e) {
      console.warn('Audio context unavailable', e);
    }
  }

  // Play sacred Conch / Shankha sound
  public playShankha() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Slow swell and breath
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.6);
      osc.frequency.linearRampToValueAtTime(310, now + 1.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      // Low pass filter for warm organic resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.3);
    } catch (e) {
      console.warn('Audio context unavailable', e);
    }
  }

  // Play sacred Shiva Damru rhythm
  public playDamruBeat() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const strikes = [0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63];

      strikes.forEach((t, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        const pitch = i % 2 === 0 ? 320 : 280;
        osc.frequency.setValueAtTime(pitch, now + t);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + t + 0.06);

        gain.gain.setValueAtTime(0.28, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.08);
      });
    } catch (e) {
      console.warn('Damru audio unavailable', e);
    }
  }

  // Start continuous soothing Tanpura ambient drone
  public toggleTanpura(enable: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!enable) {
        if (this.tanpuraOsc && this.tanpuraGain) {
          this.tanpuraGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
          setTimeout(() => {
            try {
              this.tanpuraOsc?.stop();
              this.tanpuraOsc?.disconnect();
              this.tanpuraOsc = null;
            } catch (e) {}
          }, 900);
        }
        return;
      }

      if (this.tanpuraOsc) return; // already active

      const now = this.ctx.currentTime;
      this.tanpuraOsc = this.ctx.createOscillator();
      this.tanpuraGain = this.ctx.createGain();

      this.tanpuraOsc.type = 'sawtooth';
      this.tanpuraOsc.frequency.setValueAtTime(146.83, now); // D3 Tanpura Sa

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      this.tanpuraGain.gain.setValueAtTime(0.001, now);
      this.tanpuraGain.gain.linearRampToValueAtTime(0.08, now + 1.2);

      this.tanpuraOsc.connect(filter);
      filter.connect(this.tanpuraGain);
      this.tanpuraGain.connect(this.ctx.destination);

      this.tanpuraOsc.start(now);
    } catch (e) {
      console.warn('Tanpura drone unavailable', e);
    }
  }
}

export const templeAudio = new TempleAudioService();
