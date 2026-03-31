/**
 * SlideCrypto — AES-256-GCM encryption with PBKDF2 key derivation
 * Supports dual-key envelope: user secret + master key can both decrypt
 */
const SlideCrypto = {
  PBKDF2_ITERATIONS: 600000,
  VERSION: 1,

  /** Convert ArrayBuffer to base64 string */
  _toBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  },

  /** Convert base64 string to ArrayBuffer */
  _fromBase64(str) {
    const bin = atob(str);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  },

  /** Derive a CryptoKey from a password using PBKDF2 */
  async _deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /** Encrypt data with a CryptoKey, return { iv, ciphertext } as base64 */
  async _encrypt(key, data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      typeof data === 'string' ? enc.encode(data) : data
    );
    return { iv: this._toBase64(iv), ciphertext: this._toBase64(ciphertext) };
  },

  /** Decrypt ciphertext with a CryptoKey */
  async _decrypt(key, iv64, ciphertext64) {
    const iv = this._fromBase64(iv64);
    const ciphertext = this._fromBase64(ciphertext64);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      ciphertext
    );
    return new TextDecoder().decode(plaintext);
  },

  /**
   * Encrypt a slides JSON object
   * @param {Object} data — the slides.json content
   * @param {string} userSecret — user's password
   * @param {string} masterSecret — master key
   * @returns {Object} — encrypted envelope
   */
  async encrypt(data, userSecret, masterSecret) {
    if (!crypto.subtle) throw new Error('Encryption requires HTTPS');
    // 1. Generate random DEK (Data Encryption Key)
    const dek = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
    );
    const rawDEK = await crypto.subtle.exportKey('raw', dek);

    // 2. Encrypt slides data with DEK
    const jsonStr = JSON.stringify(data);
    const dataIv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: dataIv }, dek, new TextEncoder().encode(jsonStr)
    );

    // 3. Derive user key and encrypt DEK with it
    const userSalt = crypto.getRandomValues(new Uint8Array(32));
    const userKey = await this._deriveKey(userSecret, userSalt);
    const userDekIv = crypto.getRandomValues(new Uint8Array(12));
    const userEncDEK = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: userDekIv }, userKey, rawDEK
    );

    // 4. Derive master key and encrypt DEK with it
    const masterSalt = crypto.getRandomValues(new Uint8Array(32));
    const masterKey = await this._deriveKey(masterSecret, masterSalt);
    const masterDekIv = crypto.getRandomValues(new Uint8Array(12));
    const masterEncDEK = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: masterDekIv }, masterKey, rawDEK
    );

    return {
      encrypted: true,
      version: this.VERSION,
      pbkdf2Iterations: this.PBKDF2_ITERATIONS,
      userKey: {
        salt: this._toBase64(userSalt),
        iv: this._toBase64(userDekIv),
        encryptedDEK: this._toBase64(userEncDEK)
      },
      masterKey: {
        salt: this._toBase64(masterSalt),
        iv: this._toBase64(masterDekIv),
        encryptedDEK: this._toBase64(masterEncDEK)
      },
      data: {
        iv: this._toBase64(dataIv),
        ciphertext: this._toBase64(encryptedData)
      }
    };
  },

  /**
   * Decrypt an encrypted envelope
   * @param {Object} envelope — the encrypted slides.json
   * @param {string} secret — either user secret or master key
   * @returns {Object} — decrypted slides data
   * @throws if decryption fails (wrong key)
   */
  async decrypt(envelope, secret) {
    if (!crypto.subtle) throw new Error('Encryption requires HTTPS');
    if (!envelope.encrypted) return envelope;

    const iterations = envelope.pbkdf2Iterations || this.PBKDF2_ITERATIONS;

    // Try user key first
    try {
      const userSalt = new Uint8Array(this._fromBase64(envelope.userKey.salt));
      const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']
      );
      const derivedKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: userSalt, iterations, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );

      // Decrypt DEK
      const rawDEK = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(this._fromBase64(envelope.userKey.iv)) },
        derivedKey,
        this._fromBase64(envelope.userKey.encryptedDEK)
      );

      // Import DEK and decrypt data
      const dek = await crypto.subtle.importKey(
        'raw', rawDEK, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(this._fromBase64(envelope.data.iv)) },
        dek,
        this._fromBase64(envelope.data.ciphertext)
      );

      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (e) {
      // User key failed, try master key
    }

    // Try master key
    try {
      const masterSalt = new Uint8Array(this._fromBase64(envelope.masterKey.salt));
      const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']
      );
      const derivedKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: masterSalt, iterations, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );

      // Decrypt DEK
      const rawDEK = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(this._fromBase64(envelope.masterKey.iv)) },
        derivedKey,
        this._fromBase64(envelope.masterKey.encryptedDEK)
      );

      // Import DEK and decrypt data
      const dek = await crypto.subtle.importKey(
        'raw', rawDEK, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(this._fromBase64(envelope.data.iv)) },
        dek,
        this._fromBase64(envelope.data.ciphertext)
      );

      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (e) {
      throw new Error('Invalid secret key');
    }
  },

  /** Check if a JSON object is an encrypted envelope */
  isEncrypted(data) {
    return data && data.encrypted === true && data.data && data.userKey && data.masterKey;
  }
};
