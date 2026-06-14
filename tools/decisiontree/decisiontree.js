/**
 * KVSOVANREACH Decision Tree Builder
 * Interactive decision tree builder and visualizer
 */

(function() {
  'use strict';

  // DOM Elements
  const treeView = document.getElementById('treeView');
  const treeEmpty = document.getElementById('treeEmpty');
  const treeScroll = document.getElementById('treeScroll');
  const presetSelect = document.getElementById('presetSelect');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const walkBtn = document.getElementById('walkBtn');
  const walkPanel = document.getElementById('walkPanel');
  const walkCloseBtn = document.getElementById('walkCloseBtn');
  const walkQuestion = document.getElementById('walkQuestion');
  const walkButtons = document.getElementById('walkButtons');
  const walkResult = document.getElementById('walkResult');
  const walkRestartBtn = document.getElementById('walkRestartBtn');
  const addRootBtn = document.getElementById('addRootBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');

  // Modal elements
  const nodeModal = document.getElementById('nodeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalSaveBtn = document.getElementById('modalSaveBtn');
  const nodeTypeSelect = document.getElementById('nodeTypeSelect');
  const nodeTextInput = document.getElementById('nodeTextInput');
  const nodeTextLabel = document.getElementById('nodeTextLabel');
  const outcomeColorGroup = document.getElementById('outcomeColorGroup');
  const colorSwatches = document.querySelectorAll('.dt-color-swatch');

  // State
  let tree = null; // Root node: { id, type, text, color?, yes?, no? }
  let nextId = 0;
  let editingNode = null; // node being edited
  let editCallback = null;

  // Presets
  const presets = {
    outside: {
      id: 0, type: 'question', text: 'Is it raining?',
      yes: {
        id: 1, type: 'question', text: 'Do you have an umbrella?',
        yes: { id: 2, type: 'outcome', text: 'Go outside with umbrella!', color: '#10b981' },
        no: {
          id: 3, type: 'question', text: 'Is it important?',
          yes: { id: 4, type: 'outcome', text: 'Go out, get wet.', color: '#f59e0b' },
          no: { id: 5, type: 'outcome', text: 'Stay home and relax.', color: '#3b82f6' }
        }
      },
      no: {
        id: 6, type: 'question', text: 'Is it too hot (>35C)?',
        yes: { id: 7, type: 'outcome', text: 'Stay in AC, go out evening.', color: '#f59e0b' },
        no: { id: 8, type: 'outcome', text: 'Perfect! Go outside!', color: '#10b981' }
      },
      _nextId: 9
    },
    bugtriage: {
      id: 0, type: 'question', text: 'Can you reproduce the bug?',
      yes: {
        id: 1, type: 'question', text: 'Does it crash the app?',
        yes: { id: 2, type: 'outcome', text: 'P0 - Critical. Fix immediately!', color: '#ef4444' },
        no: {
          id: 3, type: 'question', text: 'Does it affect many users?',
          yes: { id: 4, type: 'outcome', text: 'P1 - High priority. Fix this sprint.', color: '#f59e0b' },
          no: { id: 5, type: 'outcome', text: 'P2 - Medium. Schedule for next sprint.', color: '#3b82f6' }
        }
      },
      no: {
        id: 6, type: 'question', text: 'Is there a workaround?',
        yes: { id: 7, type: 'outcome', text: 'P3 - Low. Add to backlog.', color: '#8b5cf6' },
        no: { id: 8, type: 'outcome', text: 'P2 - Investigate further, gather logs.', color: '#f59e0b' }
      },
      _nextId: 9
    },
    pet: {
      id: 0, type: 'question', text: 'Do you have a large living space?',
      yes: {
        id: 1, type: 'question', text: 'Are you active/outdoorsy?',
        yes: { id: 2, type: 'outcome', text: 'Get a Dog!', color: '#f59e0b' },
        no: { id: 3, type: 'outcome', text: 'Get a Cat!', color: '#8b5cf6' }
      },
      no: {
        id: 4, type: 'question', text: 'Do you want a cuddly pet?',
        yes: {
          id: 5, type: 'question', text: 'Allergic to fur?',
          yes: { id: 6, type: 'outcome', text: 'Get a Rabbit!', color: '#ec4899' },
          no: { id: 7, type: 'outcome', text: 'Get a Hamster!', color: '#10b981' }
        },
        no: { id: 8, type: 'outcome', text: 'Get a Fish!', color: '#3b82f6' }
      },
      _nextId: 9
    },
    techstack: {
      id: 0, type: 'question', text: 'Is this a web application?',
      yes: {
        id: 1, type: 'question', text: 'Do you need SSR/SEO?',
        yes: {
          id: 2, type: 'question', text: 'Prefer React ecosystem?',
          yes: { id: 3, type: 'outcome', text: 'Use Next.js + React', color: '#3b82f6' },
          no: { id: 4, type: 'outcome', text: 'Use Nuxt.js + Vue', color: '#10b981' }
        },
        no: {
          id: 5, type: 'question', text: 'Need real-time features?',
          yes: { id: 6, type: 'outcome', text: 'Use SvelteKit + WebSockets', color: '#f59e0b' },
          no: { id: 7, type: 'outcome', text: 'Use Vite + React SPA', color: '#8b5cf6' }
        }
      },
      no: {
        id: 8, type: 'question', text: 'Is it a mobile app?',
        yes: {
          id: 9, type: 'question', text: 'Need native performance?',
          yes: { id: 10, type: 'outcome', text: 'Use Swift / Kotlin', color: '#ef4444' },
          no: { id: 11, type: 'outcome', text: 'Use React Native or Flutter', color: '#3b82f6' }
        },
        no: { id: 12, type: 'outcome', text: 'Use Python or Go for backend/CLI', color: '#10b981' }
      },
      _nextId: 13
    }
  };

  // Render tree
  function renderTree() {
    if (!tree) {
      treeView.innerHTML = '';
      treeView.appendChild(createEmptyState());
      return;
    }

    treeView.innerHTML = '';
    const nodeEl = buildNodeDOM(tree);
    treeView.appendChild(nodeEl);
  }

  function createEmptyState() {
    const div = document.createElement('div');
    div.className = 'dt-tree-empty';
    div.id = 'treeEmpty';
    div.innerHTML = '<i class="fa-solid fa-sitemap"></i><p>No tree yet. Load a preset or click below to start.</p>';
    const btn = document.createElement('button');
    btn.className = 'dt-btn dt-btn-primary';
    btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Root Question';
    btn.addEventListener('click', () => openModal(null, 'root'));
    div.appendChild(btn);
    return div;
  }

  function buildNodeDOM(node) {
    const group = document.createElement('div');
    group.className = 'dt-node-group';

    // Node card
    const nodeEl = document.createElement('div');
    const isOutcome = node.type === 'outcome';
    nodeEl.className = 'dt-node ' + (isOutcome ? 'dt-node-outcome' : 'dt-node-question');
    if (isOutcome && node.color) {
      nodeEl.style.borderLeftColor = node.color;
    }
    nodeEl.dataset.id = node.id;

    // Icon
    const icon = document.createElement('div');
    icon.className = 'dt-node-icon';
    icon.innerHTML = isOutcome
      ? '<i class="fa-solid fa-flag-checkered"></i>'
      : '<i class="fa-solid fa-circle-question"></i>';
    nodeEl.appendChild(icon);

    // Text
    const text = document.createElement('div');
    text.className = 'dt-node-text';
    text.textContent = node.text;
    if (isOutcome && node.color) {
      text.style.color = node.color;
    }
    nodeEl.appendChild(text);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'dt-node-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'dt-node-action-btn edit-btn';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(node, 'edit');
    });
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'dt-node-action-btn';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(node.id);
    });
    actions.appendChild(delBtn);

    nodeEl.appendChild(actions);
    group.appendChild(nodeEl);

    // Branches for question nodes
    if (!isOutcome) {
      const branches = document.createElement('div');
      branches.className = 'dt-branches';

      // Yes branch
      const yesBranch = document.createElement('div');
      yesBranch.className = 'dt-branch';
      const yesLine = document.createElement('div');
      yesLine.className = 'dt-branch-line';
      yesBranch.appendChild(yesLine);
      const yesLabel = document.createElement('span');
      yesLabel.className = 'dt-branch-label yes';
      yesLabel.textContent = 'YES';
      yesBranch.appendChild(yesLabel);

      if (node.yes) {
        yesBranch.appendChild(buildNodeDOM(node.yes));
      } else {
        const addBtn = createAddButton(node, 'yes');
        yesBranch.appendChild(addBtn);
      }
      branches.appendChild(yesBranch);

      // No branch
      const noBranch = document.createElement('div');
      noBranch.className = 'dt-branch';
      const noLine = document.createElement('div');
      noLine.className = 'dt-branch-line';
      noBranch.appendChild(noLine);
      const noLabel = document.createElement('span');
      noLabel.className = 'dt-branch-label no';
      noLabel.textContent = 'NO';
      noBranch.appendChild(noLabel);

      if (node.no) {
        noBranch.appendChild(buildNodeDOM(node.no));
      } else {
        const addBtn = createAddButton(node, 'no');
        noBranch.appendChild(addBtn);
      }
      branches.appendChild(noBranch);

      group.appendChild(branches);
    }

    return group;
  }

  function createAddButton(parentNode, branch) {
    const btn = document.createElement('button');
    btn.className = 'dt-add-child';
    btn.title = 'Add ' + branch + ' child';
    btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(null, 'add', parentNode, branch);
    });
    return btn;
  }

  // Node operations
  function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    if (root.yes) {
      const found = findNodeById(root.yes, id);
      if (found) return found;
    }
    if (root.no) {
      const found = findNodeById(root.no, id);
      if (found) return found;
    }
    return null;
  }

  function findParent(root, childId) {
    if (!root) return null;
    if (root.yes && root.yes.id === childId) return { node: root, branch: 'yes' };
    if (root.no && root.no.id === childId) return { node: root, branch: 'no' };
    if (root.yes) {
      const found = findParent(root.yes, childId);
      if (found) return found;
    }
    if (root.no) {
      const found = findParent(root.no, childId);
      if (found) return found;
    }
    return null;
  }

  function deleteNode(id) {
    if (!tree) return;

    if (tree.id === id) {
      tree = null;
      renderTree();
      ToolsCommon.showToast('Root node deleted', 'info');
      return;
    }

    const parent = findParent(tree, id);
    if (parent) {
      parent.node[parent.branch] = null;
      renderTree();
      ToolsCommon.showToast('Node deleted', 'info');
    }
  }

  // Modal management
  let modalMode = 'add'; // 'add', 'edit', 'root'
  let modalParentNode = null;
  let modalBranch = null;
  let selectedColor = '#10b981';

  function openModal(node, modeStr, parent, branch) {
    modalMode = modeStr;
    editingNode = node;
    modalParentNode = parent || null;
    modalBranch = branch || null;

    if (modeStr === 'edit' && node) {
      modalTitle.textContent = 'Edit Node';
      nodeTypeSelect.value = node.type;
      nodeTextInput.value = node.text;
      selectedColor = node.color || '#10b981';
    } else {
      modalTitle.textContent = 'Add Node';
      nodeTypeSelect.value = 'question';
      nodeTextInput.value = '';
      selectedColor = '#10b981';
    }

    updateModalType();
    updateColorSwatches();
    nodeModal.style.display = 'flex';
    nodeTextInput.focus();
  }

  function closeModal() {
    nodeModal.style.display = 'none';
    editingNode = null;
    modalParentNode = null;
    modalBranch = null;
  }

  function updateModalType() {
    const isOutcome = nodeTypeSelect.value === 'outcome';
    nodeTextLabel.textContent = isOutcome ? 'Outcome Text' : 'Question';
    nodeTextInput.placeholder = isOutcome ? 'Enter outcome...' : 'Enter question...';
    outcomeColorGroup.style.display = isOutcome ? 'block' : 'none';
  }

  function updateColorSwatches() {
    colorSwatches.forEach(sw => {
      sw.classList.toggle('active', sw.dataset.color === selectedColor);
    });
  }

  function saveModal() {
    const text = nodeTextInput.value.trim();
    if (!text) {
      ToolsCommon.showToast('Please enter text', 'error');
      return;
    }

    const type = nodeTypeSelect.value;
    const color = type === 'outcome' ? selectedColor : undefined;

    if (modalMode === 'edit' && editingNode) {
      editingNode.type = type;
      editingNode.text = text;
      editingNode.color = color;
      // If changed from question to outcome, remove children
      if (type === 'outcome') {
        delete editingNode.yes;
        delete editingNode.no;
      }
      ToolsCommon.showToast('Node updated', 'success');
    } else if (modalMode === 'root') {
      tree = { id: nextId++, type, text, color };
      ToolsCommon.showToast('Root node created', 'success');
    } else if (modalMode === 'add' && modalParentNode && modalBranch) {
      const newNode = { id: nextId++, type, text, color };
      modalParentNode[modalBranch] = newNode;
      ToolsCommon.showToast('Node added', 'success');
    }

    closeModal();
    renderTree();
  }

  // Modal events
  nodeTypeSelect.addEventListener('change', updateModalType);
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalSaveBtn.addEventListener('click', saveModal);
  nodeTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveModal();
  });

  colorSwatches.forEach(sw => {
    sw.addEventListener('click', () => {
      selectedColor = sw.dataset.color;
      updateColorSwatches();
    });
  });

  nodeModal.addEventListener('click', (e) => {
    if (e.target === nodeModal) closeModal();
  });

  // Walk-through mode
  let walkCurrentNode = null;

  function startWalk() {
    if (!tree) {
      ToolsCommon.showToast('No tree to walk through', 'error');
      return;
    }
    walkCurrentNode = tree;
    walkPanel.style.display = 'block';
    walkResult.style.display = 'none';
    walkRestartBtn.style.display = 'none';
    highlightNode(tree.id);
    showWalkStep();
  }

  function showWalkStep() {
    if (!walkCurrentNode) return;

    if (walkCurrentNode.type === 'outcome') {
      walkQuestion.textContent = '';
      walkButtons.innerHTML = '';
      walkResult.style.display = 'block';
      walkResult.textContent = walkCurrentNode.text;
      walkResult.style.background = walkCurrentNode.color ? walkCurrentNode.color + '18' : 'rgba(16,185,129,0.1)';
      walkResult.style.color = walkCurrentNode.color || '#10b981';
      walkResult.style.border = '2px solid ' + (walkCurrentNode.color || '#10b981');
      walkRestartBtn.style.display = 'inline-flex';
      highlightNode(walkCurrentNode.id);
      return;
    }

    walkQuestion.textContent = walkCurrentNode.text;
    walkButtons.innerHTML = '';
    walkResult.style.display = 'none';
    walkRestartBtn.style.display = 'none';

    if (walkCurrentNode.yes) {
      const yesBtn = document.createElement('button');
      yesBtn.className = 'dt-btn dt-walk-btn-yes';
      yesBtn.innerHTML = '<i class="fa-solid fa-check"></i> Yes';
      yesBtn.addEventListener('click', () => {
        walkCurrentNode = walkCurrentNode.yes;
        highlightNode(walkCurrentNode.id);
        showWalkStep();
      });
      walkButtons.appendChild(yesBtn);
    }

    if (walkCurrentNode.no) {
      const noBtn = document.createElement('button');
      noBtn.className = 'dt-btn dt-walk-btn-no';
      noBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> No';
      noBtn.addEventListener('click', () => {
        walkCurrentNode = walkCurrentNode.no;
        highlightNode(walkCurrentNode.id);
        showWalkStep();
      });
      walkButtons.appendChild(noBtn);
    }

    if (!walkCurrentNode.yes && !walkCurrentNode.no) {
      walkQuestion.textContent = 'Dead end - no branches defined.';
      walkRestartBtn.style.display = 'inline-flex';
    }
  }

  function highlightNode(id) {
    document.querySelectorAll('.dt-node').forEach(n => n.classList.remove('highlight'));
    const el = document.querySelector('.dt-node[data-id="' + id + '"]');
    if (el) {
      el.classList.add('highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  function stopWalk() {
    walkPanel.style.display = 'none';
    walkCurrentNode = null;
    document.querySelectorAll('.dt-node').forEach(n => n.classList.remove('highlight'));
  }

  walkBtn.addEventListener('click', startWalk);
  walkCloseBtn.addEventListener('click', stopWalk);
  walkRestartBtn.addEventListener('click', startWalk);

  // Presets
  function loadPreset(name) {
    const p = presets[name];
    if (!p) return;
    tree = JSON.parse(JSON.stringify(p));
    nextId = p._nextId || 20;
    // Clean internal meta
    cleanMeta(tree);
    renderTree();
    stopWalk();
    ToolsCommon.showToast('Loaded preset: ' + presetSelect.options[presetSelect.selectedIndex].text, 'success');
  }

  function cleanMeta(node) {
    if (!node) return;
    delete node._nextId;
    if (node.yes) cleanMeta(node.yes);
    if (node.no) cleanMeta(node.no);
  }

  presetSelect.addEventListener('change', () => {
    if (presetSelect.value) {
      loadPreset(presetSelect.value);
      presetSelect.value = '';
    }
  });

  // Clear
  clearAllBtn.addEventListener('click', () => {
    tree = null;
    nextId = 0;
    stopWalk();
    renderTree();
    ToolsCommon.showToast('Tree cleared', 'info');
  });

  // Export / Import
  function exportJSON() {
    if (!tree) {
      ToolsCommon.showToast('No tree to export', 'error');
      return;
    }
    const data = { tree, nextId };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decision-tree.json';
    a.click();
    URL.revokeObjectURL(url);
    ToolsCommon.showToast('Exported tree as JSON', 'success');
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tree) {
          tree = data.tree;
          nextId = data.nextId || 20;
          renderTree();
          stopWalk();
          ToolsCommon.showToast('Imported tree from JSON', 'success');
        } else {
          ToolsCommon.showToast('Invalid decision tree JSON', 'error');
        }
      } catch (err) {
        ToolsCommon.showToast('Error parsing JSON file', 'error');
      }
    };
    reader.readAsText(file);
  }

  exportBtn.addEventListener('click', exportJSON);
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });

  // Initial render
  renderTree();
})();
