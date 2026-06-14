/**
 * JSONPath Tester
 * Pure JS JSONPath evaluator with live evaluation
 */
(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const jsonInput = document.getElementById('jsonInput');
  const queryInput = document.getElementById('queryInput');
  const lineNumbers = document.getElementById('lineNumbers');
  const jsonStatus = document.getElementById('jsonStatus');
  const jsonStatusText = document.getElementById('jsonStatusText');
  const charCount = document.getElementById('charCount');
  const matchCount = document.getElementById('matchCount');
  const resultsJson = document.getElementById('resultsJson');
  const emptyState = document.getElementById('emptyState');
  const errorBar = document.getElementById('errorBar');
  const errorText = document.getElementById('errorText');
  const sampleBtn = document.getElementById('sampleBtn');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const formatJsonBtn = document.getElementById('formatJsonBtn');
  const copyQueryBtn = document.getElementById('copyQueryBtn');
  const copyResultsBtn = document.getElementById('copyResultsBtn');
  const queryHints = document.getElementById('queryHints');

  let parsedData = null;
  let lastResults = '';

  // ==================== Sample Data ====================
  const SAMPLE_JSON = {
    store: {
      book: [
        { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
        { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
        { category: "fiction", author: "Herman Melville", title: "Moby Dick", isbn: "0-553-21311-3", price: 8.99 },
        { category: "fiction", author: "J. R. R. Tolkien", title: "The Lord of the Rings", isbn: "0-395-19395-8", price: 22.99 }
      ],
      bicycle: { color: "red", price: 19.95 }
    },
    expensive: 10
  };

  // ==================== JSONPath Evaluator ====================
  function evaluateJsonPath(data, path) {
    if (!path || path === '$') return [data];

    // Normalize: remove leading $
    let expr = path.startsWith('$') ? path.substring(1) : path;
    if (!expr) return [data];

    return resolvePath(data, expr);
  }

  function resolvePath(data, expr) {
    const tokens = tokenize(expr);
    let current = [data];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let next = [];

      for (const item of current) {
        if (item === null || item === undefined) continue;

        if (token.type === 'recursive') {
          // Recursive descent (..)
          const key = token.value;
          const all = collectAll(item);
          for (const node of all) {
            if (node !== null && typeof node === 'object') {
              if (key === '*') {
                if (Array.isArray(node)) {
                  next.push(...node);
                } else {
                  next.push(...Object.values(node));
                }
              } else if (key in node) {
                next.push(node[key]);
              }
            }
          }
        } else if (token.type === 'wildcard') {
          if (Array.isArray(item)) {
            next.push(...item);
          } else if (typeof item === 'object' && item !== null) {
            next.push(...Object.values(item));
          }
        } else if (token.type === 'property') {
          if (typeof item === 'object' && item !== null && token.value in item) {
            next.push(item[token.value]);
          }
        } else if (token.type === 'index') {
          if (Array.isArray(item)) {
            const idx = token.value < 0 ? item.length + token.value : token.value;
            if (idx >= 0 && idx < item.length) {
              next.push(item[idx]);
            }
          }
        } else if (token.type === 'slice') {
          if (Array.isArray(item)) {
            const len = item.length;
            let start = token.start ?? 0;
            let end = token.end ?? len;
            const step = token.step ?? 1;
            if (start < 0) start = Math.max(0, len + start);
            if (end < 0) end = Math.max(0, len + end);
            start = Math.min(start, len);
            end = Math.min(end, len);
            for (let j = start; j < end; j += step) {
              next.push(item[j]);
            }
          }
        } else if (token.type === 'filter') {
          if (Array.isArray(item)) {
            for (const elem of item) {
              if (evaluateFilter(elem, token.expression)) {
                next.push(elem);
              }
            }
          }
        } else if (token.type === 'multi') {
          if (typeof item === 'object' && item !== null) {
            for (const key of token.keys) {
              if (key in item) {
                next.push(item[key]);
              }
            }
          }
        }
      }

      current = next;
    }

    return current;
  }

  function tokenize(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
      // Skip leading dots
      if (expr[i] === '.') {
        // Check for recursive descent
        if (expr[i + 1] === '.') {
          i += 2;
          // Get the key after ..
          if (expr[i] === '[') {
            const bracket = parseBracket(expr, i);
            i = bracket.end;
            if (bracket.token.type === 'wildcard') {
              tokens.push({ type: 'recursive', value: '*' });
            } else if (bracket.token.type === 'property') {
              tokens.push({ type: 'recursive', value: bracket.token.value });
            } else {
              // For filters after .., we need recursive + filter
              tokens.push({ type: 'recursive', value: '*' });
              tokens.push(bracket.token);
            }
          } else if (expr[i] === '*') {
            tokens.push({ type: 'recursive', value: '*' });
            i++;
          } else {
            const name = readPropertyName(expr, i);
            tokens.push({ type: 'recursive', value: name.value });
            i = name.end;
          }
        } else {
          i++;
          // Regular dot access
          if (i < expr.length && expr[i] === '[') {
            const bracket = parseBracket(expr, i);
            tokens.push(bracket.token);
            i = bracket.end;
          } else if (i < expr.length && expr[i] === '*') {
            tokens.push({ type: 'wildcard' });
            i++;
          } else if (i < expr.length) {
            const name = readPropertyName(expr, i);
            tokens.push({ type: 'property', value: name.value });
            i = name.end;
          }
        }
      } else if (expr[i] === '[') {
        const bracket = parseBracket(expr, i);
        tokens.push(bracket.token);
        i = bracket.end;
      } else {
        // Direct property name (no dot prefix, e.g., at start)
        const name = readPropertyName(expr, i);
        tokens.push({ type: 'property', value: name.value });
        i = name.end;
      }
    }

    return tokens;
  }

  function readPropertyName(expr, start) {
    let i = start;
    while (i < expr.length && expr[i] !== '.' && expr[i] !== '[') {
      i++;
    }
    return { value: expr.substring(start, i), end: i };
  }

  function parseBracket(expr, start) {
    // Find matching ]
    let depth = 0;
    let i = start;
    for (; i < expr.length; i++) {
      if (expr[i] === '[') depth++;
      else if (expr[i] === ']') {
        depth--;
        if (depth === 0) break;
      }
    }
    const inner = expr.substring(start + 1, i).trim();
    const end = i + 1;

    // Wildcard [*]
    if (inner === '*') {
      return { token: { type: 'wildcard' }, end };
    }

    // Filter [?(...)]
    if (inner.startsWith('?(') && inner.endsWith(')')) {
      const filterExpr = inner.substring(2, inner.length - 1);
      return { token: { type: 'filter', expression: filterExpr }, end };
    }

    // Slice [start:end] or [start:end:step]
    if (inner.includes(':')) {
      const parts = inner.split(':').map(s => s.trim());
      return {
        token: {
          type: 'slice',
          start: parts[0] !== '' ? parseInt(parts[0], 10) : null,
          end: parts[1] !== '' ? parseInt(parts[1], 10) : null,
          step: parts[2] !== undefined && parts[2] !== '' ? parseInt(parts[2], 10) : null
        },
        end
      };
    }

    // Multi-select ['a','b'] or [0,1,2]
    if (inner.includes(',')) {
      const keys = inner.split(',').map(s => {
        s = s.trim();
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
          return s.slice(1, -1);
        }
        const n = parseInt(s, 10);
        return isNaN(n) ? s : n;
      });
      return { token: { type: 'multi', keys }, end };
    }

    // Quoted string ['name'] or ["name"]
    if ((inner.startsWith("'") && inner.endsWith("'")) || (inner.startsWith('"') && inner.endsWith('"'))) {
      return { token: { type: 'property', value: inner.slice(1, -1) }, end };
    }

    // Numeric index [0]
    const num = parseInt(inner, 10);
    if (!isNaN(num) && String(num) === inner) {
      return { token: { type: 'index', value: num }, end };
    }

    // Property name
    return { token: { type: 'property', value: inner }, end };
  }

  function evaluateFilter(item, expression) {
    if (item === null || item === undefined || typeof item !== 'object') return false;

    try {
      // Parse filter expression: @.field op value
      // Support: @.field, @.field > val, @.field < val, @.field == val, @.field != val, @.field >= val, @.field <= val
      let expr = expression.trim();

      // Existence check: just @.field (no operator)
      const existenceMatch = expr.match(/^@\.(\w+)$/);
      if (existenceMatch) {
        return existenceMatch[1] in item;
      }

      // Comparison: @.field op value
      const compMatch = expr.match(/^@\.(\w+)\s*(===?|!==?|>=?|<=?)\s*(.+)$/);
      if (compMatch) {
        const field = compMatch[1];
        const op = compMatch[2];
        let val = compMatch[3].trim();

        // Parse value
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        } else if (val === 'true') {
          val = true;
        } else if (val === 'false') {
          val = false;
        } else if (val === 'null') {
          val = null;
        } else if (!isNaN(Number(val))) {
          val = Number(val);
        }

        if (!(field in item)) return false;
        const fieldVal = item[field];

        switch (op) {
          case '==':
          case '===': return fieldVal === val;
          case '!=':
          case '!==': return fieldVal !== val;
          case '>': return fieldVal > val;
          case '>=': return fieldVal >= val;
          case '<': return fieldVal < val;
          case '<=': return fieldVal <= val;
          default: return false;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  function collectAll(obj) {
    const results = [obj];
    if (obj !== null && typeof obj === 'object') {
      const values = Array.isArray(obj) ? obj : Object.values(obj);
      for (const val of values) {
        if (val !== null && typeof val === 'object') {
          results.push(...collectAll(val));
        }
      }
    }
    return results;
  }

  // ==================== Syntax Highlighting ====================
  function highlightJson(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"(\s*:)/g, '<span class="json-key">"$1"</span>$3')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="json-string">"$1"</span>')
      .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-number">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>');
  }

  // ==================== Line Numbers ====================
  function updateLineNumbers() {
    const lines = jsonInput.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) {
      html += i + '\n';
    }
    lineNumbers.textContent = html;
  }

  // ==================== JSON Validation ====================
  function validateAndParse() {
    const text = jsonInput.value.trim();
    charCount.textContent = jsonInput.value.length + ' chars';

    if (!text) {
      parsedData = null;
      jsonStatus.className = 'status-indicator';
      jsonStatusText.textContent = 'Ready';
      return false;
    }

    try {
      parsedData = JSON.parse(text);
      jsonStatus.className = 'status-indicator valid';
      jsonStatusText.textContent = 'Valid JSON';
      return true;
    } catch (e) {
      parsedData = null;
      jsonStatus.className = 'status-indicator invalid';
      jsonStatusText.textContent = 'Invalid JSON';
      return false;
    }
  }

  // ==================== Evaluate ====================
  function evaluate() {
    hideError();

    const valid = validateAndParse();

    if (!parsedData) {
      matchCount.textContent = '0 matches';
      resultsJson.innerHTML = '';
      resultsJson.classList.remove('active');
      emptyState.classList.remove('hidden');
      lastResults = '';
      return;
    }

    const query = '$' + queryInput.value;

    try {
      const results = evaluateJsonPath(parsedData, query);

      if (results.length === 0) {
        matchCount.textContent = '0 matches';
        resultsJson.innerHTML = '';
        resultsJson.classList.remove('active');
        emptyState.classList.remove('hidden');
        emptyState.querySelector('p').textContent = 'No matches found';
        emptyState.querySelector('span').textContent = 'Try a different query';
        lastResults = '';
        return;
      }

      // Display results
      matchCount.textContent = results.length + ' match' + (results.length !== 1 ? 'es' : '');
      emptyState.classList.add('hidden');
      resultsJson.classList.add('active');

      const output = results.length === 1 ? results[0] : results;
      const formatted = JSON.stringify(output, null, 2);
      lastResults = formatted;
      resultsJson.innerHTML = highlightJson(formatted);

    } catch (e) {
      showError(e.message || 'Invalid JSONPath expression');
      matchCount.textContent = '0 matches';
      resultsJson.innerHTML = '';
      resultsJson.classList.remove('active');
      emptyState.classList.remove('hidden');
      emptyState.querySelector('p').textContent = 'Query error';
      emptyState.querySelector('span').textContent = 'Check your JSONPath syntax';
      lastResults = '';
    }
  }

  function showError(msg) {
    errorBar.classList.remove('hidden');
    errorText.textContent = msg;
  }

  function hideError() {
    errorBar.classList.add('hidden');
    errorText.textContent = '';
  }

  // ==================== Event Listeners ====================
  const debouncedEvaluate = ToolsCommon.debounce(evaluate, 200);

  jsonInput.addEventListener('input', () => {
    updateLineNumbers();
    debouncedEvaluate();
  });

  jsonInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = jsonInput.scrollTop;
  });

  queryInput.addEventListener('input', debouncedEvaluate);

  // Query hints
  queryHints.addEventListener('click', (e) => {
    const hint = e.target.closest('.hint-item');
    if (!hint) return;
    const query = hint.dataset.query;
    // Remove leading $
    queryInput.value = query.startsWith('$') ? query.substring(1) : query;
    evaluate();
    queryInput.focus();
  });

  // Sample button
  sampleBtn.addEventListener('click', () => {
    jsonInput.value = JSON.stringify(SAMPLE_JSON, null, 2);
    updateLineNumbers();
    evaluate();
    ToolsCommon.showToast('Sample data loaded', 'success');
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    queryInput.value = '';
    parsedData = null;
    lastResults = '';
    updateLineNumbers();
    matchCount.textContent = '0 matches';
    resultsJson.innerHTML = '';
    resultsJson.classList.remove('active');
    emptyState.classList.remove('hidden');
    emptyState.querySelector('p').textContent = 'No results yet';
    emptyState.querySelector('span').textContent = 'Enter a JSONPath query to see results';
    jsonStatus.className = 'status-indicator';
    jsonStatusText.textContent = 'Ready';
    charCount.textContent = '0 chars';
    hideError();
    ToolsCommon.showToast('Cleared', 'info');
  });

  // Paste button
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      jsonInput.value = text;
      updateLineNumbers();
      evaluate();
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch {
      ToolsCommon.showToast('Failed to read clipboard', 'error');
    }
  });

  // Format JSON button
  formatJsonBtn.addEventListener('click', () => {
    if (!parsedData) {
      ToolsCommon.showToast('No valid JSON to format', 'error');
      return;
    }
    jsonInput.value = JSON.stringify(parsedData, null, 2);
    updateLineNumbers();
    ToolsCommon.showToast('JSON formatted', 'success');
  });

  // Copy query
  copyQueryBtn.addEventListener('click', () => {
    const fullQuery = '$' + queryInput.value;
    ToolsCommon.copyWithToast(fullQuery, 'Query copied');
  });

  // Copy results
  copyResultsBtn.addEventListener('click', () => {
    if (!lastResults) {
      ToolsCommon.showToast('No results to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(lastResults, 'Results copied');
  });

  // Tab key in textarea
  jsonInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = jsonInput.selectionStart;
      const end = jsonInput.selectionEnd;
      jsonInput.value = jsonInput.value.substring(0, start) + '  ' + jsonInput.value.substring(end);
      jsonInput.selectionStart = jsonInput.selectionEnd = start + 2;
      updateLineNumbers();
    }
  });

  // ==================== Init ====================
  updateLineNumbers();

})();
