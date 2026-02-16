/**
 * UUID Generator Tool
 */
(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    version: 4,
    quantity: 1,
    format: 'lowercase',
    includeBraces: false,
    noHyphens: false,
    generatedUUIDs: []
  };

  // ==================== DOM Elements ====================
  const elements = {
    versionTabs: document.querySelectorAll('.version-tab'),
    quantity: document.getElementById('quantity'),
    qtyMinus: document.getElementById('qtyMinus'),
    qtyPlus: document.getElementById('qtyPlus'),
    formatOptions: document.querySelectorAll('input[name="format"]'),
    includeBraces: document.getElementById('includeBraces'),
    noHyphens: document.getElementById('noHyphens'),
    generateBtn: document.getElementById('generateBtn'),
    quickGenerateBtn: document.getElementById('quickGenerateBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    outputList: document.getElementById('outputList'),
    validateInput: document.getElementById('validateInput'),
    validateBtn: document.getElementById('validateBtn'),
    validatorResult: document.getElementById('validatorResult')
  };

  // ==================== UUID Generation ====================
  function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function generateUUIDv1() {
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const clockSeq = Math.random() * 0x3FFF | 0x8000;
    const node = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    return `${timeHex.slice(-8)}-${timeHex.slice(-12, -8)}-1${timeHex.slice(0, 3)}-${clockSeq.toString(16)}-${node}`;
  }

  function generateUUIDv7() {
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const randA = Math.random().toString(16).slice(2, 5);
    const randB = Math.random().toString(16).slice(2, 14);

    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randA}-${(0x8 | (Math.random() * 4 | 0)).toString(16)}${randB.slice(0, 3)}-${randB.slice(3, 15).padEnd(12, '0')}`;
  }

  function generateNilUUID() {
    return '00000000-0000-0000-0000-000000000000';
  }

  function generateUUID(version) {
    switch (version) {
      case 1: return generateUUIDv1();
      case 7: return generateUUIDv7();
      case 'nil': return generateNilUUID();
      case 4:
      default: return generateUUIDv4();
    }
  }

  function formatUUID(uuid) {
    let result = uuid;

    if (state.noHyphens) {
      result = result.replace(/-/g, '');
    }

    if (state.format === 'uppercase') {
      result = result.toUpperCase();
    }

    if (state.includeBraces) {
      result = `{${result}}`;
    }

    return result;
  }

  // ==================== UUID Validation ====================
  function validateUUID(uuid) {
    const cleanUUID = uuid.replace(/[{}]/g, '').trim();

    const patterns = {
      standard: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      noHyphens: /^[0-9a-f]{32}$/i,
      braces: /^\{[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/i
    };

    const isValid = patterns.standard.test(cleanUUID) ||
                    patterns.noHyphens.test(cleanUUID) ||
                    patterns.braces.test(uuid);

    if (!isValid) {
      return { valid: false, version: null, variant: null };
    }

    // Extract version
    const normalizedUUID = cleanUUID.replace(/-/g, '');
    const versionChar = normalizedUUID.charAt(12);
    const version = parseInt(versionChar, 16);

    // Extract variant
    const variantChar = normalizedUUID.charAt(16);
    const variantBits = parseInt(variantChar, 16);
    let variant = 'Unknown';

    if ((variantBits & 0x8) === 0) {
      variant = 'NCS (reserved)';
    } else if ((variantBits & 0xC) === 0x8) {
      variant = 'RFC 4122';
    } else if ((variantBits & 0xE) === 0xC) {
      variant = 'Microsoft (reserved)';
    } else {
      variant = 'Future (reserved)';
    }

    return { valid: true, version, variant };
  }

  // ==================== UI Functions ====================
  function highlightVersion(uuid) {
    // UUID format: xxxxxxxx-xxxx-Vxxx-yxxx-xxxxxxxxxxxx
    // Version digit is at position 14 (0-indexed) after removing braces
    const clean = uuid.replace(/^\{|\}$/g, '');
    const hasBraces = uuid.startsWith('{');
    const hasHyphens = clean.includes('-');

    if (hasHyphens) {
      // Standard format with hyphens
      const parts = clean.split('-');
      if (parts.length === 5 && parts[2].length >= 1) {
        const versionDigit = parts[2][0];
        parts[2] = `<span class="version-highlight">${versionDigit}</span>${parts[2].slice(1)}`;
        const highlighted = parts.join('-');
        return hasBraces ? `{${highlighted}}` : highlighted;
      }
    } else if (clean.length === 32) {
      // No hyphens format - version is at position 12
      const versionDigit = clean[12];
      const highlighted = clean.slice(0, 12) + `<span class="version-highlight">${versionDigit}</span>` + clean.slice(13);
      return hasBraces ? `{${highlighted}}` : highlighted;
    }
    return uuid;
  }

  function renderOutput() {
    if (state.generatedUUIDs.length === 0) {
      elements.outputList.innerHTML = `
        <div class="output-empty">
          <i class="fa-solid fa-fingerprint"></i>
          <p>Click "Generate UUID" to create unique identifiers</p>
        </div>
      `;
      return;
    }

    elements.outputList.innerHTML = state.generatedUUIDs.map((uuid, index) => `
      <div class="uuid-item" data-index="${index}">
        <span class="uuid-value">${highlightVersion(uuid)}</span>
        <button class="uuid-copy-btn" data-index="${index}" title="Copy">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `).join('');
  }

  function animateCopyButton(index) {
    const item = elements.outputList.querySelector(`.uuid-item[data-index="${index}"]`);
    if (item) {
      const btn = item.querySelector('.uuid-copy-btn');
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      item.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
        item.classList.remove('copied');
      }, 1500);
    }
  }

  function showValidationResult(result) {
    elements.validatorResult.classList.add('show');

    if (result.valid) {
      elements.validatorResult.innerHTML = `
        <div class="result-content valid">
          <i class="fa-solid fa-check-circle"></i>
          <span>Valid UUID</span>
        </div>
        <div class="result-details">
          <strong>Version:</strong> ${result.version} |
          <strong>Variant:</strong> ${result.variant}
        </div>
      `;
    } else {
      elements.validatorResult.innerHTML = `
        <div class="result-content invalid">
          <i class="fa-solid fa-times-circle"></i>
          <span>Invalid UUID format</span>
        </div>
      `;
    }
  }

  // ==================== Event Handlers ====================
  function handleGenerate() {
    const newUUIDs = [];
    for (let i = 0; i < state.quantity; i++) {
      const uuid = generateUUID(state.version);
      newUUIDs.push(formatUUID(uuid));
    }
    state.generatedUUIDs = [...newUUIDs, ...state.generatedUUIDs].slice(0, 100);
    renderOutput();
    ToolsCommon.showToast(`Generated ${state.quantity} UUID${state.quantity > 1 ? 's' : ''}`, 'success');
  }

  function handleVersionChange(e) {
    const tab = e.target.closest('.version-tab');
    if (!tab) return;

    elements.versionTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const version = tab.dataset.version;
    state.version = version === 'nil' ? 'nil' : parseInt(version);
  }

  function handleQuantityChange(delta) {
    const newValue = Math.max(1, Math.min(100, state.quantity + delta));
    state.quantity = newValue;
    elements.quantity.value = newValue;
  }

  function handleCopyAll() {
    if (state.generatedUUIDs.length === 0) {
      ToolsCommon.showToast('No UUIDs to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(state.generatedUUIDs.join('\n'), 'All UUIDs copied!');
  }

  function handleCopySingle(index) {
    const uuid = state.generatedUUIDs[index];
    if (uuid) {
      navigator.clipboard.writeText(uuid).then(() => {
        animateCopyButton(index);
        ToolsCommon.showToast('Copied!', 'success');
      });
    }
  }

  function handleQuickGenerate() {
    const uuid = generateUUID(state.version);
    const formattedUUID = formatUUID(uuid);
    navigator.clipboard.writeText(formattedUUID).then(() => {
      state.generatedUUIDs = [formattedUUID, ...state.generatedUUIDs].slice(0, 100);
      renderOutput();
      ToolsCommon.showToast('UUID generated and copied!', 'success');
    });
  }

  function handleValidate() {
    const input = elements.validateInput.value.trim();
    if (!input) {
      ToolsCommon.showToast('Please enter a UUID to validate', 'error');
      return;
    }
    const result = validateUUID(input);
    showValidationResult(result);
  }

  function handleClearAll() {
    state.generatedUUIDs = [];
    renderOutput();
    elements.validatorResult.classList.remove('show');
    elements.validateInput.value = '';
    ToolsCommon.showToast('Cleared', 'success');
  }

  function handleDownload() {
    if (state.generatedUUIDs.length === 0) {
      ToolsCommon.showToast('No UUIDs to download', 'error');
      return;
    }
    ToolsCommon.downloadText(state.generatedUUIDs.join('\n'), `uuids-${Date.now()}.txt`);
    ToolsCommon.showToast('Downloaded!', 'success');
  }

  // ==================== Initialize ====================
  function initEventListeners() {
    // Generate buttons
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.quickGenerateBtn.addEventListener('click', handleQuickGenerate);

    // Action buttons
    elements.clearAllBtn.addEventListener('click', handleClearAll);
    elements.copyAllBtn.addEventListener('click', handleCopyAll);
    elements.downloadBtn.addEventListener('click', handleDownload);

    // Validator
    elements.validateBtn.addEventListener('click', handleValidate);
    elements.validateInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleValidate();
    });

    // Version tabs
    elements.versionTabs.forEach(tab => {
      tab.addEventListener('click', handleVersionChange);
    });

    // Quantity controls
    elements.qtyMinus.addEventListener('click', () => handleQuantityChange(-1));
    elements.qtyPlus.addEventListener('click', () => handleQuantityChange(1));
    elements.quantity.addEventListener('change', (e) => {
      state.quantity = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
      e.target.value = state.quantity;
    });

    // Format options
    elements.formatOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        state.format = e.target.value;
      });
    });

    // Extra options
    elements.includeBraces.addEventListener('change', (e) => {
      state.includeBraces = e.target.checked;
    });
    elements.noHyphens.addEventListener('change', (e) => {
      state.noHyphens = e.target.checked;
    });

    // Output list click delegation
    elements.outputList.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.uuid-copy-btn');
      if (copyBtn) {
        handleCopySingle(parseInt(copyBtn.dataset.index));
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        handleQuickGenerate();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleGenerate();
      } else if (e.key >= '1' && e.key <= '4') {
        const versions = [4, 1, 7, 'nil'];
        const idx = parseInt(e.key) - 1;
        const tab = document.querySelector(`.version-tab[data-version="${versions[idx]}"]`);
        if (tab) tab.click();
      }
    });
  }

  function init() {
    initEventListeners();
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
