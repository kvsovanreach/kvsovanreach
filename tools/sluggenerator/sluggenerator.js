/**
 * KVSOVANREACH Slug Generator
 */

(function() {
  'use strict';

  const state = {
    separator: '-',
    textCase: 'lower',
    removeNumbers: false
  };

  const elements = {};

  function initElements() {
    elements.inputText = document.getElementById('inputText');
    elements.outputSlug = document.getElementById('outputSlug');
    elements.urlPreview = document.getElementById('urlPreview');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.separatorBtns = document.querySelectorAll('.option-btn[data-separator]');
    elements.caseBtns = document.querySelectorAll('.option-btn[data-case]');
    elements.removeNumbers = document.getElementById('removeNumbers');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function generateSlug(text) {
    if (!text.trim()) {
      return '';
    }

    let slug = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim();

    if (state.removeNumbers) {
      slug = slug.replace(/[0-9]/g, '');
    }

    slug = slug.replace(/[\s_-]+/g, state.separator);

    slug = slug.replace(new RegExp(`^${escapeRegex(state.separator)}+|${escapeRegex(state.separator)}+$`, 'g'), '');

    if (state.textCase === 'lower') {
      slug = slug.toLowerCase();
    } else {
      slug = slug.toUpperCase();
    }

    return slug;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function updateOutput() {
    const slug = generateSlug(elements.inputText.value);
    elements.outputSlug.value = slug;
    elements.urlPreview.textContent = slug
      ? `https://example.com/${slug}`
      : 'https://example.com/your-slug-here';
  }

  function copyToClipboard() {
    const slug = elements.outputSlug.value;
    if (!slug) {
      showToast('Nothing to copy', 'error');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(slug).then(() => {
        showToast('Copied!', 'success');
      }).catch(() => {
        fallbackCopy(slug);
      });
    } else {
      fallbackCopy(slug);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Copied!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  function setSeparator(separator) {
    state.separator = separator;
    elements.separatorBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.separator === separator);
    });
    updateOutput();
  }

  function setCase(textCase) {
    state.textCase = textCase;
    elements.caseBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.case === textCase);
    });
    updateOutput();
  }

  function clearAll() {
    elements.inputText.value = '';
    updateOutput();
    elements.inputText.focus();
    showToast('Cleared', 'success');
  }

  function init() {
    initElements();

    elements.inputText.addEventListener('input', updateOutput);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.clearBtn.addEventListener('click', clearAll);

    elements.separatorBtns.forEach(btn => {
      btn.addEventListener('click', () => setSeparator(btn.dataset.separator));
    });

    elements.caseBtns.forEach(btn => {
      btn.addEventListener('click', () => setCase(btn.dataset.case));
    });

    elements.removeNumbers.addEventListener('change', (e) => {
      state.removeNumbers = e.target.checked;
      updateOutput();
    });

    elements.inputText.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
