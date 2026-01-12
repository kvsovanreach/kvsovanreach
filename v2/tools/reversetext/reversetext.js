/**
 * KVSOVANREACH Reverse Text Tool
 * Reverse and flip text in various ways
 */

(function() {
  'use strict';

  // ==================== Unicode Maps ====================

  // Upside down character map
  const UPSIDE_DOWN_MAP = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
    'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
    'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
    'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
    'A': '∀', 'B': 'q', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁',
    'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
    'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩',
    'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
    '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9',
    '7': 'ㄥ', '8': '8', '9': '6',
    '.': '˙', ',': '\'', '\'': ',', '"': '„', '`': ',', '?': '¿', '!': '¡',
    '[': ']', ']': '[', '(': ')', ')': '(', '{': '}', '}': '{',
    '<': '>', '>': '<', '&': '⅋', '_': '‾', ';': '؛', '∴': '∵'
  };

  // Mirror character map
  const MIRROR_MAP = {
    'a': 'ɒ', 'b': 'd', 'c': 'ɔ', 'd': 'b', 'e': 'ɘ', 'f': 'ꟻ', 'g': 'ǫ',
    'h': 'ʜ', 'i': 'i', 'j': 'ꞁ', 'k': 'ʞ', 'l': 'l', 'm': 'm', 'n': 'ᴎ',
    'o': 'o', 'p': 'q', 'q': 'p', 'r': 'ɿ', 's': 'ꙅ', 't': 'ƚ', 'u': 'u',
    'v': 'v', 'w': 'w', 'x': 'x', 'y': 'ʏ', 'z': 'ꙃ',
    'A': 'A', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ꟻ', 'G': 'Ꭾ',
    'H': 'H', 'I': 'I', 'J': 'Ⴑ', 'K': 'ꓘ', 'L': '⅃', 'M': 'M', 'N': 'ᴎ',
    'O': 'O', 'P': 'ꟼ', 'Q': 'Ọ', 'R': 'ᴙ', 'S': 'Ꙅ', 'T': 'T', 'U': 'U',
    'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Ꙃ',
    '1': '১', '2': 'ς', '3': 'Ɛ', '4': 'অ', '5': 'ट', '6': 'მ', '7': '٢',
    '?': '⸮', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
    '<': '>', '>': '<', '/': '\\', '\\': '/'
  };

  // ==================== DOM Elements ====================
  const elements = {
    inputText: document.getElementById('inputText'),
    charReverse: document.getElementById('charReverse'),
    wordReverse: document.getElementById('wordReverse'),
    eachWordReverse: document.getElementById('eachWordReverse'),
    upsideDown: document.getElementById('upsideDown'),
    mirror: document.getElementById('mirror'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    copyBtns: document.querySelectorAll('[data-copy]')
  };

  // ==================== Core Functions ====================

  function reverseString(str) {
    return [...str].reverse().join('');
  }

  function reverseWords(str) {
    return str.split(/\s+/).reverse().join(' ');
  }

  function reverseEachWord(str) {
    return str.split(/(\s+)/).map(part => {
      if (/\s+/.test(part)) return part;
      return reverseString(part);
    }).join('');
  }

  function toUpsideDown(str) {
    return [...str]
      .map(char => UPSIDE_DOWN_MAP[char] || char)
      .reverse()
      .join('');
  }

  function toMirror(str) {
    return [...str]
      .map(char => MIRROR_MAP[char] || char)
      .reverse()
      .join('');
  }

  function processInput() {
    const text = elements.inputText.value;

    if (!text.trim()) {
      elements.charReverse.innerHTML = '<span class="placeholder-text">Reversed text will appear here...</span>';
      elements.wordReverse.innerHTML = '<span class="placeholder-text">Reversed words will appear here...</span>';
      elements.eachWordReverse.innerHTML = '<span class="placeholder-text">Each word reversed will appear here...</span>';
      elements.upsideDown.innerHTML = '<span class="placeholder-text">Flipped text will appear here...</span>';
      elements.mirror.innerHTML = '<span class="placeholder-text">Mirrored text will appear here...</span>';
      return;
    }

    elements.charReverse.textContent = reverseString(text);
    elements.wordReverse.textContent = reverseWords(text);
    elements.eachWordReverse.textContent = reverseEachWord(text);
    elements.upsideDown.textContent = toUpsideDown(text);
    elements.mirror.textContent = toMirror(text);
  }

  // ==================== Event Handlers ====================

  function handleClear() {
    elements.inputText.value = '';
    processInput();
    ToolsCommon.Toast.show('Cleared', 'success');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputText.value = text;
      processInput();
      ToolsCommon.Toast.show('Pasted from clipboard', 'success');
    } catch (err) {
      ToolsCommon.Toast.show('Failed to paste', 'error');
    }
  }

  async function handleCopy(e) {
    const targetId = e.currentTarget.dataset.copy;
    const element = document.getElementById(targetId);
    const text = element?.textContent;

    if (!text || element.querySelector('.placeholder-text')) {
      ToolsCommon.Toast.show('Nothing to copy', 'error');
      return;
    }

    await ToolsCommon.Clipboard.copyWithToast(text, 'Copied to clipboard!');
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;

    const outputIds = ['charReverse', 'wordReverse', 'eachWordReverse', 'upsideDown', 'mirror'];

    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      const element = document.getElementById(outputIds[index]);
      const text = element?.textContent;

      if (text && !element.querySelector('.placeholder-text')) {
        ToolsCommon.Clipboard.copyWithToast(text, 'Copied to clipboard!');
      }
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.inputText?.addEventListener('input', ToolsCommon.debounce(processInput, 100));
    elements.clearBtn?.addEventListener('click', handleClear);
    elements.pasteBtn?.addEventListener('click', handlePaste);

    elements.copyBtns.forEach(btn => {
      btn.addEventListener('click', handleCopy);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
