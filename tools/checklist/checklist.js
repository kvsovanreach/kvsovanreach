/**
 * Checklist Maker Tool
 * Create, manage, and export checklists
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    lists: JSON.parse(localStorage.getItem('checklists')) || [
      { id: 'default', name: 'My List', items: [] }
    ],
    activeListId: 'default',
    editingItemId: null,
    draggedItem: null
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Wrapper
    wrapper: document.querySelector('.checklist-wrapper'),

    // Sidebar
    newListBtn: document.getElementById('newListBtn'),
    listsTabs: document.getElementById('listsTabs'),

    // Add item
    newItemInput: document.getElementById('newItemInput'),
    addItemBtn: document.getElementById('addItemBtn'),

    // Progress
    progressFill: document.getElementById('progressFill'),
    completedCount: document.getElementById('completedCount'),
    totalCount: document.getElementById('totalCount'),

    // Content
    checklistContent: document.getElementById('checklistContent'),
    emptyState: document.getElementById('emptyState'),

    // Actions
    uncheckAllBtn: document.getElementById('uncheckAllBtn'),
    checkAllBtn: document.getElementById('checkAllBtn'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    exportTextBtn: document.getElementById('exportTextBtn'),
    exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),

    // Mobile toggle
    toggleListBtn: document.getElementById('toggleListBtn'),

    // New list modal
    newListModal: document.getElementById('newListModal'),
    closeNewListModal: document.getElementById('closeNewListModal'),
    newListName: document.getElementById('newListName'),
    cancelNewList: document.getElementById('cancelNewList'),
    confirmNewList: document.getElementById('confirmNewList'),

    // Edit item modal
    editItemModal: document.getElementById('editItemModal'),
    closeEditItemModal: document.getElementById('closeEditItemModal'),
    editItemInput: document.getElementById('editItemInput'),
    cancelEditItem: document.getElementById('cancelEditItem'),
    confirmEditItem: document.getElementById('confirmEditItem'),

    // Other
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
    renderLists();
    renderItems();
    updateProgress();
  }

  function initEventListeners() {
    // Add item
    elements.addItemBtn?.addEventListener('click', addItem);
    elements.newItemInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addItem();
    });

    // Header actions
    elements.newListBtn?.addEventListener('click', openNewListModal);
    elements.clearCompletedBtn?.addEventListener('click', clearCompleted);

    // Action buttons
    elements.uncheckAllBtn?.addEventListener('click', uncheckAll);
    elements.checkAllBtn?.addEventListener('click', checkAll);
    elements.exportTextBtn?.addEventListener('click', () => exportList('text'));
    elements.exportMarkdownBtn?.addEventListener('click', () => exportList('markdown'));
    elements.clearAllBtn?.addEventListener('click', clearAll);

    // Mobile toggle
    elements.toggleListBtn?.addEventListener('click', toggleSidebar);

    // New list modal
    elements.closeNewListModal?.addEventListener('click', closeNewListModal);
    elements.cancelNewList?.addEventListener('click', closeNewListModal);
    elements.confirmNewList?.addEventListener('click', createNewList);
    elements.newListName?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') createNewList();
    });

    // Edit item modal
    elements.closeEditItemModal?.addEventListener('click', closeEditItemModal);
    elements.cancelEditItem?.addEventListener('click', closeEditItemModal);
    elements.confirmEditItem?.addEventListener('click', saveEditItem);
    elements.editItemInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEditItem();
    });

    // Close modals on backdrop click
    elements.newListModal?.addEventListener('click', (e) => {
      if (e.target === elements.newListModal) closeNewListModal();
    });
    elements.editItemModal?.addEventListener('click', (e) => {
      if (e.target === elements.editItemModal) closeEditItemModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Mobile Toggle
  // ============================================
  function toggleSidebar() {
    elements.wrapper?.classList.toggle('show-list');
  }

  // ============================================
  // List Management
  // ============================================
  function getActiveList() {
    return state.lists.find(l => l.id === state.activeListId) || state.lists[0];
  }

  function renderLists() {
    if (!elements.listsTabs) return;

    elements.listsTabs.innerHTML = state.lists.map(list => `
      <button type="button" class="list-tab ${list.id === state.activeListId ? 'active' : ''}" data-list-id="${list.id}">
        <span class="tab-name">${escapeHtml(list.name)}</span>
        ${state.lists.length > 1 ? `
          <button type="button" class="delete-tab" data-delete-list="${list.id}" title="Delete list">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : ''}
      </button>
    `).join('');

    // Add event listeners to tabs
    elements.listsTabs.querySelectorAll('.list-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (e.target.closest('.delete-tab')) return;
        switchList(tab.dataset.listId);
      });
    });

    // Add event listeners to delete buttons
    elements.listsTabs.querySelectorAll('.delete-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteList(btn.dataset.deleteList);
      });
    });
  }

  function switchList(listId) {
    state.activeListId = listId;
    renderLists();
    renderItems();
    updateProgress();
    // Close sidebar on mobile after selecting
    elements.wrapper?.classList.remove('show-list');
  }

  function openNewListModal() {
    elements.newListName.value = '';
    elements.newListModal?.classList.add('show');
    elements.newListName?.focus();
  }

  function closeNewListModal() {
    elements.newListModal?.classList.remove('show');
  }

  function createNewList() {
    const name = elements.newListName?.value.trim();
    if (!name) {
      showToast('Please enter a list name', 'error');
      return;
    }

    const newList = {
      id: generateId(),
      name: name,
      items: []
    };

    state.lists.push(newList);
    state.activeListId = newList.id;
    saveLists();
    renderLists();
    renderItems();
    updateProgress();
    closeNewListModal();
    showToast('List created', 'success');
  }

  function deleteList(listId) {
    if (state.lists.length <= 1) {
      showToast('Cannot delete the only list', 'error');
      return;
    }

    const index = state.lists.findIndex(l => l.id === listId);
    if (index === -1) return;

    state.lists.splice(index, 1);

    if (state.activeListId === listId) {
      state.activeListId = state.lists[0].id;
    }

    saveLists();
    renderLists();
    renderItems();
    updateProgress();
    showToast('List deleted', 'success');
  }

  // ============================================
  // Item Management
  // ============================================
  function renderItems() {
    const list = getActiveList();
    if (!list || !elements.checklistContent) return;

    if (list.items.length === 0) {
      elements.emptyState.style.display = 'flex';
      elements.checklistContent.querySelectorAll('.checklist-item').forEach(el => el.remove());
      return;
    }

    elements.emptyState.style.display = 'none';

    const itemsHtml = list.items.map(item => `
      <div class="checklist-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}" draggable="true">
        <i class="fa-solid fa-grip-vertical item-drag"></i>
        <button type="button" class="item-checkbox" data-toggle="${item.id}">
          <i class="fa-solid fa-check"></i>
        </button>
        <span class="item-text">${escapeHtml(item.text)}</span>
        <div class="item-actions">
          <button type="button" class="item-action-btn" data-edit="${item.id}" title="Edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="item-action-btn delete" data-delete="${item.id}" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Remove existing items
    elements.checklistContent.querySelectorAll('.checklist-item').forEach(el => el.remove());

    // Insert new items before empty state
    elements.emptyState.insertAdjacentHTML('beforebegin', itemsHtml);

    // Add event listeners
    elements.checklistContent.querySelectorAll('.item-checkbox').forEach(btn => {
      btn.addEventListener('click', () => toggleItem(btn.dataset.toggle));
    });

    elements.checklistContent.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openEditItemModal(btn.dataset.edit));
    });

    elements.checklistContent.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
    });

    // Add drag and drop
    initDragAndDrop();
  }

  function addItem() {
    const text = elements.newItemInput?.value.trim();
    if (!text) {
      showToast('Please enter an item', 'error');
      return;
    }

    const list = getActiveList();
    list.items.push({
      id: generateId(),
      text: text,
      completed: false
    });

    elements.newItemInput.value = '';
    saveLists();
    renderItems();
    updateProgress();
    showToast('Item added', 'success');
  }

  function toggleItem(itemId) {
    const list = getActiveList();
    const item = list.items.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      saveLists();
      renderItems();
      updateProgress();
    }
  }

  function deleteItem(itemId) {
    const list = getActiveList();
    const index = list.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      list.items.splice(index, 1);
      saveLists();
      renderItems();
      updateProgress();
      showToast('Item deleted', 'success');
    }
  }

  function openEditItemModal(itemId) {
    const list = getActiveList();
    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    state.editingItemId = itemId;
    elements.editItemInput.value = item.text;
    elements.editItemModal?.classList.add('show');
    elements.editItemInput?.focus();
    elements.editItemInput?.select();
  }

  function closeEditItemModal() {
    elements.editItemModal?.classList.remove('show');
    state.editingItemId = null;
  }

  function saveEditItem() {
    const text = elements.editItemInput?.value.trim();
    if (!text) {
      showToast('Please enter item text', 'error');
      return;
    }

    const list = getActiveList();
    const item = list.items.find(i => i.id === state.editingItemId);
    if (item) {
      item.text = text;
      saveLists();
      renderItems();
      closeEditItemModal();
      showToast('Item updated', 'success');
    }
  }

  // ============================================
  // Bulk Actions
  // ============================================
  function checkAll() {
    const list = getActiveList();
    list.items.forEach(item => item.completed = true);
    saveLists();
    renderItems();
    updateProgress();
    showToast('All items checked', 'success');
  }

  function uncheckAll() {
    const list = getActiveList();
    list.items.forEach(item => item.completed = false);
    saveLists();
    renderItems();
    updateProgress();
    showToast('All items unchecked', 'success');
  }

  function clearCompleted() {
    const list = getActiveList();
    const completedCount = list.items.filter(i => i.completed).length;
    if (completedCount === 0) {
      showToast('No completed items to clear', 'error');
      return;
    }

    list.items = list.items.filter(i => !i.completed);
    saveLists();
    renderItems();
    updateProgress();
    showToast(`Cleared ${completedCount} item(s)`, 'success');
  }

  function clearAll() {
    const list = getActiveList();
    if (list.items.length === 0) {
      showToast('List is already empty', 'error');
      return;
    }

    list.items = [];
    saveLists();
    renderItems();
    updateProgress();
    showToast('All items cleared', 'success');
  }

  // ============================================
  // Export
  // ============================================
  function exportList(format) {
    const list = getActiveList();
    if (list.items.length === 0) {
      showToast('Nothing to export', 'error');
      return;
    }

    let content;
    let filename;

    if (format === 'markdown') {
      content = `# ${list.name}\n\n`;
      content += list.items.map(item =>
        `- [${item.completed ? 'x' : ' '}] ${item.text}`
      ).join('\n');
      filename = `${list.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    } else {
      content = `${list.name}\n${'='.repeat(list.name.length)}\n\n`;
      content += list.items.map(item =>
        `[${item.completed ? '✓' : ' '}] ${item.text}`
      ).join('\n');
      filename = `${list.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported successfully', 'success');
  }

  // ============================================
  // Drag and Drop
  // ============================================
  function initDragAndDrop() {
    const items = elements.checklistContent.querySelectorAll('.checklist-item');

    items.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('dragenter', handleDragEnter);
      item.addEventListener('dragleave', handleDragLeave);
      item.addEventListener('drop', handleDrop);
    });
  }

  function handleDragStart(e) {
    state.draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.itemId);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.checklist-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    state.draggedItem = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (this !== state.draggedItem) {
      this.classList.add('drag-over');
    }
  }

  function handleDragLeave() {
    this.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (this === state.draggedItem) return;

    const list = getActiveList();
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = this.dataset.itemId;

    const draggedIndex = list.items.findIndex(i => i.id === draggedId);
    const targetIndex = list.items.findIndex(i => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder items
    const [draggedItem] = list.items.splice(draggedIndex, 1);
    list.items.splice(targetIndex, 0, draggedItem);

    saveLists();
    renderItems();
  }

  // ============================================
  // Progress
  // ============================================
  function updateProgress() {
    const list = getActiveList();
    const total = list.items.length;
    const completed = list.items.filter(i => i.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    if (elements.progressFill) {
      elements.progressFill.style.width = `${percentage}%`;
    }
    if (elements.completedCount) {
      elements.completedCount.textContent = completed;
    }
    if (elements.totalCount) {
      elements.totalCount.textContent = total;
    }
  }

  // ============================================
  // Utility Functions
  // ============================================
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function saveLists() {
    localStorage.setItem('checklists', JSON.stringify(state.lists));
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    // Close modals on Escape
    if (e.key === 'Escape') {
      if (elements.newListModal?.classList.contains('show')) {
        closeNewListModal();
      } else if (elements.editItemModal?.classList.contains('show')) {
        closeEditItemModal();
      } else if (elements.wrapper?.classList.contains('show-list')) {
        elements.wrapper.classList.remove('show-list');
      }
      return;
    }

    // Don't trigger shortcuts when typing in inputs
    if (e.target.matches('input, textarea')) return;

    // Ctrl+N for new list
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openNewListModal();
    }
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
