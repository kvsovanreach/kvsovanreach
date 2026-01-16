/**
 * Lucky Draw Tool
 * Spin the wheel or randomly pick winners from a list
 */

(function() {
  'use strict';

  // VERSION CHECK - if you see this in console, new code is running
  console.log('LuckyDraw v2.2 loaded at', new Date().toISOString());

  // IMMEDIATE: Hide any winner display as soon as possible using inline styles
  // This is the most aggressive approach - inline styles override everything
  (function immediateReset() {
    const hide = () => {
      console.log('immediateReset running');
      const wd = document.getElementById('winnerDisplay');
      const cc = document.getElementById('confettiContainer');
      if (wd) {
        wd.style.display = 'none';
        wd.style.opacity = '0';
        wd.classList.remove('show');
        wd.classList.remove('can-show');
      }
      if (cc) {
        cc.style.display = 'none';
        cc.classList.remove('can-show');
        cc.innerHTML = '';
      }
    };
    // Try immediately
    hide();
    // Also try when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hide);
    } else {
      // DOM already loaded, run again to be safe
      hide();
    }
  })();

  // ============================================
  // State
  // ============================================
  const PAGE_LOAD_TIME = Date.now();

  // Generate a unique session ID for this page load
  // This prevents stale animation callbacks from adding winners
  const SESSION_ID = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Track if page is being unloaded - prevents any actions during unload
  let isPageUnloading = false;

  // Clear any stale session markers on load
  sessionStorage.removeItem('luckydrawUnloadTime');
  sessionStorage.removeItem('luckydrawRemovedEntry');

  // NOW load state (after cleanup)
  const state = {
    entries: JSON.parse(localStorage.getItem('luckydrawEntries') || '[]'),
    history: JSON.parse(localStorage.getItem('luckydrawHistory') || '[]'),
    settings: JSON.parse(localStorage.getItem('luckydrawSettings') || JSON.stringify({
      removeWinner: true,
      sound: true,
      confetti: true,
      spinDuration: 5
    })),
    isDarkMode: localStorage.getItem('theme') === 'dark',
    isSpinning: false,
    isPageReady: false,
    userInitiatedSpin: false, // CRITICAL: Only true when user explicitly starts a spin
    currentSpinSession: null, // Must match SESSION_ID to proceed
    historyCollapsed: localStorage.getItem('luckydrawHistoryCollapsed') === 'true',
    currentRotation: 0,
    activeTab: 'wheel'
  };

  // Cancel all actions when page is about to unload
  window.addEventListener('beforeunload', () => {
    isPageUnloading = true;
    state.isSpinning = false;
    state.userInitiatedSpin = false;
    state.currentSpinSession = null;
    // Mark the unload time so we can detect stale history entries on reload
    sessionStorage.setItem('luckydrawUnloadTime', Date.now().toString());
  });

  // Handle page restoration from bfcache (back-forward cache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from cache - reset all visual states
      console.log('Page restored from bfcache - resetting states');
      isPageUnloading = false;
      state.isSpinning = false;
      state.userInitiatedSpin = false;
      state.currentSpinSession = null;
      state.isPageReady = false;

      // Reset visual elements
      const winnerDisplay = document.getElementById('winnerDisplay');
      const confettiContainer = document.getElementById('confettiContainer');
      const winnerName = document.getElementById('winnerName');

      if (winnerDisplay) {
        winnerDisplay.classList.remove('show');
        winnerDisplay.classList.remove('can-show');
      }
      if (confettiContainer) {
        confettiContainer.classList.remove('can-show');
        confettiContainer.innerHTML = '';
      }
      if (winnerName) winnerName.textContent = '-';

      // Re-enable after delay
      setTimeout(() => {
        state.isPageReady = true;
      }, 800);
    }
  });

  // Also handle visibility change - cancel if page becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.isSpinning) {
      // Page is hidden while spinning - this could indicate a refresh
      state.userInitiatedSpin = false;
      state.currentSpinSession = null;
    }
  });

  // Check if enough time has passed since page load and page is not unloading
  function canPerformAction() {
    return !isPageUnloading && state.isPageReady && (Date.now() - PAGE_LOAD_TIME > 1500);
  }

  const MAX_HISTORY = 50;

  // Wheel colors
  const WHEEL_COLORS = [
    '#3776A1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
  ];

  // Sample entries
  const SAMPLE_ENTRIES = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'
  ];

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Tabs
    tabs: document.querySelectorAll('.luckydraw-tab'),
    panels: document.querySelectorAll('.luckydraw-panel'),

    // Wheel
    wheelCanvas: document.getElementById('wheelCanvas'),
    spinBtn: document.getElementById('spinBtn'),
    pickRandomBtn: document.getElementById('pickRandomBtn'),
    resetWheelBtn: document.getElementById('resetWheelBtn'),
    winnerDisplay: document.getElementById('winnerDisplay'),
    winnerName: document.getElementById('winnerName'),
    entriesCount: document.getElementById('entriesCount'),

    // Entries
    entryInput: document.getElementById('entryInput'),
    addEntryBtn: document.getElementById('addEntryBtn'),
    entriesList: document.getElementById('entriesList'),
    entriesEmpty: document.getElementById('entriesEmpty'),
    entriesCount2: document.getElementById('entriesCount2'),
    importBtn: document.getElementById('importBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    sampleBtn: document.getElementById('sampleBtn'),

    // History
    historySidebar: document.getElementById('historySidebar'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    historyClearBtn: document.getElementById('historyClearBtn'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyShowBtn: document.getElementById('historyShowBtn'),
    historyFab: document.getElementById('historyFab'),
    historyBadge: document.getElementById('historyBadge'),
    historyOverlay: document.getElementById('historyOverlay'),

    // Settings
    removeWinnerSetting: document.getElementById('removeWinnerSetting'),
    soundSetting: document.getElementById('soundSetting'),
    confettiSetting: document.getElementById('confettiSetting'),
    spinDurationSetting: document.getElementById('spinDurationSetting'),
    spinDurationValue: document.getElementById('spinDurationValue'),

    // Import
    importModal: document.getElementById('importModal'),
    closeImportBtn: document.getElementById('closeImportBtn'),
    importTextarea: document.getElementById('importTextarea'),
    cancelImportBtn: document.getElementById('cancelImportBtn'),
    confirmImportBtn: document.getElementById('confirmImportBtn'),

    // Other
    toast: document.getElementById('toast'),
    confettiContainer: document.getElementById('confettiContainer')
  };

  // Canvas context
  let ctx = null;

  // ============================================
  // Initialization
  // ============================================
  function init() {
    // FIRST: Explicitly reset any visual states that might persist
    // This prevents any flash of winner/confetti on page load
    if (elements.winnerDisplay) {
      elements.winnerDisplay.classList.remove('show');
      elements.winnerDisplay.classList.remove('can-show');
    }
    if (elements.confettiContainer) {
      elements.confettiContainer.classList.remove('can-show');
      elements.confettiContainer.innerHTML = '';
    }
    if (elements.winnerName) {
      elements.winnerName.textContent = '-';
    }

    initCanvas();
    initTabs();
    initWheel();
    initEntries();
    initHistory();
    initSettings();
    initImport();
    initKeyboardShortcuts();

    // Blur any focused element to prevent stale events
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    // Delay enabling actions to prevent accidental triggers on page load
    setTimeout(() => {
      state.isPageReady = true;
    }, 800);

    // Enable spin button with additional delay
    setTimeout(() => {
      if (elements.spinBtn) {
        elements.spinBtn.disabled = false;
      }
    }, 1200);
  }

  function initCanvas() {
    if (elements.wheelCanvas) {
      // Use the panel or viewport width for sizing, not the immediate container
      const panel = document.getElementById('wheelPanel');
      const availableWidth = panel ? panel.clientWidth : window.innerWidth;

      // Calculate size based on available width with max limit
      let size;
      if (window.innerWidth <= 480) {
        size = Math.min(availableWidth - 40, 320);
      } else if (window.innerWidth <= 768) {
        size = Math.min(availableWidth - 60, 380);
      } else {
        // Desktop - use fixed 450px or available space
        size = Math.min(availableWidth - 80, 450);
      }

      const dpr = window.devicePixelRatio || 1;

      // Set display size
      elements.wheelCanvas.style.width = size + 'px';
      elements.wheelCanvas.style.height = size + 'px';

      // Set actual canvas size for retina
      elements.wheelCanvas.width = size * dpr;
      elements.wheelCanvas.height = size * dpr;

      ctx = elements.wheelCanvas.getContext('2d');
      ctx.scale(dpr, dpr);
    }
  }

  // ============================================
  // Tabs
  // ============================================
  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;

    // Update tab buttons
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panels
    elements.panels.forEach(panel => {
      const panelId = panel.id.replace('Panel', '');
      panel.classList.toggle('active', panelId === tabName);
    });

    // Focus input when switching to entries tab
    if (tabName === 'entries') {
      setTimeout(() => elements.entryInput?.focus(), 100);
    }
  }

  // ============================================
  // Wheel
  // ============================================
  function initWheel() {
    drawWheel();

    elements.spinBtn?.addEventListener('click', (e) => {
      if (e.isTrusted) spinWheel();
    });
    elements.pickRandomBtn?.addEventListener('click', (e) => {
      if (e.isTrusted) quickPick();
    });
    elements.resetWheelBtn?.addEventListener('click', resetWheel);

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      initCanvas();
      drawWheel();
    }, 250));
  }

  function drawWheel() {
    if (!ctx || !elements.wheelCanvas) return;

    const canvas = elements.wheelCanvas;
    // Use the style width/height which is set by initCanvas
    const size = parseInt(canvas.style.width) || 320;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = centerX - 10;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    if (state.entries.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = state.isDarkMode ? '#132f4c' : '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = state.isDarkMode ? '#1e4976' : '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = state.isDarkMode ? '#94a3b8' : '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add entries to start', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / state.entries.length;

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((state.currentRotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Draw slices
    state.entries.forEach((entry, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      // Draw border
      ctx.strokeStyle = state.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter, sans-serif';

      // Truncate long names
      let displayName = entry;
      const maxWidth = radius * 0.65;
      while (ctx.measureText(displayName).width > maxWidth && displayName.length > 3) {
        displayName = displayName.slice(0, -1);
      }
      if (displayName !== entry) {
        displayName += '...';
      }

      ctx.fillText(displayName, radius - 15, 0);
      ctx.restore();
    });

    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = state.isDarkMode ? '#0d2137' : '#fff';
    ctx.fill();
    ctx.strokeStyle = state.isDarkMode ? '#1e4976' : '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function spinWheel() {
    // DEBUG: Log every call
    console.log('spinWheel called. Stack:', new Error().stack);

    if (!canPerformAction() || state.isSpinning || state.entries.length === 0) {
      if (canPerformAction() && state.entries.length === 0) {
        showToast('Add entries first!', 'error');
      }
      return;
    }

    // Mark this as a user-initiated spin with current session
    state.userInitiatedSpin = true;
    state.currentSpinSession = SESSION_ID;
    state.isSpinning = true;
    elements.spinBtn.disabled = true;
    elements.spinBtn.classList.add('spinning');
    elements.winnerDisplay.classList.remove('show');

    // Play spin sound
    if (state.settings.sound) {
      playSpinSound();
    }

    // Calculate winner
    const winnerIndex = Math.floor(Math.random() * state.entries.length);
    const winner = state.entries[winnerIndex];

    // Calculate rotation
    // The pointer is at the TOP of the wheel (-90° in canvas terms)
    // Slice i starts at: i * sliceAngle - 90°
    // Slice i's center is at: i * sliceAngle + sliceAngle/2 - 90°
    // To have pointer point at center of winnerIndex's slice:
    // We need to rotate by: -(winnerIndex * sliceAngle + sliceAngle/2)
    const sliceAngle = 360 / state.entries.length;
    const extraRotations = 5 + Math.floor(Math.random() * 3);
    const targetRotation = extraRotations * 360 - (winnerIndex * sliceAngle) - (sliceAngle / 2);

    // Animate
    const startRotation = state.currentRotation % 360;
    const totalRotation = targetRotation - startRotation;
    const duration = state.settings.spinDuration * 1000;
    const startTime = performance.now();

    // Store the session at animation start
    const animationSession = SESSION_ID;

    function animate(currentTime) {
      // Early exit if page is unloading or session changed
      if (isPageUnloading || state.currentSpinSession !== animationSession) {
        state.isSpinning = false;
        if (elements.spinBtn) {
          elements.spinBtn.disabled = false;
          elements.spinBtn.classList.remove('spinning');
        }
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      state.currentRotation = startRotation + totalRotation * easeProgress;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin complete
        state.isSpinning = false;
        elements.spinBtn.disabled = false;
        elements.spinBtn.classList.remove('spinning');

        // Show winner - announceWinner has its own validation
        announceWinner(winner, winnerIndex);
      }
    }

    requestAnimationFrame(animate);
  }

  function announceWinner(winner, index) {
    // DEBUG: Log who called this function
    console.log('announceWinner called:', winner, 'Stack:', new Error().stack);

    // CRITICAL: Must be a user-initiated spin - this is the ONLY check that matters
    if (!state.userInitiatedSpin) {
      console.warn('BLOCKED: announceWinner called without user initiation');
      return;
    }

    // Session must match current page session
    if (state.currentSpinSession !== SESSION_ID) {
      console.warn('BLOCKED: announceWinner session mismatch');
      return;
    }

    // Page must not be unloading
    if (isPageUnloading) {
      console.warn('BLOCKED: announceWinner during page unload');
      return;
    }

    // Reset the flags immediately
    state.userInitiatedSpin = false;
    state.currentSpinSession = null;

    // Play winner sound
    if (state.settings.sound) {
      playWinSound();
    }

    // Show confetti
    if (state.settings.confetti) {
      createConfetti();
    }

    // Update winner display - clear inline styles and add classes
    elements.winnerName.textContent = winner;
    elements.winnerDisplay.style.display = '';
    elements.winnerDisplay.style.opacity = '';
    elements.winnerDisplay.classList.add('can-show');
    elements.winnerDisplay.classList.add('show');

    // Highlight entry in entries panel
    const entryItems = elements.entriesList.querySelectorAll('.entry-item');
    entryItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('highlight');
        setTimeout(() => item.classList.remove('highlight'), 2000);
      }
    });

    // Add to history
    addToHistory(winner);

    // Remove winner if setting is enabled
    if (state.settings.removeWinner) {
      setTimeout(() => {
        // Store removed entry info for potential restoration on stale refresh
        sessionStorage.setItem('luckydrawRemovedEntry', JSON.stringify({
          name: winner,
          index: index,
          timestamp: Date.now()
        }));
        removeEntry(index);
      }, 1500);
    }

    showToast(`Winner: ${winner}!`, 'success');
  }

  function quickPick() {
    // DEBUG: Log every call
    console.log('quickPick called. Stack:', new Error().stack);

    if (!canPerformAction() || isPageUnloading) return;

    if (state.entries.length === 0) {
      showToast('Add entries first!', 'error');
      return;
    }

    // Set session-protected flag for this action
    const actionSession = SESSION_ID;
    state.userInitiatedSpin = true;
    state.currentSpinSession = actionSession;

    const winnerIndex = Math.floor(Math.random() * state.entries.length);
    const winner = state.entries[winnerIndex];

    // Verify flags are still valid (page wasn't refreshed or unloading)
    if (isPageUnloading || !state.userInitiatedSpin || state.currentSpinSession !== actionSession) {
      return;
    }
    state.userInitiatedSpin = false;
    state.currentSpinSession = null;

    // Play sounds
    if (state.settings.sound) {
      playWinSound();
    }

    // Show confetti
    if (state.settings.confetti) {
      createConfetti();
    }

    // Update winner display - clear inline styles and add classes
    elements.winnerName.textContent = winner;
    elements.winnerDisplay.style.display = '';
    elements.winnerDisplay.style.opacity = '';
    elements.winnerDisplay.classList.add('can-show');
    elements.winnerDisplay.classList.add('show');

    // Add to history
    addToHistory(winner);

    // Remove winner if setting is enabled
    if (state.settings.removeWinner) {
      setTimeout(() => {
        // Store removed entry info for potential restoration on stale refresh
        sessionStorage.setItem('luckydrawRemovedEntry', JSON.stringify({
          name: winner,
          index: winnerIndex,
          timestamp: Date.now()
        }));
        removeEntry(winnerIndex);
      }, 1500);
    }

    showToast(`Winner: ${winner}!`, 'success');
  }

  function resetWheel() {
    state.currentRotation = 0;
    elements.winnerDisplay.classList.remove('show');
    drawWheel();
    showToast('Wheel reset', 'info');
  }

  // ============================================
  // Entries
  // ============================================
  function initEntries() {
    renderEntries();

    // Add entry
    elements.addEntryBtn?.addEventListener('click', addEntryFromInput);
    elements.entryInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addEntryFromInput();
      }
    });

    // Handle paste
    elements.entryInput?.addEventListener('paste', (e) => {
      const pastedText = e.clipboardData.getData('text');
      if (pastedText.includes('\n')) {
        e.preventDefault();
        const names = pastedText.split('\n').map(n => n.trim()).filter(n => n);
        names.forEach(name => addEntry(name));
        showToast(`Added ${names.length} entries`, 'success');
      }
    });

    // Bulk actions
    elements.shuffleBtn?.addEventListener('click', shuffleEntries);
    elements.clearAllBtn?.addEventListener('click', clearAllEntries);
    elements.sampleBtn?.addEventListener('click', loadSampleEntries);
  }

  function addEntryFromInput() {
    const name = elements.entryInput.value.trim();
    if (name) {
      addEntry(name);
      elements.entryInput.value = '';
      elements.entryInput.focus();
    }
  }

  function addEntry(name) {
    if (!name) return;

    state.entries.push(name);
    saveEntries();
    renderEntries();
    drawWheel();
  }

  function removeEntry(index) {
    state.entries.splice(index, 1);
    saveEntries();
    renderEntries();
    drawWheel();
  }

  function shuffleEntries() {
    if (state.entries.length < 2) {
      showToast('Need at least 2 entries to shuffle', 'info');
      return;
    }

    // Fisher-Yates shuffle
    for (let i = state.entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.entries[i], state.entries[j]] = [state.entries[j], state.entries[i]];
    }

    saveEntries();
    renderEntries();
    drawWheel();
    showToast('Entries shuffled', 'success');
  }

  function clearAllEntries() {
    if (state.entries.length === 0) {
      showToast('No entries to clear', 'info');
      return;
    }

    if (confirm('Are you sure you want to clear all entries?')) {
      state.entries = [];
      saveEntries();
      renderEntries();
      drawWheel();
      elements.winnerDisplay.classList.remove('show');
      showToast('All entries cleared', 'success');
    }
  }

  function loadSampleEntries() {
    state.entries = [...SAMPLE_ENTRIES];
    saveEntries();
    renderEntries();
    drawWheel();
    showToast('Sample entries loaded', 'success');
  }

  function renderEntries() {
    if (!elements.entriesList) return;

    // Update counts
    if (elements.entriesCount) {
      elements.entriesCount.textContent = state.entries.length;
    }
    if (elements.entriesCount2) {
      elements.entriesCount2.textContent = state.entries.length;
    }

    if (state.entries.length === 0) {
      elements.entriesEmpty?.classList.remove('hidden');
      // Clear list except empty state
      const items = elements.entriesList.querySelectorAll('.entry-item');
      items.forEach(item => item.remove());
      return;
    }

    elements.entriesEmpty?.classList.add('hidden');

    // Clear existing items
    const existingItems = elements.entriesList.querySelectorAll('.entry-item');
    existingItems.forEach(item => item.remove());

    // Render entries
    state.entries.forEach((entry, index) => {
      const item = createEntryItem(entry, index);
      elements.entriesList.appendChild(item);
    });
  }

  function createEntryItem(name, index) {
    const item = document.createElement('div');
    item.className = 'entry-item';
    item.innerHTML = `
      <span class="entry-number">${index + 1}</span>
      <span class="entry-name">${escapeHtml(name)}</span>
      <button class="entry-delete" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Delete button
    item.querySelector('.entry-delete').addEventListener('click', () => {
      removeEntry(index);
    });

    return item;
  }

  function saveEntries() {
    localStorage.setItem('luckydrawEntries', JSON.stringify(state.entries));
  }

  // ============================================
  // History
  // ============================================
  function initHistory() {
    if (state.historyCollapsed) {
      elements.historySidebar?.classList.add('collapsed');
      elements.historyShowBtn?.classList.add('visible');
    }

    renderHistory();

    const isMobile = () => window.innerWidth <= 768;

    const closeMobileSidebar = () => {
      elements.historySidebar?.classList.remove('open');
      elements.historyOverlay?.classList.remove('show');
    };

    const openMobileSidebar = () => {
      elements.historySidebar?.classList.add('open');
      elements.historyOverlay?.classList.add('show');
    };

    // Toggle sidebar
    elements.historyToggleBtn?.addEventListener('click', () => {
      if (isMobile()) {
        closeMobileSidebar();
      } else {
        state.historyCollapsed = true;
        elements.historySidebar?.classList.add('collapsed');
        elements.historyShowBtn?.classList.add('visible');
        localStorage.setItem('luckydrawHistoryCollapsed', 'true');
      }
    });

    // Show sidebar
    elements.historyShowBtn?.addEventListener('click', () => {
      state.historyCollapsed = false;
      elements.historySidebar?.classList.remove('collapsed');
      elements.historyShowBtn?.classList.remove('visible');
      localStorage.setItem('luckydrawHistoryCollapsed', 'false');
    });

    // Clear history
    elements.historyClearBtn?.addEventListener('click', () => {
      if (state.history.length === 0) {
        showToast('History is already empty', 'info');
        return;
      }
      state.history = [];
      saveHistory();
      renderHistory();
      showToast('History cleared', 'success');
    });

    // FAB (mobile)
    elements.historyFab?.addEventListener('click', openMobileSidebar);

    // Overlay click
    elements.historyOverlay?.addEventListener('click', closeMobileSidebar);

    // Handle viewport changes
    let wasMobile = isMobile();
    window.addEventListener('resize', debounce(() => {
      const nowMobile = isMobile();

      if (wasMobile !== nowMobile) {
        if (nowMobile) {
          elements.historySidebar?.classList.remove('open');
          elements.historyOverlay?.classList.remove('show');
        } else {
          elements.historySidebar?.classList.remove('open');
          elements.historyOverlay?.classList.remove('show');

          if (state.historyCollapsed) {
            elements.historySidebar?.classList.add('collapsed');
            elements.historyShowBtn?.classList.add('visible');
          } else {
            elements.historySidebar?.classList.remove('collapsed');
            elements.historyShowBtn?.classList.remove('visible');
          }
        }
        wasMobile = nowMobile;
      }
    }, 150));
  }

  function addToHistory(winner) {
    // HARD BLOCK: No history additions within 3 seconds of page load
    const timeSinceLoad = Date.now() - PAGE_LOAD_TIME;
    if (timeSinceLoad < 3000) {
      console.warn('addToHistory blocked - page too fresh:', timeSinceLoad, 'ms');
      return;
    }

    // Final safeguard: don't add to history if page is unloading
    if (isPageUnloading) {
      console.warn('Blocked history add - page is unloading');
      return;
    }

    const item = {
      id: Date.now(),
      name: winner,
      timestamp: new Date().toISOString()
    };

    state.history.unshift(item);

    if (state.history.length > MAX_HISTORY) {
      state.history = state.history.slice(0, MAX_HISTORY);
    }

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!elements.historyList) return;

    // Update badge
    if (elements.historyBadge) {
      elements.historyBadge.textContent = state.history.length;
      elements.historyBadge.setAttribute('data-count', state.history.length);
    }

    if (state.history.length === 0) {
      elements.historyEmpty?.classList.remove('hidden');
      const items = elements.historyList.querySelectorAll('.history-item');
      items.forEach(item => item.remove());
      return;
    }

    elements.historyEmpty?.classList.add('hidden');

    // Clear existing items
    const existingItems = elements.historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    // Render history
    state.history.forEach((item, index) => {
      const historyItem = createHistoryItem(item, index);
      elements.historyList.appendChild(historyItem);
    });
  }

  function createHistoryItem(item, index) {
    const div = document.createElement('div');
    div.className = 'history-item';

    const rank = index + 1;
    let rankClass = 'default';
    if (rank === 1) rankClass = 'gold';
    else if (rank === 2) rankClass = 'silver';
    else if (rank === 3) rankClass = 'bronze';

    const time = formatTime(new Date(item.timestamp));

    div.innerHTML = `
      <div class="history-item-rank ${rankClass}">${rank}</div>
      <div class="history-item-info">
        <div class="history-item-name">${escapeHtml(item.name)}</div>
        <div class="history-item-time">${time}</div>
      </div>
    `;

    return div;
  }

  function saveHistory() {
    // Don't save if page is unloading to prevent stale data
    if (isPageUnloading) return;
    localStorage.setItem('luckydrawHistory', JSON.stringify(state.history));
  }

  // ============================================
  // Settings
  // ============================================
  function initSettings() {
    // Load settings into UI
    if (elements.removeWinnerSetting) {
      elements.removeWinnerSetting.checked = state.settings.removeWinner;
    }
    if (elements.soundSetting) {
      elements.soundSetting.checked = state.settings.sound;
    }
    if (elements.confettiSetting) {
      elements.confettiSetting.checked = state.settings.confetti;
    }
    if (elements.spinDurationSetting) {
      elements.spinDurationSetting.value = state.settings.spinDuration;
      elements.spinDurationValue.textContent = state.settings.spinDuration;
    }

    // Setting changes
    elements.removeWinnerSetting?.addEventListener('change', (e) => {
      state.settings.removeWinner = e.target.checked;
      saveSettings();
    });

    elements.soundSetting?.addEventListener('change', (e) => {
      state.settings.sound = e.target.checked;
      saveSettings();
    });

    elements.confettiSetting?.addEventListener('change', (e) => {
      state.settings.confetti = e.target.checked;
      saveSettings();
    });

    elements.spinDurationSetting?.addEventListener('input', (e) => {
      state.settings.spinDuration = parseInt(e.target.value);
      elements.spinDurationValue.textContent = state.settings.spinDuration;
      saveSettings();
    });
  }

  function saveSettings() {
    localStorage.setItem('luckydrawSettings', JSON.stringify(state.settings));
  }

  // ============================================
  // Import Modal
  // ============================================
  function initImport() {
    elements.importBtn?.addEventListener('click', () => {
      elements.importModal.classList.add('show');
      elements.importTextarea.value = '';
      elements.importTextarea.focus();
    });

    elements.closeImportBtn?.addEventListener('click', () => {
      elements.importModal.classList.remove('show');
    });

    elements.cancelImportBtn?.addEventListener('click', () => {
      elements.importModal.classList.remove('show');
    });

    elements.confirmImportBtn?.addEventListener('click', () => {
      const text = elements.importTextarea.value;
      const names = text.split('\n').map(n => n.trim()).filter(n => n);

      if (names.length === 0) {
        showToast('No valid entries to import', 'error');
        return;
      }

      names.forEach(name => addEntry(name));
      elements.importModal.classList.remove('show');
      showToast(`Imported ${names.length} entries`, 'success');
    });

    elements.importModal?.addEventListener('click', (e) => {
      if (e.target === elements.importModal) {
        elements.importModal.classList.remove('show');
      }
    });
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function initKeyboardShortcuts() {
    // Shortcut modal handled by tools-common.js
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when page isn't ready or not a real keypress
      if (!canPerformAction() || !e.isTrusted) return;

      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          spinWheel();
          break;
        case 'r':
          quickPick();
          break;
        case 'n':
          switchTab('entries');
          elements.entryInput?.focus();
          break;
        case 's':
          shuffleEntries();
          break;
        case 'h':
          toggleHistory();
          break;
        case '1':
          switchTab('wheel');
          break;
        case '2':
          switchTab('entries');
          break;
        case '3':
          switchTab('settings');
          break;
        case 'escape':
          closeAllModals();
          break;
      }
    });
  }

  function toggleHistory() {
    if (window.innerWidth <= 768) {
      if (elements.historySidebar?.classList.contains('open')) {
        elements.historySidebar.classList.remove('open');
        elements.historyOverlay?.classList.remove('show');
      } else {
        elements.historySidebar?.classList.add('open');
        elements.historyOverlay?.classList.add('show');
      }
    } else {
      state.historyCollapsed = !state.historyCollapsed;
      elements.historySidebar?.classList.toggle('collapsed', state.historyCollapsed);
      elements.historyShowBtn?.classList.toggle('visible', state.historyCollapsed);
      localStorage.setItem('luckydrawHistoryCollapsed', state.historyCollapsed.toString());
    }
  }

  function closeAllModals() {
    elements.importModal?.classList.remove('show');
    elements.historySidebar?.classList.remove('open');
    elements.historyOverlay?.classList.remove('show');
    // Close shortcuts modal via tools-common
    window.ToolsCommon?.ShortcutsModal?.hide();
  }

  // ============================================
  // Sound Effects
  // ============================================
  function playSpinSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const duration = state.settings.spinDuration;

      let tickCount = 0;
      const maxTicks = 30;
      const tickInterval = setInterval(() => {
        if (tickCount >= maxTicks || !state.isSpinning) {
          clearInterval(tickInterval);
          return;
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 800 + Math.random() * 200;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.05);

        tickCount++;
      }, duration * 1000 / maxTicks);
    } catch (e) {
      // Audio not supported
    }
  }

  function playWinSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        const startTime = audioCtx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      // Audio not supported
    }
  }

  // ============================================
  // Confetti
  // ============================================
  function createConfetti() {
    // DEBUG: Log who called this function
    console.log('createConfetti called. userInitiatedSpin:', state.userInitiatedSpin, 'Stack:', new Error().stack);

    // CRITICAL: Confetti should NEVER be created on page load
    // It can only be created as part of a valid user-initiated action
    // Note: userInitiatedSpin is reset to false AFTER confetti is created in announceWinner/quickPick
    // So we check if the page is ready instead
    if (!state.isPageReady || isPageUnloading) {
      console.warn('BLOCKED: createConfetti - page not ready or unloading');
      return;
    }

    const container = elements.confettiContainer;
    if (!container) return;

    // Enable confetti container display - clear inline styles and add class
    container.style.display = '';
    container.classList.add('can-show');

    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6eb4', '#a855f7'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear forwards`;
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  }

  // ============================================
  // Footer
  // ============================================


  // ============================================
  // Utilities
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
