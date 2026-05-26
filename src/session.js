/**
 * Neck PT Companion - RoutineSession Manager.
 *
 * Encapsulates the runtime scheduling state and navigation loop of an active
 * physical therapy routine. This module is completely DOM-free, making it
 * 100% unit-testable.
 */

import { buildExercisePlan } from './engine.js';
import { clamp } from './format.js';

const TEMPO_STEP = 0.25;
const TEMPO_MIN = 0.5;  // fastest (durations × 0.5)
const TEMPO_MAX = 2.0;  // slowest (durations × 2)

export class RoutineSession {
  /**
   * @param {Object} options
   * @param {Array} options.exercises - Sorted array of clinical exercises
   * @param {number} [options.startIndex=0] - Exercise index to start from
   * @param {Object} options.pacing - Base pacing durations in seconds
   * @param {function} options.onEvent - Event pub/sub callback receiving (type, state)
   */
  constructor({ exercises, startIndex = 0, pacing, onEvent }) {
    this.exercises = exercises;
    this.currentIndex = startIndex;
    this.pacing = pacing;
    this.onEvent = onEvent || (() => {});

    // Transient session state
    this.plan = [];
    this.phaseIdx = 0;
    this.phaseRemaining = 0;
    this.phaseTotal = 0;
    this.tempoScale = 1.0;
    this.running = false;
    this.intervalId = null;
    this.completedExerciseSlugs = new Set();
  }

  /**
   * Start the scheduler tick and load the initial exercise.
   */
  start() {
    if (this.intervalId) return;
    this.running = true;
    this.loadExercise();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Teardown the scheduler tick.
   */
  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Toggle pause/resume state.
   */
  togglePause() {
    if (this.running) {
      this.running = false;
      this.onEvent('pause', this.getState());
    } else {
      this.running = true;
      this.onEvent('resume', this.getState());
    }
  }

  /**
   * Advance to the next exercise.
   */
  skip() {
    this.currentIndex += 1;
    this.loadExercise();
  }

  /**
   * Step back to the previous exercise or restart the current one.
   */
  back() {
    // If we've started moving through the current exercise, restart it first.
    if (this.phaseIdx > 1) {
      this.repeat();
      return;
    }
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.loadExercise();
  }

  /**
   * Restart the current exercise plan.
   */
  repeat() {
    this.loadExercise();
  }

  /**
   * Adjust active pacing coaching tempo.
   * @param {'slower'|'faster'} direction
   */
  adjustTempo(direction) {
    const delta = direction === 'slower' ? TEMPO_STEP : -TEMPO_STEP;
    this.tempoScale = clamp(Math.round((this.tempoScale + delta) * 100) / 100, TEMPO_MIN, TEMPO_MAX);
    this.onEvent('tempo-change', this.getState());

    // If active phase is a scalable phase, update totals dynamically.
    const phase = this.plan[this.phaseIdx];
    if (phase && ['rep', 'prepare', 'switch', 'rest'].includes(phase.type)) {
      const elapsed = this.phaseTotal - this.phaseRemaining;
      this.phaseTotal = this.effectiveDuration(phase);
      this.phaseRemaining = Math.max(1, this.phaseTotal - elapsed);
      this.onEvent('phase-tick', this.getState());
    }
  }

  /**
   * Load the exercise at current index and build its phase plan.
   */
  loadExercise() {
    const ex = this.exercises[this.currentIndex];
    if (!ex) {
      this.stop();
      this.onEvent('session-complete', this.getState());
      return;
    }

    this.plan = buildExercisePlan(ex, this.pacing);
    this.phaseIdx = 0;
    this.onEvent('exercise-load', this.getState());
    this.enterPhase();
  }

  /**
   * Scale duration for pacing phases (hold times from dosage are never scaled).
   */
  effectiveDuration(phase) {
    const scalable = ['rep', 'prepare', 'switch', 'rest'].includes(phase.type);
    return Math.max(1, Math.round(phase.durationSec * (scalable ? this.tempoScale : 1)));
  }

  /**
   * Initialize and enter a new coaching phase.
   */
  enterPhase() {
    const phase = this.plan[this.phaseIdx];
    if (!phase) {
      this.currentIndex += 1;
      this.loadExercise();
      return;
    }

    this.phaseTotal = this.effectiveDuration(phase);
    this.phaseRemaining = this.phaseTotal;
    this.onEvent('phase-enter', this.getState());
  }

  /**
   * Advance to the next phase in the plan.
   */
  nextPhase() {
    const phase = this.plan[this.phaseIdx];
    if (phase && phase.type === 'hold') {
      this.onEvent('hold-complete', this.getState());
    }

    this.phaseIdx += 1;
    if (this.phaseIdx >= this.plan.length) {
      const completedEx = this.exercises[this.currentIndex];
      if (completedEx) {
        this.completedExerciseSlugs.add(completedEx.slug);
        this.onEvent('exercise-complete', { ...this.getState(), completedSlug: completedEx.slug });
      }
      this.currentIndex += 1;
      this.loadExercise();
    } else {
      this.enterPhase();
    }
  }

  /**
   * 1-second interval execution tick.
   */
  tick() {
    if (!this.running) return;

    this.phaseRemaining -= 1;
    if (this.phaseRemaining > 0) {
      this.onEvent('phase-tick', this.getState());
    } else {
      this.nextPhase();
    }
  }

  /**
   * Return a snapshot of current session state.
   */
  getState() {
    const activeExercise = this.exercises[this.currentIndex] || null;
    const activePhase = this.plan[this.phaseIdx] || null;

    return {
      currentIndex: this.currentIndex,
      activeExercise,
      activePhase,
      phaseIdx: this.phaseIdx,
      phaseTotal: this.phaseTotal,
      phaseRemaining: this.phaseRemaining,
      tempoScale: this.tempoScale,
      running: this.running,
      completedExerciseCount: this.completedExerciseSlugs.size,
      completedExerciseSlugs: Array.from(this.completedExerciseSlugs),
    };
  }
}
