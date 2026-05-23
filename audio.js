/**
 * Neck PT Companion - Web Audio API Synthesizer
 * Provides zero-latency, zero-dependency sound cues without requiring heavy MP3 assets.
 * Handles lazy-initialization of AudioContext on user interaction.
 */

class PTAudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  /**
   * Safe lazy initialization for browser autocomplete/autostart rules.
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
    return this.enabled;
  }

  /**
   * Helper to create a gain node with exponential decay
   */
  createDecayEnvelope(duration, startVal = 1.0, endVal = 0.001) {
    this.init();
    if (!this.ctx || !this.enabled) return null;

    // Resume context if suspended (common in mobile browsers)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const gainNode = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gainNode.gain.setValueAtTime(startVal, now);
    gainNode.gain.exponentialRampToValueAtTime(endVal, now + duration);
    gainNode.connect(this.ctx.destination);
    return gainNode;
  }

  /**
   * Soft, peaceful woodblock-like click for count ticks
   */
  playTick() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const duration = 0.08;
    const gainNode = this.createDecayEnvelope(duration, 0.2);
    if (!gainNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Warning double-beep for last 3 seconds
   */
  playWarning() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const playBeep = (delay) => {
      const now = this.ctx.currentTime + delay;
      const duration = 0.15;
      
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gainNode.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now); // B5 note

      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + duration);
    };

    playBeep(0);
  }

  /**
   * Beautiful therapeutic clinical chime (combining dual bells)
   * Uses FM-like harmonic resonance to create a soothing physical therapy bell sound.
   */
  playChime() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const now = this.ctx.currentTime;
    
    // Core frequency component (C6 Bell)
    const playBellNode = (freq, volume, duration) => {
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, now);
      // Soft attack, slow decay
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gainNode.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Add a slight vibrato
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.value = 5.5; // 5.5 Hz vibrato
      vibratoGain.gain.value = freq * 0.008; // small pitch sway

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      osc.connect(gainNode);
      vibrato.start(now);
      osc.start(now);

      vibrato.stop(now + duration);
      osc.stop(now + duration);
    };

    // Synthesize a beautiful harmonic chord (E6, G6, B6 bell arpeggio)
    playBellNode(1318.51, 0.25, 2.5); // E6
    setTimeout(() => playBellNode(1567.98, 0.20, 2.2), 120); // G6
    setTimeout(() => playBellNode(1975.53, 0.15, 2.0), 240); // B6
  }
}

// Export a single global instance for simplicity in vanilla JS app
window.PTAudio = new PTAudioSystem();
