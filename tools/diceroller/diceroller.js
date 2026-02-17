/**
 * KVSOVANREACH Dice Roller - D6 Only
 */

(function() {
  'use strict';

  const state = {
    count: 1,
    history: [],
    isRolling: false,
    hasResult: false
  };

  const elements = {};
  let scene, camera, renderer;
  let diceGroup = [];

  function initElements() {
    elements.diceCount = document.getElementById('diceCount');
    elements.decreaseCount = document.getElementById('decreaseCount');
    elements.increaseCount = document.getElementById('increaseCount');
    elements.canvas = document.getElementById('diceCanvas');
    elements.resultNumber = document.getElementById('resultNumber');
    elements.resultDetails = document.getElementById('resultDetails');
    elements.rollBtn = document.getElementById('rollBtn');
    elements.historyList = document.getElementById('historyList');
    elements.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    elements.resetBtn = document.getElementById('resetBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // Three.js Setup
  function initThreeJS() {
    const container = elements.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({
      canvas: elements.canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3776a1, 0.4);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    createDiceGroup(1);
    animate();

    window.addEventListener('resize', onWindowResize);
  }

  function createNumberTexture(number, bgColor = '#3776a1', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createCubeMaterials() {
    // D6: faces in order +X, -X, +Y, -Y, +Z, -Z
    // Standard die: opposite faces sum to 7
    const faceNumbers = [3, 4, 1, 6, 2, 5];
    return faceNumbers.map(num =>
      new THREE.MeshStandardMaterial({
        map: createNumberTexture(num),
        roughness: 0.3,
        metalness: 0.1
      })
    );
  }

  function clearDiceGroup() {
    diceGroup.forEach(dice => {
      scene.remove(dice);
      dice.geometry.dispose();
      if (Array.isArray(dice.material)) {
        dice.material.forEach(m => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (dice.material.map) dice.material.map.dispose();
        dice.material.dispose();
      }
    });
    diceGroup = [];
  }

  function createDiceGroup(count) {
    clearDiceGroup();

    const baseSize = count === 1 ? 1.5 : (count <= 3 ? 1.2 : 0.9);
    const spacing = count === 1 ? 0 : (count <= 3 ? 1.8 : 1.4);
    const totalWidth = (count - 1) * spacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < count; i++) {
      const dice = createSingleDice(baseSize);
      dice.position.x = startX + i * spacing;
      dice.rotation.x = Math.PI / 6 + Math.random() * 0.3;
      dice.rotation.y = Math.PI / 4 + Math.random() * 0.3;
      scene.add(dice);
      diceGroup.push(dice);
    }

    camera.position.z = count === 1 ? 5 : (count <= 3 ? 6 : 7);
  }

  function createSingleDice(size) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = createCubeMaterials();
    const dice = new THREE.Mesh(geometry, material);

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x1d4f6f });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    dice.add(edges);

    return dice;
  }

  // Face rotations to show each number facing the camera
  const D6_FACE_ROTATIONS = {
    1: { x: Math.PI / 2, y: 0, z: 0 },
    2: { x: 0, y: 0, z: 0 },
    3: { x: 0, y: -Math.PI / 2, z: 0 },
    4: { x: 0, y: Math.PI / 2, z: 0 },
    5: { x: 0, y: Math.PI, z: 0 },
    6: { x: -Math.PI / 2, y: 0, z: 0 }
  };

  function updateDiceMaterials(diceIndex, result) {
    if (diceIndex >= diceGroup.length) return;

    const dice = diceGroup[diceIndex];
    const materials = [];
    const faceNumbers = [3, 4, 1, 6, 2, 5];

    faceNumbers.forEach(num => {
      const isResult = num === result;
      materials.push(new THREE.MeshStandardMaterial({
        map: createNumberTexture(num, isResult ? '#2d8a4e' : '#3776a1'),
        roughness: 0.3,
        metalness: 0.1
      }));
    });

    if (Array.isArray(dice.material)) {
      dice.material.forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }

    dice.material = materials;
  }

  function onWindowResize() {
    const container = elements.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!state.isRolling && !state.hasResult && diceGroup.length > 0) {
      diceGroup.forEach((dice, index) => {
        dice.rotation.y += 0.008 + index * 0.001;
        dice.rotation.x += 0.002 + index * 0.0005;
      });
    }

    renderer.render(scene, camera);
  }

  function normalizeAngle(angle) {
    return ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }

  function calculateTargetRotation(dice, finalRotation, spinsX, spinsY) {
    const currentNormX = normalizeAngle(dice.rotation.x);
    const currentNormY = normalizeAngle(dice.rotation.y);
    const targetNormX = normalizeAngle(finalRotation.x);
    const targetNormY = normalizeAngle(finalRotation.y);

    let adjustX = targetNormX - currentNormX;
    let adjustY = targetNormY - currentNormY;
    if (adjustX < 0) adjustX += Math.PI * 2;
    if (adjustY < 0) adjustY += Math.PI * 2;

    return {
      x: dice.rotation.x + Math.PI * 2 * spinsX + adjustX,
      y: dice.rotation.y + Math.PI * 2 * spinsY + adjustY,
      z: finalRotation.z
    };
  }

  function rollDice() {
    if (state.isRolling || diceGroup.length === 0) return;

    state.isRolling = true;
    state.hasResult = false;
    elements.rollBtn.disabled = true;
    elements.resultNumber.classList.remove('highlight');

    const rolls = [];
    for (let i = 0; i < state.count; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }

    const duration = 1200;
    const startTime = Date.now();

    const startRotations = diceGroup.map(dice => ({
      x: dice.rotation.x,
      y: dice.rotation.y,
      z: dice.rotation.z
    }));

    const targetRotations = diceGroup.map((dice, index) => {
      const spinsX = 3 + Math.floor(Math.random() * 3);
      const spinsY = 3 + Math.floor(Math.random() * 3);
      const finalRotation = D6_FACE_ROTATIONS[rolls[index]];
      return calculateTargetRotation(dice, finalRotation, spinsX, spinsY);
    });

    const numberInterval = setInterval(() => {
      const randomTotal = Array.from({ length: state.count }, () =>
        Math.floor(Math.random() * 6) + 1
      ).reduce((a, b) => a + b, 0);
      elements.resultNumber.textContent = state.count === 1 ?
        Math.floor(Math.random() * 6) + 1 : randomTotal;
    }, 50);

    function animateRoll() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      diceGroup.forEach((dice, index) => {
        const start = startRotations[index];
        const target = targetRotations[index];

        dice.rotation.x = start.x + (target.x - start.x) * easeOut;
        dice.rotation.y = start.y + (target.y - start.y) * easeOut;
        dice.rotation.z = start.z + (target.z - start.z) * easeOut;

        const scale = 1 + Math.sin(progress * Math.PI) * 0.12;
        dice.scale.set(scale, scale, scale);
      });

      if (progress < 1) {
        requestAnimationFrame(animateRoll);
      } else {
        clearInterval(numberInterval);

        diceGroup.forEach((dice, index) => {
          dice.scale.set(1, 1, 1);
          updateDiceMaterials(index, rolls[index]);
        });

        state.isRolling = false;
        state.hasResult = true;
        elements.rollBtn.disabled = false;
        displayResults(rolls);
      }
    }

    animateRoll();
  }

  function displayResults(rolls) {
    const total = rolls.reduce((a, b) => a + b, 0);

    elements.resultNumber.textContent = state.count === 1 ? rolls[0] : total;
    elements.resultNumber.classList.add('highlight');

    if (state.count === 1) {
      elements.resultDetails.textContent = 'D6';
    } else {
      elements.resultDetails.innerHTML = `
        <span class="roll-breakdown">${rolls.join(' + ')} = <strong>${total}</strong></span>
      `;
    }

    addToHistory(rolls, total);

    setTimeout(() => {
      elements.resultNumber.classList.remove('highlight');
    }, 300);
  }

  function addToHistory(rolls, total) {
    const entry = {
      dice: `${state.count}D6`,
      rolls: rolls,
      total: total,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(entry);
    if (state.history.length > 20) {
      state.history.pop();
    }

    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<div class="history-empty">Roll to start</div>';
      return;
    }

    elements.historyList.innerHTML = state.history.map(entry => `
      <div class="history-item">
        <span class="history-dice">${entry.dice}</span>
        <span class="history-result">${entry.total}</span>
      </div>
    `).join('');
  }

  function clearHistory() {
    state.history = [];
    renderHistory();
    showToast('History cleared', 'success');
  }

  function reset() {
    state.count = 1;
    state.history = [];
    state.hasResult = false;

    elements.diceCount.textContent = '1';
    elements.resultNumber.textContent = '?';
    elements.resultNumber.classList.remove('highlight');
    elements.resultDetails.textContent = '';

    createDiceGroup(1);
    renderHistory();
    showToast('Reset', 'success');
  }

  function setDiceCount(count) {
    state.count = Math.max(1, Math.min(5, count));
    elements.diceCount.textContent = state.count;
    state.hasResult = false;
    elements.resultNumber.textContent = '?';
    elements.resultDetails.textContent = '';
    createDiceGroup(state.count);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea')) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        rollDice();
        break;
      case 'c':
      case 'C':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          clearHistory();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setDiceCount(state.count + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setDiceCount(state.count - 1);
        break;
    }
  }

  function init() {
    initElements();
    initThreeJS();

    elements.decreaseCount.addEventListener('click', () => setDiceCount(state.count - 1));
    elements.increaseCount.addEventListener('click', () => setDiceCount(state.count + 1));
    elements.rollBtn.addEventListener('click', rollDice);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', reset);
    }

    document.addEventListener('keydown', handleKeydown);

    renderHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
