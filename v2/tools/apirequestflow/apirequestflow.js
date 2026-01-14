/**
 * KVSOVANREACH API Request Flow Builder
 * Draw and visualize client-side API request sequences
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    nodes: [],
    connections: [],
    selectedNodeId: null,
    zoom: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    dragNodeId: null,
    nodeIdCounter: 0
  };

  // ==================== DOM Elements ====================
  const elements = {
    // Add node
    nodeType: document.getElementById('nodeType'),
    nodeName: document.getElementById('nodeName'),
    addNodeBtn: document.getElementById('addNodeBtn'),
    // Connection
    fromNode: document.getElementById('fromNode'),
    toNode: document.getElementById('toNode'),
    requestMethod: document.getElementById('requestMethod'),
    requestLabel: document.getElementById('requestLabel'),
    addConnectionBtn: document.getElementById('addConnectionBtn'),
    // Canvas
    canvasContainer: document.getElementById('canvasContainer'),
    canvasContent: document.getElementById('canvasContent'),
    connectionsSvg: document.getElementById('connectionsSvg'),
    nodesContainer: document.getElementById('nodesContainer'),
    canvasPlaceholder: document.getElementById('canvasPlaceholder'),
    // View controls
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    resetViewBtn: document.getElementById('resetViewBtn'),
    // Sequence
    sequenceContent: document.getElementById('sequenceContent'),
    // Actions
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  // ==================== Constants ====================
  const CONFIG = {
    NODE_ICONS: {
      client: 'fa-user',
      server: 'fa-server',
      database: 'fa-database',
      cache: 'fa-bolt',
      service: 'fa-cube',
      gateway: 'fa-door-open',
      queue: 'fa-layer-group',
      cdn: 'fa-cloud'
    },
    NODE_LABELS: {
      client: 'Client',
      server: 'Server',
      database: 'Database',
      cache: 'Cache',
      service: 'Service',
      gateway: 'Gateway',
      queue: 'Queue',
      cdn: 'CDN'
    },
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2,
    ZOOM_STEP: 0.1,
    STORAGE_KEY: 'kvsovanreach_apiflow_data'
  };

  // ==================== Core Functions ====================

  /**
   * Add a new node to the canvas
   */
  function addNode() {
    const type = elements.nodeType.value;
    const name = elements.nodeName.value.trim() || CONFIG.NODE_LABELS[type];

    // Calculate position (spread nodes out)
    const containerRect = elements.canvasContainer.getBoundingClientRect();
    const nodeCount = state.nodes.length;
    const cols = 4;
    const row = Math.floor(nodeCount / cols);
    const col = nodeCount % cols;

    const x = 60 + (col * 150);
    const y = 60 + (row * 120);

    const node = {
      id: `node-${++state.nodeIdCounter}`,
      type,
      name,
      x: Math.min(x, containerRect.width - 100),
      y: Math.min(y, containerRect.height - 100)
    };

    state.nodes.push(node);
    renderNode(node);
    updateNodeSelects();
    updatePlaceholder();
    saveToStorage();

    // Clear input
    elements.nodeName.value = '';

    ToolsCommon.Toast.show(`Added ${name} node`, 'success');
  }

  /**
   * Render a node on the canvas
   */
  function renderNode(node) {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'flow-node';
    nodeEl.id = node.id;
    nodeEl.dataset.type = node.type;
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;

    nodeEl.innerHTML = `
      <div class="node-icon ${node.type}">
        <i class="fa-solid ${CONFIG.NODE_ICONS[node.type]}"></i>
      </div>
      <span class="node-label">${escapeHtml(node.name)}</span>
      <button class="node-delete" title="Delete node" aria-label="Delete node">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Event listeners
    nodeEl.addEventListener('mousedown', (e) => startDrag(e, node.id));
    nodeEl.addEventListener('touchstart', (e) => startDrag(e, node.id), { passive: false });
    nodeEl.addEventListener('click', (e) => selectNode(e, node.id));

    const deleteBtn = nodeEl.querySelector('.node-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(node.id);
    });

    elements.nodesContainer.appendChild(nodeEl);
  }

  /**
   * Delete a node
   */
  function deleteNode(nodeId) {
    // Remove from state
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    state.connections = state.connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    );

    if (state.selectedNodeId === nodeId) {
      state.selectedNodeId = null;
    }

    // Remove from DOM
    const nodeEl = document.getElementById(nodeId);
    if (nodeEl) {
      nodeEl.remove();
    }

    renderConnections();
    updateNodeSelects();
    updateSequence();
    updatePlaceholder();
    saveToStorage();

    ToolsCommon.Toast.show('Node deleted');
  }

  /**
   * Select a node
   */
  function selectNode(e, nodeId) {
    if (e.target.closest('.node-delete')) return;

    // Deselect previous
    document.querySelectorAll('.flow-node.selected').forEach(n => {
      n.classList.remove('selected');
    });

    // Select new
    if (state.selectedNodeId === nodeId) {
      state.selectedNodeId = null;
    } else {
      state.selectedNodeId = nodeId;
      const nodeEl = document.getElementById(nodeId);
      if (nodeEl) {
        nodeEl.classList.add('selected');
      }
    }
  }

  /**
   * Start dragging a node
   */
  function startDrag(e, nodeId) {
    if (e.target.closest('.node-delete')) return;

    e.preventDefault();
    state.isDragging = true;
    state.dragNodeId = nodeId;

    const nodeEl = document.getElementById(nodeId);
    nodeEl.classList.add('dragging');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = nodeEl.getBoundingClientRect();
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
    if (!state.isDragging || !state.dragNodeId) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const containerRect = elements.canvasContainer.getBoundingClientRect();
    const nodeEl = document.getElementById(state.dragNodeId);
    const nodeRect = nodeEl.getBoundingClientRect();

    // Calculate new position relative to container
    let newX = (clientX - containerRect.left - state.dragOffset.x) / state.zoom;
    let newY = (clientY - containerRect.top - state.dragOffset.y) / state.zoom;

    // Constrain within container
    const maxX = (containerRect.width / state.zoom) - nodeRect.width / state.zoom;
    const maxY = (containerRect.height / state.zoom) - nodeRect.height / state.zoom;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // Update position
    nodeEl.style.left = `${newX}px`;
    nodeEl.style.top = `${newY}px`;

    // Update state
    const node = state.nodes.find(n => n.id === state.dragNodeId);
    if (node) {
      node.x = newX;
      node.y = newY;
    }

    // Redraw connections
    renderConnections();
  }

  /**
   * End dragging
   */
  function endDrag() {
    if (state.dragNodeId) {
      const nodeEl = document.getElementById(state.dragNodeId);
      if (nodeEl) {
        nodeEl.classList.remove('dragging');
      }
    }

    state.isDragging = false;
    state.dragNodeId = null;

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);

    saveToStorage();
  }

  /**
   * Add a connection between nodes
   */
  function addConnection() {
    const fromId = elements.fromNode.value;
    const toId = elements.toNode.value;
    const method = elements.requestMethod.value;
    const label = elements.requestLabel.value.trim();

    if (!fromId || !toId) {
      ToolsCommon.Toast.show('Please select both nodes', 'error');
      return;
    }

    if (fromId === toId) {
      ToolsCommon.Toast.show('Cannot connect node to itself', 'error');
      return;
    }

    // Check if connection already exists
    const exists = state.connections.some(
      c => c.from === fromId && c.to === toId
    );

    if (exists) {
      ToolsCommon.Toast.show('Connection already exists', 'error');
      return;
    }

    const connection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId,
      method,
      label: label || `/${method.toLowerCase()}`
    };

    state.connections.push(connection);
    renderConnections();
    updateSequence();
    saveToStorage();

    // Reset inputs
    elements.requestLabel.value = '';

    ToolsCommon.Toast.show('Connection added', 'success');
  }

  /**
   * Delete a connection
   */
  function deleteConnection(connId) {
    state.connections = state.connections.filter(c => c.id !== connId);
    renderConnections();
    updateSequence();
    saveToStorage();

    ToolsCommon.Toast.show('Connection removed');
  }

  /**
   * Render all connections
   */
  function renderConnections() {
    // Clear existing
    elements.connectionsSvg.innerHTML = '';

    // Add arrow marker definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" class="connection-arrow" />
      </marker>
    `;
    elements.connectionsSvg.appendChild(defs);

    state.connections.forEach(conn => {
      const fromNode = document.getElementById(conn.from);
      const toNode = document.getElementById(conn.to);

      if (!fromNode || !toNode) return;

      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      const containerRect = elements.canvasContainer.getBoundingClientRect();

      // Calculate center points
      const fromX = (fromRect.left + fromRect.width / 2 - containerRect.left) / state.zoom;
      const fromY = (fromRect.top + fromRect.height / 2 - containerRect.top) / state.zoom;
      const toX = (toRect.left + toRect.width / 2 - containerRect.left) / state.zoom;
      const toY = (toRect.top + toRect.height / 2 - containerRect.top) / state.zoom;

      // Calculate edge points
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const fromEdgeX = fromX + Math.cos(angle) * (fromRect.width / 2 / state.zoom);
      const fromEdgeY = fromY + Math.sin(angle) * (fromRect.height / 2 / state.zoom);
      const toEdgeX = toX - Math.cos(angle) * (toRect.width / 2 / state.zoom + 10);
      const toEdgeY = toY - Math.sin(angle) * (toRect.height / 2 / state.zoom + 10);

      // Create curved path
      const midX = (fromEdgeX + toEdgeX) / 2;
      const midY = (fromEdgeY + toEdgeY) / 2;
      const curvature = 0.2;
      const dx = toEdgeX - fromEdgeX;
      const dy = toEdgeY - fromEdgeY;
      const ctrlX = midX - dy * curvature;
      const ctrlY = midY + dx * curvature;

      // Create SVG path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${fromEdgeX} ${fromEdgeY} Q ${ctrlX} ${ctrlY} ${toEdgeX} ${toEdgeY}`);
      path.setAttribute('class', `connection-line ${conn.method.toLowerCase()}`);
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.dataset.connId = conn.id;
      path.style.pointerEvents = 'stroke';
      path.addEventListener('click', () => deleteConnection(conn.id));

      elements.connectionsSvg.appendChild(path);

      // Add label
      const labelX = ctrlX;
      const labelY = ctrlY - 12;

      const methodText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      methodText.setAttribute('x', labelX);
      methodText.setAttribute('y', labelY - 8);
      methodText.setAttribute('text-anchor', 'middle');
      methodText.setAttribute('class', `connection-method ${conn.method.toLowerCase()}`);
      methodText.textContent = conn.method;
      elements.connectionsSvg.appendChild(methodText);

      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', labelX);
      labelText.setAttribute('y', labelY + 6);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('class', 'connection-label');
      labelText.textContent = conn.label;
      elements.connectionsSvg.appendChild(labelText);
    });
  }

  /**
   * Update node select dropdowns
   */
  function updateNodeSelects() {
    const options = state.nodes.map(n =>
      `<option value="${n.id}">${escapeHtml(n.name)}</option>`
    ).join('');

    elements.fromNode.innerHTML = `<option value="">Select source...</option>${options}`;
    elements.toNode.innerHTML = `<option value="">Select target...</option>${options}`;
  }

  /**
   * Update request sequence list
   */
  function updateSequence() {
    if (state.connections.length === 0) {
      elements.sequenceContent.innerHTML = `
        <div class="sequence-placeholder">
          Add connections to see request sequence
        </div>
      `;
      return;
    }

    const items = state.connections.map((conn, index) => {
      const fromNode = state.nodes.find(n => n.id === conn.from);
      const toNode = state.nodes.find(n => n.id === conn.to);

      if (!fromNode || !toNode) return '';

      return `
        <div class="sequence-item">
          <span class="sequence-num">${index + 1}</span>
          <span class="sequence-from">${escapeHtml(fromNode.name)}</span>
          <span class="sequence-arrow"><i class="fa-solid fa-arrow-right"></i></span>
          <span class="sequence-to">${escapeHtml(toNode.name)}</span>
          <span class="sequence-method ${conn.method.toLowerCase()}">${conn.method}</span>
          <span class="sequence-label">${escapeHtml(conn.label)}</span>
        </div>
      `;
    }).join('');

    elements.sequenceContent.innerHTML = `<div class="sequence-list">${items}</div>`;
  }

  /**
   * Update placeholder visibility
   */
  function updatePlaceholder() {
    if (state.nodes.length > 0) {
      elements.canvasPlaceholder.classList.add('hidden');
    } else {
      elements.canvasPlaceholder.classList.remove('hidden');
    }
  }

  // ==================== View Controls ====================

  /**
   * Zoom in
   */
  function zoomIn() {
    if (state.zoom < CONFIG.MAX_ZOOM) {
      state.zoom = Math.min(state.zoom + CONFIG.ZOOM_STEP, CONFIG.MAX_ZOOM);
      applyZoom();
    }
  }

  /**
   * Zoom out
   */
  function zoomOut() {
    if (state.zoom > CONFIG.MIN_ZOOM) {
      state.zoom = Math.max(state.zoom - CONFIG.ZOOM_STEP, CONFIG.MIN_ZOOM);
      applyZoom();
    }
  }

  /**
   * Reset view
   */
  function resetView() {
    state.zoom = 1;
    applyZoom();
  }

  /**
   * Apply zoom level
   */
  function applyZoom() {
    elements.canvasContent.style.transform = `scale(${state.zoom})`;
    renderConnections();
  }

  // ==================== Export ====================

  /**
   * Export diagram as PNG
   */
  async function exportDiagram() {
    if (state.nodes.length === 0) {
      ToolsCommon.Toast.show('No diagram to export', 'error');
      return;
    }

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Get container dimensions
      const containerRect = elements.canvasContainer.getBoundingClientRect();
      const scale = 2; // Higher resolution

      canvas.width = containerRect.width * scale;
      canvas.height = containerRect.height * scale;

      // Fill background
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface').trim() || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-border').trim() || '#e2e8f0';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += 20 * scale) {
        for (let y = 0; y < canvas.height; y += 20 * scale) {
          ctx.beginPath();
          ctx.arc(x, y, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw connections
      state.connections.forEach(conn => {
        const fromNode = state.nodes.find(n => n.id === conn.from);
        const toNode = state.nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromX = (fromNode.x + 50) * scale;
        const fromY = (fromNode.y + 45) * scale;
        const toX = (toNode.x + 50) * scale;
        const toY = (toNode.y + 45) * scale;

        // Get method color
        const colors = {
          GET: '#22c55e',
          POST: '#3b82f6',
          PUT: '#f59e0b',
          DELETE: '#ef4444',
          PATCH: '#a855f7',
          WS: '#ec4899',
          QUERY: '#06b6d4',
          EVENT: '#6366f1'
        };

        ctx.strokeStyle = colors[conn.method] || '#94a3b8';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 10 * scale;
        ctx.fillStyle = colors[conn.method] || '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle - Math.PI / 6),
          toY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle + Math.PI / 6),
          toY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Draw label
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        ctx.fillStyle = colors[conn.method] || '#94a3b8';
        ctx.font = `bold ${10 * scale}px "Fira Code", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(conn.method, midX, midY - 8 * scale);
        ctx.fillStyle = '#64748b';
        ctx.font = `${9 * scale}px "Fira Code", monospace`;
        ctx.fillText(conn.label, midX, midY + 8 * scale);
      });

      // Draw nodes
      state.nodes.forEach(node => {
        const x = node.x * scale;
        const y = node.y * scale;
        const width = 100 * scale;
        const height = 90 * scale;

        // Node background
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface').trim() || '#ffffff';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2 * scale;
        roundRect(ctx, x, y, width, height, 12 * scale);
        ctx.fill();
        ctx.stroke();

        // Icon background colors
        const iconColors = {
          client: '#3b82f6',
          server: '#22c55e',
          database: '#f59e0b',
          cache: '#ec4899',
          service: '#6366f1',
          gateway: '#a855f7',
          queue: '#14b8a6',
          cdn: '#ef4444'
        };

        // Draw icon circle
        ctx.fillStyle = iconColors[node.type] || '#8b5cf6';
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + 35 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw node label
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-text').trim() || '#1e293b';
        ctx.font = `600 ${11 * scale}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x + width / 2, y + 75 * scale);
      });

      // Convert to blob and download
      canvas.toBlob(blob => {
        if (blob) {
          ToolsCommon.FileDownload.blob(blob, 'api-flow-diagram.png');
          ToolsCommon.Toast.show('Diagram exported!', 'success');
        }
      }, 'image/png');

    } catch (err) {
      console.error('Export failed:', err);
      ToolsCommon.Toast.show('Export failed', 'error');
    }
  }

  /**
   * Draw rounded rectangle
   */
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

  /**
   * Clear all
   */
  function clearAll() {
    if (state.nodes.length === 0 && state.connections.length === 0) {
      ToolsCommon.Toast.show('Nothing to clear');
      return;
    }

    if (!confirm('Clear all nodes and connections?')) return;

    state.nodes = [];
    state.connections = [];
    state.selectedNodeId = null;
    state.nodeIdCounter = 0;

    elements.nodesContainer.innerHTML = '';
    elements.connectionsSvg.innerHTML = '';

    updateNodeSelects();
    updateSequence();
    updatePlaceholder();
    saveToStorage();

    ToolsCommon.Toast.show('Diagram cleared');
  }

  // ==================== Storage ====================

  /**
   * Save to localStorage
   */
  function saveToStorage() {
    try {
      const data = {
        nodes: state.nodes,
        connections: state.connections,
        nodeIdCounter: state.nodeIdCounter
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  /**
   * Load from localStorage
   */
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        state.nodes = data.nodes || [];
        state.connections = data.connections || [];
        state.nodeIdCounter = data.nodeIdCounter || 0;

        // Render saved nodes
        state.nodes.forEach(node => renderNode(node));
        updateNodeSelects();
        renderConnections();
        updateSequence();
        updatePlaceholder();
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
  }

  // ==================== Utilities ====================

  /**
   * Escape HTML special characters
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Event Handlers ====================

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Delete selected node
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.selectedNodeId) {
        e.preventDefault();
        deleteNode(state.selectedNodeId);
      }
    }

    // Escape - deselect
    if (e.key === 'Escape') {
      document.querySelectorAll('.flow-node.selected').forEach(n => {
        n.classList.remove('selected');
      });
      state.selectedNodeId = null;
    }

    // Ctrl+S - Export
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      exportDiagram();
    }

    // Zoom shortcuts
    if (e.key === '+' || e.key === '=') {
      zoomIn();
    }
    if (e.key === '-' || e.key === '_') {
      zoomOut();
    }
    if (e.key === '0') {
      resetView();
    }
  }

  // ==================== Initialization ====================

  /**
   * Initialize the application
   */
  function init() {
    setupEventListeners();
    loadFromStorage();
    updatePlaceholder();
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Add node
    elements.addNodeBtn.addEventListener('click', addNode);
    elements.nodeName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNode();
    });

    // Add connection
    elements.addConnectionBtn.addEventListener('click', addConnection);
    elements.requestLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addConnection();
    });

    // View controls
    elements.zoomInBtn.addEventListener('click', zoomIn);
    elements.zoomOutBtn.addEventListener('click', zoomOut);
    elements.resetViewBtn.addEventListener('click', resetView);

    // Actions
    elements.exportBtn.addEventListener('click', exportDiagram);
    elements.clearBtn.addEventListener('click', clearAll);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Window resize
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
