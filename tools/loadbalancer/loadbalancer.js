/**
 * Load Balancer Visualizer
 */
(function() {
  'use strict';

  const STRATEGIES = {
    roundrobin: 'Round Robin',
    leastconn: 'Least Connections',
    weighted: 'Weighted Round Robin',
    random: 'Random',
    iphash: 'IP Hash'
  };

  const RATES = { slow: 2000, normal: 1000, fast: 500, burst: 200 };
  const CLIENT_IPS = ['192.168.1.10', '192.168.1.25', '192.168.1.42', '10.0.0.15', '10.0.0.88'];

  const state = {
    servers: [],
    clients: [],
    isRunning: false,
    requestTimer: null,
    roundRobinIndex: 0,
    totalRequests: 0,
    requestTimes: [],
    startTime: null
  };

  const elements = {
    strategy: document.getElementById('strategy'),
    serverCount: document.getElementById('serverCount'),
    requestRate: document.getElementById('requestRate'),
    startBtn: document.getElementById('startBtn'),
    sendBtn: document.getElementById('sendBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    clientsList: document.getElementById('clientsList'),
    serversList: document.getElementById('serversList'),
    lbBox: document.getElementById('lbBox'),
    lbAlgorithm: document.getElementById('lbAlgorithm'),
    connectionsSvg: document.getElementById('connectionsSvg'),
    totalRequests: document.getElementById('totalRequests'),
    activeConnections: document.getElementById('activeConnections'),
    avgResponseTime: document.getElementById('avgResponseTime'),
    requestsPerSec: document.getElementById('requestsPerSec'),
    serverMetrics: document.getElementById('serverMetrics')
  };

  function initializeServers() {
    const count = parseInt(elements.serverCount.value);
    state.servers = [];

    for (let i = 0; i < count; i++) {
      state.servers.push({
        id: i + 1,
        name: `Server ${i + 1}`,
        connections: 0,
        totalRequests: 0,
        weight: Math.floor(Math.random() * 3) + 1, // 1-3 weight
        responseTime: Math.floor(Math.random() * 100) + 50 // 50-150ms
      });
    }

    renderServers();
    renderServerMetrics();
  }

  function initializeClients() {
    state.clients = CLIENT_IPS.slice(0, 3).map((ip, i) => ({
      id: i + 1,
      ip: ip
    }));
    renderClients();
  }

  function renderClients() {
    elements.clientsList.innerHTML = state.clients.map(client => `
      <div class="client-node" id="client-${client.id}" data-ip="${client.ip}">
        <span>${client.ip}</span>
        <i class="fa-solid fa-laptop"></i>
      </div>
    `).join('');
  }

  function renderServers() {
    elements.serversList.innerHTML = state.servers.map(server => `
      <div class="server-node" id="server-${server.id}">
        <i class="fa-solid fa-server"></i>
        <span>${server.name}</span>
        <span class="server-load">${server.connections}</span>
      </div>
    `).join('');
  }

  function renderServerMetrics() {
    elements.serverMetrics.innerHTML = state.servers.map(server => {
      const loadPercent = Math.min((server.connections / 5) * 100, 100);
      const isHigh = loadPercent > 60;

      return `
        <div class="server-metric-card">
          <div class="server-metric-header">
            <div class="server-metric-name">
              <i class="fa-solid fa-server"></i>
              ${server.name}
            </div>
            <div class="server-metric-status ${server.connections > 0 ? 'busy' : ''}">
              ${server.connections > 0 ? 'Busy' : 'Idle'}
            </div>
          </div>
          <div class="server-metric-stats">
            <div class="server-metric-stat">
              <span class="server-metric-stat-label">Requests</span>
              <span class="server-metric-stat-value">${server.totalRequests}</span>
            </div>
            <div class="server-metric-stat">
              <span class="server-metric-stat-label">Connections</span>
              <span class="server-metric-stat-value">${server.connections}</span>
            </div>
            <div class="server-metric-stat">
              <span class="server-metric-stat-label">Weight</span>
              <span class="server-metric-stat-value">${server.weight}</span>
            </div>
            <div class="server-metric-stat">
              <span class="server-metric-stat-label">Latency</span>
              <span class="server-metric-stat-value">${server.responseTime}ms</span>
            </div>
          </div>
          <div class="load-bar">
            <div class="load-bar-fill ${isHigh ? 'high' : ''}" style="width: ${loadPercent}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function selectServer(clientIp) {
    const strategy = elements.strategy.value;
    let server;

    switch (strategy) {
      case 'roundrobin':
        server = state.servers[state.roundRobinIndex];
        state.roundRobinIndex = (state.roundRobinIndex + 1) % state.servers.length;
        break;

      case 'leastconn':
        server = state.servers.reduce((min, s) =>
          s.connections < min.connections ? s : min
        );
        break;

      case 'weighted':
        // Create weighted pool
        const pool = [];
        state.servers.forEach(s => {
          for (let i = 0; i < s.weight; i++) pool.push(s);
        });
        server = pool[state.roundRobinIndex % pool.length];
        state.roundRobinIndex++;
        break;

      case 'random':
        server = state.servers[Math.floor(Math.random() * state.servers.length)];
        break;

      case 'iphash':
        // Simple hash based on IP
        const hash = clientIp.split('.').reduce((sum, octet) => sum + parseInt(octet), 0);
        server = state.servers[hash % state.servers.length];
        break;

      default:
        server = state.servers[0];
    }

    return server;
  }

  function sendRequest() {
    // Pick random client
    const client = state.clients[Math.floor(Math.random() * state.clients.length)];
    const server = selectServer(client.ip);

    // Update state
    server.connections++;
    server.totalRequests++;
    state.totalRequests++;

    const responseTime = server.responseTime + Math.floor(Math.random() * 50);
    state.requestTimes.push(responseTime);
    if (state.requestTimes.length > 100) state.requestTimes.shift();

    // Visual feedback
    const clientNode = document.getElementById(`client-${client.id}`);
    const serverNode = document.getElementById(`server-${server.id}`);

    clientNode.classList.add('active');
    elements.lbBox.classList.add('active');

    setTimeout(() => {
      serverNode.classList.add('active');
      serverNode.querySelector('.server-load').textContent = server.connections;
    }, 150);

    // Complete request after response time
    setTimeout(() => {
      server.connections--;
      clientNode.classList.remove('active');
      serverNode.classList.remove('active');
      elements.lbBox.classList.remove('active');
      serverNode.querySelector('.server-load').textContent = server.connections;

      updateStats();
      renderServerMetrics();
    }, responseTime);

    updateStats();
    renderServerMetrics();
  }

  function updateStats() {
    elements.totalRequests.textContent = state.totalRequests;

    const activeConn = state.servers.reduce((sum, s) => sum + s.connections, 0);
    elements.activeConnections.textContent = activeConn;

    if (state.requestTimes.length > 0) {
      const avg = Math.round(state.requestTimes.reduce((a, b) => a + b, 0) / state.requestTimes.length);
      elements.avgResponseTime.textContent = `${avg}ms`;
    }

    if (state.startTime) {
      const elapsed = (Date.now() - state.startTime) / 1000;
      const rps = elapsed > 0 ? (state.totalRequests / elapsed).toFixed(1) : 0;
      elements.requestsPerSec.textContent = rps;
    }
  }

  function start() {
    if (state.isRunning) {
      stop();
      return;
    }

    state.isRunning = true;
    state.startTime = Date.now();
    elements.startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';

    const rate = RATES[elements.requestRate.value];

    function tick() {
      if (!state.isRunning) return;
      sendRequest();
      state.requestTimer = setTimeout(tick, rate);
    }

    tick();
    ToolsCommon.Toast.show('Simulation started');
  }

  function stop() {
    state.isRunning = false;
    if (state.requestTimer) {
      clearTimeout(state.requestTimer);
      state.requestTimer = null;
    }
    elements.startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    ToolsCommon.Toast.show('Simulation paused');
  }

  function reset() {
    stop();
    state.totalRequests = 0;
    state.requestTimes = [];
    state.roundRobinIndex = 0;
    state.startTime = null;

    initializeServers();
    updateStats();
    ToolsCommon.Toast.show('Reset complete');
  }

  function updateStrategy() {
    elements.lbAlgorithm.textContent = STRATEGIES[elements.strategy.value];
    state.roundRobinIndex = 0;
    ToolsCommon.Toast.show(`Strategy: ${STRATEGIES[elements.strategy.value]}`);
  }

  function exportStats() {
    let text = 'Load Balancer Statistics\n';
    text += '========================\n\n';
    text += `Strategy: ${STRATEGIES[elements.strategy.value]}\n`;
    text += `Total Requests: ${state.totalRequests}\n`;
    text += `Avg Response Time: ${elements.avgResponseTime.textContent}\n`;
    text += `Requests/sec: ${elements.requestsPerSec.textContent}\n\n`;
    text += 'Server Statistics:\n';
    text += '-----------------\n';

    state.servers.forEach(s => {
      text += `${s.name}: ${s.totalRequests} requests, Weight: ${s.weight}, Latency: ${s.responseTime}ms\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    ToolsCommon.FileDownload.blob(blob, 'loadbalancer-stats.txt');
    ToolsCommon.Toast.show('Exported!', 'success');
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      start();
    } else if (e.key.toLowerCase() === 's') {
      sendRequest();
    } else if (e.key.toLowerCase() === 'r') {
      reset();
    }
  }

  function init() {
    elements.strategy.addEventListener('change', updateStrategy);
    elements.serverCount.addEventListener('change', () => {
      initializeServers();
      state.roundRobinIndex = 0;
    });
    elements.startBtn.addEventListener('click', start);
    elements.sendBtn.addEventListener('click', sendRequest);
    elements.resetBtn.addEventListener('click', reset);
    elements.exportBtn.addEventListener('click', exportStats);
    document.addEventListener('keydown', handleKeydown);

    initializeClients();
    initializeServers();
    updateStrategy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
