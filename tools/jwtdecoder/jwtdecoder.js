/**
 * JWT Decoder, Encoder & Verifier
 * Uses Web Crypto API for HMAC-SHA256
 */
(function() {
  'use strict';

  // ==================== DOM Elements ====================
  // Tabs
  const tabs = document.querySelectorAll('.tool-tab[data-tab]');
  const panels = {
    decode: document.getElementById('decodePanel'),
    encode: document.getElementById('encodePanel'),
    verify: document.getElementById('verifyPanel')
  };

  // Decode
  const decodeInput = document.getElementById('decodeInput');
  const headerContent = document.getElementById('headerContent');
  const payloadContent = document.getElementById('payloadContent');
  const signatureContent = document.getElementById('signatureContent');
  const algoBadge = document.getElementById('algoBadge');
  const expiryBadge = document.getElementById('expiryBadge');
  const decodeSampleBtn = document.getElementById('decodeSampleBtn');
  const decodePasteBtn = document.getElementById('decodePasteBtn');
  const decodeClearBtn = document.getElementById('decodeClearBtn');

  // Encode
  const encodeHeader = document.getElementById('encodeHeader');
  const encodePayload = document.getElementById('encodePayload');
  const encodeSecret = document.getElementById('encodeSecret');
  const encodeBtn = document.getElementById('encodeBtn');
  const encodedOutput = document.getElementById('encodedOutput');
  const copyEncodedBtn = document.getElementById('copyEncodedBtn');
  const toggleSecretBtn = document.getElementById('toggleSecretBtn');

  // Verify
  const verifyToken = document.getElementById('verifyToken');
  const verifySecret = document.getElementById('verifySecret');
  const verifyBtn = document.getElementById('verifyBtn');
  const verifyResult = document.getElementById('verifyResult');
  const verifyIcon = document.getElementById('verifyIcon');
  const verifyMessage = document.getElementById('verifyMessage');
  const verifyDetails = document.getElementById('verifyDetails');

  let lastEncodedToken = '';
  let decodedParts = { header: '', payload: '', signature: '' };

  // ==================== Base64URL ====================
  function base64UrlEncode(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    const binary = Array.from(new Uint8Array(data)).map(b => String.fromCharCode(b)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with = to make length multiple of 4
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function base64UrlDecodeToString(str) {
    const bytes = base64UrlDecode(str);
    return new TextDecoder().decode(bytes);
  }

  // ==================== HMAC-SHA256 ====================
  async function hmacSha256(secret, message) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, msgData);
    return new Uint8Array(signature);
  }

  // ==================== Timestamp Utils ====================
  const TIMESTAMP_FIELDS = ['iat', 'exp', 'nbf', 'auth_time', 'updated_at'];

  function isTimestampField(key) {
    return TIMESTAMP_FIELDS.includes(key);
  }

  function formatTimestamp(ts) {
    try {
      const date = new Date(ts * 1000);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });
    } catch {
      return null;
    }
  }

  function getExpiryStatus(payload) {
    if (!payload || typeof payload.exp !== 'number') {
      return { status: 'no-expiry', text: 'No expiry' };
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { status: 'expired', text: 'Expired' };
    }
    return { status: 'valid', text: 'Valid' };
  }

  // ==================== Pretty Print with Annotations ====================
  function prettyPrintWithTimestamps(obj) {
    const json = JSON.stringify(obj, null, 2);
    const lines = json.split('\n');
    const result = [];

    for (const line of lines) {
      result.push(escapeHtml(line));
      // Check if line has a timestamp field
      const match = line.match(/"(\w+)":\s*(\d{9,12})/);
      if (match && isTimestampField(match[1])) {
        const formatted = formatTimestamp(parseInt(match[2], 10));
        if (formatted) {
          const indent = line.match(/^\s*/)[0];
          result.push(`<span class="timestamp-annotation">${escapeHtml(indent)}// ${formatted}</span>`);
        }
      }
    }

    return result.join('\n');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==================== Tab Switching ====================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(panels).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      panels[tab.dataset.tab].classList.add('active');
    });
  });

  // ==================== Decode ====================
  function decodeJWT(token) {
    token = token.trim();
    if (!token) {
      resetDecode();
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      headerContent.textContent = 'Invalid JWT format (expected 3 parts separated by dots)';
      payloadContent.textContent = '';
      signatureContent.textContent = '';
      algoBadge.textContent = '';
      expiryBadge.textContent = '';
      expiryBadge.className = 'expiry-badge';
      decodedParts = { header: '', payload: '', signature: '' };
      return;
    }

    try {
      // Decode header
      const headerStr = base64UrlDecodeToString(parts[0]);
      const headerObj = JSON.parse(headerStr);
      decodedParts.header = JSON.stringify(headerObj, null, 2);
      headerContent.innerHTML = prettyPrintWithTimestamps(headerObj);
      algoBadge.textContent = headerObj.alg || '';

      // Decode payload
      const payloadStr = base64UrlDecodeToString(parts[1]);
      const payloadObj = JSON.parse(payloadStr);
      decodedParts.payload = JSON.stringify(payloadObj, null, 2);
      payloadContent.innerHTML = prettyPrintWithTimestamps(payloadObj);

      // Expiry status
      const expiry = getExpiryStatus(payloadObj);
      expiryBadge.textContent = expiry.text;
      expiryBadge.className = 'expiry-badge ' + expiry.status;

      // Signature (hex display)
      const sigBytes = base64UrlDecode(parts[2]);
      const sigHex = Array.from(sigBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      decodedParts.signature = sigHex;
      signatureContent.textContent = sigHex;

    } catch (e) {
      headerContent.textContent = 'Failed to decode: ' + e.message;
      payloadContent.textContent = '';
      signatureContent.textContent = '';
      algoBadge.textContent = '';
      expiryBadge.textContent = '';
      expiryBadge.className = 'expiry-badge';
      decodedParts = { header: '', payload: '', signature: '' };
    }
  }

  function resetDecode() {
    headerContent.textContent = 'Paste a JWT to decode';
    payloadContent.textContent = '';
    signatureContent.textContent = '';
    algoBadge.textContent = '';
    expiryBadge.textContent = '';
    expiryBadge.className = 'expiry-badge';
    decodedParts = { header: '', payload: '', signature: '' };
  }

  // Live decode
  decodeInput.addEventListener('input', ToolsCommon.debounce(() => {
    decodeJWT(decodeInput.value);
  }, 200));

  // Sample JWT
  decodeSampleBtn.addEventListener('click', async () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      email: 'john@example.com',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 3600,
      admin: true
    };

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const sigInput = headerB64 + '.' + payloadB64;
    const sigBytes = await hmacSha256('secret', sigInput);
    const sigB64 = base64UrlEncode(sigBytes);

    decodeInput.value = headerB64 + '.' + payloadB64 + '.' + sigB64;
    decodeJWT(decodeInput.value);
    ToolsCommon.showToast('Sample JWT loaded (secret: "secret")', 'success');
  });

  // Paste
  decodePasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      decodeInput.value = text;
      decodeJWT(text);
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch {
      ToolsCommon.showToast('Failed to read clipboard', 'error');
    }
  });

  // Clear
  decodeClearBtn.addEventListener('click', () => {
    decodeInput.value = '';
    resetDecode();
    ToolsCommon.showToast('Cleared', 'info');
  });

  // Copy part buttons
  document.querySelectorAll('.copy-part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const part = btn.dataset.part;
      const text = decodedParts[part];
      if (!text) {
        ToolsCommon.showToast('Nothing to copy', 'error');
        return;
      }
      ToolsCommon.copyWithToast(text, part.charAt(0).toUpperCase() + part.slice(1) + ' copied');
    });
  });

  // ==================== Encode ====================
  encodeBtn.addEventListener('click', async () => {
    try {
      const headerObj = JSON.parse(encodeHeader.value);
      const payloadObj = JSON.parse(encodePayload.value);
      const secret = encodeSecret.value;

      if (!secret) {
        ToolsCommon.showToast('Please enter a secret key', 'error');
        return;
      }

      const headerB64 = base64UrlEncode(JSON.stringify(headerObj));
      const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
      const sigInput = headerB64 + '.' + payloadB64;
      const sigBytes = await hmacSha256(secret, sigInput);
      const sigB64 = base64UrlEncode(sigBytes);

      lastEncodedToken = headerB64 + '.' + payloadB64 + '.' + sigB64;

      // Color-coded display
      encodedOutput.innerHTML =
        '<span class="jwt-header-part">' + escapeHtml(headerB64) + '</span>' +
        '<span class="jwt-dot">.</span>' +
        '<span class="jwt-payload-part">' + escapeHtml(payloadB64) + '</span>' +
        '<span class="jwt-dot">.</span>' +
        '<span class="jwt-signature-part">' + escapeHtml(sigB64) + '</span>';

      ToolsCommon.showToast('JWT generated', 'success');
    } catch (e) {
      ToolsCommon.showToast('Invalid JSON: ' + e.message, 'error');
    }
  });

  // Copy encoded
  copyEncodedBtn.addEventListener('click', () => {
    if (!lastEncodedToken) {
      ToolsCommon.showToast('No token to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(lastEncodedToken, 'Token copied');
  });

  // Toggle secret visibility
  toggleSecretBtn.addEventListener('click', () => {
    const isPassword = encodeSecret.type === 'password';
    encodeSecret.type = isPassword ? 'text' : 'password';
    toggleSecretBtn.querySelector('i').className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  });

  // ==================== Verify ====================
  verifyBtn.addEventListener('click', async () => {
    const token = verifyToken.value.trim();
    const secret = verifySecret.value;

    if (!token) {
      ToolsCommon.showToast('Please enter a JWT token', 'error');
      return;
    }
    if (!secret) {
      ToolsCommon.showToast('Please enter a secret key', 'error');
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      showVerifyResult(false, 'Invalid JWT', 'Token must have 3 parts separated by dots.');
      return;
    }

    try {
      // Check algorithm
      const headerStr = base64UrlDecodeToString(parts[0]);
      const headerObj = JSON.parse(headerStr);

      if (headerObj.alg !== 'HS256') {
        showVerifyResult(false, 'Unsupported Algorithm', 'Only HS256 is supported for verification. Token uses: ' + (headerObj.alg || 'unknown'));
        return;
      }

      // Compute expected signature
      const sigInput = parts[0] + '.' + parts[1];
      const expectedSig = await hmacSha256(secret, sigInput);
      const expectedB64 = base64UrlEncode(expectedSig);

      const isValid = expectedB64 === parts[2];

      // Check expiry
      let expiryInfo = '';
      try {
        const payloadStr = base64UrlDecodeToString(parts[1]);
        const payloadObj = JSON.parse(payloadStr);
        const expiry = getExpiryStatus(payloadObj);
        if (expiry.status === 'expired') {
          expiryInfo = 'Note: This token has expired.';
        } else if (expiry.status === 'valid') {
          const remaining = payloadObj.exp - Math.floor(Date.now() / 1000);
          const hours = Math.floor(remaining / 3600);
          const mins = Math.floor((remaining % 3600) / 60);
          expiryInfo = 'Token expires in ' + (hours > 0 ? hours + 'h ' : '') + mins + 'm.';
        } else {
          expiryInfo = 'Token has no expiration claim.';
        }
      } catch { /* ignore */ }

      if (isValid) {
        showVerifyResult(true, 'Signature Valid', 'The HMAC-SHA256 signature matches the provided secret.' + (expiryInfo ? '<br>' + expiryInfo : ''));
      } else {
        showVerifyResult(false, 'Signature Invalid', 'The signature does not match. The token may have been tampered with or the secret is incorrect.' + (expiryInfo ? '<br>' + expiryInfo : ''));
      }

    } catch (e) {
      showVerifyResult(false, 'Verification Failed', 'Error: ' + e.message);
    }
  });

  function showVerifyResult(success, message, details) {
    verifyResult.classList.remove('hidden', 'success', 'failure');
    verifyResult.classList.add(success ? 'success' : 'failure');
    verifyIcon.innerHTML = success
      ? '<i class="fa-solid fa-circle-check"></i>'
      : '<i class="fa-solid fa-circle-xmark"></i>';
    verifyMessage.textContent = message;
    verifyDetails.innerHTML = details;
  }

  // ==================== Init ====================
  // Nothing needed on load

})();
