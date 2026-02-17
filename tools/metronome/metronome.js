/**
 * KVSOVANREACH Metronome
 */

(function() {
  'use strict';

  const TEMPO_NAMES = [
    { min: 20, max: 40, name: 'Grave' },
    { min: 41, max: 60, name: 'Largo' },
    { min: 61, max: 80, name: 'Adagio' },
    { min: 81, max: 100, name: 'Andante' },
    { min: 101, max: 120, name: 'Moderato' },
    { min: 121, max: 140, name: 'Allegro' },
    { min: 141, max: 180, name: 'Vivace' },
    { min: 181, max: 240, name: 'Presto' }
  ];

  const state = {
    tempo: 120,
    beatsPerMeasure: 4,
    currentBeat: 0,
    playing: false,
    intervalId: null,
    audioContext: null
  };

  const elements = {};

  function initElements() {
    elements.tempoValue = document.getElementById('tempoValue');
    elements.tempoName = document.getElementById('tempoName');
    elements.tempoSlider = document.getElementById('tempoSlider');
    elements.beatIndicator = document.getElementById('beatIndicator');
    elements.playBtn = document.getElementById('playBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.tempoBtns = document.querySelectorAll('.tempo-btn');
    elements.signatureBtns = document.querySelectorAll('.signature-btn');
    elements.presetTempoBtns = document.querySelectorAll('.preset-tempo-btn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function getTempoName(tempo) {
    const found = TEMPO_NAMES.find(t => tempo >= t.min && tempo <= t.max);
    return found ? found.name : 'Unknown';
  }

  function updateDisplay() {
    elements.tempoValue.textContent = state.tempo;
    elements.tempoName.textContent = getTempoName(state.tempo);
    elements.tempoSlider.value = state.tempo;
  }

  function updateBeatIndicator() {
    const dots = elements.beatIndicator.querySelectorAll('.beat-dot');
    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'accent');
      if (index === state.currentBeat) {
        dot.classList.add('active');
        if (index === 0) dot.classList.add('accent');
      }
    });
  }

  function renderBeatDots() {
    elements.beatIndicator.innerHTML = '';
    for (let i = 0; i < state.beatsPerMeasure; i++) {
      const dot = document.createElement('span');
      dot.className = 'beat-dot';
      dot.dataset.beat = i + 1;
      elements.beatIndicator.appendChild(dot);
    }
  }

  function setTempo(tempo) {
    state.tempo = Math.max(20, Math.min(240, tempo));
    updateDisplay();

    if (state.playing) {
      stop();
      start();
    }
  }

  function setTimeSignature(beats) {
    state.beatsPerMeasure = beats;
    state.currentBeat = 0;
    renderBeatDots();

    elements.signatureBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.beats) === beats);
    });
  }

  function playClick(accent) {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);

    oscillator.frequency.value = accent ? 1000 : 800;
    gain.gain.value = 0.5;
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioContext.currentTime + 0.1);

    oscillator.start(state.audioContext.currentTime);
    oscillator.stop(state.audioContext.currentTime + 0.1);
  }

  function tick() {
    const isAccent = state.currentBeat === 0;
    playClick(isAccent);
    updateBeatIndicator();

    state.currentBeat = (state.currentBeat + 1) % state.beatsPerMeasure;
  }

  function start() {
    state.playing = true;
    elements.playBtn.innerHTML = '<i class="fa-solid fa-stop"></i><span>Stop</span>';
    elements.playBtn.classList.add('playing');

    const interval = (60 / state.tempo) * 1000;
    tick();
    state.intervalId = setInterval(tick, interval);
  }

  function stop() {
    state.playing = false;
    clearInterval(state.intervalId);
    state.currentBeat = 0;
    elements.playBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start</span>';
    elements.playBtn.classList.remove('playing');

    const dots = elements.beatIndicator.querySelectorAll('.beat-dot');
    dots.forEach(dot => dot.classList.remove('active', 'accent'));
  }

  function toggle() {
    if (state.playing) {
      stop();
    } else {
      start();
    }
  }

  function reset() {
    stop();
    setTempo(120);
    setTimeSignature(4);
    showToast('Reset', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    switch(e.key) {
      case ' ':
        e.preventDefault();
        toggle();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setTempo(state.tempo + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setTempo(state.tempo - 1);
        break;
    }
  }

  function init() {
    initElements();
    renderBeatDots();

    elements.tempoSlider.addEventListener('input', (e) => {
      setTempo(parseInt(e.target.value));
    });

    elements.tempoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setTempo(state.tempo + parseInt(btn.dataset.change));
      });
    });

    elements.signatureBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeSignature(parseInt(btn.dataset.beats));
      });
    });

    elements.presetTempoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setTempo(parseInt(btn.dataset.tempo));
      });
    });

    elements.playBtn.addEventListener('click', toggle);
    elements.resetBtn.addEventListener('click', reset);
    document.addEventListener('keydown', handleKeydown);

    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
