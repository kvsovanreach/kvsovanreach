/**
 * KVSOVANREACH SQL Formatter Tool
 * Format, beautify, and syntax-highlight SQL queries
 */

(function() {
  'use strict';

  // ==================== SQL Keywords ====================
  const SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS', 'ON',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
    'UNION', 'ALL', 'INTERSECT', 'EXCEPT',
    'AS', 'DISTINCT', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT',
    'DEFAULT', 'CHECK', 'UNIQUE', 'AUTO_INCREMENT',
    'IF', 'REPLACE', 'TRUNCATE', 'CASCADE', 'RESTRICT',
    'INT', 'INTEGER', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE',
    'TIMESTAMP', 'FLOAT', 'DOUBLE', 'DECIMAL', 'CHAR', 'BLOB',
    'BIGINT', 'SMALLINT', 'TINYINT', 'SERIAL',
    'WITH', 'RECURSIVE', 'TEMP', 'TEMPORARY',
    'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
    'GRANT', 'REVOKE', 'TRUE', 'FALSE'
  ];

  const SQL_FUNCTIONS = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH',
    'REPLACE', 'CAST', 'CONVERT', 'COALESCE', 'NULLIF', 'IFNULL',
    'NOW', 'CURDATE', 'DATE_FORMAT', 'DATEDIFF', 'YEAR', 'MONTH', 'DAY',
    'ROUND', 'CEIL', 'FLOOR', 'ABS', 'MOD',
    'GROUP_CONCAT', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'OVER', 'PARTITION'
  ];

  // Major clause keywords that start a new line at indent level 0
  const MAJOR_CLAUSES = [
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
    'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
    'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'WITH'
  ];

  // Join keywords
  const JOIN_KEYWORDS = [
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
    'CROSS JOIN', 'JOIN'
  ];

  // ==================== State ====================
  const state = {
    indent: localStorage.getItem('sqlIndent') || '2',
    uppercaseKeywords: localStorage.getItem('sqlUppercase') !== 'false',
    lineBreakAndOr: localStorage.getItem('sqlBreakAndOr') !== 'false',
    formattedPlainText: ''
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.sqlInput = document.getElementById('sqlInput');
    elements.sqlOutput = document.getElementById('sqlOutput');
    elements.formatBtn = document.getElementById('formatBtn');
    elements.minifyBtn = document.getElementById('minifyBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.pasteBtn = document.getElementById('pasteBtn');
    elements.sampleBtn = document.getElementById('sampleBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.indentSize = document.getElementById('indentSize');
    elements.uppercaseKeywords = document.getElementById('uppercaseKeywords');
    elements.lineBreakAndOr = document.getElementById('lineBreakAndOr');
    elements.inputStats = document.getElementById('inputStats');
    elements.outputStats = document.getElementById('outputStats');
    elements.errorPanel = document.getElementById('errorPanel');
    elements.errorMessage = document.getElementById('errorMessage');
  }

  // ==================== Tokenizer ====================
  function tokenize(sql) {
    const tokens = [];
    let i = 0;
    const len = sql.length;

    while (i < len) {
      // Skip whitespace
      if (/\s/.test(sql[i])) {
        i++;
        continue;
      }

      // Single-line comment --
      if (sql[i] === '-' && sql[i + 1] === '-') {
        let end = sql.indexOf('\n', i);
        if (end === -1) end = len;
        tokens.push({ type: 'comment', value: sql.substring(i, end) });
        i = end;
        continue;
      }

      // Multi-line comment /* */
      if (sql[i] === '/' && sql[i + 1] === '*') {
        let end = sql.indexOf('*/', i + 2);
        if (end === -1) end = len - 2;
        tokens.push({ type: 'comment', value: sql.substring(i, end + 2) });
        i = end + 2;
        continue;
      }

      // String literal (single quotes)
      if (sql[i] === "'") {
        let j = i + 1;
        while (j < len) {
          if (sql[j] === "'" && sql[j + 1] === "'") {
            j += 2;
          } else if (sql[j] === "'") {
            break;
          } else {
            j++;
          }
        }
        tokens.push({ type: 'string', value: sql.substring(i, j + 1) });
        i = j + 1;
        continue;
      }

      // String literal (double quotes / identifiers)
      if (sql[i] === '"') {
        let j = i + 1;
        while (j < len && sql[j] !== '"') j++;
        tokens.push({ type: 'string', value: sql.substring(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Backtick identifiers
      if (sql[i] === '`') {
        let j = i + 1;
        while (j < len && sql[j] !== '`') j++;
        tokens.push({ type: 'identifier', value: sql.substring(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(sql[i]) || (sql[i] === '.' && /[0-9]/.test(sql[i + 1]))) {
        let j = i;
        while (j < len && /[0-9.eE+\-]/.test(sql[j])) j++;
        tokens.push({ type: 'number', value: sql.substring(i, j) });
        i = j;
        continue;
      }

      // Parentheses
      if (sql[i] === '(') {
        tokens.push({ type: 'paren_open', value: '(' });
        i++;
        continue;
      }
      if (sql[i] === ')') {
        tokens.push({ type: 'paren_close', value: ')' });
        i++;
        continue;
      }

      // Comma
      if (sql[i] === ',') {
        tokens.push({ type: 'comma', value: ',' });
        i++;
        continue;
      }

      // Semicolon
      if (sql[i] === ';') {
        tokens.push({ type: 'semicolon', value: ';' });
        i++;
        continue;
      }

      // Operators
      if (sql[i] === '*' && (tokens.length === 0 || tokens[tokens.length - 1].type !== 'number')) {
        tokens.push({ type: 'operator', value: '*' });
        i++;
        continue;
      }

      if ('<>=!'.includes(sql[i])) {
        let op = sql[i];
        if (i + 1 < len && '=><'.includes(sql[i + 1])) op += sql[i + 1];
        tokens.push({ type: 'operator', value: op });
        i += op.length;
        continue;
      }

      if ('+-*/%'.includes(sql[i])) {
        tokens.push({ type: 'operator', value: sql[i] });
        i++;
        continue;
      }

      // Dot
      if (sql[i] === '.') {
        tokens.push({ type: 'dot', value: '.' });
        i++;
        continue;
      }

      // Words (keywords, identifiers, functions)
      if (/[a-zA-Z_]/.test(sql[i])) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_]/.test(sql[j])) j++;
        const word = sql.substring(i, j);
        const upper = word.toUpperCase();

        if (SQL_FUNCTIONS.includes(upper)) {
          tokens.push({ type: 'function', value: word });
        } else if (SQL_KEYWORDS.includes(upper)) {
          tokens.push({ type: 'keyword', value: word });
        } else {
          tokens.push({ type: 'identifier', value: word });
        }
        i = j;
        continue;
      }

      // Anything else
      tokens.push({ type: 'unknown', value: sql[i] });
      i++;
    }

    return tokens;
  }

  // ==================== Formatter ====================
  function formatSQL(sql) {
    const tokens = tokenize(sql);
    if (tokens.length === 0) return '';

    const indentChar = state.indent === 'tab' ? '\t' : ' '.repeat(parseInt(state.indent));
    const uppercaseFn = state.uppercaseKeywords
      ? (w) => w.toUpperCase()
      : (w) => w.toLowerCase();

    let result = '';
    let indentLevel = 0;
    let newLine = false;
    let i = 0;

    function indent() {
      return indentChar.repeat(indentLevel);
    }

    function addNewLine() {
      result = result.trimEnd();
      result += '\n' + indent();
    }

    function peekKeyword(offset) {
      const idx = i + offset;
      if (idx >= 0 && idx < tokens.length && tokens[idx].type === 'keyword') {
        return tokens[idx].value.toUpperCase();
      }
      return '';
    }

    function lookAheadCompound() {
      // Check for compound keywords like GROUP BY, ORDER BY, INSERT INTO, etc.
      if (i + 1 < tokens.length && tokens[i + 1].type === 'keyword') {
        const compound = tokens[i].value.toUpperCase() + ' ' + tokens[i + 1].value.toUpperCase();
        if (MAJOR_CLAUSES.includes(compound) || JOIN_KEYWORDS.includes(compound)) {
          return compound;
        }
        // Check three-word compounds: LEFT OUTER JOIN, etc.
        if (i + 2 < tokens.length && tokens[i + 2].type === 'keyword') {
          const triple = compound + ' ' + tokens[i + 2].value.toUpperCase();
          if (JOIN_KEYWORDS.includes(triple)) {
            return triple;
          }
        }
      }
      return null;
    }

    let parenDepth = 0;

    while (i < tokens.length) {
      const token = tokens[i];
      const upper = token.value.toUpperCase();

      if (token.type === 'comment') {
        result += token.value;
        addNewLine();
        i++;
        continue;
      }

      if (token.type === 'paren_open') {
        result += '(';
        parenDepth++;
        indentLevel++;
        addNewLine();
        i++;
        continue;
      }

      if (token.type === 'paren_close') {
        parenDepth--;
        indentLevel = Math.max(0, indentLevel - 1);
        addNewLine();
        result += ')';
        i++;
        continue;
      }

      if (token.type === 'comma') {
        result += ',';
        addNewLine();
        i++;
        continue;
      }

      if (token.type === 'semicolon') {
        result += ';';
        result += '\n\n';
        indentLevel = 0;
        newLine = true;
        i++;
        continue;
      }

      if (token.type === 'keyword') {
        // Check compound keywords
        const compound = lookAheadCompound();

        if (compound) {
          const compoundWords = compound.split(' ');
          const isMajor = MAJOR_CLAUSES.includes(compound);
          const isJoin = JOIN_KEYWORDS.includes(compound);

          if (isMajor || isJoin) {
            if (result.length > 0 && !newLine) {
              if (parenDepth === 0) {
                indentLevel = 0;
              }
              addNewLine();
            }
            result += uppercaseFn(compound);
            indentLevel = parenDepth > 0 ? parenDepth : 1;
            addNewLine();
            i += compoundWords.length;
            newLine = false;
            continue;
          }
        }

        // Single major clause
        if (MAJOR_CLAUSES.includes(upper)) {
          if (result.length > 0 && !newLine) {
            if (parenDepth === 0) {
              indentLevel = 0;
            }
            addNewLine();
          }
          result += uppercaseFn(token.value);
          indentLevel = parenDepth > 0 ? parenDepth : 1;
          addNewLine();
          i++;
          newLine = false;
          continue;
        }

        // JOIN (single word)
        if (JOIN_KEYWORDS.includes(upper)) {
          if (parenDepth === 0) {
            indentLevel = 0;
          }
          addNewLine();
          result += uppercaseFn(token.value);
          indentLevel = parenDepth > 0 ? parenDepth : 1;
          addNewLine();
          i++;
          newLine = false;
          continue;
        }

        // AND / OR
        if ((upper === 'AND' || upper === 'OR') && state.lineBreakAndOr) {
          addNewLine();
          result += uppercaseFn(token.value) + ' ';
          i++;
          newLine = false;
          continue;
        }

        // ON keyword
        if (upper === 'ON') {
          result += ' ' + uppercaseFn(token.value) + ' ';
          i++;
          continue;
        }

        // Other keywords
        result += uppercaseFn(token.value) + ' ';
        i++;
        newLine = false;
        continue;
      }

      if (token.type === 'function') {
        result += uppercaseFn(token.value);
        i++;
        continue;
      }

      if (token.type === 'operator') {
        result += ' ' + token.value + ' ';
        i++;
        continue;
      }

      if (token.type === 'dot') {
        result = result.trimEnd();
        result += '.';
        i++;
        continue;
      }

      if (token.type === 'string') {
        result += token.value + ' ';
        i++;
        continue;
      }

      if (token.type === 'number') {
        result += token.value + ' ';
        i++;
        continue;
      }

      // identifiers, unknowns
      result += token.value + ' ';
      i++;
      newLine = false;
    }

    // Clean up extra spaces and lines
    return result
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // ==================== Minifier ====================
  function minifySQL(sql) {
    const tokens = tokenize(sql);
    if (tokens.length === 0) return '';

    let result = '';
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'comment') continue;

      if (token.type === 'comma') {
        result += ',';
        continue;
      }
      if (token.type === 'semicolon') {
        result += ';';
        continue;
      }
      if (token.type === 'paren_open') {
        result = result.trimEnd();
        result += '(';
        continue;
      }
      if (token.type === 'paren_close') {
        result = result.trimEnd();
        result += ')';
        continue;
      }
      if (token.type === 'dot') {
        result = result.trimEnd();
        result += '.';
        continue;
      }
      if (token.type === 'operator') {
        result = result.trimEnd();
        result += token.value;
        continue;
      }
      if (token.type === 'keyword') {
        if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('(')) {
          result += ' ';
        }
        result += state.uppercaseKeywords ? token.value.toUpperCase() : token.value.toLowerCase();
        result += ' ';
        continue;
      }
      if (token.type === 'function') {
        if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('(')) {
          result += ' ';
        }
        result += state.uppercaseKeywords ? token.value.toUpperCase() : token.value.toLowerCase();
        continue;
      }

      if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('(') && !result.endsWith('.')) {
        result += ' ';
      }
      result += token.value;
    }

    return result.replace(/\s+/g, ' ').trim();
  }

  // ==================== Syntax Highlighting ====================
  function highlightSQL(formatted) {
    // Store plain text for copying
    state.formattedPlainText = formatted;

    // Escape HTML
    let html = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight comments (must be first to avoid re-highlighting inside comments)
    html = html.replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sql-comment">$1</span>');

    // Highlight strings
    html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="sql-string">$1</span>');
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="sql-string">$1</span>');

    // Highlight numbers (not inside strings or comments)
    html = html.replace(/\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span class="sql-number">$1</span>');

    // Highlight functions
    const funcPattern = new RegExp('\\b(' + SQL_FUNCTIONS.join('|') + ')\\b(?=\\s*\\()', 'gi');
    html = html.replace(funcPattern, '<span class="sql-function">$1</span>');

    // Highlight keywords
    const kwPattern = new RegExp('\\b(' + SQL_KEYWORDS.join('|') + ')\\b', 'gi');
    html = html.replace(kwPattern, function(match) {
      // Don't highlight if already inside a span
      return '<span class="sql-keyword">' + match + '</span>';
    });

    return html;
  }

  // ==================== UI Updates ====================
  function updateInputStats() {
    const text = elements.sqlInput.value;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    elements.inputStats.textContent = chars + ' chars | ' + lines + ' lines';
  }

  function updateOutputStats(text) {
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    elements.outputStats.textContent = chars + ' chars | ' + lines + ' lines';
  }

  function showError(msg) {
    elements.errorMessage.textContent = msg;
    elements.errorPanel.classList.add('visible');
  }

  function hideError() {
    elements.errorPanel.classList.remove('visible');
  }

  function doFormat() {
    hideError();
    const input = elements.sqlInput.value.trim();
    if (!input) {
      elements.sqlOutput.innerHTML = '';
      state.formattedPlainText = '';
      updateOutputStats('');
      return;
    }

    try {
      const formatted = formatSQL(input);
      elements.sqlOutput.innerHTML = highlightSQL(formatted);
      updateOutputStats(formatted);
    } catch (err) {
      showError('Formatting error: ' + err.message);
    }
  }

  function doMinify() {
    hideError();
    const input = elements.sqlInput.value.trim();
    if (!input) {
      elements.sqlOutput.innerHTML = '';
      state.formattedPlainText = '';
      updateOutputStats('');
      return;
    }

    try {
      const minified = minifySQL(input);
      elements.sqlOutput.innerHTML = highlightSQL(minified);
      updateOutputStats(minified);
    } catch (err) {
      showError('Minify error: ' + err.message);
    }
  }

  // ==================== Sample Queries ====================
  const SAMPLE_QUERIES = [
    `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 20;`,

    `INSERT INTO products (name, description, price, category_id, created_at) VALUES ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 3, NOW());`,

    `UPDATE employees SET salary = salary * 1.10, updated_at = NOW() WHERE department_id IN (SELECT id FROM departments WHERE name = 'Engineering') AND performance_rating >= 4;`,

    `SELECT d.name AS department, COUNT(e.id) AS employee_count, AVG(e.salary) AS avg_salary, MAX(e.salary) AS max_salary FROM departments d LEFT JOIN employees e ON d.id = e.department_id WHERE d.active = TRUE GROUP BY d.name ORDER BY avg_salary DESC;`,

    `CREATE TABLE blog_posts (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT, author_id INTEGER REFERENCES users(id), category_id INTEGER, status VARCHAR(20) DEFAULT 'draft', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP);`
  ];

  let sampleIndex = 0;

  function loadSample() {
    elements.sqlInput.value = SAMPLE_QUERIES[sampleIndex % SAMPLE_QUERIES.length];
    sampleIndex++;
    updateInputStats();
    doFormat();
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast('Sample query loaded');
    }
  }

  // ==================== Event Listeners ====================
  function bindEvents() {
    elements.formatBtn.addEventListener('click', doFormat);
    elements.minifyBtn.addEventListener('click', doMinify);

    elements.sampleBtn.addEventListener('click', loadSample);

    elements.clearBtn.addEventListener('click', function() {
      elements.sqlInput.value = '';
      elements.sqlOutput.innerHTML = '';
      state.formattedPlainText = '';
      hideError();
      updateInputStats();
      updateOutputStats('');
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.showToast('Cleared');
      }
    });

    elements.copyBtn.addEventListener('click', function() {
      if (!state.formattedPlainText) {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Nothing to copy', 'warning');
        }
        return;
      }
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.copyWithToast(state.formattedPlainText, 'SQL copied to clipboard');
      } else {
        navigator.clipboard.writeText(state.formattedPlainText);
      }
    });

    elements.pasteBtn.addEventListener('click', async function() {
      try {
        const text = await navigator.clipboard.readText();
        elements.sqlInput.value = text;
        updateInputStats();
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Pasted from clipboard');
        }
      } catch (err) {
        if (typeof ToolsCommon !== 'undefined') {
          ToolsCommon.showToast('Cannot access clipboard', 'error');
        }
      }
    });

    elements.sqlInput.addEventListener('input', updateInputStats);

    // Options
    elements.indentSize.addEventListener('change', function() {
      state.indent = this.value;
      localStorage.setItem('sqlIndent', state.indent);
      if (state.formattedPlainText) doFormat();
    });

    elements.uppercaseKeywords.addEventListener('change', function() {
      state.uppercaseKeywords = this.checked;
      localStorage.setItem('sqlUppercase', state.uppercaseKeywords);
      if (state.formattedPlainText) doFormat();
    });

    elements.lineBreakAndOr.addEventListener('change', function() {
      state.lineBreakAndOr = this.checked;
      localStorage.setItem('sqlBreakAndOr', state.lineBreakAndOr);
      if (state.formattedPlainText) doFormat();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        doFormat();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        doMinify();
      }
    });

    // Tab support in textarea
    elements.sqlInput.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const tab = state.indent === 'tab' ? '\t' : ' '.repeat(parseInt(state.indent));
        this.value = this.value.substring(0, start) + tab + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + tab.length;
      }
    });
  }

  // ==================== Init ====================
  function init() {
    initElements();

    // Restore settings
    elements.indentSize.value = state.indent;
    elements.uppercaseKeywords.checked = state.uppercaseKeywords;
    elements.lineBreakAndOr.checked = state.lineBreakAndOr;

    bindEvents();
    updateInputStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
