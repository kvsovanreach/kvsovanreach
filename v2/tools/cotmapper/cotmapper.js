/**
 * KVSOVANREACH Chain-of-Thought Mapper
 * Map reasoning steps as visual flow diagrams
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    problem: '',
    steps: [],
    selectedStepId: null,
    zoom: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    dragStepId: null,
    stepIdCounter: 0
  };

  // ==================== DOM Elements ====================
  const elements = {
    // Problem
    problemInput: document.getElementById('problemInput'),
    // Add step
    stepType: document.getElementById('stepType'),
    stepContent: document.getElementById('stepContent'),
    parentStep: document.getElementById('parentStep'),
    addStepBtn: document.getElementById('addStepBtn'),
    // Diagram
    diagramContainer: document.getElementById('diagramContainer'),
    diagramContent: document.getElementById('diagramContent'),
    connectionsSvg: document.getElementById('connectionsSvg'),
    stepsContainer: document.getElementById('stepsContainer'),
    diagramPlaceholder: document.getElementById('diagramPlaceholder'),
    // Controls
    autoLayoutBtn: document.getElementById('autoLayoutBtn'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    // Summary
    summaryContent: document.getElementById('summaryContent'),
    copySummaryBtn: document.getElementById('copySummaryBtn'),
    // Actions
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // ==================== Constants ====================
  const CONFIG = {
    STEP_ICONS: {
      thought: 'fa-lightbulb',
      observation: 'fa-eye',
      analysis: 'fa-chart-line',
      hypothesis: 'fa-flask',
      evidence: 'fa-file-lines',
      conclusion: 'fa-flag-checkered',
      question: 'fa-circle-question',
      action: 'fa-bolt'
    },
    STEP_LABELS: {
      thought: 'Thought',
      observation: 'Observation',
      analysis: 'Analysis',
      hypothesis: 'Hypothesis',
      evidence: 'Evidence',
      conclusion: 'Conclusion',
      question: 'Question',
      action: 'Action'
    },
    TEMPLATES: {
      'problem-solving': {
        problem: 'Define the problem to solve...',
        steps: [
          { type: 'observation', content: 'Identify the current situation' },
          { type: 'analysis', content: 'Break down the problem into components' },
          { type: 'hypothesis', content: 'Propose potential solutions' },
          { type: 'evidence', content: 'Evaluate each solution' },
          { type: 'conclusion', content: 'Select the best approach' }
        ]
      },
      'decision-making': {
        problem: 'Decision to make...',
        steps: [
          { type: 'thought', content: 'Identify the decision needed' },
          { type: 'observation', content: 'Gather relevant information' },
          { type: 'analysis', content: 'List pros and cons' },
          { type: 'hypothesis', content: 'Consider alternatives' },
          { type: 'conclusion', content: 'Make the final decision' }
        ]
      },
      'analysis': {
        problem: 'Topic to analyze...',
        steps: [
          { type: 'observation', content: 'Collect initial data' },
          { type: 'question', content: 'What patterns emerge?' },
          { type: 'analysis', content: 'Deep dive into findings' },
          { type: 'evidence', content: 'Support with evidence' },
          { type: 'conclusion', content: 'Summarize insights' }
        ]
      },
      'debugging': {
        problem: 'Bug or issue to debug...',
        steps: [
          { type: 'observation', content: 'Reproduce the issue' },
          { type: 'question', content: 'When does it occur?' },
          { type: 'hypothesis', content: 'Suspect root cause' },
          { type: 'action', content: 'Test the hypothesis' },
          { type: 'conclusion', content: 'Apply the fix' }
        ]
      }
    },
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2,
    ZOOM_STEP: 0.1,
    STORAGE_KEY: 'kvsovanreach_cotmapper_data'
  };

  // ==================== Core Functions ====================

  /**
   * Add a new reasoning step
   */
  function addStep() {
    const type = elements.stepType.value;
    const content = elements.stepContent.value.trim();
    const parentId = elements.parentStep.value || null;

    if (!content) {
      ToolsCommon.Toast.show('Please enter step content', 'error');
      return;
    }

    // Calculate position
    const containerRect = elements.diagramContainer.getBoundingClientRect();
    let x, y;

    if (parentId) {
      const parentStep = state.steps.find(s => s.id === parentId);
      if (parentStep) {
        const siblings = state.steps.filter(s => s.parentId === parentId);
        x = parentStep.x + 200;
        y = parentStep.y + (siblings.length * 100);
      } else {
        x = 50 + (state.steps.length % 4) * 200;
        y = 50 + Math.floor(state.steps.length / 4) * 120;
      }
    } else {
      const rootSteps = state.steps.filter(s => !s.parentId);
      x = 50;
      y = 50 + rootSteps.length * 100;
    }

    const step = {
      id: `step-${++state.stepIdCounter}`,
      type,
      content,
      parentId,
      x: Math.min(x, containerRect.width - 200),
      y: Math.min(y, containerRect.height - 100),
      order: state.steps.length + 1
    };

    state.steps.push(step);
    renderStep(step);
    updateParentSelect();
    renderConnections();
    updateSummary();
    updatePlaceholder();
    saveToStorage();

    // Clear input
    elements.stepContent.value = '';

    ToolsCommon.Toast.show(`Added ${CONFIG.STEP_LABELS[type]} step`, 'success');
  }

  /**
   * Render a step on the diagram
   */
  function renderStep(step) {
    const stepEl = document.createElement('div');
    stepEl.className = `cot-step ${step.type}`;
    stepEl.id = step.id;
    stepEl.style.left = `${step.x}px`;
    stepEl.style.top = `${step.y}px`;

    stepEl.innerHTML = `
      <div class="step-header">
        <span class="step-type ${step.type}">
          <i class="fa-solid ${CONFIG.STEP_ICONS[step.type]}"></i>
          ${CONFIG.STEP_LABELS[step.type]}
        </span>
        <span class="step-number">${step.order}</span>
      </div>
      <div class="step-content">${escapeHtml(step.content)}</div>
      <button class="step-delete" title="Delete step" aria-label="Delete step">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Event listeners
    stepEl.addEventListener('mousedown', (e) => startDrag(e, step.id));
    stepEl.addEventListener('touchstart', (e) => startDrag(e, step.id), { passive: false });
    stepEl.addEventListener('click', (e) => selectStep(e, step.id));

    const deleteBtn = stepEl.querySelector('.step-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteStep(step.id);
    });

    elements.stepsContainer.appendChild(stepEl);
  }

  /**
   * Delete a step
   */
  function deleteStep(stepId) {
    // Find all descendants
    const toDelete = new Set([stepId]);
    let changed = true;
    while (changed) {
      changed = false;
      state.steps.forEach(s => {
        if (s.parentId && toDelete.has(s.parentId) && !toDelete.has(s.id)) {
          toDelete.add(s.id);
          changed = true;
        }
      });
    }

    // Remove from state
    state.steps = state.steps.filter(s => !toDelete.has(s.id));

    if (state.selectedStepId && toDelete.has(state.selectedStepId)) {
      state.selectedStepId = null;
    }

    // Remove from DOM
    toDelete.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // Reorder remaining steps
    state.steps.forEach((s, i) => {
      s.order = i + 1;
      const el = document.getElementById(s.id);
      if (el) {
        el.querySelector('.step-number').textContent = s.order;
      }
    });

    updateParentSelect();
    renderConnections();
    updateSummary();
    updatePlaceholder();
    saveToStorage();

    ToolsCommon.Toast.show(toDelete.size > 1 ? 'Steps deleted' : 'Step deleted');
  }

  /**
   * Select a step
   */
  function selectStep(e, stepId) {
    if (e.target.closest('.step-delete')) return;

    // Deselect previous
    document.querySelectorAll('.cot-step.selected').forEach(s => {
      s.classList.remove('selected');
    });

    // Toggle selection
    if (state.selectedStepId === stepId) {
      state.selectedStepId = null;
    } else {
      state.selectedStepId = stepId;
      const stepEl = document.getElementById(stepId);
      if (stepEl) {
        stepEl.classList.add('selected');
      }
    }
  }

  /**
   * Start dragging a step
   */
  function startDrag(e, stepId) {
    if (e.target.closest('.step-delete')) return;

    e.preventDefault();
    state.isDragging = true;
    state.dragStepId = stepId;

    const stepEl = document.getElementById(stepId);
    stepEl.classList.add('dragging');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = stepEl.getBoundingClientRect();
    state.dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
  }

  /**
   * Handle drag movement
   */
  function onDrag(e) {
    if (!state.isDragging || !state.dragStepId) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const containerRect = elements.diagramContainer.getBoundingClientRect();
    const stepEl = document.getElementById(state.dragStepId);
    const stepRect = stepEl.getBoundingClientRect();

    let newX = (clientX - containerRect.left - state.dragOffset.x) / state.zoom;
    let newY = (clientY - containerRect.top - state.dragOffset.y) / state.zoom;

    // Constrain within container
    const maxX = (containerRect.width / state.zoom) - stepRect.width / state.zoom;
    const maxY = (containerRect.height / state.zoom) - stepRect.height / state.zoom;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // Update position
    stepEl.style.left = `${newX}px`;
    stepEl.style.top = `${newY}px`;

    // Update state
    const step = state.steps.find(s => s.id === state.dragStepId);
    if (step) {
      step.x = newX;
      step.y = newY;
    }

    renderConnections();
  }

  /**
   * End dragging
   */
  function endDrag() {
    if (state.dragStepId) {
      const stepEl = document.getElementById(state.dragStepId);
      if (stepEl) {
        stepEl.classList.remove('dragging');
      }
    }

    state.isDragging = false;
    state.dragStepId = null;

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);

    saveToStorage();
  }

  /**
   * Render connections between steps
   */
  function renderConnections() {
    elements.connectionsSvg.innerHTML = '';

    // Add arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="cot-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" class="cot-arrow" fill="currentColor" />
      </marker>
    `;
    elements.connectionsSvg.appendChild(defs);

    state.steps.forEach(step => {
      if (!step.parentId) return;

      const parentEl = document.getElementById(step.parentId);
      const childEl = document.getElementById(step.id);

      if (!parentEl || !childEl) return;

      const parentRect = parentEl.getBoundingClientRect();
      const childRect = childEl.getBoundingClientRect();
      const containerRect = elements.diagramContainer.getBoundingClientRect();

      // Calculate points
      const fromX = (parentRect.right - containerRect.left) / state.zoom;
      const fromY = (parentRect.top + parentRect.height / 2 - containerRect.top) / state.zoom;
      const toX = (childRect.left - containerRect.left) / state.zoom;
      const toY = (childRect.top + childRect.height / 2 - containerRect.top) / state.zoom;

      // Create curved path
      const midX = (fromX + toX) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX - 10} ${toY}`);
      path.setAttribute('class', `cot-connection ${step.type}`);
      path.setAttribute('marker-end', 'url(#cot-arrowhead)');

      elements.connectionsSvg.appendChild(path);
    });
  }

  /**
   * Update parent step select dropdown
   */
  function updateParentSelect() {
    const options = state.steps.map(s =>
      `<option value="${s.id}">${s.order}. ${escapeHtml(s.content.substring(0, 30))}${s.content.length > 30 ? '...' : ''}</option>`
    ).join('');

    elements.parentStep.innerHTML = `<option value="">Root (Start)</option>${options}`;
  }

  /**
   * Update summary
   */
  function updateSummary() {
    const problem = elements.problemInput.value.trim();

    if (state.steps.length === 0) {
      elements.summaryContent.innerHTML = `
        <div class="summary-placeholder">
          Add steps to see reasoning summary
        </div>
      `;
      return;
    }

    const problemHtml = problem ? `
      <div class="summary-problem">
        <div class="summary-problem-label">Problem</div>
        <div class="summary-problem-text">${escapeHtml(problem)}</div>
      </div>
    ` : '';

    // Sort steps by order
    const sortedSteps = [...state.steps].sort((a, b) => a.order - b.order);

    const stepsHtml = sortedSteps.map(step => `
      <div class="summary-item">
        <span class="summary-num ${step.type}">${step.order}</span>
        <div class="summary-text">
          <span class="summary-type">${CONFIG.STEP_LABELS[step.type]}:</span>
          ${escapeHtml(step.content)}
        </div>
      </div>
    `).join('');

    elements.summaryContent.innerHTML = `
      ${problemHtml}
      <div class="summary-list">${stepsHtml}</div>
    `;
  }

  /**
   * Update placeholder visibility
   */
  function updatePlaceholder() {
    if (state.steps.length > 0) {
      elements.diagramPlaceholder.classList.add('hidden');
    } else {
      elements.diagramPlaceholder.classList.remove('hidden');
    }
  }

  /**
   * Auto layout steps
   */
  function autoLayout() {
    if (state.steps.length === 0) return;

    const containerRect = elements.diagramContainer.getBoundingClientRect();
    const levelWidth = 220;
    const levelHeight = 100;
    const startX = 40;
    const startY = 40;

    // Build tree structure
    const rootSteps = state.steps.filter(s => !s.parentId);
    const childrenMap = new Map();

    state.steps.forEach(s => {
      if (s.parentId) {
        if (!childrenMap.has(s.parentId)) {
          childrenMap.set(s.parentId, []);
        }
        childrenMap.get(s.parentId).push(s);
      }
    });

    // Position nodes level by level
    function positionNode(step, level, yOffset) {
      step.x = startX + level * levelWidth;
      step.y = startY + yOffset;

      const el = document.getElementById(step.id);
      if (el) {
        el.style.left = `${step.x}px`;
        el.style.top = `${step.y}px`;
      }

      const children = childrenMap.get(step.id) || [];
      let childYOffset = yOffset;
      children.forEach(child => {
        positionNode(child, level + 1, childYOffset);
        childYOffset += levelHeight;
      });

      return Math.max(1, children.length);
    }

    let yOffset = 0;
    rootSteps.forEach(step => {
      const height = positionNode(step, 0, yOffset);
      yOffset += height * levelHeight;
    });

    renderConnections();
    saveToStorage();

    ToolsCommon.Toast.show('Layout applied', 'success');
  }

  // ==================== View Controls ====================

  function zoomIn() {
    if (state.zoom < CONFIG.MAX_ZOOM) {
      state.zoom = Math.min(state.zoom + CONFIG.ZOOM_STEP, CONFIG.MAX_ZOOM);
      applyZoom();
    }
  }

  function zoomOut() {
    if (state.zoom > CONFIG.MIN_ZOOM) {
      state.zoom = Math.max(state.zoom - CONFIG.ZOOM_STEP, CONFIG.MIN_ZOOM);
      applyZoom();
    }
  }

  function applyZoom() {
    elements.diagramContent.style.transform = `scale(${state.zoom})`;
    renderConnections();
  }

  // ==================== Templates ====================

  function applyTemplate(templateId) {
    const template = CONFIG.TEMPLATES[templateId];
    if (!template) return;

    if (state.steps.length > 0) {
      if (!confirm('This will clear current steps. Continue?')) return;
    }

    // Clear current
    state.steps = [];
    state.stepIdCounter = 0;
    elements.stepsContainer.innerHTML = '';

    // Set problem
    elements.problemInput.value = template.problem;
    state.problem = template.problem;

    // Add template steps
    let prevId = null;
    template.steps.forEach((stepData, index) => {
      const step = {
        id: `step-${++state.stepIdCounter}`,
        type: stepData.type,
        content: stepData.content,
        parentId: prevId,
        x: 40 + index * 200,
        y: 40 + (index % 2) * 80,
        order: index + 1
      };
      state.steps.push(step);
      renderStep(step);
      prevId = step.id;
    });

    updateParentSelect();
    renderConnections();
    updateSummary();
    updatePlaceholder();
    autoLayout();
    saveToStorage();

    ToolsCommon.Toast.show('Template applied', 'success');
  }

  // ==================== Export ====================

  async function exportDiagram() {
    if (state.steps.length === 0) {
      ToolsCommon.Toast.show('No diagram to export', 'error');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2;

      const containerRect = elements.diagramContainer.getBoundingClientRect();
      canvas.width = containerRect.width * scale;
      canvas.height = containerRect.height * scale;

      // Background
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface').trim() || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-border').trim() || '#e2e8f0';
      for (let x = 0; x < canvas.width; x += 20 * scale) {
        for (let y = 0; y < canvas.height; y += 20 * scale) {
          ctx.beginPath();
          ctx.arc(x, y, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw connections
      const colors = {
        thought: '#3b82f6',
        observation: '#22c55e',
        analysis: '#8b5cf6',
        hypothesis: '#f59e0b',
        evidence: '#06b6d4',
        conclusion: '#ef4444',
        question: '#ec4899',
        action: '#14b8a6'
      };

      state.steps.forEach(step => {
        if (!step.parentId) return;
        const parent = state.steps.find(s => s.id === step.parentId);
        if (!parent) return;

        ctx.strokeStyle = colors[step.type] || '#94a3b8';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo((parent.x + 180) * scale, (parent.y + 40) * scale);
        ctx.lineTo(step.x * scale, (step.y + 40) * scale);
        ctx.stroke();

        // Arrow
        const angle = Math.atan2(step.y - parent.y, step.x - parent.x - 180);
        ctx.fillStyle = colors[step.type] || '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(step.x * scale, (step.y + 40) * scale);
        ctx.lineTo(
          (step.x - 8) * scale,
          (step.y + 35) * scale
        );
        ctx.lineTo(
          (step.x - 8) * scale,
          (step.y + 45) * scale
        );
        ctx.closePath();
        ctx.fill();
      });

      // Draw steps
      state.steps.forEach(step => {
        const x = step.x * scale;
        const y = step.y * scale;
        const width = 170 * scale;
        const height = 80 * scale;

        // Background
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface').trim() || '#ffffff';
        ctx.strokeStyle = colors[step.type] || '#94a3b8';
        ctx.lineWidth = 2 * scale;
        roundRect(ctx, x, y, width, height, 8 * scale);
        ctx.fill();
        ctx.stroke();

        // Type label
        ctx.fillStyle = colors[step.type] || '#94a3b8';
        ctx.font = `bold ${10 * scale}px Inter, sans-serif`;
        ctx.fillText(CONFIG.STEP_LABELS[step.type].toUpperCase(), x + 10 * scale, y + 20 * scale);

        // Number
        ctx.fillStyle = '#64748b';
        ctx.font = `${10 * scale}px Inter, sans-serif`;
        ctx.fillText(`#${step.order}`, x + width - 25 * scale, y + 20 * scale);

        // Content
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-text').trim() || '#1e293b';
        ctx.font = `${11 * scale}px Inter, sans-serif`;
        wrapText(ctx, step.content, x + 10 * scale, y + 40 * scale, width - 20 * scale, 14 * scale);
      });

      canvas.toBlob(blob => {
        if (blob) {
          ToolsCommon.FileDownload.blob(blob, 'chain-of-thought.png');
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

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = 0;
    const maxLines = 2;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[i] + ' ';
        y += lineHeight;
        lines++;
        if (lines >= maxLines) {
          ctx.fillText('...', x, y);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
  }

  /**
   * Copy summary to clipboard
   */
  function copySummary() {
    const problem = elements.problemInput.value.trim();
    const sortedSteps = [...state.steps].sort((a, b) => a.order - b.order);

    let text = '';
    if (problem) {
      text += `Problem: ${problem}\n\n`;
    }
    text += 'Chain of Thought:\n';
    sortedSteps.forEach(step => {
      text += `${step.order}. [${CONFIG.STEP_LABELS[step.type]}] ${step.content}\n`;
    });

    ToolsCommon.Clipboard.copy(text);
    ToolsCommon.Toast.show('Summary copied!', 'success');
  }

  /**
   * Clear all
   */
  function clearAll() {
    if (state.steps.length === 0) {
      ToolsCommon.Toast.show('Nothing to clear');
      return;
    }

    if (!confirm('Clear all steps?')) return;

    state.steps = [];
    state.selectedStepId = null;
    state.stepIdCounter = 0;
    elements.problemInput.value = '';

    elements.stepsContainer.innerHTML = '';
    elements.connectionsSvg.innerHTML = '';

    updateParentSelect();
    updateSummary();
    updatePlaceholder();
    saveToStorage();

    ToolsCommon.Toast.show('Diagram cleared');
  }

  // ==================== Storage ====================

  function saveToStorage() {
    try {
      const data = {
        problem: elements.problemInput.value,
        steps: state.steps,
        stepIdCounter: state.stepIdCounter
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
        elements.problemInput.value = data.problem || '';
        state.steps = data.steps || [];
        state.stepIdCounter = data.stepIdCounter || 0;

        state.steps.forEach(step => renderStep(step));
        updateParentSelect();
        renderConnections();
        updateSummary();
        updatePlaceholder();
      }
    } catch (e) {
      console.warn('Failed to load:', e);
    }
  }

  // ==================== Utilities ====================

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.selectedStepId) {
        e.preventDefault();
        deleteStep(state.selectedStepId);
      }
    }

    if (e.key === 'Escape') {
      document.querySelectorAll('.cot-step.selected').forEach(s => {
        s.classList.remove('selected');
      });
      state.selectedStepId = null;
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      exportDiagram();
    }

    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-' || e.key === '_') zoomOut();
    if (e.key.toLowerCase() === 'l') autoLayout();
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    loadFromStorage();
    updatePlaceholder();
  }

  function setupEventListeners() {
    // Add step
    elements.addStepBtn.addEventListener('click', addStep);
    elements.stepContent.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addStep();
    });

    // Problem input
    elements.problemInput.addEventListener('input', ToolsCommon.debounce(() => {
      updateSummary();
      saveToStorage();
    }, 300));

    // Controls
    elements.autoLayoutBtn.addEventListener('click', autoLayout);
    elements.zoomInBtn.addEventListener('click', zoomIn);
    elements.zoomOutBtn.addEventListener('click', zoomOut);

    // Actions
    elements.exportBtn.addEventListener('click', exportDiagram);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.copySummaryBtn.addEventListener('click', copySummary);

    // Templates
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTemplate(btn.dataset.template);
      });
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Resize
    window.addEventListener('resize', ToolsCommon.debounce(() => {
      renderConnections();
    }, 200));
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
