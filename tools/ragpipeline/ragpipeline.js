/**
 * KVSOVANREACH RAG Pipeline Builder
 * Visualize retrieval-augmented generation pipelines
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    isRunning: false,
    currentStage: null,
    completedStages: new Set(),
    metrics: {
      totalLatency: 0,
      estCost: 0,
      tokensUsed: 0,
      relevanceScore: 0
    }
  };

  // ==================== DOM Elements ====================
  const elements = {
    // Inputs
    queryText: document.getElementById('queryText'),
    embeddingModel: document.getElementById('embeddingModel'),
    retrievalMethod: document.getElementById('retrievalMethod'),
    vectorDb: document.getElementById('vectorDb'),
    topK: document.getElementById('topK'),
    llmModel: document.getElementById('llmModel'),
    responsePreview: document.getElementById('responsePreview'),
    // Flow
    pipelineFlow: document.getElementById('pipelineFlow'),
    // Buttons
    runPipelineBtn: document.getElementById('runPipelineBtn'),
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn'),
    // Metrics
    totalLatency: document.getElementById('totalLatency'),
    estCost: document.getElementById('estCost'),
    tokensUsed: document.getElementById('tokensUsed'),
    relevanceScore: document.getElementById('relevanceScore')
  };

  // ==================== Constants ====================
  const CONFIG = {
    STAGES: [
      { id: 'query', label: 'Query', icon: 'fa-keyboard' },
      { id: 'embedding', label: 'Embedding', icon: 'fa-vector-square' },
      { id: 'retrieval', label: 'Retrieval', icon: 'fa-magnifying-glass' },
      { id: 'vectordb', label: 'Vector DB', icon: 'fa-database' },
      { id: 'context', label: 'Context', icon: 'fa-file-lines' },
      { id: 'llm', label: 'LLM', icon: 'fa-brain' },
      { id: 'response', label: 'Response', icon: 'fa-comment-dots' }
    ],
    LATENCIES: {
      query: { min: 5, max: 20 },
      embedding: { min: 50, max: 200 },
      retrieval: { min: 30, max: 150 },
      vectordb: { min: 20, max: 100 },
      context: { min: 10, max: 50 },
      llm: { min: 500, max: 2000 },
      response: { min: 5, max: 20 }
    },
    COSTS: {
      'openai': 0.0001,
      'cohere': 0.00008,
      'sentence': 0,
      'custom': 0,
      'gpt4': 0.03,
      'gpt35': 0.002,
      'claude': 0.015,
      'llama': 0,
      'mistral': 0.002
    },
    RESPONSES: [
      "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.",
      "Based on the retrieved context, machine learning involves algorithms that can learn patterns from data and make predictions or decisions.",
      "Machine learning is the study of computer algorithms that can improve automatically through experience and by the use of data.",
      "According to the knowledge base, ML is a type of AI that allows software applications to become more accurate at predicting outcomes."
    ],
    STORAGE_KEY: 'kvsovanreach_ragpipeline_data'
  };

  // ==================== Core Functions ====================

  /**
   * Initialize the pipeline flow diagram
   */
  function initializePipelineFlow() {
    elements.pipelineFlow.innerHTML = '';

    CONFIG.STAGES.forEach((stage, index) => {
      // Add node
      const node = document.createElement('div');
      node.className = 'flow-node';
      node.id = `flow-${stage.id}`;
      node.innerHTML = `
        <div class="flow-node-icon ${stage.id}">
          <i class="fa-solid ${stage.icon}"></i>
        </div>
        <span class="flow-node-label">${stage.label}</span>
        <span class="flow-node-time" id="time-${stage.id}">--</span>
      `;
      elements.pipelineFlow.appendChild(node);

      // Add arrow (except after last)
      if (index < CONFIG.STAGES.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'flow-arrow';
        arrow.id = `arrow-${index}`;
        arrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
        elements.pipelineFlow.appendChild(arrow);
      }
    });
  }

  /**
   * Run the pipeline simulation
   */
  async function runPipeline() {
    if (state.isRunning) return;

    const query = elements.queryText.value.trim();
    if (!query) {
      ToolsCommon.Toast.show('Please enter a query', 'error');
      return;
    }

    state.isRunning = true;
    state.completedStages.clear();
    state.metrics = { totalLatency: 0, estCost: 0, tokensUsed: 0, relevanceScore: 0 };

    // Reset UI
    resetPipelineUI();
    elements.runPipelineBtn.disabled = true;
    elements.runPipelineBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Running...</span>';

    // Process each stage
    for (const stage of CONFIG.STAGES) {
      await processStage(stage);
    }

    // Update final metrics
    updateMetrics();

    // Generate response
    const response = CONFIG.RESPONSES[Math.floor(Math.random() * CONFIG.RESPONSES.length)];
    elements.responsePreview.textContent = response;
    elements.responsePreview.style.fontStyle = 'normal';
    elements.responsePreview.style.color = 'var(--color-text)';

    state.isRunning = false;
    elements.runPipelineBtn.disabled = false;
    elements.runPipelineBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Run Simulation</span>';

    ToolsCommon.Toast.show('Pipeline completed!', 'success');
    saveToStorage();
  }

  /**
   * Process a single stage
   */
  async function processStage(stage) {
    state.currentStage = stage.id;

    // Activate stage card
    const stageCard = document.querySelector(`[data-stage="${stage.id}"]`);
    if (stageCard) {
      stageCard.classList.add('active', 'processing');
    }

    // Activate flow node
    const flowNode = document.getElementById(`flow-${stage.id}`);
    if (flowNode) {
      flowNode.classList.add('processing');
    }

    // Calculate latency
    const latencyRange = CONFIG.LATENCIES[stage.id];
    const latency = randomBetween(latencyRange.min, latencyRange.max);

    // Simulate processing
    await sleep(Math.min(latency, 500));

    // Update time display
    const timeEl = document.getElementById(`time-${stage.id}`);
    if (timeEl) {
      timeEl.textContent = `${latency}ms`;
    }

    // Mark as completed
    state.completedStages.add(stage.id);
    state.metrics.totalLatency += latency;

    // Calculate cost for this stage
    if (stage.id === 'embedding') {
      const model = elements.embeddingModel.value;
      state.metrics.estCost += CONFIG.COSTS[model] * 1000; // per 1000 tokens
      state.metrics.tokensUsed += randomBetween(100, 500);
    }

    if (stage.id === 'llm') {
      const model = elements.llmModel.value;
      const tokens = randomBetween(500, 2000);
      state.metrics.estCost += CONFIG.COSTS[model] * (tokens / 1000);
      state.metrics.tokensUsed += tokens;
    }

    // Update relevance score during retrieval
    if (stage.id === 'retrieval') {
      state.metrics.relevanceScore = randomBetween(75, 98) / 100;
    }

    // Update UI
    if (stageCard) {
      stageCard.classList.remove('processing');
    }
    if (flowNode) {
      flowNode.classList.remove('processing');
      flowNode.classList.add('completed');
    }

    // Activate arrow
    const stageIndex = CONFIG.STAGES.findIndex(s => s.id === stage.id);
    if (stageIndex < CONFIG.STAGES.length - 1) {
      const arrow = document.getElementById(`arrow-${stageIndex}`);
      if (arrow) {
        arrow.classList.add('active');
      }
    }
  }

  /**
   * Update metrics display
   */
  function updateMetrics() {
    elements.totalLatency.textContent = `${state.metrics.totalLatency}ms`;
    elements.estCost.textContent = `$${state.metrics.estCost.toFixed(4)}`;
    elements.tokensUsed.textContent = state.metrics.tokensUsed.toLocaleString();
    elements.relevanceScore.textContent = `${(state.metrics.relevanceScore * 100).toFixed(1)}%`;
  }

  /**
   * Reset pipeline UI
   */
  function resetPipelineUI() {
    // Reset stage cards
    document.querySelectorAll('.stage-card').forEach(card => {
      card.classList.remove('active', 'processing');
    });

    // Reset flow nodes
    document.querySelectorAll('.flow-node').forEach(node => {
      node.classList.remove('processing', 'completed');
    });

    // Reset arrows
    document.querySelectorAll('.flow-arrow').forEach(arrow => {
      arrow.classList.remove('active');
    });

    // Reset times
    CONFIG.STAGES.forEach(stage => {
      const timeEl = document.getElementById(`time-${stage.id}`);
      if (timeEl) timeEl.textContent = '--';
    });

    // Reset metrics
    elements.totalLatency.textContent = '--';
    elements.estCost.textContent = '--';
    elements.tokensUsed.textContent = '--';
    elements.relevanceScore.textContent = '--';

    // Reset response
    elements.responsePreview.textContent = 'Response will appear here...';
    elements.responsePreview.style.fontStyle = 'italic';
    elements.responsePreview.style.color = 'var(--color-text-muted)';
  }

  /**
   * Clear pipeline
   */
  function clearPipeline() {
    if (state.isRunning) {
      ToolsCommon.Toast.show('Pipeline is running', 'error');
      return;
    }

    elements.queryText.value = 'What is machine learning?';
    resetPipelineUI();
    state.completedStages.clear();
    localStorage.removeItem(CONFIG.STORAGE_KEY);

    ToolsCommon.Toast.show('Pipeline reset');
  }

  // ==================== Export ====================

  async function exportDiagram() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2;

      canvas.width = 1000 * scale;
      canvas.height = 400 * scale;

      // Background
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface').trim() || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#10b981';
      ctx.font = `bold ${20 * scale}px Inter, sans-serif`;
      ctx.fillText('RAG Pipeline', 30 * scale, 40 * scale);

      // Draw pipeline flow
      const nodeWidth = 100 * scale;
      const nodeHeight = 80 * scale;
      const startX = 50 * scale;
      const startY = 100 * scale;
      const gap = 40 * scale;

      const colors = {
        query: '#3b82f6',
        embedding: '#8b5cf6',
        retrieval: '#f59e0b',
        vectordb: '#ec4899',
        context: '#06b6d4',
        llm: '#10b981',
        response: '#6366f1'
      };

      CONFIG.STAGES.forEach((stage, index) => {
        const x = startX + index * (nodeWidth + gap);
        const y = startY;

        // Node background
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface').trim() || '#ffffff';
        ctx.strokeStyle = state.completedStages.has(stage.id) ? '#10b981' : '#e2e8f0';
        ctx.lineWidth = 2 * scale;

        roundRect(ctx, x, y, nodeWidth, nodeHeight, 8 * scale);
        ctx.fill();
        ctx.stroke();

        // Icon circle
        ctx.fillStyle = colors[stage.id];
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(x + nodeWidth / 2, y + 25 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-text').trim() || '#1e293b';
        ctx.font = `500 ${10 * scale}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(stage.label, x + nodeWidth / 2, y + 55 * scale);

        // Time
        const timeEl = document.getElementById(`time-${stage.id}`);
        const timeText = timeEl ? timeEl.textContent : '--';
        ctx.fillStyle = '#64748b';
        ctx.font = `${8 * scale}px "Fira Code", monospace`;
        ctx.fillText(timeText, x + nodeWidth / 2, y + 70 * scale);

        // Arrow
        if (index < CONFIG.STAGES.length - 1) {
          ctx.fillStyle = state.completedStages.has(stage.id) ? '#10b981' : '#e2e8f0';
          const arrowX = x + nodeWidth + gap / 2;
          const arrowY = y + nodeHeight / 2;
          ctx.beginPath();
          ctx.moveTo(arrowX - 8 * scale, arrowY - 6 * scale);
          ctx.lineTo(arrowX + 8 * scale, arrowY);
          ctx.lineTo(arrowX - 8 * scale, arrowY + 6 * scale);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Metrics
      ctx.textAlign = 'left';
      const metricsY = 220 * scale;
      ctx.fillStyle = '#1e293b';
      ctx.font = `600 ${12 * scale}px Inter, sans-serif`;
      ctx.fillText('Metrics:', 50 * scale, metricsY);

      ctx.font = `${11 * scale}px Inter, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Total Latency: ${elements.totalLatency.textContent}`, 50 * scale, metricsY + 25 * scale);
      ctx.fillText(`Est. Cost: ${elements.estCost.textContent}`, 250 * scale, metricsY + 25 * scale);
      ctx.fillText(`Tokens: ${elements.tokensUsed.textContent}`, 450 * scale, metricsY + 25 * scale);
      ctx.fillText(`Relevance: ${elements.relevanceScore.textContent}`, 650 * scale, metricsY + 25 * scale);

      // Configuration
      ctx.fillStyle = '#1e293b';
      ctx.font = `600 ${12 * scale}px Inter, sans-serif`;
      ctx.fillText('Configuration:', 50 * scale, metricsY + 60 * scale);

      ctx.font = `${11 * scale}px Inter, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Embedding: ${elements.embeddingModel.selectedOptions[0].text}`, 50 * scale, metricsY + 85 * scale);
      ctx.fillText(`Retrieval: ${elements.retrievalMethod.selectedOptions[0].text}`, 250 * scale, metricsY + 85 * scale);
      ctx.fillText(`Vector DB: ${elements.vectorDb.selectedOptions[0].text}`, 450 * scale, metricsY + 85 * scale);
      ctx.fillText(`LLM: ${elements.llmModel.selectedOptions[0].text}`, 650 * scale, metricsY + 85 * scale);

      canvas.toBlob(blob => {
        if (blob) {
          ToolsCommon.FileDownload.blob(blob, 'rag-pipeline.png');
          ToolsCommon.Toast.show('Diagram exported!', 'success');
        }
      }, 'image/png');

    } catch (err) {
      console.error('Export failed:', err);
      ToolsCommon.Toast.show('Export failed', 'error');
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ==================== Storage ====================

  function saveToStorage() {
    try {
      const data = {
        query: elements.queryText.value,
        embedding: elements.embeddingModel.value,
        retrieval: elements.retrievalMethod.value,
        vectorDb: elements.vectorDb.value,
        topK: elements.topK.value,
        llm: elements.llmModel.value
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.query) elements.queryText.value = data.query;
        if (data.embedding) elements.embeddingModel.value = data.embedding;
        if (data.retrieval) elements.retrievalMethod.value = data.retrieval;
        if (data.vectorDb) elements.vectorDb.value = data.vectorDb;
        if (data.topK) elements.topK.value = data.topK;
        if (data.llm) elements.llmModel.value = data.llm;
      }
    } catch (e) {
      console.warn('Failed to load:', e);
    }
  }

  // ==================== Utilities ====================

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      runPipeline();
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      exportDiagram();
    }

    if (e.key.toLowerCase() === 'r') {
      clearPipeline();
    }
  }

  // ==================== Initialization ====================

  function init() {
    initializePipelineFlow();
    loadFromStorage();
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.runPipelineBtn.addEventListener('click', runPipeline);
    elements.exportBtn.addEventListener('click', exportDiagram);
    elements.clearBtn.addEventListener('click', clearPipeline);

    // Save on change
    [elements.queryText, elements.embeddingModel, elements.retrievalMethod,
     elements.vectorDb, elements.topK, elements.llmModel].forEach(el => {
      el.addEventListener('change', saveToStorage);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
