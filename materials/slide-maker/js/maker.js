/**
 * Slide Maker - Main Application
 */
const App = {
  meta: { keyword: '', title: '', date: '', presenter: '', organization: '', transition: 'fade', themeColor: '#3776A1' },
  _encryptEnabled: false,
  _secretKey: '',
  _masterKey: '',
  _KEY_TTL: 60 * 60 * 1000, // 1 hour

  _storeKeys(secret, master) {
    this._secretKey = secret;
    this._masterKey = master;
    const data = JSON.stringify({ s: secret, m: master, t: Date.now() });
    sessionStorage.setItem('slide-maker-keys', data);
  },

  _loadKeys() {
    try {
      const raw = sessionStorage.getItem('slide-maker-keys');
      if (!raw) return false;
      const { s, m, t } = JSON.parse(raw);
      if (Date.now() - t > this._KEY_TTL) {
        sessionStorage.removeItem('slide-maker-keys');
        return false;
      }
      this._secretKey = s;
      this._masterKey = m;
      return true;
    } catch (e) {
      return false;
    }
  },

  _clearKeys() {
    this._secretKey = '';
    this._masterKey = '';
    sessionStorage.removeItem('slide-maker-keys');
  },
  THEME_PRESETS: [
    { name: 'Ocean', color: '#3776A1', secondary: '#6EB1D6' },
    { name: 'Forest', color: '#2d6a4f', secondary: '#52b788' },
    { name: 'Sunset', color: '#e85d04', secondary: '#faa307' },
    { name: 'Berry', color: '#7b2cbf', secondary: '#c77dff' },
    { name: 'Slate', color: '#475569', secondary: '#94a3b8' },
    { name: 'Rose', color: '#be123c', secondary: '#fb7185' },
  ],
  slides: [],
  selectedIndex: -1,
  dragIndex: -1,
  _ctxIndex: -1,

  mobileTab: 'slides',

  // Cache for HRD CSS (fetched once)

  // Collapse section remembered states
  _collapseStates: {},

  // Undo/Redo history
  _undoStack: [],
  _redoStack: [],
  _maxHistory: 50,
  _undoIgnore: false,
  _undoDebounceTimer: null,

  pushUndoState() {
    if (this._undoIgnore) return;
    const state = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
    if (this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1] === state) return;
    this._undoStack.push(state);
    this._redoStack.length = 0;
    if (this._undoStack.length > this._maxHistory) this._undoStack.splice(0, this._undoStack.length - this._maxHistory);
  },

  debouncedPushUndoState() {
    if (this._undoIgnore) return;
    if (!this._undoDebounceTimer) {
      this.pushUndoState();
    }
    clearTimeout(this._undoDebounceTimer);
    this._undoDebounceTimer = setTimeout(() => { this._undoDebounceTimer = null; }, 1000);
  },

  undo() {
    if (this._undoStack.length === 0) return;
    const currentState = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
    this._redoStack.push(currentState);
    const prev = JSON.parse(this._undoStack.pop());
    this.meta = prev.meta;
    this.slides = prev.slides;
    this.selectedIndex = prev.selectedIndex;
    this._undoIgnore = true;
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
    this._undoIgnore = false;
  },

  redo() {
    if (this._redoStack.length === 0) return;
    const currentState = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
    this._undoStack.push(currentState);
    const next = JSON.parse(this._redoStack.pop());
    this.meta = next.meta;
    this.slides = next.slides;
    this.selectedIndex = next.selectedIndex;
    this._undoIgnore = true;
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
    this._undoIgnore = false;
  },

  // File System Access API handles
  _rootDirHandle: null,   // materials/ directory
  _kwDirHandle: null,     // materials/{keyword}/ directory

  // Persist/restore directory handles via IndexedDB (survives page reload)
  async _storeHandle(key, handle) {
    const db = await this._openHandleDB();
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(handle, key);
    await new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    db.close();
  },

  async _loadHandle(key) {
    const db = await this._openHandleDB();
    const tx = db.transaction('handles', 'readonly');
    const req = tx.objectStore('handles').get(key);
    const result = await new Promise((r, j) => { req.onsuccess = () => r(req.result); req.onerror = j; });
    db.close();
    return result || null;
  },

  _openHandleDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('slide-maker-handles', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('handles');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async _restoreHandles() {
    try {
      // Only restore if already granted — don't prompt on load
      const kwDir = await this._loadHandle('kwDir');
      if (kwDir) {
        const perm = await kwDir.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') this._kwDirHandle = kwDir;
        else this._pendingKwDir = kwDir; // save for lazy prompt on first save
      }
      const rootDir = await this._loadHandle('rootDir');
      if (rootDir) {
        const perm = await rootDir.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') this._rootDirHandle = rootDir;
        else this._pendingRootDir = rootDir;
      }
    } catch (e) {
      console.warn('Failed to restore dir handles:', e);
    }
  },

  /** Request permission lazily — only called when user triggers a disk save */
  async _ensureDiskAccess() {
    if (this._kwDirHandle) return true;
    if (this._pendingKwDir) {
      const perm = await this._pendingKwDir.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        this._kwDirHandle = this._pendingKwDir;
        this._pendingKwDir = null;
      }
    }
    if (this._pendingRootDir) {
      const perm = await this._pendingRootDir.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        this._rootDirHandle = this._pendingRootDir;
        this._pendingRootDir = null;
      }
    }
    return !!this._kwDirHandle;
  },

  // --- Custom Dialog (replaces native alert/confirm) ---
  _dialogResolve: null,

  /**
   * Show a styled dialog. Returns a Promise.
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} opts.message
   * @param {'warn'|'info'|'success'} [opts.type='info']
   * @param {string} [opts.icon] - FontAwesome icon class (auto-picked from type if omitted)
   * @param {Array<{label:string, value:*, style?:string}>} [opts.buttons]
   */
  dialog(opts) {
    const overlay = document.getElementById('dialog-overlay');
    const iconEl = document.getElementById('dialog-icon');
    const titleEl = document.getElementById('dialog-title');
    const msgEl = document.getElementById('dialog-message');
    const actionsEl = document.getElementById('dialog-actions');

    const type = opts.type || 'info';
    const icons = { warn: 'fa-triangle-exclamation', info: 'fa-circle-info', success: 'fa-circle-check' };
    const icon = opts.icon || icons[type] || icons.info;

    iconEl.className = 'dialog-icon ' + type;
    iconEl.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    titleEl.textContent = opts.title || '';
    msgEl.textContent = opts.message || '';

    const buttons = opts.buttons || [{ label: 'OK', value: true, style: 'primary' }];
    actionsEl.innerHTML = buttons.map((b, i) =>
      `<button class="btn btn-${b.style || (i === buttons.length - 1 ? 'primary' : 'ghost')}" data-dialog-value="${i}">${b.label}</button>`
    ).join('');

    overlay.style.display = 'flex';

    return new Promise(resolve => {
      this._dialogResolve = resolve;
      actionsEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = buttons[parseInt(btn.dataset.dialogValue)].value;
          overlay.style.display = 'none';
          this._dialogResolve = null;
          resolve(val);
        }, { once: true });
      });
      // Close on overlay click → resolve with false/null
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          this._dialogResolve = null;
          resolve(buttons[0].value); // first button is typically cancel
        }
      }, { once: true });
    });
  },

  /** Shorthand: confirm dialog (returns true/false) */
  async confirmDialog(title, message, confirmLabel = 'Continue') {
    return this.dialog({
      title,
      message,
      type: 'warn',
      buttons: [
        { label: 'Cancel', value: false, style: 'ghost' },
        { label: confirmLabel, value: true, style: 'danger' }
      ]
    });
  },

  /** Shorthand: alert dialog (returns when dismissed) */
  async alertDialog(title, message, type = 'info') {
    return this.dialog({ title, message, type, buttons: [{ label: 'OK', value: true, style: 'primary' }] });
  },

  _showDecryptPrompt(envelope) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('landing-decrypt');
      const input = document.getElementById('landing-decrypt-key');
      const btn = document.getElementById('landing-decrypt-submit');
      const errorEl = document.getElementById('landing-decrypt-error');
      const loadingEl = document.getElementById('landing-decrypt-loading');

      overlay.style.display = 'flex';
      input.value = '';
      errorEl.style.display = 'none';
      input.focus();

      const attempt = async () => {
        const secret = input.value.trim();
        if (!secret) { input.focus(); return; }
        btn.disabled = true;
        loadingEl.classList.add('visible');
        errorEl.style.display = 'none';

        try {
          const data = await SlideCrypto.decrypt(envelope, secret);
          overlay.style.display = 'none';
          btn.disabled = false;
          loadingEl.classList.remove('visible');
          resolve({ data, secret });
        } catch (e) {
          btn.disabled = false;
          loadingEl.classList.remove('visible');
          errorEl.textContent = 'Invalid key. Please try again.';
          errorEl.style.display = 'block';
          input.value = '';
          input.focus();
        }
      };

      btn.onclick = attempt;
      input.onkeydown = (e) => { if (e.key === 'Enter') attempt(); };
    });
  },

  async init() {
    // If there's saved session data, skip landing and go straight to app
    const saved = localStorage.getItem('slide-maker-data');
    if (saved) {
      this.enterApp();
      this.loadFromLocalStorage();
      await this._restoreHandles();
      return;
    }
    // No saved data — show landing
    document.getElementById('landing-screen').style.display = '';
    this.bindLanding();
  },

  bindLanding() {
    const startBtn = document.getElementById('landing-start');
    const keywordInput = document.getElementById('landing-keyword');
    const dropZone = document.getElementById('landing-drop');
    const errorEl = document.getElementById('landing-error');

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      setTimeout(() => { errorEl.style.display = 'none'; }, 4000);
    };

    // --- New presentation ---
    const startFresh = async () => {
      const kw = keywordInput.value.replace(/[^a-zA-Z0-9\-_]/g, '');
      if (!kw) { keywordInput.focus(); keywordInput.style.borderColor = 'var(--red)'; return; }

      if (!window.showDirectoryPicker) {
        showError('Your browser does not support folder access. Please use Chrome or Edge.');
        return;
      }

      // Step 1: Pick directory and check for duplicates (no files created yet)
      let rootDir;
      try {
        rootDir = await window.showDirectoryPicker({ mode: 'readwrite' });
        // Check if keyword folder already exists
        try {
          await rootDir.getDirectoryHandle(kw);
          showError(`"${kw}" already exists. Use "Continue Existing" to open it.`);
          return;
        } catch (e) {
          if (e.name !== 'NotFoundError' && !(e instanceof TypeError)) throw e;
          // NotFoundError = does not exist, good
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        showError(e.message);
        return;
      }

      // Step 2: Enter app immediately — save to localStorage NOW (not debounced)
      // so if Live Server reloads the page, init() finds the data and skips landing
      this._rootDirHandle = rootDir;
      this.meta = { keyword: kw, title: '', date: '', presenter: '', organization: '', transition: 'fade', themeColor: '#3776A1' };
      this.slides = [];
      this.selectedIndex = -1;
      this.applyKeywordBaseUrl();
      this.enterApp();
      const data = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
      localStorage.setItem('slide-maker-data', data);
      this._lastSavedJson = data;

      // Step 3: Create folder structure on disk (after app is visible)
      try {
        const kwDir = await rootDir.getDirectoryHandle(kw, { create: true });
        this._kwDirHandle = kwDir;
        const assetsDir = await kwDir.getDirectoryHandle('assets', { create: true });
        await assetsDir.getDirectoryHandle('images', { create: true });
        await this.saveToDisk();
        // Persist handles for reload survival
        await this._storeHandle('rootDir', rootDir);
        await this._storeHandle('kwDir', kwDir);
      } catch (e) {
        console.warn('Folder scaffold failed:', e);
      }
    };

    startBtn.addEventListener('click', startFresh);
    keywordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startFresh(); });
    keywordInput.addEventListener('input', () => { keywordInput.style.borderColor = ''; });

    // --- Load existing JSON via directory picker ---
    const loadExisting = async () => {
      if (!window.showDirectoryPicker) {
        showError('Your browser does not support folder access. Please use Chrome or Edge.');
        return;
      }
      try {
        // Let user pick the keyword directory directly (e.g. materials/hrd-20260325/)
        const kwDir = await window.showDirectoryPicker({ mode: 'readwrite' });

        // Read slides.json from it
        let fileHandle;
        try {
          fileHandle = await kwDir.getFileHandle('slides.json');
        } catch (e) {
          showError('No slides.json found in selected folder');
          return;
        }

        const file = await fileHandle.getFile();
        const text = await file.text();
        let data = JSON.parse(text);

        // Handle encrypted files
        if (SlideCrypto.isEncrypted(data)) {
          const result = await this._showDecryptPrompt(data);
          if (!result) return;
          data = result.data;
          this._encryptEnabled = true;
          this._storeKeys(result.secret, result.secret);
        }

        if (!data.slides || !Array.isArray(data.slides)) {
          showError('Invalid format: missing "slides" array');
          return;
        }

        // Store handles for future saves
        this._kwDirHandle = kwDir;
        await this._storeHandle('kwDir', kwDir);

        if (data.meta) this.meta = data.meta;
        if (!this.meta.keyword) this.meta.keyword = kwDir.name;
        if (data.slides) this.slides = this.flattenForEditing(data.slides);
        this.selectedIndex = this.slides.length > 0 ? 0 : -1;

        this.applyKeywordBaseUrl();
        this.enterApp();
        if (this.selectedIndex >= 0) {
          this.renderEditor();
          this.renderPreview();
        }
        this.saveToLocalStorage();
      } catch (e) {
        if (e.name === 'AbortError') return;
        showError(e.message);
      }
    };

    dropZone.addEventListener('click', loadExisting);
  },

  /**
   * Write slides.json to the keyword directory on disk
   */
  async saveToDisk() {
    // No disk access at all — skip silently
    if (!this._kwDirHandle && !this._pendingKwDir && !this._rootDirHandle) return;

    // Try to restore handle if pending
    if (!this._kwDirHandle) await this._ensureDiskAccess();

    // Try to scaffold from root if we have root but no keyword handle
    if (!this._kwDirHandle && this._rootDirHandle && this.meta.keyword) {
      try {
        const kwDir = await this._rootDirHandle.getDirectoryHandle(this.meta.keyword, { create: true });
        this._kwDirHandle = kwDir;
        const assetsDir = await kwDir.getDirectoryHandle('assets', { create: true });
        await assetsDir.getDirectoryHandle('images', { create: true });
        await this._storeHandle('kwDir', kwDir);
      } catch (e) {
        console.warn('Could not scaffold folder:', e);
        return;
      }
    }

    if (!this._kwDirHandle) return;

    try {
      const json = this.buildExportJSON();
      let output;
      if (this._encryptEnabled) {
        if (!this._secretKey || !this._masterKey) this._loadKeys();
        if (!this._secretKey || !this._masterKey) {
          await this.alertDialog('Keys Expired', 'Your encryption keys have expired (1 hour limit). Please re-enter them in Settings.', 'warn');
          return;
        }
        output = await SlideCrypto.encrypt(json, this._secretKey, this._masterKey);
      } else {
        output = json;
      }
      const str = JSON.stringify(output, null, 2);
      const fileHandle = await this._kwDirHandle.getFileHandle('slides.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(str);
      await writable.close();
    } catch (e) {
      if (e.name === 'NotFoundError') {
        // Handle went stale — clear it so next save re-scaffolds
        this._kwDirHandle = null;
        console.warn('Directory handle stale, will re-scaffold on next save');
      } else {
        console.error('saveToDisk failed:', e);
      }
    }
  },

  enterApp() {
    // Hide landing, show app
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('app').style.display = '';

    try {
      this.bindGlobalEvents();
      this.bindMobileEvents();
      this.bindContextMenu();
      this.updateTopbarTitle();
      this.renderSlideList();
      this.renderSlideTypeGrid();
    } catch (e) {
      console.error('enterApp setup error:', e);
    }
  },

  editorMode: 'form', // 'form' or 'json'
  _dirty: false,
  _saveTimer: null,
  _lastSavedJson: '',
  previewDetached: false,
  _previewChannel: null,

  bindGlobalEvents() {
    document.getElementById('btn-meta').addEventListener('click', () => this.openMetaModal());
    document.getElementById('btn-add-slide').addEventListener('click', () => this.openModal('modal-add-slide'));
    // Preview button removed — use detach button in preview pane
    document.getElementById('btn-new').addEventListener('click', () => this.newPresentation());
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());
    this.bindViewMenu();

    // Mode toggle (Form / JSON)
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setEditorMode(btn.dataset.mode));
    });


    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal(overlay.id);
      });
    });

    document.getElementById('btn-save-meta').addEventListener('click', () => this.saveMeta());
    document.getElementById('btn-export-presentation')?.addEventListener('click', () => this.exportPresentation());
    document.getElementById('meta-color').addEventListener('input', (e) => {
      document.getElementById('meta-color-hex').textContent = e.target.value.toUpperCase();
    });

    const editorScroll = document.getElementById('editor-scroll');
    editorScroll.addEventListener('input', (e) => this.handleEditorInput(e));
    editorScroll.addEventListener('click', (e) => this.handleEditorClick(e));
    editorScroll.addEventListener('change', (e) => this.handleEditorChange(e));
    editorScroll.addEventListener('keydown', (e) => this.handleEditorKeydown(e));

    // Image drag-drop on editor inputs
    editorScroll.addEventListener('dragover', (e) => {
      const input = e.target.closest('input[data-field*="src"], input[data-field*="image"]');
      if (input && e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        input.classList.add('drag-over-input');
      }
    });
    editorScroll.addEventListener('dragleave', (e) => {
      const input = e.target.closest('input[data-field*="src"], input[data-field*="image"]');
      if (input) input.classList.remove('drag-over-input');
    });
    editorScroll.addEventListener('drop', async (e) => {
      const input = e.target.closest('input[data-field*="src"], input[data-field*="image"]');
      if (!input || !e.dataTransfer.files.length) return;
      e.preventDefault();
      input.classList.remove('drag-over-input');
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;

      // Save to assets/images/ if we have directory access
      if (this._kwDirHandle) {
        try {
          const assetsDir = await this._kwDirHandle.getDirectoryHandle('assets', { create: true });
          const imagesDir = await assetsDir.getDirectoryHandle('images', { create: true });
          const fileHandle = await imagesDir.getFileHandle(file.name, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(file);
          await writable.close();
          input.value = `./assets/images/${file.name}`;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (err) {
          console.error('Failed to save dropped image:', err);
        }
      }
    });

    // Slide search/filter
    document.getElementById('slide-search-input').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.slide-thumb').forEach(thumb => {
        if (!query) { thumb.classList.remove('filtered-out'); return; }
        const idx = parseInt(thumb.dataset.index);
        const slide = this.slides[idx];
        const typeDef = SLIDE_TYPES[slide.type];
        const searchText = [
          slide.type, typeDef?.label || '', slide.title || '', slide.text || '',
          slide.quote || '', (slide.items || []).map(i => i.title || '').join(' ')
        ].join(' ').toLowerCase();
        thumb.classList.toggle('filtered-out', !searchText.includes(query));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveNow();
      }
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        this.undo();
        return;
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        this.redo();
        return;
      }
      // Ctrl+D: duplicate current slide
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && !e.shiftKey) {
        e.preventDefault();
        if (this.selectedIndex >= 0) this.duplicateSlide(this.selectedIndex);
        return;
      }
      // Ctrl+Shift+ArrowUp: move slide up
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.selectedIndex > 0) this.moveSlide(this.selectedIndex, this.selectedIndex - 1);
        return;
      }
      // Ctrl+Shift+ArrowDown: move slide down
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.slides.length - 1) this.moveSlide(this.selectedIndex, this.selectedIndex + 1);
        return;
      }
      // Arrow keys navigate slides (only when not typing in an input/textarea)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      // Delete key: delete current slide
      if (e.key === 'Delete') {
        e.preventDefault();
        if (this.selectedIndex >= 0) this.deleteSlide(this.selectedIndex);
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.selectedIndex > 0) this.selectSlide(this.selectedIndex - 1);
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.selectedIndex < this.slides.length - 1) this.selectSlide(this.selectedIndex + 1);
      }
    });

    window.addEventListener('resize', () => {
      this.scalePreview();
      this.scaleThumbnails();
      if (this._monacoEditor) this._monacoEditor.layout();
    });

    // Warn before leaving with unsaved changes
    // Auto-save to localStorage on exit (skip if intentionally cleared)
    window.addEventListener('beforeunload', () => {
      if (this._clearingSession) return;
      const data = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
      localStorage.setItem('slide-maker-data', data);
    });

  },

  bindMobileEvents() {
    // Mobile panel-switching pills
    document.querySelectorAll('.pill-mobile[data-pill]').forEach(pill => {
      pill.addEventListener('click', () => this.setMobileTab(pill.dataset.pill));
    });
    document.getElementById('main-layout').dataset.mobileTab = 'slides';
  },

  setMobileTab(tab) {
    this.mobileTab = tab;
    document.querySelectorAll('.pill-mobile[data-pill]').forEach(p => p.classList.toggle('active', p.dataset.pill === tab));
    document.getElementById('main-layout').dataset.mobileTab = tab;
  },

  openModal(id) { document.getElementById(id).style.display = 'flex'; },
  closeModal(id) { document.getElementById(id).style.display = 'none'; },

  // --- Meta ---
  openMetaModal() {
    document.getElementById('meta-keyword').value = this.meta.keyword || '';
    document.getElementById('meta-transition').value = this.meta.transition || 'fade';
    const color = this.meta.themeColor || '#3776A1';
    document.getElementById('meta-color').value = color;
    document.getElementById('meta-color-hex').textContent = color.toUpperCase();
    // Render theme presets
    const presetsEl = document.getElementById('theme-presets');
    if (presetsEl) {
      presetsEl.innerHTML = this.THEME_PRESETS.map(t =>
        `<button class="theme-preset" data-color="${t.color}" title="${t.name}"><span class="theme-preset-dot" style="background:${t.color}"></span>${t.name}</button>`
      ).join('');
      presetsEl.querySelectorAll('.theme-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('meta-color').value = btn.dataset.color;
          document.getElementById('meta-color-hex').textContent = btn.dataset.color.toUpperCase();
        });
      });
    }
    document.getElementById('meta-allow-pdf').checked = this.meta.allowPdfExport !== false;
    // Encryption fields
    if (!this._secretKey || !this._masterKey) this._loadKeys();
    document.getElementById('meta-encrypt').checked = this._encryptEnabled;
    document.getElementById('meta-secret').value = this._secretKey;
    document.getElementById('meta-master-key').value = this._masterKey;
    document.getElementById('encrypt-fields').style.display = this._encryptEnabled ? '' : 'none';
    document.getElementById('meta-encrypt').addEventListener('change', (e) => {
      document.getElementById('encrypt-fields').style.display = e.target.checked ? '' : 'none';
    });
    // Password strength indicator
    const strengthEl = document.getElementById('secret-strength');
    strengthEl.innerHTML = '<div class="key-strength-bar"><div class="key-strength-fill"></div></div><span class="key-strength-label"></span>';
    document.getElementById('meta-secret').addEventListener('input', (e) => {
      const pw = e.target.value;
      const s = this._keyStrength(pw);
      strengthEl.className = 'key-strength ' + s.level;
      strengthEl.querySelector('.key-strength-label').textContent = s.label;
    });
    this.openModal('modal-meta');
  },
  saveMeta() {
    this.pushUndoState();
    this.meta.keyword = document.getElementById('meta-keyword').value.replace(/[^a-zA-Z0-9\-_]/g, '');
    this.meta.transition = document.getElementById('meta-transition').value;
    this.meta.themeColor = document.getElementById('meta-color').value;
    this.meta.allowPdfExport = document.getElementById('meta-allow-pdf').checked;
    // Save encryption settings
    const encryptChecked = document.getElementById('meta-encrypt').checked;
    const secret = document.getElementById('meta-secret').value;
    const master = document.getElementById('meta-master-key').value;
    if (encryptChecked) {
      if (secret.length < 12) {
        this.alertDialog('Weak Secret Key', 'Secret key must be at least 12 characters.', 'warn');
        return;
      }
      if (master.length < 12) {
        this.alertDialog('Weak Master Key', 'Master key must be at least 12 characters.', 'warn');
        return;
      }
    }
    this._encryptEnabled = encryptChecked;
    if (encryptChecked && secret && master) {
      this._storeKeys(secret, master);
    } else if (!encryptChecked) {
      this._clearKeys();
    }
    this.closeModal('modal-meta');
    this.applyKeywordBaseUrl();
    this.applyThemeColor();
    this.updateTopbarTitle();
    this.renderSlideList();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  _keyStrength(pw) {
    if (!pw) return { level: '', label: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 2) return { level: 'weak', label: 'Weak — easy to crack' };
    if (score <= 3) return { level: 'fair', label: 'Fair — add more characters' };
    if (score <= 4) return { level: 'good', label: 'Good' };
    return { level: 'strong', label: 'Strong' };
  },

  applyKeywordBaseUrl() {
    const kw = this.meta.keyword;
    SlideRenderer.setBaseUrl(kw ? `../${kw}/` : '');
  },

  async newPresentation() {
    if (this.slides.length > 0) {
      const ok = await this.confirmDialog('New Presentation', 'Start a new presentation? Current work will be lost.', 'Start New');
      if (!ok) return;
    }
    this._clearingSession = true;
    localStorage.removeItem('slide-maker-data');
    this._rootDirHandle = null;
    this._kwDirHandle = null;
    location.reload();
  },

  // --- Slide Type Grid ---
  _slideSkeletons: {
    'title-hero': `<div class="sk-center">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-bar sk-w70 sk-h6 sk-mb2"></div>
      <div class="sk-bar sk-w50 sk-h3 sk-mb6"></div>
      <div class="sk-bar sk-w30 sk-h2"></div>
    </div>`,
    content: `<div class="sk-pad">
      <div class="sk-bar sk-w50 sk-h4 sk-mb6"></div>
      <div class="sk-bar sk-w90 sk-h2 sk-mb3"></div>
      <div class="sk-bar sk-w80 sk-h2 sk-mb3"></div>
      <div class="sk-bar sk-w85 sk-h2"></div>
    </div>`,
    'two-column': `<div class="sk-pad">
      <div class="sk-bar sk-w50 sk-h4 sk-mb6"></div>
      <div class="sk-cols">
        <div class="sk-col"><div class="sk-bar sk-w60 sk-h3 sk-mb3"></div><div class="sk-bar sk-w90 sk-h2 sk-mb2"></div><div class="sk-bar sk-w80 sk-h2"></div></div>
        <div class="sk-col"><div class="sk-bar sk-w60 sk-h3 sk-mb3"></div><div class="sk-bar sk-w90 sk-h2 sk-mb2"></div><div class="sk-bar sk-w80 sk-h2"></div></div>
      </div>
    </div>`,
    comparison: `<div class="sk-pad">
      <div class="sk-bar sk-w50 sk-h4 sk-mb6"></div>
      <div class="sk-cols">
        <div class="sk-col sk-col-accent"><div class="sk-bar sk-w50 sk-h3 sk-mb3"></div><div class="sk-bar sk-w80 sk-h2 sk-mb2"></div><div class="sk-bar sk-w70 sk-h2"></div></div>
        <div class="sk-col sk-col-accent"><div class="sk-bar sk-w50 sk-h3 sk-mb3"></div><div class="sk-bar sk-w80 sk-h2 sk-mb2"></div><div class="sk-bar sk-w70 sk-h2"></div></div>
      </div>
    </div>`,
    quote: `<div class="sk-center">
      <div class="sk-icon sk-mb4">&#8220;</div>
      <div class="sk-bar sk-w80 sk-h3 sk-mb2"></div>
      <div class="sk-bar sk-w60 sk-h3 sk-mb4"></div>
      <div class="sk-bar sk-w30 sk-h2"></div>
    </div>`,
    section: `<div class="sk-center">
      <div class="sk-num sk-mb2">01</div>
      <div class="sk-bar sk-w60 sk-h6 sk-mb2"></div>
      <div class="sk-bar sk-w40 sk-h3"></div>
    </div>`,
    toc: `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h4 sk-mb6"></div>
      <div class="sk-toc-item sk-mb3"><div class="sk-toc-num">01</div><div class="sk-bar sk-w60 sk-h2"></div></div>
      <div class="sk-toc-item sk-mb3"><div class="sk-toc-num">02</div><div class="sk-bar sk-w50 sk-h2"></div></div>
      <div class="sk-toc-item"><div class="sk-toc-num">03</div><div class="sk-bar sk-w55 sk-h2"></div></div>
    </div>`,
    blank: `<div class="sk-center"><div class="sk-bar sk-w30 sk-h2" style="opacity:.3"></div></div>`,
    video: `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-img sk-mb2"><i class="fa-solid fa-play" style="font-size:10px;opacity:.4"></i></div>
    </div>`,
    'image-grid': `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-grid3"><div class="sk-grid-item"></div><div class="sk-grid-item"></div><div class="sk-grid-item"></div></div>
    </div>`,
    table: `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-table">
        <div class="sk-tr sk-thead"><div class="sk-td"></div><div class="sk-td"></div><div class="sk-td"></div></div>
        <div class="sk-tr"><div class="sk-td"></div><div class="sk-td"></div><div class="sk-td"></div></div>
        <div class="sk-tr"><div class="sk-td"></div><div class="sk-td"></div><div class="sk-td"></div></div>
      </div>
    </div>`,
    stats: `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-grid3">
        <div class="sk-stat"><div class="sk-bar sk-w60 sk-h5 sk-mb2" style="margin:0 auto"></div><div class="sk-bar sk-w80 sk-h2" style="margin:0 auto"></div></div>
        <div class="sk-stat"><div class="sk-bar sk-w60 sk-h5 sk-mb2" style="margin:0 auto"></div><div class="sk-bar sk-w80 sk-h2" style="margin:0 auto"></div></div>
        <div class="sk-stat"><div class="sk-bar sk-w60 sk-h5 sk-mb2" style="margin:0 auto"></div><div class="sk-bar sk-w80 sk-h2" style="margin:0 auto"></div></div>
      </div>
    </div>`,
    code: `<div class="sk-pad">
      <div class="sk-code">
        <div class="sk-code-head"><div class="sk-bar sk-w30 sk-h2"></div></div>
        <div class="sk-code-body"><div class="sk-bar sk-w70 sk-h2 sk-mb2"></div><div class="sk-bar sk-w50 sk-h2 sk-mb2"></div><div class="sk-bar sk-w60 sk-h2"></div></div>
      </div>
    </div>`,
    timeline: `<div class="sk-pad">
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-tl">
        <div class="sk-tl-item"><div class="sk-tl-dot"></div><div class="sk-tl-line"></div><div class="sk-tl-text"><div class="sk-bar sk-w40 sk-h2 sk-mb1"></div><div class="sk-bar sk-w70 sk-h2"></div></div></div>
        <div class="sk-tl-item"><div class="sk-tl-dot"></div><div class="sk-tl-line"></div><div class="sk-tl-text"><div class="sk-bar sk-w40 sk-h2 sk-mb1"></div><div class="sk-bar sk-w60 sk-h2"></div></div></div>
        <div class="sk-tl-item"><div class="sk-tl-dot"></div><div class="sk-tl-text"><div class="sk-bar sk-w40 sk-h2 sk-mb1"></div><div class="sk-bar sk-w50 sk-h2"></div></div></div>
      </div>
    </div>`,
    discussion: `<div class="sk-center">
      <div class="sk-icon sk-mb2"><i class="fa-solid fa-comments" style="font-size:10px;opacity:.5"></i></div>
      <div class="sk-bar sk-w50 sk-h5 sk-mb2"></div>
      <div class="sk-bar sk-w60 sk-h3 sk-mb4"></div>
      <div class="sk-bar sk-w70 sk-h3" style="border-radius:20px"></div>
    </div>`,
    connect: `<div class="sk-center">
      <div class="sk-bar sk-w50 sk-h5 sk-mb2"></div>
      <div class="sk-bar sk-w40 sk-h3 sk-mb4"></div>
      <div class="sk-bar sk-w60 sk-h2 sk-mb2"></div>
      <div class="sk-bar sk-w55 sk-h2 sk-mb2"></div>
      <div class="sk-bar sk-w50 sk-h2"></div>
    </div>`
  },

  renderSlideTypeGrid() {
    const grid = document.getElementById('slide-type-grid');
    grid.innerHTML = SLIDE_TYPE_CATEGORIES.map(cat => `
      <div class="type-category">
        <div class="type-category-label">${cat.name}</div>
        <div class="type-category-items">
          ${cat.types.map(type => {
            const def = SLIDE_TYPES[type];
            if (!def) return '';
            const skeleton = this._slideSkeletons[type] || '';
            return `
              <div class="slide-type-card" data-type="${type}">
                <div class="type-card-skeleton">${skeleton}</div>
                <div class="type-card-label">${def.label}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.slide-type-card');
      if (!card) return;
      this.addSlide(card.dataset.type);
      this.closeModal('modal-add-slide');
    });
  },

  // --- Slide CRUD ---
  addSlide(type) {
    const def = SLIDE_TYPES[type];
    if (!def) return;
    this.pushUndoState();
    const slide = JSON.parse(JSON.stringify(def.defaults));
    if (this._insertAt >= 0 && this._insertAt <= this.slides.length) {
      this.slides.splice(this._insertAt, 0, slide);
      this.selectedIndex = this._insertAt;
      this._insertAt = -1;
    } else {
      // Insert after selected slide, or at end if none selected
      const insertAt = this.selectedIndex >= 0 ? this.selectedIndex + 1 : this.slides.length;
      this.slides.splice(insertAt, 0, slide);
      this.selectedIndex = insertAt;
    }
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  async deleteSlide(index) {
    const ok = await this.confirmDialog('Delete Slide', 'Are you sure you want to delete this slide?', 'Delete');
    if (!ok) return;
    this.pushUndoState();
    this.slides.splice(index, 1);
    if (this.selectedIndex >= this.slides.length) this.selectedIndex = this.slides.length - 1;
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  duplicateSlide(index) {
    this.pushUndoState();
    const clone = JSON.parse(JSON.stringify(this.slides[index]));
    this.slides.splice(index + 1, 0, clone);
    this.selectedIndex = index + 1;
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  selectSlide(index) {
    const prev = document.querySelector('.slide-thumb.active');
    if (prev) prev.classList.remove('active');
    const next = document.querySelector(`.slide-thumb[data-index="${index}"]`);
    if (next) {
      next.classList.add('active');
      next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      next.classList.add('just-selected');
      setTimeout(() => next.classList.remove('just-selected'), 600);
    }

    this.selectedIndex = index;
    this.renderEditor();
    this.renderPreview();
    // On mobile, switch to editor tab when selecting a slide
    if (window.innerWidth <= 720) this.setMobileTab('editor');
  },

  moveSlide(from, to) {
    if (to < 0 || to >= this.slides.length) return;
    this.pushUndoState();
    const [slide] = this.slides.splice(from, 1);
    this.slides.splice(to, 0, slide);
    this.selectedIndex = to;
    this.renderSlideList();
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  // --- Slide List ---
  renderSlideList() {
    // Update status bar count
    const sc = document.getElementById('status-slide-count');
    if (sc) sc.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${this.slides.length} slide${this.slides.length !== 1 ? 's' : ''}`;

    const list = document.getElementById('slide-list');
    if (this.slides.length === 0) {
      list.innerHTML = '<div class="slide-list-empty"><i class="fa-solid fa-layer-group"></i><p>No slides yet</p><span>Click + below to add your first slide</span></div>';
      return;
    }
    SlideRenderer.resetCounters();
    const catColors = { 'Text & Layout': '#3b82f6', 'Media': '#22c55e', 'Data & Code': '#f59e0b', 'Interactive & Closing': '#a855f7' };
    list.innerHTML = this.slides.map((slide, i) => {
      const isActive = i === this.selectedIndex;
      const thumb = PreviewRenderer.render(slide);
      const cat = SLIDE_TYPE_CATEGORIES.find(c => c.types.includes(slide.type));
      const borderColor = catColors[cat?.name] || '#6b7280';
      return `
        <div class="slide-thumb ${isActive ? 'active' : ''}" data-index="${i}" draggable="true" style="--thumb-cat-color:${borderColor}">
          <div class="slide-thumb-card">
            <span class="slide-thumb-num">${i + 1}</span>
            ${thumb}
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.slide-thumb').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        this.selectSlide(parseInt(item.dataset.index));
      });
      item.addEventListener('dragstart', (e) => {
        this.dragIndex = parseInt(item.dataset.index);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => { item.classList.remove('dragging'); this.dragIndex = -1; });
      item.addEventListener('dragover', (e) => { e.preventDefault(); item.classList.add('drag-over'); });
      item.addEventListener('dragleave', () => { item.classList.remove('drag-over'); });
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        const to = parseInt(item.dataset.index);
        if (this.dragIndex !== -1 && this.dragIndex !== to) this.moveSlide(this.dragIndex, to);
      });
    });
    list.querySelectorAll('.slide-thumb-card').forEach(c => c.classList.add('loading'));
    requestAnimationFrame(() => {
      this.scaleThumbnails();
      this.applyThemeColor();
      list.querySelectorAll('.slide-thumb-card').forEach(c => c.classList.remove('loading'));
      // Scroll active thumbnail to top of list
      const active = list.querySelector('.slide-thumb.active');
      if (active) active.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  },

  scaleThumbnails() {
    document.querySelectorAll('.slide-thumb-card').forEach(card => {
      const wrapper = card.querySelector('.slide-preview-wrapper');
      if (!wrapper) return;
      const cardW = card.clientWidth;
      if (cardW <= 0) return;
      const zoomLevel = cardW / 1920;
      wrapper.style.zoom = zoomLevel;
    });
  },

  // --- Editor ---
  renderEditor() {
    const empty = document.getElementById('empty-state');
    const scroll = document.getElementById('editor-scroll');
    const content = document.getElementById('editor-content');
    const head = document.getElementById('editor-head');

    const jsonWrap = document.getElementById('json-editor-wrap');

    if (this.selectedIndex < 0 || this.selectedIndex >= this.slides.length) {
      empty.style.display = 'flex';
      scroll.style.display = 'none';
      jsonWrap.style.display = 'none';
      head.style.display = 'none';
      return;
    }

    const slide = this.slides[this.selectedIndex];
    const typeDef = SLIDE_TYPES[slide.type];

    // Update fixed header
    empty.style.display = 'none';
    head.style.display = 'flex';

    // Show correct view based on mode
    if (this.editorMode === 'json') {
      scroll.style.display = 'none';
      jsonWrap.style.display = 'flex';

      if (this._monacoEditor) {
        this._monacoIgnoreChange = true;
        this._monacoEditor.setValue(JSON.stringify(slide, null, 2));
        this._monacoIgnoreChange = false;
        this._monacoEditor.layout();
        this.updateJsonStatus(true);
      }
    } else {
      jsonWrap.style.display = 'none';
      scroll.style.display = 'block';
    }
    document.getElementById('editor-slide-num').textContent = `#${this.selectedIndex + 1}`;
    const typeCategory = this._getTypeCategory(slide.type);
    const catColors = { 'Text & Layout': '#3b82f6', 'Media': '#22c55e', 'Data & Code': '#f59e0b', 'Interactive & Closing': '#a855f7' };
    const badgeColor = catColors[typeCategory] || '#6b7280';
    document.getElementById('editor-slide-type').innerHTML = `<span class="type-badge" style="color:${badgeColor}"><i class="fa-solid ${typeDef?.icon || 'fa-file'}"></i> ${typeDef?.label || slide.type}</span>`;

    // Bind header buttons
    document.getElementById('btn-editor-dup').onclick = () => this.duplicateSlide(this.selectedIndex);
    document.getElementById('btn-editor-del').onclick = () => this.deleteSlide(this.selectedIndex);

    // Only render form fields in form mode
    if (this.editorMode === 'form') {
      content.innerHTML = EditorFields.render(slide);
      content.querySelector('[data-action="add-col"]')?.addEventListener('click', () => this.tableAddCol());
      content.querySelector('[data-action="add-row"]')?.addEventListener('click', () => this.tableAddRow());
      content.querySelector('[data-action="remove-col"]')?.addEventListener('click', () => this.tableRemoveCol());
      content.querySelector('[data-action="remove-row"]')?.addEventListener('click', () => this.tableRemoveRow());
      content.querySelector('#btn-add-toc-item')?.addEventListener('click', () => this.addListItem('items', { title: '', description: '' }));
      content.querySelector('#btn-add-prompt')?.addEventListener('click', () => this.addListItem('prompts', { icon: 'hand', text: '' }));
      content.querySelector('#btn-add-grid-image')?.addEventListener('click', () => this.addListItem('images', { src: '', alt: '', caption: '' }));
      content.querySelector('#btn-add-stats-item')?.addEventListener('click', () => this.addListItem('items', { value: '', label: '', icon: '' }));
      content.querySelector('#btn-add-timeline-item')?.addEventListener('click', () => this.addListItem('items', { date: '', title: '', description: '' }));
      // Restore collapse states
      document.querySelectorAll('[data-collapse]').forEach(section => {
        const id = section.dataset.collapse;
        if (this._collapseStates[id] !== undefined) {
          section.classList.toggle('open', this._collapseStates[id]);
          const icon = section.querySelector('.collapse-toggle i');
          if (icon) icon.className = this._collapseStates[id] ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right';
        }
      });
      // Auto-size all textareas after render
      requestAnimationFrame(() => this.autoResizeAllTextareas());
    }
  },

  autoResizeTextarea(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, el.offsetHeight) + 'px';
  },

  autoResizeAllTextareas() {
    document.querySelectorAll('#editor-content textarea').forEach(ta => this.autoResizeTextarea(ta));
  },

  handleEditorInput(e) {
    if (e.target.tagName === 'TEXTAREA') this.autoResizeTextarea(e.target);
    if (this.selectedIndex < 0) return;
    this.debouncedPushUndoState();
    const slide = this.slides[this.selectedIndex];
    const t = e.target;

    if (t.dataset.field) {
      this.setNestedValue(slide, t.dataset.field, t.value);
      this.debouncePreview();
      this.debounceListUpdate();
      this.saveToLocalStorage();
      return;
    }
    if (t.dataset.bullet) {
      const arr = this.getNestedValue(slide, t.dataset.bullet);
      if (arr) { arr[parseInt(t.dataset.index)] = t.value; this.debouncePreview(); this.saveToLocalStorage(); }
      return;
    }
    if (t.dataset.table === 'header') { slide.table.headers[parseInt(t.dataset.col)] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.table === 'cell') { slide.table.rows[parseInt(t.dataset.row)][parseInt(t.dataset.col)] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.tocField) { slide.items[parseInt(t.dataset.index)][t.dataset.tocField] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.promptField) { slide.prompts[parseInt(t.dataset.index)][t.dataset.promptField] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.gridField) { slide.images[parseInt(t.dataset.index)][t.dataset.gridField] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.statsField) { slide.items[parseInt(t.dataset.index)][t.dataset.statsField] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
    if (t.dataset.timelineField) { slide.items[parseInt(t.dataset.index)][t.dataset.timelineField] = t.value; this.debouncePreview(); this.saveToLocalStorage(); return; }
  },

  handleEditorChange(e) {
    if (this.selectedIndex < 0) return;
    const slide = this.slides[this.selectedIndex];
    const t = e.target;
    // Checkbox fields
    if (t.type === 'checkbox' && t.dataset.field) {
      this.setNestedValue(slide, t.dataset.field, t.checked);
      this.debouncePreview();
      this.saveToLocalStorage();
      return;
    }
    // Select fields
    if (t.tagName === 'SELECT' && t.dataset.field) {
      this.setNestedValue(slide, t.dataset.field, t.value);
      this.debouncePreview();
      this.saveToLocalStorage();
    }
  },

  // Monaco editor instance
  _monacoEditor: null,
  _monacoReady: false,
  _monacoIgnoreChange: false,

  initMonaco() {
    if (this._monacoReady) return Promise.resolve();
    return new Promise((resolve) => {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        // Define kaper-dark theme
        monaco.editor.defineTheme('kaper-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#0f1419',
            'editor.foreground': '#E8E8E8',
            'editor.lineHighlightBackground': '#1a1f2e',
            'editor.selectionBackground': '#264f78',
            'editorCursor.foreground': '#60A5FA',
            'editorLineNumber.foreground': '#4B5563',
            'editorLineNumber.activeForeground': '#9CA3AF',
            'editorIndentGuide.background': '#2e3440',
            'editorIndentGuide.activeBackground': '#4c566a',
            'editorBracketMatch.border': '#3b82f6',
            'editorBracketMatch.background': '#3b82f620',
            'editor.selectionHighlightBackground': '#264f7840',
            'scrollbar.shadow': '#00000000',
            'scrollbarSlider.background': '#37415180',
            'scrollbarSlider.hoverBackground': '#4b556380',
            'scrollbarSlider.activeBackground': '#6b728080',
          }
        });
        this._monacoReady = true;
        resolve();
      });
    });
  },

  createMonacoEditor() {
    if (this._monacoEditor) return;
    const container = document.getElementById('monaco-container');
    this._monacoEditor = monaco.editor.create(container, {
      value: '',
      language: 'json',
      theme: 'kaper-dark',
      fontSize: 13,
      lineHeight: 22,
      fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      letterSpacing: 0.3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      bracketPairColorization: { enabled: true },
      guides: { indentation: true, bracketPairs: true },
      smoothScrolling: true,
      cursorSmoothCaretAnimation: 'on',
      cursorBlinking: 'smooth',
      renderLineHighlight: 'line',
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      padding: { top: 8, bottom: 8 },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      renderWhitespace: 'none',
      contextmenu: true,
      quickSuggestions: false,
    });

    // Listen for changes
    this._monacoEditor.onDidChangeModelContent(() => {
      if (this._monacoIgnoreChange) return;
      this.handleMonacoChange();
    });

    // Update status bar on cursor move
    this._monacoEditor.onDidChangeCursorPosition((e) => {
      this.updateJsonStatusFromMonaco(e.position);
    });
  },

  handleMonacoChange() {
    if (this.selectedIndex < 0) return;
    this.debouncedPushUndoState();
    const raw = this._monacoEditor.getValue();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.type || !SLIDE_TYPES[parsed.type]) {
        this.updateJsonStatus(false, 'Unknown slide type');
        return;
      }
      this.slides[this.selectedIndex] = parsed;
      this.updateJsonStatus(true);
      this.debouncePreview();
      this.debounceListUpdate();
      this.saveToLocalStorage();
    } catch (err) {
      this.updateJsonStatus(false, err.message);
    }
  },

  setEditorMode(mode) {
    this.editorMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

    const formView = document.getElementById('editor-scroll');
    const jsonView = document.getElementById('json-editor-wrap');

    if (mode === 'json') {
      formView.style.display = 'none';
      jsonView.style.display = 'flex';

      this.initMonaco().then(() => {
        this.createMonacoEditor();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.slides.length) {
          const slide = this.slides[this.selectedIndex];
          const json = JSON.stringify(slide, null, 2);
          this._monacoIgnoreChange = true;
          this._monacoEditor.setValue(json);
          this._monacoIgnoreChange = false;
    
          this.updateJsonStatus(true);
          // Auto-format
          setTimeout(() => {
            this._monacoEditor.getAction('editor.action.formatDocument')?.run();
            this._monacoEditor.layout();
          }, 100);
        }
      });
    } else {
      jsonView.style.display = 'none';
      formView.style.display = 'block';
      this.renderEditor();
    }
  },

  updateJsonStatus(ok, msg) {
    const el = document.getElementById('json-editor-status');
    const pos = this._monacoEditor?.getPosition();
    const ln = pos?.lineNumber || 1;
    const col = pos?.column || 1;
    if (ok) {
      el.innerHTML = `<span class="json-status-ok"><i class="fa-solid fa-circle-check"></i> Valid</span><span>Ln ${ln}, Col ${col}</span>`;
    } else {
      el.innerHTML = `<span class="json-status-err"><i class="fa-solid fa-circle-xmark"></i> ${this.escHtml(msg || 'Invalid')}</span><span>Ln ${ln}, Col ${col}</span>`;
    }
  },

  updateJsonStatusFromMonaco(pos) {
    if (this.selectedIndex < 0) return;
    const el = document.getElementById('json-editor-status');
    // Keep existing valid/error state, just update position
    const statusSpan = el.querySelector('.json-status-ok, .json-status-err');
    const statusHtml = statusSpan ? statusSpan.outerHTML : '';
    el.innerHTML = `${statusHtml}<span>Ln ${pos.lineNumber}, Col ${pos.column}</span>`;
  },

  handleEditorKeydown(e) {
    const t = e.target;
    if (!t.dataset.bulletInput && !t.hasAttribute('data-bullet-input')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const bulletId = t.dataset.bullet;
      const idx = parseInt(t.dataset.index);
      const slide = this.slides[this.selectedIndex];
      const arr = this.getNestedValue(slide, bulletId);
      if (arr) {
        this.pushUndoState();
        arr.splice(idx + 1, 0, '');
        this.renderEditor(); this.renderPreview(); this.saveToLocalStorage();
        setTimeout(() => {
          const inputs = document.querySelectorAll(`[data-bullet="${bulletId}"]`);
          if (inputs[idx + 1]) inputs[idx + 1].focus();
        }, 50);
      }
    } else if (e.key === 'Backspace' && t.value === '') {
      e.preventDefault();
      const bulletId = t.dataset.bullet;
      const idx = parseInt(t.dataset.index);
      const slide = this.slides[this.selectedIndex];
      const arr = this.getNestedValue(slide, bulletId);
      if (arr && arr.length > 1) {
        this.pushUndoState();
        arr.splice(idx, 1);
        this.renderEditor(); this.renderPreview(); this.saveToLocalStorage();
        setTimeout(() => {
          const inputs = document.querySelectorAll(`[data-bullet="${bulletId}"]`);
          const focusIdx = Math.max(0, idx - 1);
          if (inputs[focusIdx]) inputs[focusIdx].focus();
        }, 50);
      }
    }
  },

  handleEditorClick(e) {
    // Collapse toggle
    const toggle = e.target.closest('[data-collapse-toggle]');
    if (toggle) {
      const section = toggle.closest('.collapse-section');
      if (section) {
        section.classList.toggle('open');
        const icon = toggle.querySelector('i');
        if (icon) icon.className = section.classList.contains('open') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right';
        // Remember state
        if (toggle.dataset.collapseToggle) {
          this._collapseStates[toggle.dataset.collapseToggle] = section.classList.contains('open');
        }
      }
      return;
    }

    if (this.selectedIndex < 0) return;
    const slide = this.slides[this.selectedIndex];

    // Bullet add (div, not button)
    const addEl = e.target.closest('[data-add-bullet]');
    if (addEl) {
      const path = addEl.dataset.addBullet;
      const arr = this.getNestedValue(slide, path);
      if (arr) { this.pushUndoState(); arr.push(''); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage();
        setTimeout(() => { const inputs = document.querySelectorAll(`[data-bullet="${path}"]`); if (inputs.length) inputs[inputs.length - 1].focus(); }, 50);
      }
      return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.removeBullet) { const arr = this.getNestedValue(slide, btn.dataset.removeBullet); if (arr) { this.pushUndoState(); arr.splice(parseInt(btn.dataset.index), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); } return; }
    if (btn.dataset.removeToc !== undefined) { this.pushUndoState(); slide.items.splice(parseInt(btn.dataset.removeToc), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); return; }
    if (btn.dataset.removePrompt !== undefined) { this.pushUndoState(); slide.prompts.splice(parseInt(btn.dataset.removePrompt), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); return; }
    if (btn.dataset.removeGrid !== undefined) { this.pushUndoState(); slide.images.splice(parseInt(btn.dataset.removeGrid), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); return; }
    if (btn.dataset.removeStats !== undefined) { this.pushUndoState(); slide.items.splice(parseInt(btn.dataset.removeStats), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); return; }
    if (btn.dataset.removeTimeline !== undefined) { this.pushUndoState(); slide.items.splice(parseInt(btn.dataset.removeTimeline), 1); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); return; }
  },

  // --- Table helpers ---
  tableAddCol() { const s = this.slides[this.selectedIndex]; if (!s.table) return; this.pushUndoState(); s.table.headers.push('New'); s.table.rows.forEach(r => r.push('')); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); },
  tableAddRow() { const s = this.slides[this.selectedIndex]; if (!s.table) return; this.pushUndoState(); s.table.rows.push(new Array(s.table.headers.length).fill('')); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); },
  tableRemoveCol() { const s = this.slides[this.selectedIndex]; if (!s.table || s.table.headers.length <= 1) return; this.pushUndoState(); s.table.headers.pop(); s.table.rows.forEach(r => r.pop()); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); },
  tableRemoveRow() { const s = this.slides[this.selectedIndex]; if (!s.table || s.table.rows.length <= 1) return; this.pushUndoState(); s.table.rows.pop(); this.renderEditor(); this.renderPreview(); this.saveToLocalStorage(); },

  addListItem(key, template) {
    this.pushUndoState();
    const slide = this.slides[this.selectedIndex];
    if (!slide[key]) slide[key] = [];
    slide[key].push(JSON.parse(JSON.stringify(template)));
    this.renderEditor();
    this.renderPreview();
    this.saveToLocalStorage();
  },

  // --- Preview ---
  renderPreview() {
    const frame = document.getElementById('preview-frame');
    if (this.selectedIndex < 0 || this.selectedIndex >= this.slides.length) {
      frame.innerHTML = '<div class="preview-placeholder"><div class="placeholder-icon"><i class="fa-solid fa-display"></i></div><p class="placeholder-title">No slide selected</p><p class="placeholder-hint">Click a slide on the left panel or add a new one to get started</p></div>';
      return;
    }
    // Compute correct figure/table counters by rendering preceding slides
    SlideRenderer.resetCounters();
    for (let i = 0; i < this.selectedIndex; i++) {
      const t = this.slides[i].type;
      if (t === 'image') SlideRenderer.nextCount('figure');
      else if (t === 'image-content' && this.slides[i].figureCaption) SlideRenderer.nextCount('figure');
      else if (t === 'video') SlideRenderer.nextCount('video');
      else if (t === 'table') SlideRenderer.nextCount('table');
    }
    frame.innerHTML = PreviewRenderer.render(this.slides[this.selectedIndex]);
    this.scalePreview();
    this.applyThemeColor();
    this._updatePreviewNav();
    this._pushDetachedPreview();
  },

  _previewNavBound: false,

  _updatePreviewNav() {
    const nav = document.getElementById('preview-nav');
    if (this.slides.length === 0) { nav.style.display = 'none'; return; }
    nav.style.display = '';

    const current = this.selectedIndex + 1;
    const total = this.slides.length;
    document.getElementById('preview-current').textContent = current;
    document.getElementById('preview-total').textContent = total;
    document.getElementById('preview-progress-fill').style.width = `${(current / total) * 100}%`;
    document.getElementById('preview-prev').disabled = current <= 1;
    document.getElementById('preview-next').disabled = current >= total;

    if (!this._previewNavBound) {
      this._previewNavBound = true;
      document.getElementById('preview-prev').addEventListener('click', () => {
        if (this.selectedIndex > 0) this.selectSlide(this.selectedIndex - 1);
      });
      document.getElementById('preview-next').addEventListener('click', () => {
        if (this.selectedIndex < this.slides.length - 1) this.selectSlide(this.selectedIndex + 1);
      });
    }
  },

  _pushDetachedPreview() {
    // Always broadcast for any listening presenter tab (sync or detached)
    if (!this._previewChannel) {
      try { this._previewChannel = new BroadcastChannel('slide-maker-preview'); } catch (e) { return; }
    }
    const json = this.buildExportJSON();
    localStorage.setItem('slide-present-data', JSON.stringify(json));
    this._previewChannel.postMessage({ type: 'reload', slide: this.selectedIndex + 1 });
  },

  scalePreview() {
    const frame = document.getElementById('preview-frame');
    const wrapper = frame.querySelector('.slide-preview-wrapper');
    if (!wrapper) return;
    const fw = frame.clientWidth - 28;
    const fh = frame.clientHeight - 28;
    if (fw <= 0 || fh <= 0) return;
    const scale = Math.min(fw / 1920, fh / 1080);
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.marginBottom = `${-(1080 * (1 - scale))}px`;
    wrapper.style.marginRight = `${-(1920 * (1 - scale))}px`;
  },

  _previewTimer: null,
  debouncePreview() { clearTimeout(this._previewTimer); this._previewTimer = setTimeout(() => this.renderPreview(), 120); },
  _listTimer: null,
  debounceListUpdate() { clearTimeout(this._listTimer); this._listTimer = setTimeout(() => this.renderSlideList(), 250); },

  // --- Full Preview (opens in new tab) ---
  async openFullPreview() {
    if (this.slides.length === 0) { await this.alertDialog('No Slides', 'Add some slides before previewing.'); return; }
    // Store slides data for the presenter to pick up
    const json = this.buildExportJSON();
    localStorage.setItem('slide-present-data', JSON.stringify(json));
    const kw = this.meta.keyword;
    const params = kw ? `?source=maker&k=${encodeURIComponent(kw)}` : '?source=maker';
    window.open('../slide-present/index.html' + params, '_blank');
  },

  detachPreview() {
    if (this.previewDetached) return;
    this.previewDetached = true;
    this._previewChannel = new BroadcastChannel('slide-maker-preview');
    document.getElementById('main-layout').classList.add('preview-detached');
    this.openFullPreview();
  },

  // --- Import / Export ---
  buildExportJSON() {
    return { meta: { ...this.meta }, slides: JSON.parse(JSON.stringify(this.slides)) };
  },

  flattenForEditing(slides) {
    const flat = [];
    for (const s of slides) {
      if (s.type === 'section' && s.slides?.length) {
        flat.push({ type: 'section', number: s.number, title: s.title, subtitle: s.subtitle });
        for (const n of s.slides) flat.push({ ...n });
      } else flat.push(s);
    }
    return flat;
  },

  // --- LocalStorage + Save Status ---
  setSaveStatus(state, text) {
    const el = document.getElementById('save-status');
    el.className = 'save-status ' + state;
    const icons = { draft: 'fa-circle', unsaved: 'fa-circle-dot', saving: 'fa-spinner', saved: 'fa-circle-check', error: 'fa-circle-xmark' };
    el.innerHTML = `<i class="fa-solid ${icons[state] || 'fa-circle'}"></i> ${text || state}`;
  },

  async saveNow() {
    clearTimeout(this._saveTimer);
    this.setSaveStatus('saving', 'Saving...');
    try {
      const data = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
      localStorage.setItem('slide-maker-data', data);
      this._lastSavedJson = data;
      this._dirty = false;

      await this.saveToDisk();
      this.setSaveStatus('saved', 'Saved');
    } catch (e) {
      this.setSaveStatus('error', 'Save failed');
      console.error('saveNow failed:', e);
    }
  },

  saveToLocalStorage() {
    // Mark unsaved immediately
    this.setSaveStatus('unsaved', 'Unsaved');

    // Debounce actual save (localStorage only — disk save is Ctrl+S / Export)
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(async () => {
      this.setSaveStatus('saving', 'Saving...');
      try {
        const data = JSON.stringify({ meta: this.meta, slides: this.slides, selectedIndex: this.selectedIndex, encrypted: this._encryptEnabled });
        localStorage.setItem('slide-maker-data', data);
        this._lastSavedJson = data;
        this._dirty = false;
        await this.saveToDisk();
        this.setSaveStatus('saved', 'Saved');
        setTimeout(() => {
          if (!this._dirty) this.setSaveStatus('saved', 'Saved');
        }, 3000);
      } catch (e) {
        this.setSaveStatus('error', 'Save failed');
      }
    }, 600);
  },

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('slide-maker-data');
      if (!raw) { this.setSaveStatus('draft', 'Draft'); return; }
      const data = JSON.parse(raw);
      if (data.meta) this.meta = data.meta;
      if (data.slides) this.slides = data.slides;
      if (typeof data.selectedIndex === 'number') this.selectedIndex = data.selectedIndex;
      if (data.encrypted) {
        this._encryptEnabled = true;
        this._loadKeys();
      }
      this._lastSavedJson = raw;
      // Ensure defaults
      if (!this.meta.themeColor) this.meta.themeColor = '#3776A1';
      if (!this.meta.keyword) this.meta.keyword = '';
      this.applyKeywordBaseUrl();
      this.applyThemeColor();
      this.updateTopbarTitle();
      this.renderSlideList(); this.renderEditor(); this.renderPreview();
      this.setSaveStatus('saved', 'Saved');
    } catch (e) {
      this.setSaveStatus('error', 'Load failed');
    }
  },

  // --- Utility ---
  setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = isNaN(parts[i]) ? parts[i] : parseInt(parts[i]);
      if (cur[k] === undefined) cur[k] = {};
      cur = cur[k];
    }
    const last = isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : parseInt(parts[parts.length - 1]);
    if (path === 'number' || path === 'columns' || path === 'gap' || path === 'style' || path === 'itemsPerColumn') cur[last] = value === '' ? '' : parseInt(value) || 0;
    else if (path === 'table.highlight') cur[last] = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    else cur[last] = value;
  },

  getNestedValue(obj, path) {
    let cur = obj;
    for (const p of path.split('.')) {
      if (cur == null) return undefined;
      cur = cur[isNaN(p) ? p : parseInt(p)];
    }
    return cur;
  },

  escHtml(str) {
    if (!str) return '';
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  },

  // --- Context Menu ---
  // --- View Menu ---
  _panelState: { slides: true, preview: true },

  bindViewMenu() {
    const btn = document.getElementById('btn-view-menu');
    const menu = document.getElementById('view-dropdown');
    const toggleSlides = document.getElementById('toggle-slides-pane');
    const togglePreview = document.getElementById('toggle-preview-pane');
    const detachBtn = document.getElementById('btn-detach-preview-menu');

    // Init checked state
    toggleSlides.classList.add('checked');
    togglePreview.classList.add('checked');

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.style.display !== 'none';
      menu.style.display = open ? 'none' : 'block';
    });

    // Close on outside click
    document.addEventListener('click', () => { menu.style.display = 'none'; });
    menu.addEventListener('click', (e) => e.stopPropagation());

    // Toggle slides pane
    toggleSlides.addEventListener('click', () => {
      this._panelState.slides = !this._panelState.slides;
      toggleSlides.classList.toggle('checked');
      document.getElementById('sidebar').style.display = this._panelState.slides ? '' : 'none';
      document.getElementById('editor-panel').style.flex = (!this._panelState.slides || !this._panelState.preview) ? '1' : '';
    });

    // Toggle preview pane
    togglePreview.addEventListener('click', () => {
      this._panelState.preview = !this._panelState.preview;
      togglePreview.classList.toggle('checked');
      document.getElementById('preview-panel').style.display = this._panelState.preview ? '' : 'none';
      document.getElementById('editor-panel').style.flex = this._panelState.preview ? '' : '1';
      if (this._panelState.preview) this.renderPreview();
    });

    // Detach preview
    detachBtn.addEventListener('click', () => {
      menu.style.display = 'none';
      this.detachPreview();
    });
  },

  bindContextMenu() {
    const menu = document.getElementById('context-menu');
    const slideList = document.getElementById('slide-list');

    slideList.addEventListener('contextmenu', (e) => {
      const thumb = e.target.closest('.slide-thumb');
      if (!thumb) return;
      e.preventDefault();
      this._ctxIndex = parseInt(thumb.dataset.index);
      menu.style.display = 'block';
      // Position menu near the cursor, clamped to viewport
      const mx = Math.min(e.clientX, window.innerWidth - 200);
      const my = Math.min(e.clientY, window.innerHeight - 240);
      menu.style.left = mx + 'px';
      menu.style.top = my + 'px';
    });

    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ctx]');
      if (!btn) return;
      const action = btn.dataset.ctx;
      const idx = this._ctxIndex;
      menu.style.display = 'none';
      if (idx < 0 || idx >= this.slides.length) return;

      this.pushUndoState();
      switch (action) {
        case 'insert-before':
          this.selectedIndex = idx;
          this.openModal('modal-add-slide');
          this._insertAt = idx;
          break;
        case 'insert-after':
          this.selectedIndex = idx;
          this.openModal('modal-add-slide');
          this._insertAt = idx + 1;
          break;
        case 'duplicate':
          this.duplicateSlide(idx);
          break;
        case 'delete':
          this.deleteSlide(idx);
          break;
        case 'move-top':
          if (idx > 0) this.moveSlide(idx, 0);
          break;
        case 'move-bottom':
          if (idx < this.slides.length - 1) this.moveSlide(idx, this.slides.length - 1);
          break;
      }
    });

    // Close context menu on click outside or Escape
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) menu.style.display = 'none';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') menu.style.display = 'none';
    });
  },

  // Override addSlide to support insert-at position from context menu
  _insertAt: -1,

  // --- Theme Color ---
  applyThemeColor() {
    const color = this.meta.themeColor || '#3776A1';
    // Derive lighter versions
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const lighten = (c, f) => Math.min(255, Math.round(c + (255 - c) * f));
    const light = `rgb(${lighten(r, 0.3)}, ${lighten(g, 0.3)}, ${lighten(b, 0.3)})`;
    const secondary = `rgb(${lighten(r, 0.45)}, ${lighten(g, 0.45)}, ${lighten(b, 0.45)})`;
    const accent = `rgb(${lighten(r, 0.6)}, ${lighten(g, 0.6)}, ${lighten(b, 0.6)})`;

    // Apply to all preview wrappers (uses presentation.css variable names)
    document.querySelectorAll('.slide-preview-wrapper').forEach(w => {
      w.style.setProperty('--color-primary', color);
      w.style.setProperty('--color-primary-light', light);
      w.style.setProperty('--color-secondary', secondary);
      w.style.setProperty('--color-accent', accent);
    });
  },

  // --- Topbar Title ---
  updateTopbarTitle() {
    const el = document.getElementById('topbar-title-display');
    if (!el) return;
    const kw = this.meta.keyword;
    if (!kw) { el.textContent = ''; return; }
    el.innerHTML = `materials<span class="topbar-path-sep">/</span><span class="topbar-path-kw">${this.escHtml(kw)}</span>`;
  },

  // --- Export Presentation (self-contained HTML) ---
  async exportPresentation() {
    if (this.slides.length === 0) { await this.alertDialog('No Slides', 'Add some slides before exporting.'); return; }
    this.setSaveStatus('saving', 'Exporting...');
    try {
      const [cssResp, rendererResp, engineResp] = await Promise.all([
        fetch('../slide-present/css/presentation.css'),
        fetch('../slide-present/js/slide-renderer.js'),
        fetch('../slide-present/js/presentation.js')
      ]);
      const css = cssResp.ok ? await cssResp.text() : '';
      const rendererJs = rendererResp.ok ? await rendererResp.text() : '';
      const engineJs = engineResp.ok ? await engineResp.text() : '';
      const json = this.buildExportJSON();
      const html = this.buildExportHtml(json, css, rendererJs, engineJs);
      const title = (this.meta.title || 'presentation').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = title + '.html';
      a.click();
      this.setSaveStatus('saved', 'Exported');
      this.closeModal('modal-meta');
    } catch (e) {
      this.setSaveStatus('error', 'Export failed');
      this.alertDialog('Export Failed', e.message, 'warn');
    }
  },

  buildExportHtml(json, css, rendererJs, engineJs) {
    const title = this.escHtml(json.meta?.title || 'Presentation');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>${css}</style>
</head>
<body>
<div class="presentation" id="presentation">
<div class="presentation-header"><div class="slide-indicator"><span class="current-slide">1</span> / <span class="total-slides">0</span></div><div class="header-actions"><button class="header-btn theme-toggle" id="theme-toggle"><i class="fa-solid fa-moon"></i><i class="fa-solid fa-sun"></i></button><button class="header-btn fullscreen-btn" id="fullscreen-btn"><i class="fa-solid fa-expand"></i></button></div></div>
<div class="slides-container" id="slides-container"></div>
<div class="navigation"><button class="nav-btn nav-prev" id="nav-prev"><i class="fa-solid fa-chevron-left"></i></button><div class="progress-bar" id="progress-bar"><div class="progress-bar-fill" id="progress-bar-fill"></div></div><button class="nav-btn nav-next" id="nav-next"><i class="fa-solid fa-chevron-right"></i></button></div>
<div class="keyboard-hint"><span><kbd>&larr;</kbd> <kbd>&rarr;</kbd> Navigate</span><span><kbd>F</kbd> Fullscreen</span></div>
<div class="slide-jump"><span>Go to:</span><input type="number" id="slide-jump-input" min="1" placeholder="#"></div>
</div>
<script>${rendererJs}<\/script>
<script>${engineJs}<\/script>
<script>
document.addEventListener('DOMContentLoaded',()=>{
const t=localStorage.getItem('presentation-theme');if(t)document.documentElement.setAttribute('data-theme',t);
Presentation.init(${JSON.stringify(json)});
});
<\/script>
</body></html>`;
  },

  _getTypeCategory(type) {
    for (const cat of SLIDE_TYPE_CATEGORIES) {
      if (cat.types.includes(type)) return cat.name;
    }
    return '';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
