/**
 * .gitignore Generator Tool
 */
(function() {
  'use strict';

  // ==================== Template Data ====================
  const TEMPLATES = {
    // Languages
    javascript: { name: 'JavaScript', category: 'languages', icon: 'fa-brands fa-js', rules: [
      'node_modules/', 'dist/', 'build/', '.cache/', '*.min.js', '*.min.css', '.eslintcache',
      'coverage/', '.nyc_output/', '*.tgz', '.env', '.env.local', '.env.*.local'
    ]},
    python: { name: 'Python', category: 'languages', icon: 'fa-brands fa-python', rules: [
      '__pycache__/', '*.py[cod]', '*$py.class', '*.so', '.Python', 'build/', 'develop-eggs/',
      'dist/', 'downloads/', 'eggs/', '.eggs/', 'lib/', 'lib64/', 'parts/', 'sdist/', 'var/',
      'wheels/', '*.egg-info/', '.installed.cfg', '*.egg', '*.manifest', '*.spec', 'pip-log.txt',
      'pip-delete-this-directory.txt', '.venv/', 'venv/', 'ENV/', '.pytest_cache/', '.mypy_cache/',
      '.ruff_cache/', '.coverage', 'htmlcov/'
    ]},
    java: { name: 'Java', category: 'languages', icon: 'fa-brands fa-java', rules: [
      '*.class', '*.jar', '*.war', '*.ear', '*.nar', 'target/', '.gradle/', 'build/',
      'out/', '.classpath', '.project', '.settings/', 'bin/', '*.log', 'hs_err_pid*',
      'replay_pid*'
    ]},
    go: { name: 'Go', category: 'languages', icon: 'fa-brands fa-golang', rules: [
      '*.exe', '*.exe~', '*.dll', '*.so', '*.dylib', '*.test', '*.out', 'vendor/',
      'go.work', 'go.work.sum'
    ]},
    rust: { name: 'Rust', category: 'languages', icon: 'fa-brands fa-rust', rules: [
      'target/', 'Cargo.lock', '**/*.rs.bk', '*.pdb'
    ]},
    cpp: { name: 'C++', category: 'languages', icon: 'fa-solid fa-c', rules: [
      '*.o', '*.obj', '*.so', '*.dylib', '*.dll', '*.a', '*.lib', '*.exe', '*.out',
      '*.app', '*.dSYM/', 'build/', 'cmake-build-*/', 'CMakeFiles/', 'CMakeCache.txt',
      'Makefile', '*.gch', '*.pch'
    ]},
    ruby: { name: 'Ruby', category: 'languages', icon: 'fa-solid fa-gem', rules: [
      '*.gem', '*.rbc', '.bundle/', 'vendor/bundle/', '.config', 'coverage/', 'InstalledFiles',
      'lib/bundler/man/', 'pkg/', 'rdoc/', 'spec/reports/', 'test/tmp/', 'test/version_tmp/',
      'tmp/', '.byebug_history', '.ruby-version', '.ruby-gemset', 'Gemfile.lock'
    ]},
    php: { name: 'PHP', category: 'languages', icon: 'fa-brands fa-php', rules: [
      'vendor/', 'composer.lock', '.phpunit.result.cache', '.php-cs-fixer.cache',
      '*.cache', '*.log', '.env', 'storage/framework/cache/', 'storage/framework/sessions/',
      'storage/framework/views/', 'bootstrap/cache/'
    ]},
    swift: { name: 'Swift', category: 'languages', icon: 'fa-brands fa-swift', rules: [
      '.build/', 'Packages/', 'xcuserdata/', '*.xccheckout', '*.moved-aside', '*.pbxuser',
      '*.mode1v3', '*.mode2v3', '*.perspectivev3', '*.xcworkspace', 'DerivedData/',
      '.swiftpm/', 'Package.resolved'
    ]},
    kotlin: { name: 'Kotlin', category: 'languages', icon: 'fa-solid fa-k', rules: [
      '*.class', '*.jar', '*.war', 'build/', '.gradle/', 'out/', '.kotlin/',
      'local.properties', '*.iml'
    ]},

    // Frameworks
    react: { name: 'React', category: 'frameworks', icon: 'fa-brands fa-react', rules: [
      'node_modules/', 'build/', '.env.local', '.env.development.local', '.env.test.local',
      '.env.production.local', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*',
      'coverage/'
    ]},
    vue: { name: 'Vue', category: 'frameworks', icon: 'fa-brands fa-vuejs', rules: [
      'node_modules/', 'dist/', '.env.local', '.env.*.local', 'npm-debug.log*',
      'yarn-debug.log*', 'yarn-error.log*', 'pnpm-debug.log*', '*.local', '.vite/'
    ]},
    angular: { name: 'Angular', category: 'frameworks', icon: 'fa-brands fa-angular', rules: [
      'node_modules/', 'dist/', 'tmp/', 'out-tsc/', 'bazel-out/', '.angular/',
      '.sass-cache/', 'connect.lock', 'coverage/', 'libpeerconnection.log',
      'testem.log', 'typings/', '.env'
    ]},
    nextjs: { name: 'Next.js', category: 'frameworks', icon: 'fa-brands fa-react', rules: [
      'node_modules/', '.next/', 'out/', '.env*.local', 'npm-debug.log*',
      'yarn-debug.log*', 'yarn-error.log*', '.vercel', 'next-env.d.ts'
    ]},
    django: { name: 'Django', category: 'frameworks', icon: 'fa-brands fa-python', rules: [
      '*.pyc', '__pycache__/', 'db.sqlite3', 'db.sqlite3-journal', 'media/',
      'staticfiles/', '.env', '*.pot', '*.mo', 'local_settings.py', 'venv/', '.venv/'
    ]},
    flask: { name: 'Flask', category: 'frameworks', icon: 'fa-brands fa-python', rules: [
      '__pycache__/', '*.pyc', 'instance/', '.webassets-cache', '.env', 'venv/', '.venv/',
      'dist/', 'build/', '*.egg-info/', '.pytest_cache/'
    ]},
    rails: { name: 'Rails', category: 'frameworks', icon: 'fa-solid fa-gem', rules: [
      '*.rbc', 'capybara-*.html', '.rspec', 'log/', 'tmp/', 'db/*.sqlite3',
      'db/*.sqlite3-journal', 'public/system/', 'coverage/', 'spec/tmp/', '.env',
      'vendor/bundle/', '.byebug_history', 'storage/', 'node_modules/'
    ]},
    laravel: { name: 'Laravel', category: 'frameworks', icon: 'fa-brands fa-laravel', rules: [
      'vendor/', 'node_modules/', 'npm-debug.log', 'yarn-error.log', '.env',
      '.env.backup', '.env.production', 'Homestead.json', 'Homestead.yaml',
      'auth.json', 'storage/*.key', 'public/hot', 'public/storage', '.phpunit.result.cache'
    ]},
    spring: { name: 'Spring', category: 'frameworks', icon: 'fa-brands fa-java', rules: [
      'target/', '!.mvn/wrapper/maven-wrapper.jar', '!**/src/main/**/target/',
      '!**/src/test/**/target/', '.gradle/', 'build/', '!gradle/wrapper/gradle-wrapper.jar',
      '*.log', '.project', '.classpath', '.settings/', 'bin/', 'out/'
    ]},

    // IDEs
    vscode: { name: 'VS Code', category: 'ides', icon: 'fa-solid fa-code', rules: [
      '.vscode/*', '!.vscode/settings.json', '!.vscode/tasks.json',
      '!.vscode/launch.json', '!.vscode/extensions.json', '*.code-workspace',
      '.history/'
    ]},
    jetbrains: { name: 'JetBrains', category: 'ides', icon: 'fa-solid fa-terminal', rules: [
      '.idea/', '*.iws', '*.iml', '*.ipr', 'out/', 'cmake-build-*/',
      '.idea_modules/', 'atlassian-ide-plugin.xml'
    ]},
    vim: { name: 'Vim', category: 'ides', icon: 'fa-solid fa-v', rules: [
      '[._]*.s[a-v][a-z]', '!*.svg', '[._]*.sw[a-p]', '[._]s[a-rt-v][a-z]',
      '[._]ss[a-gi-z]', '[._]sw[a-p]', 'Session.vim', 'Sessionx.vim',
      '.netrwhist', '*~', 'tags'
    ]},
    emacs: { name: 'Emacs', category: 'ides', icon: 'fa-solid fa-e', rules: [
      '*~', '\\#*\\#', '/.emacs.desktop', '/.emacs.desktop.lock', '*.elc',
      'auto-save-list', 'tramp', '.\\#*', '.org-id-locations',
      '*_archive', '*_flymake.*', '/eshell/history', '/eshell/lastdir',
      '/elpa/', '*.rel', '/auto/', '.cask/', 'dist/', 'flycheck_*.el'
    ]},
    sublime: { name: 'Sublime Text', category: 'ides', icon: 'fa-solid fa-s', rules: [
      '*.tmlanguage.cache', '*.tmPreferences.cache', '*.stTheme.cache',
      '*.sublime-workspace', '*.sublime-project', 'sftp-config.json',
      'sftp-config-alt*.json', 'Package Control.last-run',
      'Package Control.ca-list', 'Package Control.ca-bundle',
      'Package Control.system-ca-bundle', 'Package Control.cache/',
      'Package Control.ca-certs/'
    ]},

    // OS
    macos: { name: 'macOS', category: 'os', icon: 'fa-brands fa-apple', rules: [
      '.DS_Store', '.AppleDouble', '.LSOverride', 'Icon\\r', '._*',
      '.DocumentRevisions-V100', '.fseventsd', '.Spotlight-V100',
      '.TemporaryItems', '.Trashes', '.VolumeIcon.icns', '.com.apple.timemachine.donotpresent',
      '.AppleDB', '.AppleDesktop', 'Network Trash Folder', 'Temporary Items', '.apdisk'
    ]},
    windows: { name: 'Windows', category: 'os', icon: 'fa-brands fa-windows', rules: [
      'Thumbs.db', 'Thumbs.db:encryptable', 'ehthumbs.db', 'ehthumbs_vista.db',
      '*.stackdump', '[Dd]esktop.ini', '$RECYCLE.BIN/', '*.cab', '*.msi', '*.msix',
      '*.msm', '*.msp', '*.lnk'
    ]},
    linux: { name: 'Linux', category: 'os', icon: 'fa-brands fa-linux', rules: [
      '*~', '.fuse_hidden*', '.directory', '.Trash-*', '.nfs*'
    ]},

    // Other
    node: { name: 'Node', category: 'other', icon: 'fa-brands fa-node-js', rules: [
      'node_modules/', 'npm-debug.log', 'yarn-debug.log*', 'yarn-error.log*',
      'lerna-debug.log*', '.pnpm-debug.log*', 'pnpm-lock.yaml', 'package-lock.json',
      '.npm', '.eslintcache', '.node_repl_history', '*.tgz', '.yarn-integrity',
      '.env', '.env.test', '.cache'
    ]},
    docker: { name: 'Docker', category: 'other', icon: 'fa-brands fa-docker', rules: [
      'docker-compose.override.yml', '.dockerignore', '*.env', '.env.*'
    ]},
    terraform: { name: 'Terraform', category: 'other', icon: 'fa-solid fa-cloud', rules: [
      '.terraform/', '*.tfstate', '*.tfstate.*', 'crash.log', 'crash.*.log',
      '*.tfvars', '*.tfvars.json', 'override.tf', 'override.tf.json',
      '*_override.tf', '*_override.tf.json', '.terraformrc', 'terraform.rc'
    ]},
    logs: { name: 'Logs', category: 'other', icon: 'fa-solid fa-file-lines', rules: [
      '*.log', 'logs/', '*.log.*', 'npm-debug.log*', 'yarn-debug.log*',
      'yarn-error.log*', 'pnpm-debug.log*', 'lerna-debug.log*'
    ]}
  };

  // ==================== State ====================
  const state = {
    selected: new Set(),
    searchQuery: '',
    activeCategory: 'all'
  };

  // ==================== DOM Elements ====================
  const elements = {
    searchInput: document.getElementById('searchInput'),
    selectedTags: document.getElementById('selectedTags'),
    categoryTabs: document.getElementById('categoryTabs'),
    templateList: document.getElementById('templateList'),
    previewContent: document.getElementById('previewContent'),
    customRules: document.getElementById('customRules'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearAllBtn: document.getElementById('clearAllBtn')
  };

  // ==================== Render Templates ====================
  function renderTemplates() {
    const query = state.searchQuery.toLowerCase();
    const category = state.activeCategory;

    const filtered = Object.entries(TEMPLATES).filter(([key, tpl]) => {
      const matchCategory = category === 'all' || tpl.category === category;
      const matchSearch = !query || tpl.name.toLowerCase().includes(query) || key.includes(query);
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      elements.templateList.innerHTML = `
        <div class="gi-template-empty">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>No templates found</p>
        </div>`;
      return;
    }

    elements.templateList.innerHTML = filtered.map(([key, tpl]) => {
      const isSelected = state.selected.has(key);
      return `
        <div class="gi-template-item${isSelected ? ' selected' : ''}" data-key="${key}" tabindex="0" role="checkbox" aria-checked="${isSelected}">
          <div class="gi-template-check"><i class="fa-solid fa-check"></i></div>
          <div class="gi-template-icon"><i class="${tpl.icon}"></i></div>
          <div class="gi-template-info">
            <div class="gi-template-name">${tpl.name}</div>
            <div class="gi-template-category">${tpl.category} &middot; ${tpl.rules.length} rules</div>
          </div>
        </div>`;
    }).join('');
  }

  // ==================== Render Selected Tags ====================
  function renderSelectedTags() {
    if (state.selected.size === 0) {
      elements.selectedTags.innerHTML = '';
      return;
    }

    elements.selectedTags.innerHTML = Array.from(state.selected).map(key => {
      const tpl = TEMPLATES[key];
      return `
        <span class="gi-tag">
          ${tpl.name}
          <button class="gi-tag-remove" data-key="${key}" title="Remove ${tpl.name}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </span>`;
    }).join('');
  }

  // ==================== Generate Preview ====================
  function generatePreview() {
    if (state.selected.size === 0 && !elements.customRules.value.trim()) {
      elements.previewContent.textContent = '# Select templates from the left to generate your .gitignore';
      return;
    }

    const sections = [];
    const allRules = new Set();

    // Add template rules grouped by template
    state.selected.forEach(key => {
      const tpl = TEMPLATES[key];
      const sectionLines = [`# ===== ${tpl.name} =====`];
      tpl.rules.forEach(rule => {
        if (!allRules.has(rule)) {
          allRules.add(rule);
          sectionLines.push(rule);
        }
      });
      sections.push(sectionLines.join('\n'));
    });

    // Add custom rules
    const customText = elements.customRules.value.trim();
    if (customText) {
      const customLines = ['# ===== Custom Rules ====='];
      customText.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !allRules.has(trimmed)) {
          allRules.add(trimmed);
          customLines.push(trimmed);
        } else if (trimmed.startsWith('#') || trimmed === '') {
          customLines.push(line);
        }
      });
      sections.push(customLines.join('\n'));
    }

    const header = '# Generated by KVSOVANREACH .gitignore Generator\n# https://kvsovanreach.com/tools/gitignore/\n';
    elements.previewContent.textContent = header + '\n' + sections.join('\n\n') + '\n';
  }

  // ==================== Get Output ====================
  function getOutput() {
    return elements.previewContent.textContent;
  }

  // ==================== Toggle Template ====================
  function toggleTemplate(key) {
    if (state.selected.has(key)) {
      state.selected.delete(key);
    } else {
      state.selected.add(key);
    }
    renderTemplates();
    renderSelectedTags();
    generatePreview();
  }

  // ==================== Event Listeners ====================

  // Template click
  elements.templateList.addEventListener('click', function(e) {
    const item = e.target.closest('.gi-template-item');
    if (item) toggleTemplate(item.dataset.key);
  });

  // Template keyboard
  elements.templateList.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.gi-template-item');
      if (item) {
        e.preventDefault();
        toggleTemplate(item.dataset.key);
      }
    }
  });

  // Tag remove
  elements.selectedTags.addEventListener('click', function(e) {
    const btn = e.target.closest('.gi-tag-remove');
    if (btn) toggleTemplate(btn.dataset.key);
  });

  // Category tabs
  elements.categoryTabs.addEventListener('click', function(e) {
    const tab = e.target.closest('.gi-cat-tab');
    if (!tab) return;

    elements.categoryTabs.querySelectorAll('.gi-cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeCategory = tab.dataset.category;
    renderTemplates();
  });

  // Search
  elements.searchInput.addEventListener('input', function() {
    state.searchQuery = this.value;
    renderTemplates();
  });

  // Custom rules change
  elements.customRules.addEventListener('input', function() {
    generatePreview();
  });

  // Copy
  elements.copyBtn.addEventListener('click', function() {
    const text = getOutput();
    if (text.startsWith('# Select templates')) {
      ToolsCommon.showToast('Nothing to copy. Select some templates first.', 'warning');
      return;
    }
    ToolsCommon.copyWithToast(text, '.gitignore copied to clipboard!');
  });

  // Download
  elements.downloadBtn.addEventListener('click', function() {
    const text = getOutput();
    if (text.startsWith('# Select templates')) {
      ToolsCommon.showToast('Nothing to download. Select some templates first.', 'warning');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ToolsCommon.showToast('.gitignore downloaded!', 'success');
  });

  // Clear all
  elements.clearAllBtn.addEventListener('click', function() {
    state.selected.clear();
    elements.customRules.value = '';
    renderTemplates();
    renderSelectedTags();
    generatePreview();
    ToolsCommon.showToast('All selections cleared', 'success');
  });

  // ==================== Init ====================
  renderTemplates();
  generatePreview();

})();
