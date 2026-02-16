/**
 * KVSOVANREACH HTTP Lifecycle Visualizer
 * Visualize HTTP request phases
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    // Options
    httpsEnabled: document.getElementById('httpsEnabled'),
    dnsCached: document.getElementById('dnsCached'),
    keepAlive: document.getElementById('keepAlive'),
    http2: document.getElementById('http2'),
    // Buttons
    simulateBtn: document.getElementById('simulateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    // Timeline
    totalTime: document.getElementById('totalTime'),
    // Bars
    dnsBar: document.getElementById('dnsBar'),
    tcpBar: document.getElementById('tcpBar'),
    tlsBar: document.getElementById('tlsBar'),
    requestBar: document.getElementById('requestBar'),
    waitingBar: document.getElementById('waitingBar'),
    downloadBar: document.getElementById('downloadBar'),
    // Times
    dnsTime: document.getElementById('dnsTime'),
    tcpTime: document.getElementById('tcpTime'),
    tlsTime: document.getElementById('tlsTime'),
    requestTime: document.getElementById('requestTime'),
    waitingTime: document.getElementById('waitingTime'),
    downloadTime: document.getElementById('downloadTime'),
    // Phases
    phaseDns: document.getElementById('phaseDns'),
    phaseTcp: document.getElementById('phaseTcp'),
    phaseTls: document.getElementById('phaseTls'),
    phaseRequest: document.getElementById('phaseRequest'),
    phaseWaiting: document.getElementById('phaseWaiting'),
    phaseDownload: document.getElementById('phaseDownload'),
    // Flow
    flowArrows: document.getElementById('flowArrows'),
    // Details
    detailsContent: document.getElementById('detailsContent')
  };

  // Phase information
  const phaseInfo = {
    dns: {
      name: 'DNS Lookup',
      description: 'The browser queries DNS servers to resolve the domain name to an IP address.',
      details: [
        { label: 'Query Type', value: 'A / AAAA' },
        { label: 'Protocol', value: 'UDP (port 53)' },
        { label: 'Caching', value: 'Browser / OS cache' },
        { label: 'TTL', value: 'Varies (300s typical)' }
      ]
    },
    tcp: {
      name: 'TCP Connection',
      description: 'Three-way handshake establishes a reliable connection between client and server.',
      details: [
        { label: 'Step 1', value: 'SYN (Client → Server)' },
        { label: 'Step 2', value: 'SYN-ACK (Server → Client)' },
        { label: 'Step 3', value: 'ACK (Client → Server)' },
        { label: 'RTT', value: '1.5 round trips' }
      ]
    },
    tls: {
      name: 'TLS Handshake',
      description: 'Secure connection negotiation for HTTPS requests.',
      details: [
        { label: 'Version', value: 'TLS 1.2 / 1.3' },
        { label: 'Steps', value: 'ClientHello, ServerHello, Certificate, Key Exchange' },
        { label: 'Cipher', value: 'AES-GCM (typical)' },
        { label: 'RTT', value: '2 round trips (TLS 1.2)' }
      ]
    },
    request: {
      name: 'Request Sent',
      description: 'HTTP request is sent to the server with headers and optional body.',
      details: [
        { label: 'Method', value: 'GET / POST / etc.' },
        { label: 'Headers', value: 'Host, User-Agent, Accept, etc.' },
        { label: 'Encoding', value: 'gzip / br / deflate' },
        { label: 'Cookies', value: 'Session / Auth tokens' }
      ]
    },
    waiting: {
      name: 'Waiting (TTFB)',
      description: 'Time to First Byte - waiting for server to process and respond.',
      details: [
        { label: 'Server Processing', value: 'Route handling, DB queries' },
        { label: 'Response Generation', value: 'Template rendering' },
        { label: 'Factors', value: 'Server load, complexity' },
        { label: 'Target', value: '< 200ms (ideal)' }
      ]
    },
    download: {
      name: 'Content Download',
      description: 'Response body is transferred from server to client.',
      details: [
        { label: 'Transfer', value: 'Chunked / Content-Length' },
        { label: 'Compression', value: 'gzip / Brotli' },
        { label: 'Streaming', value: 'Progressive download' },
        { label: 'Factors', value: 'Size, bandwidth, latency' }
      ]
    }
  };

  // Simulation timings (in ms)
  const baseTiming = {
    dns: { min: 20, max: 100, cached: 1 },
    tcp: { min: 15, max: 50 },
    tls: { min: 30, max: 100 },
    request: { min: 5, max: 20 },
    waiting: { min: 50, max: 300 },
    download: { min: 20, max: 150 }
  };

  let isSimulating = false;

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    updateTlsVisibility();
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    elements.simulateBtn.addEventListener('click', runSimulation);
    elements.resetBtn.addEventListener('click', resetVisualization);

    // HTTPS toggle affects TLS phase
    elements.httpsEnabled.addEventListener('change', updateTlsVisibility);

    // Phase clicks
    document.querySelectorAll('.timeline-phase').forEach(phase => {
      phase.addEventListener('click', () => {
        if (!phase.classList.contains('disabled')) {
          showPhaseDetails(phase.dataset.phase);
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Update TLS phase visibility
   */
  function updateTlsVisibility() {
    const isHttps = elements.httpsEnabled.checked;
    elements.phaseTls.classList.toggle('disabled', !isHttps);
  }

  /**
   * Run the simulation
   */
  async function runSimulation() {
    if (isSimulating) return;

    isSimulating = true;
    resetVisualization();

    const options = {
      https: elements.httpsEnabled.checked,
      dnsCached: elements.dnsCached.checked,
      keepAlive: elements.keepAlive.checked,
      http2: elements.http2.checked
    };

    // Calculate timings
    const timings = calculateTimings(options);

    // Animate phases
    await animatePhase('dns', timings.dns);
    await animatePhase('tcp', timings.tcp);

    if (options.https) {
      await animatePhase('tls', timings.tls);
    }

    await animatePhase('request', timings.request);
    await animatePhase('waiting', timings.waiting);
    await animatePhase('download', timings.download);

    // Update total time
    const total = Object.values(timings).reduce((a, b) => a + b, 0);
    elements.totalTime.textContent = `Total: ${total}ms`;

    // Render flow arrows
    renderFlowArrows(options);

    isSimulating = false;
    ToolsCommon.Toast.show('Simulation complete!', 'success');
  }

  /**
   * Calculate timings based on options
   */
  function calculateTimings(options) {
    const timings = {};

    // DNS
    if (options.dnsCached) {
      timings.dns = baseTiming.dns.cached;
    } else {
      timings.dns = randomBetween(baseTiming.dns.min, baseTiming.dns.max);
    }

    // TCP
    timings.tcp = randomBetween(baseTiming.tcp.min, baseTiming.tcp.max);

    // TLS (only for HTTPS)
    if (options.https) {
      timings.tls = randomBetween(baseTiming.tls.min, baseTiming.tls.max);
      // TLS 1.3 with HTTP/2 is faster
      if (options.http2) {
        timings.tls = Math.round(timings.tls * 0.7);
      }
    } else {
      timings.tls = 0;
    }

    // Request
    timings.request = randomBetween(baseTiming.request.min, baseTiming.request.max);

    // Waiting (TTFB)
    timings.waiting = randomBetween(baseTiming.waiting.min, baseTiming.waiting.max);

    // Download
    timings.download = randomBetween(baseTiming.download.min, baseTiming.download.max);
    // HTTP/2 multiplexing can be faster
    if (options.http2) {
      timings.download = Math.round(timings.download * 0.8);
    }

    return timings;
  }

  /**
   * Random number between min and max
   */
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Animate a phase
   */
  function animatePhase(phase, duration) {
    return new Promise(resolve => {
      const phaseEl = elements[`phase${capitalize(phase)}`];
      const barEl = elements[`${phase}Bar`];
      const timeEl = elements[`${phase}Time`];

      if (phaseEl.classList.contains('disabled')) {
        resolve();
        return;
      }

      // Mark as active
      phaseEl.classList.add('active');

      // Animate bar
      const maxWidth = getMaxBarWidth(phase);
      barEl.style.width = `${maxWidth}%`;

      // Update time display
      timeEl.textContent = `${duration}ms`;

      // Wait for animation
      setTimeout(() => {
        phaseEl.classList.remove('active');
        resolve();
      }, Math.min(duration * 2, 500));
    });
  }

  /**
   * Get max bar width based on typical phase proportion
   */
  function getMaxBarWidth(phase) {
    const proportions = {
      dns: 15,
      tcp: 12,
      tls: 20,
      request: 8,
      waiting: 30,
      download: 15
    };
    return proportions[phase] || 10;
  }

  /**
   * Capitalize first letter
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Render flow arrows
   */
  function renderFlowArrows(options) {
    const arrows = [];

    // DNS
    arrows.push({ direction: 'to-server', label: 'DNS Query' });
    arrows.push({ direction: 'to-client', label: 'DNS Response' });

    // TCP
    arrows.push({ direction: 'to-server', label: 'SYN' });
    arrows.push({ direction: 'to-client', label: 'SYN-ACK' });
    arrows.push({ direction: 'to-server', label: 'ACK' });

    // TLS
    if (options.https) {
      arrows.push({ direction: 'to-server', label: 'ClientHello' });
      arrows.push({ direction: 'to-client', label: 'ServerHello' });
    }

    // HTTP
    arrows.push({ direction: 'to-server', label: 'HTTP Request' });
    arrows.push({ direction: 'to-client', label: 'HTTP Response' });

    // Render with delays
    elements.flowArrows.innerHTML = '';

    arrows.forEach((arrow, i) => {
      setTimeout(() => {
        const arrowEl = document.createElement('div');
        arrowEl.className = `flow-arrow ${arrow.direction}`;
        arrowEl.innerHTML = `
          <div class="flow-arrow-line">
            <span class="flow-arrow-label">${arrow.label}</span>
          </div>
        `;
        elements.flowArrows.appendChild(arrowEl);
      }, i * 100);
    });
  }

  /**
   * Show phase details
   */
  function showPhaseDetails(phase) {
    const info = phaseInfo[phase];
    if (!info) return;

    // Highlight active phase
    document.querySelectorAll('.timeline-phase').forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-phase="${phase}"]`).classList.add('active');

    // Render details
    elements.detailsContent.innerHTML = `
      <div class="detail-header" style="margin-bottom: var(--space-3);">
        <strong style="color: var(--color-text);">${info.name}</strong>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-1);">
          ${info.description}
        </p>
      </div>
      ${info.details.map(d => `
        <div class="detail-item">
          <span class="detail-label">${d.label}</span>
          <span class="detail-value">${d.value}</span>
        </div>
      `).join('')}
    `;
  }

  /**
   * Reset visualization
   */
  function resetVisualization() {
    // Reset bars
    ['dns', 'tcp', 'tls', 'request', 'waiting', 'download'].forEach(phase => {
      elements[`${phase}Bar`].style.width = '0';
      elements[`${phase}Time`].textContent = '-';
    });

    // Reset total
    elements.totalTime.textContent = 'Total: 0ms';

    // Clear flow arrows
    elements.flowArrows.innerHTML = '';

    // Clear details
    elements.detailsContent.innerHTML = `
      <div class="details-placeholder">
        Click on a phase or run simulation to see details
      </div>
    `;

    // Remove active states
    document.querySelectorAll('.timeline-phase').forEach(p => p.classList.remove('active'));

    updateTlsVisibility();
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Space - Simulate
    if (e.code === 'Space') {
      e.preventDefault();
      runSimulation();
    }

    // R - Reset
    if (e.key.toLowerCase() === 'r') {
      resetVisualization();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
