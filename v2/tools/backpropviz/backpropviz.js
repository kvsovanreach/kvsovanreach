/**
 * KVSOVANREACH Backpropagation Visualizer
 * Visualize gradient flow through neural networks
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    network: null,
    isAnimating: false,
    currentPass: 'idle'
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputSize: document.getElementById('inputSize'),
    hiddenLayers: document.getElementById('hiddenLayers'),
    hiddenSize: document.getElementById('hiddenSize'),
    outputSize: document.getElementById('outputSize'),
    learningRate: document.getElementById('learningRate'),
    activation: document.getElementById('activation'),
    runForwardBtn: document.getElementById('runForwardBtn'),
    runBackwardBtn: document.getElementById('runBackwardBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    networkCanvas: document.getElementById('networkCanvas'),
    passIndicator: document.getElementById('passIndicator'),
    gradientBars: document.getElementById('gradientBars')
  };

  // ==================== Network Class ====================

  class NeuralNetwork {
    constructor(config) {
      this.inputSize = config.inputSize;
      this.hiddenLayers = config.hiddenLayers;
      this.hiddenSize = config.hiddenSize;
      this.outputSize = config.outputSize;
      this.learningRate = config.learningRate;
      this.activation = config.activation;

      this.layers = [];
      this.weights = [];
      this.biases = [];
      this.activations = [];
      this.gradients = [];
      this.weightGradients = [];

      this.initialize();
    }

    initialize() {
      // Build layer sizes
      this.layers = [this.inputSize];
      for (let i = 0; i < this.hiddenLayers; i++) {
        this.layers.push(this.hiddenSize);
      }
      this.layers.push(this.outputSize);

      // Initialize weights and biases
      for (let i = 0; i < this.layers.length - 1; i++) {
        this.weights.push(this.randomMatrix(this.layers[i], this.layers[i + 1]));
        this.biases.push(this.randomArray(this.layers[i + 1]));
        this.weightGradients.push(null);
      }

      // Initialize activations
      this.activations = this.layers.map(size => new Array(size).fill(0));
      this.gradients = this.layers.map(size => new Array(size).fill(0));

      // Set random input
      this.activations[0] = this.randomArray(this.inputSize);
    }

    randomMatrix(rows, cols) {
      const matrix = [];
      for (let i = 0; i < rows; i++) {
        matrix.push(this.randomArray(cols));
      }
      return matrix;
    }

    randomArray(size) {
      return Array.from({ length: size }, () => (Math.random() - 0.5) * 2);
    }

    activate(x) {
      switch (this.activation) {
        case 'relu': return Math.max(0, x);
        case 'sigmoid': return 1 / (1 + Math.exp(-x));
        case 'tanh': return Math.tanh(x);
        default: return x;
      }
    }

    activateDerivative(x) {
      switch (this.activation) {
        case 'relu': return x > 0 ? 1 : 0;
        case 'sigmoid': const s = this.activate(x); return s * (1 - s);
        case 'tanh': return 1 - Math.pow(Math.tanh(x), 2);
        default: return 1;
      }
    }

    forward() {
      for (let l = 0; l < this.weights.length; l++) {
        const prevActivations = this.activations[l];
        const newActivations = new Array(this.layers[l + 1]).fill(0);

        for (let j = 0; j < this.layers[l + 1]; j++) {
          let sum = this.biases[l][j];
          for (let i = 0; i < this.layers[l]; i++) {
            sum += prevActivations[i] * this.weights[l][i][j];
          }
          newActivations[j] = this.activate(sum);
        }

        this.activations[l + 1] = newActivations;
      }
    }

    backward() {
      // Compute output gradients (simplified: assuming MSE loss with target = 0)
      const outputLayer = this.activations.length - 1;
      for (let i = 0; i < this.layers[outputLayer]; i++) {
        const output = this.activations[outputLayer][i];
        this.gradients[outputLayer][i] = output * this.activateDerivative(output);
      }

      // Backpropagate
      for (let l = this.weights.length - 1; l >= 0; l--) {
        const currentGradients = this.gradients[l + 1];
        const prevActivations = this.activations[l];

        // Compute weight gradients
        this.weightGradients[l] = [];
        for (let i = 0; i < this.layers[l]; i++) {
          this.weightGradients[l][i] = [];
          for (let j = 0; j < this.layers[l + 1]; j++) {
            this.weightGradients[l][i][j] = prevActivations[i] * currentGradients[j];
          }
        }

        // Compute gradients for previous layer
        if (l > 0) {
          for (let i = 0; i < this.layers[l]; i++) {
            let grad = 0;
            for (let j = 0; j < this.layers[l + 1]; j++) {
              grad += this.weights[l][i][j] * currentGradients[j];
            }
            this.gradients[l][i] = grad * this.activateDerivative(this.activations[l][i]);
          }
        }
      }

      // Update weights
      for (let l = 0; l < this.weights.length; l++) {
        for (let i = 0; i < this.layers[l]; i++) {
          for (let j = 0; j < this.layers[l + 1]; j++) {
            this.weights[l][i][j] -= this.learningRate * this.weightGradients[l][i][j];
          }
        }
      }
    }
  }

  // ==================== Visualization ====================

  function drawNetwork() {
    const canvas = elements.networkCanvas;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    // Set canvas size
    const width = Math.min(container.clientWidth - 32, 800);
    const height = 320;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    // Clear
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-secondary').trim() || '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    if (!state.network) return;

    const network = state.network;
    const layerCount = network.layers.length;
    const layerGap = width / (layerCount + 1);
    const nodeRadius = 18;

    // Calculate node positions
    const nodePositions = [];
    for (let l = 0; l < layerCount; l++) {
      const layerSize = network.layers[l];
      const layerX = (l + 1) * layerGap;
      const layerHeight = (layerSize - 1) * 50;
      const startY = (height - layerHeight) / 2;

      nodePositions[l] = [];
      for (let n = 0; n < layerSize; n++) {
        nodePositions[l][n] = {
          x: layerX,
          y: startY + n * 50
        };
      }
    }

    // Draw connections
    for (let l = 0; l < network.weights.length; l++) {
      for (let i = 0; i < network.layers[l]; i++) {
        for (let j = 0; j < network.layers[l + 1]; j++) {
          const from = nodePositions[l][i];
          const to = nodePositions[l + 1][j];
          const weight = network.weights[l][i][j];

          // Weight color
          ctx.strokeStyle = weight >= 0 ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = Math.min(Math.abs(weight) * 2, 3);
          ctx.globalAlpha = 0.3 + Math.min(Math.abs(weight) * 0.3, 0.5);

          ctx.beginPath();
          ctx.moveTo(from.x + nodeRadius, from.y);
          ctx.lineTo(to.x - nodeRadius, to.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;

    // Draw gradient flow (if backward pass)
    if (state.currentPass === 'backward') {
      ctx.setLineDash([5, 5]);
      for (let l = network.weights.length - 1; l >= 0; l--) {
        for (let i = 0; i < network.layers[l]; i++) {
          for (let j = 0; j < network.layers[l + 1]; j++) {
            if (network.weightGradients[l] && network.weightGradients[l][i]) {
              const from = nodePositions[l + 1][j];
              const to = nodePositions[l][i];
              const grad = Math.abs(network.weightGradients[l][i][j]);

              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = Math.min(grad * 5, 3);
              ctx.globalAlpha = Math.min(grad * 2, 0.8);

              ctx.beginPath();
              ctx.moveTo(from.x - nodeRadius, from.y);
              ctx.lineTo(to.x + nodeRadius, to.y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    for (let l = 0; l < layerCount; l++) {
      for (let n = 0; n < network.layers[l]; n++) {
        const pos = nodePositions[l][n];
        const activation = network.activations[l][n];

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);

        // Fill based on activation
        const intensity = Math.min(Math.abs(activation), 1);
        if (state.currentPass === 'forward' || state.currentPass === 'idle') {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + intensity * 0.6})`;
        } else {
          const grad = Math.abs(network.gradients[l][n]);
          ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + Math.min(grad, 1) * 0.6})`;
        }
        ctx.fill();

        ctx.strokeStyle = state.currentPass === 'backward' ? '#ef4444' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Activation value
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-text').trim() || '#1e293b';
        ctx.font = '10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activation.toFixed(2), pos.x, pos.y);
      }
    }

    // Draw layer labels
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text-muted').trim() || '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    const labels = ['Input', ...Array(network.hiddenLayers).fill(0).map((_, i) => `Hidden ${i + 1}`), 'Output'];
    for (let l = 0; l < layerCount; l++) {
      const x = (l + 1) * layerGap;
      ctx.fillText(labels[l], x, height - 15);
    }
  }

  function updateGradientBars() {
    if (!state.network || !state.network.weightGradients[0]) {
      elements.gradientBars.innerHTML = '<p style="color: var(--color-text-muted); font-size: var(--font-size-sm); text-align: center;">Run backward pass to see gradients</p>';
      return;
    }

    const network = state.network;
    let html = '';

    for (let l = 0; l < network.weights.length; l++) {
      let maxGrad = 0;
      let avgGrad = 0;
      let count = 0;

      for (let i = 0; i < network.layers[l]; i++) {
        for (let j = 0; j < network.layers[l + 1]; j++) {
          if (network.weightGradients[l] && network.weightGradients[l][i]) {
            const grad = Math.abs(network.weightGradients[l][i][j]);
            maxGrad = Math.max(maxGrad, grad);
            avgGrad += grad;
            count++;
          }
        }
      }

      avgGrad = count > 0 ? avgGrad / count : 0;
      const percentage = Math.min(avgGrad * 100, 100);

      html += `
        <div class="gradient-bar-item">
          <span class="gradient-bar-label">Layer ${l + 1}</span>
          <div class="gradient-bar-container">
            <div class="gradient-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="gradient-bar-value">${avgGrad.toFixed(4)}</span>
        </div>
      `;
    }

    elements.gradientBars.innerHTML = html;
  }

  function updatePassIndicator(pass) {
    state.currentPass = pass;
    const indicator = elements.passIndicator;

    indicator.className = 'pass-indicator';
    if (pass === 'forward') {
      indicator.classList.add('forward');
      indicator.innerHTML = '<span class="pass-label"><i class="fa-solid fa-arrow-right"></i> Forward Pass</span>';
    } else if (pass === 'backward') {
      indicator.classList.add('backward');
      indicator.innerHTML = '<span class="pass-label"><i class="fa-solid fa-arrow-left"></i> Backward Pass</span>';
    } else {
      indicator.innerHTML = '<span class="pass-label">Idle</span>';
    }
  }

  // ==================== Actions ====================

  function createNetwork() {
    const config = {
      inputSize: parseInt(elements.inputSize.value) || 3,
      hiddenLayers: parseInt(elements.hiddenLayers.value) || 2,
      hiddenSize: parseInt(elements.hiddenSize.value) || 4,
      outputSize: parseInt(elements.outputSize.value) || 2,
      learningRate: parseFloat(elements.learningRate.value) || 0.01,
      activation: elements.activation.value
    };

    state.network = new NeuralNetwork(config);
    updatePassIndicator('idle');
    drawNetwork();
    updateGradientBars();
  }

  async function runForwardPass() {
    if (!state.network || state.isAnimating) return;

    state.isAnimating = true;
    updatePassIndicator('forward');

    // Animate forward pass
    await sleep(300);
    state.network.forward();
    drawNetwork();

    state.isAnimating = false;
    ToolsCommon.Toast.show('Forward pass complete', 'success');
  }

  async function runBackwardPass() {
    if (!state.network || state.isAnimating) return;

    state.isAnimating = true;
    updatePassIndicator('backward');

    // First ensure forward pass
    state.network.forward();

    await sleep(300);
    state.network.backward();
    drawNetwork();
    updateGradientBars();

    state.isAnimating = false;
    ToolsCommon.Toast.show('Backward pass complete', 'success');
  }

  function resetNetwork() {
    createNetwork();
    ToolsCommon.Toast.show('Network reset');
  }

  async function exportDiagram() {
    const canvas = elements.networkCanvas;
    canvas.toBlob(blob => {
      if (blob) {
        ToolsCommon.FileDownload.blob(blob, 'backpropagation.png');
        ToolsCommon.Toast.show('Diagram exported!', 'success');
      }
    }, 'image/png');
  }

  // ==================== Utilities ====================

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key.toLowerCase() === 'f') runForwardPass();
    if (e.key.toLowerCase() === 'b') runBackwardPass();
    if (e.key.toLowerCase() === 'r') resetNetwork();
  }

  // ==================== Initialization ====================

  function init() {
    createNetwork();
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.runForwardBtn.addEventListener('click', runForwardPass);
    elements.runBackwardBtn.addEventListener('click', runBackwardPass);
    elements.resetBtn.addEventListener('click', resetNetwork);
    elements.exportBtn.addEventListener('click', exportDiagram);

    // Config changes
    [elements.inputSize, elements.hiddenLayers, elements.hiddenSize,
     elements.outputSize, elements.learningRate, elements.activation].forEach(el => {
      el.addEventListener('change', createNetwork);
    });

    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', ToolsCommon.debounce(drawNetwork, 200));
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
