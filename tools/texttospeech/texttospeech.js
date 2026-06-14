/**
 * Text to Speech Tool
 * Convert text to speech using the Web Speech API
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    synth: window.speechSynthesis,
    voices: [],
    utterance: null,
    isPlaying: false,
    isPaused: false,
    words: [],
    currentWordIndex: -1,
    history: [],
    maxHistory: 5
  };

  // ============================================
  // Sample Texts
  // ============================================
  const sampleTexts = {
    greeting: 'Hello! Welcome to the Text to Speech tool. This is a sample greeting to test voice synthesis. How does this sound?',
    pangram: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
    numbers: 'In 2024, there were approximately 8 billion people on Earth. The speed of light is 299,792,458 meters per second. Pi is roughly 3.14159.',
    story: 'Once upon a time, in a digital land far away, there lived a little program who dreamed of speaking. One day, it found the Speech API and could finally share its stories with the world. And they all lived happily ever after.',
    technical: 'The HTTP protocol operates on port 80 by default. HTTPS uses port 443 with TLS encryption. DNS resolves domain names to IP addresses using UDP on port 53.'
  };

  // ============================================
  // DOM Elements
  // ============================================
  const el = {
    voiceSelect: document.getElementById('voiceSelect'),
    voiceLang: document.getElementById('voiceLang'),
    rateSlider: document.getElementById('rateSlider'),
    rateValue: document.getElementById('rateValue'),
    pitchSlider: document.getElementById('pitchSlider'),
    pitchValue: document.getElementById('pitchValue'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    wordCount: document.getElementById('wordCount'),
    estDuration: document.getElementById('estDuration'),
    playbackPreview: document.getElementById('playbackPreview'),
    progressBar: document.getElementById('progressBar'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    playbackStatus: document.getElementById('playbackStatus'),
    historyList: document.getElementById('historyList'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // ============================================
  // Voice Loading
  // ============================================
  function loadVoices() {
    state.voices = state.synth.getVoices();
    if (state.voices.length === 0) return;

    el.voiceSelect.innerHTML = '';

    // Group voices by language
    const grouped = {};
    state.voices.forEach(function(voice, index) {
      const lang = voice.lang.split('-')[0].toUpperCase();
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push({ voice: voice, index: index });
    });

    // Sort groups and populate
    Object.keys(grouped).sort().forEach(function(lang) {
      const group = document.createElement('optgroup');
      group.label = lang;
      grouped[lang].forEach(function(item) {
        const option = document.createElement('option');
        option.value = item.index;
        option.textContent = item.voice.name + (item.voice.default ? ' (default)' : '');
        if (item.voice.default) option.selected = true;
        group.appendChild(option);
      });
      el.voiceSelect.appendChild(group);
    });

    updateVoiceInfo();
  }

  function updateVoiceInfo() {
    const idx = parseInt(el.voiceSelect.value);
    if (isNaN(idx) || !state.voices[idx]) {
      el.voiceLang.textContent = '--';
      return;
    }
    const voice = state.voices[idx];
    el.voiceLang.textContent = voice.lang + ' | ' + (voice.localService ? 'Local' : 'Remote');
  }

  // ============================================
  // Text Stats
  // ============================================
  function updateStats() {
    const text = el.textInput.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const rate = parseFloat(el.rateSlider.value);
    // Average speaking rate is ~150 words per minute at 1x
    const durationSec = words > 0 ? Math.round((words / (150 * rate)) * 60) : 0;

    el.charCount.textContent = chars + ' character' + (chars !== 1 ? 's' : '');
    el.wordCount.textContent = words + ' word' + (words !== 1 ? 's' : '');
    el.estDuration.textContent = 'Est. ~' + durationSec + 's';
  }

  // ============================================
  // Preview / Word Highlighting
  // ============================================
  function buildPreviewWords(text) {
    if (!text.trim()) {
      el.playbackPreview.innerHTML = '<span class="preview-placeholder">Text will be highlighted here as it is spoken...</span>';
      state.words = [];
      return;
    }

    // Split text into words, preserving whitespace structure
    const tokens = text.split(/(\s+)/);
    state.words = [];
    el.playbackPreview.innerHTML = '';

    tokens.forEach(function(token) {
      if (/^\s+$/.test(token)) {
        // Whitespace - preserve it
        el.playbackPreview.appendChild(document.createTextNode(token));
      } else if (token) {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = token;
        el.playbackPreview.appendChild(span);
        state.words.push(span);
      }
    });
  }

  function highlightWord(index) {
    state.words.forEach(function(span, i) {
      span.classList.remove('active');
      if (i < index) {
        span.classList.add('spoken');
      } else {
        span.classList.remove('spoken');
      }
    });

    if (index >= 0 && index < state.words.length) {
      state.words[index].classList.add('active');
      // Scroll into view
      state.words[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update progress
    if (state.words.length > 0) {
      const pct = Math.min(((index + 1) / state.words.length) * 100, 100);
      el.progressBar.style.width = pct + '%';
    }
  }

  // ============================================
  // Playback
  // ============================================
  function speak() {
    const text = el.textInput.value.trim();
    if (!text) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter some text first', 'warning');
      }
      return;
    }

    // Stop any ongoing speech
    state.synth.cancel();

    // Build the preview
    buildPreviewWords(text);

    // Create utterance
    state.utterance = new SpeechSynthesisUtterance(text);

    const voiceIdx = parseInt(el.voiceSelect.value);
    if (!isNaN(voiceIdx) && state.voices[voiceIdx]) {
      state.utterance.voice = state.voices[voiceIdx];
    }

    state.utterance.rate = parseFloat(el.rateSlider.value);
    state.utterance.pitch = parseFloat(el.pitchSlider.value);
    state.utterance.volume = parseFloat(el.volumeSlider.value);

    state.currentWordIndex = -1;

    // Word boundary event for highlighting
    state.utterance.addEventListener('boundary', function(event) {
      if (event.name === 'word') {
        // Map character index to word index
        const charIdx = event.charIndex;
        let cumulative = 0;
        const plainText = text;

        // Find which word this character belongs to
        const tokens = plainText.split(/(\s+)/);
        let wordIdx = 0;
        for (var i = 0; i < tokens.length; i++) {
          if (/^\s+$/.test(tokens[i])) {
            cumulative += tokens[i].length;
          } else {
            if (cumulative >= charIdx && cumulative <= charIdx + tokens[i].length) {
              break;
            }
            if (cumulative + tokens[i].length > charIdx) {
              break;
            }
            cumulative += tokens[i].length;
            wordIdx++;
          }
        }

        state.currentWordIndex = wordIdx;
        highlightWord(wordIdx);
      }
    });

    state.utterance.addEventListener('start', function() {
      state.isPlaying = true;
      state.isPaused = false;
      updatePlaybackUI();
      el.playbackStatus.textContent = 'Speaking...';
    });

    state.utterance.addEventListener('end', function() {
      state.isPlaying = false;
      state.isPaused = false;
      state.currentWordIndex = -1;
      el.progressBar.style.width = '100%';
      updatePlaybackUI();
      el.playbackStatus.textContent = 'Finished';

      // Mark all as spoken
      state.words.forEach(function(w) {
        w.classList.remove('active');
        w.classList.add('spoken');
      });

      // Add to history
      addToHistory(text);

      setTimeout(function() {
        el.progressBar.style.width = '0%';
        el.playbackStatus.textContent = 'Ready';
      }, 2000);
    });

    state.utterance.addEventListener('error', function(e) {
      state.isPlaying = false;
      state.isPaused = false;
      updatePlaybackUI();
      el.playbackStatus.textContent = 'Error';
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Speech error: ' + e.error, 'error');
      }
    });

    state.synth.speak(state.utterance);
  }

  function pauseSpeech() {
    if (state.isPlaying && !state.isPaused) {
      state.synth.pause();
      state.isPaused = true;
      state.isPlaying = true;
      updatePlaybackUI();
      el.playbackStatus.textContent = 'Paused';
    }
  }

  function resumeSpeech() {
    if (state.isPaused) {
      state.synth.resume();
      state.isPaused = false;
      state.isPlaying = true;
      updatePlaybackUI();
      el.playbackStatus.textContent = 'Speaking...';
    }
  }

  function stopSpeech() {
    state.synth.cancel();
    state.isPlaying = false;
    state.isPaused = false;
    state.currentWordIndex = -1;
    el.progressBar.style.width = '0%';
    updatePlaybackUI();
    el.playbackStatus.textContent = 'Ready';

    // Reset word styling
    state.words.forEach(function(w) {
      w.classList.remove('active', 'spoken');
    });
  }

  function updatePlaybackUI() {
    el.pauseBtn.disabled = !state.isPlaying;
    el.stopBtn.disabled = !state.isPlaying && !state.isPaused;

    if (state.isPlaying && !state.isPaused) {
      el.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      el.playBtn.title = 'Play';
    } else {
      el.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      el.playBtn.title = 'Play';
    }
  }

  // ============================================
  // History
  // ============================================
  function addToHistory(text) {
    // Avoid duplicates at top
    if (state.history.length > 0 && state.history[0] === text) return;

    state.history.unshift(text);
    if (state.history.length > state.maxHistory) {
      state.history.pop();
    }
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      el.historyList.innerHTML = '<div class="history-empty">No history yet</div>';
      return;
    }

    el.historyList.innerHTML = '';
    state.history.forEach(function(text, index) {
      var item = document.createElement('div');
      item.className = 'history-item';
      item.title = text;
      item.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i><span>' +
        escapeHTML(text.substring(0, 60)) + (text.length > 60 ? '...' : '') + '</span>';
      item.addEventListener('click', function() {
        el.textInput.value = text;
        updateStats();
        buildPreviewWords(text);
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Text loaded from history', 'success');
        }
      });
      el.historyList.appendChild(item);
    });
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================
  // Slider Updates
  // ============================================
  function setupSliders() {
    el.rateSlider.addEventListener('input', function() {
      el.rateValue.textContent = parseFloat(this.value).toFixed(1) + 'x';
      updateStats();
    });

    el.pitchSlider.addEventListener('input', function() {
      el.pitchValue.textContent = parseFloat(this.value).toFixed(1);
    });

    el.volumeSlider.addEventListener('input', function() {
      el.volumeValue.textContent = Math.round(parseFloat(this.value) * 100) + '%';
    });
  }

  // ============================================
  // Event Listeners
  // ============================================
  function init() {
    // Load voices
    loadVoices();
    if (state.synth.onvoiceschanged !== undefined) {
      state.synth.onvoiceschanged = loadVoices;
    }

    // Voice select change
    el.voiceSelect.addEventListener('change', updateVoiceInfo);

    // Sliders
    setupSliders();

    // Text input
    el.textInput.addEventListener('input', function() {
      updateStats();
    });

    // Play button
    el.playBtn.addEventListener('click', function() {
      if (state.isPaused) {
        resumeSpeech();
      } else if (state.isPlaying) {
        pauseSpeech();
      } else {
        speak();
      }
    });

    // Pause button
    el.pauseBtn.addEventListener('click', function() {
      if (state.isPaused) {
        resumeSpeech();
      } else {
        pauseSpeech();
      }
    });

    // Stop button
    el.stopBtn.addEventListener('click', stopSpeech);

    // Paste button
    el.pasteBtn.addEventListener('click', function() {
      navigator.clipboard.readText().then(function(text) {
        el.textInput.value = text;
        updateStats();
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Text pasted', 'success');
        }
      }).catch(function() {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Could not access clipboard', 'error');
        }
      });
    });

    // Clear button
    el.clearBtn.addEventListener('click', function() {
      stopSpeech();
      el.textInput.value = '';
      updateStats();
      buildPreviewWords('');
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Text cleared', 'success');
      }
    });

    // Sample text buttons
    document.querySelectorAll('.sample-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = this.getAttribute('data-sample');
        if (sampleTexts[key]) {
          el.textInput.value = sampleTexts[key];
          updateStats();
          buildPreviewWords(sampleTexts[key]);
          if (typeof ToolsCommon !== 'undefined') {
            ToolsCommon.showToast('Sample text loaded', 'success');
          }
        }
      });
    });

    // Keyboard shortcut: Space to play/pause (when not in textarea)
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPaused) {
          resumeSpeech();
        } else if (state.isPlaying) {
          pauseSpeech();
        } else {
          speak();
        }
      } else if (e.key === 'Escape') {
        stopSpeech();
      }
    });

    // Stop speech when page unloads
    window.addEventListener('beforeunload', function() {
      state.synth.cancel();
    });

    // Initial stats
    updateStats();
  }

  // ============================================
  // Init
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
