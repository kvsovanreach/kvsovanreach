/**
 * KVSOVANREACH Browser Info Tool
 * Comprehensive browser, device, and feature detection
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeTab: 'browser',
    activeFeatureCategory: 'all',
    info: {},
    timeInterval: null
  };

  // ==================== Features Data ====================
  const featuresData = [
    // Storage
    { id: 'localStorage', name: 'Local Storage', icon: 'fa-solid fa-database', category: 'storage', check: () => { try { return !!window.localStorage; } catch { return false; } } },
    { id: 'sessionStorage', name: 'Session Storage', icon: 'fa-solid fa-clock-rotate-left', category: 'storage', check: () => { try { return !!window.sessionStorage; } catch { return false; } } },
    { id: 'indexedDB', name: 'IndexedDB', icon: 'fa-solid fa-layer-group', category: 'storage', check: () => !!window.indexedDB },
    { id: 'cacheAPI', name: 'Cache API', icon: 'fa-solid fa-box-archive', category: 'storage', check: () => 'caches' in window },

    // Media
    { id: 'webGL', name: 'WebGL', icon: 'fa-solid fa-cube', category: 'media', check: () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch { return false; } } },
    { id: 'webGL2', name: 'WebGL 2', icon: 'fa-solid fa-cubes', category: 'media', check: () => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } } },
    { id: 'canvas', name: 'Canvas', icon: 'fa-solid fa-image', category: 'media', check: () => !!document.createElement('canvas').getContext },
    { id: 'webAudio', name: 'Web Audio', icon: 'fa-solid fa-volume-high', category: 'media', check: () => !!(window.AudioContext || window.webkitAudioContext) },
    { id: 'mediaRecorder', name: 'Media Recorder', icon: 'fa-solid fa-record-vinyl', category: 'media', check: () => 'MediaRecorder' in window },
    { id: 'webRTC', name: 'WebRTC', icon: 'fa-solid fa-video', category: 'media', check: () => !!(window.RTCPeerConnection || window.webkitRTCPeerConnection) },

    // APIs
    { id: 'serviceWorker', name: 'Service Worker', icon: 'fa-solid fa-server', category: 'api', check: () => 'serviceWorker' in navigator },
    { id: 'webWorker', name: 'Web Workers', icon: 'fa-solid fa-gears', category: 'api', check: () => !!window.Worker },
    { id: 'sharedWorker', name: 'Shared Workers', icon: 'fa-solid fa-share-nodes', category: 'api', check: () => !!window.SharedWorker },
    { id: 'webSocket', name: 'WebSocket', icon: 'fa-solid fa-plug', category: 'api', check: () => !!window.WebSocket },
    { id: 'fetch', name: 'Fetch API', icon: 'fa-solid fa-cloud-arrow-down', category: 'api', check: () => !!window.fetch },
    { id: 'intersectionObserver', name: 'Intersection Observer', icon: 'fa-solid fa-eye', category: 'api', check: () => 'IntersectionObserver' in window },
    { id: 'resizeObserver', name: 'Resize Observer', icon: 'fa-solid fa-arrows-left-right', category: 'api', check: () => 'ResizeObserver' in window },
    { id: 'mutationObserver', name: 'Mutation Observer', icon: 'fa-solid fa-code-compare', category: 'api', check: () => 'MutationObserver' in window },
    { id: 'clipboard', name: 'Clipboard API', icon: 'fa-solid fa-clipboard', category: 'api', check: () => 'clipboard' in navigator },
    { id: 'notifications', name: 'Notifications', icon: 'fa-solid fa-bell', category: 'api', check: () => 'Notification' in window },
    { id: 'pushAPI', name: 'Push API', icon: 'fa-solid fa-paper-plane', category: 'api', check: () => 'PushManager' in window },
    { id: 'geolocation', name: 'Geolocation', icon: 'fa-solid fa-location-crosshairs', category: 'api', check: () => 'geolocation' in navigator },
    { id: 'paymentRequest', name: 'Payment Request', icon: 'fa-solid fa-credit-card', category: 'api', check: () => 'PaymentRequest' in window },
    { id: 'speechRecognition', name: 'Speech Recognition', icon: 'fa-solid fa-microphone', category: 'api', check: () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window },
    { id: 'speechSynthesis', name: 'Speech Synthesis', icon: 'fa-solid fa-comment-dots', category: 'api', check: () => 'speechSynthesis' in window },

    // Hardware
    { id: 'bluetooth', name: 'Web Bluetooth', icon: 'fa-brands fa-bluetooth', category: 'hardware', check: () => 'bluetooth' in navigator },
    { id: 'webUSB', name: 'WebUSB', icon: 'fa-brands fa-usb', category: 'hardware', check: () => 'usb' in navigator },
    { id: 'webHID', name: 'WebHID', icon: 'fa-solid fa-keyboard', category: 'hardware', check: () => 'hid' in navigator },
    { id: 'webMIDI', name: 'Web MIDI', icon: 'fa-solid fa-music', category: 'hardware', check: () => 'requestMIDIAccess' in navigator },
    { id: 'gamepad', name: 'Gamepad API', icon: 'fa-solid fa-gamepad', category: 'hardware', check: () => 'getGamepads' in navigator },
    { id: 'vibration', name: 'Vibration API', icon: 'fa-solid fa-mobile-screen-button', category: 'hardware', check: () => 'vibrate' in navigator },
    { id: 'battery', name: 'Battery API', icon: 'fa-solid fa-battery-half', category: 'hardware', check: () => 'getBattery' in navigator },
    { id: 'deviceMotion', name: 'Device Motion', icon: 'fa-solid fa-arrows-rotate', category: 'hardware', check: () => 'DeviceMotionEvent' in window },
    { id: 'deviceOrientation', name: 'Device Orientation', icon: 'fa-solid fa-compass', category: 'hardware', check: () => 'DeviceOrientationEvent' in window }
  ];

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.info-panel');

    // Header actions
    elements.refreshBtn = document.getElementById('refreshBtn');
    elements.copyAllBtn = document.getElementById('copyAllBtn');
    elements.exportBtn = document.getElementById('exportBtn');

    // Browser panel
    elements.browserIcon = document.getElementById('browserIcon');
    elements.browserName = document.getElementById('browserName');
    elements.browserVersion = document.getElementById('browserVersion');
    elements.browserFullName = document.getElementById('browserFullName');
    elements.browserEngine = document.getElementById('browserEngine');
    elements.platform = document.getElementById('platform');
    elements.language = document.getElementById('language');
    elements.cookiesEnabled = document.getElementById('cookiesEnabled');
    elements.doNotTrack = document.getElementById('doNotTrack');
    elements.userAgent = document.getElementById('userAgent');
    elements.copyUserAgent = document.getElementById('copyUserAgent');
    elements.timezone = document.getElementById('timezone');
    elements.timezoneName = document.getElementById('timezoneName');
    elements.localTime = document.getElementById('localTime');
    elements.dateFormat = document.getElementById('dateFormat');

    // Display panel
    elements.screenResText = document.getElementById('screenResText');
    elements.screenRatio = document.getElementById('screenRatio');
    elements.screenResolution = document.getElementById('screenResolution');
    elements.availableScreen = document.getElementById('availableScreen');
    elements.viewportSize = document.getElementById('viewportSize');
    elements.colorDepth = document.getElementById('colorDepth');
    elements.pixelRatio = document.getElementById('pixelRatio');
    elements.orientation = document.getElementById('orientation');
    elements.colorScheme = document.getElementById('colorScheme');
    elements.reducedMotion = document.getElementById('reducedMotion');
    elements.hdrSupport = document.getElementById('hdrSupport');
    elements.touchSupport = document.getElementById('touchSupport');

    // Hardware panel
    elements.cpuCores = document.getElementById('cpuCores');
    elements.deviceMemory = document.getElementById('deviceMemory');
    elements.connectionType = document.getElementById('connectionType');
    elements.deviceType = document.getElementById('deviceType');
    elements.operatingSystem = document.getElementById('operatingSystem');
    elements.cpuCoresDetail = document.getElementById('cpuCoresDetail');
    elements.memoryDetail = document.getElementById('memoryDetail');
    elements.architecture = document.getElementById('architecture');
    elements.connectionTypeDetail = document.getElementById('connectionTypeDetail');
    elements.effectiveType = document.getElementById('effectiveType');
    elements.downlink = document.getElementById('downlink');
    elements.rtt = document.getElementById('rtt');
    elements.onlineStatus = document.getElementById('onlineStatus');
    elements.dataSaver = document.getElementById('dataSaver');
    elements.gpuRenderer = document.getElementById('gpuRenderer');
    elements.gpuVendor = document.getElementById('gpuVendor');
    elements.batteryCard = document.getElementById('batteryCard');
    elements.batteryLevel = document.getElementById('batteryLevel');
    elements.batteryPercentage = document.getElementById('batteryPercentage');
    elements.batteryCharging = document.getElementById('batteryCharging');
    elements.batteryTimeRemaining = document.getElementById('batteryTimeRemaining');

    // Features panel
    elements.featureCategories = document.querySelectorAll('.feature-category');
    elements.featuresGrid = document.getElementById('featuresGrid');
    elements.supportedCount = document.getElementById('supportedCount');
    elements.unsupportedCount = document.getElementById('unsupportedCount');
  }

  // ==================== Browser Detection ====================
  function detectBrowser() {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    let icon = 'fa-solid fa-globe';

    // Try modern userAgentData API first (Chromium browsers)
    if (navigator.userAgentData) {
      const brands = navigator.userAgentData.brands || [];
      // Find the actual browser brand (not Chromium)
      const browserBrand = brands.find(b =>
        !b.brand.includes('Chromium') &&
        !b.brand.includes('Not') &&
        b.brand !== 'Google Chrome'
      ) || brands.find(b => b.brand === 'Google Chrome') || brands[0];

      if (browserBrand) {
        if (browserBrand.brand.includes('Edge') || browserBrand.brand === 'Microsoft Edge') {
          name = 'Edge';
          version = browserBrand.version;
          engine = 'Blink';
          icon = 'fa-brands fa-edge';
        } else if (browserBrand.brand.includes('Opera')) {
          name = 'Opera';
          version = browserBrand.version;
          engine = 'Blink';
          icon = 'fa-brands fa-opera';
        } else if (browserBrand.brand === 'Google Chrome' || browserBrand.brand.includes('Chrome')) {
          name = 'Chrome';
          version = browserBrand.version;
          engine = 'Blink';
          icon = 'fa-brands fa-chrome';
        }
      }
    }

    // Fallback to user agent parsing
    if (name === 'Unknown') {
      if (ua.includes('Firefox')) {
        name = 'Firefox';
        version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Gecko';
        icon = 'fa-brands fa-firefox-browser';
      } else if (ua.includes('Edg/')) {
        name = 'Edge';
        version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Blink';
        icon = 'fa-brands fa-edge';
      } else if (ua.includes('OPR/') || ua.includes('Opera')) {
        name = 'Opera';
        version = ua.match(/(?:OPR|Opera)\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Blink';
        icon = 'fa-brands fa-opera';
      } else if (ua.includes('Brave')) {
        name = 'Brave';
        version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Blink';
        icon = 'fa-brands fa-brave';
      } else if (ua.includes('Vivaldi')) {
        name = 'Vivaldi';
        version = ua.match(/Vivaldi\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Blink';
        icon = 'fa-solid fa-globe';
      } else if (ua.includes('Chrome')) {
        name = 'Chrome';
        version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Blink';
        icon = 'fa-brands fa-chrome';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        name = 'Safari';
        version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'WebKit';
        icon = 'fa-brands fa-safari';
      } else if (ua.includes('MSIE') || ua.includes('Trident')) {
        name = 'Internet Explorer';
        version = ua.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || 'Unknown';
        engine = 'Trident';
        icon = 'fa-brands fa-internet-explorer';
      }
    }

    return { name, version, engine, icon };
  }

  function detectOS() {
    const ua = navigator.userAgent;

    // Try modern userAgentData API first
    if (navigator.userAgentData && navigator.userAgentData.platform) {
      const platform = navigator.userAgentData.platform;
      if (platform === 'Windows') return 'Windows 10/11';
      if (platform === 'macOS') return 'macOS';
      if (platform === 'Linux') return 'Linux';
      if (platform === 'Android') return 'Android';
      if (platform === 'iOS') return 'iOS';
      if (platform === 'Chrome OS') return 'Chrome OS';
    }

    // Fallback to user agent parsing
    if (ua.includes('Windows NT 10.0')) {
      return 'Windows 10/11';
    }
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.2')) return 'Windows 8';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Windows NT 6.0')) return 'Windows Vista';
    if (ua.includes('Windows NT 5.1') || ua.includes('Windows XP')) return 'Windows XP';
    if (ua.includes('Windows')) return 'Windows';

    if (ua.includes('Mac OS X')) {
      const match = ua.match(/Mac OS X ([0-9_]+)/);
      if (match) {
        const version = match[1].replace(/_/g, '.');
        const majorVersion = parseInt(version.split('.')[0]);
        if (majorVersion >= 15) return 'macOS Sequoia';
        if (majorVersion >= 14) return 'macOS Sonoma';
        if (majorVersion >= 13) return 'macOS Ventura';
        if (majorVersion >= 12) return 'macOS Monterey';
        if (majorVersion >= 11) return 'macOS Big Sur';
        return 'macOS ' + version;
      }
      return 'macOS';
    }

    if (ua.includes('Android')) {
      const match = ua.match(/Android ([0-9.]+)/);
      return match ? 'Android ' + match[1] : 'Android';
    }

    if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
      const match = ua.match(/OS ([0-9_]+)/);
      const device = ua.includes('iPad') ? 'iPadOS' : 'iOS';
      return match ? device + ' ' + match[1].replace(/_/g, '.') : device;
    }

    if (ua.includes('CrOS')) return 'Chrome OS';
    if (ua.includes('Ubuntu')) return 'Ubuntu Linux';
    if (ua.includes('Fedora')) return 'Fedora Linux';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('FreeBSD')) return 'FreeBSD';

    return navigator.platform || 'Unknown';
  }

  function detectDeviceType() {
    const ua = navigator.userAgent;

    // Check userAgentData for mobile hint
    if (navigator.userAgentData) {
      if (navigator.userAgentData.mobile) return 'Mobile';
    }

    // Check touch capabilities combined with screen size
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const minDimension = Math.min(screenWidth, screenHeight);
    const maxDimension = Math.max(screenWidth, screenHeight);

    // Tablet detection (touch + larger screen)
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }

    // iPad detection (newer iPads report as Mac)
    if (ua.includes('Macintosh') && hasTouch && navigator.maxTouchPoints > 1) {
      return 'Tablet';
    }

    // Mobile detection
    if (/Mobile|iP(hone|od)|Android.*Mobile|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)|Windows Phone/.test(ua)) {
      return 'Mobile';
    }

    // Screen-based heuristics
    if (hasTouch && minDimension <= 480) return 'Mobile';
    if (hasTouch && minDimension > 480 && maxDimension <= 1366) return 'Tablet';

    return 'Desktop';
  }

  function detectArchitecture() {
    const ua = navigator.userAgent;

    // Check for 64-bit indicators
    if (ua.includes('Win64') || ua.includes('x64') || ua.includes('x86_64') ||
        ua.includes('amd64') || ua.includes('WOW64')) {
      return '64-bit';
    }

    // Check for ARM
    if (ua.includes('arm64') || ua.includes('aarch64')) {
      return 'ARM64';
    }
    if (ua.includes('arm') || ua.includes('ARM')) {
      return 'ARM';
    }

    // Check platform
    if (navigator.platform) {
      if (navigator.platform.includes('64')) return '64-bit';
      if (navigator.platform.includes('arm') || navigator.platform.includes('ARM')) return 'ARM';
    }

    return '32-bit';
  }

  function calculateAspectRatio(width, height) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }

  // ==================== GPU Detection ====================
  function detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { renderer: 'Not Available', vendor: 'Not Available' };

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return { renderer: 'Unknown', vendor: 'Unknown' };

      return {
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown',
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown'
      };
    } catch {
      return { renderer: 'Not Available', vendor: 'Not Available' };
    }
  }

  // ==================== Gather Information ====================
  function gatherBrowserInfo() {
    const browser = detectBrowser();

    // Update browser overview
    elements.browserIcon.innerHTML = `<i class="${browser.icon}"></i>`;
    elements.browserName.textContent = browser.name;
    elements.browserVersion.textContent = `Version ${browser.version}`;

    // Update browser details
    elements.browserFullName.textContent = `${browser.name} ${browser.version}`;
    elements.browserEngine.textContent = browser.engine;
    elements.platform.textContent = navigator.platform || 'Unknown';
    elements.language.textContent = navigator.language || 'Unknown';
    elements.cookiesEnabled.textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
    elements.doNotTrack.textContent = navigator.doNotTrack === '1' ? 'Enabled' : navigator.doNotTrack === '0' ? 'Disabled' : 'Not Set';
    elements.userAgent.textContent = navigator.userAgent;

    // Timezone info
    const offset = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    elements.timezone.textContent = `UTC${sign}${hours}${minutes ? ':' + minutes.toString().padStart(2, '0') : ''}`;
    elements.timezoneName.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Date format detection
    const dateStr = new Date(2024, 0, 15).toLocaleDateString();
    if (dateStr.startsWith('1/')) elements.dateFormat.textContent = 'M/D/YYYY';
    else if (dateStr.startsWith('01/')) elements.dateFormat.textContent = 'MM/DD/YYYY';
    else if (dateStr.startsWith('15/')) elements.dateFormat.textContent = 'DD/MM/YYYY';
    else if (dateStr.startsWith('15.')) elements.dateFormat.textContent = 'DD.MM.YYYY';
    else if (dateStr.startsWith('2024')) elements.dateFormat.textContent = 'YYYY/MM/DD';
    else elements.dateFormat.textContent = dateStr;

    // Store info
    state.info.browser = browser;
    state.info.platform = navigator.platform;
    state.info.language = navigator.language;
    state.info.userAgent = navigator.userAgent;
  }

  function gatherDisplayInfo() {
    const width = screen.width;
    const height = screen.height;
    const ratio = calculateAspectRatio(width, height);

    // Update screen overview
    elements.screenResText.textContent = `${width} x ${height}`;
    elements.screenRatio.textContent = ratio;

    // Update screen details
    elements.screenResolution.textContent = `${width} x ${height}`;
    elements.availableScreen.textContent = `${screen.availWidth} x ${screen.availHeight}`;
    elements.viewportSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    elements.colorDepth.textContent = `${screen.colorDepth}-bit`;
    elements.pixelRatio.textContent = `${window.devicePixelRatio}x`;
    elements.orientation.textContent = screen.orientation ?
      screen.orientation.type.replace(/-primary|-secondary/g, '').replace('portrait', 'Portrait').replace('landscape', 'Landscape') :
      (window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait');

    // Display features
    elements.colorScheme.textContent = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
    elements.reducedMotion.textContent = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Reduce' : 'No Preference';
    elements.hdrSupport.textContent = window.matchMedia('(dynamic-range: high)').matches ? 'Supported' : 'Not Supported';
    elements.touchSupport.textContent = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ?
      `Yes (${navigator.maxTouchPoints} points)` : 'Not Available';

    // Store info
    state.info.screen = { width, height, ratio };
    state.info.viewport = { width: window.innerWidth, height: window.innerHeight };
  }

  function gatherHardwareInfo() {
    // CPU
    const cores = navigator.hardwareConcurrency || 'Unknown';
    elements.cpuCores.textContent = cores;
    elements.cpuCoresDetail.textContent = cores !== 'Unknown' ? `${cores} cores` : 'Unknown';

    // Memory (navigator.deviceMemory is capped at 8GB for privacy and returns approximate values)
    const memory = navigator.deviceMemory;
    if (memory) {
      // If 8GB, it could be 8GB or more (API caps at 8)
      const memoryDisplay = memory >= 8 ? '8+ GB' : `${memory} GB`;
      const memoryDetailDisplay = memory >= 8 ? '8+ GB (API limit)' : `~${memory} GB`;
      elements.deviceMemory.textContent = memoryDisplay;
      elements.memoryDetail.textContent = memoryDetailDisplay;
    } else {
      elements.deviceMemory.textContent = 'N/A';
      elements.memoryDetail.textContent = 'Not Available';
    }

    // Device type & OS & Architecture
    elements.deviceType.textContent = detectDeviceType();
    elements.operatingSystem.textContent = detectOS();
    elements.architecture.textContent = detectArchitecture();

    // Network
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      elements.connectionType.textContent = connection.effectiveType?.toUpperCase() || 'Unknown';
      elements.connectionTypeDetail.textContent = connection.type || 'Unknown';
      elements.effectiveType.textContent = connection.effectiveType || 'Unknown';
      elements.downlink.textContent = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
      elements.rtt.textContent = connection.rtt !== undefined ? `${connection.rtt} ms` : 'Unknown';
      elements.dataSaver.textContent = connection.saveData ? 'On' : 'Off';
    } else {
      elements.connectionType.textContent = 'N/A';
      elements.connectionTypeDetail.textContent = 'Not Available';
      elements.effectiveType.textContent = 'Not Available';
      elements.downlink.textContent = 'Not Available';
      elements.rtt.textContent = 'Not Available';
      elements.dataSaver.textContent = 'Not Available';
    }

    elements.onlineStatus.textContent = navigator.onLine ? 'Online' : 'Offline';

    // GPU
    const gpu = detectGPU();
    elements.gpuRenderer.textContent = gpu.renderer;
    elements.gpuVendor.textContent = gpu.vendor;

    // Battery
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        updateBatteryInfo(battery);
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
      }).catch(() => {
        elements.batteryCard.style.display = 'none';
      });
    } else {
      elements.batteryCard.style.display = 'none';
    }

    // Store info
    state.info.hardware = {
      cpuCores: cores,
      memory,
      architecture: detectArchitecture(),
      deviceType: detectDeviceType(),
      os: detectOS(),
      gpu
    };
  }

  function updateBatteryInfo(battery) {
    const level = Math.round(battery.level * 100);
    elements.batteryLevel.style.width = `${level}%`;
    elements.batteryPercentage.textContent = `${level}%`;
    elements.batteryCharging.textContent = battery.charging ? 'Yes' : 'No';

    // Update battery level styling
    elements.batteryLevel.classList.remove('low', 'charging');
    if (battery.charging) {
      elements.batteryLevel.classList.add('charging');
    } else if (level <= 20) {
      elements.batteryLevel.classList.add('low');
    }

    // Time remaining
    if (battery.charging && battery.chargingTime !== Infinity) {
      const mins = Math.round(battery.chargingTime / 60);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      elements.batteryTimeRemaining.textContent = hours > 0 ? `${hours}h ${remainingMins}m to full` : `${mins}m to full`;
    } else if (!battery.charging && battery.dischargingTime !== Infinity) {
      const mins = Math.round(battery.dischargingTime / 60);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      elements.batteryTimeRemaining.textContent = hours > 0 ? `${hours}h ${remainingMins}m remaining` : `${mins}m remaining`;
    } else {
      elements.batteryTimeRemaining.textContent = battery.charging ? 'Calculating...' : 'N/A';
    }
  }

  function gatherFeaturesInfo() {
    renderFeatures();
  }

  function renderFeatures(category = 'all') {
    const filteredFeatures = category === 'all' ?
      featuresData :
      featuresData.filter(f => f.category === category);

    let supportedCount = 0;
    let unsupportedCount = 0;

    elements.featuresGrid.innerHTML = filteredFeatures.map(feature => {
      const isSupported = feature.check();
      if (isSupported) supportedCount++;
      else unsupportedCount++;
      return `
        <div class="feature-item ${isSupported ? 'supported' : 'unsupported'}" data-feature="${feature.id}">
          <i class="${feature.icon}"></i>
          <span>${feature.name}</span>
        </div>
      `;
    }).join('');

    // Update summary counts
    if (elements.supportedCount) elements.supportedCount.textContent = supportedCount;
    if (elements.unsupportedCount) elements.unsupportedCount.textContent = unsupportedCount;

    // Store feature support info
    state.info.features = {};
    featuresData.forEach(f => {
      state.info.features[f.id] = f.check();
    });
  }

  function updateLocalTime() {
    elements.localTime.textContent = new Date().toLocaleTimeString();
  }

  // ==================== Refresh All ====================
  function refreshAll() {
    gatherBrowserInfo();
    gatherDisplayInfo();
    gatherHardwareInfo();
    gatherFeaturesInfo();
    updateLocalTime();
    ToolsCommon.showToast('Info refreshed', 'success');
  }

  // ==================== Actions ====================
  function copyAllInfo() {
    const info = {
      browser: {
        name: elements.browserFullName.textContent,
        engine: elements.browserEngine.textContent,
        userAgent: elements.userAgent.textContent
      },
      system: {
        platform: elements.platform.textContent,
        os: elements.operatingSystem.textContent,
        deviceType: elements.deviceType.textContent,
        language: elements.language.textContent,
        timezone: elements.timezoneName.textContent
      },
      display: {
        screenResolution: elements.screenResolution.textContent,
        viewportSize: elements.viewportSize.textContent,
        colorDepth: elements.colorDepth.textContent,
        pixelRatio: elements.pixelRatio.textContent,
        orientation: elements.orientation.textContent
      },
      hardware: {
        cpuCores: elements.cpuCoresDetail.textContent,
        memory: elements.memoryDetail.textContent,
        architecture: elements.architecture.textContent,
        gpu: elements.gpuRenderer.textContent
      },
      network: {
        connectionType: elements.connectionTypeDetail.textContent,
        effectiveType: elements.effectiveType.textContent,
        downlink: elements.downlink.textContent,
        online: elements.onlineStatus.textContent
      },
      features: state.info.features
    };

    const text = JSON.stringify(info, null, 2);
    ToolsCommon.copyWithToast(text, 'All info copied!');
  }

  function exportJSON() {
    const info = {
      timestamp: new Date().toISOString(),
      browser: {
        name: elements.browserFullName.textContent,
        engine: elements.browserEngine.textContent,
        userAgent: elements.userAgent.textContent,
        cookies: elements.cookiesEnabled.textContent,
        doNotTrack: elements.doNotTrack.textContent
      },
      system: {
        platform: elements.platform.textContent,
        os: elements.operatingSystem.textContent,
        deviceType: elements.deviceType.textContent,
        language: elements.language.textContent,
        timezone: elements.timezoneName.textContent,
        timezoneOffset: elements.timezone.textContent
      },
      display: {
        screenResolution: elements.screenResolution.textContent,
        availableScreen: elements.availableScreen.textContent,
        viewportSize: elements.viewportSize.textContent,
        colorDepth: elements.colorDepth.textContent,
        pixelRatio: elements.pixelRatio.textContent,
        orientation: elements.orientation.textContent,
        colorScheme: elements.colorScheme.textContent,
        reducedMotion: elements.reducedMotion.textContent,
        hdrSupport: elements.hdrSupport.textContent,
        touchSupport: elements.touchSupport.textContent
      },
      hardware: {
        cpuCores: elements.cpuCoresDetail.textContent,
        memory: elements.memoryDetail.textContent,
        architecture: elements.architecture.textContent,
        gpuRenderer: elements.gpuRenderer.textContent,
        gpuVendor: elements.gpuVendor.textContent
      },
      network: {
        connectionType: elements.connectionTypeDetail.textContent,
        effectiveType: elements.effectiveType.textContent,
        downlink: elements.downlink.textContent,
        rtt: elements.rtt.textContent,
        online: elements.onlineStatus.textContent,
        dataSaver: elements.dataSaver.textContent
      },
      features: state.info.features
    };

    ToolsCommon.downloadJson(info, 'browser-info.json');
    ToolsCommon.showToast('JSON exported', 'success');
  }

  // ==================== Tab Navigation ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });

    state.activeTab = tabName;
  }

  // ==================== Feature Categories ====================
  function switchFeatureCategory(category) {
    elements.featureCategories.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    state.activeFeatureCategory = category;
    renderFeatures(category);
  }

  // ==================== Copy Handler ====================
  function handleCopy(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const targetId = btn.dataset.copy;
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const text = targetElement.textContent;
        if (text && text !== 'Loading...' && text !== 'Detecting...' && text !== '--') {
          ToolsCommon.copyWithToast(text, 'Copied!');
        }
      }
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Feature categories
    elements.featureCategories.forEach(btn => {
      btn.addEventListener('click', () => switchFeatureCategory(btn.dataset.category));
    });

    // Header actions
    if (elements.refreshBtn) {
      elements.refreshBtn.addEventListener('click', refreshAll);
    }
    elements.copyAllBtn.addEventListener('click', copyAllInfo);
    elements.exportBtn.addEventListener('click', exportJSON);

    // Copy user agent
    elements.copyUserAgent.addEventListener('click', () => {
      ToolsCommon.copyWithToast(elements.userAgent.textContent, 'User Agent copied!');
    });

    // Copy buttons
    document.addEventListener('click', handleCopy);

    // Online/offline events
    window.addEventListener('online', () => {
      elements.onlineStatus.textContent = 'Online';
      ToolsCommon.showToast('You are online', 'success');
    });

    window.addEventListener('offline', () => {
      elements.onlineStatus.textContent = 'Offline';
      ToolsCommon.showToast('You are offline', 'error');
    });

    // Resize event
    window.addEventListener('resize', ToolsCommon.debounce(() => {
      elements.viewportSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
      elements.orientation.textContent = screen.orientation ?
        screen.orientation.type.replace(/-primary|-secondary/g, '').replace('portrait', 'Portrait').replace('landscape', 'Landscape') :
        (window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait');
    }, 100));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;

      switch (e.key.toLowerCase()) {
        case '1':
          e.preventDefault();
          switchTab('browser');
          break;
        case '2':
          e.preventDefault();
          switchTab('display');
          break;
        case '3':
          e.preventDefault();
          switchTab('hardware');
          break;
        case '4':
          e.preventDefault();
          switchTab('features');
          break;
        case 'r':
          e.preventDefault();
          refreshAll();
          break;
        case 'c':
          e.preventDefault();
          copyAllInfo();
          break;
        case 'e':
          e.preventDefault();
          exportJSON();
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    gatherBrowserInfo();
    gatherDisplayInfo();
    gatherHardwareInfo();
    gatherFeaturesInfo();
    updateLocalTime();
    initEventListeners();

    // Update time every second
    state.timeInterval = setInterval(updateLocalTime, 1000);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
