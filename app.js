/**
 * Neck PT Companion - Controller.
 *
 * Orchestrates the program flow and wires together the model (data + store),
 * the view (ui.js), and the engines (timer + rep tracker). Holds only transient
 * per-session state; all persistence lives in the Store.
 */

import { PROGRAM } from './data.js';
import { audio } from './audio.js';
import { Store } from './store.js';
import { View } from './ui.js';
import { CountdownTimer, RepSetTracker } from './engine.js';
import { clamp, greeting as greetingNow } from './format.js';

const FRAME_INTERVAL_MS = 1800;

class NeckPTApp {
  constructor() {
    this.program = PROGRAM;
    this.exercises = [...PROGRAM.exercises].sort((a, b) => a.order - b.order);

    this.store = new Store();
    this.view = new View();

    // transient session state
    this.currentExIndex = 0;
    this.sessionActive = false;
    this.sessionStartTime = null;
    this.preSessionPain = 5;
    this.currentSide = null; // for timer-mode unilateral holds
    this.holdTotal = 0;
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.animatorInterval = null;
    this.breathingInterval = null;
    this.repHoldInterval = null;

    this.tracker = new RepSetTracker();
    this.timer = new CountdownTimer({
      onTick: (s) => this.onTimerTick(s),
      onComplete: () => this.handleTimerCompletion(),
    });

    this.view.applyTheme(this.store.getTheme());
    this.bindEvents();
    this.goDashboard();
  }

  /* ---- event wiring ---- */

  bindEvents() {
    const d = this.view.dom;

    d.btnTheme.addEventListener('click', () => this.toggleTheme());

    d.btnStartSession.addEventListener('click', () => this.openPrePain());
    d.btnPrePainBack.addEventListener('click', () => this.goDashboard());
    d.prePainSlider.addEventListener('input', (e) => this.view.setPrePain(e.target.value));
    d.btnPrePainBegin.addEventListener('click', () => this.beginSession());

    d.btnSummaryBack.addEventListener('click', () => this.goDashboard());
    d.btnSummaryPlay.addEventListener('click', () => this.playActiveExercise());

    this.view.dom.timerProgressFill.parentElement.addEventListener('click', () => this.toggleTimer());
    d.btnRepTick.addEventListener('click', () => this.handleRepTick());

    d.btnPrevEx.addEventListener('click', () => this.changeExercise(-1));
    d.btnNextEx.addEventListener('click', () => this.changeExercise(1));
    d.btnExitRoutine.addEventListener('click', () => this.exitRoutine());

    // Both the button and tapping the illustration flip vector <-> example photo.
    d.btnToggleOriginal.addEventListener('click', () => this.toggleOriginal());
    d.activeIllustration.addEventListener('click', () => this.toggleOriginal());

    d.painSlider.addEventListener('input', (e) => { d.painValueDisplay.textContent = e.target.value; });
    d.btnSaveSession.addEventListener('click', () => this.saveRoutineSession());
    d.btnBackHome.addEventListener('click', () => this.goDashboard());

    d.btnOpenStats.addEventListener('click', () => { this.view.showScreen('stats'); this.view.renderStats(this.store.history); });
    d.btnCloseStats.addEventListener('click', () => this.goDashboard());
  }

  /* ---- theme ---- */

  toggleTheme() {
    const next = this.view.dom.body.classList.contains('dark-theme') ? 'light' : 'dark';
    this.store.setTheme(next);
    this.view.applyTheme(next);
  }

  /* ---- dashboard ---- */

  goDashboard() {
    this.view.showScreen('dashboard');
    const completedToday = this.store.completedToday();
    this.view.renderDashboard({
      greeting: greetingNow(),
      completedToday,
      completedCount: completedToday ? this.exercises.length : 0,
      total: this.exercises.length,
      streak: this.store.streak,
      activeMinutes: this.store.totalActiveMinutes(),
      exercises: this.exercises,
    }, (idx) => { audio.init(); this.openExerciseSummary(idx); });
  }

  /* ---- pre-session pain ---- */

  openPrePain() {
    audio.init();
    this.view.setPrePain(5);
    this.view.showScreen('prePain');
  }

  beginSession() {
    this.preSessionPain = clamp(parseInt(this.view.dom.prePainSlider.value, 10) || 0, 0, 10);
    this.sessionActive = true;
    this.sessionStartTime = new Date();
    this.openExerciseSummary(0);
  }

  /* ---- summary ---- */

  openExerciseSummary(idx) {
    this.currentExIndex = idx;
    const ex = this.exercises[idx];
    if (!ex) return;
    this.view.renderSummary(ex, idx, this.exercises.length, this.clinicianNote(ex));
    this.view.showScreen('summary');
  }

  /* ---- active routine ---- */

  playActiveExercise() {
    if (!this.sessionActive) {
      this.sessionActive = true;
      this.sessionStartTime = new Date();
    }
    this.view.showScreen('routine');
    this.loadActiveExercise();
  }

  loadActiveExercise() {
    this.timer.stop();
    this.stopBreathing();
    this.stopFrameAnimator();
    this.stopRepHold();

    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    const dosage = ex.dosage;
    const mode = dosage.hold_seconds ? 'timer' : 'reps';

    this.view.renderRoutineMeta(ex, this.currentExIndex, this.exercises.length, this.clinicianNote(ex), mode);

    // visuals
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.renderFrame();
    this.view.buildDots(ex.example_image_count, (i) => this.onDotClick(i));
    this.startFrameAnimator(ex.example_image_count);

    if (mode === 'timer') {
      this.currentSide = ex.unilateral ? 'left' : null;
      this.view.updateSide(this.currentSide);
      this.holdTotal = dosage.hold_seconds;
      this.timer.reset(this.holdTotal);
      this.view.setTimerDisplay(this.holdTotal, this.holdTotal, 'seconds');
    } else {
      const state = this.tracker.init(dosage, ex.unilateral);
      this.currentSide = state.side;
      this.view.updateSide(state.side);
      this.view.updateRepCounters(state);
    }
  }

  clinicianNote(ex) {
    const notes = [...(ex.notes || [])];
    if (ex.category === 'isometric' && this.program.clinician_notes) {
      const iso = this.program.clinician_notes.find((n) => n.includes('3-4" holds'));
      if (iso && !notes.includes(iso)) notes.push(iso);
    }
    return notes.length ? notes.join(' • ') : null;
  }

  /* ---- frame animator ---- */

  renderFrame() {
    const ex = this.exercises[this.currentExIndex];
    const kind = this.showingOriginal ? 'example' : 'vector';
    this.view.renderFrame(`${ex.folder}/${kind}-${this.activeFrameIndex}.png`, this.activeFrameIndex);
  }

  startFrameAnimator(count) {
    this.stopFrameAnimator();
    if (count <= 1) return;
    this.animatorInterval = setInterval(() => {
      if (this.showingOriginal) return;
      this.activeFrameIndex = this.activeFrameIndex >= count ? 1 : this.activeFrameIndex + 1;
      this.renderFrame();
    }, FRAME_INTERVAL_MS);
  }

  stopFrameAnimator() {
    if (this.animatorInterval) clearInterval(this.animatorInterval);
    this.animatorInterval = null;
  }

  onDotClick(i) {
    this.activeFrameIndex = i;
    this.renderFrame();
    // Resume auto-advance from the chosen frame (previously stopped for good).
    this.startFrameAnimator(this.exercises[this.currentExIndex].example_image_count);
  }

  toggleOriginal() {
    this.showingOriginal = !this.showingOriginal;
    this.view.setOriginalToggle(this.showingOriginal);
    this.renderFrame();
  }

  /* ---- timer mode ---- */

  toggleTimer() {
    if (this.timer.running) {
      this.timer.stop();
      this.stopBreathing();
      this.view.setTimerText(this.timer.secondsLeft, 'resume');
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timer.secondsLeft <= 0) this.timer.reset(this.holdTotal);
    this.timer.start();
    this.view.dom.timerSubtext.textContent = 'pause';
    this.startBreathing();
  }

  onTimerTick(secondsLeft) {
    this.view.setTimerDisplay(secondsLeft, this.holdTotal, 'pause');
    if (secondsLeft <= 3 && secondsLeft > 0) audio.playWarning();
    else if (secondsLeft > 0) audio.playTick();
  }

  handleTimerCompletion() {
    this.stopBreathing();
    this.view.setBreathing('idle');
    audio.playChime();
    this.view.setTimerText('✓', 'Done');

    if (this.currentSide === 'left') {
      setTimeout(() => {
        alert('Completed Left Side! Switch positions to perform on the Right Side.');
        this.currentSide = 'right';
        this.view.updateSide('right');
        this.timer.reset(this.holdTotal);
        this.view.setTimerDisplay(this.holdTotal, this.holdTotal, 'ready');
        setTimeout(() => this.startTimer(), 1500);
      }, 1200);
    } else {
      setTimeout(() => this.changeExercise(1), 1500);
    }
  }

  /* ---- breathing guide ---- */

  startBreathing() {
    const cycle = () => {
      if (!this.timer.running) return;
      this.view.setBreathing('inhale');
      setTimeout(() => { if (this.timer.running) this.view.setBreathing('exhale'); }, 4000);
    };
    cycle();
    this.breathingInterval = setInterval(cycle, 8000);
  }

  stopBreathing() {
    if (this.breathingInterval) clearInterval(this.breathingInterval);
    this.breathingInterval = null;
    this.view.setBreathing('idle');
  }

  stopRepHold() {
    if (this.repHoldInterval) clearInterval(this.repHoldInterval);
    this.repHoldInterval = null;
  }

  /* ---- reps mode ---- */

  handleRepTick() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;

    if (ex.category === 'isometric') {
      this.view.setRepButton('Holding resistance... 3', true);
      this.view.setBreathing('inhale');
      audio.playTick();
      let s = 3;
      this.repHoldInterval = setInterval(() => {
        s -= 1;
        audio.playTick();
        this.view.setRepButton(`Holding resistance... ${s}`, true);
        if (s <= 0) {
          this.stopRepHold();
          this.view.setBreathing('idle');
          audio.playChime();
          this.view.setRepButton('Complete Repetition (Hold 3s)', false);
          this.processRep();
        }
      }, 1000);
    } else {
      audio.playTick();
      this.processRep();
    }
  }

  processRep() {
    const e = this.tracker.tickRep();
    switch (e.type) {
      case 'rep':
        this.view.updateRepCounters(e);
        break;
      case 'sideSwitch':
        audio.playChime();
        alert('Completed reps on the Left Side! Now switch positions to perform on the Right Side.');
        this.currentSide = 'right';
        this.view.updateSide('right');
        this.view.updateRepCounters(e);
        break;
      case 'setComplete':
        alert(e.side === 'left'
          ? 'Set completed! Take a 10s breathing rest, then begin the next set starting on the Left Side.'
          : 'Set completed! Take a 10s breathing rest, then begin the next set.');
        this.currentSide = e.side;
        this.view.updateSide(e.side);
        this.view.updateRepCounters(e);
        break;
      case 'exerciseComplete':
        audio.playChime();
        this.changeExercise(1);
        break;
    }
  }

  /* ---- navigation ---- */

  changeExercise(dir) {
    this.timer.stop();
    this.stopBreathing();
    this.stopFrameAnimator();
    this.stopRepHold();
    const next = this.currentExIndex + dir;
    if (next >= this.exercises.length) {
      this.promptPostSessionSurvey();
    } else if (next < 0) {
      this.goDashboard();
    } else {
      this.openExerciseSummary(next);
    }
  }

  exitRoutine() {
    if (!confirm('End this PT routine session early? Progress will not be saved.')) return;
    this.timer.stop();
    this.stopBreathing();
    this.stopFrameAnimator();
    this.sessionActive = false;
    this.goDashboard();
  }

  /* ---- completion ---- */

  promptPostSessionSurvey() {
    this.sessionActive = false;
    this.view.showScreen('completion');
    this.view.showPainSurvey(this.preSessionPain);
  }

  saveRoutineSession() {
    const postPain = clamp(parseInt(this.view.dom.painSlider.value, 10) || 0, 0, 10);
    const durationMinutes = Math.max(1, Math.round((Date.now() - this.sessionStartTime) / 60000));

    const { streak } = this.store.recordSession({
      date: new Date().toISOString(),
      duration_minutes: durationMinutes,
      pre_pain: this.preSessionPain,
      post_pain: postPain,
      exercises_completed: this.exercises.length,
    });

    this.view.showCompletionSummary({
      durationMinutes,
      painDelta: postPain - this.preSessionPain,
      streak,
    });
    audio.playChime();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.PTAppInstance = new NeckPTApp();
});
