/**
 * Neck PT Companion - Exercise Admin Controller (ES Module)
 * 
 * Interacts with index.html to manage exercise metadata, clinical dosage rules,
 * patient instruction text, clinician annotations, and multi-frame animation assets.
 * 
 * Supports two runtime modes:
 * 1. Local Developer Mode: Saves data and media uploads directly to the local git workspace.
 * 2. Static Host Mode (GitHub Pages): Falls back to a "Download data.js" utility for commits.
 */

import { PROGRAM, validateProgram } from './data.js';

class ExerciseAdmin {
  constructor() {
    this.program = JSON.parse(JSON.stringify(PROGRAM)); // deep clone for workspace state
    this.activeEx = null;
    this.unsavedChanges = false;
    this.mode = 'static'; // 'dev' | 'static'
    this.mediaCache = {}; // in-memory image cache for static mode base64 previews

    this.dom = {
      themeBtn: document.getElementById('btn-toggle-theme'),
      connectionIndicator: document.getElementById('connection-indicator'),
      connectionText: document.getElementById('connection-status-text'),
      exerciseSearch: document.getElementById('exercise-search'),
      sidebarContainer: document.getElementById('sidebar-list-container'),
      btnAddExercise: document.getElementById('btn-add-exercise'),
      
      workspaceEditor: document.getElementById('workspace-editor'),
      workspacePlaceholder: document.getElementById('workspace-placeholder'),
      workspaceTitle: document.getElementById('workspace-title'),
      workspaceFolderPath: document.getElementById('workspace-folder-path'),
      btnDeleteExercise: document.getElementById('btn-delete-exercise'),

      tabButtons: document.querySelectorAll('.editor-tab-btn'),
      tabPanels: document.querySelectorAll('.form-tab-panel'),

      // General Info Fields
      fieldTitle: document.getElementById('field-title'),
      fieldCategory: document.getElementById('field-category'),
      fieldOrder: document.getElementById('field-order'),
      fieldUnilateral: document.getElementById('field-unilateral'),

      // Dosage Fields
      fieldDosageType: document.getElementById('field-dosage-type'),
      fieldHold: document.getElementById('field-hold'),
      fieldRepsMin: document.getElementById('field-reps-min'),
      fieldRepsMax: document.getElementById('field-reps-max'),
      fieldSetsMin: document.getElementById('field-sets-min'),
      fieldSetsMax: document.getElementById('field-sets-max'),
      fieldDaily: document.getElementById('field-daily'),
      fieldWeekly: document.getElementById('field-weekly'),
      fieldEquipment: document.getElementById('field-equipment'),

      // Instructions Fields
      fieldSetup: document.getElementById('field-setup'),
      fieldMovement: document.getElementById('field-movement'),
      fieldTip: document.getElementById('field-tip'),
      notesContainer: document.getElementById('notes-list-container'),
      btnAddNote: document.getElementById('btn-add-note'),

      // Media Fields
      mediaSourcePreview: document.getElementById('media-source-preview'),
      uploadSourcePhoto: document.getElementById('upload-source-photo'),
      vectorFramesGrid: document.getElementById('vector-frames-grid'),
      btnAddVectorFrame: document.getElementById('btn-add-vector-frame'),
      fieldPrompt: document.getElementById('field-prompt'),

      // Action Footer Bar
      statusTitleText: document.getElementById('status-title-text'),
      statusSubText: document.getElementById('status-sub-text'),
      statusSubDot: document.getElementById('status-sub-dot'),
      btnDiscard: document.getElementById('btn-discard'),
      btnSave: document.getElementById('btn-save'),
      btnSaveText: document.getElementById('btn-save-text'),
    };

    this.init();
  }

  async init() {
    this.applyTheme(localStorage.getItem('neck_pt_theme') || 'light');
    this.bindEvents();
    await this.detectMode();
    this.renderSidebar();
    this.selectExercise(null); // start empty
    this.setUnsavedChanges(false);
  }

  /* ---- Theme Management ---- */
  applyTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme !== 'dark');
  }

  toggleTheme() {
    const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem('neck_pt_theme', next);
    this.applyTheme(next);
  }

  /* ---- Connection Mode Detection ---- */
  async detectMode() {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalHost) {
      try {
        // Quick options ping to check if our developer server is alive
        const testRes = await fetch('/api/save-program', { method: 'OPTIONS' });
        if (testRes.status === 204) {
          this.mode = 'dev';
          this.dom.connectionIndicator.className = 'connection-pill connected';
          this.dom.connectionText.textContent = 'Local Dev Mode';
          this.dom.statusSubText.textContent = 'Local Developer Mode — Edits save directly to disk';
          this.dom.btnSaveText.textContent = 'Save to Disk';
          return;
        }
      } catch (e) {
        console.warn('[Admin] Localdev server not running, falling back to static');
      }
    }
    
    // Static Fallback Mode (GitHub Pages)
    this.mode = 'static';
    this.dom.connectionIndicator.className = 'connection-pill static';
    this.dom.connectionText.textContent = 'Static Host Mode';
    this.dom.statusSubText.textContent = 'Static Host Mode (GitHub Pages) — Edits download as data.js';
    this.dom.btnSaveText.textContent = 'Download data.js';
  }

  /* ---- Event Wires ---- */
  bindEvents() {
    this.dom.themeBtn.addEventListener('click', () => this.toggleTheme());
    this.dom.exerciseSearch.addEventListener('input', () => this.filterSidebar());
    this.dom.btnAddExercise.addEventListener('click', () => this.createNewExercise());
    this.dom.btnDeleteExercise.addEventListener('click', () => this.deleteActiveExercise());
    this.dom.btnAddNote.addEventListener('click', () => this.addNoteField(''));
    this.dom.btnAddVectorFrame.addEventListener('click', () => this.triggerAddVectorFrame());
    this.dom.uploadSourcePhoto.addEventListener('change', (e) => this.handleSourcePhotoUpload(e));

    // Tab navigation logic
    this.dom.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.tabButtons.forEach(b => b.classList.remove('active'));
        this.dom.tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetPanel = document.getElementById(btn.getAttribute('data-target'));
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Form inputs change trackers -> triggers unsaved changes alerts
    const fields = [
      this.dom.fieldTitle, this.dom.fieldCategory, this.dom.fieldUnilateral,
      this.dom.fieldDosageType, this.dom.fieldHold, this.dom.fieldRepsMin, this.dom.fieldRepsMax,
      this.dom.fieldSetsMin, this.dom.fieldSetsMax, this.dom.fieldDaily, this.dom.fieldWeekly,
      this.dom.fieldEquipment, this.dom.fieldSetup, this.dom.fieldMovement, this.dom.fieldTip
    ];

    fields.forEach(el => {
      el.addEventListener('input', () => this.handleFieldInput());
      el.addEventListener('change', () => this.handleFieldInput());
    });

    // Dosage Type change UI toggle
    this.dom.fieldDosageType.addEventListener('change', () => this.toggleDosageInputsDisplay());

    // Save and discard buttons
    this.dom.btnDiscard.addEventListener('click', () => this.discardChanges());
    this.dom.btnSave.addEventListener('click', () => this.saveChanges());

    // Clipboard Copy Event Listeners
    document.getElementById('btn-copy-slug').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      if (this.activeEx) this.copyText(this.activeEx.slug, btn, btn.innerHTML);
    });

    document.getElementById('btn-copy-path').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      if (this.activeEx) this.copyText(this.activeEx.folder, btn, btn.innerHTML);
    });

    document.getElementById('btn-copy-json').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      if (this.activeEx) {
        const jsonText = JSON.stringify(this.activeEx, null, 2);
        this.copyText(jsonText, btn, btn.innerHTML);
      }
    });

    document.getElementById('btn-copy-dosage-summary').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (this.activeEx) {
        const summaryText = this.compileDosageSummary(this.activeEx);
        this.copyText(summaryText, btn, 'Copy Prescription Summary');
      }
    });

    document.getElementById('btn-copy-routine-card').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (this.activeEx) {
        const cardText = this.compileRoutineCard(this.activeEx);
        this.copyText(cardText, btn, 'Copy Patient Routine Card');
      }
    });

    // Delegate field copy button clicks
    document.querySelectorAll('.btn-copy-field').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        const inputEl = document.getElementById(targetId);
        if (inputEl) {
          this.copyText(inputEl.value, btn, 'Copy');
        }
      });
    });

    // Exit confirmation sheets warning
    window.addEventListener('beforeunload', (e) => {
      if (this.unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to discard them?';
      }
    });
  }

  /** Unified Clipboard Copy Helper with micro-animations feedback */
  copyText(text, btn, originalHTML) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      btn.style.color = 'var(--color-success)';
      btn.style.fontWeight = 'bold';
      
      if (btn.classList.contains('btn-copy-field')) {
        if (btn.classList.contains('btn-copy-frame-prompt')) {
          btn.textContent = 'Prompt Copied! ✓';
        } else {
          btn.textContent = 'Copied! ✓';
        }
      } else if (btn.id === 'btn-copy-dosage-summary') {
        btn.textContent = 'Prescription Copied! ✓';
      } else if (btn.id === 'btn-copy-routine-card') {
        btn.textContent = 'Card Copied! ✓';
      } else {
        btn.innerHTML = '<span style="font-size:0.7rem; color:var(--color-success); font-weight:700;">Copied! ✓</span>';
      }

      setTimeout(() => {
        btn.style.color = '';
        btn.style.fontWeight = '';
        if (btn.classList.contains('btn-copy-field')) {
          if (btn.classList.contains('btn-copy-frame-prompt')) {
            btn.textContent = 'Copy Prompt';
          } else {
            btn.textContent = 'Copy';
          }
        } else if (btn.id === 'btn-copy-dosage-summary') {
          btn.textContent = 'Copy Prescription Summary';
        } else if (btn.id === 'btn-copy-routine-card') {
          btn.textContent = 'Copy Patient Routine Card';
        } else {
          btn.innerHTML = originalHTML;
        }
      }, 1500);
    }).catch(err => {
      console.error('Could not copy to clipboard:', err);
    });
  }

  compileDosageSummary(ex) {
    const d = ex.dosage;
    let dosageStr = '';
    if (d.hold_seconds) {
      dosageStr = `${d.hold_seconds}s hold`;
    } else if (d.reps && d.sets) {
      dosageStr = `${d.sets.min}-${d.sets.max} sets of ${d.reps.min}-${d.reps.max} reps`;
    } else {
      dosageStr = 'as directed';
    }
    const daily = d.daily ? `${d.daily} session${d.daily > 1 ? 's' : ''}/day` : '';
    const weekly = d.weekly ? `${d.weekly} day${d.weekly > 1 ? 's' : ''}/week` : '';
    const parts = [dosageStr, daily, weekly].filter(Boolean);
    const equip = ex.equipment && ex.equipment.length > 0 ? ` (Equipment: ${ex.equipment.join(', ')})` : '';
    return `${ex.title} - ${parts.join(', ')}${equip}`;
  }

  compileRoutineCard(ex) {
    const dosageText = this.compileDosageSummary(ex);
    const notesText = ex.notes && ex.notes.length > 0
      ? `\nCLINICIAN ANNOTATIONS:\n${ex.notes.map(n => `• ${n}`).join('\n')}`
      : '';
    const tipText = ex.tip ? `\nCLINICIAN TIP:\n${ex.tip}` : '';
    
    return `--- CLINICAL PHYSICAL THERAPY INSTRUCTION CARD ---
EXERCISE: ${ex.title}
CATEGORY: ${ex.category.toUpperCase()}
DOSAGE: ${dosageText}

SETUP POSITION:
${ex.setup || 'Not specified.'}

MOVEMENT SEQUENCE:
${ex.movement || 'Not specified.'}${tipText}${notesText}
--------------------------------------------------`;
  }

  /* ---- Sidebar List Logic with Drag & Drop Reordering ---- */
  renderSidebar() {
    this.dom.sidebarContainer.innerHTML = '';
    // Sort exercises by order
    const sorted = [...this.program.exercises].sort((a, b) => a.order - b.order);
    
    sorted.forEach((ex) => {
      const card = document.createElement('div');
      card.className = 'exercise-mini-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-slug', ex.slug);
      if (this.activeEx && this.activeEx.slug === ex.slug) {
        card.classList.add('active');
      }
      
      card.innerHTML = `
        <div class="info">
          <div class="title">${ex.title || '(New Exercise)'}</div>
          <div class="meta">
            <span class="ex-badge badge-${ex.category}">${ex.category}</span>
            <span>Unilateral: ${ex.unilateral ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div class="order-badge">${ex.order}</div>
      `;
      
      // Select Logic
      card.addEventListener('click', () => {
        if (card.classList.contains('dragging')) return;
        if (this.unsavedChanges && !confirm('Discard unsaved changes on current exercise?')) {
          return;
        }
        this.selectExercise(ex);
      });

      // HTML5 Drag-and-Drop Listeners
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', ex.slug);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.dom.sidebarContainer.querySelectorAll('.exercise-mini-card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const draggedSlug = e.dataTransfer.getData('text/plain');
        const targetSlug = ex.slug;
        if (draggedSlug === targetSlug) return;
        this.reorderExercises(draggedSlug, targetSlug);
      });
      
      this.dom.sidebarContainer.appendChild(card);
    });
  }

  /** Swap positions in list, reorder sequence indices, and auto-update folder names */
  reorderExercises(draggedSlug, targetSlug) {
    const draggedIdx = this.program.exercises.findIndex(e => e.slug === draggedSlug);
    const targetIdx = this.program.exercises.findIndex(e => e.slug === targetSlug);

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Splice from active, insert at drop target
    const [draggedEx] = this.program.exercises.splice(draggedIdx, 1);
    this.program.exercises.splice(targetIdx, 0, draggedEx);

    // Reorder indices sequentially and update paths
    this.program.exercises.forEach((item, index) => {
      item.order = index + 1;
      const padOrder = item.order.toString().padStart(2, '0');
      item.folder = item.folder.replace(/exercises\/\d+-/, `exercises/${padOrder}-`);
    });

    this.renderSidebar();
    
    // Sync detailed pane state
    if (this.activeEx) {
      const reselected = this.program.exercises.find(e => e.slug === this.activeEx.slug);
      this.selectExercise(reselected || null);
    }
    
    this.setUnsavedChanges(true);
  }

  filterSidebar() {
    const query = this.dom.exerciseSearch.value.toLowerCase().trim();
    const cards = this.dom.sidebarContainer.querySelectorAll('.exercise-mini-card');
    
    cards.forEach((card) => {
      const title = card.querySelector('.title').textContent.toLowerCase();
      const meta = card.querySelector('.meta').textContent.toLowerCase();
      const matches = title.includes(query) || meta.includes(query);
      card.style.display = matches ? 'flex' : 'none';
    });
  }

  /* ---- Editor Selection and Binding ---- */
  selectExercise(ex) {
    this.activeEx = ex;
    
    // Toggle active highlighting class in sidebar list
    const cards = this.dom.sidebarContainer.querySelectorAll('.exercise-mini-card');
    cards.forEach(card => {
      const cardSlug = card.getAttribute('data-slug');
      const isActive = ex && cardSlug === ex.slug;
      card.classList.toggle('active', isActive);
    });
    
    if (!ex) {
      this.dom.workspaceEditor.style.display = 'none';
      this.dom.workspacePlaceholder.style.display = 'flex';
      return;
    }
    
    this.dom.workspaceEditor.style.display = 'flex';
    this.dom.workspacePlaceholder.style.display = 'none';
    
    // Set Header titles
    this.dom.workspaceTitle.textContent = ex.title || 'New Exercise';
    this.dom.workspaceFolderPath.textContent = ex.folder || `exercises/00-${ex.slug}`;
    
    // Bind basic properties
    this.dom.fieldTitle.value = ex.title || '';
    this.dom.fieldCategory.value = ex.category || 'stretch';
    this.dom.fieldOrder.value = ex.order || '';
    this.dom.fieldUnilateral.checked = !!ex.unilateral;

    // Bind dosage logic options
    const isHold = !!ex.dosage.hold_seconds;
    this.dom.fieldDosageType.value = isHold ? 'hold' : 'reps';
    this.dom.fieldHold.value = ex.dosage.hold_seconds || '';
    
    this.dom.fieldRepsMin.value = ex.dosage.reps ? ex.dosage.reps.min : '';
    this.dom.fieldRepsMax.value = ex.dosage.reps ? ex.dosage.reps.max : '';
    this.dom.fieldSetsMin.value = ex.dosage.sets ? ex.dosage.sets.min : '';
    this.dom.fieldSetsMax.value = ex.dosage.sets ? ex.dosage.sets.max : '';
    
    this.dom.fieldDaily.value = ex.dosage.daily || '';
    this.dom.fieldWeekly.value = ex.dosage.weekly || '';
    this.dom.fieldEquipment.value = (ex.equipment || []).join(', ');

    this.toggleDosageInputsDisplay();

    // Bind Instructions
    this.dom.fieldSetup.value = ex.setup || '';
    this.dom.fieldMovement.value = ex.movement || '';
    this.dom.fieldTip.value = ex.tip || '';

    // Bind dynamic notes list
    this.dom.notesContainer.innerHTML = '';
    (ex.notes || []).forEach(note => this.addNoteField(note));

    // Bind Media Manager previews
    const folderPath = ex.folder || `exercises/00-${ex.slug}`;
    this.dom.mediaSourcePreview.src = `${folderPath}/${ex.source_image || 'source.jpeg'}`;
    this.dom.mediaSourcePreview.onerror = () => {
      this.dom.mediaSourcePreview.src = 'icon-512.png'; // placeholder fallback
    };

    // Ensure ex.prompts is initialized to match frame count
    const count = ex.example_image_count || 1;
    if (!ex.prompts) {
      ex.prompts = [];
    }
    while (ex.prompts.length < count) {
      ex.prompts.push(ex.prompts.length === 0 ? (ex.prompt || '') : '');
    }

    this.renderVectorGrid();
    
    // Reset active panel tabs to general info on swap
    this.dom.tabButtons[0].click();
    
    this.setUnsavedChanges(false);
  }

  toggleDosageInputsDisplay() {
    const type = this.dom.fieldDosageType.value;
    const holds = document.querySelectorAll('.dosage-group-hold');
    const reps = document.querySelectorAll('.dosage-group-reps');
    
    if (type === 'hold') {
      holds.forEach(el => el.style.display = 'flex');
      reps.forEach(el => el.style.display = 'none');
    } else {
      holds.forEach(el => el.style.display = 'none');
      reps.forEach(el => el.style.display = 'grid');
    }
  }

  /* ---- Dynamic Note Field List ---- */
  addNoteField(text) {
    const row = document.createElement('div');
    row.className = 'dynamic-list-item';
    
    row.innerHTML = `
      <input type="text" class="form-input list-note-input" value="${text.replace(/"/g, '&quot;')}" placeholder="Handwritten clinical note...">
      <button type="button" class="btn-copy-field btn-copy-note" style="border:none; background:transparent; color:var(--text-muted); cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; width:30px; height:30px; flex-shrink:0;" title="Copy Note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button type="button" class="btn-icon-danger btn-remove-note" title="Delete note">
        ✕
      </button>
    `;
    
    row.querySelector('.btn-remove-note').addEventListener('click', () => {
      row.remove();
      this.handleFieldInput();
    });

    row.querySelector('.btn-copy-note').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const noteVal = row.querySelector('.list-note-input').value.trim();
      this.copyText(noteVal, btn, btn.innerHTML);
    });
    
    row.querySelector('.list-note-input').addEventListener('input', () => this.handleFieldInput());
    
    this.dom.notesContainer.appendChild(row);
  }

  /* ---- Media Upload Handlers ---- */
  handleSourcePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file || !this.activeEx) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      this.dom.mediaSourcePreview.src = base64Data;
      
      // Store in active exercise model
      const filename = this.activeEx.source_image || `${this.activeEx.slug}.jpeg`;
      this.activeEx.source_image = filename;

      if (this.mode === 'dev') {
        this.dom.statusTitleText.textContent = 'Uploading source photo...';
        const success = await this.uploadMediaFile(this.activeEx.folder, filename, base64Data);
        if (success) {
          this.setUnsavedChanges(true);
          this.dom.statusTitleText.textContent = 'Source photo uploaded successfully.';
        } else {
          alert('Failed to upload source photo to local dev server.');
        }
      } else {
        // Static Cache Mode
        const cacheKey = `${this.activeEx.folder}/${filename}`;
        this.mediaCache[cacheKey] = base64Data;
        this.setUnsavedChanges(true);
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadMediaFile(folder, filename, base64Data) {
    try {
      const res = await fetch('/api/save-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, filename, base64Data }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteMediaFile(folder, filename) {
    if (this.mode !== 'dev') return;
    try {
      await fetch('/api/delete-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, filename }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  /* ---- Animation & Reference Comparer Grid ---- */
  renderVectorGrid() {
    // Clear dynamic children but keep the "Add Frame" button
    const container = this.dom.vectorFramesGrid;
    const addCard = this.dom.btnAddVectorFrame;
    
    // Remove all frame cards except the add card
    const frameCards = container.querySelectorAll('.vector-frame-card:not(#btn-add-vector-frame)');
    frameCards.forEach(c => c.remove());
    
    const ex = this.activeEx;
    if (!ex) return;

    const count = ex.example_image_count || 1;
    const folderPath = ex.folder || `exercises/00-${ex.slug}`;

    // Ensure prompts array exists and has elements to match the count
    if (!ex.prompts) {
      ex.prompts = [];
    }
    while (ex.prompts.length < count) {
      ex.prompts.push(ex.prompts.length === 0 ? (ex.prompt || '') : '');
    }

    for (let i = 1; i <= count; i++) {
      const cropFilename = `example-${i}.png`;
      const vectorFilename = `vector-${i}.png`;
      
      const cropCacheKey = `${folderPath}/${cropFilename}`;
      const vectorCacheKey = `${folderPath}/${vectorFilename}`;
      
      const cropSrc = this.mediaCache[cropCacheKey] || `${folderPath}/${cropFilename}`;
      const vectorSrc = this.mediaCache[vectorCacheKey] || `${folderPath}/${vectorFilename}`;
      const framePrompt = ex.prompts[i - 1] || '';

      const card = document.createElement('div');
      card.className = 'vector-frame-card';
      
      card.innerHTML = `
        <div class="vector-frame-card-header">
          <div class="title">Frame ${i} of ${count}</div>
          <button class="btn-delete-frame" title="Delete Frame ${i}" data-frame="${i}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        
        <div class="vector-frame-comparer">
          <!-- Column 1: Example Crop Photo -->
          <div class="comparer-column">
            <span class="label">Example Crop</span>
            <div class="preview">
              <img src="${cropSrc}" alt="Crop ${i}" class="crop-img-preview" id="crop-img-preview-${i}" onerror="this.src='icon-192.png'">
            </div>
            <label class="custom-file-upload" style="width:100%; display:flex; justify-content:center; box-sizing:border-box;">
              Upload Crop
              <input type="file" class="upload-crop-input" accept="image/png" data-frame="${i}">
            </label>
          </div>
          
          <!-- Column 2: Vector Drawing -->
          <div class="comparer-column">
            <span class="label">Vector Art</span>
            <div class="preview">
              <img src="${vectorSrc}" alt="Vector ${i}" class="vector-img-preview" id="vector-img-preview-${i}" onerror="this.src='icon-512.png'">
            </div>
            <label class="custom-file-upload" style="width:100%; display:flex; justify-content:center; box-sizing:border-box;">
              Upload Vector
              <input type="file" class="upload-vector-input" accept="image/png" data-frame="${i}">
            </label>
          </div>
        </div>

        <!-- Frame-specific Prompt Editor Section -->
        <div class="vector-frame-prompt-section" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px; width: 100%; display: flex; flex-direction: column; gap: 6px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="label" style="font-size:0.7rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.02em;">Frame ${i} AI Prompt</span>
            <button type="button" class="btn-copy-frame-prompt btn-copy-field" data-frame="${i}" style="border:none; background:transparent; color:var(--color-accent); font-weight:600; cursor:pointer; font-size:0.7rem; display:flex; align-items:center; gap:4px; transition:var(--transition-fast);" title="Copy Frame ${i} Prompt">Copy Prompt</button>
          </div>
          <textarea class="form-textarea frame-prompt-textarea" data-frame="${i}" style="min-height: 80px; font-family:monospace; font-size:0.75rem; line-height:1.4; background:rgba(148,163,184,0.04); box-sizing: border-box;" placeholder="Enter AI prompt for Frame ${i}...">${framePrompt}</textarea>
        </div>
      `;

      // Handle file uploads
      card.querySelector('.upload-crop-input').addEventListener('change', (e) => this.handleImageFrameUpload(e, i, 'crop'));
      card.querySelector('.upload-vector-input').addEventListener('change', (e) => this.handleImageFrameUpload(e, i, 'vector'));
      
      // Handle Frame deletion
      card.querySelector('.btn-delete-frame').addEventListener('click', () => this.deleteVectorFrame(i));

      // Handle individual frame prompt editing
      card.querySelector('.frame-prompt-textarea').addEventListener('input', (e) => {
        const frameIdx = i - 1;
        ex.prompts[frameIdx] = e.target.value.trim();
        if (frameIdx === 0) {
          ex.prompt = ex.prompts[0]; // keep synced for legacy fallback
        }
        this.handleFieldInput();
      });

      // Handle prompt copy button click
      card.querySelector('.btn-copy-frame-prompt').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const promptText = ex.prompts[i - 1] || '';
        this.copyText(promptText, btn, 'Copy Prompt');
      });

      // Append frame card before the "Add Frame" trigger card
      container.insertBefore(card, addCard);
    }
  }

  handleImageFrameUpload(e, index, type) {
    const file = e.target.files[0];
    if (!file || !this.activeEx) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      const previewId = type === 'crop' ? `crop-img-preview-${index}` : `vector-img-preview-${index}`;
      const imgEl = document.getElementById(previewId);
      if (imgEl) imgEl.src = base64Data;

      const filename = type === 'crop' ? `example-${index}.png` : `vector-${index}.png`;
      if (this.mode === 'dev') {
        this.dom.statusTitleText.textContent = `Uploading ${type} frame ${index}...`;
        const success = await this.uploadMediaFile(this.activeEx.folder, filename, base64Data);
        if (success) {
          this.setUnsavedChanges(true);
          this.dom.statusTitleText.textContent = `${type === 'crop' ? 'Crop' : 'Vector'} frame ${index} uploaded successfully.`;
        } else {
          alert(`Failed to upload ${type} frame PNG.`);
        }
      } else {
        const cacheKey = `${this.activeEx.folder}/${filename}`;
        this.mediaCache[cacheKey] = base64Data;
        this.setUnsavedChanges(true);
      }
    };
    reader.readAsDataURL(file);
  }

  async triggerAddVectorFrame() {
    if (!this.activeEx) return;
    
    // Add new frame slot by incrementing frame counter in state
    this.activeEx.example_image_count = (this.activeEx.example_image_count || 0) + 1;
    this.renderVectorGrid();
    this.setUnsavedChanges(true);
    
    // Immediately scroll to the newly appended card
    const container = this.dom.vectorFramesGrid;
    container.scrollLeft = container.scrollWidth;
  }

  /**
   * Delete frame sequentially and rename BOTH physical assets families to fill gaps.
   * e.g., deleting frame 2 in a 3-frame set (1, 2, 3) must rename example-3 & vector-3 
   * down to index 2, keeping illustrations clean and gapless.
   */
  async deleteVectorFrame(indexToDelete) {
    if (!this.activeEx) return;
    const count = this.activeEx.example_image_count;
    if (count <= 1) {
      alert('An exercise must contain at least 1 visual frame.');
      return;
    }

    if (!confirm(`Are you sure you want to delete Frame ${indexToDelete}? This removes both the matching crop and vector illustrations.`)) {
      return;
    }

    const folder = this.activeEx.folder;

    if (this.mode === 'dev') {
      this.dom.statusTitleText.textContent = 'Reordering visual frames...';
      
      // Delete the target files
      await this.deleteMediaFile(folder, `example-${indexToDelete}.png`);
      await this.deleteMediaFile(folder, `vector-${indexToDelete}.png`);

      // Sequentially rename subsequent frames down to fill the gap
      for (let i = indexToDelete + 1; i <= count; i++) {
        // Remap example crop
        try {
          const oldCrop = `example-${i}.png`;
          const newCrop = `example-${i - 1}.png`;
          const oldCropSrc = `${folder}/${oldCrop}`;
          const cropRes = await fetch(oldCropSrc);
          if (cropRes.status === 200) {
            const blob = await cropRes.blob();
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = async (e) => {
                await this.uploadMediaFile(folder, newCrop, e.target.result);
                await this.deleteMediaFile(folder, oldCrop);
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        } catch (err) {
          console.warn(`Could not rename crop frame ${i}:`, err);
        }

        // Remap vector
        try {
          const oldVector = `vector-${i}.png`;
          const newVector = `vector-${i - 1}.png`;
          const oldVectorSrc = `${folder}/${oldVector}`;
          const vectorRes = await fetch(oldVectorSrc);
          if (vectorRes.status === 200) {
            const blob = await vectorRes.blob();
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = async (e) => {
                await this.uploadMediaFile(folder, newVector, e.target.result);
                await this.deleteMediaFile(folder, oldVector);
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        } catch (err) {
          console.warn(`Could not rename vector frame ${i}:`, err);
        }
      }
      this.dom.statusTitleText.textContent = 'Frames reordered and updated successfully.';
    } else {
      // Static Mode Gap Fill in mediaCache memory
      for (let i = indexToDelete; i < count; i++) {
        // Crops
        const nextCropKey = `${folder}/example-${i + 1}.png`;
        const activeCropKey = `${folder}/example-${i}.png`;
        if (this.mediaCache[nextCropKey]) {
          this.mediaCache[activeCropKey] = this.mediaCache[nextCropKey];
          delete this.mediaCache[nextCropKey];
        } else {
          delete this.mediaCache[activeCropKey];
        }

        // Vectors
        const nextVectorKey = `${folder}/vector-${i + 1}.png`;
        const activeVectorKey = `${folder}/vector-${i}.png`;
        if (this.mediaCache[nextVectorKey]) {
          this.mediaCache[activeVectorKey] = this.mediaCache[nextVectorKey];
          delete this.mediaCache[nextVectorKey];
        } else {
          delete this.mediaCache[activeVectorKey];
        }
      }
    }

    // Splice the prompt array element to keep indices aligned!
    if (this.activeEx.prompts) {
      this.activeEx.prompts.splice(indexToDelete - 1, 1);
      if (this.activeEx.prompts.length > 0) {
        this.activeEx.prompt = this.activeEx.prompts[0];
      } else {
        this.activeEx.prompt = '';
      }
    }

    // Decrement counter
    this.activeEx.example_image_count -= 1;
    this.renderVectorGrid();
    this.setUnsavedChanges(true);
  }

  /* ---- Exercise Add / Delete Operations ---- */
  createNewExercise() {
    if (this.unsavedChanges && !confirm('Discard unsaved changes on current exercise?')) {
      return;
    }

    const nextOrder = this.program.exercises.length > 0 
      ? Math.max(...this.program.exercises.map(ex => ex.order)) + 1 
      : 1;
    
    const orderStr = nextOrder.toString().padStart(2, '0');
    const tempSlug = `new-exercise-${nextOrder}`;

    const newEx = {
      order: nextOrder,
      slug: tempSlug,
      folder: `exercises/${orderStr}-${tempSlug}`,
      title: `New Exercise ${nextOrder}`,
      category: 'stretch',
      source_image: `${tempSlug}.jpeg`,
      unilateral: false,
      dosage: {
        hold_seconds: 30,
        reps: null,
        sets: null,
        daily: 1,
        weekly: 7
      },
      example_image_count: 1,
      setup: 'Describe the starting posture here.',
      movement: 'Describe the dynamic movement here.',
      tip: null,
      notes: [],
      prompt: 'You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person...',
      prompts: [
        'You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person...'
      ]
    };

    // Store base placeholder vector & crop frame inside cache
    const cacheKeyCrop = `${newEx.folder}/example-1.png`;
    const cacheKeyVector = `${newEx.folder}/vector-1.png`;
    this.mediaCache[cacheKeyCrop] = 'icon-192.png';
    this.mediaCache[cacheKeyVector] = 'icon-512.png';

    this.program.exercises.push(newEx);
    this.renderSidebar();
    this.selectExercise(newEx);
    this.setUnsavedChanges(true);
  }

  deleteActiveExercise() {
    if (!this.activeEx) return;

    if (!confirm(`Are you absolutely sure you want to permanently delete "${this.activeEx.title}"?\nThis removes its clinical record and configuration.`)) {
      return;
    }

    const idx = this.program.exercises.findIndex(ex => ex.slug === this.activeEx.slug);
    if (idx !== -1) {
      this.program.exercises.splice(idx, 1);
      
      // Auto-reorder remaining items to keep indexes sequential
      this.program.exercises.forEach((ex, index) => {
        ex.order = index + 1;
        const padOrder = ex.order.toString().padStart(2, '0');
        // Rename folder prefix cleanly
        ex.folder = ex.folder.replace(/exercises\/\d+-/, `exercises/${padOrder}-`);
      });

      this.activeEx = null;
      this.renderSidebar();
      this.selectExercise(null);
      this.setUnsavedChanges(true);
    }
  }

  /* ---- Local State Input Sync ---- */
  handleFieldInput() {
    if (!this.activeEx) return;

    // Collect all inputs and update activeEx state
    this.activeEx.title = this.dom.fieldTitle.value.trim();
    this.activeEx.category = this.dom.fieldCategory.value;
    this.activeEx.order = parseInt(this.dom.fieldOrder.value, 10) || 1;
    this.activeEx.unilateral = this.dom.fieldUnilateral.checked;

    // Slug generation logic: clean lowercase slugification
    const oldSlug = this.activeEx.slug;
    const newSlug = this.activeEx.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    
    this.activeEx.slug = newSlug || oldSlug;
    const padOrder = this.activeEx.order.toString().padStart(2, '0');
    this.activeEx.folder = `exercises/${padOrder}-${this.activeEx.slug}`;
    this.dom.workspaceTitle.textContent = this.activeEx.title || 'New Exercise';
    this.dom.workspaceFolderPath.textContent = this.activeEx.folder;

    // Dosage collection
    const dosageType = this.dom.fieldDosageType.value;
    const dailyVal = parseInt(this.dom.fieldDaily.value, 10);
    const weeklyVal = parseInt(this.dom.fieldWeekly.value, 10);

    const activeDosage = {
      hold_seconds: null,
      reps: null,
      sets: null,
      daily: isNaN(dailyVal) ? null : dailyVal,
      weekly: isNaN(weeklyVal) ? null : weeklyVal,
    };

    if (dosageType === 'hold') {
      const holdVal = parseInt(this.dom.fieldHold.value, 10);
      activeDosage.hold_seconds = isNaN(holdVal) ? 30 : holdVal;
    } else {
      const repMin = parseInt(this.dom.fieldRepsMin.value, 10);
      const repMax = parseInt(this.dom.fieldRepsMax.value, 10);
      const setMin = parseInt(this.dom.fieldSetsMin.value, 10);
      const setMax = parseInt(this.dom.fieldSetsMax.value, 10);

      activeDosage.reps = (!isNaN(repMin) && !isNaN(repMax)) ? { min: repMin, max: repMax } : null;
      activeDosage.sets = (!isNaN(setMin) && !isNaN(setMax)) ? { min: setMin, max: setMax } : null;
    }

    this.activeEx.dosage = activeDosage;

    // Equipment tags split
    const equipVal = this.dom.fieldEquipment.value.trim();
    this.activeEx.equipment = equipVal 
      ? equipVal.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    // Instructions collection
    this.activeEx.setup = this.dom.fieldSetup.value.trim();
    this.activeEx.movement = this.dom.fieldMovement.value.trim();
    const tipVal = this.dom.fieldTip.value.trim();
    this.activeEx.tip = tipVal || null;

    // Collect Dynamic Notes list inputs
    const noteInputs = this.dom.notesContainer.querySelectorAll('.list-note-input');
    this.activeEx.notes = Array.from(noteInputs)
      .map(input => input.value.trim())
      .filter(val => val.length > 0);

    // Sync legacy ex.prompt with prompts[0]
    if (this.activeEx.prompts && this.activeEx.prompts.length > 0) {
      this.activeEx.prompt = this.activeEx.prompts[0];
    }

    this.setUnsavedChanges(true);
  }

  setUnsavedChanges(unsaved) {
    this.unsavedChanges = unsaved;
    const bar = document.querySelector('.save-action-bar');
    
    if (unsaved) {
      bar.style.opacity = '1';
      bar.style.pointerEvents = 'auto';
      bar.style.transform = 'translateX(-50%) translateY(0)';
      this.dom.statusTitleText.textContent = 'You have unsaved changes in your workspace.';
      this.dom.statusSubDot.style.background = 'var(--color-warning)';
    } else {
      // Hide bar only if clean
      this.dom.statusTitleText.textContent = 'All changes saved to memory.';
      this.dom.statusSubDot.style.background = 'var(--color-brand)';
    }
  }

  /* ---- Discard & Reload ---- */
  discardChanges() {
    if (confirm('Are you sure you want to discard all local modifications and reload?')) {
      window.location.reload();
    }
  }

  /* ---- Master Save Handler ---- */
  async saveChanges() {
    try {
      this.dom.btnSave.disabled = true;
      this.dom.btnSaveText.textContent = 'Saving...';

      // 1. Perform program schema structural guard check
      validateProgram(this.program);

      // 2. Perform save depending on the mode
      if (this.mode === 'dev') {
        const res = await fetch('/api/save-program', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.program),
        });
        
        const data = await res.json();
        if (data.success) {
          this.setUnsavedChanges(false);
          this.dom.statusTitleText.textContent = 'Program changes written to disk!';
          this.renderSidebar();
          
          // Re-select active
          if (this.activeEx) {
            const reselected = this.program.exercises.find(ex => ex.slug === this.activeEx.slug);
            this.selectExercise(reselected || null);
          }
          
          alert('Exercise program successfully saved to disk!');
        } else {
          throw new Error(data.error || 'Server rejected the write request');
        }
      } else {
        // Static Mode -> Download data.js Fallback
        const formattedJSON = JSON.stringify(this.program, null, 2);
        
        // Re-construct the file program.js format
        const codeContent = `/**
 * Neck PT Companion - Canonical Program Prescription Data
 *
 * This is the SINGLE SOURCE OF TRUTH for the program. The app reads only this file.
 * Automatically generated via the Exercise Admin Panel.
 */

export const PROGRAM = ${formattedJSON};

// Valid clinical exercise categories
const VALID_CATEGORIES = new Set(['stretch', 'isometric', 'mobilization', 'nerve-glide', 'strengthening']);

/**
 * Validates the program schema at startup. Throws a descriptive Error if
 * data.js has been edited incorrectly, so problems surface immediately
 * rather than crashing mid-routine with a cryptic undefined read.
 * @param {Object} program - The PROGRAM export to validate
 * @returns {void}
 */
export function validateProgram(program) {
  if (!program || !Array.isArray(program.exercises) || program.exercises.length === 0) {
    throw new Error('[data] PROGRAM.exercises must be a non-empty array.');
  }

  program.exercises.forEach((ex, i) => {
    const id = \`exercises[\${i}] "\${ex.slug || '(no slug)'}"\`;

    if (typeof ex.slug !== 'string' || !ex.slug) throw new Error(\`\${id}: missing slug\`);
    if (typeof ex.title !== 'string' || !ex.title) throw new Error(\`\${id}: missing title\`);
    if (!VALID_CATEGORIES.has(ex.category)) {
      throw new Error(\`\${id}: invalid category "\${ex.category}". Must be one of: \${\[...VALID_CATEGORIES].join(', ')}\`);
    }
    if (typeof ex.folder !== 'string' || !ex.folder) throw new Error(\`\${id}: missing folder\`);
    if (typeof ex.unilateral !== 'boolean') throw new Error(\`\${id}: unilateral must be a boolean\`);
    if (typeof ex.example_image_count !== 'number' || ex.example_image_count < 1) {
      throw new Error(\`\${id}: example_image_count must be a positive number\`);
    }
    if (!ex.dosage || typeof ex.dosage !== 'object') throw new Error(\`\${id}: missing dosage\`);

    const d = ex.dosage;
    const hasHold = d.hold_seconds !== null && d.hold_seconds !== undefined;
    const hasReps = d.reps !== null && d.reps !== undefined;
    if (!hasHold && !hasReps) {
      throw new Error(\`\${id}: dosage must have either hold_seconds or reps\`);
    }
    if (hasHold && typeof d.hold_seconds !== 'number') throw new Error(\`\${id}: dosage.hold_seconds must be a number\`);
    if (hasReps && (typeof d.reps !== 'object' || !('min' in d.reps) || !('max' in d.reps))) {
      throw new Error(\`\${id}: dosage.reps must be an object with min and max\`);
    }
    if (!ex.setup) throw new Error(\`\${id}: missing setup text\`);
    if (!ex.movement) throw new Error(\`\${id}: missing movement text\`);
  });
}
`;

        const blob = new Blob([codeContent], { type: 'application/javascript;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.setUnsavedChanges(false);
        this.dom.statusTitleText.textContent = 'data.js downloaded successfully!';
        
        alert('Your updated "data.js" file has been downloaded!\n\nPlease replace the file at "src/data.js" in your repository with this file and push to GitHub.');
      }
    } catch (err) {
      console.error(err);
      alert(`Schema Validation Failed:\n\n${err.message}\n\nPlease correct details and try again.`);
    } finally {
      this.dom.btnSave.disabled = false;
      this.dom.btnSaveText.textContent = this.mode === 'dev' ? 'Save to Disk' : 'Download data.js';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.AdminInstance = new ExerciseAdmin();
});
