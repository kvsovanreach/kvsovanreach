/**
 * KVSOVANREACH Hydration Log Tool
 * Daily water intake tracker with Three.js water animation
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const STORAGE_KEY = 'kvsovanreach_hydration';

  // Check localStorage availability
  const hasStorage = (() => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  })();

  // ==================== State ====================
  const state = {
    current: 0,
    goal: 2000
  };

  // ==================== Three.js Variables ====================
  let scene, camera, renderer;
  let waterMesh, waterGeometry;
  let animationId;
  let targetWaterLevel = 0;
  let currentWaterLevel = 0;

  // Theme colors
  const themeColors = {
    dark: {
      water1: 0x3b82f6,
      water2: 0x1d4ed8,
      bg: 0x1e293b
    },
    light: {
      water1: 0x3b82f6,
      water2: 0x2563eb,
      bg: 0xe2e8f0
    }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.waterCanvas = document.getElementById('waterCanvas');
    elements.currentAmount = document.getElementById('currentAmount');
    elements.goalAmount = document.getElementById('goalAmount');
    elements.percentage = document.getElementById('percentage');
    elements.quickBtns = document.querySelectorAll('.quick-btn');
    elements.goalInput = document.getElementById('goalInput');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  // ==================== Three.js Water Animation ====================

  function initThreeJS() {
    const canvas = elements.waterCanvas;
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create water geometry
    createWaterMesh();

    // Apply initial theme colors
    updateThemeColors();

    // Start animation
    animate();

    // Handle resize
    window.addEventListener('resize', handleResize);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          updateThemeColors();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  function createWaterMesh() {
    // Water geometry - a plane with many segments for wave effect
    waterGeometry = new THREE.PlaneGeometry(2, 2, 64, 64);

    // Shader material for water effect
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWaterLevel: { value: 0 },
        uColor1: { value: new THREE.Color(0x3b82f6) },
        uColor2: { value: new THREE.Color(0x1d4ed8) },
        uBgColor: { value: new THREE.Color(0x1e293b) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWaterLevel;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uBgColor;
        varying vec2 vUv;

        void main() {
          // Wave calculation
          float wave1 = sin(vUv.x * 8.0 + uTime * 2.0) * 0.015;
          float wave2 = sin(vUv.x * 12.0 - uTime * 1.5) * 0.01;
          float wave3 = sin(vUv.x * 6.0 + uTime * 3.0) * 0.008;
          float wave = wave1 + wave2 + wave3;

          // Water surface with wave
          float waterSurface = uWaterLevel + wave;

          // Smooth edge for water surface
          float waterMask = smoothstep(waterSurface - 0.02, waterSurface + 0.02, vUv.y);

          // Water gradient
          float gradientY = (vUv.y - (1.0 - uWaterLevel)) / uWaterLevel;
          gradientY = clamp(gradientY, 0.0, 1.0);
          vec3 waterColor = mix(uColor2, uColor1, gradientY * 0.6 + 0.4);

          // Add subtle shimmer
          float shimmer = sin(vUv.x * 20.0 + uTime * 4.0) * sin(vUv.y * 15.0 + uTime * 2.0) * 0.1;
          waterColor += shimmer * 0.05;

          // Mix water and background
          vec3 finalColor = mix(waterColor, uBgColor, waterMask);

          // Add bottle edge effect
          float edgeDist = abs(vUv.x - 0.5) * 2.0;
          float edgeFade = smoothstep(0.85, 1.0, edgeDist);
          finalColor = mix(finalColor, uBgColor * 0.8, edgeFade * 0.3);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false
    });

    waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    scene.add(waterMesh);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Smooth water level transition
    currentWaterLevel += (targetWaterLevel - currentWaterLevel) * 0.05;

    // Update uniforms
    if (waterMesh) {
      waterMesh.material.uniforms.uTime.value += 0.016;
      waterMesh.material.uniforms.uWaterLevel.value = currentWaterLevel;
    }

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!elements.waterCanvas) return;

    const container = elements.waterCanvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
  }

  function updateWaterLevel() {
    const percent = Math.min((state.current / state.goal), 1);
    targetWaterLevel = percent;
  }

  function updateThemeColors() {
    if (!waterMesh) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark ? themeColors.dark : themeColors.light;

    waterMesh.material.uniforms.uColor1.value.setHex(colors.water1);
    waterMesh.material.uniforms.uColor2.value.setHex(colors.water2);
    waterMesh.material.uniforms.uBgColor.value.setHex(colors.bg);
    scene.background.setHex(colors.bg);
  }

  function disposeThreeJS() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (waterGeometry) {
      waterGeometry.dispose();
    }
    if (waterMesh && waterMesh.material) {
      waterMesh.material.dispose();
    }
    if (renderer) {
      renderer.dispose();
    }
    window.removeEventListener('resize', handleResize);
  }

  // ==================== Core Functions ====================

  function loadFromStorage() {
    if (!hasStorage) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === 'object') {
          if ('current' in data && typeof data.current === 'number') {
            state.current = data.current;
          }
          if ('goal' in data && typeof data.goal === 'number') {
            state.goal = data.goal;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load hydration data:', e);
    }
  }

  function saveToStorage() {
    if (!hasStorage) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        current: state.current,
        goal: state.goal
      }));
    } catch (e) {
      console.warn('Failed to save hydration data:', e);
    }
  }

  function updateUI() {
    const percent = Math.min((state.current / state.goal) * 100, 100);

    elements.currentAmount.textContent = state.current;
    elements.goalAmount.textContent = state.goal;
    elements.percentage.textContent = `${Math.round(percent)}%`;
    elements.goalInput.value = state.goal;

    // Update Three.js water level
    updateWaterLevel();

    // Update preset buttons
    elements.presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.goal) === state.goal);
    });

    // Celebration at 100%
    if (state.current >= state.goal && percent >= 100) {
      elements.percentage.innerHTML = '100% <i class="fa-solid fa-check"></i>';
    }
  }

  function addWater(amount) {
    state.current += amount;
    saveToStorage();
    updateUI();

    if (state.current >= state.goal) {
      ToolsCommon?.showToast?.('Goal reached! Great job staying hydrated!', 'success');
    } else {
      ToolsCommon?.showToast?.(`+${amount}ml added`, 'success');
    }
  }

  function setGoal(goal) {
    state.goal = goal;
    saveToStorage();
    updateUI();
    ToolsCommon?.showToast?.(`Goal set to ${goal}ml`, 'success');
  }

  function resetForm() {
    state.current = 0;
    saveToStorage();
    updateUI();
    ToolsCommon?.showToast?.('Progress reset', 'success');
  }

  // ==================== Event Handlers ====================

  function handleQuickAdd(e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;
    const amount = parseInt(btn.dataset.amount);
    addWater(amount);
  }

  function handleGoalInput() {
    const goal = parseInt(elements.goalInput.value);
    if (goal >= 500 && goal <= 5000) {
      setGoal(goal);
    }
  }

  function handleGoalInputBlur() {
    const goal = parseInt(elements.goalInput.value);
    if (goal < 500 || goal > 5000 || isNaN(goal)) {
      elements.goalInput.value = state.goal;
      ToolsCommon?.showToast?.('Goal must be between 500-5000ml', 'error');
    }
  }

  function handlePresetGoal(e) {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    const goal = parseInt(btn.dataset.goal);
    setGoal(goal);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    const amounts = [100, 200, 250, 330, 500];

    // Number keys 1-5 for quick add
    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      addWater(amounts[parseInt(e.key) - 1]);
      return;
    }

    // R key for reset (but not Ctrl+R or Cmd+R which is browser refresh)
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      resetForm();
      return;
    }
  }

  // ==================== Event Listeners ====================

  function setupEventListeners() {
    elements.quickBtns.forEach(btn => {
      btn.addEventListener('click', handleQuickAdd);
    });

    elements.goalInput?.addEventListener('change', handleGoalInput);
    elements.goalInput?.addEventListener('blur', handleGoalInputBlur);

    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', handlePresetGoal);
    });

    elements.resetBtn?.addEventListener('click', resetForm);
    document.addEventListener('keydown', handleKeydown);

    // Cleanup on page unload
    window.addEventListener('beforeunload', disposeThreeJS);
  }

  // ==================== Initialization ====================

  function init() {
    initElements();
    loadFromStorage();
    initThreeJS();
    updateUI();
    setupEventListeners();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
