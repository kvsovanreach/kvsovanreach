/**
 * Morse Code Translator
 * Convert text to Morse code and vice versa
 */

(function() {
  'use strict';

  // ==================== Morse Code Map ====================
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
  };

  // Reverse mapping
  const reverseMorse = Object.fromEntries(
    Object.entries(morseCode).map(([char, code]) => [code, char])
  );

  // ==================== Audio Context ====================
  let audioContext = null;
  let isPlaying = false;

  // ==================== State ====================
  let speed = 15; // WPM
  let frequency = 700; // Hz
  let currentMode = 'encode';

  // ==================== DOM Elements ====================
  const elements = {
    wrapper: document.querySelector('.morse-wrapper'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    activeModeLabel: document.getElementById('activeModeLabel'),
    morseKeyboardSection: document.getElementById('morseKeyboardSection'),
    panels: document.querySelectorAll('.morse-panel'),
    encodeInput: document.getElementById('encodeInput'),
    encodeOutput: document.getElementById('encodeOutput'),
    decodeInput: document.getElementById('decodeInput'),
    decodeOutput: document.getElementById('decodeOutput'),
    encPasteBtn: document.getElementById('encPasteBtn'),
    encClearBtn: document.getElementById('encClearBtn'),
    encCopyBtn: document.getElementById('encCopyBtn'),
    playEncodeBtn: document.getElementById('playEncodeBtn'),
    decPasteBtn: document.getElementById('decPasteBtn'),
    decClearBtn: document.getElementById('decClearBtn'),
    decCopyBtn: document.getElementById('decCopyBtn'),
    morseKeys: document.querySelectorAll('.morse-key'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    freqSlider: document.getElementById('freqSlider'),
    freqValue: document.getElementById('freqValue'),
    showRefBtn: document.getElementById('showRefBtn'),
    referenceModal: document.getElementById('referenceModal'),
    closeRefBtn: document.getElementById('closeRefBtn'),
    lettersGrid: document.getElementById('lettersGrid'),
    numbersGrid: document.getElementById('numbersGrid'),
    punctuationGrid: document.getElementById('punctuationGrid'),
    toggleSidebarBtn: document.getElementById('toggleSidebarBtn')
  };

  // ==================== Encoding ====================
  function encodeToMorse(text) {
    return text.toUpperCase().split('').map(char => {
      return morseCode[char] || char;
    }).join(' ').replace(/  +/g, ' / ');
  }

  function updateEncode() {
    const text = elements.encodeInput.value;
    if (!text) {
      elements.encodeOutput.innerHTML = '<span class="placeholder">Morse code will appear here</span>';
      return;
    }

    const chars = text.toUpperCase().split('');
    let html = '';

    chars.forEach((char) => {
      const code = morseCode[char];
      if (char === ' ') {
        html += '<span class="morse-space"></span>';
      } else if (code) {
        html += `<span class="morse-char" title="${char}">${code}</span>`;
      }
    });

    elements.encodeOutput.innerHTML = html || encodeToMorse(text);
  }

  // ==================== Decoding ====================
  function decodeFromMorse(morse) {
    // Normalize input
    morse = morse
      .replace(/•/g, '.')
      .replace(/−/g, '-')
      .replace(/\|/g, '/')
      .trim();

    // Split by word separator
    const words = morse.split(/\s*\/\s*/);

    return words.map(word => {
      const letters = word.trim().split(/\s+/);
      return letters.map(code => reverseMorse[code] || '?').join('');
    }).join(' ');
  }

  function updateDecode() {
    const morse = elements.decodeInput.value;
    if (!morse) {
      elements.decodeOutput.innerHTML = '<span class="placeholder">Decoded text will appear here</span>';
      return;
    }

    const text = decodeFromMorse(morse);
    elements.decodeOutput.textContent = text;
  }

  // ==================== Audio Playback ====================
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function playTone(duration) {
    return new Promise(resolve => {
      const ctx = initAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      setTimeout(resolve, duration * 1000);
    });
  }

  function playSilence(duration) {
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  async function playMorse() {
    if (isPlaying) {
      isPlaying = false;
      elements.playEncodeBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      return;
    }

    const text = elements.encodeInput.value;
    if (!text) {
      ToolsCommon.showToast('Enter some text first', 'error');
      return;
    }

    isPlaying = true;
    elements.playEncodeBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';

    // Timing based on WPM (PARIS standard)
    const dotDuration = 1.2 / speed;
    const dashDuration = dotDuration * 3;
    const symbolGap = dotDuration;
    const letterGap = dotDuration * 3;
    const wordGap = dotDuration * 7;

    const morse = encodeToMorse(text);

    for (const symbol of morse) {
      if (!isPlaying) break;

      switch (symbol) {
        case '.':
          await playTone(dotDuration);
          await playSilence(symbolGap);
          break;
        case '-':
          await playTone(dashDuration);
          await playSilence(symbolGap);
          break;
        case ' ':
          await playSilence(letterGap);
          break;
        case '/':
          await playSilence(wordGap);
          break;
      }
    }

    isPlaying = false;
    elements.playEncodeBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }

  // ==================== Mode Switching ====================
  function switchMode(mode) {
    currentMode = mode;

    // Update mode buttons
    elements.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update mode label
    if (elements.activeModeLabel) {
      elements.activeModeLabel.textContent = mode === 'encode' ? 'Encode' : 'Decode';
    }

    // Update panels
    elements.panels.forEach(p => {
      p.classList.toggle('active', p.id === mode + 'Panel');
    });

    // Show/hide morse keyboard section
    if (elements.morseKeyboardSection) {
      elements.morseKeyboardSection.classList.toggle('show', mode === 'decode');
    }

    // Close sidebar on mobile
    elements.wrapper?.classList.remove('show-sidebar');
  }

  // ==================== Mobile Toggle ====================
  function toggleSidebar() {
    elements.wrapper?.classList.toggle('show-sidebar');
  }

  // ==================== Reference Modal ====================
  function openReferenceModal() {
    elements.referenceModal?.classList.add('show');
  }

  function closeReferenceModal() {
    elements.referenceModal?.classList.remove('show');
  }

  function populateReferenceGrids() {
    // Letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (elements.lettersGrid) {
      elements.lettersGrid.innerHTML = letters.map(char => `
        <div class="reference-item" data-char="${char}">
          <span class="char">${char}</span>
          <span class="code">${morseCode[char]}</span>
        </div>
      `).join('');
    }

    // Numbers
    const numbers = '0123456789'.split('');
    if (elements.numbersGrid) {
      elements.numbersGrid.innerHTML = numbers.map(char => `
        <div class="reference-item" data-char="${char}">
          <span class="char">${char}</span>
          <span class="code">${morseCode[char]}</span>
        </div>
      `).join('');
    }

    // Punctuation
    const punctuation = '.,?\'!/()&:;=+-_"$@'.split('');
    if (elements.punctuationGrid) {
      elements.punctuationGrid.innerHTML = punctuation.map(char => `
        <div class="reference-item" data-char="${char}">
          <span class="char">${char}</span>
          <span class="code">${morseCode[char]}</span>
        </div>
      `).join('');
    }

    // Add click handlers
    document.querySelectorAll('.reference-item').forEach(item => {
      item.addEventListener('click', () => {
        const char = item.dataset.char;
        elements.encodeInput.value += char;
        updateEncode();
        switchMode('encode');
        closeReferenceModal();
      });
    });
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Mode switching
    elements.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Mobile toggle
    elements.toggleSidebarBtn?.addEventListener('click', toggleSidebar);

    // Encode input
    elements.encodeInput?.addEventListener('input', updateEncode);

    // Decode input
    elements.decodeInput?.addEventListener('input', updateDecode);

    // Morse keyboard
    elements.morseKeys.forEach(key => {
      key.addEventListener('click', () => {
        const char = key.dataset.char;
        if (char === 'backspace') {
          elements.decodeInput.value = elements.decodeInput.value.slice(0, -1);
        } else {
          elements.decodeInput.value += char;
        }
        updateDecode();
      });
    });

    // Encode actions
    elements.encPasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        elements.encodeInput.value = text;
        updateEncode();
        ToolsCommon.showToast('Pasted', 'success');
      } catch (err) {
        ToolsCommon.showToast('Failed to paste', 'error');
      }
    });

    elements.encClearBtn?.addEventListener('click', () => {
      elements.encodeInput.value = '';
      updateEncode();
      ToolsCommon.showToast('Cleared', 'success');
    });

    elements.encCopyBtn?.addEventListener('click', () => {
      const morse = encodeToMorse(elements.encodeInput.value);
      if (!morse) {
        ToolsCommon.showToast('Nothing to copy', 'error');
        return;
      }
      ToolsCommon.copyWithToast(morse, 'Copied!');
    });

    elements.playEncodeBtn?.addEventListener('click', playMorse);

    // Decode actions
    elements.decPasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        elements.decodeInput.value = text;
        updateDecode();
        ToolsCommon.showToast('Pasted', 'success');
      } catch (err) {
        ToolsCommon.showToast('Failed to paste', 'error');
      }
    });

    elements.decClearBtn?.addEventListener('click', () => {
      elements.decodeInput.value = '';
      updateDecode();
      ToolsCommon.showToast('Cleared', 'success');
    });

    elements.decCopyBtn?.addEventListener('click', () => {
      const text = elements.decodeOutput.textContent;
      if (!text || text === 'Decoded text will appear here') {
        ToolsCommon.showToast('Nothing to copy', 'error');
        return;
      }
      ToolsCommon.copyWithToast(text, 'Copied!');
    });

    // Audio settings
    elements.speedSlider?.addEventListener('input', (e) => {
      speed = parseInt(e.target.value);
      elements.speedValue.textContent = speed + ' WPM';
    });

    elements.freqSlider?.addEventListener('input', (e) => {
      frequency = parseInt(e.target.value);
      elements.freqValue.textContent = frequency + ' Hz';
    });

    // Reference modal
    elements.showRefBtn?.addEventListener('click', openReferenceModal);
    elements.closeRefBtn?.addEventListener('click', closeReferenceModal);
    elements.referenceModal?.addEventListener('click', (e) => {
      if (e.target === elements.referenceModal) closeReferenceModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Close modals on Escape
      if (e.key === 'Escape') {
        if (elements.referenceModal?.classList.contains('show')) {
          closeReferenceModal();
        } else if (elements.wrapper?.classList.contains('show-sidebar')) {
          elements.wrapper.classList.remove('show-sidebar');
        }
        return;
      }

      // Don't trigger shortcuts when typing
      if (e.target.matches('textarea, input')) return;

      switch (e.key.toLowerCase()) {
        case 'p':
          playMorse();
          break;
        case 'r':
          openReferenceModal();
          break;
        case '1':
          switchMode('encode');
          break;
        case '2':
          switchMode('decode');
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    populateReferenceGrids();
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
