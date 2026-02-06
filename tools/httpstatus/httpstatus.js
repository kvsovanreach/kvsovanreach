/**
 * KVSOVANREACH HTTP Status Reference Tool
 * Complete HTTP status code reference with descriptions and examples
 */

(function() {
  'use strict';

  // ==================== HTTP Status Codes Data ====================
  const statusCodes = [
    // 1xx Informational
    {
      code: 100,
      name: 'Continue',
      category: '1xx',
      description: 'The server has received the request headers and the client should proceed to send the request body.',
      usage: 'Used in scenarios where the client wants to check if the server is willing to accept a large request body before actually sending it.',
      example: 'HTTP/1.1 100 Continue'
    },
    {
      code: 101,
      name: 'Switching Protocols',
      category: '1xx',
      description: 'The server is switching protocols as requested by the client.',
      usage: 'Commonly used when upgrading from HTTP to WebSocket connections.',
      example: 'HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade'
    },
    {
      code: 102,
      name: 'Processing',
      category: '1xx',
      description: 'The server has received and is processing the request, but no response is available yet.',
      usage: 'Used in WebDAV to prevent the client from timing out while the server processes a complex request.',
      example: 'HTTP/1.1 102 Processing'
    },
    {
      code: 103,
      name: 'Early Hints',
      category: '1xx',
      description: 'Used to return some response headers before final HTTP message.',
      usage: 'Allows the browser to start preloading resources while the server prepares the full response.',
      example: 'HTTP/1.1 103 Early Hints\nLink: </style.css>; rel=preload; as=style'
    },

    // 2xx Success
    {
      code: 200,
      name: 'OK',
      category: '2xx',
      description: 'The request has succeeded. The meaning depends on the HTTP method used.',
      usage: 'Standard response for successful HTTP requests. For GET, the resource is returned. For POST, the result of the action is returned.',
      example: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status": "success"}'
    },
    {
      code: 201,
      name: 'Created',
      category: '2xx',
      description: 'The request has been fulfilled and a new resource has been created.',
      usage: 'Typically returned after a POST request that creates a new resource. The Location header should contain the URI of the new resource.',
      example: 'HTTP/1.1 201 Created\nLocation: /users/123\nContent-Type: application/json\n\n{"id": 123, "name": "John"}'
    },
    {
      code: 202,
      name: 'Accepted',
      category: '2xx',
      description: 'The request has been accepted for processing, but processing has not been completed.',
      usage: 'Used for asynchronous operations. The request is valid but will be processed later.',
      example: 'HTTP/1.1 202 Accepted\nContent-Type: application/json\n\n{"status": "queued", "jobId": "abc123"}'
    },
    {
      code: 203,
      name: 'Non-Authoritative Information',
      category: '2xx',
      description: 'The returned meta-information is not from the origin server but from a local or third-party copy.',
      usage: 'Used by proxies when they modify the response from the origin server.',
      example: 'HTTP/1.1 203 Non-Authoritative Information'
    },
    {
      code: 204,
      name: 'No Content',
      category: '2xx',
      description: 'The server successfully processed the request but is not returning any content.',
      usage: 'Common response for DELETE requests or updates where no content needs to be returned.',
      example: 'HTTP/1.1 204 No Content'
    },
    {
      code: 205,
      name: 'Reset Content',
      category: '2xx',
      description: 'The server successfully processed the request and asks the client to reset the document view.',
      usage: 'Used when the client should reset the form that sent the request.',
      example: 'HTTP/1.1 205 Reset Content'
    },
    {
      code: 206,
      name: 'Partial Content',
      category: '2xx',
      description: 'The server is delivering only part of the resource due to a range header sent by the client.',
      usage: 'Used for resumable downloads or streaming. The client requests a specific portion of a file.',
      example: 'HTTP/1.1 206 Partial Content\nContent-Range: bytes 0-999/5000\nContent-Length: 1000'
    },
    {
      code: 207,
      name: 'Multi-Status',
      category: '2xx',
      description: 'Conveys information about multiple resources in situations where multiple status codes might be appropriate.',
      usage: 'Used in WebDAV when an operation affects multiple resources with different outcomes.',
      example: 'HTTP/1.1 207 Multi-Status\nContent-Type: application/xml'
    },
    {
      code: 208,
      name: 'Already Reported',
      category: '2xx',
      description: 'Used inside a DAV: propstat response to avoid enumerating internal members multiple times.',
      usage: 'WebDAV binding members that have already been enumerated in a previous reply.',
      example: 'HTTP/1.1 208 Already Reported'
    },
    {
      code: 226,
      name: 'IM Used',
      category: '2xx',
      description: 'The server has fulfilled a GET request, and the response is a representation of one or more instance-manipulations.',
      usage: 'Used with delta encoding to return only the changes between versions.',
      example: 'HTTP/1.1 226 IM Used\nIM: feed'
    },

    // 3xx Redirection
    {
      code: 300,
      name: 'Multiple Choices',
      category: '3xx',
      description: 'There are multiple options for the resource that the client may follow.',
      usage: 'Rare. Used when a resource has multiple representations and the user/agent needs to choose.',
      example: 'HTTP/1.1 300 Multiple Choices\nContent-Type: text/html'
    },
    {
      code: 301,
      name: 'Moved Permanently',
      category: '3xx',
      description: 'The resource has been permanently moved to a new URL.',
      usage: 'SEO-friendly redirect. Search engines will update their links. Browsers cache this redirect.',
      example: 'HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/new-page'
    },
    {
      code: 302,
      name: 'Found',
      category: '3xx',
      description: 'The resource is temporarily located at a different URL.',
      usage: 'Temporary redirect. The original URL should still be used for future requests.',
      example: 'HTTP/1.1 302 Found\nLocation: https://example.com/temp-page'
    },
    {
      code: 303,
      name: 'See Other',
      category: '3xx',
      description: 'The response to the request can be found under a different URL using GET.',
      usage: 'Used after POST/PUT to redirect to a confirmation page. Always uses GET for the redirect.',
      example: 'HTTP/1.1 303 See Other\nLocation: https://example.com/confirmation'
    },
    {
      code: 304,
      name: 'Not Modified',
      category: '3xx',
      description: 'The resource has not been modified since the last request.',
      usage: 'Used for caching. Client can use its cached version. Saves bandwidth.',
      example: 'HTTP/1.1 304 Not Modified\nETag: "abc123"\nCache-Control: max-age=3600'
    },
    {
      code: 305,
      name: 'Use Proxy',
      category: '3xx',
      description: 'The requested resource must be accessed through the proxy specified in the Location header.',
      usage: 'Deprecated due to security concerns. Not widely supported.',
      example: 'HTTP/1.1 305 Use Proxy\nLocation: http://proxy.example.com'
    },
    {
      code: 307,
      name: 'Temporary Redirect',
      category: '3xx',
      description: 'The resource is temporarily at a different URL. The request method must not change.',
      usage: 'Unlike 302, this guarantees the method and body will not change during redirect.',
      example: 'HTTP/1.1 307 Temporary Redirect\nLocation: https://example.com/temp'
    },
    {
      code: 308,
      name: 'Permanent Redirect',
      category: '3xx',
      description: 'The resource has permanently moved. The request method must not change.',
      usage: 'Like 301, but guarantees the method will not change (important for POST requests).',
      example: 'HTTP/1.1 308 Permanent Redirect\nLocation: https://example.com/new'
    },

    // 4xx Client Errors
    {
      code: 400,
      name: 'Bad Request',
      category: '4xx',
      description: 'The server cannot process the request due to client error (malformed syntax, invalid parameters).',
      usage: 'Return when the request is malformed, has invalid syntax, or missing required parameters.',
      example: 'HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{"error": "Invalid JSON format"}'
    },
    {
      code: 401,
      name: 'Unauthorized',
      category: '4xx',
      description: 'Authentication is required and has failed or has not been provided.',
      usage: 'The client must authenticate to get the requested response. Include WWW-Authenticate header.',
      example: 'HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer realm="api"'
    },
    {
      code: 402,
      name: 'Payment Required',
      category: '4xx',
      description: 'Reserved for future use. Originally intended for digital payment systems.',
      usage: 'Rarely used. Some APIs use it to indicate the user needs to upgrade their plan.',
      example: 'HTTP/1.1 402 Payment Required'
    },
    {
      code: 403,
      name: 'Forbidden',
      category: '4xx',
      description: 'The client does not have permission to access the requested resource.',
      usage: 'Unlike 401, the client\'s identity is known but they lack permission. Authentication won\'t help.',
      example: 'HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{"error": "Access denied"}'
    },
    {
      code: 404,
      name: 'Not Found',
      category: '4xx',
      description: 'The requested resource could not be found on the server.',
      usage: 'The most common error. The URL is not recognized. Could also be used to hide existence of resources.',
      example: 'HTTP/1.1 404 Not Found\nContent-Type: application/json\n\n{"error": "Resource not found"}'
    },
    {
      code: 405,
      name: 'Method Not Allowed',
      category: '4xx',
      description: 'The request method is not supported for the requested resource.',
      usage: 'For example, trying to POST to a read-only resource. Include Allow header with valid methods.',
      example: 'HTTP/1.1 405 Method Not Allowed\nAllow: GET, HEAD'
    },
    {
      code: 406,
      name: 'Not Acceptable',
      category: '4xx',
      description: 'The server cannot produce a response matching the client\'s Accept headers.',
      usage: 'Content negotiation failed. The server can\'t return the format the client requested.',
      example: 'HTTP/1.1 406 Not Acceptable'
    },
    {
      code: 407,
      name: 'Proxy Authentication Required',
      category: '4xx',
      description: 'The client must authenticate with the proxy.',
      usage: 'Similar to 401, but authentication is required with an intermediate proxy.',
      example: 'HTTP/1.1 407 Proxy Authentication Required\nProxy-Authenticate: Basic'
    },
    {
      code: 408,
      name: 'Request Timeout',
      category: '4xx',
      description: 'The server timed out waiting for the request.',
      usage: 'The client took too long to send the request. Can retry the request.',
      example: 'HTTP/1.1 408 Request Timeout'
    },
    {
      code: 409,
      name: 'Conflict',
      category: '4xx',
      description: 'The request conflicts with the current state of the server.',
      usage: 'Common in REST APIs when updating a resource that has been modified. Also for duplicate entries.',
      example: 'HTTP/1.1 409 Conflict\nContent-Type: application/json\n\n{"error": "Email already exists"}'
    },
    {
      code: 410,
      name: 'Gone',
      category: '4xx',
      description: 'The resource is no longer available and will not be available again.',
      usage: 'Unlike 404, this is permanent. The resource existed but has been deliberately removed.',
      example: 'HTTP/1.1 410 Gone'
    },
    {
      code: 411,
      name: 'Length Required',
      category: '4xx',
      description: 'The request did not specify the length of its content, which is required.',
      usage: 'The Content-Length header is required for this request.',
      example: 'HTTP/1.1 411 Length Required'
    },
    {
      code: 412,
      name: 'Precondition Failed',
      category: '4xx',
      description: 'One or more conditions in the request headers evaluated to false.',
      usage: 'Used with conditional requests (If-Match, If-Unmodified-Since). Prevents lost updates.',
      example: 'HTTP/1.1 412 Precondition Failed'
    },
    {
      code: 413,
      name: 'Payload Too Large',
      category: '4xx',
      description: 'The request is larger than the server is willing or able to process.',
      usage: 'File upload exceeds the maximum size. Include Retry-After header if temporary.',
      example: 'HTTP/1.1 413 Payload Too Large\nContent-Type: application/json\n\n{"error": "Max file size is 10MB"}'
    },
    {
      code: 414,
      name: 'URI Too Long',
      category: '4xx',
      description: 'The URI provided was too long for the server to process.',
      usage: 'Rare. Usually caused by too much data being encoded in query strings.',
      example: 'HTTP/1.1 414 URI Too Long'
    },
    {
      code: 415,
      name: 'Unsupported Media Type',
      category: '4xx',
      description: 'The media format of the request is not supported by the server.',
      usage: 'The Content-Type header specifies a format the server doesn\'t support.',
      example: 'HTTP/1.1 415 Unsupported Media Type\nAccept: application/json'
    },
    {
      code: 416,
      name: 'Range Not Satisfiable',
      category: '4xx',
      description: 'The client has asked for a portion of the file that the server cannot supply.',
      usage: 'The Range header specifies a range that doesn\'t exist in the resource.',
      example: 'HTTP/1.1 416 Range Not Satisfiable\nContent-Range: bytes */5000'
    },
    {
      code: 417,
      name: 'Expectation Failed',
      category: '4xx',
      description: 'The server cannot meet the requirements of the Expect request header.',
      usage: 'The server cannot satisfy the expectation given in the Expect header.',
      example: 'HTTP/1.1 417 Expectation Failed'
    },
    {
      code: 418,
      name: 'I\'m a Teapot',
      category: '4xx',
      description: 'The server refuses to brew coffee because it is a teapot.',
      usage: 'April Fools\' joke from 1998 (RFC 2324). Sometimes used as a placeholder or Easter egg.',
      example: 'HTTP/1.1 418 I\'m a Teapot'
    },
    {
      code: 421,
      name: 'Misdirected Request',
      category: '4xx',
      description: 'The request was directed at a server that cannot produce a response.',
      usage: 'The server is not configured to produce responses for the combination of scheme and authority.',
      example: 'HTTP/1.1 421 Misdirected Request'
    },
    {
      code: 422,
      name: 'Unprocessable Entity',
      category: '4xx',
      description: 'The request is well-formed but cannot be processed due to semantic errors.',
      usage: 'Common in APIs for validation errors. The syntax is correct but the data is invalid.',
      example: 'HTTP/1.1 422 Unprocessable Entity\nContent-Type: application/json\n\n{"errors": {"email": "Invalid format"}}'
    },
    {
      code: 423,
      name: 'Locked',
      category: '4xx',
      description: 'The resource being accessed is locked.',
      usage: 'WebDAV. The resource is locked and cannot be modified.',
      example: 'HTTP/1.1 423 Locked'
    },
    {
      code: 424,
      name: 'Failed Dependency',
      category: '4xx',
      description: 'The request failed because it depended on another request that failed.',
      usage: 'WebDAV. A prerequisite request failed, so this request cannot proceed.',
      example: 'HTTP/1.1 424 Failed Dependency'
    },
    {
      code: 425,
      name: 'Too Early',
      category: '4xx',
      description: 'The server is unwilling to risk processing a request that might be replayed.',
      usage: 'Used with TLS Early Data to prevent replay attacks.',
      example: 'HTTP/1.1 425 Too Early'
    },
    {
      code: 426,
      name: 'Upgrade Required',
      category: '4xx',
      description: 'The client should switch to a different protocol.',
      usage: 'The server refuses to perform the request using the current protocol.',
      example: 'HTTP/1.1 426 Upgrade Required\nUpgrade: TLS/1.2'
    },
    {
      code: 428,
      name: 'Precondition Required',
      category: '4xx',
      description: 'The server requires the request to be conditional.',
      usage: 'Requires If-Match or If-Unmodified-Since headers to prevent lost updates.',
      example: 'HTTP/1.1 428 Precondition Required'
    },
    {
      code: 429,
      name: 'Too Many Requests',
      category: '4xx',
      description: 'The user has sent too many requests in a given amount of time.',
      usage: 'Rate limiting. Include Retry-After header to indicate when to try again.',
      example: 'HTTP/1.1 429 Too Many Requests\nRetry-After: 60\nX-RateLimit-Remaining: 0'
    },
    {
      code: 431,
      name: 'Request Header Fields Too Large',
      category: '4xx',
      description: 'The server is unwilling to process the request because its header fields are too large.',
      usage: 'One or more headers exceeded the server\'s size limit.',
      example: 'HTTP/1.1 431 Request Header Fields Too Large'
    },
    {
      code: 451,
      name: 'Unavailable For Legal Reasons',
      category: '4xx',
      description: 'The resource is unavailable due to legal demands.',
      usage: 'Content blocked due to court order, government censorship, or DMCA takedown.',
      example: 'HTTP/1.1 451 Unavailable For Legal Reasons'
    },

    // 5xx Server Errors
    {
      code: 500,
      name: 'Internal Server Error',
      category: '5xx',
      description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
      usage: 'Generic server error. Something went wrong but the server doesn\'t know what.',
      example: 'HTTP/1.1 500 Internal Server Error\nContent-Type: application/json\n\n{"error": "Something went wrong"}'
    },
    {
      code: 501,
      name: 'Not Implemented',
      category: '5xx',
      description: 'The server does not support the functionality required to fulfill the request.',
      usage: 'The request method is not recognized or not implemented by the server.',
      example: 'HTTP/1.1 501 Not Implemented'
    },
    {
      code: 502,
      name: 'Bad Gateway',
      category: '5xx',
      description: 'The server received an invalid response from an upstream server.',
      usage: 'Common with reverse proxies and load balancers when the backend is down or returns invalid data.',
      example: 'HTTP/1.1 502 Bad Gateway'
    },
    {
      code: 503,
      name: 'Service Unavailable',
      category: '5xx',
      description: 'The server is temporarily unavailable, usually due to maintenance or overload.',
      usage: 'Include Retry-After header. The server will be available again soon.',
      example: 'HTTP/1.1 503 Service Unavailable\nRetry-After: 300'
    },
    {
      code: 504,
      name: 'Gateway Timeout',
      category: '5xx',
      description: 'The server did not receive a timely response from an upstream server.',
      usage: 'Common with reverse proxies when the backend server is too slow.',
      example: 'HTTP/1.1 504 Gateway Timeout'
    },
    {
      code: 505,
      name: 'HTTP Version Not Supported',
      category: '5xx',
      description: 'The server does not support the HTTP protocol version used in the request.',
      usage: 'Rare. The HTTP version in the request is not supported.',
      example: 'HTTP/1.1 505 HTTP Version Not Supported'
    },
    {
      code: 506,
      name: 'Variant Also Negotiates',
      category: '5xx',
      description: 'The server has an internal configuration error during content negotiation.',
      usage: 'Transparent content negotiation results in a circular reference.',
      example: 'HTTP/1.1 506 Variant Also Negotiates'
    },
    {
      code: 507,
      name: 'Insufficient Storage',
      category: '5xx',
      description: 'The server cannot store the representation needed to complete the request.',
      usage: 'WebDAV. The server ran out of disk space.',
      example: 'HTTP/1.1 507 Insufficient Storage'
    },
    {
      code: 508,
      name: 'Loop Detected',
      category: '5xx',
      description: 'The server detected an infinite loop while processing the request.',
      usage: 'WebDAV. Infinite loop detected in processing.',
      example: 'HTTP/1.1 508 Loop Detected'
    },
    {
      code: 510,
      name: 'Not Extended',
      category: '5xx',
      description: 'Further extensions to the request are required for the server to fulfill it.',
      usage: 'The request needs additional extensions that the server doesn\'t support.',
      example: 'HTTP/1.1 510 Not Extended'
    },
    {
      code: 511,
      name: 'Network Authentication Required',
      category: '5xx',
      description: 'The client needs to authenticate to gain network access.',
      usage: 'Used by captive portals (WiFi login pages) to intercept traffic.',
      example: 'HTTP/1.1 511 Network Authentication Required'
    }
  ];

  // ==================== State ====================
  const state = {
    currentCategory: 'all',
    searchQuery: '',
    currentStatusCode: null
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.searchInput = document.getElementById('searchInput');
    elements.clearSearchBtn = document.getElementById('clearSearchBtn');
    elements.searchStats = document.getElementById('searchStats');
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.statusList = document.getElementById('statusList');
    elements.noResults = document.getElementById('noResults');
    elements.statusModal = document.getElementById('statusModal');
    elements.modalBadge = document.getElementById('modalBadge');
    elements.modalTitle = document.getElementById('modalTitle');
    elements.modalDescription = document.getElementById('modalDescription');
    elements.modalUsage = document.getElementById('modalUsage');
    elements.modalExample = document.getElementById('modalExample');
    elements.closeModalBtn = document.getElementById('closeModalBtn');
    elements.copyCodeBtn = document.getElementById('copyCodeBtn');
  }

  // ==================== Helper Functions ====================
  // Use centralized toast from tools-common.js
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function getCategoryClass(category) {
    const classes = {
      '1xx': 'info',
      '2xx': 'success',
      '3xx': 'redirect',
      '4xx': 'client',
      '5xx': 'server'
    };
    return classes[category] || '';
  }

  // ==================== Filter Status Codes ====================
  function filterStatusCodes() {
    return statusCodes.filter(status => {
      // Category filter
      if (state.currentCategory !== 'all' && status.category !== state.currentCategory) {
        return false;
      }

      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        return (
          status.code.toString().includes(query) ||
          status.name.toLowerCase().includes(query) ||
          status.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  // ==================== Render Status List ====================
  function renderStatusList() {
    const filtered = filterStatusCodes();

    if (filtered.length === 0) {
      elements.statusList.innerHTML = '';
      elements.noResults.classList.remove('hidden');
      elements.searchStats.textContent = 'No results found';
      return;
    }

    elements.noResults.classList.add('hidden');
    elements.searchStats.textContent = `Showing ${filtered.length} status code${filtered.length !== 1 ? 's' : ''}`;

    elements.statusList.innerHTML = filtered.map(status => `
      <div class="status-item" data-code="${status.code}">
        <div class="status-code ${getCategoryClass(status.category)}">${status.code}</div>
        <div class="status-info">
          <div class="status-name">${status.name}</div>
          <div class="status-desc">${status.description}</div>
        </div>
        <div class="status-arrow">
          <i class="fa-solid fa-chevron-right"></i>
        </div>
      </div>
    `).join('');

    // Add click handlers
    elements.statusList.querySelectorAll('.status-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = parseInt(item.dataset.code);
        openStatusModal(code);
      });
    });
  }

  // ==================== Modal Functions ====================
  function openStatusModal(code) {
    const status = statusCodes.find(s => s.code === code);
    if (!status) return;

    state.currentStatusCode = status;

    elements.modalBadge.textContent = status.code;
    elements.modalBadge.className = `status-modal-badge ${getCategoryClass(status.category)}`;
    elements.modalTitle.textContent = status.name;
    elements.modalDescription.textContent = status.description;
    elements.modalUsage.textContent = status.usage;
    elements.modalExample.textContent = status.example;

    elements.statusModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeStatusModal() {
    elements.statusModal.classList.remove('active');
    document.body.style.overflow = '';
    state.currentStatusCode = null;
  }

  function copyExampleCode() {
    if (!state.currentStatusCode) return;
    ToolsCommon.copyWithToast(state.currentStatusCode.example, `Copied example for ${state.currentStatusCode.code}`);
  }

  // ==================== Search Functions ====================
  function handleSearch() {
    state.searchQuery = elements.searchInput.value.trim();
    elements.clearSearchBtn.classList.toggle('hidden', !state.searchQuery);
    renderStatusList();
  }

  function clearSearch() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.classList.add('hidden');
    renderStatusList();
    elements.searchInput.focus();
  }

  // ==================== Tab Navigation ====================
  function handleTabClick(tab) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.currentCategory = tab.dataset.category;
    renderStatusList();
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', ToolsCommon.debounce(handleSearch, 200));
    elements.clearSearchBtn.addEventListener('click', clearSearch);

    // Tabs
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => handleTabClick(tab));
    });

    // Modal
    elements.closeModalBtn.addEventListener('click', closeStatusModal);
    elements.copyCodeBtn.addEventListener('click', copyExampleCode);

    elements.statusModal.addEventListener('click', (e) => {
      if (e.target === elements.statusModal) {
        closeStatusModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input
      const isTyping = document.activeElement.tagName === 'INPUT' ||
                       document.activeElement.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        if (elements.statusModal.classList.contains('active')) {
          closeStatusModal();
        } else if (state.searchQuery) {
          clearSearch();
        }
      }

      if (isTyping) return;

      // Focus search
      if (e.key === '/') {
        e.preventDefault();
        elements.searchInput.focus();
      }

      // Tab shortcuts (1-6)
      if (e.key >= '1' && e.key <= '6') {
        const index = parseInt(e.key) - 1;
        if (elements.tabs[index]) {
          handleTabClick(elements.tabs[index]);
        }
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initEventListeners();
    renderStatusList();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
