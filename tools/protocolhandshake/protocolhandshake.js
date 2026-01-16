/**
 * Protocol Handshake Visualizer
 */
(function() {
  'use strict';

  const PROTOCOLS = {
    tcp: {
      name: 'TCP 3-Way Handshake',
      partyA: { icon: 'fa-laptop', label: 'Client' },
      partyB: { icon: 'fa-server', label: 'Server' },
      steps: [
        { direction: 'right', type: 'syn', label: 'SYN', title: 'SYN (Synchronize)', desc: 'Client initiates connection by sending a SYN packet with a random sequence number (seq=x).' },
        { direction: 'left', type: 'ack', label: 'SYN-ACK', title: 'SYN-ACK (Synchronize-Acknowledge)', desc: 'Server acknowledges with SYN-ACK, sending its own sequence number (seq=y) and acknowledging client\'s (ack=x+1).' },
        { direction: 'right', type: 'ack', label: 'ACK', title: 'ACK (Acknowledge)', desc: 'Client sends final ACK (ack=y+1). Connection is now established and data transfer can begin.' }
      ],
      legend: [
        { type: 'syn', label: 'SYN - Synchronize', color: '#3b82f6' },
        { type: 'ack', label: 'ACK - Acknowledge', color: '#22c55e' }
      ]
    },
    tls: {
      name: 'TLS 1.3 Handshake',
      partyA: { icon: 'fa-laptop', label: 'Client' },
      partyB: { icon: 'fa-server', label: 'Server' },
      steps: [
        { direction: 'right', type: 'syn', label: 'ClientHello', title: 'Client Hello', desc: 'Client sends supported cipher suites, TLS version, random number, and key share for key exchange.' },
        { direction: 'left', type: 'secure', label: 'ServerHello', title: 'Server Hello', desc: 'Server responds with chosen cipher suite, its random number, key share, and certificate.' },
        { direction: 'left', type: 'secure', label: 'Certificate', title: 'Server Certificate', desc: 'Server sends its X.509 certificate for client to verify server identity.' },
        { direction: 'left', type: 'secure', label: 'CertVerify', title: 'Certificate Verify', desc: 'Server proves it owns the private key by signing the handshake transcript.' },
        { direction: 'left', type: 'ack', label: 'Finished', title: 'Server Finished', desc: 'Server confirms handshake integrity with a MAC over all handshake messages.' },
        { direction: 'right', type: 'ack', label: 'Finished', title: 'Client Finished', desc: 'Client confirms handshake. Secure channel is now established for encrypted communication.' }
      ],
      legend: [
        { type: 'syn', label: 'Hello Messages', color: '#3b82f6' },
        { type: 'secure', label: 'Security Exchange', color: '#8b5cf6' },
        { type: 'ack', label: 'Confirmation', color: '#22c55e' }
      ]
    },
    oauth: {
      name: 'OAuth 2.0 Authorization Code Flow',
      partyA: { icon: 'fa-user', label: 'User/App' },
      partyB: { icon: 'fa-shield-halved', label: 'Auth Server' },
      steps: [
        { direction: 'right', type: 'auth', label: 'Auth Request', title: 'Authorization Request', desc: 'App redirects user to authorization server with client_id, redirect_uri, scope, and state.' },
        { direction: 'left', type: 'auth', label: 'Login Prompt', title: 'User Authentication', desc: 'Auth server presents login form. User authenticates and grants permissions.' },
        { direction: 'left', type: 'token', label: 'Auth Code', title: 'Authorization Code', desc: 'After consent, server redirects back with authorization code and state parameter.' },
        { direction: 'right', type: 'token', label: 'Token Request', title: 'Token Exchange', desc: 'App exchanges auth code for tokens, sending client_id, client_secret, and code.' },
        { direction: 'left', type: 'ack', label: 'Access Token', title: 'Token Response', desc: 'Server returns access_token, refresh_token (optional), and expiration time.' },
        { direction: 'right', type: 'data', label: 'API Request', title: 'Protected Resource Access', desc: 'App uses access token in Authorization header to access protected APIs.' }
      ],
      legend: [
        { type: 'auth', label: 'Authorization', color: '#ec4899' },
        { type: 'token', label: 'Token Exchange', color: '#14b8a6' },
        { type: 'ack', label: 'Response', color: '#22c55e' },
        { type: 'data', label: 'Data Transfer', color: '#f59e0b' }
      ]
    },
    websocket: {
      name: 'WebSocket Upgrade',
      partyA: { icon: 'fa-laptop', label: 'Client' },
      partyB: { icon: 'fa-server', label: 'Server' },
      steps: [
        { direction: 'right', type: 'syn', label: 'HTTP Upgrade', title: 'WebSocket Upgrade Request', desc: 'Client sends HTTP GET with Upgrade: websocket, Connection: Upgrade, and Sec-WebSocket-Key headers.' },
        { direction: 'left', type: 'ack', label: '101 Switching', title: 'Protocol Switch', desc: 'Server responds with HTTP 101, confirming upgrade with Sec-WebSocket-Accept header.' },
        { direction: 'right', type: 'data', label: 'WS Frame', title: 'WebSocket Data Frame', desc: 'Client can now send WebSocket frames. Connection is full-duplex.' },
        { direction: 'left', type: 'data', label: 'WS Frame', title: 'Server Push', desc: 'Server can push data anytime without client request. True bidirectional communication.' }
      ],
      legend: [
        { type: 'syn', label: 'Upgrade Request', color: '#3b82f6' },
        { type: 'ack', label: 'Confirmation', color: '#22c55e' },
        { type: 'data', label: 'WebSocket Frames', color: '#f59e0b' }
      ]
    }
  };

  const SPEEDS = { slow: 1500, normal: 1000, fast: 500 };

  const state = {
    protocol: 'tcp',
    currentStep: 0,
    isPlaying: false,
    animationTimer: null
  };

  const elements = {
    protocolType: document.getElementById('protocolType'),
    animSpeed: document.getElementById('animSpeed'),
    startBtn: document.getElementById('startBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    partyA: document.getElementById('partyA'),
    partyB: document.getElementById('partyB'),
    messagesContainer: document.getElementById('messagesContainer'),
    stepNumber: document.getElementById('stepNumber'),
    totalSteps: document.getElementById('totalSteps'),
    stepTitle: document.getElementById('stepTitle'),
    stepDescription: document.getElementById('stepDescription'),
    legendGrid: document.getElementById('legendGrid')
  };

  function getProtocol() {
    return PROTOCOLS[state.protocol];
  }

  function getSpeed() {
    return SPEEDS[elements.animSpeed.value];
  }

  function setupProtocol() {
    const protocol = getProtocol();

    // Update parties
    elements.partyA.querySelector('.party-icon').innerHTML = `<i class="fa-solid ${protocol.partyA.icon}"></i>`;
    elements.partyA.querySelector('.party-label').textContent = protocol.partyA.label;
    elements.partyB.querySelector('.party-icon').innerHTML = `<i class="fa-solid ${protocol.partyB.icon}"></i>`;
    elements.partyB.querySelector('.party-label').textContent = protocol.partyB.label;

    // Clear and create message rows
    elements.messagesContainer.innerHTML = '';
    protocol.steps.forEach((step, i) => {
      const row = document.createElement('div');
      row.className = 'message-row';
      row.dataset.type = step.type;
      row.dataset.index = i;

      row.innerHTML = `
        <div class="message-node"></div>
        <div class="message-arrow ${step.direction}">
          <div class="arrow-line">
            <span class="message-label">${step.label}</span>
          </div>
        </div>
        <div class="message-node"></div>
      `;

      elements.messagesContainer.appendChild(row);
    });

    // Update legend
    elements.legendGrid.innerHTML = protocol.legend.map(item => `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${item.color}"></div>
        <span class="legend-label">${item.label}</span>
      </div>
    `).join('');

    // Update step counter
    elements.totalSteps.textContent = protocol.steps.length;
    updateStepInfo();
  }

  function updateStepInfo() {
    const protocol = getProtocol();
    elements.stepNumber.textContent = state.currentStep;

    if (state.currentStep === 0) {
      elements.stepTitle.textContent = 'Ready to Start';
      elements.stepDescription.textContent = `Click Start or Step to begin the ${protocol.name} visualization.`;
    } else {
      const step = protocol.steps[state.currentStep - 1];
      elements.stepTitle.textContent = step.title;
      elements.stepDescription.textContent = step.desc;
    }

    // Update button states
    const isComplete = state.currentStep >= protocol.steps.length;
    elements.stepBtn.disabled = isComplete;
    elements.startBtn.innerHTML = state.isPlaying
      ? '<i class="fa-solid fa-pause"></i> Pause'
      : '<i class="fa-solid fa-play"></i> Start';
  }

  function showStep(index) {
    const rows = elements.messagesContainer.querySelectorAll('.message-row');
    rows.forEach((row, i) => {
      row.classList.remove('active');
      if (i < index) {
        row.classList.add('visible');
      } else {
        row.classList.remove('visible');
      }
    });

    if (index > 0 && index <= rows.length) {
      rows[index - 1].classList.add('visible', 'active');
    }
  }

  function stepForward() {
    const protocol = getProtocol();
    if (state.currentStep >= protocol.steps.length) {
      stopAnimation();
      return false;
    }

    state.currentStep++;
    showStep(state.currentStep);
    updateStepInfo();

    if (state.currentStep >= protocol.steps.length) {
      stopAnimation();
      ToolsCommon.Toast.show('Handshake complete!', 'success');
    }

    return true;
  }

  function startAnimation() {
    if (state.isPlaying) {
      stopAnimation();
      return;
    }

    const protocol = getProtocol();
    if (state.currentStep >= protocol.steps.length) {
      reset();
    }

    state.isPlaying = true;
    updateStepInfo();

    function animate() {
      if (!state.isPlaying) return;

      const hasMore = stepForward();
      if (hasMore && state.isPlaying) {
        state.animationTimer = setTimeout(animate, getSpeed());
      }
    }

    animate();
  }

  function stopAnimation() {
    state.isPlaying = false;
    if (state.animationTimer) {
      clearTimeout(state.animationTimer);
      state.animationTimer = null;
    }
    updateStepInfo();
  }

  function reset() {
    stopAnimation();
    state.currentStep = 0;
    showStep(0);
    updateStepInfo();
    ToolsCommon.Toast.show('Reset complete');
  }

  function changeProtocol() {
    state.protocol = elements.protocolType.value;
    state.currentStep = 0;
    state.isPlaying = false;
    setupProtocol();
    ToolsCommon.Toast.show(`Loaded: ${getProtocol().name}`);
  }

  function exportDiagram() {
    const container = document.querySelector('.diagram-container');

    // Create a simple text representation
    const protocol = getProtocol();
    let text = `${protocol.name}\n`;
    text += '='.repeat(protocol.name.length) + '\n\n';
    text += `${protocol.partyA.label} <-> ${protocol.partyB.label}\n\n`;

    protocol.steps.forEach((step, i) => {
      const arrow = step.direction === 'right' ? '--->' : '<---';
      text += `${i + 1}. [${step.label}] ${arrow}\n`;
      text += `   ${step.title}\n`;
      text += `   ${step.desc}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    ToolsCommon.FileDownload.blob(blob, `${state.protocol}-handshake.txt`);
    ToolsCommon.Toast.show('Exported!', 'success');
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      startAnimation();
    } else if (e.key.toLowerCase() === 's') {
      stepForward();
    } else if (e.key.toLowerCase() === 'r') {
      reset();
    }
  }

  function init() {
    elements.protocolType.addEventListener('change', changeProtocol);
    elements.startBtn.addEventListener('click', startAnimation);
    elements.stepBtn.addEventListener('click', stepForward);
    elements.resetBtn.addEventListener('click', reset);
    elements.exportBtn.addEventListener('click', exportDiagram);
    document.addEventListener('keydown', handleKeydown);

    setupProtocol();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
