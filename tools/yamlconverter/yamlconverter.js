/**
 * KVSOVANREACH YAML Converter Tool
 * Bidirectional YAML/JSON converter with validation
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    jsonIndent: parseInt(localStorage.getItem('yamlJsonIndent') || '2')
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.yamlInput = document.getElementById('yamlInput');
    elements.jsonInput = document.getElementById('jsonInput');
    elements.yamlToJsonBtn = document.getElementById('yamlToJsonBtn');
    elements.jsonToYamlBtn = document.getElementById('jsonToYamlBtn');
    elements.yamlCopyBtn = document.getElementById('yamlCopyBtn');
    elements.jsonCopyBtn = document.getElementById('jsonCopyBtn');
    elements.yamlPasteBtn = document.getElementById('yamlPasteBtn');
    elements.jsonPasteBtn = document.getElementById('jsonPasteBtn');
    elements.sampleBtn = document.getElementById('sampleBtn');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.swapBtn = document.getElementById('swapBtn');
    elements.jsonIndent = document.getElementById('jsonIndent');
    elements.yamlStats = document.getElementById('yamlStats');
    elements.jsonStats = document.getElementById('jsonStats');
    elements.yamlStatus = document.getElementById('yamlStatus');
    elements.jsonStatus = document.getElementById('jsonStatus');
    elements.errorPanel = document.getElementById('errorPanel');
    elements.errorMessage = document.getElementById('errorMessage');
  }

  // ==================== YAML Parser ====================

  /**
   * Simple YAML parser supporting:
   * - Objects (key: value)
   * - Arrays (- item)
   * - Strings (plain, single-quoted, double-quoted)
   * - Numbers, booleans, null
   * - Nested objects and arrays
   * - Multi-line strings (| and >)
   * - Comments (#)
   */
  function parseYAML(yamlStr) {
    const lines = yamlStr.split('\n');
    let lineIndex = 0;

    function currentLine() {
      return lineIndex < lines.length ? lines[lineIndex] : null;
    }

    function getIndent(line) {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }

    function stripComment(line) {
      // Remove inline comments but not # inside strings
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "'" && !inDouble) inSingle = !inSingle;
        if (line[i] === '"' && !inSingle) inDouble = !inDouble;
        if (line[i] === '#' && !inSingle && !inDouble) {
          // Only treat as comment if preceded by whitespace or at start
          if (i === 0 || /\s/.test(line[i - 1])) {
            return line.substring(0, i).trimEnd();
          }
        }
      }
      return line;
    }

    function parseValue(valStr) {
      valStr = valStr.trim();

      if (valStr === '' || valStr === '~' || valStr === 'null' || valStr === 'Null' || valStr === 'NULL') {
        return null;
      }
      if (valStr === 'true' || valStr === 'True' || valStr === 'TRUE' || valStr === 'yes' || valStr === 'Yes' || valStr === 'YES') {
        return true;
      }
      if (valStr === 'false' || valStr === 'False' || valStr === 'FALSE' || valStr === 'no' || valStr === 'No' || valStr === 'NO') {
        return false;
      }

      // Quoted strings
      if ((valStr.startsWith("'") && valStr.endsWith("'")) ||
          (valStr.startsWith('"') && valStr.endsWith('"'))) {
        return valStr.slice(1, -1);
      }

      // Numbers
      if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(valStr)) {
        const num = Number(valStr);
        if (!isNaN(num)) return num;
      }

      // Inline array [a, b, c]
      if (valStr.startsWith('[') && valStr.endsWith(']')) {
        return parseInlineArray(valStr);
      }

      // Inline object {a: 1, b: 2}
      if (valStr.startsWith('{') && valStr.endsWith('}')) {
        return parseInlineObject(valStr);
      }

      return valStr;
    }

    function parseInlineArray(str) {
      str = str.slice(1, -1).trim();
      if (!str) return [];
      const items = smartSplit(str, ',');
      return items.map(function(item) { return parseValue(item.trim()); });
    }

    function parseInlineObject(str) {
      str = str.slice(1, -1).trim();
      if (!str) return {};
      const pairs = smartSplit(str, ',');
      const obj = {};
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) {
          throw new Error('Invalid inline object syntax: ' + pair);
        }
        const key = pair.substring(0, colonIdx).trim();
        const val = pair.substring(colonIdx + 1).trim();
        obj[key] = parseValue(val);
      }
      return obj;
    }

    function smartSplit(str, delimiter) {
      const results = [];
      let depth = 0;
      let current = '';
      let inSingle = false;
      let inDouble = false;

      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === "'" && !inDouble) inSingle = !inSingle;
        if (ch === '"' && !inSingle) inDouble = !inDouble;
        if (!inSingle && !inDouble) {
          if (ch === '[' || ch === '{') depth++;
          if (ch === ']' || ch === '}') depth--;
        }
        if (ch === delimiter && depth === 0 && !inSingle && !inDouble) {
          results.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      if (current) results.push(current);
      return results;
    }

    function parseMultiLineString(style, baseIndent) {
      // style: '|' (literal) or '>' (folded)
      const contentLines = [];
      while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        // Empty line within block
        if (line.trim() === '') {
          contentLines.push('');
          lineIndex++;
          continue;
        }
        const indent = getIndent(line);
        if (indent <= baseIndent) break;
        contentLines.push(line.substring(baseIndent + 2));
        lineIndex++;
      }

      // Remove trailing empty lines
      while (contentLines.length > 0 && contentLines[contentLines.length - 1] === '') {
        contentLines.pop();
      }

      if (style === '|') {
        return contentLines.join('\n');
      } else {
        // Folded: join with spaces, but preserve empty lines as newlines
        let result = '';
        for (let i = 0; i < contentLines.length; i++) {
          if (contentLines[i] === '') {
            result += '\n';
          } else {
            if (result && !result.endsWith('\n')) result += ' ';
            result += contentLines[i];
          }
        }
        return result;
      }
    }

    function parseBlock(minIndent) {
      // Peek at current line to determine type
      while (lineIndex < lines.length) {
        const line = currentLine();
        if (line === null) return null;
        const trimmed = stripComment(line).trim();
        if (trimmed === '' || trimmed.startsWith('#')) {
          lineIndex++;
          continue;
        }
        break;
      }

      if (lineIndex >= lines.length) return null;

      const line = currentLine();
      const trimmed = stripComment(line).trim();
      const indent = getIndent(line);

      if (indent < minIndent) return null;

      // Determine if array or object
      if (trimmed.startsWith('- ') || trimmed === '-') {
        return parseArray(indent);
      } else if (trimmed.includes(':')) {
        return parseObject(indent);
      } else {
        return parseValue(trimmed);
      }
    }

    function parseArray(expectedIndent) {
      const arr = [];

      while (lineIndex < lines.length) {
        const line = currentLine();
        if (line === null) break;
        const trimmed = stripComment(line).trim();

        if (trimmed === '' || trimmed.startsWith('#')) {
          lineIndex++;
          continue;
        }

        const indent = getIndent(line);
        if (indent < expectedIndent) break;
        if (indent > expectedIndent) break;

        if (!trimmed.startsWith('-')) break;

        const afterDash = trimmed.substring(1).trim();
        lineIndex++;

        if (afterDash === '' || afterDash === '') {
          // Nested value on next lines
          const nested = parseBlock(indent + 1);
          arr.push(nested);
        } else if (afterDash.includes(':') && !afterDash.startsWith("'") && !afterDash.startsWith('"') &&
                   !afterDash.startsWith('[') && !afterDash.startsWith('{')) {
          // Inline object after dash: - key: value
          lineIndex--; // Back up
          const objLine = lines[lineIndex];
          const dashPos = objLine.indexOf('-');
          // Parse as object with adjusted indent
          const subIndent = dashPos + 2;
          // Create a temporary inline object
          const colonIdx = afterDash.indexOf(':');
          const key = afterDash.substring(0, colonIdx).trim();
          const valStr = afterDash.substring(colonIdx + 1).trim();
          lineIndex++;

          const obj = {};
          if (valStr === '' || valStr === '|' || valStr === '>') {
            if (valStr === '|' || valStr === '>') {
              obj[key] = parseMultiLineString(valStr, indent);
            } else {
              obj[key] = parseBlock(subIndent);
            }
          } else {
            obj[key] = parseValue(valStr);
          }

          // Continue reading additional keys at subIndent level
          while (lineIndex < lines.length) {
            const nextLine = currentLine();
            if (nextLine === null) break;
            const nextTrimmed = stripComment(nextLine).trim();
            if (nextTrimmed === '' || nextTrimmed.startsWith('#')) {
              lineIndex++;
              continue;
            }
            const nextIndent = getIndent(nextLine);
            if (nextIndent < subIndent) break;
            if (nextIndent !== subIndent) break;
            if (!nextTrimmed.includes(':') || nextTrimmed.startsWith('-')) break;

            const cIdx = nextTrimmed.indexOf(':');
            const nKey = nextTrimmed.substring(0, cIdx).trim();
            const nVal = nextTrimmed.substring(cIdx + 1).trim();
            lineIndex++;

            if (nVal === '' || nVal === '|' || nVal === '>') {
              if (nVal === '|' || nVal === '>') {
                obj[nKey] = parseMultiLineString(nVal, nextIndent);
              } else {
                obj[nKey] = parseBlock(nextIndent + 1);
              }
            } else {
              obj[nKey] = parseValue(nVal);
            }
          }

          arr.push(obj);
        } else {
          arr.push(parseValue(afterDash));
        }
      }

      return arr;
    }

    function parseObject(expectedIndent) {
      const obj = {};

      while (lineIndex < lines.length) {
        const line = currentLine();
        if (line === null) break;
        const trimmed = stripComment(line).trim();

        if (trimmed === '' || trimmed.startsWith('#')) {
          lineIndex++;
          continue;
        }

        const indent = getIndent(line);
        if (indent < expectedIndent) break;
        if (indent > expectedIndent) break;

        // Must contain a colon and not start with -
        if (trimmed.startsWith('-') || !trimmed.includes(':')) break;

        const colonIdx = trimmed.indexOf(':');
        let key = trimmed.substring(0, colonIdx).trim();
        const valStr = trimmed.substring(colonIdx + 1).trim();

        // Strip quotes from key
        if ((key.startsWith("'") && key.endsWith("'")) ||
            (key.startsWith('"') && key.endsWith('"'))) {
          key = key.slice(1, -1);
        }

        lineIndex++;

        if (valStr === '|' || valStr === '>') {
          obj[key] = parseMultiLineString(valStr, indent);
        } else if (valStr === '') {
          // Nested structure
          const nested = parseBlock(indent + 1);
          obj[key] = nested !== null ? nested : null;
        } else {
          obj[key] = parseValue(valStr);
        }
      }

      return obj;
    }

    // Skip leading empty lines / comments
    const result = parseBlock(0);
    return result;
  }

  // ==================== YAML Serializer ====================
  function toYAML(data, indent) {
    indent = indent || 0;
    const prefix = '  '.repeat(indent);

    if (data === null || data === undefined) return 'null';
    if (typeof data === 'boolean') return data ? 'true' : 'false';
    if (typeof data === 'number') return String(data);

    if (typeof data === 'string') {
      // Check if needs quoting
      if (data === '' ||
          data === 'true' || data === 'false' ||
          data === 'null' || data === 'yes' || data === 'no' ||
          data === 'True' || data === 'False' || data === 'Null' ||
          /^-?\d+(\.\d+)?$/.test(data) ||
          data.includes(': ') || data.includes('#') ||
          data.startsWith('- ') || data.startsWith('{') || data.startsWith('[') ||
          data.includes('\n')) {
        if (data.includes('\n')) {
          // Use literal block scalar
          const lines = data.split('\n');
          return '|\n' + lines.map(function(l) { return prefix + '  ' + l; }).join('\n');
        }
        // Use double quotes, escape special chars
        const escaped = data
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t');
        return '"' + escaped + '"';
      }
      return data;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return '[]';
      const lines = [];
      for (const item of data) {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          const keys = Object.keys(item);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstVal = serializeYAMLValue(item[firstKey], indent + 1);
            if (firstVal.startsWith('\n')) {
              lines.push(prefix + '- ' + firstKey + ':' + firstVal);
            } else {
              lines.push(prefix + '- ' + firstKey + ': ' + firstVal);
            }
            for (let k = 1; k < keys.length; k++) {
              const val = serializeYAMLValue(item[keys[k]], indent + 1);
              if (val.startsWith('\n')) {
                lines.push(prefix + '  ' + keys[k] + ':' + val);
              } else {
                lines.push(prefix + '  ' + keys[k] + ': ' + val);
              }
            }
          } else {
            lines.push(prefix + '- {}');
          }
        } else if (Array.isArray(item)) {
          const subYaml = toYAML(item, indent + 1);
          lines.push(prefix + '-\n' + subYaml);
        } else {
          const val = toYAML(item, indent + 1);
          lines.push(prefix + '- ' + val);
        }
      }
      return lines.join('\n');
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) return '{}';
      const lines = [];
      for (const key of keys) {
        const yamlKey = needsQuoting(key) ? '"' + key.replace(/"/g, '\\"') + '"' : key;
        const val = serializeYAMLValue(data[key], indent);
        if (val.startsWith('\n')) {
          lines.push(prefix + yamlKey + ':' + val);
        } else {
          lines.push(prefix + yamlKey + ': ' + val);
        }
      }
      return lines.join('\n');
    }

    return String(data);
  }

  function serializeYAMLValue(value, indent) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);

    if (typeof value === 'string') {
      return toYAML(value, indent);
    }

    if (Array.isArray(value) || typeof value === 'object') {
      const serialized = toYAML(value, indent + 1);
      return '\n' + serialized;
    }

    return String(value);
  }

  function needsQuoting(key) {
    if (!key || key === '') return true;
    if (/^[\w.-]+$/.test(key)) return false;
    return true;
  }

  // ==================== Conversion Functions ====================
  function convertYAMLtoJSON() {
    hideError();
    const yamlStr = elements.yamlInput.value.trim();
    if (!yamlStr) {
      elements.jsonInput.value = '';
      setStatus('yaml', 'ready');
      setStatus('json', 'ready');
      updateStats();
      return;
    }

    try {
      const data = parseYAML(yamlStr);
      const indent = state.jsonIndent;
      elements.jsonInput.value = JSON.stringify(data, null, indent);
      setStatus('yaml', 'valid');
      setStatus('json', 'valid');
    } catch (err) {
      setStatus('yaml', 'invalid');
      showError('YAML parse error: ' + err.message);
    }
    updateStats();
  }

  function convertJSONtoYAML() {
    hideError();
    const jsonStr = elements.jsonInput.value.trim();
    if (!jsonStr) {
      elements.yamlInput.value = '';
      setStatus('yaml', 'ready');
      setStatus('json', 'ready');
      updateStats();
      return;
    }

    try {
      const data = JSON.parse(jsonStr);
      const yaml = toYAML(data, 0);
      elements.yamlInput.value = yaml;
      setStatus('json', 'valid');
      setStatus('yaml', 'valid');
    } catch (err) {
      setStatus('json', 'invalid');
      // Try to find line number from error
      let msg = 'JSON parse error: ' + err.message;
      const posMatch = err.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const beforeError = jsonStr.substring(0, pos);
        const lineNum = beforeError.split('\n').length;
        msg += ' (line ' + lineNum + ')';
      }
      showError(msg);
    }
    updateStats();
  }

  // ==================== UI Helpers ====================
  function setStatus(panel, statusType) {
    const el = panel === 'yaml' ? elements.yamlStatus : elements.jsonStatus;
    el.className = 'status-indicator';
    const icon = el.querySelector('i');
    const text = el.querySelector('span');

    if (statusType === 'valid') {
      el.classList.add('valid');
      icon.className = 'fa-solid fa-circle-check';
      text.textContent = 'Valid';
    } else if (statusType === 'invalid') {
      el.classList.add('invalid');
      icon.className = 'fa-solid fa-circle-xmark';
      text.textContent = 'Invalid';
    } else {
      icon.className = 'fa-solid fa-circle';
      text.textContent = 'Ready';
    }
  }

  function updateStats() {
    elements.yamlStats.textContent = elements.yamlInput.value.length + ' chars';
    elements.jsonStats.textContent = elements.jsonInput.value.length + ' chars';
  }

  function showError(msg) {
    elements.errorMessage.textContent = msg;
    elements.errorPanel.classList.add('visible');
  }

  function hideError() {
    elements.errorPanel.classList.remove('visible');
  }

  function toast(msg, type) {
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.showToast(msg, type);
    }
  }

  function copyText(text, label) {
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.copyWithToast(text, label + ' copied to clipboard');
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  // ==================== Sample Data ====================
  const SAMPLES = [
    {
      yaml: `# Application configuration
app:
  name: MyWebApp
  version: 2.1.0
  debug: false

server:
  host: 0.0.0.0
  port: 8080
  workers: 4

database:
  engine: postgresql
  host: localhost
  port: 5432
  name: myapp_db
  credentials:
    username: admin
    password: secret123

features:
  - authentication
  - notifications
  - analytics

logging:
  level: info
  format: json
  outputs:
    - console
    - file`,
      json: null
    },
    {
      yaml: `# Team roster
team:
  name: Engineering
  lead: Jane Smith
  members:
    - name: Alice Johnson
      role: Backend Developer
      skills:
        - Python
        - Go
        - PostgreSQL
    - name: Bob Williams
      role: Frontend Developer
      skills:
        - TypeScript
        - React
        - CSS
    - name: Charlie Brown
      role: DevOps Engineer
      skills:
        - Docker
        - Kubernetes
        - Terraform

sprints:
  current: 42
  velocity: 34
  active: true`,
      json: null
    }
  ];

  let sampleIndex = 0;

  function loadSample() {
    const sample = SAMPLES[sampleIndex % SAMPLES.length];
    elements.yamlInput.value = sample.yaml;
    sampleIndex++;
    convertYAMLtoJSON();
    toast('Sample data loaded');
  }

  // ==================== Event Listeners ====================
  function bindEvents() {
    elements.yamlToJsonBtn.addEventListener('click', convertYAMLtoJSON);
    elements.jsonToYamlBtn.addEventListener('click', convertJSONtoYAML);

    elements.sampleBtn.addEventListener('click', loadSample);

    elements.clearBtn.addEventListener('click', function() {
      elements.yamlInput.value = '';
      elements.jsonInput.value = '';
      hideError();
      setStatus('yaml', 'ready');
      setStatus('json', 'ready');
      updateStats();
      toast('Cleared');
    });

    elements.swapBtn.addEventListener('click', function() {
      const yamlVal = elements.yamlInput.value;
      const jsonVal = elements.jsonInput.value;
      elements.yamlInput.value = jsonVal;
      elements.jsonInput.value = yamlVal;
      hideError();
      setStatus('yaml', 'ready');
      setStatus('json', 'ready');
      updateStats();
      toast('Sides swapped');
    });

    elements.yamlCopyBtn.addEventListener('click', function() {
      const text = elements.yamlInput.value;
      if (!text) { toast('Nothing to copy', 'warning'); return; }
      copyText(text, 'YAML');
    });

    elements.jsonCopyBtn.addEventListener('click', function() {
      const text = elements.jsonInput.value;
      if (!text) { toast('Nothing to copy', 'warning'); return; }
      copyText(text, 'JSON');
    });

    elements.yamlPasteBtn.addEventListener('click', async function() {
      try {
        const text = await navigator.clipboard.readText();
        elements.yamlInput.value = text;
        updateStats();
        toast('Pasted from clipboard');
      } catch (err) {
        toast('Cannot access clipboard', 'error');
      }
    });

    elements.jsonPasteBtn.addEventListener('click', async function() {
      try {
        const text = await navigator.clipboard.readText();
        elements.jsonInput.value = text;
        updateStats();
        toast('Pasted from clipboard');
      } catch (err) {
        toast('Cannot access clipboard', 'error');
      }
    });

    elements.jsonIndent.addEventListener('change', function() {
      state.jsonIndent = parseInt(this.value);
      localStorage.setItem('yamlJsonIndent', state.jsonIndent);
      // Re-format JSON if present
      const jsonStr = elements.jsonInput.value.trim();
      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr);
          elements.jsonInput.value = JSON.stringify(data, null, state.jsonIndent);
          updateStats();
        } catch (e) {
          // Ignore if invalid
        }
      }
    });

    // Auto-convert on input (debounced)
    let yamlTimer = null;
    let jsonTimer = null;

    elements.yamlInput.addEventListener('input', function() {
      updateStats();
      clearTimeout(yamlTimer);
      yamlTimer = setTimeout(function() {
        if (elements.yamlInput.value.trim()) {
          convertYAMLtoJSON();
        }
      }, 500);
    });

    elements.jsonInput.addEventListener('input', function() {
      updateStats();
      clearTimeout(jsonTimer);
      jsonTimer = setTimeout(function() {
        if (elements.jsonInput.value.trim()) {
          convertJSONtoYAML();
        }
      }, 500);
    });

    // Tab support in textareas
    [elements.yamlInput, elements.jsonInput].forEach(function(textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;
          this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
          this.selectionStart = this.selectionEnd = start + 2;
        }
      });
    });
  }

  // ==================== Init ====================
  function init() {
    initElements();

    // Restore settings
    elements.jsonIndent.value = state.jsonIndent;

    bindEvents();
    updateStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
