/**
 * KVSOVANREACH Port Reference Tool
 * Searchable reference guide for common network ports
 */

(function() {
  'use strict';

  // ==================== Port Data ====================
  const ports = [
    // Web
    { port: 80, protocol: 'TCP', service: 'HTTP', description: 'Hypertext Transfer Protocol — standard web traffic', category: 'web' },
    { port: 443, protocol: 'TCP', service: 'HTTPS', description: 'HTTP over TLS/SSL — encrypted web traffic', category: 'web' },
    { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', description: 'Alternative HTTP port, commonly used for proxies and dev servers', category: 'web' },
    { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', description: 'Alternative HTTPS port for web servers and APIs', category: 'web' },
    { port: 8000, protocol: 'TCP', service: 'HTTP Alt', description: 'Common development server port (Django, Python)', category: 'web' },
    { port: 3000, protocol: 'TCP', service: 'Dev Server', description: 'Node.js / React / Next.js development server', category: 'web' },
    { port: 5000, protocol: 'TCP', service: 'Dev Server', description: 'Flask / ASP.NET development server', category: 'web' },
    { port: 4200, protocol: 'TCP', service: 'Angular Dev', description: 'Angular CLI development server default port', category: 'web' },
    { port: 5173, protocol: 'TCP', service: 'Vite Dev', description: 'Vite development server default port', category: 'web' },
    { port: 3001, protocol: 'TCP', service: 'Dev Alt', description: 'Common alternative development server port', category: 'web' },

    // Email
    { port: 25, protocol: 'TCP', service: 'SMTP', description: 'Simple Mail Transfer Protocol — sending email', category: 'email' },
    { port: 465, protocol: 'TCP', service: 'SMTPS', description: 'SMTP over SSL — encrypted email sending (implicit TLS)', category: 'email' },
    { port: 587, protocol: 'TCP', service: 'SMTP Submission', description: 'Email message submission with STARTTLS', category: 'email' },
    { port: 110, protocol: 'TCP', service: 'POP3', description: 'Post Office Protocol v3 — retrieving email', category: 'email' },
    { port: 995, protocol: 'TCP', service: 'POP3S', description: 'POP3 over SSL — encrypted email retrieval', category: 'email' },
    { port: 143, protocol: 'TCP', service: 'IMAP', description: 'Internet Message Access Protocol — managing email', category: 'email' },
    { port: 993, protocol: 'TCP', service: 'IMAPS', description: 'IMAP over SSL — encrypted email management', category: 'email' },

    // Database
    { port: 3306, protocol: 'TCP', service: 'MySQL', description: 'MySQL / MariaDB relational database server', category: 'database' },
    { port: 5432, protocol: 'TCP', service: 'PostgreSQL', description: 'PostgreSQL relational database server', category: 'database' },
    { port: 27017, protocol: 'TCP', service: 'MongoDB', description: 'MongoDB NoSQL document database', category: 'database' },
    { port: 6379, protocol: 'TCP', service: 'Redis', description: 'Redis in-memory data store and cache', category: 'database' },
    { port: 1433, protocol: 'TCP', service: 'MSSQL', description: 'Microsoft SQL Server database', category: 'database' },
    { port: 1521, protocol: 'TCP', service: 'Oracle DB', description: 'Oracle Database default listener', category: 'database' },
    { port: 9042, protocol: 'TCP', service: 'Cassandra', description: 'Apache Cassandra CQL native transport', category: 'database' },
    { port: 5984, protocol: 'TCP', service: 'CouchDB', description: 'Apache CouchDB HTTP API', category: 'database' },
    { port: 9200, protocol: 'TCP', service: 'Elasticsearch', description: 'Elasticsearch REST API', category: 'database' },
    { port: 11211, protocol: 'Both', service: 'Memcached', description: 'Memcached distributed memory caching', category: 'database' },
    { port: 26257, protocol: 'TCP', service: 'CockroachDB', description: 'CockroachDB SQL client port', category: 'database' },
    { port: 8529, protocol: 'TCP', service: 'ArangoDB', description: 'ArangoDB multi-model database', category: 'database' },

    // File Transfer
    { port: 20, protocol: 'TCP', service: 'FTP Data', description: 'FTP data transfer channel', category: 'filetransfer' },
    { port: 21, protocol: 'TCP', service: 'FTP Control', description: 'FTP command/control channel', category: 'filetransfer' },
    { port: 22, protocol: 'TCP', service: 'SSH / SFTP', description: 'Secure Shell and SSH File Transfer Protocol', category: 'filetransfer' },
    { port: 69, protocol: 'UDP', service: 'TFTP', description: 'Trivial File Transfer Protocol — simple file transfer', category: 'filetransfer' },
    { port: 115, protocol: 'TCP', service: 'SFTP (Simple)', description: 'Simple File Transfer Protocol (legacy)', category: 'filetransfer' },
    { port: 989, protocol: 'TCP', service: 'FTPS Data', description: 'FTP data over TLS/SSL', category: 'filetransfer' },
    { port: 990, protocol: 'TCP', service: 'FTPS Control', description: 'FTP control over TLS/SSL (implicit)', category: 'filetransfer' },
    { port: 873, protocol: 'TCP', service: 'rsync', description: 'rsync file synchronization protocol', category: 'filetransfer' },
    { port: 445, protocol: 'TCP', service: 'SMB', description: 'Server Message Block — Windows file sharing', category: 'filetransfer' },
    { port: 2049, protocol: 'Both', service: 'NFS', description: 'Network File System — Unix/Linux file sharing', category: 'filetransfer' },

    // Remote
    { port: 23, protocol: 'TCP', service: 'Telnet', description: 'Telnet remote terminal (unencrypted, legacy)', category: 'remote' },
    { port: 3389, protocol: 'TCP', service: 'RDP', description: 'Remote Desktop Protocol — Windows remote desktop', category: 'remote' },
    { port: 5900, protocol: 'TCP', service: 'VNC', description: 'Virtual Network Computing — remote desktop', category: 'remote' },
    { port: 5901, protocol: 'TCP', service: 'VNC :1', description: 'VNC display :1', category: 'remote' },
    { port: 2222, protocol: 'TCP', service: 'SSH Alt', description: 'Alternative SSH port (common in containers)', category: 'remote' },
    { port: 1194, protocol: 'Both', service: 'OpenVPN', description: 'OpenVPN secure tunnel', category: 'remote' },
    { port: 51820, protocol: 'UDP', service: 'WireGuard', description: 'WireGuard VPN tunnel', category: 'remote' },
    { port: 1723, protocol: 'TCP', service: 'PPTP', description: 'Point-to-Point Tunneling Protocol VPN', category: 'remote' },

    // DNS / DHCP
    { port: 53, protocol: 'Both', service: 'DNS', description: 'Domain Name System — domain name resolution', category: 'dns' },
    { port: 67, protocol: 'UDP', service: 'DHCP Server', description: 'DHCP server — dynamic IP assignment', category: 'dns' },
    { port: 68, protocol: 'UDP', service: 'DHCP Client', description: 'DHCP client — request IP from server', category: 'dns' },
    { port: 853, protocol: 'TCP', service: 'DNS over TLS', description: 'Encrypted DNS queries using TLS', category: 'dns' },
    { port: 5353, protocol: 'UDP', service: 'mDNS', description: 'Multicast DNS — local network name resolution', category: 'dns' },

    // Messaging
    { port: 5222, protocol: 'TCP', service: 'XMPP Client', description: 'XMPP/Jabber client-to-server messaging', category: 'messaging' },
    { port: 5269, protocol: 'TCP', service: 'XMPP Server', description: 'XMPP server-to-server federation', category: 'messaging' },
    { port: 1883, protocol: 'TCP', service: 'MQTT', description: 'Message Queuing Telemetry Transport — IoT messaging', category: 'messaging' },
    { port: 8883, protocol: 'TCP', service: 'MQTT/TLS', description: 'MQTT over TLS — encrypted IoT messaging', category: 'messaging' },
    { port: 5672, protocol: 'TCP', service: 'AMQP', description: 'Advanced Message Queuing Protocol (RabbitMQ)', category: 'messaging' },
    { port: 9092, protocol: 'TCP', service: 'Kafka', description: 'Apache Kafka distributed message broker', category: 'messaging' },
    { port: 4222, protocol: 'TCP', service: 'NATS', description: 'NATS messaging system', category: 'messaging' },
    { port: 6660, protocol: 'TCP', service: 'IRC', description: 'Internet Relay Chat (range 6660-6669)', category: 'messaging' },

    // Other
    { port: 123, protocol: 'UDP', service: 'NTP', description: 'Network Time Protocol — clock synchronization', category: 'other' },
    { port: 161, protocol: 'UDP', service: 'SNMP', description: 'Simple Network Management Protocol — monitoring', category: 'other' },
    { port: 162, protocol: 'UDP', service: 'SNMP Trap', description: 'SNMP trap notifications', category: 'other' },
    { port: 389, protocol: 'Both', service: 'LDAP', description: 'Lightweight Directory Access Protocol', category: 'other' },
    { port: 636, protocol: 'TCP', service: 'LDAPS', description: 'LDAP over SSL/TLS', category: 'other' },
    { port: 514, protocol: 'UDP', service: 'Syslog', description: 'System logging protocol', category: 'other' },
    { port: 88, protocol: 'Both', service: 'Kerberos', description: 'Kerberos network authentication', category: 'other' },
    { port: 443, protocol: 'UDP', service: 'QUIC', description: 'QUIC transport protocol (HTTP/3)', category: 'other' },
    { port: 179, protocol: 'TCP', service: 'BGP', description: 'Border Gateway Protocol — internet routing', category: 'other' },
    { port: 500, protocol: 'UDP', service: 'IKE', description: 'Internet Key Exchange — IPSec key negotiation', category: 'other' },
    { port: 1080, protocol: 'TCP', service: 'SOCKS', description: 'SOCKS proxy protocol', category: 'other' },
    { port: 2375, protocol: 'TCP', service: 'Docker', description: 'Docker daemon API (unencrypted)', category: 'other' },
    { port: 2376, protocol: 'TCP', service: 'Docker TLS', description: 'Docker daemon API over TLS', category: 'other' },
    { port: 6443, protocol: 'TCP', service: 'Kubernetes API', description: 'Kubernetes API server', category: 'other' },
    { port: 8081, protocol: 'TCP', service: 'HTTP Alt', description: 'Alternative HTTP / admin interface port', category: 'other' },
    { port: 9090, protocol: 'TCP', service: 'Prometheus', description: 'Prometheus monitoring server', category: 'other' },
    { port: 3100, protocol: 'TCP', service: 'Grafana Loki', description: 'Grafana Loki log aggregation', category: 'other' },
    { port: 8888, protocol: 'TCP', service: 'Jupyter', description: 'Jupyter Notebook / JupyterLab server', category: 'other' },
    { port: 9418, protocol: 'TCP', service: 'Git', description: 'Git protocol (git://) for repository access', category: 'other' },
  ];

  // ==================== Category Config ====================
  const categoryConfig = {
    web:          { label: 'Web',           icon: 'fa-window-maximize' },
    email:        { label: 'Email',         icon: 'fa-envelope' },
    database:     { label: 'Database',      icon: 'fa-database' },
    filetransfer: { label: 'File Transfer', icon: 'fa-file-arrow-up' },
    remote:       { label: 'Remote',        icon: 'fa-terminal' },
    dns:          { label: 'DNS/DHCP',      icon: 'fa-server' },
    messaging:    { label: 'Messaging',     icon: 'fa-comments' },
    other:        { label: 'Other',         icon: 'fa-ellipsis' },
  };

  // ==================== DOM Elements ====================
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const quickLookup = document.getElementById('quickLookup');
  const quickResult = document.getElementById('quickResult');
  const categoryTabs = document.getElementById('categoryTabs');
  const portTableBody = document.getElementById('portTableBody');
  const resultCount = document.getElementById('resultCount');
  const noResults = document.getElementById('noResults');
  const portTableWrapper = document.querySelector('.port-table-wrapper');

  let activeCategory = 'all';

  // ==================== Initialize ====================
  function init() {
    renderTable(ports);
    bindEvents();
  }

  // ==================== Render Table ====================
  function renderTable(data) {
    if (data.length === 0) {
      portTableBody.innerHTML = '';
      noResults.classList.remove('hidden');
      portTableWrapper.classList.add('hidden');
      resultCount.textContent = '0 ports found';
      return;
    }

    noResults.classList.add('hidden');
    portTableWrapper.classList.remove('hidden');
    resultCount.textContent = data.length + ' port' + (data.length !== 1 ? 's' : '') + ' found';

    portTableBody.innerHTML = data.map(function(p) {
      var protocolClass = p.protocol === 'Both' ? 'both' : p.protocol.toLowerCase();
      var catConf = categoryConfig[p.category] || categoryConfig.other;

      return '<tr data-port="' + p.port + '">' +
        '<td><span class="port-number">' + p.port + '<i class="fa-regular fa-copy copy-hint"></i></span></td>' +
        '<td><span class="protocol-badge ' + protocolClass + '">' + p.protocol + '</span></td>' +
        '<td><span class="service-name">' + p.service + '</span></td>' +
        '<td>' + escapeHtml(p.description) + '</td>' +
        '<td><span class="category-badge cat-' + p.category + '"><i class="fa-solid ' + catConf.icon + '"></i> ' + catConf.label + '</span></td>' +
        '</tr>';
    }).join('');
  }

  // ==================== Filter Logic ====================
  function filterPorts() {
    var query = searchInput.value.trim().toLowerCase();
    var results = ports;

    // Filter by category
    if (activeCategory !== 'all') {
      results = results.filter(function(p) {
        return p.category === activeCategory;
      });
    }

    // Filter by search query
    if (query) {
      results = results.filter(function(p) {
        return String(p.port).includes(query) ||
               p.service.toLowerCase().includes(query) ||
               p.description.toLowerCase().includes(query) ||
               p.protocol.toLowerCase().includes(query);
      });
    }

    renderTable(results);

    // Toggle clear button
    clearSearchBtn.classList.toggle('hidden', !searchInput.value);
  }

  // ==================== Quick Lookup ====================
  function handleQuickLookup() {
    var val = quickLookup.value.trim();
    if (!val) {
      quickResult.classList.add('hidden');
      return;
    }

    var num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 65535) {
      quickResult.classList.remove('hidden');
      quickResult.innerHTML = '<span class="qr-not-found">Enter a valid port (0-65535)</span>';
      return;
    }

    var matches = ports.filter(function(p) { return p.port === num; });

    quickResult.classList.remove('hidden');

    if (matches.length > 0) {
      quickResult.innerHTML = matches.map(function(m) {
        return '<span class="qr-port">' + m.port + '</span> ' +
               '<span class="qr-service">' + m.service + '</span> ' +
               '<span>(' + m.protocol + ')</span> — ' +
               '<span class="qr-desc">' + escapeHtml(m.description) + '</span>';
      }).join('<br>');
    } else {
      var rangeLabel = num <= 1023 ? 'Well-Known' : num <= 49151 ? 'Registered' : 'Dynamic/Private';
      quickResult.innerHTML = '<span class="qr-port">' + num + '</span> ' +
        '<span class="qr-not-found">Not in database — ' + rangeLabel + ' range</span>';
    }
  }

  // ==================== Events ====================
  function bindEvents() {
    // Search
    searchInput.addEventListener('input', filterPorts);

    // Clear search
    clearSearchBtn.addEventListener('click', function() {
      searchInput.value = '';
      filterPorts();
      searchInput.focus();
    });

    // Quick lookup
    quickLookup.addEventListener('input', handleQuickLookup);

    // Category tabs
    categoryTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.cat-tab');
      if (!tab) return;

      categoryTabs.querySelectorAll('.cat-tab').forEach(function(t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      filterPorts();
    });

    // Click row to copy port
    portTableBody.addEventListener('click', function(e) {
      var row = e.target.closest('tr');
      if (!row) return;
      var portNum = row.dataset.port;
      if (portNum) {
        ToolsCommon.copyWithToast(portNum, 'Port ' + portNum + ' copied');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
          searchInput.value = '';
          filterPorts();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // ==================== Helpers ====================
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Start ====================
  init();
})();
