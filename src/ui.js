/**
 * Neck PT Companion - View layer.
 *
 * Owns the DOM cache and every DOM mutation. Contains no program logic or
 * timers — the controller (app.js) calls these render methods with plain data.
 */

import { formatDosageShort, dosagePills, painToY, CHART, CHART_GRIDLINES } from './format.js';

const SVG_PHOTO = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
const SVG_PEN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;

// SVG ring circumferences (computed, not hardcoded): C = 2πr.
const RADIAL_C = 2 * Math.PI * 14; // dashboard progress ring
const TIMER_C = 2 * Math.PI * 36;  // routine countdown ring

export class View {
  constructor() {
    const $ = (id) => document.getElementById(id);
    this.dom = {
      body: document.body,
      btnTheme: $('btn-toggle-theme'),

      // dashboard
      welcomeTitle: $('dashboard-welcome-title'),
      welcomeDesc: $('dashboard-welcome-desc'),
      radialFill: $('radial-progress-fill'),
      radialText: $('radial-progress-text'),
      statCompleted: $('stat-completed'),
      statStreak: $('stat-streak'),
      statTime: $('stat-time'),
      btnStartSession: $('btn-start-session'),
      exercisesContainer: $('exercises-container'),
      chkAutoplay: $('chk-autoplay'),

      // pre-session pain
      prePainSlider: $('pre-pain-slider'),
      prePainValue: $('pre-pain-value'),
      btnPrePainBegin: $('btn-pre-pain-begin'),
      btnPrePainBack: $('btn-pre-pain-back'),

      // routine
      btnExitRoutine: $('btn-exit-routine'),
      routineProgressBar: $('routine-progress-bar-fill'),
      stepCounter: $('routine-step-counter'),
      btnToggleOriginal: $('btn-toggle-original-photo'),
      activeIllustration: $('routine-active-illustration'),
      frameDotsContainer: $('routine-frame-dots-container'),
      btnPrevFrame: $('btn-routine-prev-frame'),
      btnNextFrame: $('btn-routine-next-frame'),
      progressCircles: $('routine-progress-circles'),
      activeCategory: $('routine-active-category'),
      guidedSide: $('routine-guided-side'),
      activeTitle: $('routine-active-title'),
      dosagePills: $('routine-dosage-pills'),
      handwrittenNote: $('routine-clinician-handwritten-note'),
      breathingRing: $('breathing-ring'),
      timerContainer: document.querySelector('.timer-container'),
      timerProgressFill: $('timer-progress-fill'),
      timerDigits: $('timer-digits'),
      timerSubtext: $('timer-subtext'),
      repsSetsBox: $('reps-sets-interactive-box'),
      activeRepCount: $('active-rep-count'),
      activeSetCount: $('active-set-count'),
      btnRepTick: $('btn-rep-tick'),

      // hands-free guided controls
      guidedStatus: $('guided-status'),
      guidedStatusLabel: $('guided-status-label'),
      guidedStatusSub: $('guided-status-sub'),
      btnGuidedBack: $('btn-guided-back'),
      btnGuidedPause: $('btn-guided-pause'),
      btnGuidedSkip: $('btn-guided-skip'),
      gcPauseIcon: $('gc-pause-icon'),
      gcPlayIcon: $('gc-play-icon'),
      btnGuidedRepeat: $('btn-guided-repeat'),
      btnGuidedSlower: $('btn-guided-slower'),
      btnGuidedFaster: $('btn-guided-faster'),
      guidedTempo: $('guided-tempo'),
      btnGuidedMic: $('btn-guided-mic'),
      micState: $('mic-state'),
      btnGuidedVoice: $('btn-guided-voice'),
      voiceOutState: $('voice-out-state'),
      gcVoiceOnIcon: $('gc-voice-on-icon'),
      gcVoiceOffIcon: $('gc-voice-off-icon'),
      guidedControlsSecondary: document.querySelector('.guided-controls-secondary'),
      exitConfirm: $('guided-exit-confirm'),
      exitDismissCheck: $('exit-confirm-dismiss-check'),
      btnExitResume: $('btn-exit-resume'),
      btnExitEnd: $('btn-exit-end'),

      detailSetup: $('routine-detail-setup'),
      detailMovement: $('routine-detail-movement'),
      detailTipBox: $('routine-detail-tip-box'),
      detailTip: $('routine-detail-tip'),

      // completion
      painSurveyBox: $('pain-survey-box'),
      painSlider: $('pain-slider'),
      painValueDisplay: $('pain-value-display'),
      btnSaveSession: $('btn-save-session-data'),
      completionSummaryBox: $('completion-summary-box'),
      summaryDuration: $('summary-duration'),
      summaryPainDelta: $('summary-pain-delta'),
      summaryPainContainer: $('summary-pain-alleviation-container'),
      summaryStreak: $('summary-streak'),
      btnBackHome: $('btn-complete-back-home'),

      // stats
      btnOpenStats: $('btn-toggle-stats'),
      btnCloseStats: $('btn-close-stats'),
      historyLogsContainer: $('history-logs-container'),
      chartLinePath: $('chart-line-path'),
      chartDotsGroup: $('chart-dots-group'),
      chartGridGroup: $('chart-grid-group'),
    };

    this.screens = {
      dashboard: $('screen-dashboard'),
      prePain: $('screen-pre-pain'),
      routine: $('screen-routine'),
      completion: $('screen-completion'),
      stats: $('screen-stats'),
    };

    // Initialise ring dasharrays from computed circumferences.
    this.dom.radialFill.setAttribute('stroke-dasharray', `${RADIAL_C} ${RADIAL_C}`);
    this.dom.timerProgressFill.setAttribute('stroke-dasharray', `${TIMER_C} ${TIMER_C}`);

    // Initialise instructions tabs listeners (mobile tabbed mode)
    const tabBtns = document.querySelectorAll('.instruction-tabs-bar .tab-btn');
    const instructionCard = document.querySelector('.routine-instruction-card');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        if (instructionCard) {
          instructionCard.setAttribute('data-active-tab', tabName);
        }
      });
    });
  }

  /* ---- theme & routing ---- */

  applyTheme(theme) {
    // theme: 'light' | 'dark' | null (null → follow OS preference)
    const resolved = theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.dom.body.classList.toggle('dark-theme', resolved === 'dark');
    this.dom.body.classList.toggle('light-theme', resolved !== 'dark');
  }

  showScreen(name) {
    Object.values(this.screens).forEach((s) => s.classList.remove('active'));
    this.screens[name]?.classList.add('active');

    // Toggle header views: active workout gets the routine stepper header view
    const isRoutine = name === 'routine';
    const headerBrand = document.getElementById('header-brand-view');
    const headerRoutine = document.getElementById('header-routine-view');
    if (headerBrand && headerRoutine) {
      headerBrand.classList.toggle('active', !isRoutine);
      headerRoutine.classList.toggle('active', isRoutine);
    }

    // Toggle immersive mode (which hides the top header completely) for summary/survey/pre-pain
    const isImmersive = ['completion', 'prePain'].includes(name);
    this.dom.body.classList.toggle('immersive-mode', isImmersive);
  }

  /* ---- dashboard ---- */

  renderDashboard(model, onCardClick) {
    this.dom.welcomeTitle.textContent = model.greeting;

    const pct = model.total > 0 ? Math.round((model.completedCount / model.total) * 100) : 0;
    this.dom.radialFill.style.strokeDashoffset = RADIAL_C - (RADIAL_C * pct) / 100;
    this.dom.radialText.textContent = `${pct}%`;
    this.dom.statCompleted.textContent = `${model.completedCount}/${model.total}`;
    this.dom.statStreak.textContent = model.streak;
    this.dom.statTime.textContent = `${model.activeMinutes}m`;

    this.dom.exercisesContainer.innerHTML = '';
    model.exercises.forEach((ex, idx) => {
      const card = document.createElement('div');
      const isCompleted = model.completedSlugs ? model.completedSlugs.includes(ex.slug) : model.completedToday;
      card.className = `exercise-card card ${isCompleted ? 'completed' : ''}`;
      const status = isCompleted ? '✓' : idx + 1;
      card.innerHTML = `
        <div class="ex-thumb">
          <img src="${ex.folder}/vector-1.png" alt="" loading="lazy">
        </div>
        <div class="ex-info">
          <div class="ex-title">${ex.title}</div>
          <div class="ex-meta">
            <span class="ex-badge badge-${ex.category}">${ex.category}</span>
            <span>${formatDosageShort(ex.dosage)}</span>
          </div>
        </div>
        <div class="ex-status-icon">${status}</div>`;
      card.addEventListener('click', () => onCardClick(idx));
      this.dom.exercisesContainer.appendChild(card);
    });
  }

  /* ---- pre-session pain ---- */

  setPrePain(value) {
    this.dom.prePainSlider.value = value;
    this.dom.prePainValue.textContent = value;
  }

  /* ---- routine ---- */

  renderRoutineMeta(ex, idx, total, clinicianNote, mode) {
    this.dom.routineProgressBar.style.width = `${(idx / total) * 100}%`;
    this.dom.stepCounter.textContent = `Ex ${idx + 1} of ${total}`;
    this.dom.activeTitle.textContent = ex.title;
    this.dom.activeCategory.textContent = ex.category;
    this.dom.activeCategory.className = `ex-badge badge-${ex.category}`;
    this.dom.detailSetup.textContent = ex.setup || 'Neutral sitting posture.';
    this.dom.detailMovement.textContent = ex.movement;
    this._setTip(this.dom.detailTipBox, this.dom.detailTip, ex.tip);
    this._renderPills(this.dom.dosagePills, dosagePills(ex.dosage));
    this._setNote(this.dom.handwrittenNote, clinicianNote);

    this.setOriginalToggle(false);

    // Reset active tab to Setup on mobile
    const instructionCard = document.querySelector('.routine-instruction-card');
    if (instructionCard) {
      instructionCard.setAttribute('data-active-tab', 'setup');
    }
    const tabBtns = document.querySelectorAll('.instruction-tabs-bar .tab-btn');
    tabBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === 'setup');
    });

    // Hide or show the Tip tab button based on whether ex has a tip
    const tabBtnTip = document.getElementById('tab-btn-tip');
    if (tabBtnTip) {
      tabBtnTip.style.display = ex.tip ? 'flex' : 'none';
    }

    // Hands-free guided mode drives one universal countdown ring for every
    // phase (get-ready / hold / rep / rest), so the manual rep button and its
    // box stay hidden — the ring + status banner carry all the per-step info.
    this.dom.repsSetsBox.style.display = 'none';
    this.dom.timerContainer.style.display = 'flex';
    this.dom.exitConfirm.style.display = 'none';
    if (this.dom.activeIllustration) {
      this.dom.activeIllustration.classList.remove('mirrored');
    }
    this.setBreathing('idle');
  }

  /* ---- hands-free guided rendering ---- */

  /** Render the current phase: big status banner + side chip + countdown ring. */
  renderGuidedPhase(display, totalSeconds, remainingSeconds = totalSeconds) {
    this.dom.guidedStatusLabel.textContent = display.label;
    this.dom.guidedStatusSub.textContent = display.sub || '';
    this.updateSide(display.side);
    this.setTimerDisplay(remainingSeconds, totalSeconds, display.ringSub);
  }

  /** Per-tick ring/seconds refresh without touching the (unchanged) label. */
  renderPhaseTime(remainingSeconds, totalSeconds) {
    this.setTimerDisplay(remainingSeconds, totalSeconds, null);
  }

  setGuidedPaused(paused) {
    this.dom.guidedStatus.classList.toggle('is-paused', paused);
    this.dom.btnGuidedPause.classList.toggle('is-paused', paused);
    this.dom.gcPauseIcon.style.display = paused ? 'none' : 'block';
    this.dom.gcPlayIcon.style.display = paused ? 'block' : 'none';
    this.dom.btnGuidedPause.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
  }

  // state: 'listening' | 'off' | 'denied' | 'unsupported'
  setMicState(state) {
    const labels = { listening: 'Listening', off: 'Mic off', denied: 'Mic blocked', unsupported: 'No mic' };
    if (this.dom.micState) this.dom.micState.textContent = labels[state] || 'Mic';
    this.dom.btnGuidedMic.dataset.state = state;
    this.dom.btnGuidedMic.setAttribute('aria-pressed', state === 'listening' ? 'true' : 'false');
    this.dom.btnGuidedMic.setAttribute('title', `Voice Control: ${labels[state] || 'Mic'}`);

    // Show/hide voice command hints based on voice control state
    const hint = document.getElementById('guided-voice-hint');
    if (hint) {
      hint.style.display = state === 'listening' ? 'block' : 'none';
    }
  }

  // muted = true → spoken coaching is silenced (crossed-out speaker + "Muted").
  setSpeechMuted(muted) {
    if (this.dom.voiceOutState) this.dom.voiceOutState.textContent = muted ? 'Muted' : 'Voice';
    this.dom.btnGuidedVoice.dataset.state = muted ? 'muted' : 'on';
    this.dom.btnGuidedVoice.setAttribute('aria-pressed', muted ? 'true' : 'false');
    this.dom.btnGuidedVoice.setAttribute('title', muted ? 'Unmute Spoken Coaching (M)' : 'Mute Spoken Coaching (M)');
    this.dom.gcVoiceOnIcon.style.display = muted ? 'none' : 'block';
    this.dom.gcVoiceOffIcon.style.display = muted ? 'block' : 'none';
  }

  setTempoLabel(speed) {
    // `speed` is relative to nominal tempo: <1 slower, >1 faster.
    this.dom.guidedTempo.textContent = `${speed.toFixed(1)}×`;
  }

  flashVoiceCommand() {
    const el = this.dom.guidedControlsSecondary;
    if (!el) return;
    el.classList.remove('cmd-flash');
    void el.offsetWidth; // restart the animation
    el.classList.add('cmd-flash');
  }

  showExitConfirm(show) {
    this.dom.exitConfirm.style.display = show ? 'flex' : 'none';
    // Reset the "don't ask again" tick each time the sheet opens.
    if (show && this.dom.exitDismissCheck) this.dom.exitDismissCheck.checked = false;
  }

  isRoutineActive() {
    return this.screens.routine.classList.contains('active');
  }

  setTimerDisplay(secondsLeft, total, subtext) {
    this.dom.timerDigits.textContent = secondsLeft;
    if (subtext != null) this.dom.timerSubtext.textContent = subtext;
    const ratio = total > 0 ? secondsLeft / total : 0;
    this.dom.timerProgressFill.style.strokeDashoffset = TIMER_C - TIMER_C * ratio;
  }

  setTimerText(digits, subtext) {
    this.dom.timerDigits.textContent = digits;
    this.dom.timerSubtext.textContent = subtext;
  }

  setBreathing(phase) {
    // phase: 'inhale' | 'exhale' | 'idle'
    this.dom.breathingRing.className = phase === 'idle' ? 'breathing-ring' : `breathing-ring ${phase}`;
  }

  updateRepCounters(state) {
    this.dom.activeRepCount.textContent = state.repsLeft;
    this.dom.activeSetCount.textContent = state.setsLeft;
  }

  updateSide(side) {
    if (!side) {
      this.dom.guidedSide.style.display = 'none';
      if (this.dom.activeIllustration) {
        this.dom.activeIllustration.classList.remove('mirrored');
      }
      return;
    }
    this.dom.guidedSide.style.display = 'inline-block';
    this.dom.guidedSide.textContent = side === 'left' ? 'Left Side' : 'Right Side';
    this.dom.guidedSide.className = side === 'left' ? 'ex-badge badge-stretch' : 'ex-badge badge-nerve-glide';
    if (this.dom.activeIllustration) {
      this.dom.activeIllustration.classList.toggle('mirrored', side === 'right');
    }
  }

  setRepButton(text, disabled) {
    this.dom.btnRepTick.textContent = text;
    this.dom.btnRepTick.disabled = !!disabled;
  }

  /* ---- frames / illustration ---- */

  renderFrame(src, activeIndex) {
    const img = this.dom.activeIllustration;
    const dotsContainer = this.dom.frameDotsContainer;
    // Crossfade: fade out, swap, fade back in once the new frame is paint-ready.
    if (img && img.getAttribute('src') !== src) {
      img.style.opacity = '0';
      img.src = src;
      const reveal = () => { img.style.opacity = '1'; };
      if (img.decode) img.decode().then(reveal).catch(reveal);
      else img.onload = reveal;
    }
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.frame-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex - 1);
      });
    }
  }

  setFrameNavVisibility(visible) {
    const btnPrev = this.dom.btnPrevFrame;
    const btnNext = this.dom.btnNextFrame;
    if (btnPrev && btnNext) {
      const displayStyle = visible ? 'flex' : 'none';
      btnPrev.style.display = displayStyle;
      btnNext.style.display = displayStyle;
    }
  }

  buildDots(count, onDotClick) {
    const dotsContainer = this.dom.frameDotsContainer;
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const hasMultiple = count > 1;
    this.setFrameNavVisibility(hasMultiple);
    if (!hasMultiple) return;
    for (let i = 1; i <= count; i++) {
      const dot = document.createElement('div');
      dot.className = `frame-dot ${i === 1 ? 'active' : ''}`;
      dot.addEventListener('click', () => onDotClick(i));
      dotsContainer.appendChild(dot);
    }
  }

  setOriginalToggle(showingOriginal) {
    const btnToggle = this.dom.btnToggleOriginal;
    if (btnToggle) {
      btnToggle.innerHTML = showingOriginal ? SVG_PEN : SVG_PHOTO;
      const label = showingOriginal ? 'View Drawing' : 'View Photo';
      btnToggle.setAttribute('aria-label', label);
      btnToggle.setAttribute('title', label);
    }
  }

  /* ---- completion ---- */

  showPainSurvey(prePain) {
    this.dom.painSurveyBox.style.display = 'flex';
    this.dom.completionSummaryBox.style.display = 'none';
    this.dom.painSlider.value = prePain;
    this.dom.painValueDisplay.textContent = prePain;
  }

  showCompletionSummary({ durationMinutes, painDelta, streak }) {
    this.dom.summaryDuration.textContent = `${durationMinutes}m`;
    if (painDelta < 0) {
      this.dom.summaryPainDelta.textContent = painDelta;
      this.dom.summaryPainDelta.className = 'stat-val text-success';
    } else {
      this.dom.summaryPainDelta.textContent = painDelta > 0 ? `+${painDelta}` : '0';
      this.dom.summaryPainDelta.className = 'stat-val';
    }
    this.dom.summaryPainContainer.style.display = 'block';
    this.dom.summaryStreak.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
    this.dom.painSurveyBox.style.display = 'none';
    this.dom.completionSummaryBox.style.display = 'flex';
  }

  /* ---- stats ---- */

  renderStats(history) {
    this.dom.historyLogsContainer.innerHTML = '';
    this._renderChartGrid();

    if (history.length === 0) {
      this.dom.historyLogsContainer.innerHTML = `<div class="ex-meta" style="text-align:center; padding:20px 0; width:100%;">No sessions completed yet. Start your first session to begin logging.</div>`;
      this.dom.chartLinePath.setAttribute('d', '');
      this.dom.chartDotsGroup.innerHTML = '';
      return;
    }

    [...history].reverse().forEach((log) => {
      const row = document.createElement('div');
      row.className = 'history-log-row';
      const date = new Date(log.date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      let badge = 'mid';
      if (log.post_pain <= 2) badge = 'low';
      else if (log.post_pain >= 7) badge = 'high';
      row.innerHTML = `
        <div>
          <div class="history-log-date">${date}</div>
          <div class="history-log-details">${log.exercises_completed} exercises completed in ${log.duration_minutes}m</div>
        </div>
        <div class="pain-badge ${badge}">Pain: ${log.pre_pain} → ${log.post_pain}</div>`;
      this.dom.historyLogsContainer.appendChild(row);
    });

    const points = history.slice(-Math.min(7, history.length));
    const xStep = points.length > 1 ? (CHART.right - CHART.left) / (points.length - 1) : 0;
    let d = '';
    this.dom.chartDotsGroup.innerHTML = '';
    points.forEach((log, i) => {
      const x = CHART.left + i * xStep;
      const y = painToY(log.post_pain);
      d += `${i === 0 ? 'M' : ' L'} ${x} ${y}`;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', 5);
      c.setAttribute('fill', 'var(--color-accent)');
      c.setAttribute('stroke', 'var(--bg-card)');
      c.setAttribute('stroke-width', 2);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t.textContent = `Pain: ${log.post_pain} on ${new Date(log.date).toLocaleDateString()}`;
      c.appendChild(t);
      this.dom.chartDotsGroup.appendChild(c);
    });
    this.dom.chartLinePath.setAttribute('d', d);
  }

  // Gridlines + Y labels are generated from the real scale so they can't drift.
  _renderChartGrid() {
    const g = this.dom.chartGridGroup;
    if (!g) return;
    g.innerHTML = '';
    CHART_GRIDLINES.forEach((pain) => {
      const y = painToY(pain);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', CHART.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', CHART.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', pain === 0 ? 'var(--border-color)' : 'rgba(148,163,184,0.18)');
      if (pain !== 0) line.setAttribute('stroke-dasharray', '4');
      g.appendChild(line);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', CHART.left - 25);
      label.setAttribute('y', y + 3);
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '9');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = Number.isInteger(pain) ? pain : pain.toFixed(1);
      g.appendChild(label);
    });
  }

  setIllustrationDimmed(dimmed) {
    if (this.dom.activeIllustration) {
      this.dom.activeIllustration.classList.toggle('dimmed', !!dimmed);
    }
  }

  renderProgressCircles(progress) {
    const container = this.dom.progressCircles;
    if (!container) return;

    if (!progress) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = '';

    if (progress.type === 'sides') {
      const row = document.createElement('div');
      row.className = 'progress-circles-row';
      row.innerHTML = `<span class="progress-row-label">Sides</span>`;
      
      const list = document.createElement('div');
      list.className = 'circles-list';
      
      for (let i = 0; i < 2; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-circle-dot';
        if (i < progress.completedCount) {
          dot.classList.add('completed');
        } else if (i === progress.completedCount && progress.active) {
          dot.classList.add('active');
        }
        list.appendChild(dot);
      }
      row.appendChild(list);
      container.appendChild(row);
    } else if (progress.type === 'reps-sets') {
      // Sets row
      const setsRow = document.createElement('div');
      setsRow.className = 'progress-circles-row';
      setsRow.innerHTML = `<span class="progress-row-label">Sets</span>`;
      const setsList = document.createElement('div');
      setsList.className = 'circles-list';
      for (let s = 1; s <= progress.setsTotal; s++) {
        const dot = document.createElement('div');
        dot.className = 'progress-circle-dot';
        if (s < progress.set) {
          dot.classList.add('completed');
        } else if (s === progress.set) {
          dot.classList.add('active');
        }
        setsList.appendChild(dot);
      }
      setsRow.appendChild(setsList);
      container.appendChild(setsRow);

      // Reps row
      const repsRow = document.createElement('div');
      repsRow.className = 'progress-circles-row';
      repsRow.innerHTML = `<span class="progress-row-label">Reps</span>`;
      const repsList = document.createElement('div');
      repsList.className = 'circles-list';
      for (let r = 1; r <= progress.repsTotal; r++) {
        const dot = document.createElement('div');
        dot.className = 'progress-circle-dot';
        if (r < progress.rep) {
          dot.classList.add('completed');
        } else if (r === progress.rep && progress.isRepActive) {
          dot.classList.add('active');
        }
        repsList.appendChild(dot);
      }
      repsRow.appendChild(repsList);
      container.appendChild(repsRow);
    }
  }

  /* ---- shared helpers ---- */

  _setTip(box, el, tip) {
    if (tip) {
      box.style.display = 'flex';
      el.textContent = tip;
    } else {
      box.style.display = 'none';
    }
  }

  _setNote(el, note) {
    if (note) {
      el.style.display = 'block';
      el.textContent = note;
    } else {
      el.style.display = 'none';
    }
  }

  _renderPills(container, labels) {
    container.innerHTML = '';
    labels.forEach((text) => {
      const pill = document.createElement('span');
      pill.className = 'dosage-pill';
      pill.textContent = text;
      container.appendChild(pill);
    });
  }
}
