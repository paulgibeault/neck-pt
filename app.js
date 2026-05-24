/**
 * Neck PT Companion - Core Application Logic
 * Implements program routing, active stepper routine, Web Audio audio integration,
 * local storage analytics tracking, pain trend visualizers, and frame animations.
 */

class NeckPTApp {
  constructor() {
    this.program = null;
    this.exercises = [];
    this.currentScreen = 'dashboard';
    
    // Active routine session state
    this.sessionActive = false;
    this.currentExIndex = 0;
    this.timerInterval = null;
    this.timerSecondsLeft = 0;
    this.isTimerRunning = false;
    
    // Reps & Sets tracking
    this.currentSetLeft = 0;
    this.currentRepLeft = 0;
    
    // Frame animator state
    this.activeFrameIndex = 0;
    this.animatorInterval = null;
    this.showingOriginal = false;
    
    // Session metrics
    this.sessionStartTime = null;
    this.preSessionPain = 5;
    this.postSessionPain = 5;
    
    // Local cache elements
    this.history = JSON.parse(localStorage.getItem('neck_pt_history')) || [];
    this.streak = parseInt(localStorage.getItem('neck_pt_streak')) || 0;
    this.lastCompletionDate = localStorage.getItem('neck_pt_last_date') || null;
    
    this.initDOM();
    this.bindEvents();
    this.loadProgramData();
  }

  initDOM() {
    this.dom = {
      // Screens
      dashboard: document.getElementById('screen-dashboard'),
      routine: document.getElementById('screen-routine'),
      completion: document.getElementById('screen-completion'),
      stats: document.getElementById('screen-stats'),
      
      // Theme
      body: document.body,
      btnTheme: document.getElementById('btn-toggle-theme'),
      
      // Dashboard components
      welcomeTitle: document.getElementById('dashboard-welcome-title'),
      welcomeDesc: document.getElementById('dashboard-welcome-desc'),
      radialProgressFill: document.getElementById('radial-progress-fill'),
      radialProgressText: document.getElementById('radial-progress-text'),
      statCompleted: document.getElementById('stat-completed'),
      statStreak: document.getElementById('stat-streak'),
      statTime: document.getElementById('stat-time'),
      btnStartSession: document.getElementById('btn-start-session'),
      exercisesContainer: document.getElementById('exercises-container'),
      
      // Active routine components
      btnExitRoutine: document.getElementById('btn-exit-routine'),
      routineProgressBar: document.getElementById('routine-progress-bar-fill'),
      stepCounter: document.getElementById('routine-step-counter'),
      btnToggleOriginal: document.getElementById('btn-toggle-original-photo'),
      activeIllustration: document.getElementById('routine-active-illustration'),
      frameDotsContainer: document.getElementById('routine-frame-dots-container'),
      activeCategory: document.getElementById('routine-active-category'),
      activeTitle: document.getElementById('routine-active-title'),
      dosagePills: document.getElementById('routine-dosage-pills'),
      handwrittenNote: document.getElementById('routine-clinician-handwritten-note'),
      breathingRing: document.getElementById('breathing-ring'),
      timerContainer: document.querySelector('.timer-container'),
      timerProgressFill: document.getElementById('timer-progress-fill'),
      timerDigits: document.getElementById('timer-digits'),
      timerSubtext: document.getElementById('timer-subtext'),
      repsSetsBox: document.getElementById('reps-sets-interactive-box'),
      activeRepCount: document.getElementById('active-rep-count'),
      activeSetCount: document.getElementById('active-set-count'),
      btnRepTick: document.getElementById('btn-rep-tick'),
      btnPrevEx: document.getElementById('btn-prev-exercise'),
      btnNextEx: document.getElementById('btn-next-exercise'),
      detailSetup: document.getElementById('routine-detail-setup'),
      detailMovement: document.getElementById('routine-detail-movement'),
      detailTipBox: document.getElementById('routine-detail-tip-box'),
      detailTip: document.getElementById('routine-detail-tip'),
      
      // Pain tracking completion
      painSurveyBox: document.getElementById('pain-survey-box'),
      painSlider: document.getElementById('pain-slider'),
      painValueDisplay: document.getElementById('pain-value-display'),
      btnSaveSession: document.getElementById('btn-save-session-data'),
      
      // Completion summary
      completionSummaryBox: document.getElementById('completion-summary-box'),
      summaryDuration: document.getElementById('summary-duration'),
      summaryPainDelta: document.getElementById('summary-pain-delta'),
      summaryPainContainer: document.getElementById('summary-pain-alleviation-container'),
      summaryStreak: document.getElementById('summary-streak'),
      btnBackHome: document.getElementById('btn-complete-back-home'),
      
      // Modal components
      originalImageModal: document.getElementById('original-image-modal'),
      modalExerciseTitle: document.getElementById('modal-exercise-title'),
      modalOriginalImage: document.getElementById('modal-original-image'),
      btnCloseModal: document.getElementById('btn-close-modal'),
      
      // Stats toggle
      btnOpenStats: document.getElementById('btn-toggle-stats'),
      btnCloseStats: document.getElementById('btn-close-stats'),
      historyLogsContainer: document.getElementById('history-logs-container'),
      painChartSvg: document.getElementById('pain-chart-svg'),
      chartLinePath: document.getElementById('chart-line-path'),
      chartDotsGroup: document.getElementById('chart-dots-group'),

      // Summary screen components
      summaryScreen: document.getElementById('screen-summary'),
      btnSummaryBack: document.getElementById('btn-summary-back'),
      summaryBadge: document.getElementById('summary-badge'),
      summaryStepCounter: document.getElementById('summary-step-counter'),
      summaryPreview: document.getElementById('summary-preview-illustration'),
      summaryTitle: document.getElementById('summary-title'),
      summaryDosagePills: document.getElementById('summary-dosage-pills'),
      summaryClinicianNote: document.getElementById('summary-clinician-note'),
      summaryDetailSetup: document.getElementById('summary-detail-setup'),
      summaryDetailMovement: document.getElementById('summary-detail-movement'),
      summaryDetailTipBox: document.getElementById('summary-detail-tip-box'),
      summaryDetailTip: document.getElementById('summary-detail-tip'),
      btnSummaryPlay: document.getElementById('btn-summary-play'),
      routineGuidedSide: document.getElementById('routine-guided-side'),
    };
    
    // Initial theme set based on preference
    if (localStorage.getItem('neck_pt_theme') === 'dark') {
      this.dom.body.classList.add('dark-theme');
    } else {
      this.dom.body.classList.add('light-theme');
    }
  }

  bindEvents() {
    // Theme toggle
    this.dom.btnTheme.addEventListener('click', () => this.toggleTheme());
    
    // Core routes
    this.dom.btnStartSession.addEventListener('click', () => this.promptPreSessionPain());
    this.dom.btnExitRoutine.addEventListener('click', () => this.exitRoutine());
    
    // Summary play triggers
    this.dom.btnSummaryBack.addEventListener('click', () => this.switchScreen('dashboard'));
    this.dom.btnSummaryPlay.addEventListener('click', () => this.playActiveExercise());
    
    // Timers & interactions
    this.dom.timerProgressFill.parentElement.addEventListener('click', () => this.handleTimerCircleClick());
    this.dom.btnRepTick.addEventListener('click', () => this.handleRepTickClick());
    
    // Navigation
    this.dom.btnPrevEx.addEventListener('click', () => this.changeExercise(-1));
    this.dom.btnNextEx.addEventListener('click', () => this.changeExercise(1));
    
    // Original photo modal overlay triggers
    this.dom.btnToggleOriginal.addEventListener('click', () => this.toggleOriginalAndGenerated());
    this.dom.activeIllustration.addEventListener('click', () => this.openOriginalPhotoModal());
    this.dom.btnCloseModal.addEventListener('click', () => this.closeOriginalPhotoModal());
    this.dom.originalImageModal.addEventListener('click', (e) => {
      if (e.target === this.dom.originalImageModal) this.closeOriginalPhotoModal();
    });
    
    // Completion survey
    this.dom.painSlider.addEventListener('input', (e) => {
      this.dom.painValueDisplay.textContent = e.target.value;
    });
    this.dom.btnSaveSession.addEventListener('click', () => this.saveRoutineSession());
    this.dom.btnBackHome.addEventListener('click', () => this.switchScreen('dashboard'));
    
    // Stats views
    this.dom.btnOpenStats.addEventListener('click', () => this.switchScreen('stats'));
    this.dom.btnCloseStats.addEventListener('click', () => this.switchScreen('dashboard'));
  }

  toggleTheme() {
    if (this.dom.body.classList.contains('dark-theme')) {
      this.dom.body.classList.remove('dark-theme');
      this.dom.body.classList.add('light-theme');
      localStorage.setItem('neck_pt_theme', 'light');
    } else {
      this.dom.body.classList.remove('light-theme');
      this.dom.body.classList.add('dark-theme');
      localStorage.setItem('neck_pt_theme', 'dark');
    }
  }

  switchScreen(screenName) {
    this.currentScreen = screenName;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if (screenName === 'dashboard') {
      this.dom.dashboard.classList.add('active');
      this.renderDashboard();
    } else if (screenName === 'summary') {
      this.dom.summaryScreen.classList.add('active');
    } else if (screenName === 'routine') {
      this.dom.routine.classList.add('active');
    } else if (screenName === 'completion') {
      this.dom.completion.classList.add('active');
    } else if (screenName === 'stats') {
      this.dom.stats.classList.add('active');
      this.renderStats();
    }
  }

  loadProgramData() {
    try {
      // Load the bundled program data from window.PT_PROGRAM_DATA directly
      if (window.PT_PROGRAM_DATA) {
        this.program = window.PT_PROGRAM_DATA;
        this.exercises = [...window.PT_PROGRAM_DATA.exercises];
      } else {
        throw new Error("window.PT_PROGRAM_DATA is not defined. Ensure data.js is loaded first.");
      }
      
      // Sort by prescribe order just to be robust
      this.exercises.sort((a, b) => a.order - b.order);
      
      // Check streaks logic
      this.updateStreakMetrics();
      
      // Render initial dashboard layout
      this.switchScreen('dashboard');
    } catch (e) {
      console.error("Failed to load bundled PT routine programs:", e);
      this.dom.welcomeDesc.innerHTML = `<span style="color:var(--color-danger)">Error loading clinical prescription data. Please ensure data.js is correctly imported in index.html.</span>`;
    }
  }

  updateStreakMetrics() {
    const todayStr = new Date().toDateString();
    if (this.lastCompletionDate) {
      const lastDate = new Date(this.lastCompletionDate);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Streak broken
        this.streak = 0;
        localStorage.setItem('neck_pt_streak', 0);
      }
    } else {
      this.streak = 0;
    }
  }

  renderDashboard() {
    // Welcome time greeting
    const hours = new Date().getHours();
    let greeting = "Good Morning";
    if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
    else if (hours >= 17) greeting = "Good Evening";
    this.dom.welcomeTitle.textContent = greeting;

    // Check completion status for today's routine session
    const lastSessionLog = this.history.length > 0 ? this.history[this.history.length - 1] : null;
    const completedToday = lastSessionLog && new Date(lastSessionLog.date).toDateString() === new Date().toDateString();
    
    // Update top progress graphics
    const completedCount = completedToday ? this.exercises.length : 0;
    const totalCount = this.exercises.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Radial dashoffset animation (SVG circumference is 2 * PI * 14 = 88)
    const strokeOffset = 88 - (88 * pct) / 100;
    this.dom.radialProgressFill.style.strokeDashoffset = strokeOffset;
    this.dom.radialProgressText.textContent = `${pct}%`;
    
    this.dom.statCompleted.textContent = `${completedCount}/${totalCount}`;
    this.dom.statStreak.textContent = this.streak;
    
    // Cumulative active time
    const totalMinutes = this.history.reduce((sum, s) => sum + s.duration_minutes, 0);
    this.dom.statTime.textContent = `${totalMinutes}m`;
    
    // Build exercises lists
    this.dom.exercisesContainer.innerHTML = '';
    this.exercises.forEach((ex, idx) => {
      const card = document.createElement('div');
      card.className = `exercise-card ${completedToday ? 'completed' : ''}`;
      
      // Dynamic badge category
      const badgeClass = `badge-${ex.category}`;
      const dosageText = this.formatDosageShort(ex.dosage);
      
      card.innerHTML = `
        <div class="ex-thumb">
          <img src="${ex.folder}/vector-1.png" alt="" onerror="this.src='exercises/01-seated-upper-trapezius-stretch/vector-1.png'">
        </div>
        <div class="ex-info">
          <div class="ex-title">${ex.title}</div>
          <div class="ex-meta">
            <span class="ex-badge ${badgeClass}">${ex.category}</span>
            <span>${dosageText}</span>
          </div>
        </div>
        <div class="ex-status-icon">
          ${completedToday ? '✓' : idx + 1}
        </div>
      `;
      
      // Let user click to view individual details on the active routine summary preview
      card.addEventListener('click', () => {
        window.PTAudio.init();
        this.openExerciseSummary(idx);
      });
      
      this.dom.exercisesContainer.appendChild(card);
    });
  }

  formatDosageShort(dosage) {
    if (!dosage) return 'No dosage';
    const parts = [];
    if (dosage.hold_seconds) {
      parts.push(`${dosage.hold_seconds}s hold`);
    }
    if (dosage.reps) {
      const repVal = dosage.reps.min === dosage.reps.max ? dosage.reps.min : `${dosage.reps.min}–${dosage.reps.max}`;
      parts.push(`${repVal} reps`);
    }
    if (dosage.sets) {
      const setVal = dosage.sets.min === dosage.sets.max ? dosage.sets.min : `${dosage.sets.min}–${dosage.sets.max}`;
      parts.push(`${setVal} sets`);
    }
    return parts.join(' • ');
  }

  promptPreSessionPain() {
    // Start routine session, lazy initialize audio context
    window.PTAudio.init();
    
    // Ask for pre-session pain using standard browser prompt or slider mockup
    // To make it simple and elegant, we initialize pain at 5 and start routine index 0
    this.preSessionPain = parseInt(prompt("Before starting, please rate your current neck pain on a scale of 0 (No Pain) to 10 (Severe Pain):", "5")) || 5;
    if (this.preSessionPain < 0) this.preSessionPain = 0;
    if (this.preSessionPain > 10) this.preSessionPain = 10;
    
    this.openExerciseSummary(0);
  }

  openExerciseSummary(idx) {
    this.currentExIndex = idx;
    const ex = this.exercises[idx];
    if (!ex) return;
    
    // Switch to summary screen
    this.switchScreen('summary');
    
    // Step indicators
    this.dom.summaryStepCounter.textContent = `Ex ${idx + 1} of ${this.exercises.length}`;
    
    // Set up badge and title
    this.dom.summaryBadge.textContent = ex.category;
    this.dom.summaryBadge.className = `ex-badge badge-${ex.category}`;
    this.dom.summaryTitle.textContent = ex.title;
    
    // Preview Image/Illustration (always load first illustration)
    this.dom.summaryPreview.src = `${ex.folder}/vector-1.png`;
    
    // Setup detail descriptions
    this.dom.summaryDetailSetup.textContent = ex.setup || 'Neutral sitting posture.';
    this.dom.summaryDetailMovement.textContent = ex.movement;
    
    if (ex.tip) {
      this.dom.summaryDetailTipBox.style.display = 'flex';
      this.dom.summaryDetailTip.textContent = ex.tip;
    } else {
      this.dom.summaryDetailTipBox.style.display = 'none';
    }
    
    // Dosage pills
    this.dom.summaryDosagePills.innerHTML = '';
    const dosage = ex.dosage;
    if (dosage.hold_seconds) {
      this.createSummaryDosagePill(`${dosage.hold_seconds} Second Hold`);
    }
    if (dosage.reps) {
      const repVal = dosage.reps.min === dosage.reps.max ? dosage.reps.min : `${dosage.reps.min}–${dosage.reps.max}`;
      this.createSummaryDosagePill(`${repVal} Repetitions`);
    }
    if (dosage.sets) {
      const setVal = dosage.sets.min === dosage.sets.max ? dosage.sets.min : `${dosage.sets.min}–${dosage.sets.max}`;
      this.createSummaryDosagePill(`${setVal} Sets`);
    }
    if (dosage.daily) this.createSummaryDosagePill(`${dosage.daily}x Daily`);
    
    // Handwritten note formatting
    const combinedNotes = [];
    if (ex.notes && ex.notes.length > 0) {
      combinedNotes.push(...ex.notes);
    }
    if (ex.category === 'isometric' && this.program.clinician_notes) {
      const isometricNote = this.program.clinician_notes.find(n => n.includes('3-4" holds'));
      if (isometricNote && !combinedNotes.includes(isometricNote)) {
        combinedNotes.push(isometricNote);
      }
    }
    
    if (combinedNotes.length > 0) {
      this.dom.summaryClinicianNote.style.display = 'block';
      this.dom.summaryClinicianNote.textContent = combinedNotes.join(' • ');
    } else {
      this.dom.summaryClinicianNote.style.display = 'none';
    }
  }

  createSummaryDosagePill(text) {
    const pill = document.createElement('span');
    pill.className = 'dosage-pill';
    pill.textContent = text;
    this.dom.summaryDosagePills.appendChild(pill);
  }

  playActiveExercise() {
    if (!this.sessionActive) {
      this.sessionActive = true;
      this.sessionStartTime = new Date();
    }
    this.switchScreen('routine');
    this.loadActiveExercise();
  }

  startRoutineSession(startIndex = 0) {
    this.sessionActive = true;
    this.sessionStartTime = new Date();
    this.currentExIndex = startIndex;
    this.switchScreen('routine');
    this.loadActiveExercise();
  }

  exitRoutine() {
    if (confirm("Are you sure you want to end this PT routine session early? Progress will not be saved.")) {
      this.stopActiveTimer();
      this.stopFrameAnimator();
      this.sessionActive = false;
      this.switchScreen('dashboard');
    }
  }

  loadActiveExercise() {
    this.stopActiveTimer();
    this.stopFrameAnimator();
    
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    
    // Update timeline stepper indicators
    const progressPct = ((this.currentExIndex) / this.exercises.length) * 100;
    this.dom.routineProgressBar.style.width = `${progressPct}%`;
    this.dom.stepCounter.textContent = `Ex ${this.currentExIndex + 1} of ${this.exercises.length}`;
    
    // Text labels
    this.dom.activeTitle.textContent = ex.title;
    this.dom.activeCategory.textContent = ex.category;
    this.dom.activeCategory.className = `ex-badge badge-${ex.category}`;
    
    // Setup detail descriptions
    this.dom.detailSetup.textContent = ex.setup || 'Neutral sitting posture.';
    this.dom.detailMovement.textContent = ex.movement;
    
    if (ex.tip) {
      this.dom.detailTipBox.style.display = 'flex';
      this.dom.detailTip.textContent = ex.tip;
    } else {
      this.dom.detailTipBox.style.display = 'none';
    }
    
    // Clinician Notes cursive highlight
    // Combine program-wide handwritten clinician notes with exercise-specific handwritten clinician notes
    const combinedNotes = [];
    if (ex.notes && ex.notes.length > 0) {
      combinedNotes.push(...ex.notes);
    }
    // Clinician handwritten notes in program.json
    if (ex.category === 'isometric' && this.program.clinician_notes) {
      // Find note mentioning 3-4" holds
      const isometricNote = this.program.clinician_notes.find(n => n.includes('3-4" holds'));
      if (isometricNote && !combinedNotes.includes(isometricNote)) {
        combinedNotes.push(isometricNote);
      }
    }
    
    if (combinedNotes.length > 0) {
      this.dom.handwrittenNote.style.display = 'block';
      this.dom.handwrittenNote.textContent = combinedNotes.join(' • ');
    } else {
      this.dom.handwrittenNote.style.display = 'none';
    }
    
    // Build Dosage pills
    this.dom.dosagePills.innerHTML = '';
    const dosage = ex.dosage;
    if (dosage.hold_seconds) {
      this.createDosagePill(`${dosage.hold_seconds} Second Hold`);
    }
    if (dosage.reps) {
      const repVal = dosage.reps.min === dosage.reps.max ? dosage.reps.min : `${dosage.reps.min}–${dosage.reps.max}`;
      this.createDosagePill(`${repVal} Repetitions`);
    }
    if (dosage.sets) {
      const setVal = dosage.sets.min === dosage.sets.max ? dosage.sets.min : `${dosage.sets.min}–${dosage.sets.max}`;
      this.createDosagePill(`${setVal} Sets`);
    }
    if (dosage.daily) this.createDosagePill(`${dosage.daily}x Daily`);
    
    // Reps & Sets counter tracking initialization
    this.currentSetLeft = dosage.sets ? dosage.sets.max : 1;
    this.currentRepLeft = dosage.reps ? dosage.reps.max : 1;
    
    // Unilateral side state initialization
    this.currentSide = ex.unilateral ? 'left' : null;
    this.updateSideIndicatorView();
    
    this.updateRepCountersView();
    
    // Setup visuals & illustration frame animations
    this.activeFrameIndex = 1;
    this.showingOriginal = false;
    this.dom.btnToggleOriginal.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      View Original Printout
    `;
    
    this.renderActiveFrame();
    this.buildFrameScrubberDots(ex.example_image_count);
    this.startFrameAnimator(ex.example_image_count);
    
    // Setup interactive timers vs manual rep completion counters
    if (dosage.hold_seconds) {
      // TIMER MODE
      this.dom.repsSetsBox.style.display = 'none';
      this.dom.timerContainer.style.display = 'flex';
      
      this.timerSecondsLeft = dosage.hold_seconds;
      this.dom.timerDigits.textContent = this.timerSecondsLeft;
      this.dom.timerSubtext.textContent = "seconds";
      
      // Reset radial progress bar SVG (dashoffset is 2 * PI * 36 = 226)
      this.dom.timerProgressFill.style.strokeDashoffset = 0;
      this.dom.breathingRing.className = "breathing-ring";
    } else {
      // MANUAL REPS HOLD MODE
      this.dom.repsSetsBox.style.display = 'grid';
      this.dom.timerContainer.style.display = 'none';
      this.dom.breathingRing.className = "breathing-ring";
      
      if (ex.category === 'isometric') {
        this.dom.btnRepTick.textContent = "Complete Repetition (Hold 3s)";
      } else {
        this.dom.btnRepTick.textContent = "Complete Repetition";
      }
    }
    
    // Enable/disable navigation buttons
    this.dom.btnPrevEx.disabled = this.currentExIndex === 0;
    this.dom.btnNextEx.textContent = this.currentExIndex === this.exercises.length - 1 ? "Finish Routine" : "Next";
  }

  createDosagePill(text) {
    const pill = document.createElement('span');
    pill.className = 'dosage-pill';
    pill.textContent = text;
    this.dom.dosagePills.appendChild(pill);
  }

  updateSideIndicatorView() {
    if (this.currentSide) {
      this.dom.routineGuidedSide.style.display = 'inline-block';
      this.dom.routineGuidedSide.textContent = this.currentSide === 'left' ? 'Left Side' : 'Right Side';
      this.dom.routineGuidedSide.className = this.currentSide === 'left' ? 'ex-badge badge-stretch' : 'ex-badge badge-nerve-glide';
    } else {
      this.dom.routineGuidedSide.style.display = 'none';
    }
  }

  updateRepCountersView() {
    this.dom.activeRepCount.textContent = this.currentRepLeft;
    this.dom.activeSetCount.textContent = this.currentSetLeft;
  }

  renderActiveFrame() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    
    if (this.showingOriginal) {
      // Render source photo scan crop
      this.dom.activeIllustration.src = `${ex.folder}/example-${this.activeFrameIndex}.png`;
    } else {
      // Render beautiful vector illustration frame
      this.dom.activeIllustration.src = `${ex.folder}/vector-${this.activeFrameIndex}.png`;
    }
    
    // Highlight matching dot
    document.querySelectorAll('.frame-dot').forEach((dot, idx) => {
      if (idx === (this.activeFrameIndex - 1)) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  buildFrameScrubberDots(count) {
    this.dom.frameDotsContainer.innerHTML = '';
    if (count <= 1) return;
    
    for (let i = 1; i <= count; i++) {
      const dot = document.createElement('div');
      dot.className = `frame-dot ${i === 1 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        this.stopFrameAnimator();
        this.activeFrameIndex = i;
        this.renderActiveFrame();
      });
      this.dom.frameDotsContainer.appendChild(dot);
    }
  }

  startFrameAnimator(frameCount) {
    this.stopFrameAnimator();
    if (frameCount <= 1) return;
    
    // Automatically cycle frame illustrations every 1.8 seconds (1800ms)
    this.animatorInterval = setInterval(() => {
      if (!this.showingOriginal) {
        this.activeFrameIndex++;
        if (this.activeFrameIndex > frameCount) {
          this.activeFrameIndex = 1;
        }
        this.renderActiveFrame();
      }
    }, 1800);
  }

  stopFrameAnimator() {
    if (this.animatorInterval) {
      clearInterval(this.animatorInterval);
      this.animatorInterval = null;
    }
  }

  toggleOriginalAndGenerated() {
    this.showingOriginal = !this.showingOriginal;
    
    if (this.showingOriginal) {
      this.dom.btnToggleOriginal.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        View Generated Vector
      `;
    } else {
      this.dom.btnToggleOriginal.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        View Original Printout
      `;
    }
    
    this.renderActiveFrame();
  }

  openOriginalPhotoModal() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    
    this.dom.modalExerciseTitle.textContent = ex.title;
    this.dom.modalOriginalImage.src = `${ex.folder}/${ex.source_image}`;
    this.dom.originalImageModal.classList.add('active');
  }

  closeOriginalPhotoModal() {
    this.dom.originalImageModal.classList.remove('active');
  }

  handleTimerCircleClick() {
    if (this.isTimerRunning) {
      this.stopActiveTimer();
    } else {
      this.startActiveTimer();
    }
  }

  startActiveTimer() {
    if (this.isTimerRunning) return;
    this.isTimerRunning = true;
    this.dom.timerSubtext.textContent = "pause";
    
    const ex = this.exercises[this.currentExIndex];
    const totalTime = ex.dosage.hold_seconds || 30;
    
    // Dynamic breathing cycle (8-second loop: 4s inhale, 4s exhale)
    const runBreathingCycle = () => {
      if (!this.isTimerRunning) return;
      this.dom.breathingRing.classList.add('inhale');
      this.dom.breathingRing.classList.remove('exhale');
      
      setTimeout(() => {
        if (!this.isTimerRunning) return;
        this.dom.breathingRing.classList.add('exhale');
        this.dom.breathingRing.classList.remove('inhale');
      }, 4000);
    };
    
    runBreathingCycle();
    const breathingTimer = setInterval(() => {
      if (!this.isTimerRunning) {
        clearInterval(breathingTimer);
        return;
      }
      runBreathingCycle();
    }, 8000);
    
    this.timerInterval = setInterval(() => {
      this.timerSecondsLeft--;
      this.dom.timerDigits.textContent = this.timerSecondsLeft;
      
      // Radial SVG stroke animation updates (SVG circumference is 226)
      const offset = 226 - (226 * this.timerSecondsLeft) / totalTime;
      this.dom.timerProgressFill.style.strokeDashoffset = offset;
      
      // Dynamic bell synthesized warnings and tick sounds
      if (this.timerSecondsLeft <= 3 && this.timerSecondsLeft > 0) {
        window.PTAudio.playWarning();
      } else {
        window.PTAudio.playTick();
      }
      
      if (this.timerSecondsLeft <= 0) {
        clearInterval(this.timerInterval);
        clearInterval(breathingTimer);
        this.handleTimerCompletion();
      }
    }, 1000);
  }

  stopActiveTimer() {
    this.isTimerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.dom.timerSubtext.textContent = "resume";
    this.dom.breathingRing.className = "breathing-ring";
  }

  handleTimerCompletion() {
    this.isTimerRunning = false;
    this.dom.breathingRing.className = "breathing-ring";
    
    // Play beautiful relaxing clinical bell chime
    window.PTAudio.playChime();
    
    // Dynamic countdown completed
    this.dom.timerDigits.textContent = "✓";
    this.dom.timerSubtext.textContent = "Done";
    
    // Check for unilateral side transitions!
    if (this.currentSide === 'left') {
      setTimeout(() => {
        alert("Completed Left Side! Switch positions to perform on the Right Side (5s prep).");
        this.currentSide = 'right';
        this.updateSideIndicatorView();
        
        const ex = this.exercises[this.currentExIndex];
        this.timerSecondsLeft = ex.dosage.hold_seconds || 30;
        this.dom.timerDigits.textContent = this.timerSecondsLeft;
        this.dom.timerSubtext.textContent = "ready";
        this.dom.timerProgressFill.style.strokeDashoffset = 0;
        
        // Auto start right side after 1.5 seconds
        setTimeout(() => {
          this.startActiveTimer();
        }, 1500);
      }, 1200);
    } else {
      // Bilateral stretch or Right side completes, advance to next exercise's summary page!
      setTimeout(() => {
        this.changeExercise(1);
      }, 1500);
    }
  }

  handleRepTickClick() {
    const ex = this.exercises[this.currentExIndex];
    if (!ex) return;
    
    // If it's an isometric exercise, complete with a 3-second resistance hold countdown
    if (ex.category === 'isometric') {
      this.dom.btnRepTick.disabled = true;
      this.dom.btnRepTick.textContent = "Holding resistance... 3";
      
      // Trigger breathing contracting animation
      this.dom.breathingRing.classList.add('inhale');
      window.PTAudio.playTick();
      
      let holdSec = 3;
      const holdInterval = setInterval(() => {
        holdSec--;
        window.PTAudio.playTick();
        this.dom.btnRepTick.textContent = `Holding resistance... ${holdSec}`;
        
        if (holdSec <= 0) {
          clearInterval(holdInterval);
          this.dom.breathingRing.className = "breathing-ring";
          window.PTAudio.playChime();
          this.dom.btnRepTick.disabled = false;
          this.dom.btnRepTick.textContent = "Complete Repetition (Hold 3s)";
          this.decrementRep();
        }
      }, 1000);
    } else {
      // Standard mobilization/nerve-glide ticks instantly
      window.PTAudio.playTick();
      this.decrementRep();
    }
  }

  decrementRep() {
    this.currentRepLeft--;
    if (this.currentRepLeft <= 0) {
      // Check unilateral side switching for reps!
      if (this.currentSide === 'left') {
        window.PTAudio.playChime();
        alert("Completed reps on the Left Side! Now switch positions to perform on the Right Side.");
        this.currentSide = 'right';
        this.updateSideIndicatorView();
        
        const ex = this.exercises[this.currentExIndex];
        this.currentRepLeft = ex.dosage.reps ? ex.dosage.reps.max : 1;
        this.updateRepCountersView();
      } else if (this.currentSide === 'right') {
        // Complete current set for both sides!
        this.currentSetLeft--;
        if (this.currentSetLeft <= 0) {
          window.PTAudio.playChime();
          this.changeExercise(1);
        } else {
          // Next set, reset to Left side
          alert("Set completed! Take a 10s breathing rest, then begin the next set starting on the Left Side.");
          this.currentSide = 'left';
          this.updateSideIndicatorView();
          
          const ex = this.exercises[this.currentExIndex];
          this.currentRepLeft = ex.dosage.reps ? ex.dosage.reps.max : 1;
          this.updateRepCountersView();
        }
      } else {
        // Bilateral reps complete
        this.currentSetLeft--;
        if (this.currentSetLeft <= 0) {
          window.PTAudio.playChime();
          this.changeExercise(1);
        } else {
          alert("Set completed! Take a 10s breathing rest, then begin the next set.");
          const ex = this.exercises[this.currentExIndex];
          this.currentRepLeft = ex.dosage.reps ? ex.dosage.reps.max : 1;
          this.updateRepCountersView();
        }
      }
    } else {
      this.updateRepCountersView();
    }
  }

  changeExercise(dir) {
    const nextIdx = this.currentExIndex + dir;
    
    if (nextIdx >= this.exercises.length) {
      // Routine fully completed! Route to survey pain check screen
      this.stopActiveTimer();
      this.stopFrameAnimator();
      this.promptPostSessionSurvey();
    } else if (nextIdx < 0) {
      this.switchScreen('dashboard');
    } else {
      // Exit active routine stepper and open the Summary Screen for the next exercise!
      this.stopActiveTimer();
      this.stopFrameAnimator();
      this.openExerciseSummary(nextIdx);
    }
  }

  promptPostSessionSurvey() {
    this.sessionActive = false;
    this.switchScreen('completion');
    this.dom.painSurveyBox.style.display = 'flex';
    this.dom.completionSummaryBox.style.display = 'none';
    
    // Pre-populate post survey pain with preSessionPain
    this.dom.painSlider.value = this.preSessionPain;
    this.dom.painValueDisplay.textContent = this.preSessionPain;
  }

  saveRoutineSession() {
    this.postSessionPain = parseInt(this.dom.painSlider.value);
    
    // Calculate session metrics
    const now = new Date();
    const durationMs = now - this.sessionStartTime;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
    
    // Increment streaks
    const todayStr = new Date().toDateString();
    if (this.lastCompletionDate === todayStr) {
      // already completed today, streak remains same
    } else if (this.lastCompletionDate) {
      const lastDate = new Date(this.lastCompletionDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        this.streak++;
      } else {
        this.streak = 1;
      }
    } else {
      this.streak = 1;
    }
    
    // Save to caches
    this.lastCompletionDate = todayStr;
    localStorage.setItem('neck_pt_last_date', todayStr);
    localStorage.setItem('neck_pt_streak', this.streak);
    
    const log = {
      date: new Date().toISOString(),
      duration_minutes: durationMinutes,
      pre_pain: this.preSessionPain,
      post_pain: this.postSessionPain,
      exercises_completed: this.exercises.length
    };
    
    this.history.push(log);
    // Cap history details at 30 items
    if (this.history.length > 30) this.history.shift();
    localStorage.setItem('neck_pt_history', JSON.stringify(this.history));
    
    // Populate completion card celebration
    this.dom.summaryDuration.textContent = `${durationMinutes}m`;
    
    const painDelta = this.postSessionPain - this.preSessionPain;
    if (painDelta < 0) {
      this.dom.summaryPainDelta.textContent = painDelta;
      this.dom.summaryPainContainer.style.display = 'block';
      this.dom.summaryPainDelta.className = "stat-val text-success";
    } else if (painDelta > 0) {
      this.dom.summaryPainDelta.textContent = `+${painDelta}`;
      this.dom.summaryPainContainer.style.display = 'block';
    } else {
      this.dom.summaryPainDelta.textContent = "0";
      this.dom.summaryPainContainer.style.display = 'block';
    }
    
    this.dom.summaryStreak.textContent = `${this.streak} Days`;
    
    this.dom.painSurveyBox.style.display = 'none';
    this.dom.completionSummaryBox.style.display = 'flex';
    window.PTAudio.playChime();
  }

  renderStats() {
    this.dom.historyLogsContainer.innerHTML = '';
    
    if (this.history.length === 0) {
      this.dom.historyLogsContainer.innerHTML = `
        <div class="ex-meta" style="text-align: center; padding: 20px 0; width:100%;">No sessions completed yet. Start your first session to begin logging.</div>
      `;
      // Clear line path
      this.dom.chartLinePath.setAttribute('d', '');
      this.dom.chartDotsGroup.innerHTML = '';
      return;
    }
    
    // Render list rows in reverse chronological order
    const reverseLogs = [...this.history].reverse();
    reverseLogs.forEach(log => {
      const row = document.createElement('div');
      row.className = 'history-log-row';
      
      const dateFormatted = new Date(log.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const painDiff = log.post_pain - log.pre_pain;
      let painDeltaText = `Pain: ${log.pre_pain} → ${log.post_pain}`;
      let badgeClass = 'mid';
      if (log.post_pain <= 2) badgeClass = 'low';
      else if (log.post_pain >= 7) badgeClass = 'high';
      
      row.innerHTML = `
        <div>
          <div class="history-log-date">${dateFormatted}</div>
          <div class="history-log-details">${log.exercises_completed} exercises completed in ${log.duration_minutes}m</div>
        </div>
        <div class="pain-badge ${badgeClass}">${painDeltaText}</div>
      `;
      
      this.dom.historyLogsContainer.appendChild(row);
    });
    
    // Render interactive SVG Chart (Pain score trends over time)
    // Canvas dimensions: width 400, height 160. Grid Y-boundaries: top 20, bottom 140.
    // Pain score: 0 is at Y=140, 10 is at Y=20. Formula: Y = 140 - (painVal * 12)
    const pointsCount = Math.min(7, this.history.length);
    const lastLogsForChart = this.history.slice(-pointsCount);
    
    const xStep = pointsCount > 1 ? 340 / (pointsCount - 1) : 340;
    
    let pathD = '';
    this.dom.chartDotsGroup.innerHTML = '';
    
    lastLogsForChart.forEach((log, idx) => {
      const x = 40 + idx * xStep;
      const y = 140 - (log.post_pain * 12);
      
      if (idx === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
      
      // Inject circle dots
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 5);
      circle.setAttribute('fill', 'var(--color-accent)');
      circle.setAttribute('stroke', 'var(--bg-card)');
      circle.setAttribute('stroke-width', 2);
      
      // Hover title values
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `Pain: ${log.post_pain} on ${new Date(log.date).toLocaleDateString()}`;
      circle.appendChild(title);
      
      this.dom.chartDotsGroup.appendChild(circle);
    });
    
    this.dom.chartLinePath.setAttribute('d', pathD);
  }
}

// Instantiate the single-page application core when the DOM finishes loading
window.addEventListener('DOMContentLoaded', () => {
  window.PTAppInstance = new NeckPTApp();
});
