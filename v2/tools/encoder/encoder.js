/**
 * Encoder/Decoder Tool
 * Supports Base64, URL, Hash, JWT, Hex, Binary, HTML entities, Unicode
 * With real-time encoding, auto-detect, file upload, and more
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // State
  // ============================================
  const state = {
    activeTab: 'base64',
    moreEncodingType: 'hex',
    isDarkMode: localStorage.getItem('theme') === 'dark',
    lastEncodeMode: {}, // Track last encode/decode mode per tab
    history: JSON.parse(localStorage.getItem('encoderHistory') || '[]'),
    historyCollapsed: localStorage.getItem('historyCollapsed') === 'true'
  };

  const MAX_HISTORY = 50; // Maximum history items

  // ============================================
  // Sample Data
  // ============================================
  const sampleData = {
    base64: 'Hello, World! This is a sample text for Base64 encoding.',
    url: 'https://example.com/search?q=hello world&lang=en&special=!@#$%',
    hash: 'password123',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4S5J2V-4b5Fh3L8a9GhB_VlKzC3o4gG8y8aP3kL2XYw',
    hex: 'Hello, Hex!',
    binary: 'Binary!',
    html: '<script>alert("XSS")</script>',
    unicode: 'Hello 你好 مرحبا 🎉'
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Tabs
    tabs: document.querySelectorAll('.encoder-tab'),
    panels: document.querySelectorAll('.encoder-panel'),

    // Base64
    base64Input: document.getElementById('base64Input'),
    base64Output: document.getElementById('base64Output'),
    base64InputCount: document.getElementById('base64InputCount'),
    base64OutputCount: document.getElementById('base64OutputCount'),
    base64InputBytes: document.getElementById('base64InputBytes'),
    base64OutputBytes: document.getElementById('base64OutputBytes'),
    base64DetectedFormat: document.getElementById('base64DetectedFormat'),
    base64EncodeBtn: document.getElementById('base64EncodeBtn'),
    base64DecodeBtn: document.getElementById('base64DecodeBtn'),
    base64SwapBtn: document.getElementById('base64SwapBtn'),
    base64SampleBtn: document.getElementById('base64SampleBtn'),
    base64FileBtn: document.getElementById('base64FileBtn'),
    base64FileInput: document.getElementById('base64FileInput'),
    base64PasteBtn: document.getElementById('base64PasteBtn'),
    base64CopyBtn: document.getElementById('base64CopyBtn'),
    base64ClearInputBtn: document.getElementById('base64ClearInputBtn'),
    base64ClearOutputBtn: document.getElementById('base64ClearOutputBtn'),
    base64UrlSafe: document.getElementById('base64UrlSafe'),
    base64RealTime: document.getElementById('base64RealTime'),

    // URL
    urlInput: document.getElementById('urlInput'),
    urlOutput: document.getElementById('urlOutput'),
    urlInputCount: document.getElementById('urlInputCount'),
    urlOutputCount: document.getElementById('urlOutputCount'),
    urlInputBytes: document.getElementById('urlInputBytes'),
    urlOutputBytes: document.getElementById('urlOutputBytes'),
    urlDetectedFormat: document.getElementById('urlDetectedFormat'),
    urlEncodeBtn: document.getElementById('urlEncodeBtn'),
    urlDecodeBtn: document.getElementById('urlDecodeBtn'),
    urlSwapBtn: document.getElementById('urlSwapBtn'),
    urlSampleBtn: document.getElementById('urlSampleBtn'),
    urlPasteBtn: document.getElementById('urlPasteBtn'),
    urlCopyBtn: document.getElementById('urlCopyBtn'),
    urlClearInputBtn: document.getElementById('urlClearInputBtn'),
    urlClearOutputBtn: document.getElementById('urlClearOutputBtn'),
    urlEncodeComponent: document.getElementById('urlEncodeComponent'),
    urlRealTime: document.getElementById('urlRealTime'),

    // Hash
    hashInput: document.getElementById('hashInput'),
    hashInputCount: document.getElementById('hashInputCount'),
    hashInputBytes: document.getElementById('hashInputBytes'),
    hashGenerateBtn: document.getElementById('hashGenerateBtn'),
    hashSampleBtn: document.getElementById('hashSampleBtn'),
    hashPasteBtn: document.getElementById('hashPasteBtn'),
    hashClearBtn: document.getElementById('hashClearBtn'),
    hashMd5: document.getElementById('hashMd5'),
    hashSha1: document.getElementById('hashSha1'),
    hashSha256: document.getElementById('hashSha256'),
    hashSha512: document.getElementById('hashSha512'),
    hashCopyBtns: document.querySelectorAll('.copy-hash-btn'),
    hashCopyAllBtn: document.getElementById('hashCopyAllBtn'),
    hashCompareInput: document.getElementById('hashCompareInput'),
    hashCompareResult: document.getElementById('hashCompareResult'),

    // JWT
    jwtInput: document.getElementById('jwtInput'),
    jwtInputCount: document.getElementById('jwtInputCount'),
    jwtDecodeBtn: document.getElementById('jwtDecodeBtn'),
    jwtSampleBtn: document.getElementById('jwtSampleBtn'),
    jwtPasteBtn: document.getElementById('jwtPasteBtn'),
    jwtClearBtn: document.getElementById('jwtClearBtn'),
    jwtResults: document.getElementById('jwtResults'),
    jwtError: document.getElementById('jwtError'),
    jwtHeader: document.getElementById('jwtHeader'),
    jwtPayload: document.getElementById('jwtPayload'),
    jwtSignature: document.getElementById('jwtSignature'),
    jwtAlg: document.getElementById('jwtAlg'),
    jwtClaims: document.getElementById('jwtClaims'),
    jwtCopyHeader: document.getElementById('jwtCopyHeader'),
    jwtCopyPayload: document.getElementById('jwtCopyPayload'),

    // More
    moreInput: document.getElementById('moreInput'),
    moreOutput: document.getElementById('moreOutput'),
    moreInputCount: document.getElementById('moreInputCount'),
    moreOutputCount: document.getElementById('moreOutputCount'),
    moreInputBytes: document.getElementById('moreInputBytes'),
    moreOutputBytes: document.getElementById('moreOutputBytes'),
    moreDetectedFormat: document.getElementById('moreDetectedFormat'),
    moreEncodeBtn: document.getElementById('moreEncodeBtn'),
    moreDecodeBtn: document.getElementById('moreDecodeBtn'),
    moreSwapBtn: document.getElementById('moreSwapBtn'),
    moreSampleBtn: document.getElementById('moreSampleBtn'),
    morePasteBtn: document.getElementById('morePasteBtn'),
    moreCopyBtn: document.getElementById('moreCopyBtn'),
    moreClearInputBtn: document.getElementById('moreClearInputBtn'),
    moreClearOutputBtn: document.getElementById('moreClearOutputBtn'),
    encodingTypeBtns: document.querySelectorAll('.encoding-type-btn'),
    moreRealTime: document.getElementById('moreRealTime'),

    // Toast
    toast: document.getElementById('toast'),

    // History
    historySidebar: document.getElementById('historySidebar'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    historyClearBtn: document.getElementById('historyClearBtn'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyShowBtn: document.getElementById('historyShowBtn'),
    historyFab: document.getElementById('historyFab'),
    historyBadge: document.getElementById('historyBadge'),
    historyOverlay: document.getElementById('historyOverlay')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initTabs();
    initBase64();
    initURL();
    initHash();
    initJWT();
    initMore();
    initHistory();
    initKeyboardShortcuts();
  }

  // ============================================
  // Tab Navigation
  // ============================================
  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;

    // Update tabs
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panels
    elements.panels.forEach(panel => {
      const panelId = panel.id.replace('Panel', '');
      panel.classList.toggle('active', panelId === tabName);
    });
  }

  // ============================================
  // Debounce utility
  // ============================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // UTF-8 Encoding Utilities (replacing deprecated escape/unescape)
  // ============================================
  function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUtf8(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // ============================================
  // Format Detection
  // ============================================
  function detectFormat(text) {
    if (!text || text.length < 2) return null;

    // Base64 detection
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    const base64UrlRegex = /^[A-Za-z0-9_-]+=*$/;
    if ((base64Regex.test(text) || base64UrlRegex.test(text)) && text.length >= 4 && text.length % 4 <= 2) {
      try {
        const decoded = base64ToUtf8(text.replace(/-/g, '+').replace(/_/g, '/'));
        if (decoded && /^[\x20-\x7E\s]+$/.test(decoded)) {
          return 'Base64';
        }
      } catch (e) {}
    }

    // URL encoded detection
    if (/%[0-9A-Fa-f]{2}/.test(text)) {
      return 'URL Encoded';
    }

    // Hex detection
    if (/^([0-9A-Fa-f]{2}\s?)+$/.test(text.trim())) {
      return 'Hex';
    }

    // Binary detection
    if (/^([01]{8}\s?)+$/.test(text.trim())) {
      return 'Binary';
    }

    // HTML entities detection
    if (/&#\d+;/.test(text) || /&\w+;/.test(text)) {
      return 'HTML Entities';
    }

    // Unicode detection
    if (/U\+[0-9A-Fa-f]{4,}/.test(text)) {
      return 'Unicode';
    }

    // JWT detection
    if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text)) {
      return 'JWT';
    }

    return null;
  }

  function updateDetectedFormat(input, formatElement) {
    const format = detectFormat(input.value);
    if (format && formatElement) {
      formatElement.textContent = format;
      formatElement.classList.add('show');
    } else if (formatElement) {
      formatElement.classList.remove('show');
    }
  }

  // ============================================
  // Byte Count Utility
  // ============================================
  function getByteLength(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).length;
  }

  function updateCounts(input, charCountEl, byteCountEl) {
    if (charCountEl) {
      charCountEl.textContent = input.value.length;
    }
    if (byteCountEl) {
      byteCountEl.textContent = getByteLength(input.value);
    }
  }

  // ============================================
  // Base64 Encoding/Decoding
  // ============================================
  function initBase64() {
    // Real-time encoding with debounce
    const realTimeEncode = debounce(() => {
      if (elements.base64RealTime?.checked && elements.base64Input.value) {
        const mode = state.lastEncodeMode.base64 || 'encode';
        if (mode === 'encode') {
          doBase64Encode(false);
        } else {
          doBase64Decode(false);
        }
      }
    }, 300);

    // Character/byte count and format detection
    elements.base64Input?.addEventListener('input', () => {
      updateCounts(elements.base64Input, elements.base64InputCount, elements.base64InputBytes);
      updateDetectedFormat(elements.base64Input, elements.base64DetectedFormat);
      realTimeEncode();
    });

    elements.base64Output?.addEventListener('input', () => {
      updateCounts(elements.base64Output, elements.base64OutputCount, elements.base64OutputBytes);
    });

    // Encode
    elements.base64EncodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.base64 = 'encode';
      doBase64Encode(true);
    });

    // Decode
    elements.base64DecodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.base64 = 'decode';
      doBase64Decode(true);
    });

    // Swap
    elements.base64SwapBtn?.addEventListener('click', () => {
      swapInputOutput(
        elements.base64Input, elements.base64Output,
        elements.base64InputCount, elements.base64OutputCount,
        elements.base64InputBytes, elements.base64OutputBytes
      );
      updateDetectedFormat(elements.base64Input, elements.base64DetectedFormat);
    });

    // Sample
    elements.base64SampleBtn?.addEventListener('click', () => {
      elements.base64Input.value = sampleData.base64;
      updateCounts(elements.base64Input, elements.base64InputCount, elements.base64InputBytes);
      updateDetectedFormat(elements.base64Input, elements.base64DetectedFormat);
      showToast('Sample data loaded', 'success');
    });

    // File upload
    elements.base64FileBtn?.addEventListener('click', () => {
      elements.base64FileInput?.click();
    });

    elements.base64FileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          elements.base64Output.value = base64;
          updateCounts(elements.base64Output, elements.base64OutputCount, elements.base64OutputBytes);
          showToast(`File encoded: ${file.name}`, 'success');
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    });

    // Paste
    elements.base64PasteBtn?.addEventListener('click', () => {
      pasteToInput(elements.base64Input, elements.base64InputCount, elements.base64InputBytes);
    });

    // Copy
    elements.base64CopyBtn?.addEventListener('click', () => {
      copyOutput(elements.base64Output);
    });

    // Clear
    elements.base64ClearInputBtn?.addEventListener('click', () => {
      clearInput(elements.base64Input, elements.base64InputCount, elements.base64InputBytes);
      elements.base64DetectedFormat?.classList.remove('show');
    });

    elements.base64ClearOutputBtn?.addEventListener('click', () => {
      clearInput(elements.base64Output, elements.base64OutputCount, elements.base64OutputBytes);
    });
  }

  function doBase64Encode(showMessage = true) {
    const input = elements.base64Input.value;
    if (!input) {
      if (showMessage) showToast('Please enter text to encode', 'warning');
      return;
    }
    try {
      let encoded = utf8ToBase64(input);
      // URL-safe Base64
      if (elements.base64UrlSafe?.checked) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      elements.base64Output.value = encoded;
      updateCounts(elements.base64Output, elements.base64OutputCount, elements.base64OutputBytes);
      if (showMessage) {
        addToHistory('base64', 'encode', input, encoded);
        showToast('Encoded to Base64', 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Encoding failed: ' + e.message, 'error');
    }
  }

  function doBase64Decode(showMessage = true) {
    const input = elements.base64Input.value;
    if (!input) {
      if (showMessage) showToast('Please enter Base64 to decode', 'warning');
      return;
    }
    try {
      // Handle URL-safe Base64
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const decoded = base64ToUtf8(base64);
      elements.base64Output.value = decoded;
      updateCounts(elements.base64Output, elements.base64OutputCount, elements.base64OutputBytes);
      if (showMessage) {
        addToHistory('base64', 'decode', input, decoded);
        showToast('Decoded from Base64', 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Invalid Base64 string', 'error');
    }
  }

  // ============================================
  // URL Encoding/Decoding
  // ============================================
  function initURL() {
    // Real-time encoding with debounce
    const realTimeEncode = debounce(() => {
      if (elements.urlRealTime?.checked && elements.urlInput.value) {
        const mode = state.lastEncodeMode.url || 'encode';
        if (mode === 'encode') {
          doURLEncode(false);
        } else {
          doURLDecode(false);
        }
      }
    }, 300);

    // Character/byte count and format detection
    elements.urlInput?.addEventListener('input', () => {
      updateCounts(elements.urlInput, elements.urlInputCount, elements.urlInputBytes);
      updateDetectedFormat(elements.urlInput, elements.urlDetectedFormat);
      realTimeEncode();
    });

    elements.urlOutput?.addEventListener('input', () => {
      updateCounts(elements.urlOutput, elements.urlOutputCount, elements.urlOutputBytes);
    });

    // Encode
    elements.urlEncodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.url = 'encode';
      doURLEncode(true);
    });

    // Decode
    elements.urlDecodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.url = 'decode';
      doURLDecode(true);
    });

    // Swap
    elements.urlSwapBtn?.addEventListener('click', () => {
      swapInputOutput(
        elements.urlInput, elements.urlOutput,
        elements.urlInputCount, elements.urlOutputCount,
        elements.urlInputBytes, elements.urlOutputBytes
      );
      updateDetectedFormat(elements.urlInput, elements.urlDetectedFormat);
    });

    // Sample
    elements.urlSampleBtn?.addEventListener('click', () => {
      elements.urlInput.value = sampleData.url;
      updateCounts(elements.urlInput, elements.urlInputCount, elements.urlInputBytes);
      updateDetectedFormat(elements.urlInput, elements.urlDetectedFormat);
      showToast('Sample data loaded', 'success');
    });

    // Paste
    elements.urlPasteBtn?.addEventListener('click', () => {
      pasteToInput(elements.urlInput, elements.urlInputCount, elements.urlInputBytes);
    });

    // Copy
    elements.urlCopyBtn?.addEventListener('click', () => {
      copyOutput(elements.urlOutput);
    });

    // Clear
    elements.urlClearInputBtn?.addEventListener('click', () => {
      clearInput(elements.urlInput, elements.urlInputCount, elements.urlInputBytes);
      elements.urlDetectedFormat?.classList.remove('show');
    });

    elements.urlClearOutputBtn?.addEventListener('click', () => {
      clearInput(elements.urlOutput, elements.urlOutputCount, elements.urlOutputBytes);
    });
  }

  function doURLEncode(showMessage = true) {
    const input = elements.urlInput.value;
    if (!input) {
      if (showMessage) showToast('Please enter text to encode', 'warning');
      return;
    }
    try {
      const useComponent = elements.urlEncodeComponent?.checked;
      const encoded = useComponent ? encodeURIComponent(input) : encodeURI(input);
      elements.urlOutput.value = encoded;
      updateCounts(elements.urlOutput, elements.urlOutputCount, elements.urlOutputBytes);
      if (showMessage) {
        addToHistory('url', 'encode', input, encoded);
        showToast('URL encoded', 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Encoding failed: ' + e.message, 'error');
    }
  }

  function doURLDecode(showMessage = true) {
    const input = elements.urlInput.value;
    if (!input) {
      if (showMessage) showToast('Please enter URL to decode', 'warning');
      return;
    }
    try {
      const useComponent = elements.urlEncodeComponent?.checked;
      const decoded = useComponent ? decodeURIComponent(input) : decodeURI(input);
      elements.urlOutput.value = decoded;
      updateCounts(elements.urlOutput, elements.urlOutputCount, elements.urlOutputBytes);
      if (showMessage) {
        addToHistory('url', 'decode', input, decoded);
        showToast('URL decoded', 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Invalid URL encoding', 'error');
    }
  }

  // ============================================
  // Hash Generation
  // ============================================
  function initHash() {
    // Character/byte count
    elements.hashInput?.addEventListener('input', () => {
      updateCounts(elements.hashInput, elements.hashInputCount, elements.hashInputBytes);
      // Clear comparison result when input changes
      elements.hashCompareResult?.classList.remove('show', 'match', 'no-match');
    });

    // Generate hashes
    elements.hashGenerateBtn?.addEventListener('click', async () => {
      const input = elements.hashInput.value;
      if (!input) {
        showToast('Please enter text to hash', 'warning');
        return;
      }

      try {
        // Generate all hashes
        const [md5, sha1, sha256, sha512] = await Promise.all([
          generateMD5(input),
          generateHash(input, 'SHA-1'),
          generateHash(input, 'SHA-256'),
          generateHash(input, 'SHA-512')
        ]);

        elements.hashMd5.value = md5;
        elements.hashSha1.value = sha1;
        elements.hashSha256.value = sha256;
        elements.hashSha512.value = sha512;

        // Check if comparison is needed
        compareHash();

        // Add to history (use SHA-256 as the main output)
        addToHistory('hash', 'hash', input, sha256);

        showToast('Hashes generated', 'success');
      } catch (e) {
        showToast('Hash generation failed: ' + e.message, 'error');
      }
    });

    // Sample
    elements.hashSampleBtn?.addEventListener('click', () => {
      elements.hashInput.value = sampleData.hash;
      updateCounts(elements.hashInput, elements.hashInputCount, elements.hashInputBytes);
      showToast('Sample data loaded', 'success');
    });

    // Paste
    elements.hashPasteBtn?.addEventListener('click', () => {
      pasteToInput(elements.hashInput, elements.hashInputCount, elements.hashInputBytes);
    });

    // Clear
    elements.hashClearBtn?.addEventListener('click', () => {
      clearInput(elements.hashInput, elements.hashInputCount, elements.hashInputBytes);
      elements.hashMd5.value = '';
      elements.hashSha1.value = '';
      elements.hashSha256.value = '';
      elements.hashSha512.value = '';
      elements.hashCompareInput.value = '';
      elements.hashCompareResult?.classList.remove('show', 'match', 'no-match');
    });

    // Copy hash buttons
    elements.hashCopyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const hashType = btn.dataset.hash;
        let value = '';
        switch (hashType) {
          case 'md5': value = elements.hashMd5.value; break;
          case 'sha1': value = elements.hashSha1.value; break;
          case 'sha256': value = elements.hashSha256.value; break;
          case 'sha512': value = elements.hashSha512.value; break;
        }
        if (value) {
          navigator.clipboard.writeText(value);
          showToast(`${hashType.toUpperCase()} copied`, 'success');
        }
      });
    });

    // Copy all hashes
    elements.hashCopyAllBtn?.addEventListener('click', () => {
      const allHashes = `MD5: ${elements.hashMd5.value}\nSHA-1: ${elements.hashSha1.value}\nSHA-256: ${elements.hashSha256.value}\nSHA-512: ${elements.hashSha512.value}`;
      if (elements.hashMd5.value) {
        navigator.clipboard.writeText(allHashes);
        showToast('All hashes copied', 'success');
      } else {
        showToast('No hashes to copy', 'warning');
      }
    });

    // Hash comparison
    elements.hashCompareInput?.addEventListener('input', compareHash);
  }

  function compareHash() {
    const compareValue = elements.hashCompareInput?.value.trim().toLowerCase();
    if (!compareValue) {
      elements.hashCompareResult?.classList.remove('show', 'match', 'no-match');
      return;
    }

    const hashes = [
      elements.hashMd5?.value,
      elements.hashSha1?.value,
      elements.hashSha256?.value,
      elements.hashSha512?.value
    ].filter(Boolean).map(h => h.toLowerCase());

    const isMatch = hashes.includes(compareValue);

    elements.hashCompareResult.textContent = isMatch ? 'Match!' : 'No match';
    elements.hashCompareResult.classList.add('show');
    elements.hashCompareResult.classList.toggle('match', isMatch);
    elements.hashCompareResult.classList.toggle('no-match', !isMatch);
  }

  // Generate hash using Web Crypto API
  async function generateHash(text, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // MD5 implementation (Web Crypto doesn't support MD5)
  function generateMD5(str) {
    return new Promise(resolve => {
      resolve(md5(str));
    });
  }

  // MD5 hash function
  function md5(string) {
    function rotateLeft(value, shift) {
      return (value << shift) | (value >>> (32 - shift));
    }

    function addUnsigned(x, y) {
      const x8 = x & 0x80000000;
      const y8 = y & 0x80000000;
      const x4 = x & 0x40000000;
      const y4 = y & 0x40000000;
      const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
      if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
      if (x4 | y4) {
        if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
        return result ^ 0x40000000 ^ x8 ^ y8;
      }
      return result ^ x8 ^ y8;
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return x ^ y ^ z; }
    function I(x, y, z) { return y ^ (x | (~z)); }

    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
      let lWordCount;
      const lMessageLength = str.length;
      const lNumberOfWords_temp1 = lMessageLength + 8;
      const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      const lWordArray = Array(lNumberOfWords - 1);
      let lBytePosition = 0;
      let lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function wordToHex(value) {
      let result = '';
      for (let count = 0; count <= 3; count++) {
        const byte = (value >>> (count * 8)) & 255;
        result += byte.toString(16).padStart(2, '0');
      }
      return result;
    }

    // Encode string to UTF-8
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(string);
    let utf8String = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      utf8String += String.fromCharCode(utf8Bytes[i]);
    }

    const x = convertToWordArray(utf8String);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (let k = 0; k < x.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
      a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  // ============================================
  // JWT Decoding
  // ============================================
  function initJWT() {
    // Character count
    elements.jwtInput?.addEventListener('input', () => {
      if (elements.jwtInputCount) {
        elements.jwtInputCount.textContent = elements.jwtInput.value.length;
      }
    });

    // Decode
    elements.jwtDecodeBtn?.addEventListener('click', () => {
      const token = elements.jwtInput.value.trim();
      if (!token) {
        showToast('Please enter a JWT token', 'warning');
        return;
      }

      try {
        const decoded = decodeJWT(token);
        displayJWT(decoded);
        elements.jwtResults.style.display = 'block';
        elements.jwtError.style.display = 'none';
        addToHistory('jwt', 'decode', token, JSON.stringify(decoded.payload));
        showToast('JWT decoded successfully', 'success');
      } catch (e) {
        elements.jwtResults.style.display = 'none';
        elements.jwtError.style.display = 'flex';
        showToast('Invalid JWT token', 'error');
      }
    });

    // Sample
    elements.jwtSampleBtn?.addEventListener('click', () => {
      elements.jwtInput.value = sampleData.jwt;
      if (elements.jwtInputCount) {
        elements.jwtInputCount.textContent = elements.jwtInput.value.length;
      }
      showToast('Sample JWT loaded', 'success');
    });

    // Paste
    elements.jwtPasteBtn?.addEventListener('click', () => {
      pasteToInput(elements.jwtInput, elements.jwtInputCount, null);
    });

    // Clear
    elements.jwtClearBtn?.addEventListener('click', () => {
      elements.jwtInput.value = '';
      if (elements.jwtInputCount) {
        elements.jwtInputCount.textContent = '0';
      }
      elements.jwtResults.style.display = 'none';
      elements.jwtError.style.display = 'none';
    });

    // Copy header
    elements.jwtCopyHeader?.addEventListener('click', () => {
      const text = elements.jwtHeader.textContent;
      if (text) {
        navigator.clipboard.writeText(text);
        showToast('Header copied', 'success');
      }
    });

    // Copy payload
    elements.jwtCopyPayload?.addEventListener('click', () => {
      const text = elements.jwtPayload.textContent;
      if (text) {
        navigator.clipboard.writeText(text);
        showToast('Payload copied', 'success');
      }
    });
  }

  function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerB64, payloadB64, signature] = parts;

    // Base64URL decode
    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    return { header, payload, signature };
  }

  function base64UrlDecode(str) {
    // Replace Base64URL characters with Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    return base64ToUtf8(base64);
  }

  function displayJWT(decoded) {
    // Header
    elements.jwtHeader.textContent = JSON.stringify(decoded.header, null, 2);
    elements.jwtAlg.textContent = decoded.header.alg || '';

    // Payload
    elements.jwtPayload.textContent = JSON.stringify(decoded.payload, null, 2);

    // Claims
    const claims = [];
    const payload = decoded.payload;

    if (payload.iss) claims.push({ label: 'Issuer', value: payload.iss });
    if (payload.sub) claims.push({ label: 'Subject', value: payload.sub });
    if (payload.aud) claims.push({ label: 'Audience', value: payload.aud });
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const isExpired = expDate < new Date();
      claims.push({
        label: 'Expires',
        value: expDate.toLocaleString(),
        status: isExpired ? 'expired' : 'valid'
      });
    }
    if (payload.iat) {
      const iatDate = new Date(payload.iat * 1000);
      claims.push({ label: 'Issued At', value: iatDate.toLocaleString() });
    }
    if (payload.nbf) {
      const nbfDate = new Date(payload.nbf * 1000);
      claims.push({ label: 'Not Before', value: nbfDate.toLocaleString() });
    }

    elements.jwtClaims.innerHTML = claims.map(claim => `
      <div class="jwt-claim">
        <span class="claim-label">${claim.label}:</span>
        <span class="claim-value ${claim.status || ''}">${claim.value}</span>
      </div>
    `).join('');

    // Signature
    elements.jwtSignature.textContent = decoded.signature;
  }

  // ============================================
  // More Encodings (Hex, Binary, HTML, Unicode)
  // ============================================
  function initMore() {
    // Real-time encoding with debounce
    const realTimeEncode = debounce(() => {
      if (elements.moreRealTime?.checked && elements.moreInput.value) {
        const mode = state.lastEncodeMode.more || 'encode';
        if (mode === 'encode') {
          doMoreEncode(false);
        } else {
          doMoreDecode(false);
        }
      }
    }, 300);

    // Encoding type buttons
    elements.encodingTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.encodingTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.moreEncodingType = btn.dataset.type;
        // Clear detected format when changing type
        elements.moreDetectedFormat?.classList.remove('show');
      });
    });

    // Character/byte count and format detection
    elements.moreInput?.addEventListener('input', () => {
      updateCounts(elements.moreInput, elements.moreInputCount, elements.moreInputBytes);
      updateDetectedFormat(elements.moreInput, elements.moreDetectedFormat);
      realTimeEncode();
    });

    elements.moreOutput?.addEventListener('input', () => {
      updateCounts(elements.moreOutput, elements.moreOutputCount, elements.moreOutputBytes);
    });

    // Encode
    elements.moreEncodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.more = 'encode';
      doMoreEncode(true);
    });

    // Decode
    elements.moreDecodeBtn?.addEventListener('click', () => {
      state.lastEncodeMode.more = 'decode';
      doMoreDecode(true);
    });

    // Swap
    elements.moreSwapBtn?.addEventListener('click', () => {
      swapInputOutput(
        elements.moreInput, elements.moreOutput,
        elements.moreInputCount, elements.moreOutputCount,
        elements.moreInputBytes, elements.moreOutputBytes
      );
      updateDetectedFormat(elements.moreInput, elements.moreDetectedFormat);
    });

    // Sample
    elements.moreSampleBtn?.addEventListener('click', () => {
      const sample = sampleData[state.moreEncodingType] || sampleData.hex;
      elements.moreInput.value = sample;
      updateCounts(elements.moreInput, elements.moreInputCount, elements.moreInputBytes);
      updateDetectedFormat(elements.moreInput, elements.moreDetectedFormat);
      showToast('Sample data loaded', 'success');
    });

    // Paste
    elements.morePasteBtn?.addEventListener('click', () => {
      pasteToInput(elements.moreInput, elements.moreInputCount, elements.moreInputBytes);
    });

    // Copy
    elements.moreCopyBtn?.addEventListener('click', () => {
      copyOutput(elements.moreOutput);
    });

    // Clear
    elements.moreClearInputBtn?.addEventListener('click', () => {
      clearInput(elements.moreInput, elements.moreInputCount, elements.moreInputBytes);
      elements.moreDetectedFormat?.classList.remove('show');
    });

    elements.moreClearOutputBtn?.addEventListener('click', () => {
      clearInput(elements.moreOutput, elements.moreOutputCount, elements.moreOutputBytes);
    });
  }

  function doMoreEncode(showMessage = true) {
    const input = elements.moreInput.value;
    if (!input) {
      if (showMessage) showToast('Please enter text to encode', 'warning');
      return;
    }

    try {
      let encoded = '';
      switch (state.moreEncodingType) {
        case 'hex':
          encoded = textToHex(input);
          break;
        case 'binary':
          encoded = textToBinary(input);
          break;
        case 'html':
          encoded = textToHtmlEntities(input);
          break;
        case 'unicode':
          encoded = textToUnicode(input);
          break;
      }
      elements.moreOutput.value = encoded;
      updateCounts(elements.moreOutput, elements.moreOutputCount, elements.moreOutputBytes);
      if (showMessage) {
        addToHistory(state.moreEncodingType, 'encode', input, encoded);
        showToast(`Encoded to ${state.moreEncodingType.toUpperCase()}`, 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Encoding failed: ' + e.message, 'error');
    }
  }

  function doMoreDecode(showMessage = true) {
    const input = elements.moreInput.value;
    if (!input) {
      if (showMessage) showToast('Please enter text to decode', 'warning');
      return;
    }

    try {
      let decoded = '';
      switch (state.moreEncodingType) {
        case 'hex':
          decoded = hexToText(input);
          break;
        case 'binary':
          decoded = binaryToText(input);
          break;
        case 'html':
          decoded = htmlEntitiesToText(input);
          break;
        case 'unicode':
          decoded = unicodeToText(input);
          break;
      }
      elements.moreOutput.value = decoded;
      updateCounts(elements.moreOutput, elements.moreOutputCount, elements.moreOutputBytes);
      if (showMessage) {
        addToHistory(state.moreEncodingType, 'decode', input, decoded);
        showToast(`Decoded from ${state.moreEncodingType.toUpperCase()}`, 'success');
      }
    } catch (e) {
      if (showMessage) showToast('Decoding failed: ' + e.message, 'error');
    }
  }

  // Hex conversions
  function textToHex(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  }

  function hexToText(hex) {
    const hexValues = hex.replace(/\s+/g, '').match(/.{1,2}/g);
    if (!hexValues) return '';
    const bytes = new Uint8Array(hexValues.map(h => parseInt(h, 16)));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // Binary conversions
  function textToBinary(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes)
      .map(b => b.toString(2).padStart(8, '0'))
      .join(' ');
  }

  function binaryToText(binary) {
    const binaryValues = binary.replace(/\s+/g, '').match(/.{1,8}/g);
    if (!binaryValues) return '';
    const bytes = new Uint8Array(binaryValues.map(b => parseInt(b, 2)));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // HTML entity conversions
  function textToHtmlEntities(text) {
    return Array.from(text)
      .map(char => `&#${char.codePointAt(0)};`)
      .join('');
  }

  function htmlEntitiesToText(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }

  // Unicode conversions (supports both U+XXXX and \uXXXX)
  function textToUnicode(text) {
    return Array.from(text)
      .map(char => {
        const code = char.codePointAt(0);
        if (code > 0xFFFF) {
          return `U+${code.toString(16).toUpperCase().padStart(5, '0')}`;
        }
        return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
      })
      .join(' ');
  }

  function unicodeToText(unicode) {
    // Support both U+XXXX and \uXXXX formats
    const matches = unicode.match(/(?:U\+|\\u)([0-9A-Fa-f]+)/g);
    if (!matches) return '';
    return matches.map(u => {
      const code = parseInt(u.replace(/U\+|\\u/i, ''), 16);
      return String.fromCodePoint(code);
    }).join('');
  }

  // ============================================
  // History
  // ============================================
  function initHistory() {
    // Apply initial collapsed state
    if (state.historyCollapsed) {
      elements.historySidebar?.classList.add('collapsed');
      elements.historyShowBtn?.classList.add('visible');
    }

    // Render existing history
    renderHistory();

    // Helper to check if mobile
    const isMobile = () => window.innerWidth <= 768;

    // Helper to close mobile sidebar
    const closeMobileSidebar = () => {
      elements.historySidebar?.classList.remove('open');
      elements.historyOverlay?.classList.remove('show');
    };

    // Helper to open mobile sidebar
    const openMobileSidebar = () => {
      elements.historySidebar?.classList.add('open');
      elements.historyOverlay?.classList.add('show');
    };

    // Toggle sidebar (collapse on desktop, close on mobile)
    elements.historyToggleBtn?.addEventListener('click', () => {
      if (isMobile()) {
        closeMobileSidebar();
      } else {
        state.historyCollapsed = true;
        elements.historySidebar?.classList.add('collapsed');
        elements.historyShowBtn?.classList.add('visible');
        localStorage.setItem('historyCollapsed', 'true');
      }
    });

    // Show sidebar (expand)
    elements.historyShowBtn?.addEventListener('click', () => {
      state.historyCollapsed = false;
      elements.historySidebar?.classList.remove('collapsed');
      elements.historyShowBtn?.classList.remove('visible');
      localStorage.setItem('historyCollapsed', 'false');
    });

    // Clear history
    elements.historyClearBtn?.addEventListener('click', () => {
      if (state.history.length === 0) {
        showToast('History is already empty', 'info');
        return;
      }
      state.history = [];
      saveHistory();
      renderHistory();
      showToast('History cleared', 'success');
    });

    // FAB (mobile)
    elements.historyFab?.addEventListener('click', () => {
      openMobileSidebar();
    });

    // Overlay click to close (mobile)
    elements.historyOverlay?.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  function addToHistory(type, mode, input, output) {
    const item = {
      id: Date.now(),
      type, // base64, url, hash, jwt, hex, binary, html, unicode
      mode, // encode, decode, hash
      input: input.substring(0, 200), // Limit stored length
      output: output.substring(0, 200),
      timestamp: new Date().toISOString()
    };

    // Add to beginning
    state.history.unshift(item);

    // Limit history size
    if (state.history.length > MAX_HISTORY) {
      state.history = state.history.slice(0, MAX_HISTORY);
    }

    saveHistory();
    renderHistory();
  }

  function saveHistory() {
    localStorage.setItem('encoderHistory', JSON.stringify(state.history));
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    if (elements.historyBadge) {
      elements.historyBadge.textContent = state.history.length;
      elements.historyBadge.setAttribute('data-count', state.history.length);
    }
  }

  function renderHistory() {
    if (!elements.historyList) return;

    // Update badge
    updateHistoryBadge();

    // Show/hide empty state
    if (state.history.length === 0) {
      elements.historyEmpty?.classList.remove('hidden');
      // Remove any history items
      const items = elements.historyList.querySelectorAll('.history-item');
      items.forEach(item => item.remove());
      return;
    }

    elements.historyEmpty?.classList.add('hidden');

    // Clear existing items (except empty state)
    const existingItems = elements.historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    // Render items
    state.history.forEach(item => {
      const el = createHistoryItem(item);
      elements.historyList.appendChild(el);
    });
  }

  function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.dataset.id = item.id;

    const modeClass = item.mode === 'encode' ? 'encode' :
                      item.mode === 'decode' ? 'decode' :
                      item.mode === 'hash' ? 'hash' : '';

    const typeLabel = item.type.toUpperCase();
    const modeLabel = item.mode.charAt(0).toUpperCase() + item.mode.slice(1);
    const timeAgo = getTimeAgo(item.timestamp);

    div.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-type">
          <span class="history-item-badge ${modeClass}">${typeLabel}</span>
          <span style="font-size: 0.65rem; color: var(--color-text-muted);">${modeLabel}</span>
        </div>
        <span class="history-item-time">${timeAgo}</span>
      </div>
      <div class="history-item-content">
        <div class="history-item-input">${escapeHtml(item.input)}</div>
        <div class="history-item-output">${escapeHtml(item.output)}</div>
      </div>
      <div class="history-item-actions">
        <button class="history-item-btn use-btn" title="Use this">
          <i class="fa-solid fa-arrow-rotate-left"></i>
          <span>Use</span>
        </button>
        <button class="history-item-btn copy-btn" title="Copy output">
          <i class="fa-solid fa-copy"></i>
          <span>Copy</span>
        </button>
        <button class="history-item-btn delete" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    // Event listeners
    div.querySelector('.use-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      useHistoryItem(item);
    });

    div.querySelector('.copy-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(item.output);
      showToast('Output copied', 'success');
    });

    div.querySelector('.delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryItem(item.id);
    });

    return div;
  }

  function useHistoryItem(item) {
    // Switch to appropriate tab
    const tabMap = {
      'base64': 'base64',
      'url': 'url',
      'hash': 'hash',
      'jwt': 'jwt',
      'hex': 'more',
      'binary': 'more',
      'html': 'more',
      'unicode': 'more'
    };

    const tab = tabMap[item.type] || 'base64';
    switchTab(tab);

    // Set encoding type for "more" tab
    if (tab === 'more') {
      state.moreEncodingType = item.type;
      elements.encodingTypeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === item.type);
      });
    }

    // Fill input
    setTimeout(() => {
      switch (tab) {
        case 'base64':
          elements.base64Input.value = item.input;
          updateCounts(elements.base64Input, elements.base64InputCount, elements.base64InputBytes);
          break;
        case 'url':
          elements.urlInput.value = item.input;
          updateCounts(elements.urlInput, elements.urlInputCount, elements.urlInputBytes);
          break;
        case 'hash':
          elements.hashInput.value = item.input;
          updateCounts(elements.hashInput, elements.hashInputCount, elements.hashInputBytes);
          break;
        case 'jwt':
          elements.jwtInput.value = item.input;
          if (elements.jwtInputCount) {
            elements.jwtInputCount.textContent = item.input.length;
          }
          break;
        case 'more':
          elements.moreInput.value = item.input;
          updateCounts(elements.moreInput, elements.moreInputCount, elements.moreInputBytes);
          break;
      }
      showToast('History item loaded', 'success');
    }, 100);

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      elements.historySidebar?.classList.remove('open');
    }
  }

  function deleteHistoryItem(id) {
    state.history = state.history.filter(item => item.id !== id);
    saveHistory();
    renderHistory();
    showToast('Item deleted', 'success');
  }

  function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return then.toLocaleDateString();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // Utility Functions
  // ============================================
  function swapInputOutput(input, output, inputCount, outputCount, inputBytes, outputBytes) {
    const temp = input.value;
    input.value = output.value;
    output.value = temp;
    updateCounts(input, inputCount, inputBytes);
    updateCounts(output, outputCount, outputBytes);
    showToast('Swapped input and output', 'info');
  }

  async function pasteToInput(input, countElement, bytesElement) {
    try {
      const text = await navigator.clipboard.readText();
      input.value = text;
      updateCounts(input, countElement, bytesElement);
      showToast('Pasted from clipboard', 'success');
    } catch (e) {
      showToast('Failed to paste', 'error');
    }
  }

  function copyOutput(output) {
    const text = output.value;
    if (!text) {
      showToast('Nothing to copy', 'warning');
      return;
    }
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  }

  function clearInput(input, countElement, bytesElement) {
    input.value = '';
    if (countElement) {
      countElement.textContent = '0';
    }
    if (bytesElement) {
      bytesElement.textContent = '0';
    }
  }

  // ============================================
  // Toast Notifications
  // ============================================
  let toastTimeout;

  function showToast(message, type = 'info') {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function initKeyboardShortcuts() {
    // Keyboard event listener (shortcut modal handled by tools-common.js)
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (isTyping) return;

      // Tab switching (1-5)
      const tabMap = { '1': 'base64', '2': 'url', '3': 'hash', '4': 'jwt', '5': 'more' };
      if (tabMap[e.key]) {
        e.preventDefault();
        switchTab(tabMap[e.key]);
        return;
      }

      // E - Encode
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        triggerEncode();
        return;
      }

      // D - Decode
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerDecode();
        return;
      }

      // C - Copy
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        triggerCopy();
        return;
      }

      // V - Paste
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        triggerPaste();
        return;
      }

      // X - Clear
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        triggerClear();
        return;
      }

      // S - Load sample
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        triggerSample();
        return;
      }
    });
  }

  function triggerEncode() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64EncodeBtn?.click();
        break;
      case 'url':
        elements.urlEncodeBtn?.click();
        break;
      case 'hash':
        elements.hashGenerateBtn?.click();
        break;
      case 'jwt':
        elements.jwtDecodeBtn?.click();
        break;
      case 'more':
        elements.moreEncodeBtn?.click();
        break;
    }
  }

  function triggerDecode() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64DecodeBtn?.click();
        break;
      case 'url':
        elements.urlDecodeBtn?.click();
        break;
      case 'jwt':
        elements.jwtDecodeBtn?.click();
        break;
      case 'more':
        elements.moreDecodeBtn?.click();
        break;
    }
  }

  function triggerCopy() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64CopyBtn?.click();
        break;
      case 'url':
        elements.urlCopyBtn?.click();
        break;
      case 'hash':
        elements.hashCopyAllBtn?.click();
        break;
      case 'more':
        elements.moreCopyBtn?.click();
        break;
    }
  }

  function triggerPaste() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64PasteBtn?.click();
        break;
      case 'url':
        elements.urlPasteBtn?.click();
        break;
      case 'hash':
        elements.hashPasteBtn?.click();
        break;
      case 'jwt':
        elements.jwtPasteBtn?.click();
        break;
      case 'more':
        elements.morePasteBtn?.click();
        break;
    }
  }

  function triggerClear() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64ClearInputBtn?.click();
        elements.base64ClearOutputBtn?.click();
        break;
      case 'url':
        elements.urlClearInputBtn?.click();
        elements.urlClearOutputBtn?.click();
        break;
      case 'hash':
        elements.hashClearBtn?.click();
        break;
      case 'jwt':
        elements.jwtClearBtn?.click();
        break;
      case 'more':
        elements.moreClearInputBtn?.click();
        elements.moreClearOutputBtn?.click();
        break;
    }
  }

  function triggerSample() {
    switch (state.activeTab) {
      case 'base64':
        elements.base64SampleBtn?.click();
        break;
      case 'url':
        elements.urlSampleBtn?.click();
        break;
      case 'hash':
        elements.hashSampleBtn?.click();
        break;
      case 'jwt':
        elements.jwtSampleBtn?.click();
        break;
      case 'more':
        elements.moreSampleBtn?.click();
        break;
    }
  }

  // ============================================
  // Footer
  // ============================================
  function initFooter() {
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }
  }

  // Initialize the application
  init();
});
