/**
 * HTML Preview Tool
 */
(function() {
  'use strict';

  // ==================== Presets ====================
  const PRESETS = {
    hello: {
      html: '<div class="container">\n  <h1>Hello, World!</h1>\n  <p>Welcome to the live HTML preview editor.</p>\n  <button id="greetBtn">Click me</button>\n  <p id="output"></p>\n</div>',
      css: '.container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: #fff;\n}\n\nh1 {\n  font-size: 3rem;\n  margin-bottom: 0.5rem;\n}\n\np {\n  font-size: 1.2rem;\n  opacity: 0.9;\n}\n\nbutton {\n  margin-top: 1rem;\n  padding: 0.8rem 2rem;\n  font-size: 1rem;\n  font-weight: 600;\n  color: #764ba2;\n  background: #fff;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: transform 0.2s;\n}\n\nbutton:hover {\n  transform: scale(1.05);\n}',
      js: 'let count = 0;\nconst btn = document.getElementById("greetBtn");\nconst output = document.getElementById("output");\n\nbtn.addEventListener("click", () => {\n  count++;\n  output.textContent = `You clicked ${count} time${count > 1 ? "s" : ""}!`;\n  console.log("Button clicked:", count);\n});'
    },
    animation: {
      html: '<div class="scene">\n  <div class="cube">\n    <div class="face front">Front</div>\n    <div class="face back">Back</div>\n    <div class="face right">Right</div>\n    <div class="face left">Left</div>\n    <div class="face top">Top</div>\n    <div class="face bottom">Bottom</div>\n  </div>\n</div>',
      css: 'body {\n  margin: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  background: #1a1a2e;\n  perspective: 800px;\n}\n\n.scene {\n  width: 120px;\n  height: 120px;\n  perspective: 600px;\n}\n\n.cube {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  transform-style: preserve-3d;\n  animation: spin 6s infinite linear;\n}\n\n.face {\n  position: absolute;\n  width: 120px;\n  height: 120px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: system-ui;\n  font-weight: 700;\n  font-size: 1rem;\n  color: #fff;\n  border: 2px solid rgba(255,255,255,0.3);\n  border-radius: 8px;\n}\n\n.front  { background: rgba(255,0,100,0.7); transform: translateZ(60px); }\n.back   { background: rgba(0,100,255,0.7); transform: rotateY(180deg) translateZ(60px); }\n.right  { background: rgba(0,200,100,0.7); transform: rotateY(90deg) translateZ(60px); }\n.left   { background: rgba(200,100,0,0.7); transform: rotateY(-90deg) translateZ(60px); }\n.top    { background: rgba(100,0,200,0.7); transform: rotateX(90deg) translateZ(60px); }\n.bottom { background: rgba(200,200,0,0.7); transform: rotateX(-90deg) translateZ(60px); }\n\n@keyframes spin {\n  from { transform: rotateX(0) rotateY(0); }\n  to   { transform: rotateX(360deg) rotateY(360deg); }\n}',
      js: 'console.log("CSS 3D cube animation running!");'
    },
    fetch: {
      html: '<div class="app">\n  <h1>Random User</h1>\n  <button id="fetchBtn">Fetch User</button>\n  <div id="card" class="card hidden"></div>\n</div>',
      css: 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f0f2f5;\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.app {\n  text-align: center;\n}\n\nh1 {\n  color: #333;\n}\n\nbutton {\n  padding: 0.7rem 1.5rem;\n  font-size: 1rem;\n  font-weight: 600;\n  color: #fff;\n  background: #91214E;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #7a1b42;\n}\n\n.card {\n  margin-top: 1.5rem;\n  padding: 1.5rem;\n  background: #fff;\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  display: inline-block;\n  text-align: center;\n  transition: opacity 0.3s;\n}\n\n.card.hidden {\n  display: none;\n}\n\n.card img {\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  margin-bottom: 0.5rem;\n}\n\n.card h2 {\n  margin: 0.5rem 0 0.25rem;\n  color: #333;\n}\n\n.card p {\n  color: #666;\n  margin: 0.25rem 0;\n}',
      js: 'const btn = document.getElementById("fetchBtn");\nconst card = document.getElementById("card");\n\nbtn.addEventListener("click", async () => {\n  btn.textContent = "Loading...";\n  try {\n    const res = await fetch("https://randomuser.me/api/");\n    const data = await res.json();\n    const user = data.results[0];\n    console.log("Fetched user:", user.name.first, user.name.last);\n\n    card.classList.remove("hidden");\n    card.innerHTML = `\n      <img src="${user.picture.large}" alt="avatar">\n      <h2>${user.name.first} ${user.name.last}</h2>\n      <p>${user.email}</p>\n      <p>${user.location.city}, ${user.location.country}</p>\n    `;\n  } catch (err) {\n    console.error("Fetch failed:", err.message);\n    card.classList.remove("hidden");\n    card.innerHTML = "<p>Failed to fetch user. Try again.</p>";\n  }\n  btn.textContent = "Fetch User";\n});'
    },
    canvas: {
      html: '<canvas id="canvas" width="400" height="400"></canvas>',
      css: 'body {\n  margin: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  background: #111;\n}\n\ncanvas {\n  border-radius: 12px;\n  background: #000;\n}',
      js: 'const canvas = document.getElementById("canvas");\nconst ctx = canvas.getContext("2d");\nconst particles = [];\n\nclass Particle {\n  constructor() {\n    this.reset();\n  }\n  reset() {\n    this.x = canvas.width / 2;\n    this.y = canvas.height / 2;\n    this.vx = (Math.random() - 0.5) * 4;\n    this.vy = (Math.random() - 0.5) * 4;\n    this.life = 1;\n    this.decay = Math.random() * 0.02 + 0.005;\n    this.size = Math.random() * 3 + 1;\n    this.hue = Math.random() * 60 + 330;\n  }\n  update() {\n    this.x += this.vx;\n    this.y += this.vy;\n    this.life -= this.decay;\n    if (this.life <= 0) this.reset();\n  }\n  draw() {\n    ctx.beginPath();\n    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);\n    ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life})`;\n    ctx.fill();\n  }\n}\n\nfor (let i = 0; i < 200; i++) {\n  particles.push(new Particle());\n}\n\nfunction animate() {\n  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  particles.forEach(p => { p.update(); p.draw(); });\n  requestAnimationFrame(animate);\n}\n\nanimate();\nconsole.log("Canvas particle system started with 200 particles");'
    },
    form: {
      html: '<div class="form-container">\n  <h1>Sign Up</h1>\n  <form id="signupForm" novalidate>\n    <div class="field">\n      <label for="name">Name</label>\n      <input type="text" id="name" placeholder="Your name" required>\n      <span class="error" id="nameError"></span>\n    </div>\n    <div class="field">\n      <label for="email">Email</label>\n      <input type="email" id="email" placeholder="you@example.com" required>\n      <span class="error" id="emailError"></span>\n    </div>\n    <div class="field">\n      <label for="password">Password</label>\n      <input type="password" id="password" placeholder="Min 8 characters" required>\n      <span class="error" id="passwordError"></span>\n    </div>\n    <button type="submit">Sign Up</button>\n    <p id="successMsg" class="success hidden"></p>\n  </form>\n</div>',
      css: 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f5f5f5;\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.form-container {\n  background: #fff;\n  padding: 2rem;\n  border-radius: 12px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n  width: 100%;\n  max-width: 400px;\n}\n\nh1 {\n  text-align: center;\n  color: #333;\n  margin-bottom: 1.5rem;\n}\n\n.field {\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: block;\n  font-weight: 600;\n  margin-bottom: 0.3rem;\n  color: #555;\n}\n\ninput {\n  width: 100%;\n  padding: 0.7rem;\n  font-size: 1rem;\n  border: 2px solid #ddd;\n  border-radius: 8px;\n  box-sizing: border-box;\n  transition: border-color 0.2s;\n}\n\ninput:focus {\n  outline: none;\n  border-color: #91214E;\n}\n\ninput.invalid {\n  border-color: #e53e3e;\n}\n\ninput.valid {\n  border-color: #38a169;\n}\n\n.error {\n  font-size: 0.85rem;\n  color: #e53e3e;\n  min-height: 1.2rem;\n  display: block;\n}\n\nbutton {\n  width: 100%;\n  padding: 0.8rem;\n  font-size: 1rem;\n  font-weight: 700;\n  color: #fff;\n  background: #91214E;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  margin-top: 0.5rem;\n}\n\nbutton:hover {\n  background: #7a1b42;\n}\n\n.success {\n  text-align: center;\n  color: #38a169;\n  font-weight: 600;\n}\n\n.hidden {\n  display: none;\n}',
      js: 'const form = document.getElementById("signupForm");\n\nfunction validate(field, errorEl, check) {\n  const val = field.value.trim();\n  const msg = check(val);\n  errorEl.textContent = msg;\n  field.classList.toggle("invalid", !!msg);\n  field.classList.toggle("valid", !msg && val.length > 0);\n  return !msg;\n}\n\nconst nameCheck = v => !v ? "Name is required" : v.length < 2 ? "Name is too short" : "";\nconst emailCheck = v => !v ? "Email is required" : !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v) ? "Invalid email" : "";\nconst passCheck = v => !v ? "Password is required" : v.length < 8 ? "At least 8 characters" : "";\n\nconst name = document.getElementById("name");\nconst email = document.getElementById("email");\nconst password = document.getElementById("password");\n\nname.addEventListener("input", () => validate(name, document.getElementById("nameError"), nameCheck));\nemail.addEventListener("input", () => validate(email, document.getElementById("emailError"), emailCheck));\npassword.addEventListener("input", () => validate(password, document.getElementById("passwordError"), passCheck));\n\nform.addEventListener("submit", e => {\n  e.preventDefault();\n  const v1 = validate(name, document.getElementById("nameError"), nameCheck);\n  const v2 = validate(email, document.getElementById("emailError"), emailCheck);\n  const v3 = validate(password, document.getElementById("passwordError"), passCheck);\n\n  if (v1 && v2 && v3) {\n    console.log("Form submitted:", { name: name.value, email: email.value });\n    const msg = document.getElementById("successMsg");\n    msg.textContent = "Account created successfully!";\n    msg.classList.remove("hidden");\n    form.reset();\n    [name, email, password].forEach(f => f.classList.remove("valid"));\n  } else {\n    console.warn("Validation failed");\n  }\n});'
    }
  };

  // ==================== State ====================
  const state = {
    autoRun: true,
    debounceTimer: null,
    layout: 'horizontal'
  };

  // ==================== DOM Elements ====================
  const els = {
    htmlEditor: document.getElementById('htmlEditor'),
    cssEditor: document.getElementById('cssEditor'),
    jsEditor: document.getElementById('jsEditor'),
    htmlLineNumbers: document.getElementById('htmlLineNumbers'),
    cssLineNumbers: document.getElementById('cssLineNumbers'),
    jsLineNumbers: document.getElementById('jsLineNumbers'),
    previewFrame: document.getElementById('previewFrame'),
    consoleOutput: document.getElementById('consoleOutput'),
    runBtn: document.getElementById('runBtn'),
    clearConsoleBtn: document.getElementById('clearConsoleBtn'),
    autoRunToggle: document.getElementById('autoRunToggle'),
    presetSelect: document.getElementById('presetSelect'),
    editorTabs: document.querySelectorAll('.hp-editor-tab'),
    codePanels: document.querySelectorAll('.hp-code-panel'),
    layoutBtns: document.querySelectorAll('.hp-layout-btn'),
    hpBody: document.getElementById('hpBody')
  };

  // ==================== Line Numbers ====================
  function updateLineNumbers(textarea, lineNumberEl) {
    const lines = textarea.value.split('\n').length;
    lineNumberEl.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  }

  function syncScroll(textarea, lineNumberEl) {
    lineNumberEl.scrollTop = textarea.scrollTop;
  }

  // ==================== Update Preview ====================
  function updatePreview() {
    const html = els.htmlEditor.value;
    const css = els.cssEditor.value;
    const js = els.jsEditor.value;

    // Build the console capture script
    const consoleScript = `
      <script>
        (function() {
          const _origConsole = {};
          ['log','error','warn','info'].forEach(method => {
            _origConsole[method] = console[method];
            console[method] = function(...args) {
              _origConsole[method].apply(console, args);
              window.parent.postMessage({
                type: 'console',
                method: method,
                args: args.map(a => {
                  try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
                  catch(e) { return String(a); }
                })
              }, '*');
            };
          });
          window.onerror = function(msg, url, line, col, err) {
            console.error(msg + ' (line ' + line + ')');
          };
        })();
      <\/script>
    `;

    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  ${consoleScript}
  <script>${js}<\/script>
</body>
</html>`;

    const frame = els.previewFrame;
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Revoke old URL
    if (frame._blobUrl) URL.revokeObjectURL(frame._blobUrl);
    frame._blobUrl = url;
    frame.src = url;
  }

  function scheduleUpdate() {
    if (!state.autoRun) return;
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(updatePreview, 400);
  }

  // ==================== Console ====================
  function addConsoleLine(method, args) {
    const line = document.createElement('div');
    line.className = `hp-console-line ${method}`;
    line.textContent = args.join(' ');
    els.consoleOutput.appendChild(line);
    els.consoleOutput.scrollTop = els.consoleOutput.scrollHeight;
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'console') {
      addConsoleLine(e.data.method, e.data.args);
    }
  });

  // ==================== Tab Support in Textarea ====================
  function handleTab(textarea, e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      textarea.dispatchEvent(new Event('input'));
    }
  }

  // ==================== Event Listeners ====================

  // Editor input
  [els.htmlEditor, els.cssEditor, els.jsEditor].forEach(editor => {
    const lang = editor.dataset.lang;
    const lineNumEl = lang === 'html' ? els.htmlLineNumbers : lang === 'css' ? els.cssLineNumbers : els.jsLineNumbers;

    editor.addEventListener('input', function() {
      updateLineNumbers(this, lineNumEl);
      scheduleUpdate();
    });

    editor.addEventListener('scroll', function() {
      syncScroll(this, lineNumEl);
    });

    editor.addEventListener('keydown', function(e) {
      handleTab(this, e);
      // Ctrl+Enter to run
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        updatePreview();
      }
    });
  });

  // Editor tabs
  els.editorTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const lang = this.dataset.lang;
      els.editorTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      els.codePanels.forEach(p => {
        p.classList.toggle('active', p.dataset.lang === lang);
      });
    });
  });

  // Layout toggle
  els.layoutBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const layout = this.dataset.layout;
      els.layoutBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      els.hpBody.dataset.layout = layout;
      state.layout = layout;
    });
  });

  // Auto-run toggle
  els.autoRunToggle.addEventListener('change', function() {
    state.autoRun = this.checked;
  });

  // Run button
  els.runBtn.addEventListener('click', function() {
    updatePreview();
  });

  // Clear console
  els.clearConsoleBtn.addEventListener('click', function() {
    els.consoleOutput.innerHTML = '';
  });

  // Presets
  els.presetSelect.addEventListener('change', function() {
    const preset = PRESETS[this.value];
    if (!preset) return;

    els.htmlEditor.value = preset.html;
    els.cssEditor.value = preset.css;
    els.jsEditor.value = preset.js;

    // Update line numbers for all editors
    updateLineNumbers(els.htmlEditor, els.htmlLineNumbers);
    updateLineNumbers(els.cssEditor, els.cssLineNumbers);
    updateLineNumbers(els.jsEditor, els.jsLineNumbers);

    // Clear console
    els.consoleOutput.innerHTML = '';

    // Run
    updatePreview();

    ToolsCommon.showToast(`Loaded "${this.options[this.selectedIndex].text}" preset`, 'success');
  });

  // Keyboard shortcut: Ctrl+Enter to run globally
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      updatePreview();
    }
  });

  // ==================== Init ====================
  // Set initial line numbers
  updateLineNumbers(els.htmlEditor, els.htmlLineNumbers);
  updateLineNumbers(els.cssEditor, els.cssLineNumbers);
  updateLineNumbers(els.jsEditor, els.jsLineNumbers);

})();
