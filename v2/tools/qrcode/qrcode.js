/**
 * QR Code Generator & Scanner Tool
 * Features: Generate QR codes, scan via camera/upload, bulk generation, history
 * With: Input validation, logo overlay, keyboard shortcuts, style presets
 */

// ===== STATE MANAGEMENT =====
const state = {
  activeTab: 'generator',
  contentType: 'text',
  customizationExpanded: false, // Closed by default
  qrGenerated: false,
  currentQRData: '',
  history: [],
  cameraStream: null,
  scanInterval: null,
  facingMode: 'environment',
  bulkResults: [],
  logoImage: null
};

// ===== QR CAPACITY LIMITS =====
const QR_CAPACITY = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273
};

// ===== ELEMENT REFERENCES =====
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.qr-tab'),
  panels: document.querySelectorAll('.qr-panel'),

  // Generator
  typeButtons: document.querySelectorAll('.type-btn'),
  inputForms: document.querySelectorAll('.input-form'),
  textInput: document.getElementById('textInput'),
  textCharCount: document.getElementById('textCharCount'),
  textCapacityWarning: document.getElementById('textCapacityWarning'),
  urlInput: document.getElementById('urlInput'),
  urlError: document.getElementById('urlError'),
  wifiSsid: document.getElementById('wifiSsid'),
  wifiPassword: document.getElementById('wifiPassword'),
  wifiEncryption: document.getElementById('wifiEncryption'),
  wifiHidden: document.getElementById('wifiHidden'),
  vcardFirstName: document.getElementById('vcardFirstName'),
  vcardLastName: document.getElementById('vcardLastName'),
  vcardTitle: document.getElementById('vcardTitle'),
  vcardOrg: document.getElementById('vcardOrg'),
  vcardPhone: document.getElementById('vcardPhone'),
  vcardEmail: document.getElementById('vcardEmail'),
  vcardWebsite: document.getElementById('vcardWebsite'),
  vcardAddress: document.getElementById('vcardAddress'),
  vcardNote: document.getElementById('vcardNote'),
  emailAddress: document.getElementById('emailAddress'),
  emailError: document.getElementById('emailError'),
  emailSubject: document.getElementById('emailSubject'),
  emailBody: document.getElementById('emailBody'),
  phoneNumber: document.getElementById('phoneNumber'),
  phoneError: document.getElementById('phoneError'),

  // Customization
  customizationToggle: document.getElementById('customizationToggle'),
  customizationContent: document.getElementById('customizationContent'),
  stylePresets: document.getElementById('stylePresets'),
  qrSize: document.getElementById('qrSize'),
  errorCorrection: document.getElementById('errorCorrection'),
  foregroundColor: document.getElementById('foregroundColor'),
  foregroundHex: document.getElementById('foregroundHex'),
  backgroundColor: document.getElementById('backgroundColor'),
  backgroundHex: document.getElementById('backgroundHex'),
  qrMargin: document.getElementById('qrMargin'),
  marginValue: document.getElementById('marginValue'),

  // Logo
  logoPreview: document.getElementById('logoPreview'),
  logoImage: document.getElementById('logoImage'),
  logoInput: document.getElementById('logoInput'),
  uploadLogoBtn: document.getElementById('uploadLogoBtn'),
  removeLogoBtn: document.getElementById('removeLogoBtn'),

  // Preview & Actions
  generateBtn: document.getElementById('generateBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  previewArea: document.getElementById('previewArea'),
  previewContent: document.getElementById('previewContent'),
  qrCanvas: document.getElementById('qrCanvas'),
  downloadSection: document.getElementById('downloadSection'),
  downloadBtns: document.querySelectorAll('.download-btn'),
  copyImageBtn: document.getElementById('copyImageBtn'),

  // Scanner
  scannerOptions: document.querySelectorAll('.scanner-option'),
  scannerSources: document.querySelectorAll('.scanner-source'),
  cameraContainer: document.getElementById('cameraContainer'),
  cameraVideo: document.getElementById('cameraVideo'),
  cameraPlaceholder: document.getElementById('cameraPlaceholder'),
  startCameraBtn: document.getElementById('startCameraBtn'),
  switchCameraBtn: document.getElementById('switchCameraBtn'),
  flashBtn: document.getElementById('flashBtn'),
  uploadArea: document.getElementById('uploadArea'),
  uploadPreview: document.getElementById('uploadPreview'),
  uploadedImage: document.getElementById('uploadedImage'),
  scanImageInput: document.getElementById('scanImageInput'),
  removeUploadBtn: document.getElementById('removeUploadBtn'),
  scanResult: document.getElementById('scanResult'),
  resultContent: document.getElementById('resultContent'),
  copyResultBtn: document.getElementById('copyResultBtn'),
  openResultBtn: document.getElementById('openResultBtn'),
  scanAgainBtn: document.getElementById('scanAgainBtn'),

  // Bulk
  bulkTextarea: document.getElementById('bulkTextarea'),
  bulkPrefix: document.getElementById('bulkPrefix'),
  bulkSize: document.getElementById('bulkSize'),
  bulkGenerateBtn: document.getElementById('bulkGenerateBtn'),
  bulkResults: document.getElementById('bulkResults'),
  bulkDownload: document.getElementById('bulkDownload'),
  downloadAllBtn: document.getElementById('downloadAllBtn'),

  // History
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),

  // Global
  toast: document.getElementById('toast')
};

// ===== INITIALIZATION =====
function init() {
  loadHistory();
  initTabs();
  initContentTypes();
  initCustomization();
  initStylePresets();
  initLogoUpload();
  initGenerator();
  initScanner();
  initBulk();
  initHistory();
  initKeyboardShortcuts();
  initCharacterCount();
  initInputValidation();
}

// ===== TAB NAVIGATION =====
function initTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Stop camera when leaving scanner tab
  if (state.activeTab === 'scanner' && tabName !== 'scanner') {
    stopCamera();
  }

  state.activeTab = tabName;

  // Update tab buttons
  elements.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update panels
  elements.panels.forEach(panel => {
    const panelTab = panel.id.replace('Panel', '');
    panel.classList.toggle('active', panelTab === tabName);
  });

  // Refresh history when switching to history tab
  if (tabName === 'history') {
    renderHistory();
  }
}

// ===== CONTENT TYPE SELECTION =====
function initContentTypes() {
  elements.typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      switchContentType(type);
    });
  });

  // Password toggle
  const togglePasswordBtn = document.querySelector('.toggle-password');
  togglePasswordBtn?.addEventListener('click', () => {
    const input = elements.wifiPassword;
    const icon = togglePasswordBtn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
}

function switchContentType(type) {
  state.contentType = type;

  // Update buttons
  elements.typeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // Update forms
  elements.inputForms.forEach(form => {
    const formType = form.id.replace('Form', '');
    form.classList.toggle('active', formType === type);
  });

  // Clear validation errors
  clearValidationErrors();
}

// ===== INPUT VALIDATION =====
function initInputValidation() {
  elements.urlInput?.addEventListener('blur', validateUrl);
  elements.emailAddress?.addEventListener('blur', validateEmail);
  elements.phoneNumber?.addEventListener('blur', validatePhone);
}

function validateUrl() {
  const value = elements.urlInput.value.trim();
  if (!value) {
    elements.urlError.textContent = '';
    elements.urlInput.classList.remove('error');
    return true;
  }

  // Add protocol if missing for validation
  let urlToValidate = value;
  if (!value.match(/^https?:\/\//i)) {
    urlToValidate = 'https://' + value;
  }

  try {
    new URL(urlToValidate);
    elements.urlError.textContent = '';
    elements.urlInput.classList.remove('error');
    return true;
  } catch {
    elements.urlError.textContent = 'Please enter a valid URL';
    elements.urlInput.classList.add('error');
    return false;
  }
}

function validateEmail() {
  const value = elements.emailAddress.value.trim();
  if (!value) {
    elements.emailError.textContent = '';
    elements.emailAddress.classList.remove('error');
    return true;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) {
    elements.emailError.textContent = '';
    elements.emailAddress.classList.remove('error');
    return true;
  } else {
    elements.emailError.textContent = 'Please enter a valid email address';
    elements.emailAddress.classList.add('error');
    return false;
  }
}

function validatePhone() {
  const value = elements.phoneNumber.value.trim();
  if (!value) {
    elements.phoneError.textContent = '';
    elements.phoneNumber.classList.remove('error');
    return true;
  }

  // Allow various phone formats
  const phoneRegex = /^[\d\s\-\+\(\)]{6,20}$/;
  if (phoneRegex.test(value)) {
    elements.phoneError.textContent = '';
    elements.phoneNumber.classList.remove('error');
    return true;
  } else {
    elements.phoneError.textContent = 'Please enter a valid phone number';
    elements.phoneNumber.classList.add('error');
    return false;
  }
}

function clearValidationErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input.error, .form-group textarea.error')
    .forEach(el => el.classList.remove('error'));
}

// ===== CHARACTER COUNT =====
function initCharacterCount() {
  elements.textInput?.addEventListener('input', updateCharCount);
  elements.errorCorrection?.addEventListener('change', updateCharCount);
}

function updateCharCount() {
  const length = elements.textInput.value.length;
  const errorLevel = elements.errorCorrection.value;
  const maxCapacity = QR_CAPACITY[errorLevel];

  elements.textCharCount.textContent = length;

  if (length > maxCapacity) {
    elements.textCapacityWarning.textContent = 'Exceeds capacity!';
    elements.textCapacityWarning.className = 'capacity-warning error';
  } else if (length > maxCapacity * 0.9) {
    elements.textCapacityWarning.textContent = 'Near limit';
    elements.textCapacityWarning.className = 'capacity-warning';
  } else {
    elements.textCapacityWarning.textContent = '';
    elements.textCapacityWarning.className = 'capacity-warning';
  }
}

// ===== STYLE PRESETS =====
function initStylePresets() {
  const presetBtns = elements.stylePresets?.querySelectorAll('.preset-btn');
  presetBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      const fg = btn.dataset.fg;
      const bg = btn.dataset.bg;

      // Update colors
      elements.foregroundColor.value = fg;
      elements.foregroundHex.value = fg.toUpperCase();
      elements.backgroundColor.value = bg;
      elements.backgroundHex.value = bg.toUpperCase();

      // Update active state
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Regenerate if QR exists
      if (state.qrGenerated) generateQR();
    });
  });
}

// ===== LOGO UPLOAD =====
function initLogoUpload() {
  elements.uploadLogoBtn?.addEventListener('click', () => {
    elements.logoInput.click();
  });

  elements.logoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          state.logoImage = img;
          elements.logoImage.src = event.target.result;
          elements.logoImage.style.display = 'block';
          elements.removeLogoBtn.style.display = 'block';
          elements.uploadLogoBtn.querySelector('span').textContent = 'Change';

          // Auto-set high error correction for logos
          elements.errorCorrection.value = 'H';
          updateCharCount();

          if (state.qrGenerated) generateQR();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  elements.removeLogoBtn?.addEventListener('click', () => {
    state.logoImage = null;
    elements.logoImage.src = '';
    elements.logoImage.style.display = 'none';
    elements.removeLogoBtn.style.display = 'none';
    elements.uploadLogoBtn.querySelector('span').textContent = 'Add Logo';
    elements.logoInput.value = '';

    if (state.qrGenerated) generateQR();
  });
}

// ===== CUSTOMIZATION OPTIONS =====
function initCustomization() {
  // Toggle customization panel
  elements.customizationToggle?.addEventListener('click', () => {
    state.customizationExpanded = !state.customizationExpanded;
    elements.customizationToggle.classList.toggle('active', state.customizationExpanded);
    elements.customizationContent.classList.toggle('active', state.customizationExpanded);
  });

  // Sync color inputs
  elements.foregroundColor?.addEventListener('input', (e) => {
    elements.foregroundHex.value = e.target.value.toUpperCase();
    clearPresetSelection();
    if (state.qrGenerated) generateQR();
  });

  elements.foregroundHex?.addEventListener('input', (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) {
      elements.foregroundColor.value = hex;
      clearPresetSelection();
      if (state.qrGenerated) generateQR();
    }
  });

  elements.backgroundColor?.addEventListener('input', (e) => {
    elements.backgroundHex.value = e.target.value.toUpperCase();
    clearPresetSelection();
    if (state.qrGenerated) generateQR();
  });

  elements.backgroundHex?.addEventListener('input', (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) {
      elements.backgroundColor.value = hex;
      clearPresetSelection();
      if (state.qrGenerated) generateQR();
    }
  });

  // Margin slider
  elements.qrMargin?.addEventListener('input', (e) => {
    elements.marginValue.textContent = e.target.value;
    if (state.qrGenerated) generateQR();
  });

  // Real-time updates for size and error correction
  elements.qrSize?.addEventListener('change', () => {
    if (state.qrGenerated) generateQR();
  });

  elements.errorCorrection?.addEventListener('change', () => {
    updateCharCount();
    if (state.qrGenerated) generateQR();
  });
}

function clearPresetSelection() {
  elements.stylePresets?.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function normalizeHex(hex) {
  hex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length === 6) {
    return '#' + hex.toUpperCase();
  }
  return null;
}

// ===== QR CODE GENERATOR =====
function initGenerator() {
  elements.generateBtn?.addEventListener('click', generateQR);
  elements.refreshBtn?.addEventListener('click', generateQR);

  // Download buttons
  elements.downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      downloadQR(format);
    });
  });

  // Copy to clipboard
  elements.copyImageBtn?.addEventListener('click', copyQRToClipboard);
}

function getQRContent() {
  let content = '';

  switch (state.contentType) {
    case 'text':
      content = elements.textInput.value.trim();
      break;

    case 'url':
      if (!validateUrl()) return null;
      content = elements.urlInput.value.trim();
      if (content && !content.match(/^https?:\/\//i)) {
        content = 'https://' + content;
      }
      break;

    case 'wifi':
      const ssid = elements.wifiSsid.value.trim();
      const password = elements.wifiPassword.value;
      const encryption = elements.wifiEncryption.value;
      const hidden = elements.wifiHidden.checked;

      if (ssid) {
        content = `WIFI:T:${encryption};S:${escapeSpecialChars(ssid)};P:${escapeSpecialChars(password)};H:${hidden};;`;
      }
      break;

    case 'vcard':
      const fn = elements.vcardFirstName.value.trim();
      const ln = elements.vcardLastName.value.trim();
      const title = elements.vcardTitle?.value.trim() || '';
      const org = elements.vcardOrg.value.trim();
      const phone = elements.vcardPhone.value.trim();
      const email = elements.vcardEmail.value.trim();
      const website = elements.vcardWebsite.value.trim();
      const address = elements.vcardAddress?.value.trim() || '';
      const note = elements.vcardNote?.value.trim() || '';

      if (fn || ln) {
        content = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${ln};${fn};;;`,
          `FN:${fn} ${ln}`.trim(),
          title ? `TITLE:${title}` : '',
          org ? `ORG:${org}` : '',
          phone ? `TEL:${phone}` : '',
          email ? `EMAIL:${email}` : '',
          website ? `URL:${website}` : '',
          address ? `ADR:;;${address};;;;` : '',
          note ? `NOTE:${note}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      }
      break;

    case 'email':
      if (!validateEmail()) return null;
      const emailAddr = elements.emailAddress.value.trim();
      const subject = elements.emailSubject.value.trim();
      const body = elements.emailBody.value.trim();

      if (emailAddr) {
        let mailto = `mailto:${emailAddr}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += '?' + params.join('&');
        content = mailto;
      }
      break;

    case 'phone':
      if (!validatePhone()) return null;
      const phoneNum = elements.phoneNumber.value.trim();
      if (phoneNum) {
        content = `tel:${phoneNum.replace(/\s/g, '')}`;
      }
      break;
  }

  return content;
}

function escapeSpecialChars(str) {
  return str.replace(/([\\;,:"'])/g, '\\$1');
}

async function generateQR() {
  const content = getQRContent();

  if (content === null) {
    // Validation failed
    return;
  }

  if (!content) {
    showToast('Please enter some content', 'error');
    return;
  }

  state.currentQRData = content;

  // Show loading state
  elements.generateBtn.classList.add('loading');
  elements.generateBtn.disabled = true;

  try {
    const size = parseInt(elements.qrSize.value);
    const errorCorrectionLevel = elements.errorCorrection.value;
    const foreground = elements.foregroundColor.value;
    const background = elements.backgroundColor.value;
    const margin = parseInt(elements.qrMargin.value);

    // Create QR code using qrcode-generator
    const typeNumber = 0; // Auto-detect
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(content);
    qr.make();

    // Get module count and calculate cell size
    const moduleCount = qr.getModuleCount();
    const cellSize = Math.floor((size - margin * 2) / moduleCount);
    const actualSize = cellSize * moduleCount + margin * 2;

    // Setup canvas
    const canvas = elements.qrCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = actualSize;
    canvas.height = actualSize;

    // Draw background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Draw QR modules
    ctx.fillStyle = foreground;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            margin + col * cellSize,
            margin + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    // Add logo if present
    if (state.logoImage) {
      const logoSize = actualSize * 0.2; // Logo is 20% of QR size
      const logoX = (actualSize - logoSize) / 2;
      const logoY = (actualSize - logoSize) / 2;

      // Draw white background for logo
      ctx.fillStyle = background;
      const padding = 4;
      ctx.fillRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2);

      // Draw logo
      ctx.drawImage(state.logoImage, logoX, logoY, logoSize, logoSize);
    }

    // Show preview
    elements.qrCanvas.style.display = 'block';
    const placeholder = elements.previewArea.querySelector('.preview-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Show content preview
    let contentPreview = content;
    if (content.length > 50) {
      contentPreview = content.substring(0, 50) + '...';
    }
    elements.previewContent.textContent = contentPreview;
    elements.previewContent.title = content;

    // Show download section
    elements.downloadSection.style.display = 'block';

    state.qrGenerated = true;

    // Add to history
    addToHistory(content, canvas.toDataURL('image/png'));

    showToast('QR code generated!', 'success');

  } catch (error) {
    console.error('Error generating QR code:', error);
    showToast('Failed to generate QR code', 'error');
  } finally {
    // Hide loading state
    elements.generateBtn.classList.remove('loading');
    elements.generateBtn.disabled = false;
  }
}

function downloadQR(format) {
  if (!state.qrGenerated) return;

  const canvas = elements.qrCanvas;

  switch (format) {
    case 'png':
      downloadFile(canvas.toDataURL('image/png'), 'qrcode.png');
      break;

    case 'jpeg':
      const jpegCanvas = document.createElement('canvas');
      jpegCanvas.width = canvas.width;
      jpegCanvas.height = canvas.height;
      const ctx = jpegCanvas.getContext('2d');
      ctx.fillStyle = elements.backgroundColor.value;
      ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
      ctx.drawImage(canvas, 0, 0);
      downloadFile(jpegCanvas.toDataURL('image/jpeg', 0.9), 'qrcode.jpg');
      break;

    case 'svg':
      const svg = generateSVG(state.currentQRData);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, 'qrcode.svg');
      URL.revokeObjectURL(url);
      break;
  }
}

function generateSVG(content) {
  const size = parseInt(elements.qrSize.value);
  const errorCorrectionLevel = elements.errorCorrection.value;
  const foreground = elements.foregroundColor.value;
  const background = elements.backgroundColor.value;
  const margin = parseInt(elements.qrMargin.value);

  const qr = qrcode(0, errorCorrectionLevel);
  qr.addData(content);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = (size - margin * 2) / moduleCount;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="100%" height="100%" fill="${background}"/>`;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        svg += `<rect x="${margin + col * cellSize}" y="${margin + row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${foreground}"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

function downloadFile(data, filename) {
  const link = document.createElement('a');
  link.href = data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloaded ${filename}`, 'success');
}

async function copyQRToClipboard() {
  if (!state.qrGenerated) return;

  try {
    const canvas = elements.qrCanvas;
    canvas.toBlob(async (blob) => {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('Copied to clipboard!', 'success');
    });
  } catch (error) {
    showToast('Failed to copy', 'error');
  }
}

// ===== QR CODE SCANNER =====
function initScanner() {
  elements.scannerOptions.forEach(option => {
    option.addEventListener('click', () => {
      const source = option.dataset.source;
      switchScannerSource(source);
    });
  });

  elements.startCameraBtn?.addEventListener('click', startCamera);
  elements.switchCameraBtn?.addEventListener('click', switchCamera);
  elements.flashBtn?.addEventListener('click', toggleFlash);

  elements.uploadArea?.addEventListener('click', () => {
    elements.scanImageInput.click();
  });

  elements.uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
  });

  elements.uploadArea?.addEventListener('dragleave', () => {
    elements.uploadArea.classList.remove('dragover');
  });

  elements.uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processUploadedImage(file);
    }
  });

  elements.scanImageInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processUploadedImage(file);
    }
  });

  elements.removeUploadBtn?.addEventListener('click', clearUpload);
  elements.copyResultBtn?.addEventListener('click', copyResult);
  elements.openResultBtn?.addEventListener('click', openResult);
  elements.scanAgainBtn?.addEventListener('click', scanAgain);
}

function switchScannerSource(source) {
  if (source !== 'camera') {
    stopCamera();
  }

  elements.scannerOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.source === source);
  });

  elements.scannerSources.forEach(src => {
    src.classList.toggle('active', src.id === `${source}Scanner`);
  });

  elements.scanResult.style.display = 'none';
}

async function startCamera() {
  try {
    const constraints = {
      video: {
        facingMode: state.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    state.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    elements.cameraVideo.srcObject = state.cameraStream;
    await elements.cameraVideo.play();

    elements.cameraPlaceholder.style.display = 'none';
    elements.cameraVideo.style.display = 'block';

    startScanning();

  } catch (error) {
    console.error('Camera error:', error);
    showToast('Could not access camera', 'error');
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(track => track.stop());
    state.cameraStream = null;
  }
  if (state.scanInterval) {
    clearInterval(state.scanInterval);
    state.scanInterval = null;
  }
  elements.cameraVideo.style.display = 'none';
  elements.cameraPlaceholder.style.display = 'flex';
}

async function switchCamera() {
  state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
  stopCamera();
  await startCamera();
}

async function toggleFlash() {
  if (!state.cameraStream) return;

  const track = state.cameraStream.getVideoTracks()[0];
  const capabilities = track.getCapabilities?.();

  if (capabilities?.torch) {
    try {
      const settings = track.getSettings();
      await track.applyConstraints({
        advanced: [{ torch: !settings.torch }]
      });
      elements.flashBtn.classList.toggle('active');
    } catch (error) {
      showToast('Flash not available', 'error');
    }
  } else {
    showToast('Flash not supported', 'error');
  }
}

function startScanning() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  state.scanInterval = setInterval(async () => {
    if (!elements.cameraVideo.videoWidth) return;

    canvas.width = elements.cameraVideo.videoWidth;
    canvas.height = elements.cameraVideo.videoHeight;
    ctx.drawImage(elements.cameraVideo, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        stopCamera();
        showScanResult(code.data);
      }
    } catch (error) {
      // jsQR not loaded
    }
  }, 100);
}

function processUploadedImage(file) {
  const reader = new FileReader();

  reader.onload = async (e) => {
    elements.uploadedImage.src = e.target.result;
    elements.uploadArea.style.display = 'none';
    elements.uploadPreview.style.display = 'block';

    await decodeFromImage(elements.uploadedImage);
  };

  reader.readAsDataURL(file);
}

async function decodeFromImage(img) {
  if (!img.complete) {
    await new Promise(resolve => img.onload = resolve);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (typeof jsQR !== 'undefined') {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        showScanResult(code.data);
        return;
      }
    }

    if ('BarcodeDetector' in window) {
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      if (barcodes.length > 0) {
        showScanResult(barcodes[0].rawValue);
        return;
      }
    }

    showToast('No QR code found in image', 'error');

  } catch (error) {
    console.error('Error decoding image:', error);
    showToast('Could not decode QR code', 'error');
  }
}

function clearUpload() {
  elements.uploadPreview.style.display = 'none';
  elements.uploadArea.style.display = 'flex';
  elements.uploadedImage.src = '';
  elements.scanImageInput.value = '';
  elements.scanResult.style.display = 'none';
}

function showScanResult(content) {
  elements.resultContent.textContent = content;
  elements.scanResult.style.display = 'block';

  try {
    new URL(content);
    elements.openResultBtn.style.display = 'inline-flex';
  } catch {
    if (content.match(/^https?:\/\//i) || content.match(/^www\./i)) {
      elements.openResultBtn.style.display = 'inline-flex';
    } else {
      elements.openResultBtn.style.display = 'none';
    }
  }

  showToast('QR code scanned!', 'success');
}

function copyResult() {
  const content = elements.resultContent.textContent;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Copied to clipboard!', 'success');
  });
}

function openResult() {
  let url = elements.resultContent.textContent;
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function scanAgain() {
  elements.scanResult.style.display = 'none';
  clearUpload();

  const cameraOption = document.querySelector('.scanner-option[data-source="camera"]');
  if (cameraOption?.classList.contains('active')) {
    startCamera();
  }
}

// ===== BULK GENERATOR =====
function initBulk() {
  elements.bulkGenerateBtn?.addEventListener('click', generateBulkQR);
  elements.downloadAllBtn?.addEventListener('click', downloadAllBulkZip);
}

async function generateBulkQR() {
  const lines = elements.bulkTextarea.value.split('\n').filter(line => line.trim());
  const prefix = elements.bulkPrefix.value;
  const size = parseInt(elements.bulkSize.value);

  if (lines.length === 0) {
    showToast('Please enter some data', 'error');
    return;
  }

  state.bulkResults = [];
  elements.bulkResults.innerHTML = '<div class="bulk-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  const grid = document.createElement('div');
  grid.className = 'bulk-grid';

  for (let i = 0; i < lines.length; i++) {
    const content = prefix + lines[i].trim();

    try {
      // Generate QR code using qrcode-generator
      const qr = qrcode(0, 'M');
      qr.addData(content);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const margin = 2;
      const cellSize = Math.floor((size - margin * 2) / moduleCount);
      const actualSize = cellSize * moduleCount + margin * 2;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = actualSize;
      canvas.height = actualSize;

      // Draw background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, actualSize, actualSize);

      // Draw QR modules
      ctx.fillStyle = '#000000';
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              margin + col * cellSize,
              margin + row * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }

      const item = document.createElement('div');
      item.className = 'bulk-item';

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'bulk-img';
      imgWrapper.appendChild(canvas);

      const label = document.createElement('span');
      label.className = 'bulk-label';
      label.textContent = lines[i].trim().substring(0, 20) + (lines[i].length > 20 ? '...' : '');
      label.title = lines[i];

      item.appendChild(imgWrapper);
      item.appendChild(label);
      grid.appendChild(item);

      state.bulkResults.push({
        content: content,
        label: lines[i].trim(),
        dataUrl: canvas.toDataURL('image/png')
      });

    } catch (error) {
      console.error('Error generating bulk QR:', error);
    }
  }

  elements.bulkResults.innerHTML = '';
  elements.bulkResults.appendChild(grid);

  if (state.bulkResults.length > 0) {
    elements.bulkDownload.style.display = 'block';
    showToast(`Generated ${state.bulkResults.length} QR codes`, 'success');
  }
}

async function downloadAllBulkZip() {
  if (state.bulkResults.length === 0) return;

  showToast('Creating ZIP file...', 'info');

  try {
    const zip = new JSZip();

    for (let i = 0; i < state.bulkResults.length; i++) {
      const result = state.bulkResults[i];
      const filename = `qrcode-${i + 1}-${result.label.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`;

      // Convert data URL to blob
      const base64Data = result.dataUrl.split(',')[1];
      zip.file(filename, base64Data, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'qrcodes.zip');
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error creating ZIP:', error);
    showToast('Failed to create ZIP file', 'error');
  }
}

// ===== HISTORY MANAGEMENT =====
function initHistory() {
  elements.clearHistoryBtn?.addEventListener('click', clearHistory);
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('qrcode-history');
    if (saved) {
      state.history = JSON.parse(saved);
    }
  } catch (error) {
    state.history = [];
  }
}

function saveHistory() {
  try {
    const toSave = state.history.slice(0, 20);
    localStorage.setItem('qrcode-history', JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

function addToHistory(content, imageData) {
  const entry = {
    id: Date.now(),
    content: content,
    image: imageData,
    date: new Date().toISOString()
  };

  state.history = state.history.filter(item => item.content !== content);
  state.history.unshift(entry);
  state.history = state.history.slice(0, 20);

  saveHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    elements.historyList.innerHTML = `
      <div class="history-empty">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>No QR codes generated yet</p>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = '';

  state.history.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const img = document.createElement('img');
    img.src = entry.image;
    img.alt = 'QR Code';

    const info = document.createElement('div');
    info.className = 'history-info';

    const content = document.createElement('span');
    content.className = 'history-content';
    content.textContent = entry.content.length > 30
      ? entry.content.substring(0, 30) + '...'
      : entry.content;
    content.title = entry.content;

    const date = document.createElement('span');
    date.className = 'history-date';
    date.textContent = formatDate(entry.date);

    info.appendChild(content);
    info.appendChild(date);

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'history-action-btn';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyBtn.title = 'Copy content';
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(entry.content);
      showToast('Copied!', 'success');
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'history-action-btn';
    downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
    downloadBtn.title = 'Download';
    downloadBtn.onclick = (e) => {
      e.stopPropagation();
      downloadFile(entry.image, 'qrcode.png');
    };

    const regenBtn = document.createElement('button');
    regenBtn.className = 'history-action-btn';
    regenBtn.innerHTML = '<i class="fa-solid fa-rotate"></i>';
    regenBtn.title = 'Regenerate';
    regenBtn.onclick = (e) => {
      e.stopPropagation();
      switchTab('generator');
      elements.textInput.value = entry.content;
      switchContentType('text');
      generateQR();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-action-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      state.history = state.history.filter(h => h.id !== entry.id);
      saveHistory();
      renderHistory();
      showToast('Deleted', 'success');
    };

    actions.appendChild(copyBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(regenBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(actions);

    elements.historyList.appendChild(item);
  });
}

function clearHistory() {
  if (state.history.length === 0) return;

  if (confirm('Are you sure you want to clear all history?')) {
    state.history = [];
    saveHistory();
    renderHistory();
    showToast('History cleared', 'success');
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString();
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
  // Shortcut modal handled by tools-common.js
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'g':
        if (state.activeTab === 'generator') {
          generateQR();
        }
        break;
      case 'd':
        if (state.qrGenerated) {
          downloadQR('png');
        }
        break;
      case 'c':
        if (state.qrGenerated) {
          copyQRToClipboard();
        }
        break;
      case 's':
        switchTab('scanner');
        break;
      case 'b':
        switchTab('bulk');
        break;
      case 'h':
        switchTab('history');
        break;
      case '1':
        if (state.activeTab === 'generator') switchContentType('text');
        break;
      case '2':
        if (state.activeTab === 'generator') switchContentType('url');
        break;
      case '3':
        if (state.activeTab === 'generator') switchContentType('wifi');
        break;
      case '4':
        if (state.activeTab === 'generator') switchContentType('vcard');
        break;
      case '5':
        if (state.activeTab === 'generator') switchContentType('email');
        break;
      case '6':
        if (state.activeTab === 'generator') switchContentType('phone');
        break;
    }
  });
}

// ===== TOAST NOTIFICATIONS =====
let toastTimeout;

function showToast(message, type = 'info') {
  clearTimeout(toastTimeout);

  elements.toast.textContent = message;
  elements.toast.className = `toast ${type} show`;

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', init);
