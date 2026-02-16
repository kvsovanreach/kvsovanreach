/**
 * KVSOVANREACH Dead Pixel Test Tool
 * Fullscreen color cycling for pixel testing
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const COLORS = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFFFF', // White
    '#000000', // Black
    '#FFFF00', // Yellow
    '#00FFFF', // Cyan
    '#FF00FF'  // Magenta
  ];

  // ==================== State ====================
  const state = {
    currentColorIndex: 0,
    isFullscreen: false
  };

  // ==================== DOM Elements ====================
  const elements = {
    testScreen: document.getElementById('testScreen'),
    testHint: document.getElementById('testHint'),
    startBtn: document.getElementById('startBtn'),
    colorBtns: document.querySelectorAll('.color-btn')
  };

  // ==================== Core Functions ====================

  function setColor(color) {
    elements.testScreen.style.backgroundColor = color;
    state.currentColorIndex = COLORS.indexOf(color);
    if (state.currentColorIndex === -1) state.currentColorIndex = 0;
  }

  function nextColor() {
    state.currentColorIndex = (state.currentColorIndex + 1) % COLORS.length;
    setColor(COLORS[state.currentColorIndex]);
  }

  function prevColor() {
    state.currentColorIndex = (state.currentColorIndex - 1 + COLORS.length) % COLORS.length;
    setColor(COLORS[state.currentColorIndex]);
  }

  function enterFullscreen() {
    const elem = elements.testScreen;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    elements.testScreen.classList.add('active');
    state.isFullscreen = true;
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    elements.testScreen.classList.remove('active');
    state.isFullscreen = false;
  }

  // ==================== Event Handlers ====================

  function handleStartClick() {
    setColor(COLORS[0]);
    enterFullscreen();
  }

  function handleColorBtnClick(e) {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;

    const color = btn.dataset.color;
    setColor(color);
    enterFullscreen();
  }

  function handleTestScreenClick() {
    nextColor();
  }

  function handleKeydown(e) {
    if (!state.isFullscreen && !elements.testScreen.classList.contains('active')) return;

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextColor();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevColor();
        break;
      case 'Escape':
        exitFullscreen();
        break;
    }
  }

  function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      elements.testScreen.classList.remove('active');
      state.isFullscreen = false;
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.startBtn?.addEventListener('click', handleStartClick);

    elements.colorBtns.forEach(btn => {
      btn.addEventListener('click', handleColorBtnClick);
    });

    elements.testScreen?.addEventListener('click', handleTestScreenClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
