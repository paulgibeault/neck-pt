/**
 * Neck PT Companion - Controller.
 *
 * Orchestrates the program flow and wires together the model (data + store),
 * the view (ui.js), the guided autopilot engine, audio cues and the speech
 * layer (TTS coaching + voice commands).
 *
 * Hands-free design: once a routine starts, a phase scheduler walks the whole
 * program automatically — announcing each exercise, counting reps, timing holds,
 * calling side switches, resting between sets and advancing exercises — speaking
 * every cue aloud. The user only intervenes to pause / skip / repeat / change
 * tempo, which they can do by voice, the spacebar, a tap, or the on-screen
 * buttons. No per-rep clicking and no blocking alert()/confirm() dialogs.
 */

import { PROGRAM } from './data.js';
import { audio } from './audio.js';
import { Store } from './store.js';
import { View } from './ui.js';
import { buildExercisePlan } from './engine.js';
import { Speaker, VoiceCommander } from './speech.js';
import { clamp, greeting as greetingNow } from './format.js';

const FRAME_INTERVAL_MS = 4500;
const TEMPO_STEP = 0.25;
const TEMPO_MIN = 0.5;  // fastest (durations × 0.5)
const TEMPO_MAX = 2.0;  // slowest (durations × 2)

class NeckPTApp {
  constructor() {
    this.program = PROGRAM;
    this.exercises = [...PROGRAM.exercises].sort((a, b) => a.order - b.order);

    this.store = new Store();
    this.view = new View();
    this.speaker = new Speaker();
    this.speaker.setMuted(this.store.getSpeechMuted()); // restore last mute preference
    this.voice = null;          // lazily created on first routine (needs a user gesture)
    this.voiceEnabled = false;  // off by default

    // transient session state
    this.currentExIndex = 0;
    this.sessionActive = false;
    this.sessionStartTime = null;
    this.preSessionPain = 5;
    this.currentSide = null;
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.animatorInterval = null;
    this.completedExercisesInSession = new Set();

    // guided autopilot state
    this.guidedPlan = [];
    this.guidedIdx = 0;
    this.guidedRunning = false;
    this.guidedTick = null;
    this.phaseRemaining = 0;
    this.phaseTotal = 0;
    this.tempoScale = 1; // duration multiplier; >1 = slower, <1 = faster

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

    // Guided transport controls.
    d.btnGuidedPause.addEventListener('click', () => this.toggleGuidedPause());
    d.btnGuidedSkip.addEventListener('click', () => this.skipExercise());
    d.btnGuidedBack.addEventListener('click', () => this.backExercise());
    d.btnGuidedRepeat.addEventListener('click', () => this.repeatExercise());
    d.btnGuidedSlower.addEventListener('click', () => this.adjustTempo('slower'));
    d.btnGuidedFaster.addEventListener('click', () => this.adjustTempo('faster'));
    d.btnGuidedVoice.addEventListener('click', () => this.toggleSpeech());
    d.btnGuidedMic.addEventListener('click', () => this.toggleMic());
    // Tapping the big countdown ring is a quick pause/resume target.
    d.timerContainer.addEventListener('click', () => this.toggleGuidedPause());

    d.btnExitRoutine.addEventListener('click', () => this.requestExit());
    d.btnExitResume.addEventListener('click', () => { this.view.showExitConfirm(false); this.resumeGuided(); });
    d.btnExitEnd.addEventListener('click', () => this.exitRoutine());

    // Both the button and tapping the illustration flip vector <-> example photo.
    d.btnToggleOriginal?.addEventListener('click', () => this.toggleOriginal());
    d.activeIllustration?.addEventListener('click', () => this.toggleOriginal());

    d.painSlider.addEventListener('input', (e) => { d.painValueDisplay.textContent = e.target.value; });
    d.btnSaveSession.addEventListener('click', () => this.saveRoutineSession());
    d.btnBackHome.addEventListener('click', () => this.goDashboard());

    d.btnOpenStats.addEventListener('click', () => { this.view.showScreen('stats'); this.view.renderStats(this.store.history); });
    d.btnCloseStats.addEventListener('click', () => this.goDashboard());

    // Keyboard fallback (only while the routine screen is showing).
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
    this.stopGuided();
    this.view.showScreen('dashboard');
    this.store.refreshCompletedToday();
    const completedToday = this.store.completedToday();
    const completedSlugs = this.store.completedTodaySlugs;
    this.view.renderDashboard({
      greeting: greetingNow(),
      completedToday,
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
    this.completedExercisesInSession = new Set();
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

  clinicianNote(ex) {
    const notes = [...(ex.notes || [])];
    // Surface the "3-4\" holds" guidance for isometrics — but only if the
    // exercise's own notes don't already mention it, so we never show it twice.
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
    this.startFrameAnimator(this.exercises[this.currentExIndex].example_image_count);
  }

  toggleOriginal() {
    this.showingOriginal = !this.showingOriginal;
    this.view.setOriginalToggle(this.showingOriginal);
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
      this.completedExercisesInSession = new Set();
    }
    this.currentExIndex = fromIndex;
    this.tempoScale = 1;
    this.view.setTempoLabel(1 / this.tempoScale);
    this.view.showExitConfirm(false);
    this.view.setSpeechMuted(this.speaker.muted);
    this.view.showScreen('routine');
    this.startVoice();
    if (!this.guidedTick) this.guidedTick = setInterval(() => this.guidedStep(), 1000);
    this.loadGuidedExercise();
  }

  loadGuidedExercise() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) { this.finishGuidedRoutine(); return; }

    this.guidedPlan = buildExercisePlan(ex);
    this.guidedIdx = 0;

    this.view.renderRoutineMeta(ex, this.currentExIndex, this.exercises.length, this.clinicianNote(ex), 'guided');
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.renderFrame();
    this.view.buildDots(ex.example_image_count, (i) => this.onDotClick(i));
    this.startFrameAnimator(ex.example_image_count);

    this.guidedRunning = true;
    this.view.setGuidedPaused(false);
    this.enterPhase();
  }

  /** Duration of a phase after applying the user's tempo (holds stay prescribed). */
  effectiveDuration(phase) {
    const scalable = ['rep', 'prepare', 'switch', 'rest'].includes(phase.type);
    return Math.max(1, Math.round(phase.durationSec * (scalable ? this.tempoScale : 1)));
  }

  enterPhase() {
    const phase = this.guidedPlan[this.guidedIdx];
    if (!phase) { this.advanceToNextExercise(); return; }

    this.currentSide = phase.side;
    this.phaseTotal = this.effectiveDuration(phase);
    this.phaseRemaining = this.phaseTotal;

    this.view.renderGuidedPhase(this.phaseDisplay(phase), this.phaseTotal);
    this.speaker.speak(phase.say);

    if (phase.type === 'rep' && !phase.isometric) audio.playTick();
    if (phase.breathing) this.updateBreath(); else this.view.setBreathing('idle');
  }

  guidedStep() {
    if (!this.guidedRunning) return;
    const phase = this.guidedPlan[this.guidedIdx];
    if (!phase) return;

    this.phaseRemaining -= 1;

    if (this.phaseRemaining > 0) {
      this.view.renderPhaseTime(this.phaseRemaining, this.phaseTotal);
      if (phase.breathing) this.updateBreath();
      if (phase.countdown && this.phaseRemaining <= 3) audio.playTick();
      return;
    }

    // Phase finished.
    if (phase.type === 'hold') audio.playChime();
    this.nextPhase();
  }

  nextPhase() {
    this.guidedIdx += 1;
    if (this.guidedIdx >= this.guidedPlan.length) {
      const ex = this.exercises[this.currentExIndex];
      if (ex) {
        this.completedExercisesInSession.add(ex.slug);
        this.store.markExerciseCompletedToday(ex.slug);
      }
      this.advanceToNextExercise();
    } else {
      this.enterPhase();
    }
  }

  advanceToNextExercise() {
    this.currentExIndex += 1;
    if (this.currentExIndex >= this.exercises.length) {
      this.finishGuidedRoutine();
    } else {
      this.loadGuidedExercise();
    }
  }

  finishGuidedRoutine() {
    this.speaker.speak('Routine complete. Great work.');
    this.stopGuided();
    this.promptPostSessionSurvey();
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

  updateBreath() {
    const elapsed = this.phaseTotal - this.phaseRemaining;
    const inhaling = Math.floor(elapsed / 4) % 2 === 0;
    this.view.setBreathing(inhaling ? 'inhale' : 'exhale');
  }

  /* ---- guided controls ---- */

  toggleGuidedPause() {
    if (!this.view.isRoutineActive()) return;
    if (this.guidedRunning) this.pauseGuided();
    else this.resumeGuided();
  }

  pauseGuided() {
    if (!this.guidedRunning) return;
    this.guidedRunning = false;
    this.view.setGuidedPaused(true);
    this.view.setBreathing('idle');
    this.speaker.speak('Paused.');
  }

  resumeGuided() {
    if (this.guidedRunning || !this.guidedPlan.length) return;
    this.guidedRunning = true;
    this.view.setGuidedPaused(false);
    const phase = this.guidedPlan[this.guidedIdx];
    if (phase) {
      this.view.renderGuidedPhase(this.phaseDisplay(phase), this.phaseTotal, this.phaseRemaining);
      if (phase.breathing) this.updateBreath();
    }
    this.speaker.speak('Resuming.');
  }

  skipExercise() {
    if (!this.view.isRoutineActive()) return;
    this.speaker.speak('Skipping ahead.');
    this.advanceToNextExercise();
  }

  backExercise() {
    if (!this.view.isRoutineActive()) return;
    // Past the opening announce → restart the current exercise; otherwise step back one.
    if (this.guidedIdx > 1) { this.repeatExercise(); return; }
    this.currentExIndex = Math.max(0, this.currentExIndex - 1);
    this.loadGuidedExercise();
  }

  repeatExercise() {
    if (!this.view.isRoutineActive()) return;
    this.speaker.speak('Repeating.');
    this.loadGuidedExercise();
  }

  adjustTempo(dir) {
    const delta = dir === 'slower' ? TEMPO_STEP : -TEMPO_STEP;
    this.tempoScale = clamp(Math.round((this.tempoScale + delta) * 100) / 100, TEMPO_MIN, TEMPO_MAX);
    this.view.setTempoLabel(1 / this.tempoScale);
    this.speaker.speak(dir === 'slower' ? 'Slower.' : 'Faster.');
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
    this.speaker.setMuted(muted); // setMuted(true) also cancels any current utterance
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
      case 'pause': this.pauseGuided(); break;
      case 'resume': this.resumeGuided(); break;
      case 'next': this.skipExercise(); break;
      case 'back': this.backExercise(); break;
      case 'repeat': this.repeatExercise(); break;
      case 'slower': this.adjustTempo('slower'); break;
      case 'faster': this.adjustTempo('faster'); break;
      default: return;
    }
    this.view.flashVoiceCommand();
  }

  /* ---- keyboard fallback ---- */

  onKeyDown(e) {
    if (!this.view.isRoutineActive()) return;
    switch (e.key) {
      case ' ': case 'Spacebar': e.preventDefault(); this.toggleGuidedPause(); break;
      case 'ArrowRight': this.skipExercise(); break;
      case 'ArrowLeft': this.backExercise(); break;
      case 'r': case 'R': this.repeatExercise(); break;
      case '-': case '_': this.adjustTempo('slower'); break;
      case '+': case '=': this.adjustTempo('faster'); break;
      case 'm': case 'M': this.toggleSpeech(); break;
      case 'Escape': this.requestExit(); break;
      default: break;
    }
  }

  /* ---- exit (inline confirm, no blocking dialog) ---- */

  requestExit() {
    // If the user previously chose "Don't ask again", leave immediately.
    if (this.store.getExitConfirmDismissed()) { this.exitRoutine(); return; }
    this.pauseGuided();
    this.view.showExitConfirm(true);
  }

  exitRoutine() {
    if (this.view.dom.exitDismissCheck?.checked) this.store.setExitConfirmDismissed(true);
    this.sessionActive = false;
    this.view.showExitConfirm(false);
    this.goDashboard();
  }

  stopGuided() {
    this.guidedRunning = false;
    if (this.guidedTick) { clearInterval(this.guidedTick); this.guidedTick = null; }
    this.stopFrameAnimator();
    this.view.setBreathing('idle');
    this.speaker.cancel();
    if (this.voice) this.voice.stop();
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

    const completedCount = this.completedExercisesInSession ? this.completedExercisesInSession.size : this.exercises.length;

    const { streak } = this.store.recordSession({
      date: new Date().toISOString(),
      duration_minutes: durationMinutes,
      pre_pain: this.preSessionPain,
      post_pain: postPain,
      exercises_completed: completedCount,
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
