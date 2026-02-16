/**
 * Git Graph Explorer
 */
(function() {
  'use strict';

  const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
  const state = {
    commits: [],
    branches: { main: { color: COLORS[0], head: null } },
    currentBranch: 'main',
    commitCount: 0
  };

  const elements = {
    graphCanvas: document.getElementById('graphCanvas'),
    branchesList: document.getElementById('branchesList'),
    commitsList: document.getElementById('commitsList'),
    commitBtn: document.getElementById('commitBtn'),
    branchBtn: document.getElementById('branchBtn'),
    mergeBtn: document.getElementById('mergeBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn')
  };

  function generateHash() {
    return Math.random().toString(16).substr(2, 7);
  }

  function commit(message) {
    const hash = generateHash();
    const parentHash = state.branches[state.currentBranch].head;

    const c = {
      hash,
      message: message || `Commit ${++state.commitCount}`,
      branch: state.currentBranch,
      parent: parentHash,
      timestamp: Date.now()
    };

    state.commits.push(c);
    state.branches[state.currentBranch].head = hash;
    updateUI();
    ToolsCommon.Toast.show(`Committed: ${hash}`, 'success');
  }

  function branch() {
    const name = prompt('Branch name:');
    if (!name || state.branches[name]) {
      ToolsCommon.Toast.show('Invalid branch name', 'error');
      return;
    }

    const colorIndex = Object.keys(state.branches).length % COLORS.length;
    state.branches[name] = {
      color: COLORS[colorIndex],
      head: state.branches[state.currentBranch].head
    };

    state.currentBranch = name;
    updateUI();
    ToolsCommon.Toast.show(`Created branch: ${name}`, 'success');
  }

  function merge() {
    const branchNames = Object.keys(state.branches).filter(b => b !== state.currentBranch);
    if (branchNames.length === 0) {
      ToolsCommon.Toast.show('No other branches to merge', 'error');
      return;
    }

    const sourceBranch = prompt(`Merge which branch into ${state.currentBranch}?\n${branchNames.join(', ')}`);
    if (!sourceBranch || !state.branches[sourceBranch]) {
      ToolsCommon.Toast.show('Invalid branch', 'error');
      return;
    }

    commit(`Merge ${sourceBranch} into ${state.currentBranch}`);
    ToolsCommon.Toast.show(`Merged ${sourceBranch}`, 'success');
  }

  function checkout() {
    const branchNames = Object.keys(state.branches);
    const target = prompt(`Checkout to:\n${branchNames.join(', ')}`);
    if (!target || !state.branches[target]) {
      ToolsCommon.Toast.show('Invalid branch', 'error');
      return;
    }

    state.currentBranch = target;
    updateUI();
    ToolsCommon.Toast.show(`Checked out: ${target}`, 'success');
  }

  function reset() {
    state.commits = [];
    state.branches = { main: { color: COLORS[0], head: null } };
    state.currentBranch = 'main';
    state.commitCount = 0;
    updateUI();
    ToolsCommon.Toast.show('Repository reset');
  }

  function updateUI() {
    drawGraph();
    renderBranches();
    renderCommits();
  }

  function drawGraph() {
    const canvas = elements.graphCanvas;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    const width = Math.min(container.clientWidth - 32, 700);
    const height = 280;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
    ctx.fillRect(0, 0, width, height);

    if (state.commits.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Create commits to see the graph', width / 2, height / 2);
      return;
    }

    const branchNames = Object.keys(state.branches);
    const branchY = {};
    branchNames.forEach((name, i) => {
      branchY[name] = 40 + i * 50;
    });

    const commitX = {};
    const nodeRadius = 12;
    const gap = 80;

    // Position commits
    state.commits.forEach((c, i) => {
      commitX[c.hash] = 50 + i * gap;
    });

    // Draw branch lines
    branchNames.forEach(name => {
      const branchCommits = state.commits.filter(c => c.branch === name);
      if (branchCommits.length === 0) return;

      ctx.strokeStyle = state.branches[name].color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const first = branchCommits[0];
      const last = branchCommits[branchCommits.length - 1];

      // Find start point
      let startX = commitX[first.hash];
      if (first.parent && commitX[first.parent]) {
        startX = commitX[first.parent];
      }

      ctx.moveTo(startX, branchY[name]);
      ctx.lineTo(commitX[last.hash], branchY[name]);
      ctx.stroke();
    });

    // Draw parent connections
    state.commits.forEach(c => {
      if (c.parent && commitX[c.parent]) {
        const parentCommit = state.commits.find(pc => pc.hash === c.parent);
        if (parentCommit && parentCommit.branch !== c.branch) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(commitX[c.parent], branchY[parentCommit.branch]);
          ctx.lineTo(commitX[c.hash], branchY[c.branch]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });

    // Draw commit nodes
    state.commits.forEach(c => {
      const x = commitX[c.hash];
      const y = branchY[c.branch];

      ctx.fillStyle = state.branches[c.branch].color;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Hash label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#1e293b';
      ctx.font = '9px "Fira Code"';
      ctx.textAlign = 'center';
      ctx.fillText(c.hash.slice(0, 5), x, y + nodeRadius + 14);
    });

    // Branch labels
    branchNames.forEach(name => {
      ctx.fillStyle = state.branches[name].color;
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(name + (name === state.currentBranch ? ' *' : ''), 10, branchY[name] + 4);
    });
  }

  function renderBranches() {
    const html = Object.entries(state.branches).map(([name, info]) => `
      <div class="branch-tag ${name === state.currentBranch ? 'active' : ''}" data-branch="${name}">
        <span class="branch-color" style="background-color: ${info.color}"></span>
        <span>${name}</span>
        ${name === state.currentBranch ? '<i class="fa-solid fa-check"></i>' : ''}
      </div>
    `).join('');
    elements.branchesList.innerHTML = html;

    elements.branchesList.querySelectorAll('.branch-tag').forEach(el => {
      el.addEventListener('click', () => {
        state.currentBranch = el.dataset.branch;
        updateUI();
        ToolsCommon.Toast.show(`Switched to ${el.dataset.branch}`);
      });
    });
  }

  function renderCommits() {
    if (state.commits.length === 0) {
      elements.commitsList.innerHTML = '<div style="text-align:center;color:var(--color-text-muted);font-size:var(--font-size-sm);">No commits yet</div>';
      return;
    }

    const html = [...state.commits].reverse().map(c => `
      <div class="commit-item">
        <span class="commit-hash">${c.hash}</span>
        <span class="commit-message">${c.message}</span>
        <span class="commit-branch">${c.branch}</span>
      </div>
    `).join('');
    elements.commitsList.innerHTML = html;
  }

  function exportDiagram() {
    elements.graphCanvas.toBlob(blob => {
      if (blob) {
        ToolsCommon.FileDownload.blob(blob, 'git-graph.png');
        ToolsCommon.Toast.show('Exported!', 'success');
      }
    }, 'image/png');
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key.toLowerCase() === 'c') commit();
    if (e.key.toLowerCase() === 'b') branch();
  }

  function init() {
    elements.commitBtn.addEventListener('click', () => commit());
    elements.branchBtn.addEventListener('click', branch);
    elements.mergeBtn.addEventListener('click', merge);
    elements.checkoutBtn.addEventListener('click', checkout);
    elements.resetBtn.addEventListener('click', reset);
    elements.exportBtn.addEventListener('click', exportDiagram);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', ToolsCommon.debounce(drawGraph, 200));

    // Initial commits
    commit('Initial commit');
    commit('Add feature');
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
