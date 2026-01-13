/**
 * KVSOVANREACH Critter Evolution
 * Genetic algorithm evolution simulation
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  const INITIAL_POPULATION = 20;
  const GENERATION_TIME = 15000; // ms

  // ==================== State ====================
  const state = {
    canvas: null,
    ctx: null,
    critters: [],
    food: [],
    generation: 1,
    isPaused: false,
    animationId: null,
    lastTime: 0,
    generationTimer: 0,

    // Settings
    foodAmount: 15,
    mutationRate: 0.1,
    simSpeed: 2,

    // Stats
    bestFitness: 0,
    avgFitness: 0,
    bestCritter: null
  };

  // ==================== DOM Elements ====================
  const elements = {
    canvas: document.getElementById('simulationCanvas'),
    generationDisplay: document.getElementById('generationDisplay'),
    populationDisplay: document.getElementById('populationDisplay'),
    fitnessDisplay: document.getElementById('fitnessDisplay'),
    avgFitnessDisplay: document.getElementById('avgFitnessDisplay'),
    foodCount: document.getElementById('foodCount'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    foodAmount: document.getElementById('foodAmount'),
    foodAmountValue: document.getElementById('foodAmountValue'),
    mutationRate: document.getElementById('mutationRate'),
    mutationRateValue: document.getElementById('mutationRateValue'),
    simSpeed: document.getElementById('simSpeed'),
    simSpeedValue: document.getElementById('simSpeedValue'),
    bestCritterPreview: document.getElementById('bestCritterPreview'),
    geneSpeed: document.getElementById('geneSpeed'),
    geneSize: document.getElementById('geneSize'),
    geneSense: document.getElementById('geneSense'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent')
  };

  // ==================== Critter Class ====================

  class Critter {
    constructor(genes = null) {
      if (genes) {
        this.genes = { ...genes };
      } else {
        this.genes = {
          speed: 0.3 + Math.random() * 0.7,    // 0.3 - 1.0
          size: 0.3 + Math.random() * 0.7,      // 0.3 - 1.0
          sense: 0.3 + Math.random() * 0.7      // 0.3 - 1.0
        };
      }

      this.x = Math.random() * state.canvas.width;
      this.y = Math.random() * state.canvas.height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.energy = 100;
      this.foodEaten = 0;
      this.age = 0;

      // Derived stats
      this.maxSpeed = 1 + this.genes.speed * 3;
      this.radius = 5 + this.genes.size * 10;
      this.senseRange = 30 + this.genes.sense * 70;
      this.energyCost = 0.02 + this.genes.speed * 0.05 + this.genes.size * 0.03;

      // Color based on genes
      const r = Math.floor(this.genes.speed * 255);
      const g = Math.floor(this.genes.sense * 255);
      const b = Math.floor(this.genes.size * 255);
      this.color = `rgb(${r}, ${g}, ${b})`;
    }

    update(deltaTime) {
      // Find nearest food
      let nearestFood = null;
      let nearestDist = Infinity;

      for (const food of state.food) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < nearestDist && dist < this.senseRange) {
          nearestDist = dist;
          nearestFood = food;
        }
      }

      // Move towards food or wander
      if (nearestFood) {
        const dx = nearestFood.x - this.x;
        const dy = nearestFood.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.vx += (dx / dist) * 0.2;
        this.vy += (dy / dist) * 0.2;
      } else {
        // Random wandering
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
      }

      // Limit speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > this.maxSpeed) {
        this.vx = (this.vx / speed) * this.maxSpeed;
        this.vy = (this.vy / speed) * this.maxSpeed;
      }

      // Update position
      this.x += this.vx * deltaTime * state.simSpeed;
      this.y += this.vy * deltaTime * state.simSpeed;

      // Wrap around edges
      if (this.x < 0) this.x = state.canvas.width;
      if (this.x > state.canvas.width) this.x = 0;
      if (this.y < 0) this.y = state.canvas.height;
      if (this.y > state.canvas.height) this.y = 0;

      // Energy consumption
      this.energy -= this.energyCost * deltaTime * state.simSpeed;
      this.age += deltaTime * state.simSpeed;

      // Check food collision
      for (let i = state.food.length - 1; i >= 0; i--) {
        const food = state.food[i];
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.radius + food.radius) {
          this.energy = Math.min(this.energy + 30, 150);
          this.foodEaten++;
          state.food.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      // Draw sense range (faded)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.senseRange, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 100, 0.05)`;
      ctx.fill();

      // Draw body
      const gradient = ctx.createRadialGradient(
        this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, this.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Energy bar
      const barWidth = this.radius * 2;
      const barHeight = 3;
      const energyRatio = Math.max(0, this.energy / 100);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 8, barWidth, barHeight);

      ctx.fillStyle = energyRatio > 0.3 ? '#22c55e' : '#ef4444';
      ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 8, barWidth * energyRatio, barHeight);
    }

    getFitness() {
      return this.foodEaten * 10 + this.age * 0.01;
    }

    mutate() {
      const rate = state.mutationRate;
      if (Math.random() < rate) {
        this.genes.speed = Math.max(0.1, Math.min(1, this.genes.speed + (Math.random() - 0.5) * 0.3));
      }
      if (Math.random() < rate) {
        this.genes.size = Math.max(0.1, Math.min(1, this.genes.size + (Math.random() - 0.5) * 0.3));
      }
      if (Math.random() < rate) {
        this.genes.sense = Math.max(0.1, Math.min(1, this.genes.sense + (Math.random() - 0.5) * 0.3));
      }
    }
  }

  // ==================== Food ====================

  function spawnFood() {
    while (state.food.length < state.foodAmount) {
      state.food.push({
        x: 20 + Math.random() * (state.canvas.width - 40),
        y: 20 + Math.random() * (state.canvas.height - 40),
        radius: 4
      });
    }
  }

  function drawFood(ctx) {
    for (const food of state.food) {
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(food.x - 1, food.y - 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
    }
  }

  // ==================== Evolution ====================

  function nextGeneration() {
    // Sort by fitness
    state.critters.sort((a, b) => b.getFitness() - a.getFitness());

    // Update stats
    state.bestFitness = Math.round(state.critters[0].getFitness());
    state.avgFitness = Math.round(
      state.critters.reduce((sum, c) => sum + c.getFitness(), 0) / state.critters.length
    );
    state.bestCritter = state.critters[0];

    // Select top 50% as parents
    const parents = state.critters.slice(0, Math.ceil(state.critters.length / 2));

    // Create new generation
    const newCritters = [];

    // Keep top performer
    newCritters.push(new Critter(parents[0].genes));

    // Breed rest
    while (newCritters.length < INITIAL_POPULATION) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];

      // Crossover
      const childGenes = {
        speed: Math.random() < 0.5 ? parent1.genes.speed : parent2.genes.speed,
        size: Math.random() < 0.5 ? parent1.genes.size : parent2.genes.size,
        sense: Math.random() < 0.5 ? parent1.genes.sense : parent2.genes.sense
      };

      const child = new Critter(childGenes);
      child.mutate();
      newCritters.push(child);
    }

    state.critters = newCritters;
    state.generation++;
    state.generationTimer = 0;
    state.food = [];
    spawnFood();

    updateUI();
    ToolsCommon.Toast.show(`Generation ${state.generation} started!`, 'info');
  }

  // ==================== Rendering ====================

  function render() {
    const ctx = state.ctx;
    const width = state.canvas.width;
    const height = state.canvas.height;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw food
    drawFood(ctx);

    // Draw critters
    for (const critter of state.critters) {
      critter.draw(ctx);
    }
  }

  function updateUI() {
    elements.generationDisplay.textContent = state.generation;
    elements.populationDisplay.textContent = state.critters.length;
    elements.fitnessDisplay.textContent = state.bestFitness;
    elements.avgFitnessDisplay.textContent = state.avgFitness;
    elements.foodCount.textContent = state.food.length;

    // Update generation progress
    const progress = Math.min(100, (state.generationTimer / GENERATION_TIME) * 100);
    if (elements.progressFill) {
      elements.progressFill.style.width = `${progress}%`;
    }
    if (elements.progressPercent) {
      elements.progressPercent.textContent = `${Math.round(progress)}%`;
    }

    // Update best critter display
    if (state.bestCritter) {
      const c = state.bestCritter;
      elements.bestCritterPreview.style.background = `linear-gradient(135deg, ${c.color}, rgba(0,0,0,0.5))`;
      elements.bestCritterPreview.style.width = `${20 + c.genes.size * 40}px`;
      elements.bestCritterPreview.style.height = `${20 + c.genes.size * 40}px`;
      elements.geneSpeed.style.width = `${c.genes.speed * 100}%`;
      elements.geneSize.style.width = `${c.genes.size * 100}%`;
      elements.geneSense.style.width = `${c.genes.sense * 100}%`;
    }
  }

  // ==================== Game Loop ====================

  function gameLoop(currentTime = 0) {
    if (state.isPaused) {
      state.animationId = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = Math.min((currentTime - state.lastTime) / 1000, 0.1);
    state.lastTime = currentTime;

    // Update generation timer
    state.generationTimer += deltaTime * 1000 * state.simSpeed;
    if (state.generationTimer >= GENERATION_TIME) {
      nextGeneration();
    }

    // Update critters
    for (let i = state.critters.length - 1; i >= 0; i--) {
      const critter = state.critters[i];
      critter.update(deltaTime);

      // Remove dead critters
      if (critter.energy <= 0) {
        state.critters.splice(i, 1);
      }
    }

    // Spawn food
    spawnFood();

    // Check if all critters dead
    if (state.critters.length === 0) {
      reset();
      ToolsCommon.Toast.show('All critters died! Starting over...', 'warning');
    }

    // Render
    render();
    updateUI();

    state.animationId = requestAnimationFrame(gameLoop);
  }

  // ==================== Game Actions ====================

  function togglePause() {
    state.isPaused = !state.isPaused;
    elements.pauseBtn.innerHTML = state.isPaused ?
      '<i class="fa-solid fa-play"></i><span>Play</span>' :
      '<i class="fa-solid fa-pause"></i><span>Pause</span>';
    ToolsCommon.Toast.show(state.isPaused ? 'Paused' : 'Resumed', 'info');
  }

  function reset() {
    state.generation = 1;
    state.bestFitness = 0;
    state.avgFitness = 0;
    state.bestCritter = null;
    state.generationTimer = 0;
    state.critters = [];
    state.food = [];

    // Create initial population
    for (let i = 0; i < INITIAL_POPULATION; i++) {
      state.critters.push(new Critter());
    }

    spawnFood();
    updateUI();
    ToolsCommon.Toast.show('Simulation reset!', 'success');
  }

  // ==================== Event Handlers ====================

  function handleSliderChange(e) {
    const { id, value } = e.target;

    switch (id) {
      case 'foodAmount':
        state.foodAmount = parseInt(value);
        elements.foodAmountValue.textContent = value;
        break;
      case 'mutationRate':
        state.mutationRate = parseInt(value) / 100;
        elements.mutationRateValue.textContent = `${value}%`;
        break;
      case 'simSpeed':
        state.simSpeed = parseInt(value);
        elements.simSpeedValue.textContent = `${value}x`;
        break;
    }
  }

  function handleResize() {
    const container = elements.canvas.parentElement;
    state.canvas.width = container.clientWidth;
    state.canvas.height = container.clientHeight || 400;
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        togglePause();
        break;
      case 'r':
        e.preventDefault();
        reset();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    state.canvas = elements.canvas;
    state.ctx = state.canvas.getContext('2d');

    handleResize();

    // Create initial population
    for (let i = 0; i < INITIAL_POPULATION; i++) {
      state.critters.push(new Critter());
    }
    spawnFood();

    // Event listeners
    elements.pauseBtn?.addEventListener('click', togglePause);
    elements.resetBtn?.addEventListener('click', reset);
    elements.foodAmount?.addEventListener('input', handleSliderChange);
    elements.mutationRate?.addEventListener('input', handleSliderChange);
    elements.simSpeed?.addEventListener('input', handleSliderChange);

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeydown);

    // Start loop
    state.lastTime = performance.now();
    gameLoop();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
