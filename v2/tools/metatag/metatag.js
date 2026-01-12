/**
 * Meta Tag Previewer Tool
 * Preview and generate meta tags for SEO and social sharing
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    // Inputs
    pageUrl: document.getElementById('pageUrl'),
    pageTitle: document.getElementById('pageTitle'),
    pageDescription: document.getElementById('pageDescription'),
    pageImage: document.getElementById('pageImage'),
    siteName: document.getElementById('siteName'),
    twitterHandle: document.getElementById('twitterHandle'),
    twitterCard: document.getElementById('twitterCard'),
    // Counters
    titleCount: document.getElementById('titleCount'),
    descCount: document.getElementById('descCount'),
    // Tabs
    tabs: document.querySelectorAll('.preview-tab'),
    panels: document.querySelectorAll('.preview-panel'),
    // Google Preview
    googleUrl: document.getElementById('googleUrl'),
    googleTitle: document.getElementById('googleTitle'),
    googleDesc: document.getElementById('googleDesc'),
    // Facebook Preview
    facebookImage: document.getElementById('facebookImage'),
    facebookSite: document.getElementById('facebookSite'),
    facebookTitle: document.getElementById('facebookTitle'),
    facebookDesc: document.getElementById('facebookDesc'),
    // Twitter Preview
    twitterPreview: document.getElementById('twitterPreview'),
    twitterImage: document.getElementById('twitterImage'),
    twitterTitle: document.getElementById('twitterTitle'),
    twitterDesc: document.getElementById('twitterDesc'),
    twitterSite: document.getElementById('twitterSite'),
    // LinkedIn Preview
    linkedinImage: document.getElementById('linkedinImage'),
    linkedinTitle: document.getElementById('linkedinTitle'),
    linkedinDesc: document.getElementById('linkedinDesc'),
    linkedinSite: document.getElementById('linkedinSite'),
    // Code
    generateBtn: document.getElementById('generateBtn'),
    codeSection: document.getElementById('codeSection'),
    codeOutput: document.getElementById('codeOutput'),
    copyCodeBtn: document.getElementById('copyCodeBtn')
  };

  // ==================== Default Values ====================
  const defaults = {
    url: 'example.com',
    title: 'Page Title',
    description: 'This is a meta description that will appear in search results and social shares.',
    siteName: 'EXAMPLE.COM'
  };

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}Panel`);
    });
  }

  // ==================== Update Character Counts ====================
  function updateCharCounts() {
    const titleLen = elements.pageTitle.value.length;
    const descLen = elements.pageDescription.value.length;

    elements.titleCount.textContent = `${titleLen}/60`;
    elements.titleCount.className = 'char-count';
    if (titleLen > 60) {
      elements.titleCount.classList.add('error');
    } else if (titleLen > 50) {
      elements.titleCount.classList.add('warning');
    }

    elements.descCount.textContent = `${descLen}/160`;
    elements.descCount.className = 'char-count';
    if (descLen > 160) {
      elements.descCount.classList.add('error');
    } else if (descLen > 150) {
      elements.descCount.classList.add('warning');
    }
  }

  // ==================== Extract Domain from URL ====================
  function extractDomain(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url || defaults.url;
    }
  }

  // ==================== Update Previews ====================
  function updatePreviews() {
    const url = elements.pageUrl.value || '';
    const title = elements.pageTitle.value || defaults.title;
    const description = elements.pageDescription.value || defaults.description;
    const image = elements.pageImage.value || '';
    const siteName = elements.siteName.value || extractDomain(url).toUpperCase() || defaults.siteName;
    const domain = extractDomain(url);

    // Google Preview
    elements.googleUrl.textContent = domain || defaults.url;
    elements.googleTitle.textContent = title;
    elements.googleDesc.textContent = description;

    // Facebook Preview
    if (image) {
      elements.facebookImage.innerHTML = '';
      elements.facebookImage.style.backgroundImage = `url(${image})`;
    } else {
      elements.facebookImage.innerHTML = '<i class="fa-solid fa-image"></i>';
      elements.facebookImage.style.backgroundImage = '';
    }
    elements.facebookSite.textContent = siteName;
    elements.facebookTitle.textContent = title;
    elements.facebookDesc.textContent = description;

    // Twitter Preview
    const isLargeCard = elements.twitterCard.value === 'summary_large_image';
    elements.twitterPreview.classList.toggle('large', isLargeCard);

    if (image) {
      elements.twitterImage.innerHTML = '';
      elements.twitterImage.style.backgroundImage = `url(${image})`;
    } else {
      elements.twitterImage.innerHTML = '<i class="fa-solid fa-image"></i>';
      elements.twitterImage.style.backgroundImage = '';
    }
    elements.twitterTitle.textContent = title;
    elements.twitterDesc.textContent = description;
    elements.twitterSite.textContent = domain || defaults.url;

    // LinkedIn Preview
    if (image) {
      elements.linkedinImage.innerHTML = '';
      elements.linkedinImage.style.backgroundImage = `url(${image})`;
    } else {
      elements.linkedinImage.innerHTML = '<i class="fa-solid fa-image"></i>';
      elements.linkedinImage.style.backgroundImage = '';
    }
    elements.linkedinTitle.textContent = title;
    elements.linkedinDesc.textContent = description;
    elements.linkedinSite.textContent = domain || defaults.url;
  }

  // ==================== Generate Meta Tags ====================
  function generateMetaTags() {
    const url = elements.pageUrl.value;
    const title = elements.pageTitle.value;
    const description = elements.pageDescription.value;
    const image = elements.pageImage.value;
    const siteName = elements.siteName.value;
    const twitterHandle = elements.twitterHandle.value;
    const twitterCard = elements.twitterCard.value;

    if (!title) {
      ToolsCommon.showToast('Please enter a page title', 'error');
      return;
    }

    let metaTags = [];

    // Basic Meta Tags
    metaTags.push(`<title>${escapeHtml(title)}</title>`);
    if (description) {
      metaTags.push(`<meta name="description" content="${escapeHtml(description)}">`);
    }

    // Open Graph Tags
    metaTags.push('');
    metaTags.push('<!-- Open Graph / Facebook -->');
    metaTags.push('<meta property="og:type" content="website">');
    if (url) {
      metaTags.push(`<meta property="og:url" content="${escapeHtml(url)}">`);
    }
    metaTags.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
    if (description) {
      metaTags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
    }
    if (image) {
      metaTags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
    }
    if (siteName) {
      metaTags.push(`<meta property="og:site_name" content="${escapeHtml(siteName)}">`);
    }

    // Twitter Tags
    metaTags.push('');
    metaTags.push('<!-- Twitter -->');
    metaTags.push(`<meta property="twitter:card" content="${twitterCard}">`);
    if (url) {
      metaTags.push(`<meta property="twitter:url" content="${escapeHtml(url)}">`);
    }
    metaTags.push(`<meta property="twitter:title" content="${escapeHtml(title)}">`);
    if (description) {
      metaTags.push(`<meta property="twitter:description" content="${escapeHtml(description)}">`);
    }
    if (image) {
      metaTags.push(`<meta property="twitter:image" content="${escapeHtml(image)}">`);
    }
    if (twitterHandle) {
      const handle = twitterHandle.startsWith('@') ? twitterHandle : `@${twitterHandle}`;
      metaTags.push(`<meta name="twitter:site" content="${escapeHtml(handle)}">`);
      metaTags.push(`<meta name="twitter:creator" content="${escapeHtml(handle)}">`);
    }

    const output = metaTags.join('\n');
    elements.codeOutput.textContent = output;
    elements.codeSection.classList.remove('hidden');

    ToolsCommon.showToast('Meta tags generated', 'success');
  }

  // ==================== Escape HTML ====================
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // ==================== Copy Code ====================
  function copyCode() {
    const code = elements.codeOutput.textContent;
    ToolsCommon.copyWithToast(code, 'Copied meta tags');
  }

  // ==================== Initialize Event Listeners ====================
  function initEventListeners() {
    // Input events with debounced preview update
    const debouncedUpdate = ToolsCommon.debounce(() => {
      updateCharCounts();
      updatePreviews();
    }, 200);

    elements.pageUrl.addEventListener('input', debouncedUpdate);
    elements.pageTitle.addEventListener('input', debouncedUpdate);
    elements.pageDescription.addEventListener('input', debouncedUpdate);
    elements.pageImage.addEventListener('input', debouncedUpdate);
    elements.siteName.addEventListener('input', debouncedUpdate);
    elements.twitterHandle.addEventListener('input', debouncedUpdate);
    elements.twitterCard.addEventListener('change', debouncedUpdate);

    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Generate and copy
    elements.generateBtn.addEventListener('click', generateMetaTags);
    elements.copyCodeBtn.addEventListener('click', copyCode);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const isTyping = document.activeElement.tagName === 'INPUT' ||
                       document.activeElement.tagName === 'TEXTAREA';

      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateMetaTags();
        return;
      }

      if (isTyping) return;

      if (e.key === '1') switchTab('google');
      if (e.key === '2') switchTab('facebook');
      if (e.key === '3') switchTab('twitter');
      if (e.key === '4') switchTab('linkedin');
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    updateCharCounts();
    updatePreviews();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
