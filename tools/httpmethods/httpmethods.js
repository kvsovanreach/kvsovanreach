/**
 * KVSOVANREACH HTTP Methods Reference Tool
 * All 9 HTTP methods with properties, examples, and REST conventions
 */

(function() {
  'use strict';

  // ==================== HTTP Methods Data ====================
  const methods = [
    {
      name: 'GET',
      category: 'safe',
      description: 'Retrieve a representation of a resource. GET requests should only retrieve data and have no other effect.',
      useCase: 'Fetching web pages, API data, images, or any resource. The most common HTTP method.',
      requestBody: false,
      responseBody: true,
      safe: true,
      idempotent: true,
      cacheable: true,
      exampleRequest: 'GET /api/users/42 HTTP/1.1\nHost: example.com\nAccept: application/json',
      exampleResponse: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 42,\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 304, text: 'Not Modified' },
        { code: 404, text: 'Not Found' }
      ],
      restConvention: 'Used to read/retrieve resources. GET /users returns a list, GET /users/42 returns a single user.'
    },
    {
      name: 'POST',
      category: 'modify',
      description: 'Submit data to be processed by the identified resource. Often used to create a new subordinate resource.',
      useCase: 'Creating new resources, submitting form data, uploading files, or triggering server-side operations.',
      requestBody: true,
      responseBody: true,
      safe: false,
      idempotent: false,
      cacheable: false,
      exampleRequest: 'POST /api/users HTTP/1.1\nHost: example.com\nContent-Type: application/json\n\n{\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
      exampleResponse: 'HTTP/1.1 201 Created\nLocation: /api/users/42\nContent-Type: application/json\n\n{\n  "id": 42,\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
      statusCodes: [
        { code: 201, text: 'Created' },
        { code: 200, text: 'OK' },
        { code: 400, text: 'Bad Request' },
        { code: 409, text: 'Conflict' }
      ],
      restConvention: 'Used to create new resources. POST /users creates a new user. The server assigns the resource ID.'
    },
    {
      name: 'PUT',
      category: 'modify',
      description: 'Replace the entire target resource with the request payload. If the resource does not exist, it may create one.',
      useCase: 'Full updates to existing resources where the client sends the complete replacement representation.',
      requestBody: true,
      responseBody: true,
      safe: false,
      idempotent: true,
      cacheable: false,
      exampleRequest: 'PUT /api/users/42 HTTP/1.1\nHost: example.com\nContent-Type: application/json\n\n{\n  "name": "Jane Smith",\n  "email": "jane.smith@example.com",\n  "role": "admin"\n}',
      exampleResponse: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 42,\n  "name": "Jane Smith",\n  "email": "jane.smith@example.com",\n  "role": "admin"\n}',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 201, text: 'Created' },
        { code: 204, text: 'No Content' },
        { code: 404, text: 'Not Found' }
      ],
      restConvention: 'Used for full resource replacement. PUT /users/42 replaces the entire user object. All fields must be included.'
    },
    {
      name: 'PATCH',
      category: 'modify',
      description: 'Apply partial modifications to a resource. Unlike PUT, only the fields that need to change are sent.',
      useCase: 'Partial updates where you only want to modify specific fields without sending the entire resource.',
      requestBody: true,
      responseBody: true,
      safe: false,
      idempotent: false,
      cacheable: false,
      exampleRequest: 'PATCH /api/users/42 HTTP/1.1\nHost: example.com\nContent-Type: application/json\n\n{\n  "email": "jane.new@example.com"\n}',
      exampleResponse: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 42,\n  "name": "Jane Smith",\n  "email": "jane.new@example.com",\n  "role": "admin"\n}',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 204, text: 'No Content' },
        { code: 400, text: 'Bad Request' },
        { code: 404, text: 'Not Found' }
      ],
      restConvention: 'Used for partial updates. PATCH /users/42 updates only the fields provided in the request body.'
    },
    {
      name: 'DELETE',
      category: 'modify',
      description: 'Remove the specified resource from the server. The resource is deleted or marked for deletion.',
      useCase: 'Removing resources such as deleting a user account, removing a file, or canceling an order.',
      requestBody: false,
      responseBody: false,
      safe: false,
      idempotent: true,
      cacheable: false,
      exampleRequest: 'DELETE /api/users/42 HTTP/1.1\nHost: example.com\nAuthorization: Bearer eyJhbG...',
      exampleResponse: 'HTTP/1.1 204 No Content',
      statusCodes: [
        { code: 204, text: 'No Content' },
        { code: 200, text: 'OK' },
        { code: 404, text: 'Not Found' },
        { code: 403, text: 'Forbidden' }
      ],
      restConvention: 'Used to delete resources. DELETE /users/42 removes the user. Should be idempotent: deleting twice returns 204 or 404.'
    },
    {
      name: 'HEAD',
      category: 'safe',
      description: 'Identical to GET but without the response body. Used to retrieve headers only, such as checking if a resource exists.',
      useCase: 'Checking resource existence, getting metadata (Content-Length, Last-Modified) without downloading the body.',
      requestBody: false,
      responseBody: false,
      safe: true,
      idempotent: true,
      cacheable: true,
      exampleRequest: 'HEAD /api/users/42 HTTP/1.1\nHost: example.com\nAccept: application/json',
      exampleResponse: 'HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 128\nLast-Modified: Wed, 09 Apr 2026 12:00:00 GMT',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 304, text: 'Not Modified' },
        { code: 404, text: 'Not Found' }
      ],
      restConvention: 'Used to check if a resource exists or get metadata. Useful for cache validation and bandwidth optimization.'
    },
    {
      name: 'OPTIONS',
      category: 'safe',
      description: 'Describe the communication options for the target resource. Returns allowed methods and CORS headers.',
      useCase: 'CORS preflight requests, discovering allowed methods on a resource, API capability negotiation.',
      requestBody: false,
      responseBody: true,
      safe: true,
      idempotent: true,
      cacheable: false,
      exampleRequest: 'OPTIONS /api/users HTTP/1.1\nHost: example.com\nOrigin: https://app.example.com\nAccess-Control-Request-Method: POST',
      exampleResponse: 'HTTP/1.1 204 No Content\nAllow: GET, POST, OPTIONS\nAccess-Control-Allow-Origin: https://app.example.com\nAccess-Control-Allow-Methods: GET, POST\nAccess-Control-Allow-Headers: Content-Type',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 204, text: 'No Content' }
      ],
      restConvention: 'Automatically sent by browsers as CORS preflight. Can also be used to discover API capabilities at a given endpoint.'
    },
    {
      name: 'CONNECT',
      category: 'other',
      description: 'Establish a tunnel to the server identified by the target resource. Used for HTTPS through an HTTP proxy.',
      useCase: 'Setting up SSL/TLS tunnels through HTTP proxies, typically for HTTPS connections via a forward proxy.',
      requestBody: false,
      responseBody: false,
      safe: false,
      idempotent: false,
      cacheable: false,
      exampleRequest: 'CONNECT www.example.com:443 HTTP/1.1\nHost: www.example.com:443',
      exampleResponse: 'HTTP/1.1 200 Connection Established\n\n(tunnel established, raw TCP follows)',
      statusCodes: [
        { code: 200, text: 'Connection Established' },
        { code: 403, text: 'Forbidden' },
        { code: 502, text: 'Bad Gateway' }
      ],
      restConvention: 'Not typically used in REST APIs. Primarily used by HTTP proxies to establish SSL/TLS tunnels.'
    },
    {
      name: 'TRACE',
      category: 'other',
      description: 'Perform a message loop-back test along the path to the target resource. Echoes back the received request.',
      useCase: 'Debugging and diagnostics to see what intermediate servers modify in the request. Often disabled for security.',
      requestBody: false,
      responseBody: true,
      safe: true,
      idempotent: true,
      cacheable: false,
      exampleRequest: 'TRACE /api/users HTTP/1.1\nHost: example.com',
      exampleResponse: 'HTTP/1.1 200 OK\nContent-Type: message/http\n\nTRACE /api/users HTTP/1.1\nHost: example.com',
      statusCodes: [
        { code: 200, text: 'OK' },
        { code: 405, text: 'Method Not Allowed' }
      ],
      restConvention: 'Not used in REST APIs. Usually disabled on production servers to prevent cross-site tracing (XST) attacks.'
    }
  ];

  // ==================== DOM Elements ====================
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const methodsGrid = document.getElementById('methodsGrid');
  const noResults = document.getElementById('noResults');
  const methodModal = document.getElementById('methodModal');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyRequestBtn = document.getElementById('copyRequestBtn');
  const searchSection = document.getElementById('searchSection');

  // Views
  const cardsView = document.getElementById('cardsView');
  const tableView = document.getElementById('tableView');
  const restView = document.getElementById('restView');
  const methodsTable = document.getElementById('methodsTable');
  const restGuide = document.getElementById('restGuide');

  // State
  let currentView = 'cards';
  let currentFilter = 'all';
  let currentSearch = '';
  let currentModalMethod = null;

  // ==================== Initialize ====================
  function init() {
    renderCards(methods);
    renderTable(methods);
    renderRestGuide();
    bindEvents();
  }

  // ==================== Render Cards ====================
  function renderCards(data) {
    if (data.length === 0) {
      methodsGrid.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');

    methodsGrid.innerHTML = data.map(function(m) {
      var catClass = 'method-card--' + m.category;
      var badgeClass = 'method-badge--' + m.category;

      var categoryLabel = m.category === 'safe' ? 'Safe' :
                          m.category === 'modify' ? 'Modification' : 'Other';

      return '<div class="method-card ' + catClass + '" tabindex="0" data-method="' + m.name + '">' +
        '<div class="method-card-top">' +
          '<span class="method-badge ' + badgeClass + '">' + m.name + '</span>' +
          '<span class="method-card-category">' + categoryLabel + '</span>' +
        '</div>' +
        '<p class="method-card-desc">' + m.description + '</p>' +
        '<p class="method-card-usecase">' + m.useCase + '</p>' +
        '<div class="method-card-props">' +
          propTag('Body', m.requestBody) +
          propTag('Response', m.responseBody) +
          propTag('Safe', m.safe) +
          propTag('Idempotent', m.idempotent) +
          propTag('Cacheable', m.cacheable) +
        '</div>' +
        '<div class="method-card-expand">' +
          '<i class="fa-solid fa-arrow-up-right-from-square"></i> View details' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function propTag(label, value) {
    var cls = value ? 'method-prop--yes' : 'method-prop--no';
    var icon = value ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
    return '<span class="method-prop ' + cls + '">' + icon + ' ' + label + '</span>';
  }

  // ==================== Render Table ====================
  function renderTable(data) {
    var properties = ['Request Body', 'Response Body', 'Safe', 'Idempotent', 'Cacheable'];
    var propKeys = ['requestBody', 'responseBody', 'safe', 'idempotent', 'cacheable'];

    var html = '<thead><tr><th>Method</th><th>Description</th>';
    properties.forEach(function(p) {
      html += '<th>' + p + '</th>';
    });
    html += '</tr></thead><tbody>';

    data.forEach(function(m) {
      var nameClass = 'table-method-name table-method-name--' + m.category;
      html += '<tr data-method="' + m.name + '">';
      html += '<td class="' + nameClass + '">' + m.name + '</td>';
      html += '<td class="table-desc">' + m.description.substring(0, 80) + '...</td>';
      propKeys.forEach(function(key) {
        var val = m[key];
        var cls = val ? 'table-check--yes' : 'table-check--no';
        var icon = val ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
        html += '<td class="table-check ' + cls + '">' + icon + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody>';
    methodsTable.innerHTML = html;
  }

  // ==================== Render REST Guide ====================
  function renderRestGuide() {
    var html = '';

    // CRUD Mapping
    html += '<div class="crud-section">' +
      '<div class="crud-section-header"><h3><i class="fa-solid fa-arrows-rotate"></i> REST CRUD Mapping</h3></div>' +
      '<div class="crud-grid">';

    var crudItems = [
      {
        op: 'Create', opClass: 'create', method: 'POST',
        desc: 'Create a new resource. The server assigns the ID and returns the created resource.',
        example: 'POST /api/users'
      },
      {
        op: 'Read', opClass: 'read', method: 'GET',
        desc: 'Retrieve one or many resources. Use path params for single, query params for filtering.',
        example: 'GET /api/users/42'
      },
      {
        op: 'Update', opClass: 'update', method: 'PUT / PATCH',
        desc: 'PUT replaces the entire resource. PATCH applies partial changes to specific fields.',
        example: 'PUT /api/users/42  or  PATCH /api/users/42'
      },
      {
        op: 'Delete', opClass: 'delete', method: 'DELETE',
        desc: 'Remove a resource. Should be idempotent: repeated calls should not cause errors.',
        example: 'DELETE /api/users/42'
      }
    ];

    crudItems.forEach(function(item) {
      html += '<div class="crud-item">' +
        '<div class="crud-operation crud-operation--' + item.opClass + '">' + item.op + '</div>' +
        '<div class="crud-detail">' +
          '<h4><code>' + item.method + '</code></h4>' +
          '<p>' + item.desc + '</p>' +
          '<div class="crud-example">' + item.example + '</div>' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';

    // PUT vs PATCH
    html += '<div class="vs-section">' +
      '<div class="vs-section-header"><h3><i class="fa-solid fa-code-compare"></i> PUT vs PATCH</h3></div>' +
      '<div class="vs-grid">' +
        '<div class="vs-col">' +
          '<h4 class="vs-put">PUT</h4>' +
          '<p>Replaces the <strong>entire</strong> resource. All fields must be included, or missing fields are set to defaults/null.</p>' +
          '<pre>PUT /api/users/42\n{\n  "name": "Jane Smith",\n  "email": "jane@example.com",\n  "role": "admin",\n  "active": true\n}</pre>' +
        '</div>' +
        '<div class="vs-col">' +
          '<h4 class="vs-patch">PATCH</h4>' +
          '<p>Applies <strong>partial</strong> modifications. Only the fields that need to change are sent in the request.</p>' +
          '<pre>PATCH /api/users/42\n{\n  "email": "jane.new@example.com"\n}</pre>' +
        '</div>' +
      '</div>' +
    '</div>';

    // REST Conventions
    html += '<div class="rest-conventions">' +
      '<div class="rest-conventions-header"><h3><i class="fa-solid fa-list-check"></i> REST Conventions</h3></div>' +
      '<div class="rest-rules">';

    var rules = [
      { icon: 'fa-link', text: '<strong>Use nouns for resources:</strong> <code>/users</code>, <code>/orders</code>, <code>/products</code> instead of verbs like <code>/getUsers</code>.' },
      { icon: 'fa-layer-group', text: '<strong>Use plural nouns:</strong> <code>/users</code> for collections, <code>/users/42</code> for a specific resource.' },
      { icon: 'fa-sitemap', text: '<strong>Nest related resources:</strong> <code>/users/42/orders</code> to get orders belonging to user 42.' },
      { icon: 'fa-filter', text: '<strong>Use query params for filtering:</strong> <code>/users?role=admin&active=true</code> rather than creating new endpoints.' },
      { icon: 'fa-hashtag', text: '<strong>Return proper status codes:</strong> 201 for creation, 204 for deletion, 400 for bad input, 404 for not found.' },
      { icon: 'fa-shield-halved', text: '<strong>Idempotency matters:</strong> GET, PUT, DELETE should produce the same result if called multiple times. POST is not idempotent.' },
      { icon: 'fa-code', text: '<strong>Version your API:</strong> Use <code>/api/v1/users</code> or the <code>Accept</code> header for API versioning.' }
    ];

    rules.forEach(function(rule) {
      html += '<div class="rest-rule">' +
        '<div class="rest-rule-icon"><i class="fa-solid ' + rule.icon + '"></i></div>' +
        '<div class="rest-rule-text">' + rule.text + '</div>' +
      '</div>';
    });

    html += '</div></div>';

    restGuide.innerHTML = html;
  }

  // ==================== Filter & Search ====================
  function getFilteredMethods() {
    return methods.filter(function(m) {
      var matchesFilter = currentFilter === 'all' ||
        (currentFilter === 'safe' && m.category === 'safe') ||
        (currentFilter === 'modify' && m.category === 'modify') ||
        (currentFilter === 'other' && m.category === 'other');

      var matchesSearch = currentSearch === '' ||
        m.name.toLowerCase().indexOf(currentSearch) !== -1 ||
        m.description.toLowerCase().indexOf(currentSearch) !== -1 ||
        m.useCase.toLowerCase().indexOf(currentSearch) !== -1;

      return matchesFilter && matchesSearch;
    });
  }

  function applyFilters() {
    var filtered = getFilteredMethods();
    renderCards(filtered);
    renderTable(filtered);
  }

  // ==================== Modal ====================
  function openModal(methodName) {
    var m = methods.find(function(item) { return item.name === methodName; });
    if (!m) return;

    currentModalMethod = m;

    var badgeClass = 'method-badge--' + m.category;
    modalBadge.className = 'method-modal-badge';
    if (m.category === 'safe') {
      modalBadge.style.backgroundColor = 'rgba(22, 163, 74, 0.12)';
      modalBadge.style.color = '#16a34a';
    } else if (m.category === 'modify') {
      modalBadge.style.backgroundColor = 'rgba(217, 119, 6, 0.12)';
      modalBadge.style.color = '#d97706';
    } else {
      modalBadge.style.backgroundColor = 'rgba(107, 114, 128, 0.12)';
      modalBadge.style.color = '#6b7280';
    }

    modalBadge.textContent = m.name;
    modalTitle.textContent = m.description.split('.')[0];

    var bodyHtml = '';

    // Description
    bodyHtml += '<div class="modal-section"><h4>Description</h4><p>' + m.description + '</p></div>';

    // Use case
    bodyHtml += '<div class="modal-section"><h4>Use Case</h4><p>' + m.useCase + '</p></div>';

    // Properties grid
    bodyHtml += '<div class="modal-section"><h4>Properties</h4><div class="modal-props-grid">';
    var props = [
      { label: 'Request Body', value: m.requestBody },
      { label: 'Response Body', value: m.responseBody },
      { label: 'Safe', value: m.safe },
      { label: 'Idempotent', value: m.idempotent },
      { label: 'Cacheable', value: m.cacheable }
    ];
    props.forEach(function(p) {
      var valClass = p.value ? 'modal-prop-value--yes' : 'modal-prop-value--no';
      var valText = p.value ? 'Yes' : 'No';
      bodyHtml += '<div class="modal-prop-item">' +
        '<span class="modal-prop-label">' + p.label + '</span>' +
        '<span class="modal-prop-value ' + valClass + '">' + valText + '</span>' +
      '</div>';
    });
    bodyHtml += '</div></div>';

    // Example request
    bodyHtml += '<div class="modal-section"><h4>Example Request</h4><pre>' + escapeHtml(m.exampleRequest) + '</pre></div>';

    // Example response
    bodyHtml += '<div class="modal-section"><h4>Example Response</h4><pre>' + escapeHtml(m.exampleResponse) + '</pre></div>';

    // Common status codes
    bodyHtml += '<div class="modal-section"><h4>Common Status Codes</h4><div class="modal-status-codes">';
    m.statusCodes.forEach(function(sc) {
      bodyHtml += '<span class="modal-status-code">' +
        '<span class="code-num">' + sc.code + '</span>' +
        '<span class="code-text">' + sc.text + '</span>' +
      '</span>';
    });
    bodyHtml += '</div></div>';

    // REST convention
    bodyHtml += '<div class="modal-section"><h4>REST Convention</h4><p>' + m.restConvention + '</p></div>';

    modalBody.innerHTML = bodyHtml;

    methodModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    methodModal.classList.remove('active');
    document.body.style.overflow = '';
    currentModalMethod = null;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==================== Event Binding ====================
  function bindEvents() {
    // View tabs
    document.querySelectorAll('.tool-tab[data-view]').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var view = this.getAttribute('data-view');
        switchView(view);
      });
    });

    // Filter chips
    document.querySelectorAll('.filter-chip[data-filter]').forEach(function(chip) {
      chip.addEventListener('click', function() {
        document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        applyFilters();
      });
    });

    // Search
    searchInput.addEventListener('input', function() {
      currentSearch = this.value.trim().toLowerCase();
      clearSearchBtn.classList.toggle('hidden', currentSearch === '');
      applyFilters();
    });

    clearSearchBtn.addEventListener('click', function() {
      searchInput.value = '';
      currentSearch = '';
      clearSearchBtn.classList.add('hidden');
      applyFilters();
      searchInput.focus();
    });

    // Card clicks (delegated)
    methodsGrid.addEventListener('click', function(e) {
      var card = e.target.closest('.method-card');
      if (card) openModal(card.getAttribute('data-method'));
    });

    methodsGrid.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var card = e.target.closest('.method-card');
        if (card) openModal(card.getAttribute('data-method'));
      }
    });

    // Table row clicks (delegated)
    methodsTable.addEventListener('click', function(e) {
      var row = e.target.closest('tbody tr');
      if (row) openModal(row.getAttribute('data-method'));
    });

    // Modal close
    closeModalBtn.addEventListener('click', closeModal);
    methodModal.addEventListener('click', function(e) {
      if (e.target === methodModal) closeModal();
    });

    // Copy example request
    copyRequestBtn.addEventListener('click', function() {
      if (currentModalMethod) {
        ToolsCommon.copyWithToast(currentModalMethod.exampleRequest, 'Example request copied!');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Don't trigger shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          searchInput.blur();
          searchInput.value = '';
          currentSearch = '';
          clearSearchBtn.classList.add('hidden');
          applyFilters();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (methodModal.classList.contains('active')) {
          closeModal();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
        return;
      }

      // 1-3 for view tabs
      if (e.key === '1') switchView('cards');
      if (e.key === '2') switchView('table');
      if (e.key === '3') switchView('rest');
    });
  }

  // ==================== View Switching ====================
  function switchView(view) {
    currentView = view;

    document.querySelectorAll('.tool-tab[data-view]').forEach(function(tab) {
      tab.classList.toggle('active', tab.getAttribute('data-view') === view);
    });

    cardsView.classList.toggle('active', view === 'cards');
    tableView.classList.toggle('active', view === 'table');
    restView.classList.toggle('active', view === 'rest');

    // Hide search in REST view
    searchSection.style.display = view === 'rest' ? 'none' : '';
  }

  // ==================== Start ====================
  init();

})();
