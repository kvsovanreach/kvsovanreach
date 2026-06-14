/**
 * KVSOVANREACH Recursion Visualizer Tool
 * Visualize recursion trees with animated step-by-step execution
 */

(function() {
  'use strict';

  // ==================== Constants ====================
  var NODE_RADIUS = 22;
  var NODE_H_GAP = 12;
  var NODE_V_GAP = 70;
  var SVG_PADDING = 30;

  // ==================== DOM ====================
  var algoSelect = document.getElementById('algoSelect');
  var nInput = document.getElementById('nInput');
  var memoToggle = document.getElementById('memoToggle');
  var memoToggleWrap = document.getElementById('memoToggleWrap');
  var speedSlider = document.getElementById('speedSlider');
  var speedLabel = document.getElementById('speedLabel');
  var playBtn = document.getElementById('playBtn');
  var pauseBtn = document.getElementById('pauseBtn');
  var stepBtn = document.getElementById('stepBtn');
  var resetBtn = document.getElementById('resetBtn');
  var depthStat = document.getElementById('depthStat');
  var callsStat = document.getElementById('callsStat');
  var stepStat = document.getElementById('stepStat');
  var treeSvg = document.getElementById('treeSvg');
  var treeContainer = document.getElementById('treeContainer');
  var treeEmpty = document.getElementById('treeEmpty');
  var treeScroll = treeContainer.querySelector('.rc-tree-scroll');
  var callStackEl = document.getElementById('callStack');

  // ==================== State ====================
  var tree = null;       // root node of the built tree
  var steps = [];        // array of execution steps
  var currentStep = 0;
  var isPlaying = false;
  var playTimer = null;
  var maxDepth = 0;
  var totalCalls = 0;

  // ==================== Tree Node ====================
  function TreeNode(label, depth, args) {
    this.label = label;
    this.depth = depth;
    this.args = args;
    this.children = [];
    this.x = 0;
    this.y = 0;
    this.status = 'pending';  // pending | active | complete | pruned
    this.returnValue = null;
    this.width = 0;           // subtree width for layout
    this.id = totalCalls++;
  }

  // ==================== Build Trees ====================

  function buildFibTree(n, depth, memo) {
    var node = new TreeNode('fib(' + n + ')', depth, { n: n });
    if (depth > maxDepth) maxDepth = depth;

    if (memo && memo.has(n)) {
      node.status = 'pruned';
      node.returnValue = memo.get(n);
      return node;
    }

    if (n <= 1) {
      node.returnValue = n;
      return node;
    }

    var left = buildFibTree(n - 1, depth + 1, memo);
    var right = buildFibTree(n - 2, depth + 1, memo);
    node.children.push(left, right);

    var val = (left.returnValue || 0) + (right.returnValue || 0);
    node.returnValue = val;
    if (memo) memo.set(n, val);
    return node;
  }

  function buildFactTree(n, depth) {
    var node = new TreeNode(n + '!', depth, { n: n });
    if (depth > maxDepth) maxDepth = depth;

    if (n <= 1) {
      node.returnValue = 1;
      return node;
    }

    var child = buildFactTree(n - 1, depth + 1);
    node.children.push(child);
    node.returnValue = n * child.returnValue;
    return node;
  }

  function buildPowerTree(base, exp, depth) {
    var node = new TreeNode('pow(' + base + ',' + exp + ')', depth, { base: base, exp: exp });
    if (depth > maxDepth) maxDepth = depth;

    if (exp === 0) {
      node.returnValue = 1;
      return node;
    }
    if (exp === 1) {
      node.returnValue = base;
      return node;
    }

    // Divide and conquer: pow(b, n/2) * pow(b, n/2) or * b
    if (exp % 2 === 0) {
      var half = buildPowerTree(base, exp / 2, depth + 1);
      node.children.push(half);
      node.returnValue = half.returnValue * half.returnValue;
    } else {
      var sub = buildPowerTree(base, exp - 1, depth + 1);
      node.children.push(sub);
      node.returnValue = base * sub.returnValue;
    }
    return node;
  }

  function buildHanoiTree(n, from, to, aux, depth) {
    var label = 'H(' + n + ',' + from + ',' + to + ')';
    var node = new TreeNode(label, depth, { n: n, from: from, to: to, aux: aux });
    if (depth > maxDepth) maxDepth = depth;

    if (n === 0) {
      node.returnValue = 0;
      return node;
    }

    var left = buildHanoiTree(n - 1, from, aux, to, depth + 1);
    var right = buildHanoiTree(n - 1, aux, to, from, depth + 1);
    node.children.push(left, right);
    node.returnValue = left.returnValue + 1 + right.returnValue;
    return node;
  }

  function buildMergeSortTree(arr, depth) {
    var label = '[' + arr.join(',') + ']';
    var node = new TreeNode(label, depth, { arr: arr });
    if (depth > maxDepth) maxDepth = depth;

    if (arr.length <= 1) {
      node.returnValue = arr.slice();
      return node;
    }

    var mid = Math.floor(arr.length / 2);
    var left = buildMergeSortTree(arr.slice(0, mid), depth + 1);
    var right = buildMergeSortTree(arr.slice(mid), depth + 1);
    node.children.push(left, right);

    // Merge
    var merged = [];
    var i = 0, j = 0;
    var la = left.returnValue, ra = right.returnValue;
    while (i < la.length && j < ra.length) {
      if (la[i] <= ra[j]) merged.push(la[i++]);
      else merged.push(ra[j++]);
    }
    while (i < la.length) merged.push(la[i++]);
    while (j < ra.length) merged.push(ra[j++]);
    node.returnValue = merged;
    return node;
  }

  // ==================== Generate Execution Steps ====================

  function generateSteps(node, stepsArr, callStack) {
    if (node.status === 'pruned') {
      stepsArr.push({
        type: 'pruned',
        nodeId: node.id,
        label: node.label,
        returnValue: node.returnValue,
        stack: callStack.slice()
      });
      return;
    }

    // Enter this node
    callStack.push(node.label);
    stepsArr.push({
      type: 'enter',
      nodeId: node.id,
      label: node.label,
      depth: node.depth,
      stack: callStack.slice()
    });

    // Visit children
    for (var i = 0; i < node.children.length; i++) {
      generateSteps(node.children[i], stepsArr, callStack);
    }

    // Return from this node
    stepsArr.push({
      type: 'return',
      nodeId: node.id,
      label: node.label,
      returnValue: node.returnValue,
      stack: callStack.slice()
    });
    callStack.pop();
  }

  // ==================== Layout (simple recursive) ====================

  function computeWidths(node) {
    if (node.children.length === 0) {
      node.width = NODE_RADIUS * 2 + NODE_H_GAP;
      return;
    }
    var total = 0;
    for (var i = 0; i < node.children.length; i++) {
      computeWidths(node.children[i]);
      total += node.children[i].width;
    }
    node.width = Math.max(total, NODE_RADIUS * 2 + NODE_H_GAP);
  }

  function assignPositions(node, x, y) {
    node.x = x;
    node.y = y;

    if (node.children.length === 0) return;

    var totalChildWidth = 0;
    for (var i = 0; i < node.children.length; i++) {
      totalChildWidth += node.children[i].width;
    }

    var startX = x - totalChildWidth / 2;
    for (var i = 0; i < node.children.length; i++) {
      var childCenterX = startX + node.children[i].width / 2;
      assignPositions(node.children[i], childCenterX, y + NODE_V_GAP);
      startX += node.children[i].width;
    }
  }

  // ==================== Render SVG ====================

  function collectAllNodes(node, arr) {
    arr.push(node);
    for (var i = 0; i < node.children.length; i++) {
      collectAllNodes(node.children[i], arr);
    }
  }

  function renderTree() {
    if (!tree) return;

    var allNodes = [];
    collectAllNodes(tree, allNodes);

    // Find bounds
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      if (n.x - NODE_RADIUS < minX) minX = n.x - NODE_RADIUS;
      if (n.x + NODE_RADIUS > maxX) maxX = n.x + NODE_RADIUS;
      if (n.y - NODE_RADIUS < minY) minY = n.y - NODE_RADIUS;
      if (n.y + NODE_RADIUS > maxY) maxY = n.y + NODE_RADIUS;
    }

    var svgW = (maxX - minX) + SVG_PADDING * 2;
    var svgH = (maxY - minY) + SVG_PADDING * 2 + 20; // extra for return labels
    var offsetX = -minX + SVG_PADDING;
    var offsetY = -minY + SVG_PADDING;

    treeSvg.setAttribute('width', svgW);
    treeSvg.setAttribute('height', svgH);
    treeSvg.setAttribute('viewBox', '0 0 ' + svgW + ' ' + svgH);

    var html = '';

    // Edges
    for (var i = 0; i < allNodes.length; i++) {
      var parent = allNodes[i];
      for (var j = 0; j < parent.children.length; j++) {
        var child = parent.children[j];
        var px = parent.x + offsetX;
        var py = parent.y + offsetY;
        var cx = child.x + offsetX;
        var cy = child.y + offsetY;

        var edgeClass = 'rc-edge';
        if (child.status === 'active') edgeClass += ' rc-edge-active';
        if (child.status === 'pruned') edgeClass += ' rc-edge-pruned';

        html += '<line class="' + edgeClass + '" x1="' + px + '" y1="' + (py + NODE_RADIUS) + '" x2="' + cx + '" y2="' + (cy - NODE_RADIUS) + '"/>';
      }
    }

    // Nodes
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var nx = n.x + offsetX;
      var ny = n.y + offsetY;

      var groupClass = 'rc-node-' + n.status;
      html += '<g class="' + groupClass + '" data-id="' + n.id + '">';
      html += '<circle class="rc-node-circle" cx="' + nx + '" cy="' + ny + '" r="' + NODE_RADIUS + '" stroke-width="2"/>';

      // Label inside node
      var displayLabel = n.label;
      if (displayLabel.length > 8) {
        // Shorten for small nodes
        displayLabel = displayLabel.substring(0, 7) + '..';
      }
      html += '<text class="rc-node-label" x="' + nx + '" y="' + ny + '">' + escapeHtml(displayLabel) + '</text>';

      // Return value below
      if (n.status === 'complete' && n.returnValue !== null) {
        var retStr = Array.isArray(n.returnValue) ? '[' + n.returnValue.join(',') + ']' : String(n.returnValue);
        html += '<text class="rc-node-return" x="' + nx + '" y="' + (ny + NODE_RADIUS + 14) + '">' + escapeHtml(retStr) + '</text>';
      }
      if (n.status === 'pruned' && n.returnValue !== null) {
        var retStr2 = String(n.returnValue);
        html += '<text class="rc-node-return" x="' + nx + '" y="' + (ny + NODE_RADIUS + 14) + '" style="fill:var(--color-primary)">' + escapeHtml(retStr2) + ' (memo)</text>';
      }

      html += '</g>';
    }

    treeSvg.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==================== Call Stack Render ====================

  function renderCallStack(stack, returnInfo) {
    if (!stack || stack.length === 0) {
      callStackEl.innerHTML = '<div class="rc-stack-empty">Empty</div>';
      return;
    }

    var html = '';
    for (var i = stack.length - 1; i >= 0; i--) {
      var isTop = (i === stack.length - 1);
      var frameClass = 'rc-stack-frame';
      if (isTop) frameClass += ' active';
      html += '<div class="' + frameClass + '">';
      html += '<span class="frame-arrow">' + (isTop ? '>' : ' ') + '</span> ';
      html += escapeHtml(stack[i]);
      if (isTop && returnInfo !== undefined) {
        var retDisplay = Array.isArray(returnInfo) ? '[' + returnInfo.join(',') + ']' : String(returnInfo);
        html += ' <span style="color:#16a34a;font-weight:700">= ' + escapeHtml(retDisplay) + '</span>';
      }
      html += '</div>';
    }
    callStackEl.innerHTML = html;
  }

  // ==================== Apply Step ====================

  function findNodeById(node, id) {
    if (node.id === id) return node;
    for (var i = 0; i < node.children.length; i++) {
      var found = findNodeById(node.children[i], id);
      if (found) return found;
    }
    return null;
  }

  function resetAllNodeStatuses(node) {
    node.status = 'pending';
    for (var i = 0; i < node.children.length; i++) {
      resetAllNodeStatuses(node.children[i]);
    }
  }

  function applyStepsUpTo(targetStep) {
    if (!tree) return;
    resetAllNodeStatuses(tree);

    // Mark pruned nodes back to pruned
    markInitialPruned(tree);

    var activeNodeId = null;
    var currentStack = [];
    var returnInfo = undefined;

    for (var i = 0; i < targetStep && i < steps.length; i++) {
      var s = steps[i];
      if (s.type === 'enter') {
        var node = findNodeById(tree, s.nodeId);
        if (node) node.status = 'active';
        activeNodeId = s.nodeId;
        currentStack = s.stack.slice();
        returnInfo = undefined;
      } else if (s.type === 'return') {
        var node = findNodeById(tree, s.nodeId);
        if (node) node.status = 'complete';
        currentStack = s.stack.slice();
        returnInfo = s.returnValue;
        // The active one is now the parent (top of remaining stack)
      } else if (s.type === 'pruned') {
        var node = findNodeById(tree, s.nodeId);
        if (node) node.status = 'pruned';
        currentStack = s.stack ? s.stack.slice() : [];
        returnInfo = s.returnValue;
      }
    }

    // Determine current depth
    var currentDepthVal = 0;
    if (targetStep > 0 && targetStep <= steps.length) {
      var lastStep = steps[targetStep - 1];
      if (lastStep.depth !== undefined) currentDepthVal = lastStep.depth;
      else if (lastStep.stack) currentDepthVal = lastStep.stack.length - 1;
    }

    // Count completed calls
    var completedCalls = 0;
    for (var i = 0; i < targetStep; i++) {
      if (steps[i].type === 'return' || steps[i].type === 'pruned') completedCalls++;
    }

    depthStat.textContent = Math.max(0, currentDepthVal);
    callsStat.textContent = completedCalls;
    stepStat.textContent = targetStep + ' / ' + steps.length;

    renderCallStack(currentStack, returnInfo);
    renderTree();
  }

  function markInitialPruned(node) {
    // After tree build, some nodes were marked as pruned during construction.
    // We need to know which were originally pruned.
    // Store this info in node._originallyPruned
    if (node._originallyPruned) {
      // Keep it, will be managed in applyStepsUpTo
    }
    for (var i = 0; i < node.children.length; i++) {
      markInitialPruned(node.children[i]);
    }
  }

  // ==================== Build & Init ====================

  function buildTree() {
    totalCalls = 0;
    maxDepth = 0;

    var n = parseInt(nInput.value) || 0;
    var algo = algoSelect.value;

    // Clamp n
    var maxN = { fibonacci: 10, factorial: 12, power: 15, hanoi: 5, mergesort: 8 };
    var clampMax = maxN[algo] || 10;
    if (n < 0) n = 0;
    if (n > clampMax) {
      n = clampMax;
      nInput.value = n;
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Max n=' + clampMax + ' for ' + algo, 'warning');
      }
    }

    var useMemo = memoToggle.checked && algo === 'fibonacci';

    switch (algo) {
      case 'fibonacci':
        tree = buildFibTree(n, 0, useMemo ? new Map() : null);
        break;
      case 'factorial':
        tree = buildFactTree(n, 0);
        break;
      case 'power':
        tree = buildPowerTree(2, n, 0);
        break;
      case 'hanoi':
        tree = buildHanoiTree(n, 'A', 'C', 'B', 0);
        break;
      case 'mergesort':
        // Generate random array of size n
        var arr = [];
        for (var i = 0; i < Math.max(n, 2); i++) {
          arr.push(Math.floor(Math.random() * 50) + 1);
        }
        tree = buildMergeSortTree(arr, 0);
        break;
    }

    // Mark originally pruned nodes
    markOriginalPruned(tree);

    // Layout
    computeWidths(tree);
    assignPositions(tree, 0, 0);

    // Generate steps
    steps = [];
    generateSteps(tree, steps, []);

    currentStep = 0;
  }

  function markOriginalPruned(node) {
    if (node.status === 'pruned') {
      node._originallyPruned = true;
    }
    for (var i = 0; i < node.children.length; i++) {
      markOriginalPruned(node.children[i]);
    }
  }

  // ==================== Playback ====================

  function getDelay() {
    var speed = parseInt(speedSlider.value) || 5;
    // speed 1 = 1500ms, speed 10 = 100ms
    return 1600 - speed * 150;
  }

  function play() {
    if (currentStep >= steps.length) {
      // Restart
      currentStep = 0;
    }

    isPlaying = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stepBtn.disabled = true;

    function tick() {
      if (!isPlaying || currentStep >= steps.length) {
        stop();
        return;
      }
      currentStep++;
      applyStepsUpTo(currentStep);
      playTimer = setTimeout(tick, getDelay());
    }
    tick();
  }

  function pause() {
    isPlaying = false;
    clearTimeout(playTimer);
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = false;
  }

  function stop() {
    isPlaying = false;
    clearTimeout(playTimer);
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = false;

    if (currentStep >= steps.length) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Execution complete!', 'success');
      }
    }
  }

  function stepForward() {
    if (currentStep >= steps.length) return;
    currentStep++;
    applyStepsUpTo(currentStep);
  }

  function reset() {
    pause();
    buildTree();

    treeEmpty.style.display = 'none';
    treeScroll.style.display = 'block';

    applyStepsUpTo(0);
    depthStat.textContent = '0';
    callsStat.textContent = '0';
    stepStat.textContent = '0 / ' + steps.length;
    callStackEl.innerHTML = '<div class="rc-stack-empty">Empty</div>';
    renderTree();
  }

  // ==================== Event Listeners ====================

  playBtn.addEventListener('click', function() {
    if (!tree) {
      reset();
    }
    if (tree) {
      treeEmpty.style.display = 'none';
      treeScroll.style.display = 'block';
      play();
    }
  });

  pauseBtn.addEventListener('click', pause);

  stepBtn.addEventListener('click', function() {
    if (!tree) {
      reset();
    }
    if (tree) {
      treeEmpty.style.display = 'none';
      treeScroll.style.display = 'block';
      stepForward();
    }
  });

  resetBtn.addEventListener('click', reset);

  speedSlider.addEventListener('input', function() {
    speedLabel.textContent = speedSlider.value + 'x';
  });

  algoSelect.addEventListener('change', function() {
    // Show/hide memo toggle
    memoToggleWrap.style.display = algoSelect.value === 'fibonacci' ? 'flex' : 'none';

    // Set default n values
    var defaults = { fibonacci: 5, factorial: 5, power: 6, hanoi: 3, mergesort: 6 };
    nInput.value = defaults[algoSelect.value] || 5;

    // Auto-reset if tree is built
    if (tree) reset();
  });

  // ==================== Init ====================
  memoToggleWrap.style.display = algoSelect.value === 'fibonacci' ? 'flex' : 'none';
  speedLabel.textContent = speedSlider.value + 'x';

})();
