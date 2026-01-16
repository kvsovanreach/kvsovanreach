/**
 * Browser Info Tool
 * Display browser, device, network, and feature information
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.info-tab'),
    panels: document.querySelectorAll('.info-panel'),
    refreshBtn: document.getElementById('refreshBtn'),
    // Browser
    browserName: document.getElementById('browserName'),
    browserVersion: document.getElementById('browserVersion'),
    osName: document.getElementById('osName'),
    platform: document.getElementById('platform'),
    language: document.getElementById('language'),
    cookiesEnabled: document.getElementById('cookiesEnabled'),
    userAgent: document.getElementById('userAgent'),
    // Device
    screenRes: document.getElementById('screenRes'),
    viewportSize: document.getElementById('viewportSize'),
    colorDepth: document.getElementById('colorDepth'),
    pixelRatio: document.getElementById('pixelRatio'),
    deviceType: document.getElementById('deviceType'),
    touchSupport: document.getElementById('touchSupport'),
    orientation: document.getElementById('orientation'),
    deviceMemory: document.getElementById('deviceMemory'),
    // Network
    ipAddress: document.getElementById('ipAddress'),
    connectionType: document.getElementById('connectionType'),
    effectiveType: document.getElementById('effectiveType'),
    downlink: document.getElementById('downlink'),
    rtt: document.getElementById('rtt'),
    onlineStatus: document.getElementById('onlineStatus')
  };

  // ==================== Browser Detection ====================
  function detectBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Mozilla Firefox';
      version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Microsoft Edge';
      version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Google Chrome';
      version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Apple Safari';
      version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'Opera';
      version = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || 'Unknown';
    }

    return { browser, version };
  }

  function detectOS() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    if (ua.indexOf('Windows') > -1) {
      if (ua.indexOf('Windows NT 10') > -1) return 'Windows 10/11';
      if (ua.indexOf('Windows NT 6.3') > -1) return 'Windows 8.1';
      if (ua.indexOf('Windows NT 6.2') > -1) return 'Windows 8';
      if (ua.indexOf('Windows NT 6.1') > -1) return 'Windows 7';
      return 'Windows';
    }
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    if (ua.indexOf('CrOS') > -1) return 'Chrome OS';

    return platform || 'Unknown';
  }

  function detectDeviceType() {
    const ua = navigator.userAgent;

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  // ==================== Gather Info ====================
  function gatherBrowserInfo() {
    const { browser, version } = detectBrowser();

    elements.browserName.textContent = browser;
    elements.browserVersion.textContent = version;
    elements.osName.textContent = detectOS();
    elements.platform.textContent = navigator.platform || 'Unknown';
    elements.language.textContent = navigator.language || 'Unknown';
    elements.cookiesEnabled.textContent = navigator.cookieEnabled ? 'Yes' : 'No';
    elements.userAgent.textContent = navigator.userAgent;
  }

  function gatherDeviceInfo() {
    elements.screenRes.textContent = `${screen.width} x ${screen.height}`;
    elements.viewportSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    elements.colorDepth.textContent = `${screen.colorDepth}-bit`;
    elements.pixelRatio.textContent = window.devicePixelRatio || 1;
    elements.deviceType.textContent = detectDeviceType();
    elements.touchSupport.textContent = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'Yes' : 'No';
    elements.orientation.textContent = screen.orientation ? screen.orientation.type.replace('-primary', '').replace('-secondary', '') : 'Unknown';
    elements.deviceMemory.textContent = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not available';
  }

  function gatherNetworkInfo() {
    // Online status
    elements.onlineStatus.textContent = navigator.onLine ? 'Online' : 'Offline';

    // Connection info
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      elements.connectionType.textContent = connection.type || 'Unknown';
      elements.effectiveType.textContent = connection.effectiveType || 'Unknown';
      elements.downlink.textContent = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
      elements.rtt.textContent = connection.rtt ? `${connection.rtt} ms` : 'Unknown';
    } else {
      elements.connectionType.textContent = 'Not available';
      elements.effectiveType.textContent = 'Not available';
      elements.downlink.textContent = 'Not available';
      elements.rtt.textContent = 'Not available';
    }

    // IP Address - using free API
    elements.ipAddress.textContent = 'Loading...';
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        elements.ipAddress.textContent = data.ip;
      })
      .catch(() => {
        elements.ipAddress.textContent = 'Could not detect';
      });
  }

  function checkFeatures() {
    const features = {
      featureLocalStorage: () => {
        try { return !!window.localStorage; }
        catch { return false; }
      },
      featureSessionStorage: () => {
        try { return !!window.sessionStorage; }
        catch { return false; }
      },
      featureIndexedDB: () => !!window.indexedDB,
      featureWebGL: () => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch { return false; }
      },
      featureWebWorkers: () => !!window.Worker,
      featureServiceWorker: () => 'serviceWorker' in navigator,
      featureWebSocket: () => !!window.WebSocket,
      featureGeolocation: () => 'geolocation' in navigator,
      featureNotifications: () => 'Notification' in window,
      featureClipboard: () => 'clipboard' in navigator,
      featureBluetooth: () => 'bluetooth' in navigator,
      featureWebUSB: () => 'usb' in navigator
    };

    Object.keys(features).forEach(featureId => {
      const element = document.getElementById(featureId);
      if (element) {
        const isSupported = features[featureId]();
        element.classList.remove('supported', 'unsupported');
        element.classList.add(isSupported ? 'supported' : 'unsupported');
      }
    });
  }

  // ==================== Refresh All ====================
  function refreshInfo() {
    gatherBrowserInfo();
    gatherDeviceInfo();
    gatherNetworkInfo();
    checkFeatures();
    ToolsCommon.showToast('Info refreshed', 'success');
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
  }

  // ==================== Copy Functionality ====================
  function handleCopy(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const targetId = btn.dataset.copy;
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const text = targetElement.textContent;
      if (text && text !== 'Detecting...' && text !== 'Loading...') {
        ToolsCommon.copyWithToast(text, 'Copied!');
      } else {
        ToolsCommon.showToast('Nothing to copy', 'error');
      }
    }
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Refresh button
    elements.refreshBtn.addEventListener('click', refreshInfo);

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
    }, 100));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;

      switch (e.key) {
        case '1':
          switchTab('browser');
          break;
        case '2':
          switchTab('device');
          break;
        case '3':
          switchTab('network');
          break;
        case '4':
          switchTab('features');
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          refreshInfo();
          break;
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    gatherBrowserInfo();
    gatherDeviceInfo();
    gatherNetworkInfo();
    checkFeatures();
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
