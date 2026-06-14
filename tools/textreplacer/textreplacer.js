/**
 * Text Replacer Tool
 * Batch find and replace with multiple rules, regex, and live preview
 */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  const state = {
    rules: [],
    ruleIdCounter: 0,
    undoStack: [],
    redoStack: [],
    maxUndo: 50,
    previewDebounceTimer: null
  };

  // ============================================
  // Presets
  // ============================================
  const presets = {
    smartQuotes: [
      { find: '"([^"]*)"', replace: '\u201c$1\u201d', regex: true, caseSensitive: false, wholeWord: false },
      { find: "'([^']*)'", replace: '\u2018$1\u2019', regex: true, caseSensitive: false, wholeWord: false }
    ],
    doubleSpaces: [
      { find: '  +', replace: ' ', regex: true, caseSensitive: false, wholeWord: false }
    ],
    trailingWhitespace: [
      { find: '[ \\t]+$', replace: '', regex: true, caseSensitive: false, wholeWord: false }
    ],
    htmlEntities: [
      { find: '&amp;', replace: '&', regex: false, caseSensitive: false, wholeWord: false },
      { find: '&lt;', replace: '<', regex: false, caseSensitive: false, wholeWord: false },
      { find: '&gt;', replace: '>', regex: false, caseSensitive: false, wholeWord: false },
      { find: '&quot;', replace: '"', regex: false, caseSensitive: false, wholeWord: false },
      { find: '&#39;', replace: "'", regex: false, caseSensitive: false, wholeWord: false },
      { find: '&nbsp;', replace: ' ', regex: false, caseSensitive: false, wholeWord: false }
    ]
  };

  // ============================================
  // DOM Elements
  // ============================================
  const el = {
    rulesList: document.getElementById('rulesList'),
    addRuleBtn: document.getElementById('addRuleBtn'),
    importRulesBtn: document.getElementById('importRulesBtn'),
    exportRulesBtn: document.getElementById('exportRulesBtn'),
    inputText: document.getElementById('inputText'),
    previewOutput: document.getElementById('previewOutput'),
    previewBadge: document.getElementById('previewBadge'),
    applyBtn: document.getElementById('applyBtn'),
    undoBtn: document.getElementById('undoBtn'),
    redoBtn: document.getElementById('redoBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    fileInput: document.getElementById('fileInput')
  };

  // ============================================
  // Rule Management
  // ============================================
  function createRule(options) {
    var defaults = {
      find: '',
      replace: '',
      caseSensitive: false,
      wholeWord: false,
      regex: false
    };
    var opts = Object.assign({}, defaults, options || {});
    var id = ++state.ruleIdCounter;

    var rule = {
      id: id,
      find: opts.find,
      replace: opts.replace,
      caseSensitive: opts.caseSensitive,
      wholeWord: opts.wholeWord,
      regex: opts.regex,
      matchCount: 0,
      error: null
    };

    state.rules.push(rule);
    renderRule(rule);
    schedulePreview();
    return rule;
  }

  function removeRule(id) {
    state.rules = state.rules.filter(function(r) { return r.id !== id; });
    var card = document.querySelector('.rule-card[data-id="' + id + '"]');
    if (card) card.remove();
    renumberRules();
    schedulePreview();
  }

  function renumberRules() {
    var cards = el.rulesList.querySelectorAll('.rule-card');
    cards.forEach(function(card, index) {
      var num = card.querySelector('.rule-number');
      if (num) num.textContent = '#' + (index + 1);
    });
  }

  function renderRule(rule) {
    var card = document.createElement('div');
    card.className = 'rule-card';
    card.setAttribute('data-id', rule.id);

    card.innerHTML =
      '<div class="rule-card-header">' +
        '<span class="rule-number">#' + state.rules.length + '</span>' +
        '<span class="rule-count" data-count="' + rule.id + '">0 matches</span>' +
        '<button type="button" class="rule-remove-btn" title="Remove rule" data-remove="' + rule.id + '">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</div>' +
      '<div class="rule-inputs">' +
        '<input type="text" class="rule-input find-input" placeholder="Find..." value="' + escapeAttr(rule.find) + '" data-field="find" data-id="' + rule.id + '">' +
        '<input type="text" class="rule-input replace-input" placeholder="Replace with..." value="' + escapeAttr(rule.replace) + '" data-field="replace" data-id="' + rule.id + '">' +
      '</div>' +
      '<div class="rule-options">' +
        '<label class="rule-option">' +
          '<input type="checkbox" data-opt="caseSensitive" data-id="' + rule.id + '"' + (rule.caseSensitive ? ' checked' : '') + '>' +
          '<span>Case</span>' +
        '</label>' +
        '<label class="rule-option">' +
          '<input type="checkbox" data-opt="wholeWord" data-id="' + rule.id + '"' + (rule.wholeWord ? ' checked' : '') + '>' +
          '<span>Whole word</span>' +
        '</label>' +
        '<label class="rule-option">' +
          '<input type="checkbox" data-opt="regex" data-id="' + rule.id + '"' + (rule.regex ? ' checked' : '') + '>' +
          '<span>Regex</span>' +
        '</label>' +
      '</div>' +
      '<div class="rule-error" data-error="' + rule.id + '"></div>';

    el.rulesList.appendChild(card);

    // Event: remove
    card.querySelector('[data-remove]').addEventListener('click', function() {
      removeRule(rule.id);
    });

    // Event: input fields
    card.querySelectorAll('.rule-input').forEach(function(input) {
      input.addEventListener('input', function() {
        var r = getRuleById(parseInt(this.getAttribute('data-id')));
        if (r) {
          r[this.getAttribute('data-field')] = this.value;
          schedulePreview();
        }
      });
    });

    // Event: checkboxes
    card.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var r = getRuleById(parseInt(this.getAttribute('data-id')));
        if (r) {
          r[this.getAttribute('data-opt')] = this.checked;
          schedulePreview();
        }
      });
    });
  }

  function getRuleById(id) {
    return state.rules.find(function(r) { return r.id === id; });
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================
  // Regex Builder
  // ============================================
  function buildRegex(rule) {
    var pattern = rule.find;
    if (!pattern) return null;

    rule.error = null;

    try {
      if (!rule.regex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      if (rule.wholeWord) {
        pattern = '\\b' + pattern + '\\b';
      }

      var flags = 'g';
      if (!rule.caseSensitive) flags += 'i';
      if (rule.regex) flags += 'm';

      return new RegExp(pattern, flags);
    } catch (e) {
      rule.error = e.message;
      return null;
    }
  }

  // ============================================
  // Preview
  // ============================================
  function schedulePreview() {
    clearTimeout(state.previewDebounceTimer);
    state.previewDebounceTimer = setTimeout(updatePreview, 150);
  }

  function updatePreview() {
    var text = el.inputText.value;

    if (!text || state.rules.length === 0) {
      if (!text) {
        el.previewOutput.innerHTML = '<span class="preview-placeholder">Preview will appear here as you type rules...</span>';
      } else {
        el.previewOutput.textContent = text;
      }
      el.previewBadge.textContent = '0 replacements';
      // Reset all counts
      state.rules.forEach(function(rule) {
        rule.matchCount = 0;
        updateRuleCount(rule);
        updateRuleError(rule);
      });
      return;
    }

    var totalReplacements = 0;

    // Collect all matches with their positions for highlighting
    // We process rules sequentially on the original text for preview
    // Each rule shows what it would match on the CURRENT text (after previous rules)
    var currentText = text;
    var segments = [{ text: text, type: 'normal' }];

    state.rules.forEach(function(rule) {
      rule.matchCount = 0;
      rule.error = null;

      if (!rule.find) {
        updateRuleCount(rule);
        updateRuleError(rule);
        return;
      }

      var regex = buildRegex(rule);
      if (!regex) {
        updateRuleCount(rule);
        updateRuleError(rule);
        return;
      }

      // Count matches
      var matches = currentText.match(regex);
      rule.matchCount = matches ? matches.length : 0;
      totalReplacements += rule.matchCount;

      // Apply replacement for next rule's context
      currentText = currentText.replace(regex, rule.replace);

      updateRuleCount(rule);
      updateRuleError(rule);
    });

    // Build a highlighted preview: show original with strikethrough, replacement in green
    // Re-run all rules with highlights
    var previewHTML = buildHighlightedPreview(text);

    el.previewOutput.innerHTML = previewHTML;
    el.previewBadge.textContent = totalReplacements + ' replacement' + (totalReplacements !== 1 ? 's' : '');
  }

  function buildHighlightedPreview(originalText) {
    // Apply rules sequentially, building highlight info
    var text = originalText;

    for (var i = 0; i < state.rules.length; i++) {
      var rule = state.rules[i];
      if (!rule.find) continue;

      var regex = buildRegex(rule);
      if (!regex) continue;

      var replacement = rule.replace;

      // Replace with markers
      text = text.replace(regex, function(match) {
        return '\x01MATCH_START\x01' + match + '\x01MATCH_END\x01' +
               '\x01REPL_START\x01' + (typeof replacement === 'string' ? match.replace(regex, replacement) : replacement) + '\x01REPL_END\x01';
      });

      // We need to rebuild regex for each replacement since the text changes
      // But markers prevent re-matching. Reset regex to avoid infinite loops.
    }

    // Now convert markers to HTML
    var html = escapeHTML(text);

    // Unescape our markers (they got escaped)
    html = html
      .replace(/\x01MATCH_START\x01/g, '<span class="match-highlight">')
      .replace(/\x01MATCH_END\x01/g, '</span>')
      .replace(/\x01REPL_START\x01/g, '<span class="replace-highlight">')
      .replace(/\x01REPL_END\x01/g, '</span>');

    return html;
  }

  function updateRuleCount(rule) {
    var countEl = document.querySelector('[data-count="' + rule.id + '"]');
    if (countEl) {
      countEl.textContent = rule.matchCount + ' match' + (rule.matchCount !== 1 ? 'es' : '');
    }
  }

  function updateRuleError(rule) {
    var errorEl = document.querySelector('[data-error="' + rule.id + '"]');
    var card = document.querySelector('.rule-card[data-id="' + rule.id + '"]');
    if (errorEl && card) {
      if (rule.error) {
        errorEl.textContent = rule.error;
        card.classList.add('has-error');
      } else {
        errorEl.textContent = '';
        card.classList.remove('has-error');
      }
    }
  }

  // ============================================
  // Apply Rules
  // ============================================
  function applyRules() {
    var text = el.inputText.value;
    if (!text) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please enter some text first', 'warning');
      }
      return;
    }

    if (state.rules.length === 0) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Please add at least one rule', 'warning');
      }
      return;
    }

    // Save to undo stack
    pushUndo(text);

    var result = text;
    var totalReplacements = 0;

    state.rules.forEach(function(rule) {
      if (!rule.find) return;
      var regex = buildRegex(rule);
      if (!regex) return;

      var matches = result.match(regex);
      totalReplacements += matches ? matches.length : 0;
      result = result.replace(regex, rule.replace);
    });

    el.inputText.value = result;
    updatePreview();

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(totalReplacements + ' replacement' + (totalReplacements !== 1 ? 's' : '') + ' applied', 'success');
    }
  }

  // ============================================
  // Undo / Redo
  // ============================================
  function pushUndo(text) {
    state.undoStack.push(text);
    if (state.undoStack.length > state.maxUndo) {
      state.undoStack.shift();
    }
    state.redoStack = [];
    updateUndoRedoUI();
  }

  function undo() {
    if (state.undoStack.length === 0) return;
    state.redoStack.push(el.inputText.value);
    el.inputText.value = state.undoStack.pop();
    updateUndoRedoUI();
    schedulePreview();
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Undo', 'success');
    }
  }

  function redo() {
    if (state.redoStack.length === 0) return;
    state.undoStack.push(el.inputText.value);
    el.inputText.value = state.redoStack.pop();
    updateUndoRedoUI();
    schedulePreview();
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Redo', 'success');
    }
  }

  function updateUndoRedoUI() {
    el.undoBtn.disabled = state.undoStack.length === 0;
    el.redoBtn.disabled = state.redoStack.length === 0;
  }

  // ============================================
  // Import / Export
  // ============================================
  function exportRules() {
    if (state.rules.length === 0) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('No rules to export', 'warning');
      }
      return;
    }

    var data = state.rules.map(function(r) {
      return {
        find: r.find,
        replace: r.replace,
        caseSensitive: r.caseSensitive,
        wholeWord: r.wholeWord,
        regex: r.regex
      };
    });

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'replacement-rules.json';
    a.click();
    URL.revokeObjectURL(url);

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Rules exported', 'success');
    }
  }

  function importRules(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');

        // Clear existing rules
        state.rules = [];
        state.ruleIdCounter = 0;
        el.rulesList.innerHTML = '';

        data.forEach(function(item) {
          createRule({
            find: item.find || '',
            replace: item.replace || '',
            caseSensitive: !!item.caseSensitive,
            wholeWord: !!item.wholeWord,
            regex: !!item.regex
          });
        });

        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast(data.length + ' rule(s) imported', 'success');
        }
      } catch (err) {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Invalid JSON file', 'error');
        }
      }
    };
    reader.readAsText(file);
  }

  // ============================================
  // Presets
  // ============================================
  function loadPreset(name) {
    var presetRules = presets[name];
    if (!presetRules) return;

    presetRules.forEach(function(item) {
      createRule(item);
    });

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Preset loaded: ' + name, 'success');
    }
  }

  // ============================================
  // Event Listeners
  // ============================================
  function init() {
    // Add initial empty rule
    createRule();

    // Add rule button
    el.addRuleBtn.addEventListener('click', function() {
      createRule();
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Rule added', 'success');
      }
    });

    // Import/Export
    el.importRulesBtn.addEventListener('click', function() {
      el.fileInput.click();
    });

    el.fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        importRules(this.files[0]);
        this.value = '';
      }
    });

    el.exportRulesBtn.addEventListener('click', exportRules);

    // Apply button
    el.applyBtn.addEventListener('click', applyRules);

    // Undo/Redo
    el.undoBtn.addEventListener('click', undo);
    el.redoBtn.addEventListener('click', redo);

    // Text input - live preview
    el.inputText.addEventListener('input', schedulePreview);

    // Paste button
    el.pasteBtn.addEventListener('click', function() {
      navigator.clipboard.readText().then(function(text) {
        el.inputText.value = text;
        schedulePreview();
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Text pasted', 'success');
        }
      }).catch(function() {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Could not access clipboard', 'error');
        }
      });
    });

    // Clear button
    el.clearBtn.addEventListener('click', function() {
      if (el.inputText.value) {
        pushUndo(el.inputText.value);
      }
      el.inputText.value = '';
      schedulePreview();
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Text cleared', 'success');
      }
    });

    // Copy button
    el.copyBtn.addEventListener('click', function() {
      // Copy the result text (after applying rules mentally - get from preview)
      var text = el.inputText.value;
      if (!text) {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Nothing to copy', 'warning');
        }
        return;
      }

      // Apply all rules to get result
      var result = text;
      state.rules.forEach(function(rule) {
        if (!rule.find) return;
        var regex = buildRegex(rule);
        if (!regex) return;
        result = result.replace(regex, rule.replace);
      });

      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.copyWithToast(result, 'Result copied');
      } else {
        navigator.clipboard.writeText(result);
      }
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var preset = this.getAttribute('data-preset');
        loadPreset(preset);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Ctrl+Enter to apply
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        applyRules();
        return;
      }

      // Ctrl+Z undo (only when not in textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.target !== el.inputText) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y redo (only when not in textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y' && e.target !== el.inputText) {
        e.preventDefault();
        redo();
        return;
      }
    });

    updateUndoRedoUI();
  }

  // ============================================
  // Init
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
