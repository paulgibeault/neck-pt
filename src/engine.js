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

/**
 * Default pacing (seconds) for the hands-free guided autopilot. These are the
 * tempo of the *coaching*, not the clinical prescription: hold_seconds always
 * comes from the dosage and is never sped up. Everything else (get-ready,
 * side switches, rest, and per-rep tempo) can be scaled at runtime by the
 * user's "slower"/"faster" command.
 */
export const PACING = {
  announceSec: 3,   // time to speak the exercise name before starting
  prepareSec: 5,    // "get into position" before the first effort
  switchSec: 6,     // reposition to the other side
  restSec: 12,      // breathing rest between sets
  repSec: 4,        // one controlled rep (move out + return)
  isoRepSec: 5,     // one isometric rep (engage + 3–4" hold + release)
  completeSec: 2,   // closing chime / "well done"
};

const sideWord = (side) => (side === 'left' ? 'left' : 'right');

/**
 * Turn one exercise into an ordered list of timed coaching phases that the
 * autopilot player walks through hands-free. Pure & DOM-free so it can be
 * unit-tested. Each phase:
 *   { type, durationSec, side, say, countdown, breathing, rep?, repsTotal?,
 *     set?, setsTotal?, isometric? }
 *   type: 'announce' | 'prepare' | 'switch' | 'rest' | 'hold' | 'rep' | 'complete'
 *   countdown: show the ring + tick the final seconds
 *   breathing: drive the inhale/exhale guide during this phase
 */
export function buildExercisePlan(ex, pacing = PACING) {
  const d = ex.dosage || {};
  const sides = ex.unilateral ? ['left', 'right'] : [null];
  const phases = [];

  phases.push({
    type: 'announce',
    durationSec: pacing.announceSec,
    side: sides[0],
    countdown: false,
    breathing: false,
    say: ex.unilateral
      ? `${ex.title}. Starting on the ${sideWord(sides[0])} side.`
      : `${ex.title}.`,
  });

  if (d.hold_seconds) {
    sides.forEach((side, i) => {
      phases.push(i === 0
        ? { type: 'prepare', side, durationSec: pacing.prepareSec, countdown: true, breathing: false, say: 'Get into position.' }
        : { type: 'switch', side, durationSec: pacing.switchSec, countdown: true, breathing: false, say: `Switch to the ${sideWord(side)} side. Get into position.` });
      phases.push({
        type: 'hold', side, durationSec: d.hold_seconds, countdown: true, breathing: true,
        say: `Hold for ${d.hold_seconds} seconds. Breathe slowly.`,
      });
    });
  } else {
    const reps = d.reps ? d.reps.max : 1;
    const sets = d.sets ? d.sets.max : 1;
    const iso = ex.category === 'isometric';
    const repSec = iso ? pacing.isoRepSec : pacing.repSec;

    for (let s = 1; s <= sets; s++) {
      sides.forEach((side, si) => {
        if (s === 1 && si === 0) {
          phases.push({ type: 'prepare', side, durationSec: pacing.prepareSec, countdown: true, breathing: false, say: 'Get into position.' });
        } else if (si > 0) {
          phases.push({ type: 'switch', side, durationSec: pacing.switchSec, countdown: true, breathing: false, say: `Switch to the ${sideWord(side)} side.` });
        } else {
          // New set, back to the first side: a breathing rest.
          phases.push({ type: 'rest', side, durationSec: pacing.restSec, countdown: true, breathing: true, say: `Set ${s} of ${sets}. Rest and breathe.` });
        }
        for (let r = 1; r <= reps; r++) {
          phases.push({
            type: 'rep', side, rep: r, repsTotal: reps, set: s, setsTotal: sets, isometric: iso,
            durationSec: repSec, countdown: iso, breathing: false,
            say: iso ? `Rep ${r}. Push and hold.` : `${r}.`,
          });
        }
      });
    }
  }

  phases.push({ type: 'complete', durationSec: pacing.completeSec, side: null, countdown: false, breathing: false, say: 'Exercise complete. Well done.' });
  return phases;
}
