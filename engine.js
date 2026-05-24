/**
 * Neck PT Companion - Exercise engines (no DOM).
 *
 * CountdownTimer  - a pausable per-second countdown that emits tick/complete.
 * RepSetTracker   - the reps/sets/side state machine, returning a typed event
 *                   per rep so the controller can drive the view & audio.
 */

export class CountdownTimer {
  constructor({ onTick, onComplete } = {}) {
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this.secondsLeft = 0;
    this.running = false;
    this._interval = null;
  }

  reset(seconds) {
    this.stop();
    this.secondsLeft = seconds;
  }

  start() {
    if (this.running || this.secondsLeft <= 0) return;
    this.running = true;
    this._interval = setInterval(() => {
      this.secondsLeft -= 1;
      this.onTick(this.secondsLeft);
      if (this.secondsLeft <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    this.running = false;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
}

/**
 * Tracks reps, sets and (for unilateral exercises) which side is active.
 * Call tickRep() once per completed repetition; it mutates internal state and
 * returns one of:
 *   { type: 'rep',              repsLeft, setsLeft, side }
 *   { type: 'sideSwitch',       side: 'right', repsLeft, setsLeft }
 *   { type: 'setComplete',      side, repsLeft, setsLeft }
 *   { type: 'exerciseComplete' }
 */
export class RepSetTracker {
  init(dosage, unilateral) {
    this.repsMax = dosage.reps ? dosage.reps.max : 1;
    this.setsLeft = dosage.sets ? dosage.sets.max : 1;
    this.repsLeft = this.repsMax;
    this.side = unilateral ? 'left' : null;
    return this.state();
  }

  state() {
    return { repsLeft: this.repsLeft, setsLeft: this.setsLeft, side: this.side };
  }

  tickRep() {
    this.repsLeft -= 1;
    if (this.repsLeft > 0) {
      return { type: 'rep', ...this.state() };
    }

    if (this.side === 'left') {
      this.side = 'right';
      this.repsLeft = this.repsMax;
      return { type: 'sideSwitch', ...this.state() };
    }

    // side === 'right' (finished both sides) OR bilateral: a set is complete.
    this.setsLeft -= 1;
    if (this.setsLeft <= 0) {
      return { type: 'exerciseComplete' };
    }
    if (this.side === 'right') this.side = 'left';
    this.repsLeft = this.repsMax;
    return { type: 'setComplete', ...this.state() };
  }
}
