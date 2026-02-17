/**
 * Coin Toss Tool
 * 3D coin flip with Three.js animation
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    isFlipping: false,
    heads: 0,
    tails: 0,
    history: []
  };

  // ==================== Three.js Variables ====================
  let scene, camera, renderer, coin;
  let animationId = null;
  let targetRotation = { y: 0, z: 0 };
  let currentRotation = { y: 0, z: 0 };

  // ==================== DOM Elements ====================
  const elements = {
    wrapper: document.querySelector('.cointoss-wrapper'),
    canvas: document.getElementById('coinCanvas'),
    resultDisplay: document.getElementById('resultDisplay'),
    flipBtn: document.getElementById('flipBtn'),
    flipBtnMobile: document.getElementById('flipBtnMobile'),
    totalFlips: document.getElementById('totalFlips'),
    headsCount: document.getElementById('headsCount'),
    tailsCount: document.getElementById('tailsCount'),
    headsBar: document.getElementById('headsBar'),
    tailsBar: document.getElementById('tailsBar'),
    headsPercent: document.getElementById('headsPercent'),
    tailsPercent: document.getElementById('tailsPercent'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    toggleStatsBtn: document.getElementById('toggleStatsBtn')
  };

  // ==================== Three.js Setup ====================
  function initThreeJS() {
    const container = elements.canvas.parentElement;
    // Use the smaller dimension to ensure square aspect
    const size = Math.min(container.clientWidth, container.clientHeight) || 300;

    // Scene
    scene = new THREE.Scene();

    // Camera - square aspect ratio (1:1)
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = getCameraDistance();

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: elements.canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Create coin
    createCoin();

    // Start render loop
    animate();

    // Handle resize
    window.addEventListener('resize', handleResize);
  }

  function createCoin() {
    const radius = 1.2;
    const thickness = 0.12;
    const segments = 64;

    // Coin geometry (cylinder)
    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, segments);

    // Create canvas textures for heads and tails
    // Different rotations: top face vs bottom face have opposite orientations
    const headsTexture = createCoinTexture('H', '#f59e0b', '#fcd34d', -Math.PI / 2);
    const tailsTexture = createCoinTexture('T', '#64748b', '#94a3b8', Math.PI / 2);

    // Edge material (golden rim)
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.8,
      roughness: 0.3
    });

    // Face materials
    const headsMaterial = new THREE.MeshStandardMaterial({
      map: headsTexture,
      metalness: 0.6,
      roughness: 0.4
    });

    const tailsMaterial = new THREE.MeshStandardMaterial({
      map: tailsTexture,
      metalness: 0.6,
      roughness: 0.4
    });

    // Apply materials: [edge, heads (top), tails (bottom)]
    const materials = [edgeMaterial, headsMaterial, tailsMaterial];

    coin = new THREE.Mesh(geometry, materials);
    // Orient coin so faces point toward/away from camera
    // rotation.x = PI/2 makes top face point toward camera (+Z)
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);
  }

  function createCoinTexture(letter, bgColor, highlightColor, rotation) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, highlightColor);
    gradient.addColorStop(0.7, bgColor);
    gradient.addColorStop(1, bgColor);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle decoration
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Letter - rotated based on face
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(rotation);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 0, 0);
    ctx.restore();

    // Shine effect
    const shineGradient = ctx.createLinearGradient(0, 0, 512, 512);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Smooth rotation interpolation
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.15;
    currentRotation.z += (targetRotation.z - currentRotation.z) * 0.15;

    if (coin) {
      // Base orientation: face toward camera
      coin.rotation.x = Math.PI / 2 + currentRotation.z; // Flip rotation
      coin.rotation.y = currentRotation.y; // Wobble rotation
    }

    renderer.render(scene, camera);
  }

  function getCameraDistance() {
    // Same distance for all screen sizes - coin fills the square canvas nicely
    return 4;
  }

  function handleResize() {
    const container = elements.canvas.parentElement;
    // Use the smaller dimension to ensure square aspect
    const size = Math.min(container.clientWidth, container.clientHeight) || 300;

    camera.aspect = 1; // Keep square
    camera.position.z = getCameraDistance();
    camera.updateProjectionMatrix();
    renderer.setSize(size, size);
  }

  // ==================== Flip Animation ====================
  function flipCoin() {
    if (state.isFlipping) return;

    state.isFlipping = true;
    setButtonsDisabled(true);

    // Update display
    elements.resultDisplay.className = 'result-display flipping';
    elements.resultDisplay.querySelector('.result-text').textContent = 'Flipping...';

    // Random result
    const isHeads = Math.random() < 0.5;

    // Calculate target rotation
    // Multiple full rotations for visual effect
    const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations

    // Final rotation to show correct face to camera
    // Heads: face camera (rotation.z = 0)
    // Tails: face away then flip to show (rotation.z = PI)
    const finalZ = isHeads ? 0 : Math.PI;
    const totalZRotation = fullRotations * Math.PI * 2 + finalZ;

    // Add wobble on Y axis for realism
    const wobbleY = (Math.random() - 0.5) * 0.3;

    // Animate
    const duration = 1800;
    const startTime = Date.now();
    const startZ = currentRotation.z;
    const startY = currentRotation.y;

    function animateFlip() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Main flip rotation (around Z axis - coin flips end over end)
      targetRotation.z = startZ + (totalZRotation - startZ) * eased;

      // Wobble effect (peaks in middle, settles at end)
      const wobbleProgress = Math.sin(progress * Math.PI);
      targetRotation.y = startY + wobbleY * wobbleProgress;

      if (progress < 1) {
        requestAnimationFrame(animateFlip);
      } else {
        // Snap to exact final position
        targetRotation.z = finalZ;
        targetRotation.y = 0;
        currentRotation.z = finalZ;
        currentRotation.y = 0;

        // Animation complete
        finishFlip(isHeads);
      }
    }

    animateFlip();
  }

  function finishFlip(isHeads) {
    // Update state
    if (isHeads) {
      state.heads++;
      state.history.unshift('heads');
      elements.resultDisplay.className = 'result-display heads';
      elements.resultDisplay.querySelector('.result-text').textContent = 'HEADS!';
    } else {
      state.tails++;
      state.history.unshift('tails');
      elements.resultDisplay.className = 'result-display tails';
      elements.resultDisplay.querySelector('.result-text').textContent = 'TAILS!';
    }

    // Keep only last 30 in history
    if (state.history.length > 30) {
      state.history.pop();
    }

    updateStats();
    updateHistory();

    state.isFlipping = false;
    setButtonsDisabled(false);
  }

  function setButtonsDisabled(disabled) {
    if (elements.flipBtn) elements.flipBtn.disabled = disabled;
    if (elements.flipBtnMobile) elements.flipBtnMobile.disabled = disabled;
  }

  // ==================== Stats & History ====================
  function updateStats() {
    const total = state.heads + state.tails;

    elements.totalFlips.textContent = total;
    elements.headsCount.textContent = state.heads;
    elements.tailsCount.textContent = state.tails;

    if (total > 0) {
      const headsPercent = ((state.heads / total) * 100).toFixed(1);
      const tailsPercent = ((state.tails / total) * 100).toFixed(1);

      elements.headsBar.style.width = `${headsPercent}%`;
      elements.tailsBar.style.width = `${tailsPercent}%`;
      elements.headsPercent.textContent = `${headsPercent}%`;
      elements.tailsPercent.textContent = `${tailsPercent}%`;
    } else {
      elements.headsBar.style.width = '50%';
      elements.tailsBar.style.width = '50%';
      elements.headsPercent.textContent = '50.0%';
      elements.tailsPercent.textContent = '50.0%';
    }
  }

  function updateHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<span class="history-empty">No flips yet</span>';
      return;
    }

    elements.historyList.innerHTML = state.history.map((result, index) =>
      `<span class="history-item ${result}" title="Flip #${state.heads + state.tails - index}">${result === 'heads' ? 'H' : 'T'}</span>`
    ).join('');
  }

  function clearHistory() {
    state.heads = 0;
    state.tails = 0;
    state.history = [];

    // Reset coin position (heads facing camera)
    targetRotation.z = 0;
    targetRotation.y = 0;

    elements.resultDisplay.className = 'result-display';
    elements.resultDisplay.querySelector('.result-text').textContent = 'Click to flip!';

    updateStats();
    updateHistory();
    ToolsCommon.showToast('History cleared', 'success');
  }

  // ==================== Mobile Toggle ====================
  function toggleStats() {
    elements.wrapper?.classList.toggle('show-stats');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Flip buttons
    elements.flipBtn?.addEventListener('click', flipCoin);
    elements.flipBtnMobile?.addEventListener('click', flipCoin);

    // Canvas click
    elements.canvas?.addEventListener('click', flipCoin);

    // Clear history
    elements.clearHistoryBtn?.addEventListener('click', clearHistory);

    // Mobile toggle
    elements.toggleStatsBtn?.addEventListener('click', toggleStats);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Close sidebar on Escape
      if (e.key === 'Escape') {
        if (elements.wrapper?.classList.contains('show-stats')) {
          elements.wrapper.classList.remove('show-stats');
        }
        return;
      }

      // Don't trigger when typing
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;

      // Flip on Space or F
      if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        flipCoin();
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initThreeJS();
    initEventListeners();

    // Set initial coin position (heads facing camera)
    targetRotation.z = 0;
    targetRotation.y = 0;
    currentRotation.z = 0;
    currentRotation.y = 0;
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
