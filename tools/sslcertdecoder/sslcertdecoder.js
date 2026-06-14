/**
 * SSL Certificate Decoder
 * Parses PEM-encoded X.509 certificates using manual ASN.1/DER parsing.
 */
(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const pemInput = document.getElementById('pemInput');
  const decodeBtn = document.getElementById('decodeBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const sslResults = document.getElementById('sslResults');
  const expiryBanner = document.getElementById('expiryBanner');
  const expiryIcon = document.getElementById('expiryIcon');
  const expiryStatus = document.getElementById('expiryStatus');
  const expiryCountdown = document.getElementById('expiryCountdown');
  const subjectFields = document.getElementById('subjectFields');
  const issuerFields = document.getElementById('issuerFields');
  const validityFields = document.getElementById('validityFields');
  const serialAlgoFields = document.getElementById('serialAlgoFields');
  const keyFields = document.getElementById('keyFields');
  const extensionFields = document.getElementById('extensionFields');
  const chainFields = document.getElementById('chainFields');

  // ==================== ASN.1 OID Mappings ====================
  const OID_MAP = {
    '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST',
    '2.5.4.10': 'O', '2.5.4.11': 'OU', '2.5.4.12': 'T', '2.5.4.5': 'serialNumber',
    '2.5.4.9': 'street', '2.5.4.17': 'postalCode', '1.2.840.113549.1.9.1': 'email',
    '2.5.4.46': 'dnQualifier',
  };

  const OID_FRIENDLY = {
    'CN': 'Common Name', 'C': 'Country', 'L': 'Locality', 'ST': 'State/Province',
    'O': 'Organization', 'OU': 'Organizational Unit', 'T': 'Title',
    'serialNumber': 'Serial Number', 'street': 'Street', 'postalCode': 'Postal Code',
    'email': 'Email',
  };

  const SIG_ALGO_MAP = {
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.113549.1.1.10': 'RSASSA-PSS',
    '1.2.840.113549.1.1.1': 'RSA',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
    '1.2.840.10045.2.1': 'EC',
    '1.3.101.112': 'Ed25519',
    '1.3.101.113': 'Ed448',
  };

  const KEY_USAGE_BITS = [
    'Digital Signature', 'Non Repudiation', 'Key Encipherment',
    'Data Encipherment', 'Key Agreement', 'Key Cert Sign',
    'CRL Sign', 'Encipher Only', 'Decipher Only'
  ];

  const EXT_KEY_USAGE_MAP = {
    '1.3.6.1.5.5.7.3.1': 'Server Authentication',
    '1.3.6.1.5.5.7.3.2': 'Client Authentication',
    '1.3.6.1.5.5.7.3.3': 'Code Signing',
    '1.3.6.1.5.5.7.3.4': 'Email Protection',
    '1.3.6.1.5.5.7.3.8': 'Time Stamping',
    '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
  };

  // ==================== PEM Parsing ====================
  function pemToBytes(pem) {
    const lines = pem.trim().split('\n');
    let b64 = '';
    let inCert = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-----BEGIN')) { inCert = true; continue; }
      if (trimmed.startsWith('-----END')) { inCert = false; continue; }
      if (inCert) b64 += trimmed;
    }
    if (!b64) throw new Error('No certificate data found');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // ==================== ASN.1 DER Parser ====================
  function parseASN1(data, offset) {
    if (offset >= data.length) throw new Error('Unexpected end of data');

    const tag = data[offset];
    let len = data[offset + 1];
    let headerLen = 2;

    if (len & 0x80) {
      const numBytes = len & 0x7f;
      len = 0;
      for (let i = 0; i < numBytes; i++) {
        len = (len << 8) | data[offset + 2 + i];
      }
      headerLen = 2 + numBytes;
    }

    const contentStart = offset + headerLen;
    const contentEnd = contentStart + len;

    return {
      tag: tag,
      tagClass: (tag >> 6) & 3,
      constructed: !!(tag & 0x20),
      tagNumber: tag & 0x1f,
      headerLen: headerLen,
      length: len,
      start: offset,
      contentStart: contentStart,
      contentEnd: contentEnd,
      totalLen: headerLen + len
    };
  }

  function parseSequenceChildren(data, start, end) {
    const children = [];
    let offset = start;
    while (offset < end) {
      const node = parseASN1(data, offset);
      children.push(node);
      offset = node.contentEnd;
    }
    return children;
  }

  function parseOID(data, start, len) {
    const bytes = data.slice(start, start + len);
    const parts = [];
    parts.push(Math.floor(bytes[0] / 40));
    parts.push(bytes[0] % 40);

    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
      val = (val << 7) | (bytes[i] & 0x7f);
      if (!(bytes[i] & 0x80)) {
        parts.push(val);
        val = 0;
      }
    }
    return parts.join('.');
  }

  function parseUTF8String(data, start, len) {
    return new TextDecoder().decode(data.slice(start, start + len));
  }

  function parseInteger(data, start, len) {
    let hex = '';
    for (let i = start; i < start + len; i++) {
      hex += data[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  function parseBitString(data, start, len) {
    // First byte is number of unused bits
    const unusedBits = data[start];
    return { unusedBits, bytes: data.slice(start + 1, start + len) };
  }

  function parseTime(data, start, len, tag) {
    const str = parseUTF8String(data, start, len);
    // UTCTime: YYMMDDHHmmSSZ
    // GeneralizedTime: YYYYMMDDHHmmSSZ
    if (tag === 0x17) { // UTCTime
      const year = parseInt(str.substring(0, 2), 10);
      const fullYear = year >= 50 ? 1900 + year : 2000 + year;
      return new Date(Date.UTC(
        fullYear,
        parseInt(str.substring(2, 4), 10) - 1,
        parseInt(str.substring(4, 6), 10),
        parseInt(str.substring(6, 8), 10),
        parseInt(str.substring(8, 10), 10),
        parseInt(str.substring(10, 12), 10)
      ));
    }
    // GeneralizedTime
    return new Date(Date.UTC(
      parseInt(str.substring(0, 4), 10),
      parseInt(str.substring(4, 6), 10) - 1,
      parseInt(str.substring(6, 8), 10),
      parseInt(str.substring(8, 10), 10),
      parseInt(str.substring(10, 12), 10),
      parseInt(str.substring(12, 14), 10)
    ));
  }

  function parseDN(data, seqNode) {
    const result = [];
    const sets = parseSequenceChildren(data, seqNode.contentStart, seqNode.contentEnd);
    for (const setNode of sets) {
      const seqs = parseSequenceChildren(data, setNode.contentStart, setNode.contentEnd);
      for (const seq of seqs) {
        const attrs = parseSequenceChildren(data, seq.contentStart, seq.contentEnd);
        if (attrs.length >= 2) {
          const oid = parseOID(data, attrs[0].contentStart, attrs[0].length);
          const value = parseUTF8String(data, attrs[1].contentStart, attrs[1].length);
          const shortName = OID_MAP[oid] || oid;
          result.push({ oid, shortName, value });
        }
      }
    }
    return result;
  }

  // ==================== Certificate Parsing ====================
  function parseCertificate(pemText) {
    const data = pemToBytes(pemText);
    const cert = {};

    // Root SEQUENCE
    const root = parseASN1(data, 0);
    const rootChildren = parseSequenceChildren(data, root.contentStart, root.contentEnd);

    // TBSCertificate
    const tbs = rootChildren[0];
    const tbsChildren = parseSequenceChildren(data, tbs.contentStart, tbs.contentEnd);

    let idx = 0;

    // Version (optional, context tag [0])
    if (tbsChildren[idx].tag === 0xa0) {
      const versionNode = parseSequenceChildren(data, tbsChildren[idx].contentStart, tbsChildren[idx].contentEnd);
      cert.version = data[versionNode[0].contentStart] + 1;
      idx++;
    } else {
      cert.version = 1;
    }

    // Serial Number
    cert.serialNumber = parseInteger(data, tbsChildren[idx].contentStart, tbsChildren[idx].length).toUpperCase();
    idx++;

    // Signature Algorithm (inside TBS)
    const sigAlgoSeq = parseSequenceChildren(data, tbsChildren[idx].contentStart, tbsChildren[idx].contentEnd);
    cert.signatureAlgorithmOID = parseOID(data, sigAlgoSeq[0].contentStart, sigAlgoSeq[0].length);
    cert.signatureAlgorithm = SIG_ALGO_MAP[cert.signatureAlgorithmOID] || cert.signatureAlgorithmOID;
    idx++;

    // Issuer
    cert.issuer = parseDN(data, tbsChildren[idx]);
    idx++;

    // Validity
    const validityChildren = parseSequenceChildren(data, tbsChildren[idx].contentStart, tbsChildren[idx].contentEnd);
    cert.notBefore = parseTime(data, validityChildren[0].contentStart, validityChildren[0].length, validityChildren[0].tag);
    cert.notAfter = parseTime(data, validityChildren[1].contentStart, validityChildren[1].length, validityChildren[1].tag);
    idx++;

    // Subject
    cert.subject = parseDN(data, tbsChildren[idx]);
    idx++;

    // Subject Public Key Info
    const spkiNode = tbsChildren[idx];
    const spkiChildren = parseSequenceChildren(data, spkiNode.contentStart, spkiNode.contentEnd);
    const pkAlgoSeq = parseSequenceChildren(data, spkiChildren[0].contentStart, spkiChildren[0].contentEnd);
    cert.publicKeyAlgorithmOID = parseOID(data, pkAlgoSeq[0].contentStart, pkAlgoSeq[0].length);
    cert.publicKeyAlgorithm = SIG_ALGO_MAP[cert.publicKeyAlgorithmOID] || cert.publicKeyAlgorithmOID;

    // Key size estimation
    const pubKeyBits = parseBitString(data, spkiChildren[1].contentStart, spkiChildren[1].length);
    cert.publicKeySize = (pubKeyBits.bytes.length) * 8;

    // For RSA, parse the modulus to get accurate key size
    if (cert.publicKeyAlgorithm === 'RSA' || cert.publicKeyAlgorithm.includes('RSA')) {
      try {
        const rsaKey = parseASN1(pubKeyBits.bytes, 0);
        const rsaChildren = parseSequenceChildren(pubKeyBits.bytes, rsaKey.contentStart, rsaKey.contentEnd);
        // Modulus
        let modLen = rsaChildren[0].length;
        // If first byte is 0x00 (padding), subtract 1
        if (pubKeyBits.bytes[rsaChildren[0].contentStart] === 0) modLen--;
        cert.publicKeySize = modLen * 8;
      } catch (e) { /* fallback to byte length */ }
    }

    idx++;

    // Extensions (optional context tag [3])
    cert.extensions = { san: [], keyUsage: [], extKeyUsage: [], basicConstraints: null };

    for (let i = idx; i < tbsChildren.length; i++) {
      if (tbsChildren[i].tag === 0xa3) {
        const extSeqOuter = parseSequenceChildren(data, tbsChildren[i].contentStart, tbsChildren[i].contentEnd);
        if (extSeqOuter.length > 0) {
          const extensions = parseSequenceChildren(data, extSeqOuter[0].contentStart, extSeqOuter[0].contentEnd);
          for (const ext of extensions) {
            parseExtension(data, ext, cert);
          }
        }
      }
    }

    // Signature algorithm (outer)
    const outerSigAlgo = parseSequenceChildren(data, rootChildren[1].contentStart, rootChildren[1].contentEnd);
    cert.outerSignatureAlgorithmOID = parseOID(data, outerSigAlgo[0].contentStart, outerSigAlgo[0].length);

    // Self-signed check
    cert.isSelfSigned = dnToString(cert.subject) === dnToString(cert.issuer);

    return cert;
  }

  function parseExtension(data, extNode, cert) {
    const children = parseSequenceChildren(data, extNode.contentStart, extNode.contentEnd);
    if (children.length < 2) return;

    const oid = parseOID(data, children[0].contentStart, children[0].length);
    // The value is the last child (could be critical boolean in between)
    const valueNode = children[children.length - 1];

    // The extension value is wrapped in OCTET STRING
    if (valueNode.tag !== 0x04) return;

    try {
      switch (oid) {
        case '2.5.29.17': // Subject Alternative Names
          parseSANExtension(data, valueNode, cert);
          break;
        case '2.5.29.15': // Key Usage
          parseKeyUsageExtension(data, valueNode, cert);
          break;
        case '2.5.29.37': // Extended Key Usage
          parseExtKeyUsageExtension(data, valueNode, cert);
          break;
        case '2.5.29.19': // Basic Constraints
          parseBasicConstraintsExtension(data, valueNode, cert);
          break;
      }
    } catch (e) {
      // Skip unparseable extensions
    }
  }

  function parseSANExtension(data, octetNode, cert) {
    const inner = parseASN1(data, octetNode.contentStart);
    const names = parseSequenceChildren(data, inner.contentStart, inner.contentEnd);
    for (const name of names) {
      const tagNum = name.tag & 0x1f;
      const val = parseUTF8String(data, name.contentStart, name.length);
      if (tagNum === 2) { // dNSName
        cert.extensions.san.push({ type: 'DNS', value: val });
      } else if (tagNum === 1) { // rfc822Name
        cert.extensions.san.push({ type: 'Email', value: val });
      } else if (tagNum === 7) { // iPAddress
        if (name.length === 4) {
          cert.extensions.san.push({ type: 'IP', value: Array.from(data.slice(name.contentStart, name.contentEnd)).join('.') });
        } else {
          cert.extensions.san.push({ type: 'IP', value: val });
        }
      } else if (tagNum === 6) { // URI
        cert.extensions.san.push({ type: 'URI', value: val });
      }
    }
  }

  function parseKeyUsageExtension(data, octetNode, cert) {
    const inner = parseASN1(data, octetNode.contentStart);
    const bs = parseBitString(data, inner.contentStart, inner.length);
    const usages = [];
    for (let i = 0; i < KEY_USAGE_BITS.length; i++) {
      const byteIdx = Math.floor(i / 8);
      const bitIdx = 7 - (i % 8);
      if (byteIdx < bs.bytes.length && (bs.bytes[byteIdx] >> bitIdx) & 1) {
        usages.push(KEY_USAGE_BITS[i]);
      }
    }
    cert.extensions.keyUsage = usages;
  }

  function parseExtKeyUsageExtension(data, octetNode, cert) {
    const inner = parseASN1(data, octetNode.contentStart);
    const oids = parseSequenceChildren(data, inner.contentStart, inner.contentEnd);
    for (const oidNode of oids) {
      const oid = parseOID(data, oidNode.contentStart, oidNode.length);
      cert.extensions.extKeyUsage.push(EXT_KEY_USAGE_MAP[oid] || oid);
    }
  }

  function parseBasicConstraintsExtension(data, octetNode, cert) {
    const inner = parseASN1(data, octetNode.contentStart);
    const children = parseSequenceChildren(data, inner.contentStart, inner.contentEnd);
    let isCA = false;
    let pathLen = null;
    if (children.length > 0 && children[0].tag === 0x01) {
      isCA = data[children[0].contentStart] !== 0;
    }
    if (children.length > 1 && children[1].tag === 0x02) {
      pathLen = data[children[1].contentStart];
    }
    cert.extensions.basicConstraints = { isCA, pathLen };
  }

  function dnToString(dn) {
    return dn.map(a => a.shortName + '=' + a.value).join(', ');
  }

  // ==================== Rendering ====================
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderField(label, value, copyable) {
    const copyBtn = copyable !== false
      ? '<button type="button" class="cert-field-copy" title="Copy" data-copy="' + escapeHtml(value) + '"><i class="fa-solid fa-copy"></i></button>'
      : '';
    return '<div class="cert-field">' +
      '<span class="cert-field-label">' + escapeHtml(label) + '</span>' +
      '<span class="cert-field-value">' + escapeHtml(value) + '</span>' +
      copyBtn + '</div>';
  }

  function renderFieldHtml(label, html) {
    return '<div class="cert-field">' +
      '<span class="cert-field-label">' + escapeHtml(label) + '</span>' +
      '<span class="cert-field-value">' + html + '</span>' +
      '</div>';
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZoneName: 'short'
    });
  }

  function formatSerial(hex) {
    return hex.replace(/(.{2})/g, '$1:').replace(/:$/, '').toUpperCase();
  }

  function displayCert(cert) {
    sslResults.classList.remove('hidden');

    // Expiry status
    const now = new Date();
    if (now < cert.notBefore) {
      expiryBanner.className = 'expiry-banner not-yet-valid';
      expiryIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
      expiryStatus.textContent = 'Not Yet Valid';
      const days = Math.ceil((cert.notBefore - now) / 86400000);
      expiryCountdown.textContent = 'Valid in ' + days + ' day' + (days !== 1 ? 's' : '') + ' (starts ' + formatDate(cert.notBefore) + ')';
    } else if (now > cert.notAfter) {
      expiryBanner.className = 'expiry-banner expired';
      expiryIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
      expiryStatus.textContent = 'Expired';
      const days = Math.ceil((now - cert.notAfter) / 86400000);
      expiryCountdown.textContent = 'Expired ' + days + ' day' + (days !== 1 ? 's' : '') + ' ago (expired ' + formatDate(cert.notAfter) + ')';
    } else {
      expiryBanner.className = 'expiry-banner valid';
      expiryIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      expiryStatus.textContent = 'Valid';
      const days = Math.ceil((cert.notAfter - now) / 86400000);
      expiryCountdown.textContent = days + ' day' + (days !== 1 ? 's' : '') + ' remaining (expires ' + formatDate(cert.notAfter) + ')';
    }

    // Subject
    let subjectHtml = '';
    const subjectOrder = ['CN', 'O', 'OU', 'C', 'ST', 'L', 'email'];
    const subjectMap = {};
    cert.subject.forEach(a => { subjectMap[a.shortName] = a.value; });
    for (const key of subjectOrder) {
      if (subjectMap[key]) {
        subjectHtml += renderField(OID_FRIENDLY[key] || key, subjectMap[key]);
      }
    }
    cert.subject.forEach(a => {
      if (!subjectOrder.includes(a.shortName)) {
        subjectHtml += renderField(OID_FRIENDLY[a.shortName] || a.shortName, a.value);
      }
    });
    if (!subjectHtml) subjectHtml = '<div class="cert-field"><span class="cert-field-value" style="color:var(--color-text-muted)">Empty subject</span></div>';
    subjectFields.innerHTML = subjectHtml;

    // Issuer
    let issuerHtml = '';
    const issuerMap = {};
    cert.issuer.forEach(a => { issuerMap[a.shortName] = a.value; });
    for (const key of subjectOrder) {
      if (issuerMap[key]) {
        issuerHtml += renderField(OID_FRIENDLY[key] || key, issuerMap[key]);
      }
    }
    cert.issuer.forEach(a => {
      if (!subjectOrder.includes(a.shortName)) {
        issuerHtml += renderField(OID_FRIENDLY[a.shortName] || a.shortName, a.value);
      }
    });
    issuerFields.innerHTML = issuerHtml;

    // Validity
    validityFields.innerHTML =
      renderField('Not Before', formatDate(cert.notBefore)) +
      renderField('Not After', formatDate(cert.notAfter));

    // Serial & Algorithm
    serialAlgoFields.innerHTML =
      renderField('Version', 'v' + cert.version) +
      renderField('Serial Number', formatSerial(cert.serialNumber)) +
      renderField('Signature Algorithm', cert.signatureAlgorithm);

    // Key Info
    keyFields.innerHTML =
      renderField('Public Key Algorithm', cert.publicKeyAlgorithm) +
      renderField('Key Size', cert.publicKeySize + ' bits');

    // Extensions
    let extHtml = '';

    // SANs
    if (cert.extensions.san.length > 0) {
      let sanHtml = '<div class="san-list">';
      cert.extensions.san.forEach(san => {
        sanHtml += '<span class="san-tag">' + escapeHtml(san.type) + ': ' + escapeHtml(san.value) +
          '<button type="button" class="san-copy-btn" data-copy="' + escapeHtml(san.value) + '" title="Copy"><i class="fa-solid fa-copy"></i></button></span>';
      });
      sanHtml += '</div>';
      extHtml += renderFieldHtml('Subject Alt Names (' + cert.extensions.san.length + ')', sanHtml);
    }

    // Key Usage
    if (cert.extensions.keyUsage.length > 0) {
      let kuHtml = '<div class="usage-list">';
      cert.extensions.keyUsage.forEach(u => {
        kuHtml += '<span class="usage-badge">' + escapeHtml(u) + '</span>';
      });
      kuHtml += '</div>';
      extHtml += renderFieldHtml('Key Usage', kuHtml);
    }

    // Extended Key Usage
    if (cert.extensions.extKeyUsage.length > 0) {
      let ekuHtml = '<div class="usage-list">';
      cert.extensions.extKeyUsage.forEach(u => {
        ekuHtml += '<span class="usage-badge">' + escapeHtml(u) + '</span>';
      });
      ekuHtml += '</div>';
      extHtml += renderFieldHtml('Extended Key Usage', ekuHtml);
    }

    // Basic Constraints
    if (cert.extensions.basicConstraints) {
      const bc = cert.extensions.basicConstraints;
      const val = 'CA: ' + (bc.isCA ? 'TRUE' : 'FALSE') + (bc.pathLen !== null ? ', pathlen: ' + bc.pathLen : '');
      extHtml += renderField('Basic Constraints', val);
    }

    if (!extHtml) extHtml = '<div class="cert-field"><span class="cert-field-value" style="color:var(--color-text-muted)">No extensions found</span></div>';
    extensionFields.innerHTML = extHtml;

    // Chain Info
    let chainHtml = '';
    if (cert.isSelfSigned) {
      chainHtml += renderFieldHtml('Chain Type', '<span class="chain-badge self-signed"><i class="fa-solid fa-circle-exclamation"></i> Self-Signed</span>');
    } else {
      chainHtml += renderFieldHtml('Chain Type', '<span class="chain-badge ca-signed"><i class="fa-solid fa-circle-check"></i> CA-Signed</span>');
    }
    chainHtml += renderField('Subject', dnToString(cert.subject));
    chainHtml += renderField('Issuer', dnToString(cert.issuer));
    chainFields.innerHTML = chainHtml;

    // Wire up copy buttons
    sslResults.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        ToolsCommon.copyWithToast(btn.dataset.copy, 'Copied');
      });
    });
  }

  // ==================== Sample Certificate ====================
  // Self-signed sample cert generated for demonstration
  const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUY3dGHk5FQWl+bVNuD3Z3EE6jC8gwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCVVMxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDAxMDEwMDAwMDBaFw0yNzAx
MDEwMDAwMDBaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEW
MBQGA1UEBwwNU2FuIEZyYW5jaXNjbzEVMBMGA1UECgwMRXhhbXBsZSBJbmMuMREw
DwYDVQQLDAhTZWN1cml0eTEeMBwGA1UEAwwVd3d3LmV4YW1wbGUtY2VydC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7o4qne60TB3pOYaBy1VjD
C0knJiNn4yP5SQ9MxjFHOJqccJpBH1wMIoMMjMAHT3HG2UigDIoJQnN+ml/tsc1C
kGaR/hG0RaHHP/RFi93+mpYVSnmaJlIoFfEfEMhnyM/ROKuFoiJ2oJQFBOEYbD4J
v9qGAWeAtX7kPjzHM0ot/AtqA14tJPM2s1aaMoCNNqaYPD+E4M/JYMd2Cy+cK2+Z
QzIMEXy0fGI2nE2l2LzC67GhXNq0Imb+3lB4mVoXvPM04hyQ0+Fai6BjBJBNMsX0
TAFqcJO+p/z8B1CBLNxk8gUdX+mLi/xRRNmKhygxQdlYPJQmHIEb6GIBiT/RcE/3
AgMBAAGjITAfMB0GA1UdEQQWMBSCEmRlbW8uZXhhbXBsZS5jb20wDQYJKoZIhvcN
AQELBQADggEBAG87QYi0f2jJFNPt37MN8cT6YaaQ7JkqDBHNSw/ECAE0Y5cHfYj7
VoJQMaJDl5bViNjWRW0WmIFFQekLr3eBCc7pAAaFaTGBTkHYsXzT2mNUIFpeGs3d
dQFNRHsJRj5qMI+E/BMSQ3Y8uZcpO8PhZkYT1cBQfTM93YFjrpGLpHR3ypGfNXn
nIh9NjqlCNqfPrBfFxrLPJ9bEbL9kGbGf3WAKc6UY+c0FwKqB9bfFFYU7nYMlhIC
K0Rk2k2FcPfkmhMbwCMT7cIEfklHHiNm0OBd0cD5U7kVxWn5iXuVrLm8IlWJCQ+U
Fhe3F45rRH/pD+CKFZ/vs4NJiEH5hSzYJ1A=
-----END CERTIFICATE-----`;

  // ==================== Event Handlers ====================
  decodeBtn.addEventListener('click', () => {
    const pem = pemInput.value.trim();
    if (!pem) {
      ToolsCommon.showToast('Please paste a PEM certificate', 'error');
      return;
    }

    try {
      const cert = parseCertificate(pem);
      displayCert(cert);
      ToolsCommon.showToast('Certificate decoded', 'success');
    } catch (e) {
      sslResults.classList.add('hidden');
      ToolsCommon.showToast('Failed to decode: ' + e.message, 'error');
    }
  });

  sampleBtn.addEventListener('click', () => {
    pemInput.value = SAMPLE_PEM;
    ToolsCommon.showToast('Sample certificate loaded', 'success');
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      pemInput.value = text;
      ToolsCommon.showToast('Pasted from clipboard', 'success');
    } catch {
      ToolsCommon.showToast('Failed to read clipboard', 'error');
    }
  });

  clearBtn.addEventListener('click', () => {
    pemInput.value = '';
    sslResults.classList.add('hidden');
    ToolsCommon.showToast('Cleared', 'info');
  });

})();
