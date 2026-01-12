/**
 * KVSOVANREACH Font Pairing Playground Tool
 * Test and preview Google Font pairings
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    codeFormat: 'import'
  };

  // ==================== DOM Elements ====================
  const elements = {
    headingFont: document.getElementById('headingFont'),
    bodyFont: document.getElementById('bodyFont'),
    articlePreview: document.getElementById('articlePreview'),
    codeOutput: document.getElementById('codeOutput'),
    codeTabs: document.querySelectorAll('.code-tab'),
    pairingBtns: document.querySelectorAll('.pairing-btn'),
    copyCodeBtn: document.getElementById('copyCodeBtn')
  };

  // ==================== Font Loading ====================

  function loadGoogleFont(fontName) {
    const linkId = `font-${fontName.replace(/\s+/g, '-')}`;

    // Check if already loaded
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // ==================== Core Functions ====================

  function updatePreview() {
    loadGoogleFont(state.headingFont);
    loadGoogleFont(state.bodyFont);

    // Update heading elements
    const headings = elements.articlePreview.querySelectorAll('.preview-h1, .preview-h2, .preview-h3');
    headings.forEach(h => {
      h.style.fontFamily = `'${state.headingFont}', serif`;
    });

    // Update body elements
    const bodyElements = elements.articlePreview.querySelectorAll('.preview-body, .preview-meta, .preview-list, .preview-quote');
    bodyElements.forEach(el => {
      el.style.fontFamily = `'${state.bodyFont}', sans-serif`;
    });

    updateCodeOutput();
  }

  function updateCodeOutput() {
    const headingEncoded = encodeURIComponent(state.headingFont);
    const bodyEncoded = encodeURIComponent(state.bodyFont);

    let code = '';

    if (state.codeFormat === 'import') {
      code = `/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=${headingEncoded}:wght@400;600;700&family=${bodyEncoded}:wght@400;500&display=swap');

/* CSS Variables */
:root {
  --font-heading: '${state.headingFont}', serif;
  --font-body: '${state.bodyFont}', sans-serif;
}

/* Usage */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body, p {
  font-family: var(--font-body);
}`;
    } else {
      code = `<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${headingEncoded}:wght@400;600;700&family=${bodyEncoded}:wght@400;500&display=swap" rel="stylesheet">

<style>
  h1, h2, h3 { font-family: '${state.headingFont}', serif; }
  body, p { font-family: '${state.bodyFont}', sans-serif; }
</style>`;
    }

    elements.codeOutput.textContent = code;
  }

  // ==================== Event Handlers ====================

  function handleFontChange() {
    state.headingFont = elements.headingFont.value;
    state.bodyFont = elements.bodyFont.value;
    updatePreview();
  }

  function handlePairingClick(e) {
    const btn = e.target.closest('.pairing-btn');
    if (!btn) return;

    state.headingFont = btn.dataset.heading;
    state.bodyFont = btn.dataset.body;

    elements.headingFont.value = state.headingFont;
    elements.bodyFont.value = state.bodyFont;

    updatePreview();
    ToolsCommon.Toast.show('Font pairing applied!', 'success');
  }

  function handleCodeTabClick(e) {
    const tab = e.target.closest('.code-tab');
    if (!tab) return;

    elements.codeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    state.codeFormat = tab.dataset.format;
    updateCodeOutput();
  }

  async function handleCopyCode() {
    const code = elements.codeOutput.textContent;
    await ToolsCommon.Clipboard.copyWithToast(code, 'Code copied!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      handleCopyCode();
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    updatePreview();
  }

  function setupEventListeners() {
    // Font selects
    elements.headingFont?.addEventListener('change', handleFontChange);
    elements.bodyFont?.addEventListener('change', handleFontChange);

    // Pairing buttons
    elements.pairingBtns.forEach(btn => {
      btn.addEventListener('click', handlePairingClick);
    });

    // Code tabs
    elements.codeTabs.forEach(tab => {
      tab.addEventListener('click', handleCodeTabClick);
    });

    // Copy button
    elements.copyCodeBtn?.addEventListener('click', handleCopyCode);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
