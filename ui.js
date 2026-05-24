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

      // pre-session pain
      prePainSlider: $('pre-pain-slider'),
      prePainValue: $('pre-pain-value'),
      btnPrePainBegin: $('btn-pre-pain-begin'),
      btnPrePainBack: $('btn-pre-pain-back'),

      // summary
      btnSummaryBack: $('btn-summary-back'),
      summaryBadge: $('summary-badge'),
      summaryStepCounter: $('summary-step-counter'),
      summaryPreview: $('summary-preview-illustration'),
      summaryTitle: $('summary-title'),
      summaryDosagePills: $('summary-dosage-pills'),
      summaryClinicianNote: $('summary-clinician-note'),
      summaryDetailSetup: $('summary-detail-setup'),
      summaryDetailMovement: $('summary-detail-movement'),
      summaryDetailTipBox: $('summary-detail-tip-box'),
      summaryDetailTip: $('summary-detail-tip'),
      btnSummaryPlay: $('btn-summary-play'),

      // routine
      btnExitRoutine: $('btn-exit-routine'),
      routineProgressBar: $('routine-progress-bar-fill'),
      stepCounter: $('routine-step-counter'),
      btnToggleOriginal: $('btn-toggle-original-photo'),
      activeIllustration: $('routine-active-illustration'),
      frameDotsContainer: $('routine-frame-dots-container'),
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
      btnPrevEx: $('btn-prev-exercise'),
      btnNextEx: $('btn-next-exercise'),
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
      summary: $('screen-summary'),
      routine: $('screen-routine'),
      completion: $('screen-completion'),
      stats: $('screen-stats'),
    };

    // Initialise ring dasharrays from computed circumferences.
    this.dom.radialFill.setAttribute('stroke-dasharray', `${RADIAL_C} ${RADIAL_C}`);
    this.dom.timerProgressFill.setAttribute('stroke-dasharray', `${TIMER_C} ${TIMER_C}`);
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
      card.className = `exercise-card ${model.completedToday ? 'completed' : ''}`;
      const status = model.completedToday ? '✓' : idx + 1;
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

  /* ---- summary ---- */

  renderSummary(ex, idx, total, clinicianNote) {
    this.dom.summaryStepCounter.textContent = `Ex ${idx + 1} of ${total}`;
    this.dom.summaryBadge.textContent = ex.category;
    this.dom.summaryBadge.className = `ex-badge badge-${ex.category}`;
    this.dom.summaryTitle.textContent = ex.title;
    this.dom.summaryPreview.src = `${ex.folder}/vector-1.png`;
    this.dom.summaryDetailSetup.textContent = ex.setup || 'Neutral sitting posture.';
    this.dom.summaryDetailMovement.textContent = ex.movement;
    this._setTip(this.dom.summaryDetailTipBox, this.dom.summaryDetailTip, ex.tip);
    this._renderPills(this.dom.summaryDosagePills, dosagePills(ex.dosage));
    this._setNote(this.dom.summaryClinicianNote, clinicianNote);
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
    this.dom.btnPrevEx.disabled = idx === 0;
    this.dom.btnNextEx.textContent = idx === total - 1 ? 'Finish Routine' : 'Next';

    // mode: 'timer' | 'reps'
    if (mode === 'timer') {
      this.dom.repsSetsBox.style.display = 'none';
      this.dom.timerContainer.style.display = 'flex';
    } else {
      this.dom.repsSetsBox.style.display = 'grid';
      this.dom.timerContainer.style.display = 'none';
      this.dom.btnRepTick.textContent = ex.category === 'isometric'
        ? 'Complete Repetition (Hold 3s)'
        : 'Complete Repetition';
    }
    this.setBreathing('idle');
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
      return;
    }
    this.dom.guidedSide.style.display = 'inline-block';
    this.dom.guidedSide.textContent = side === 'left' ? 'Left Side' : 'Right Side';
    this.dom.guidedSide.className = side === 'left' ? 'ex-badge badge-stretch' : 'ex-badge badge-nerve-glide';
  }

  setRepButton(text, disabled) {
    this.dom.btnRepTick.textContent = text;
    this.dom.btnRepTick.disabled = !!disabled;
  }

  /* ---- frames / illustration ---- */

  renderFrame(src, activeIndex) {
    this.dom.activeIllustration.src = src;
    this.dom.frameDotsContainer.querySelectorAll('.frame-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex - 1);
    });
  }

  buildDots(count, onDotClick) {
    this.dom.frameDotsContainer.innerHTML = '';
    if (count <= 1) return;
    for (let i = 1; i <= count; i++) {
      const dot = document.createElement('div');
      dot.className = `frame-dot ${i === 1 ? 'active' : ''}`;
      dot.addEventListener('click', () => onDotClick(i));
      this.dom.frameDotsContainer.appendChild(dot);
    }
  }

  // `showingOriginal` true = the example photo is on screen, so offer the drawing.
  setOriginalToggle(showingOriginal) {
    this.dom.btnToggleOriginal.innerHTML = showingOriginal
      ? `${SVG_PEN} View Drawing`
      : `${SVG_PHOTO} View Photo`;
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
