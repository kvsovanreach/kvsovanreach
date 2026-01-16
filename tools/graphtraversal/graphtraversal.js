/**
 * KVSOVANREACH Graph Traversal Visualizer
 * Interactive BFS and DFS visualization
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    graphCanvas: document.getElementById('graphCanvas'),
    visPlaceholder: document.getElementById('visPlaceholder'),
    algorithmSelect: document.getElementById('algorithmSelect'),
    startNode: document.getElementById('startNode'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    // Buttons
    startBtn: document.getElementById('startBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    clearBtn: document.getElementById('clearBtn'),
    // Builder
    nodeInput: document.getElementById('nodeInput'),
    addNodeBtn: document.getElementById('addNodeBtn'),
    edgeFrom: document.getElementById('edgeFrom'),
    edgeTo: document.getElementById('edgeTo'),
    addEdgeBtn: document.getElementById('addEdgeBtn'),
    // Stats
    nodeCount: document.getElementById('nodeCount'),
    edgeCount: document.getElementById('edgeCount'),
    // Output
    traversalPath: document.getElementById('traversalPath'),
    traversalQueue: document.getElementById('traversalQueue'),
    queueItems: document.getElementById('queueItems'),
    // Info
    algorithmName: document.getElementById('algorithmName'),
    algorithmDesc: document.getElementById('algorithmDesc'),
    dataStructure: document.getElementById('dataStructure')
  };

  // State
  const graph = {
    nodes: new Map(), // name -> {x, y}
    edges: [] // [{from, to}]
  };

  let traversalState = {
    isRunning: false,
    isPaused: false,
    visited: new Set(),
    queue: [],
    path: [],
    currentNode: null,
    animationId: null
  };

  // Algorithm info
  const algorithmInfo = {
    bfs: {
      name: 'Breadth-First Search (BFS)',
      description: 'BFS explores nodes level by level, visiting all neighbors before moving to the next depth. Uses a queue data structure.',
      dataStructure: 'Queue'
    },
    dfs: {
      name: 'Depth-First Search (DFS)',
      description: 'DFS explores as far as possible along each branch before backtracking. Uses a stack data structure (or recursion).',
      dataStructure: 'Stack'
    }
  };

  // Node positions for layout
  const NODE_RADIUS = 25;
  const CANVAS_PADDING = 50;

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    updateAlgorithmInfo();
    updateSpeedDisplay();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Algorithm select
    elements.algorithmSelect.addEventListener('change', updateAlgorithmInfo);

    // Speed slider
    elements.speedSlider.addEventListener('input', updateSpeedDisplay);

    // Control buttons
    elements.startBtn.addEventListener('click', toggleTraversal);
    elements.stepBtn.addEventListener('click', stepTraversal);
    elements.resetBtn.addEventListener('click', resetTraversal);
    elements.sampleBtn.addEventListener('click', loadSampleGraph);
    elements.clearBtn.addEventListener('click', clearGraph);

    // Builder
    elements.addNodeBtn.addEventListener('click', addNode);
    elements.addEdgeBtn.addEventListener('click', addEdge);
    elements.nodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNode();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Update algorithm info display
   */
  function updateAlgorithmInfo() {
    const algo = elements.algorithmSelect.value;
    const info = algorithmInfo[algo];

    elements.algorithmName.textContent = info.name;
    elements.algorithmDesc.textContent = info.description;
    elements.dataStructure.textContent = info.dataStructure;
  }

  /**
   * Update speed display
   */
  function updateSpeedDisplay() {
    elements.speedValue.textContent = elements.speedSlider.value;
  }

  /**
   * Add a node to the graph
   */
  function addNode() {
    const name = elements.nodeInput.value.trim().toUpperCase();

    if (!name) {
      ToolsCommon.Toast.show('Please enter a node name', 'error');
      return;
    }

    if (graph.nodes.has(name)) {
      ToolsCommon.Toast.show('Node already exists', 'error');
      return;
    }

    // Calculate position
    const canvas = elements.graphCanvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width - CANVAS_PADDING * 2;
    const height = rect.height - CANVAS_PADDING * 2;

    // Position in a grid-like pattern
    const nodeCount = graph.nodes.size;
    const cols = Math.ceil(Math.sqrt(nodeCount + 1));
    const row = Math.floor(nodeCount / cols);
    const col = nodeCount % cols;

    const x = CANVAS_PADDING + (col + 0.5) * (width / cols);
    const y = CANVAS_PADDING + (row + 0.5) * (height / Math.ceil((nodeCount + 1) / cols));

    graph.nodes.set(name, { x, y });

    elements.nodeInput.value = '';
    updateNodeSelects();
    renderGraph();
    ToolsCommon.Toast.show(`Node "${name}" added`, 'success');
  }

  /**
   * Add an edge to the graph
   */
  function addEdge() {
    const from = elements.edgeFrom.value;
    const to = elements.edgeTo.value;

    if (!from || !to) {
      ToolsCommon.Toast.show('Please select both nodes', 'error');
      return;
    }

    if (from === to) {
      ToolsCommon.Toast.show('Cannot create self-loop', 'error');
      return;
    }

    // Check if edge already exists
    const exists = graph.edges.some(e =>
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );

    if (exists) {
      ToolsCommon.Toast.show('Edge already exists', 'error');
      return;
    }

    graph.edges.push({ from, to });
    renderGraph();
    ToolsCommon.Toast.show(`Edge ${from} → ${to} added`, 'success');
  }

  /**
   * Update node select dropdowns
   */
  function updateNodeSelects() {
    const nodes = Array.from(graph.nodes.keys()).sort();

    // Start node select
    elements.startNode.innerHTML = '<option value="">Select...</option>' +
      nodes.map(n => `<option value="${n}">${n}</option>`).join('');

    // Edge selects
    const options = '<option value="">Select</option>' +
      nodes.map(n => `<option value="${n}">${n}</option>`).join('');

    elements.edgeFrom.innerHTML = options;
    elements.edgeTo.innerHTML = options;
  }

  /**
   * Render the graph
   */
  function renderGraph() {
    const svg = elements.graphCanvas;
    svg.innerHTML = '';

    // Update stats
    elements.nodeCount.textContent = graph.nodes.size;
    elements.edgeCount.textContent = graph.edges.length;

    // Show/hide placeholder
    elements.visPlaceholder.classList.toggle('hidden', graph.nodes.size > 0);

    if (graph.nodes.size === 0) return;

    // Recalculate positions
    recalculatePositions();

    // Draw edges first (so nodes appear on top)
    graph.edges.forEach(edge => {
      const from = graph.nodes.get(edge.from);
      const to = graph.nodes.get(edge.to);

      if (!from || !to) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('class', 'graph-edge');
      line.setAttribute('data-from', edge.from);
      line.setAttribute('data-to', edge.to);
      svg.appendChild(line);
    });

    // Draw nodes
    graph.nodes.forEach((pos, name) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'graph-node unvisited');
      group.setAttribute('data-node', name);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', NODE_RADIUS);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.textContent = name;

      group.appendChild(circle);
      group.appendChild(text);
      svg.appendChild(group);
    });
  }

  /**
   * Recalculate node positions for better layout
   */
  function recalculatePositions() {
    const canvas = elements.graphCanvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width - CANVAS_PADDING * 2;
    const height = rect.height - CANVAS_PADDING * 2;

    const nodes = Array.from(graph.nodes.keys());
    const count = nodes.length;

    if (count <= 1) {
      if (count === 1) {
        graph.nodes.set(nodes[0], {
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
      return;
    }

    // Circular layout for better visualization
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(width, height) / 2 - NODE_RADIUS;

    nodes.forEach((name, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      graph.nodes.set(name, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    });
  }

  /**
   * Load sample graph
   */
  function loadSampleGraph() {
    clearGraph();

    // Add nodes
    const sampleNodes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const canvas = elements.graphCanvas;
    const rect = canvas.getBoundingClientRect();

    sampleNodes.forEach(name => {
      graph.nodes.set(name, { x: 0, y: 0 });
    });

    // Add edges
    graph.edges = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'B', to: 'E' },
      { from: 'C', to: 'F' },
      { from: 'D', to: 'E' },
      { from: 'E', to: 'F' }
    ];

    updateNodeSelects();
    renderGraph();
    ToolsCommon.Toast.show('Sample graph loaded', 'success');
  }

  /**
   * Clear the graph
   */
  function clearGraph() {
    graph.nodes.clear();
    graph.edges = [];
    resetTraversal();
    updateNodeSelects();
    renderGraph();
    ToolsCommon.Toast.show('Graph cleared', 'info');
  }

  /**
   * Toggle traversal start/pause
   */
  function toggleTraversal() {
    if (traversalState.isRunning && !traversalState.isPaused) {
      pauseTraversal();
    } else if (traversalState.isPaused) {
      resumeTraversal();
    } else {
      startTraversal();
    }
  }

  /**
   * Start traversal
   */
  function startTraversal() {
    const startNode = elements.startNode.value;

    if (!startNode) {
      ToolsCommon.Toast.show('Please select a start node', 'error');
      return;
    }

    if (graph.nodes.size === 0) {
      ToolsCommon.Toast.show('Graph is empty', 'error');
      return;
    }

    resetTraversal();

    traversalState.isRunning = true;
    traversalState.queue = [startNode];

    updateButtonStates();
    elements.traversalQueue.style.display = 'flex';

    runTraversal();
  }

  /**
   * Pause traversal
   */
  function pauseTraversal() {
    traversalState.isPaused = true;
    if (traversalState.animationId) {
      clearTimeout(traversalState.animationId);
    }
    updateButtonStates();
    ToolsCommon.Toast.show('Traversal paused', 'info');
  }

  /**
   * Resume traversal
   */
  function resumeTraversal() {
    traversalState.isPaused = false;
    updateButtonStates();
    runTraversal();
    ToolsCommon.Toast.show('Traversal resumed', 'info');
  }

  /**
   * Run traversal animation
   */
  function runTraversal() {
    if (!traversalState.isRunning || traversalState.isPaused) return;

    if (traversalState.queue.length === 0) {
      finishTraversal();
      return;
    }

    const algorithm = elements.algorithmSelect.value;
    const speed = parseInt(elements.speedSlider.value);

    // Get next node (queue for BFS, stack for DFS)
    const currentNode = algorithm === 'bfs'
      ? traversalState.queue.shift()
      : traversalState.queue.pop();

    if (traversalState.visited.has(currentNode)) {
      runTraversal();
      return;
    }

    // Update state
    traversalState.currentNode = currentNode;
    traversalState.visited.add(currentNode);
    traversalState.path.push(currentNode);

    // Get neighbors and add unvisited ones to queue
    const neighbors = getNeighbors(currentNode);
    neighbors.forEach(neighbor => {
      if (!traversalState.visited.has(neighbor) && !traversalState.queue.includes(neighbor)) {
        traversalState.queue.push(neighbor);
      }
    });

    // Update visualization
    updateVisualization();

    // Schedule next step
    traversalState.animationId = setTimeout(runTraversal, speed);
  }

  /**
   * Step through traversal manually
   */
  function stepTraversal() {
    if (!traversalState.isRunning) {
      const startNode = elements.startNode.value;

      if (!startNode) {
        ToolsCommon.Toast.show('Please select a start node', 'error');
        return;
      }

      if (graph.nodes.size === 0) {
        ToolsCommon.Toast.show('Graph is empty', 'error');
        return;
      }

      resetTraversal();
      traversalState.isRunning = true;
      traversalState.isPaused = true;
      traversalState.queue = [startNode];
      elements.traversalQueue.style.display = 'flex';
      updateButtonStates();
    }

    if (traversalState.queue.length === 0) {
      finishTraversal();
      return;
    }

    const algorithm = elements.algorithmSelect.value;

    // Get next node
    const currentNode = algorithm === 'bfs'
      ? traversalState.queue.shift()
      : traversalState.queue.pop();

    if (traversalState.visited.has(currentNode)) {
      stepTraversal();
      return;
    }

    // Update state
    traversalState.currentNode = currentNode;
    traversalState.visited.add(currentNode);
    traversalState.path.push(currentNode);

    // Get neighbors
    const neighbors = getNeighbors(currentNode);
    neighbors.forEach(neighbor => {
      if (!traversalState.visited.has(neighbor) && !traversalState.queue.includes(neighbor)) {
        traversalState.queue.push(neighbor);
      }
    });

    updateVisualization();
  }

  /**
   * Reset traversal
   */
  function resetTraversal() {
    if (traversalState.animationId) {
      clearTimeout(traversalState.animationId);
    }

    traversalState = {
      isRunning: false,
      isPaused: false,
      visited: new Set(),
      queue: [],
      path: [],
      currentNode: null,
      animationId: null
    };

    // Reset node styles
    document.querySelectorAll('.graph-node').forEach(node => {
      node.setAttribute('class', 'graph-node unvisited');
    });

    document.querySelectorAll('.graph-edge').forEach(edge => {
      edge.setAttribute('class', 'graph-edge');
    });

    // Reset output
    elements.traversalPath.innerHTML = '<span class="path-placeholder">Run traversal to see the order</span>';
    elements.traversalQueue.style.display = 'none';
    elements.queueItems.innerHTML = '';

    updateButtonStates();
  }

  /**
   * Finish traversal
   */
  function finishTraversal() {
    traversalState.isRunning = false;
    traversalState.isPaused = false;
    traversalState.currentNode = null;
    updateVisualization();
    updateButtonStates();
    ToolsCommon.Toast.show('Traversal complete!', 'success');
  }

  /**
   * Get neighbors of a node
   */
  function getNeighbors(node) {
    const neighbors = [];

    graph.edges.forEach(edge => {
      if (edge.from === node && !neighbors.includes(edge.to)) {
        neighbors.push(edge.to);
      } else if (edge.to === node && !neighbors.includes(edge.from)) {
        neighbors.push(edge.from);
      }
    });

    return neighbors.sort();
  }

  /**
   * Update visualization
   */
  function updateVisualization() {
    // Update nodes
    document.querySelectorAll('.graph-node').forEach(nodeEl => {
      const nodeName = nodeEl.getAttribute('data-node');
      let className = 'graph-node ';

      if (nodeName === traversalState.currentNode) {
        className += 'current';
      } else if (traversalState.visited.has(nodeName)) {
        className += 'visited';
      } else if (traversalState.queue.includes(nodeName)) {
        className += 'queued';
      } else {
        className += 'unvisited';
      }

      nodeEl.setAttribute('class', className);
    });

    // Update traversal path display
    if (traversalState.path.length > 0) {
      elements.traversalPath.innerHTML = traversalState.path.map((node, i) => {
        let html = `<span class="path-node">${node}</span>`;
        if (i < traversalState.path.length - 1) {
          html += '<i class="fa-solid fa-chevron-right path-arrow"></i>';
        }
        return html;
      }).join('');
    }

    // Update queue/stack display
    elements.queueItems.innerHTML = traversalState.queue.map(node =>
      `<span class="queue-item">${node}</span>`
    ).join('');
  }

  /**
   * Update button states
   */
  function updateButtonStates() {
    const startIcon = elements.startBtn.querySelector('i');
    const startText = elements.startBtn.querySelector('span');

    if (traversalState.isRunning && !traversalState.isPaused) {
      startIcon.className = 'fa-solid fa-pause';
      startText.textContent = 'Pause';
    } else if (traversalState.isPaused) {
      startIcon.className = 'fa-solid fa-play';
      startText.textContent = 'Resume';
    } else {
      startIcon.className = 'fa-solid fa-play';
      startText.textContent = 'Start';
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Space - Start/Pause
    if (e.code === 'Space') {
      e.preventDefault();
      toggleTraversal();
    }

    // N - Next step
    if (e.key.toLowerCase() === 'n') {
      stepTraversal();
    }

    // R - Reset
    if (e.key.toLowerCase() === 'r') {
      resetTraversal();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
