/**
 * Neck PT Companion - Hands-free speech layer.
 *
 * Speaker        - spoken coaching via the Web Speech *synthesis* API (TTS).
 *                  Widely supported; this is the reliable backbone of hands-free
 *                  use (you follow along by ear with your hands on your neck).
 * VoiceCommander - optional voice *recognition* (SpeechRecognition) that maps a
 *                  small spoken grammar to control commands. Chrome/Edge mainly;
 *                  degrades to `supported = false` everywhere else, in which case
 *                  the keyboard / on-screen buttons remain the control path.
 *
 * Neither throws if the API is missing — callers check `.available` / `.supported`.
 */

export class Speaker {
  constructor() {
    this.synth = (typeof window !== 'undefined' && window.speechSynthesis) || null;
    this.muted = false;
  }

  get available() {
    return !!this.synth;
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) this.cancel();
  }

  /** Speak `text`, cancelling anything mid-utterance by default so cues stay current. */
  speak(text, { interrupt = true } = {}) {
    if (!this.synth || this.muted || !text) return;
    if (interrupt) this.synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    u.lang = 'en-US';
    this.synth.speak(u);
  }

  cancel() {
    if (this.synth) this.synth.cancel();
  }
}

/* Spoken-keyword grammar. Checked in this order, so multi-word / specific
 * phrases win over the bare "go"/"stop" that appear inside them. */
const GRAMMAR = [
  { cmd: 'slower', words: ['slow down', 'slower', 'too fast'] },
  { cmd: 'faster', words: ['speed up', 'faster', 'too slow'] },
  { cmd: 'repeat', words: ['repeat', 'again', 'restart', 'redo'] },
  { cmd: 'back',   words: ['go back', 'previous', 'back'] },
  { cmd: 'next',   words: ['next', 'skip', 'forward', 'move on'] },
  { cmd: 'resume', words: ['resume', 'continue', 'unpause', 'keep going', 'go', 'play'] },
  { cmd: 'pause',  words: ['pause', 'stop', 'wait', 'hold on', 'freeze'] },
];

/** Find a command in a recognised phrase; phrase-level match, first rule wins. */
export function matchCommand(transcript) {
  const text = ` ${transcript.toLowerCase().trim()} `;
  for (const { cmd, words } of GRAMMAR) {
    if (words.some((w) => text.includes(` ${w} `) || text.includes(` ${w}`))) return cmd;
  }
  return null;
}

export class VoiceCommander {
  /**
   * @param {(cmd:string)=>void} onCommand  fired with a matched command keyword
   */
  constructor(onCommand) {
    const SR = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition);
    this.onCommand = onCommand || (() => {});
    this.onError = null;          // (reason) => void  e.g. 'denied'
    this.supported = !!SR;
    this.listening = false;
    this._wantListening = false;
    this._last = { cmd: null, t: 0 };

    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e) => this._handle(e);
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        this._wantListening = false;
        this.listening = false;
        if (this.onError) this.onError('denied');
      }
      // 'no-speech' / 'aborted' are transient; onend will relaunch.
    };
    r.onend = () => {
      this.listening = false;
      // Browsers stop recognition periodically; relaunch while still wanted.
      if (this._wantListening) {
        try { r.start(); this.listening = true; } catch { /* already starting */ }
      }
    };
    this.r = r;
  }

  start() {
    if (!this.supported || this.listening) return;
    this._wantListening = true;
    try { this.r.start(); this.listening = true; } catch { /* start() race — onend will retry */ }
  }

  stop() {
    this._wantListening = false;
    this.listening = false;
    if (this.r) { try { this.r.stop(); } catch { /* not running */ } }
  }

  _handle(e) {
    // Scan only the newest results; fire once per command with a short debounce
    // so interim duplicates don't trigger repeatedly.
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const cmd = matchCommand(e.results[i][0].transcript);
      if (!cmd) continue;
      const now = Date.now();
      if (cmd === this._last.cmd && now - this._last.t < 1500) continue;
      this._last = { cmd, t: now };
      this.onCommand(cmd);
      return;
    }
  }
}
