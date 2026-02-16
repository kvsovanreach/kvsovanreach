/**
 * Token Counter Tool
 * Count tokens for LLM models and estimate API costs
 */

(function() {
  'use strict';

  // ==================== Model Pricing (per 1M tokens) ====================
  const modelPricing = {
    'gpt4o': { input: 2.50, output: 10.00, tokensPerChar: 0.25 },
    'gpt4o-mini': { input: 0.15, output: 0.60, tokensPerChar: 0.25 },
    'gpt4-turbo': { input: 10.00, output: 30.00, tokensPerChar: 0.25 },
    'gpt35-turbo': { input: 0.50, output: 1.50, tokensPerChar: 0.25 },
    'claude-opus': { input: 15.00, output: 75.00, tokensPerChar: 0.28 },
    'claude-sonnet': { input: 3.00, output: 15.00, tokensPerChar: 0.28 },
    'claude-haiku': { input: 0.25, output: 1.25, tokensPerChar: 0.28 },
    'gemini-pro': { input: 0.50, output: 1.50, tokensPerChar: 0.25 },
    'gemini-flash': { input: 0.075, output: 0.30, tokensPerChar: 0.25 }
  };

  // ==================== State ====================
  let estimatedTokens = [];

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.token-tab'),
    panels: document.querySelectorAll('.token-panel'),
    modelSelect: document.getElementById('modelSelect'),
    textInput: document.getElementById('textInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    tokenCount: document.getElementById('tokenCount'),
    charCount: document.getElementById('charCount'),
    wordCount: document.getElementById('wordCount'),
    lineCount: document.getElementById('lineCount'),
    inputCost: document.getElementById('inputCost'),
    outputCost: document.getElementById('outputCost'),
    totalCost: document.getElementById('totalCost'),
    tokenDisplay: document.getElementById('tokenDisplay')
  };

  // ==================== Token Estimation ====================
  /**
   * Tokenize text into estimated tokens
   * This is an approximation - actual token counts may vary
   */
  function tokenizeText(text) {
    if (!text) return [];

    const tokens = [];

    // Simple tokenization rules (approximation of BPE-style tokenization)
    // Split by whitespace and punctuation, keeping them as separate tokens
    const regex = /(\s+|[.,!?;:'"()\[\]{}]|[^\s.,!?;:'"()\[\]{}]+)/g;
    const parts = text.match(regex) || [];

    parts.forEach(part => {
      if (/^\s+$/.test(part)) {
        // Whitespace
        tokens.push({ text: part, type: 'whitespace' });
      } else if (part.length <= 4) {
        // Short word/punctuation - likely 1 token
        tokens.push({ text: part, type: 'word' });
      } else {
        // Longer word - split into approximate subword tokens
        const subTokens = splitIntoSubTokens(part);
        tokens.push(...subTokens);
      }
    });

    return tokens;
  }

  function splitIntoSubTokens(word) {
    const tokens = [];
    const avgTokenLength = 4;

    // Approximate subword tokenization
    let remaining = word;
    while (remaining.length > 0) {
      const tokenLength = Math.min(
        avgTokenLength + Math.floor(Math.random() * 2) - 1,
        remaining.length
      );
      tokens.push({
        text: remaining.substring(0, tokenLength),
        type: 'subword'
      });
      remaining = remaining.substring(tokenLength);
    }

    return tokens;
  }

  // ==================== Update Stats ====================
  function updateStats() {
    const text = elements.textInput.value;
    const model = elements.modelSelect.value;

    // Tokenize
    estimatedTokens = tokenizeText(text);
    const tokenTotal = estimatedTokens.filter(t => t.type !== 'whitespace' || t.text === ' ').length;

    // Update counts
    elements.tokenCount.textContent = tokenTotal.toLocaleString();
    elements.charCount.textContent = text.length.toLocaleString();
    elements.wordCount.textContent = (text.trim() ? text.trim().split(/\s+/).length : 0).toLocaleString();
    elements.lineCount.textContent = (text ? text.split('\n').length : 0).toLocaleString();

    // Update costs
    updateCosts(tokenTotal, model);

    // Update visualizer
    updateVisualizer();
  }

  // ==================== Update Costs ====================
  function updateCosts(tokens, model) {
    const pricing = modelPricing[model] || modelPricing['gpt4o'];

    const inputCostPerToken = pricing.input / 1000000;
    const outputCostPerToken = pricing.output / 1000000;

    const inputCost = tokens * inputCostPerToken;
    const outputCost = tokens * outputCostPerToken;
    const totalCost = inputCost + outputCost;

    elements.inputCost.textContent = formatCost(inputCost);
    elements.outputCost.textContent = formatCost(outputCost);
    elements.totalCost.textContent = formatCost(totalCost);
  }

  // ==================== Format Cost ====================
  function formatCost(cost) {
    if (cost < 0.0001) {
      return '$0.0000';
    } else if (cost < 0.01) {
      return '$' + cost.toFixed(4);
    } else if (cost < 1) {
      return '$' + cost.toFixed(3);
    } else {
      return '$' + cost.toFixed(2);
    }
  }

  // ==================== Update Visualizer ====================
  function updateVisualizer() {
    if (estimatedTokens.length === 0) {
      elements.tokenDisplay.innerHTML = `
        <div class="visualizer-placeholder">
          <i class="fa-solid fa-eye"></i>
          <p>Enter text in Counter tab to visualize tokens</p>
        </div>
      `;
      return;
    }

    const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
    let colorIndex = 0;
    let html = '';

    estimatedTokens.forEach((token, i) => {
      const escapedText = escapeHtml(token.text);

      if (token.type === 'whitespace') {
        if (token.text === ' ') {
          html += `<span class="token-chip whitespace">&nbsp;</span>`;
        } else if (token.text.includes('\n')) {
          html += '<br>';
        }
      } else {
        const color = colors[colorIndex % colors.length];
        html += `<span class="token-chip ${color}" title="Token ${i + 1}">${escapedText}</span>`;
        colorIndex++;
      }
    });

    elements.tokenDisplay.innerHTML = html;
  }

  // ==================== Escape HTML ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== Tab Switching ====================
  function switchTab(tab) {
    elements.tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    elements.panels.forEach(p => {
      p.classList.toggle('active', p.id === tab + 'Panel');
    });
  }

  // ==================== Actions ====================
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      elements.textInput.focus();
      updateStats();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.showToast('Failed to paste from clipboard', 'error');
    }
  }

  function clearText() {
    elements.textInput.value = '';
    elements.textInput.focus();
    updateStats();
    ToolsCommon.showToast('Cleared', 'success');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Text input
    elements.textInput.addEventListener('input', ToolsCommon.debounce(updateStats, 100));

    // Model selection
    elements.modelSelect.addEventListener('change', updateStats);

    // Action buttons
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.clearBtn.addEventListener('click', clearText);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('textarea, input, select')) return;

      switch (e.key) {
        case 'Delete':
          e.preventDefault();
          clearText();
          break;
        case '1':
          switchTab('counter');
          break;
        case '2':
          switchTab('visualizer');
          break;
        case '3':
          switchTab('pricing');
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateStats();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
