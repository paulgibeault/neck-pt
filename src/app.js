/**
 * Neck PT Companion - Application Controller.
 *
 * Orchestrates routing, event wiring, and user-facing state by coordinating:
 *   - data.js   → clinical program data
 *   - store.js  → localStorage persistence
 *   - ui.js     → all DOM mutations (view layer)
 *   - session.js→ guided autopilot scheduler (DOM-free, fully testable)
 *   - audio.js  → synthesized audio cues
 *   - speech.js → TTS coaching + voice recognition
 *
 * This controller is intentionally thin: it translates RoutineSession events
 * into view calls and maps user actions to session commands. No timers or
 * scheduling live here.
 */

import { PROGRAM, validateProgram } from './data.js';
import { audio } from './audio.js';
import { Store } from './store.js';
import { View } from './ui.js';
import { RoutineSession } from './session.js';
import { Speaker, VoiceCommander } from './speech.js';
import { clamp, greeting as greetingNow } from './format.js';

const FRAME_INTERVAL_MS = 4500;

class NeckPTApp {
  constructor() {
    // Validate program data at startup — surfaces any data.js editing mistakes
    // before they can crash the player mid-routine.
    validateProgram(PROGRAM);

    this.program = PROGRAM;
    this.exercises = [...PROGRAM.exercises].sort((a, b) => a.order - b.order);

    this.store = new Store();
    this.view = new View();
    this.speaker = new Speaker();
    this.speaker.setMuted(this.store.getSpeechMuted());

    this.voice = null;        // lazily created on first routine (needs a user gesture)
    this.voiceEnabled = false;

    // Active routine session (null when not in a workout)
    this.session = null;

    // Transient navigation/animation state
    this.currentExIndex = 0;
    this.sessionActive = false;
    this.sessionStartTime = null;
    this.preSessionPain = 5;
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.animatorInterval = null;

    this.view.applyTheme(this.store.getTheme());
    this.bindEvents();
    this.goDashboard();
  }

  /* ---- event wiring ---- */

  bindEvents() {
    const d = this.view.dom;

    d.btnTheme.addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-routine-theme')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-summary-theme')?.addEventListener('click', () => this.toggleTheme());

    d.btnStartSession.addEventListener('click', () => this.openPrePain());
    d.btnPrePainBack.addEventListener('click', () => this.goDashboard());
    d.prePainSlider.addEventListener('input', (e) => this.view.setPrePain(e.target.value));
    d.btnPrePainBegin.addEventListener('click', () => this.beginSession());

    d.btnSummaryBack.addEventListener('click', () => this.goDashboard());
    d.btnSummaryPlay.addEventListener('click', () => this.startGuidedRoutine(this.currentExIndex));

    // Guided transport controls delegate to the session object.
    d.btnGuidedPause.addEventListener('click', () => this.session?.togglePause());
    d.btnGuidedSkip.addEventListener('click', () => { this.speaker.speak('Skipping ahead.'); this.session?.skip(); });
    d.btnGuidedBack.addEventListener('click', () => this.session?.back());
    d.btnGuidedRepeat.addEventListener('click', () => { this.speaker.speak('Repeating.'); this.session?.repeat(); });
    d.btnGuidedSlower.addEventListener('click', () => this.session?.adjustTempo('slower'));
    d.btnGuidedFaster.addEventListener('click', () => this.session?.adjustTempo('faster'));
    d.btnGuidedVoice.addEventListener('click', () => this.toggleSpeech());
    d.btnGuidedMic.addEventListener('click', () => this.toggleMic());
    // Tapping the countdown ring is a quick pause/resume target.
    d.timerContainer.addEventListener('click', () => this.session?.togglePause());

    d.btnExitRoutine.addEventListener('click', () => this.requestExit());
    d.btnExitResume.addEventListener('click', () => {
      this.view.showExitConfirm(false);
      this.session?.togglePause(); // will resume since it's paused
    });
    d.btnExitEnd.addEventListener('click', () => this.exitRoutine());

    // Both the button and tapping the illustration flip vector <-> example photo.
    d.btnToggleOriginal?.addEventListener('click', () => this.toggleOriginal());
    d.activeIllustration?.addEventListener('click', () => this.toggleOriginal());
    d.btnSummaryToggleOriginal?.addEventListener('click', () => this.toggleOriginal());
    d.summaryPreview?.addEventListener('click', () => this.toggleOriginal());

    d.btnPrevFrame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onPrevFrame();
    });
    d.btnNextFrame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onNextFrame();
    });
    d.btnSummaryPrevFrame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onPrevFrame();
    });
    d.btnSummaryNextFrame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onNextFrame();
    });

    d.painSlider.addEventListener('input', (e) => { d.painValueDisplay.textContent = e.target.value; });
    d.btnSaveSession.addEventListener('click', () => this.saveRoutineSession());
    d.btnBackHome.addEventListener('click', () => this.goDashboard());

    d.btnOpenStats.addEventListener('click', () => {
      this.view.showScreen('stats');
      this.view.renderStats(this.store.history);
    });
    d.btnCloseStats.addEventListener('click', () => this.goDashboard());

    // Keyboard fallback (only active while the routine screen is showing).
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  /* ---- theme ---- */

  toggleTheme() {
    const next = this.view.dom.body.classList.contains('dark-theme') ? 'light' : 'dark';
    this.store.setTheme(next);
    this.view.applyTheme(next);
  }

  /* ---- dashboard ---- */

  goDashboard() {
    this._destroySession();
    this.view.showScreen('dashboard');
    this.store.refreshCompletedToday();
    const completedSlugs = this.store.completedTodaySlugs;
    this.view.renderDashboard({
      greeting: greetingNow(),
      completedToday: this.store.completedToday(),
      completedCount: completedSlugs.length,
      completedSlugs,
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

    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.view.buildDots(ex.example_image_count, (i) => this.onDotClick(i), 'summary');
    this.renderFrame();
    this.startFrameAnimator(ex.example_image_count);
  }

  clinicianNote(ex) {
    const notes = [...(ex.notes || [])];
    if (ex.category === 'isometric' && this.program.clinician_notes) {
      const alreadyMentioned = notes.some((n) => n.includes('3-4" holds'));
      if (!alreadyMentioned) {
        const iso = this.program.clinician_notes.find((n) => n.includes('3-4" holds'));
        if (iso) notes.push(iso);
      }
    }
    return notes.length ? notes.join(' • ') : null;
  }

  /* ---- frame animator (illustration carousel) ---- */

  renderFrame() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    const kind = this.showingOriginal ? 'example' : 'vector';
    const mode = this.view.isSummaryActive() ? 'summary' : 'routine';
    this.view.renderFrame(`${ex.folder}/${kind}-${this.activeFrameIndex}.png`, this.activeFrameIndex, mode);
  }

  startFrameAnimator(count) {
    this.stopFrameAnimator();
    if (count <= 1) return;
    this.animatorInterval = setInterval(() => {
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
    this.startFrameAnimator(this.exercises[this.currentExIndex].example_image_count);
  }

  onPrevFrame() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex || ex.example_image_count <= 1) return;
    this.activeFrameIndex = this.activeFrameIndex <= 1 ? ex.example_image_count : this.activeFrameIndex - 1;
    this.renderFrame();
    this.startFrameAnimator(ex.example_image_count);
  }

  onNextFrame() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex || ex.example_image_count <= 1) return;
    this.activeFrameIndex = this.activeFrameIndex >= ex.example_image_count ? 1 : this.activeFrameIndex + 1;
    this.renderFrame();
    this.startFrameAnimator(ex.example_image_count);
  }

  toggleOriginal() {
    this.showingOriginal = !this.showingOriginal;
    const mode = this.view.isSummaryActive() ? 'summary' : 'routine';
    this.view.setOriginalToggle(this.showingOriginal, mode);
    this.renderFrame();
  }

  /* ============================================================
     HANDS-FREE GUIDED AUTOPILOT
     ============================================================ */

  startGuidedRoutine(fromIndex) {
    audio.init();
    if (!this.sessionActive) {
      this.sessionActive = true;
      this.sessionStartTime = new Date();
    }

    this.currentExIndex = fromIndex;
    this.view.showExitConfirm(false);
    this.view.setSpeechMuted(this.speaker.muted);
    this.view.showScreen('routine');
    this.startVoice();

    // Create the session with persisted pacing and listen for events.
    this.session = new RoutineSession({
      exercises: this.exercises,
      startIndex: fromIndex,
      pacing: this.store.getPacing(),
      onEvent: (type, state) => this._onSessionEvent(type, state),
    });
    this.session.start();
  }

  /**
   * Centralised RoutineSession event handler. Maps session state updates
   * to view calls and audio/speech cues.
   */
  _onSessionEvent(type, state) {
    switch (type) {
      case 'exercise-load':
        this._onExerciseLoad(state);
        break;

      case 'phase-enter':
        this._onPhaseEnter(state);
        break;

      case 'phase-tick':
        this._onPhaseTick(state);
        break;

      case 'pause':
        this.view.setGuidedPaused(true);
        this.view.setBreathing('idle');
        this.speaker.speak('Paused.');
        break;

      case 'resume': {
        this.view.setGuidedPaused(false);
        const { activePhase, phaseTotal, phaseRemaining } = state;
        if (activePhase) {
          this.view.renderGuidedPhase(this.phaseDisplay(activePhase), phaseTotal, phaseRemaining);
          if (activePhase.breathing) this._updateBreath(state);
        }
        this.speaker.speak('Resuming.');
        break;
      }

      case 'tempo-change':
        this.view.setTempoLabel(1 / state.tempoScale);
        break;

      case 'hold-complete':
        audio.playChime();
        break;

      case 'exercise-complete':
        if (state.completedSlug) {
          this.store.markExerciseCompletedToday(state.completedSlug);
        }
        break;

      case 'session-complete':
        this.speaker.speak('Routine complete. Great work.');
        this._destroySession();
        this.promptPostSessionSurvey();
        break;

      default:
        break;
    }
  }

  /** Called when session loads a new exercise — syncs view meta, illustration, dots. */
  _onExerciseLoad(state) {
    const ex = state.activeExercise;
    if (!ex) return;
    this.currentExIndex = state.currentIndex;

    this.view.renderRoutineMeta(
      ex,
      state.currentIndex,
      this.exercises.length,
      this.clinicianNote(ex),
      'guided',
    );
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.renderFrame();
    this.view.buildDots(ex.example_image_count, (i) => this.onDotClick(i));
    this.stopFrameAnimator();

    this.view.setGuidedPaused(false);
    this.view.setTempoLabel(1 / state.tempoScale);
  }

  /** Called each time a new coaching phase begins. */
  _onPhaseEnter(state) {
    const { activePhase, phaseTotal } = state;
    if (!activePhase) return;

    this.view.renderGuidedPhase(this.phaseDisplay(activePhase), phaseTotal);
    this.speaker.speak(activePhase.say);

    if (activePhase.type === 'rep' && !activePhase.isometric) audio.playTick();
    if (activePhase.breathing) this._updateBreath(state);
    else this.view.setBreathing('idle');

    // Dim the active illustration on rest/prepare/switch, full color on holds/reps
    const isEffort = activePhase.type === 'hold' || activePhase.type === 'rep';
    this.view.setIllustrationDimmed(!isEffort);

    // Frame illustration control based on dynamic vs static hold
    const ex = state.activeExercise;
    if (ex) {
      const isStatic = ex.category === 'stretch' || ex.category === 'isometric';
      if (isStatic) {
        // Stretches and isometrics: neutral position during prep/rest/switch, hold position during effort hold/rep
        this.activeFrameIndex = isEffort ? ex.example_image_count : 1;
        this.stopFrameAnimator();
        this.renderFrame();
      } else {
        // Dynamic dynamic movements: loop dynamic frames during rep effort, neutral during prep/rest/switch
        if (isEffort) {
          this.startFrameAnimator(ex.example_image_count);
        } else {
          this.activeFrameIndex = 1;
          this.stopFrameAnimator();
          this.renderFrame();
        }
      }

      // Render progress circles
      const progress = this.computeProgressModel(ex, activePhase, state.phaseIdx, this.session?.plan);
      this.view.renderProgressCircles(progress);
    }
  }

  /** Called each 1-second tick of an active phase. */
  _onPhaseTick(state) {
    const { activePhase, phaseTotal, phaseRemaining } = state;
    if (!activePhase) return;

    this.view.renderPhaseTime(phaseRemaining, phaseTotal);
    if (activePhase.breathing) this._updateBreath(state);
    if (activePhase.countdown && phaseRemaining <= 3) audio.playTick();
  }

  /** Map a plan phase to the banner/ring display model. */
  phaseDisplay(phase) {
    const sideTxt = phase.side ? (phase.side === 'left' ? 'Left side' : 'Right side') : '';
    switch (phase.type) {
      case 'announce':
        return { label: 'Get Ready', sub: sideTxt ? `${sideTxt} first` : '', side: phase.side, ringSub: 'ready' };
      case 'prepare':
        return { label: 'Get Into Position', sub: sideTxt, side: phase.side, ringSub: 'ready' };
      case 'switch':
        return { label: 'Switch Sides', sub: sideTxt ? `Now: ${sideTxt}` : '', side: phase.side, ringSub: 'switch' };
      case 'rest':
        return { label: 'Rest & Breathe', sub: `Set ${phase.set ?? ''}`.trim(), side: phase.side, ringSub: 'rest' };
      case 'hold':
        return { label: 'Hold', sub: sideTxt, side: phase.side, ringSub: 'hold' };
      case 'rep': {
        const label = phase.isometric
          ? `Rep ${phase.rep}/${phase.repsTotal} · Hold`
          : `Rep ${phase.rep} / ${phase.repsTotal}`;
        const sub = `Set ${phase.set}/${phase.setsTotal}${sideTxt ? ` · ${sideTxt}` : ''}`;
        return { label, sub, side: phase.side, ringSub: 'rep' };
      }
      case 'complete':
        return { label: 'Exercise Complete ✓', sub: '', side: null, ringSub: 'done' };
      default:
        return { label: '', sub: '', side: phase.side, ringSub: '' };
    }
  }

  _updateBreath(state) {
    const elapsed = state.phaseTotal - state.phaseRemaining;
    const inhaling = Math.floor(elapsed / 4) % 2 === 0;
    this.view.setBreathing(inhaling ? 'inhale' : 'exhale');
  }

  /** Tear down the active RoutineSession and stop all timers. */
  _destroySession() {
    if (this.session) {
      this.session.stop();
      this.session = null;
    }
    this.stopFrameAnimator();
    this.view.setBreathing('idle');
    this.view.renderProgressCircles(null);
    this.speaker.cancel();
    if (this.voice) this.voice.stop();
  }

  /* ---- voice control ---- */

  startVoice() {
    if (!this.voice) {
      this.voice = new VoiceCommander((cmd) => this.onVoiceCommand(cmd));
      this.voice.onError = () => this.view.setMicState('denied');
    }
    if (!this.voice.supported) { this.view.setMicState('unsupported'); return; }
    if (this.voiceEnabled) { this.voice.start(); this.view.setMicState('listening'); }
    else { this.view.setMicState('off'); }
  }

  /** Mute / unmute the spoken coaching (TTS). Tones from audio.js are unaffected. */
  toggleSpeech() {
    const muted = !this.speaker.muted;
    this.speaker.setMuted(muted);
    this.store.setSpeechMuted(muted);
    this.view.setSpeechMuted(muted);
  }

  toggleMic() {
    if (!this.voice || !this.voice.supported) return;
    if (this.voice.listening) {
      this.voice.stop();
      this.voiceEnabled = false;
      this.view.setMicState('off');
    } else {
      this.voice.start();
      this.voiceEnabled = true;
      this.view.setMicState('listening');
    }
  }

  onVoiceCommand(cmd) {
    if (!this.view.isRoutineActive()) return;
    switch (cmd) {
      case 'pause':   this.session?.togglePause(); break;
      case 'resume':  this.session?.togglePause(); break;
      case 'next':    this.speaker.speak('Skipping ahead.'); this.session?.skip(); break;
      case 'back':    this.session?.back(); break;
      case 'repeat':  this.speaker.speak('Repeating.'); this.session?.repeat(); break;
      case 'slower':  this.session?.adjustTempo('slower'); break;
      case 'faster':  this.session?.adjustTempo('faster'); break;
      default: return;
    }
    this.view.flashVoiceCommand();
  }

  /* ---- keyboard fallback ---- */

  onKeyDown(e) {
    if (!this.view.isRoutineActive()) return;
    switch (e.key) {
      case ' ': case 'Spacebar': e.preventDefault(); this.session?.togglePause(); break;
      case 'ArrowRight': this.speaker.speak('Skipping ahead.'); this.session?.skip(); break;
      case 'ArrowLeft':  this.session?.back(); break;
      case 'r': case 'R': this.speaker.speak('Repeating.'); this.session?.repeat(); break;
      case '-': case '_': this.session?.adjustTempo('slower'); break;
      case '+': case '=': this.session?.adjustTempo('faster'); break;
      case 'm': case 'M': this.toggleSpeech(); break;
      case 'Escape': this.requestExit(); break;
      default: break;
    }
  }

  /* ---- exit (inline confirm, no blocking dialog) ---- */

  requestExit() {
    if (this.store.getExitConfirmDismissed()) { this.exitRoutine(); return; }
    // Pause the session then show the confirm overlay.
    if (this.session && this.session.running) this.session.togglePause();
    this.view.showExitConfirm(true);
  }

  exitRoutine() {
    if (this.view.dom.exitDismissCheck?.checked) this.store.setExitConfirmDismissed(true);
    this.sessionActive = false;
    this.view.showExitConfirm(false);
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
    const completedCount = this.store.completedTodaySlugs.length;

    const { streak } = this.store.recordSession({
      date: new Date().toISOString(),
      duration_minutes: durationMinutes,
      pre_pain: this.preSessionPain,
      post_pain: postPain,
      exercises_completed: completedCount,
    });

    this.view.showCompletionSummary({ durationMinutes, painDelta: postPain - this.preSessionPain, streak });
    audio.playChime();
  }

  getSetRepProgress(plan, phaseIdx) {
    if (!plan) return null;
    for (let i = phaseIdx; i < plan.length; i++) {
      if (plan[i].set !== undefined && plan[i].rep !== undefined) {
        return {
          set: plan[i].set,
          setsTotal: plan[i].setsTotal,
          rep: plan[i].rep,
          repsTotal: plan[i].repsTotal
        };
      }
    }
    for (let i = phaseIdx; i >= 0; i--) {
      if (plan[i].set !== undefined && plan[i].rep !== undefined) {
        return {
          set: plan[i].set,
          setsTotal: plan[i].setsTotal,
          rep: plan[i].rep,
          repsTotal: plan[i].repsTotal
        };
      }
    }
    return null;
  }

  computeProgressModel(ex, phase, phaseIdx, plan) {
    if (!ex || !phase) return null;

    // 1. Hold-based exercise (no reps dosage, or only hold_seconds)
    if (ex.dosage && ex.dosage.hold_seconds) {
      let completedCount = 0;
      let active = false;
      
      if (ex.unilateral) {
        if (phase.side === 'left') {
          completedCount = 0;
          active = true;
        } else if (phase.side === 'right') {
          completedCount = 1;
          active = true;
        } else {
          if (phase.type === 'complete') {
            completedCount = 2;
            active = false;
          } else {
            completedCount = 0;
            active = false;
          }
        }
        return { type: 'sides', completedCount, active };
      }
    }

    // 2. Reps & Sets based exercise
    const progress = this.getSetRepProgress(plan, phaseIdx);
    if (progress) {
      const isRepActive = phase.type === 'rep';
      return {
        type: 'reps-sets',
        set: progress.set,
        setsTotal: progress.setsTotal,
        rep: progress.rep,
        repsTotal: progress.repsTotal,
        isRepActive
      };
    }

    return null;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.PTAppInstance = new NeckPTApp();
});
