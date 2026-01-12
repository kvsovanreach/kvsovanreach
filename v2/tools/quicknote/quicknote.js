/**
 * Quick Note Tool
 */

(function() {
  'use strict';

  // ==================== State ====================
  let state = {
    notes: [],
    currentNoteId: null,
    searchQuery: ''
  };

  // ==================== DOM Elements ====================
  const elements = {
    noteWrapper: document.querySelector('.note-wrapper'),
    notesList: document.getElementById('notesList'),
    notesEmpty: document.getElementById('notesEmpty'),
    noteEditor: document.getElementById('noteEditor'),
    noteTitleInput: document.getElementById('noteTitleInput'),
    noteContentInput: document.getElementById('noteContentInput'),
    noteMeta: document.getElementById('noteMeta'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    totalNotes: document.getElementById('totalNotes'),
    totalChars: document.getElementById('totalChars'),
    noteCountBadge: document.getElementById('noteCountBadge'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    toggleListBtn: document.getElementById('toggleListBtn'),
    newNoteBtn: document.getElementById('newNoteBtn'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    deleteNoteBtn: document.getElementById('deleteNoteBtn'),
    confirmModal: document.getElementById('confirmModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn')
  };

  // ==================== Initialization ====================
  function init() {
    loadNotes();
    renderNotesList();
    updateStats();
    bindEvents();

    // If there are notes, select the first one
    if (state.notes.length > 0) {
      selectNote(state.notes[0].id);
    }
  }

  // ==================== Storage ====================
  function loadNotes() {
    try {
      const saved = localStorage.getItem('quickNotes');
      if (saved) {
        state.notes = JSON.parse(saved);
      }
    } catch (e) {
      state.notes = [];
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem('quickNotes', JSON.stringify(state.notes));
    } catch (e) {
      showToast('Failed to save notes');
    }
  }

  // ==================== Notes CRUD ====================
  function createNote() {
    const note = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    state.notes.unshift(note);
    saveNotes();
    renderNotesList();
    selectNote(note.id);
    updateStats();

    elements.noteTitleInput.focus();
  }

  function selectNote(id) {
    state.currentNoteId = id;
    const note = state.notes.find(n => n.id === id);

    if (note) {
      elements.noteTitleInput.value = note.title;
      elements.noteContentInput.value = note.content;
      updateNoteMeta(note);
      updateCharCount();
    }

    // Update active state in list
    const items = elements.notesList.querySelectorAll('.note-item');
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.id === id);
    });
  }

  function saveCurrentNote() {
    if (!state.currentNoteId) {
      createNote();
      return;
    }

    const note = state.notes.find(n => n.id === state.currentNoteId);
    if (!note) return;

    const title = elements.noteTitleInput.value.trim();
    const content = elements.noteContentInput.value;

    // Don't save if empty
    if (!title && !content) {
      showToast('Note is empty');
      return;
    }

    note.title = title || 'Untitled';
    note.content = content;
    note.updatedAt = Date.now();

    saveNotes();
    renderNotesList();
    selectNote(note.id);
    updateStats();

    showToast('Note saved');
  }

  function deleteNote(id) {
    const index = state.notes.findIndex(n => n.id === id);
    if (index === -1) return;

    state.notes.splice(index, 1);
    saveNotes();
    renderNotesList();
    updateStats();

    // Select another note or clear editor
    if (state.notes.length > 0) {
      selectNote(state.notes[0].id);
    } else {
      clearEditor();
    }

    elements.confirmModal.classList.remove('active');
    showToast('Note deleted');
  }

  function clearEditor() {
    state.currentNoteId = null;
    elements.noteTitleInput.value = '';
    elements.noteContentInput.value = '';
    elements.noteMeta.textContent = '';
    updateCharCount();
  }

  // ==================== Rendering ====================
  function renderNotesList() {
    const filteredNotes = filterNotes();

    if (filteredNotes.length === 0) {
      if (state.notes.length === 0) {
        elements.notesList.innerHTML = `
          <div class="notes-empty">
            <i class="fa-solid fa-sticky-note"></i>
            <p>No notes yet</p>
            <span>Click the + button to create your first note</span>
          </div>
        `;
      } else {
        elements.notesList.innerHTML = `
          <div class="notes-empty">
            <i class="fa-solid fa-search"></i>
            <p>No matches found</p>
            <span>Try a different search term</span>
          </div>
        `;
      }
      return;
    }

    elements.notesList.innerHTML = filteredNotes.map(note => `
      <div class="note-item ${note.id === state.currentNoteId ? 'active' : ''}" data-id="${note.id}">
        <div class="note-item-title">${escapeHtml(note.title) || 'Untitled'}</div>
        <div class="note-item-preview">${escapeHtml(note.content) || 'No content'}</div>
        <div class="note-item-date">${formatDate(note.updatedAt)}</div>
      </div>
    `).join('');

    // Bind click events
    const items = elements.notesList.querySelectorAll('.note-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        selectNote(item.dataset.id);
        hideNotesList();
      });
    });
  }

  function filterNotes() {
    if (!state.searchQuery) {
      return state.notes;
    }

    const query = state.searchQuery.toLowerCase();
    return state.notes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }

  function updateNoteMeta(note) {
    const created = formatDate(note.createdAt);
    const updated = formatDate(note.updatedAt);
    elements.noteMeta.textContent = `Created: ${created} | Updated: ${updated}`;
  }

  function updateCharCount() {
    const content = elements.noteContentInput.value;
    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    elements.charCount.textContent = `${charCount.toLocaleString()} character${charCount !== 1 ? 's' : ''}`;
    elements.wordCount.textContent = `${wordCount.toLocaleString()} word${wordCount !== 1 ? 's' : ''}`;
  }

  function updateStats() {
    const noteCount = state.notes.length;
    elements.totalNotes.textContent = noteCount;
    elements.noteCountBadge.textContent = noteCount;
    elements.noteCountBadge.style.display = noteCount > 0 ? 'flex' : 'none';
    const totalChars = state.notes.reduce((sum, note) => sum + note.content.length, 0);
    elements.totalChars.textContent = totalChars.toLocaleString();
  }

  function toggleNotesList() {
    elements.noteWrapper.classList.toggle('show-list');
  }

  function hideNotesList() {
    elements.noteWrapper.classList.remove('show-list');
  }

  // ==================== Utilities ====================
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    }
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Toggle notes list (mobile)
    elements.toggleListBtn.addEventListener('click', toggleNotesList);

    // New note
    elements.newNoteBtn.addEventListener('click', () => {
      createNote();
      hideNotesList();
    });

    // Save note
    elements.saveNoteBtn.addEventListener('click', saveCurrentNote);

    // Delete note
    elements.deleteNoteBtn.addEventListener('click', () => {
      if (state.currentNoteId) {
        elements.confirmModal.classList.add('active');
      }
    });

    // Confirm delete
    elements.confirmDeleteBtn.addEventListener('click', () => {
      if (state.currentNoteId) {
        deleteNote(state.currentNoteId);
      }
    });

    // Cancel delete
    elements.cancelDeleteBtn.addEventListener('click', () => {
      elements.confirmModal.classList.remove('active');
    });

    // Click outside modal to close
    elements.confirmModal.addEventListener('click', (e) => {
      if (e.target === elements.confirmModal) {
        elements.confirmModal.classList.remove('active');
      }
    });

    // Search
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderNotesList();
    });

    // Clear search
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      renderNotesList();
    });

    // Content input - update char count
    elements.noteContentInput.addEventListener('input', updateCharCount);

    // Auto-save on blur
    elements.noteTitleInput.addEventListener('blur', () => {
      if (state.currentNoteId && (elements.noteTitleInput.value || elements.noteContentInput.value)) {
        saveCurrentNote();
      }
    });

    elements.noteContentInput.addEventListener('blur', () => {
      if (state.currentNoteId && (elements.noteTitleInput.value || elements.noteContentInput.value)) {
        saveCurrentNote();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Shortcuts modal
    elements.closeShortcutsBtn.addEventListener('click', () => {
      elements.shortcutsModal.classList.remove('active');
    });

    elements.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === elements.shortcutsModal) {
        elements.shortcutsModal.classList.remove('active');
      }
    });
  }

  function handleKeyboard(e) {
    // Ctrl+N - New note
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      createNote();
      return;
    }

    // Ctrl+S - Save note
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveCurrentNote();
      return;
    }

    // Ctrl+F - Focus search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      elements.searchInput.focus();
      elements.searchInput.select();
      return;
    }

    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
        elements.shortcutsModal.classList.remove('active');
        elements.confirmModal.classList.remove('active');
      }
      return;
    }

    // ? - Show shortcuts
    if (e.key === '?') {
      e.preventDefault();
      elements.shortcutsModal.classList.toggle('active');
      return;
    }

    // Escape - Close modals
    if (e.key === 'Escape') {
      elements.shortcutsModal.classList.remove('active');
      elements.confirmModal.classList.remove('active');
    }
  }

  // ==================== Start ====================
  init();
})();
