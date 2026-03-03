/**
 * KVSOVANREACH Cookie Policy Generator
 * Refactored to follow Color Picker design pattern
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    activeTab: 'editor',
    hasGenerated: false
  };

  // ==================== Templates ====================
  const TEMPLATES = {
    basic: {
      name: 'Basic Website',
      websiteName: 'My Website',
      websiteUrl: 'https://example.com',
      companyName: '',
      contactEmail: '',
      cookies: { performance: false, functional: false, targeting: false },
      services: { googleAnalytics: false, googleAds: false, facebook: false, hotjar: false, intercom: false, stripe: false },
      options: { gdpr: true, ccpa: false, dataRetention: false, userRights: true }
    },
    blog: {
      name: 'Blog/Content Site',
      websiteName: 'My Blog',
      websiteUrl: 'https://myblog.com',
      companyName: '',
      contactEmail: '',
      cookies: { performance: true, functional: true, targeting: false },
      services: { googleAnalytics: true, googleAds: false, facebook: false, hotjar: false, intercom: false, stripe: false },
      options: { gdpr: true, ccpa: false, dataRetention: true, userRights: true }
    },
    ecommerce: {
      name: 'E-Commerce Store',
      websiteName: 'My Store',
      websiteUrl: 'https://mystore.com',
      companyName: 'My Store Inc.',
      contactEmail: 'privacy@mystore.com',
      cookies: { performance: true, functional: true, targeting: true },
      services: { googleAnalytics: true, googleAds: true, facebook: true, hotjar: false, intercom: false, stripe: true },
      options: { gdpr: true, ccpa: true, dataRetention: true, userRights: true }
    },
    saas: {
      name: 'SaaS Application',
      websiteName: 'My App',
      websiteUrl: 'https://myapp.com',
      companyName: 'My App Inc.',
      contactEmail: 'support@myapp.com',
      cookies: { performance: true, functional: true, targeting: false },
      services: { googleAnalytics: true, googleAds: false, facebook: false, hotjar: true, intercom: true, stripe: true },
      options: { gdpr: true, ccpa: true, dataRetention: true, userRights: true }
    },
    marketing: {
      name: 'Marketing Site',
      websiteName: 'My Brand',
      websiteUrl: 'https://mybrand.com',
      companyName: 'My Brand LLC',
      contactEmail: 'hello@mybrand.com',
      cookies: { performance: true, functional: true, targeting: true },
      services: { googleAnalytics: true, googleAds: true, facebook: true, hotjar: true, intercom: false, stripe: false },
      options: { gdpr: true, ccpa: true, dataRetention: true, userRights: true }
    },
    minimal: {
      name: 'Privacy-Focused',
      websiteName: 'My Site',
      websiteUrl: 'https://mysite.com',
      companyName: '',
      contactEmail: 'privacy@mysite.com',
      cookies: { performance: false, functional: false, targeting: false },
      services: { googleAnalytics: false, googleAds: false, facebook: false, hotjar: false, intercom: false, stripe: false },
      options: { gdpr: true, ccpa: true, dataRetention: false, userRights: true }
    }
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    // Tabs
    elements.tabs = document.querySelectorAll('.tool-tab');
    elements.panels = document.querySelectorAll('.cookie-panel');
    elements.cookieMain = document.querySelector('.cookie-main');

    // Website info
    elements.websiteName = document.getElementById('websiteName');
    elements.websiteUrl = document.getElementById('websiteUrl');
    elements.companyName = document.getElementById('companyName');
    elements.contactEmail = document.getElementById('contactEmail');

    // Cookie types
    elements.essentialCookies = document.getElementById('essentialCookies');
    elements.performanceCookies = document.getElementById('performanceCookies');
    elements.functionalCookies = document.getElementById('functionalCookies');
    elements.targetingCookies = document.getElementById('targetingCookies');

    // Third-party services
    elements.googleAnalytics = document.getElementById('googleAnalytics');
    elements.googleAds = document.getElementById('googleAds');
    elements.facebook = document.getElementById('facebook');
    elements.hotjar = document.getElementById('hotjar');
    elements.intercom = document.getElementById('intercom');
    elements.stripe = document.getElementById('stripe');

    // Options
    elements.gdprCompliance = document.getElementById('gdprCompliance');
    elements.ccpaCompliance = document.getElementById('ccpaCompliance');
    elements.includeDataRetention = document.getElementById('includeDataRetention');
    elements.includeUserRights = document.getElementById('includeUserRights');

    // Status
    elements.statusWebsite = document.getElementById('statusWebsite');
    elements.statusCookies = document.getElementById('statusCookies');
    elements.statusServices = document.getElementById('statusServices');
    elements.statusCompliance = document.getElementById('statusCompliance');
    elements.complianceBadges = document.getElementById('complianceBadges');

    // Actions
    elements.generateBtn = document.getElementById('generateBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.copyHtmlBtn = document.getElementById('copyHtmlBtn');
    elements.copyTextBtn = document.getElementById('copyTextBtn');

    // Preview
    elements.previewContent = document.getElementById('previewContent');

    // Templates
    elements.templatesGrid = document.getElementById('templatesGrid');
  }

  // ==================== Tab Navigation ====================
  function initTabs() {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.panels.forEach(p => p.classList.remove('active'));

    const tab = document.querySelector(`.tool-tab[data-tab="${tabName}"]`);
    if (tab) {
      tab.classList.add('active');
      document.getElementById(tabName + 'Panel').classList.add('active');
      state.activeTab = tabName;

      // Toggle full-width layout for Templates tab
      const isFullWidth = tabName === 'templates';
      elements.cookieMain.classList.toggle('full-width', isFullWidth);
    }
  }

  // ==================== Core Functions ====================
  function getFormData() {
    return {
      websiteName: elements.websiteName.value.trim() || 'Our Website',
      websiteUrl: elements.websiteUrl.value.trim() || 'https://example.com',
      companyName: elements.companyName.value.trim() || 'Our Company',
      contactEmail: elements.contactEmail.value.trim() || 'privacy@example.com',
      cookies: {
        essential: true,
        performance: elements.performanceCookies.checked,
        functional: elements.functionalCookies.checked,
        targeting: elements.targetingCookies.checked
      },
      services: {
        googleAnalytics: elements.googleAnalytics.checked,
        googleAds: elements.googleAds.checked,
        facebook: elements.facebook.checked,
        hotjar: elements.hotjar.checked,
        intercom: elements.intercom.checked,
        stripe: elements.stripe.checked
      },
      options: {
        gdpr: elements.gdprCompliance.checked,
        ccpa: elements.ccpaCompliance.checked,
        dataRetention: elements.includeDataRetention.checked,
        userRights: elements.includeUserRights.checked
      }
    };
  }

  function generatePolicy(data) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let html = `<h1>Cookie Policy for ${data.websiteName}</h1>
<p><strong>Last updated:</strong> ${date}</p>

<h2>What Are Cookies</h2>
<p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.</p>

<h2>How We Use Cookies</h2>
<p>${data.websiteName} uses cookies to enhance your browsing experience and provide personalized services. By using our website, you consent to the use of cookies in accordance with this policy.</p>

<h2>Types of Cookies We Use</h2>

<h3>Essential Cookies</h3>
<p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies as they are essential for the operation of the website.</p>`;

    if (data.cookies.performance) {
      html += `

<h3>Performance Cookies</h3>
<p>These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us improve the website's performance and user experience. All information collected is aggregated and anonymous.</p>`;
    }

    if (data.cookies.functional) {
      html += `

<h3>Functional Cookies</h3>
<p>These cookies allow the website to remember choices you make (such as your language preference or the region you are in) and provide enhanced, personalized features.</p>`;
    }

    if (data.cookies.targeting) {
      html += `

<h3>Targeting/Advertising Cookies</h3>
<p>These cookies are used to deliver advertisements that are relevant to you and your interests. They also help limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.</p>`;
    }

    // Third-party services
    const services = [];
    if (data.services.googleAnalytics) services.push('Google Analytics for website analytics');
    if (data.services.googleAds) services.push('Google Ads for advertising');
    if (data.services.facebook) services.push('Facebook Pixel for advertising and analytics');
    if (data.services.hotjar) services.push('Hotjar for behavior analytics');
    if (data.services.intercom) services.push('Intercom for customer support');
    if (data.services.stripe) services.push('Stripe for payment processing');

    if (services.length > 0) {
      html += `

<h2>Third-Party Services</h2>
<p>We use the following third-party services that may set cookies:</p>
<ul>
${services.map(s => `  <li>${s}</li>`).join('\n')}
</ul>
<p>These third parties have their own privacy policies and cookie practices.</p>`;
    }

    if (data.options.dataRetention) {
      html += `

<h2>Data Retention</h2>
<p>Cookie data is retained for varying periods depending on the type of cookie:</p>
<ul>
  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
  <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 1-2 years) or until you delete them</li>
  <li><strong>Analytics data:</strong> Typically retained for 26 months</li>
</ul>`;
    }

    html += `

<h2>Managing Cookies</h2>
<p>You can control and manage cookies in various ways:</p>
<ul>
  <li><strong>Browser settings:</strong> Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites.</li>
  <li><strong>Cookie consent tools:</strong> You can change your cookie preferences on our website at any time.</li>
</ul>
<p>Please note that disabling certain cookies may impact the functionality of our website.</p>`;

    if (data.options.userRights) {
      html += `

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Know what data we collect about you</li>
  <li>Request access to your personal data</li>
  <li>Request correction of your personal data</li>
  <li>Request deletion of your personal data</li>
  <li>Withdraw consent at any time</li>
</ul>`;
    }

    if (data.options.gdpr) {
      html += `

<h2>GDPR Compliance</h2>
<p>For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). We obtain your consent before placing non-essential cookies and provide you with the ability to manage your cookie preferences.</p>`;
    }

    if (data.options.ccpa) {
      html += `

<h2>CCPA Compliance</h2>
<p>For California residents, we comply with the California Consumer Privacy Act (CCPA). You have the right to know what personal information is collected, request deletion of your information, and opt-out of the sale of your personal information.</p>`;
    }

    html += `

<h2>Contact Us</h2>
<p>If you have any questions about our Cookie Policy, please contact us:</p>
<ul>
  <li><strong>Email:</strong> ${data.contactEmail}</li>
  <li><strong>Website:</strong> ${data.websiteUrl}</li>
</ul>`;

    return html;
  }

  // ==================== UI Functions ====================
  function updateStatus() {
    // Website name
    const name = elements.websiteName.value.trim();
    elements.statusWebsite.textContent = name ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : '-';

    // Cookie types count
    let cookieCount = 1; // Essential is always 1
    if (elements.performanceCookies.checked) cookieCount++;
    if (elements.functionalCookies.checked) cookieCount++;
    if (elements.targetingCookies.checked) cookieCount++;
    elements.statusCookies.textContent = cookieCount;

    // Services count
    let serviceCount = 0;
    if (elements.googleAnalytics.checked) serviceCount++;
    if (elements.googleAds.checked) serviceCount++;
    if (elements.facebook.checked) serviceCount++;
    if (elements.hotjar.checked) serviceCount++;
    if (elements.intercom.checked) serviceCount++;
    if (elements.stripe.checked) serviceCount++;
    elements.statusServices.textContent = serviceCount;

    // Compliance
    const gdpr = elements.gdprCompliance.checked;
    const ccpa = elements.ccpaCompliance.checked;
    let compliance = [];
    if (gdpr) compliance.push('GDPR');
    if (ccpa) compliance.push('CCPA');
    elements.statusCompliance.textContent = compliance.length > 0 ? compliance.join('+') : 'None';

    // Update badges
    updateComplianceBadges(gdpr, ccpa);
  }

  function updateComplianceBadges(gdpr, ccpa) {
    const gdprBadge = elements.complianceBadges.querySelector('[data-type="gdpr"]');
    const ccpaBadge = elements.complianceBadges.querySelector('[data-type="ccpa"]');

    if (gdprBadge) {
      gdprBadge.classList.toggle('active', gdpr);
      gdprBadge.innerHTML = gdpr ? '<i class="fa-solid fa-check"></i> GDPR' : '<i class="fa-solid fa-xmark"></i> GDPR';
    }
    if (ccpaBadge) {
      ccpaBadge.classList.toggle('active', ccpa);
      ccpaBadge.innerHTML = ccpa ? '<i class="fa-solid fa-check"></i> CCPA' : '<i class="fa-solid fa-xmark"></i> CCPA';
    }
  }

  function generate() {
    if (!elements.websiteName.value.trim()) {
      ToolsCommon.showToast('Please enter a website name', 'error');
      elements.websiteName.focus();
      return;
    }

    const data = getFormData();
    const html = generatePolicy(data);

    elements.previewContent.innerHTML = html;
    state.hasGenerated = true;

    // Switch to preview tab
    switchTab('preview');
    ToolsCommon.showToast('Cookie policy generated!', 'success');
  }

  function reset() {
    elements.websiteName.value = '';
    elements.websiteUrl.value = '';
    elements.companyName.value = '';
    elements.contactEmail.value = '';

    elements.performanceCookies.checked = false;
    elements.functionalCookies.checked = false;
    elements.targetingCookies.checked = false;

    elements.googleAnalytics.checked = false;
    elements.googleAds.checked = false;
    elements.facebook.checked = false;
    elements.hotjar.checked = false;
    elements.intercom.checked = false;
    elements.stripe.checked = false;

    elements.gdprCompliance.checked = true;
    elements.ccpaCompliance.checked = false;
    elements.includeDataRetention.checked = false;
    elements.includeUserRights.checked = true;

    elements.previewContent.innerHTML = `
      <div class="preview-placeholder">
        <i class="fa-solid fa-file-lines"></i>
        <p>Fill in the form in the Editor tab and click Generate</p>
      </div>
    `;
    state.hasGenerated = false;

    updateStatus();
    ToolsCommon.showToast('Form reset', 'info');
  }

  function copyPolicy() {
    if (!state.hasGenerated) {
      ToolsCommon.showToast('Generate a policy first', 'error');
      return;
    }
    const text = elements.previewContent.innerText;
    ToolsCommon.copyWithToast(text, 'Policy copied!');
  }

  function copyHtml() {
    if (!state.hasGenerated) {
      ToolsCommon.showToast('Generate a policy first', 'error');
      return;
    }
    const html = elements.previewContent.innerHTML;
    ToolsCommon.copyWithToast(html, 'HTML copied!');
  }

  function copyText() {
    if (!state.hasGenerated) {
      ToolsCommon.showToast('Generate a policy first', 'error');
      return;
    }
    const text = elements.previewContent.innerText;
    ToolsCommon.copyWithToast(text, 'Text copied!');
  }

  function loadTemplate(templateName) {
    const template = TEMPLATES[templateName];
    if (!template) return;

    elements.websiteName.value = template.websiteName;
    elements.websiteUrl.value = template.websiteUrl;
    elements.companyName.value = template.companyName;
    elements.contactEmail.value = template.contactEmail;

    elements.performanceCookies.checked = template.cookies.performance;
    elements.functionalCookies.checked = template.cookies.functional;
    elements.targetingCookies.checked = template.cookies.targeting;

    elements.googleAnalytics.checked = template.services.googleAnalytics;
    elements.googleAds.checked = template.services.googleAds;
    elements.facebook.checked = template.services.facebook;
    elements.hotjar.checked = template.services.hotjar;
    elements.intercom.checked = template.services.intercom;
    elements.stripe.checked = template.services.stripe;

    elements.gdprCompliance.checked = template.options.gdpr;
    elements.ccpaCompliance.checked = template.options.ccpa;
    elements.includeDataRetention.checked = template.options.dataRetention;
    elements.includeUserRights.checked = template.options.userRights;

    updateStatus();
    switchTab('editor');
    ToolsCommon.showToast(`${template.name} template loaded!`, 'success');
  }

  // ==================== Event Bindings ====================
  function bindEvents() {
    // Form inputs - update status
    const inputs = document.querySelectorAll('#editorPanel input');
    inputs.forEach(input => {
      input.addEventListener('change', updateStatus);
      input.addEventListener('input', updateStatus);
    });

    // Quick action buttons
    elements.generateBtn.addEventListener('click', generate);
    elements.copyBtn.addEventListener('click', copyPolicy);
    elements.resetBtn.addEventListener('click', reset);

    // Preview action buttons
    elements.copyHtmlBtn.addEventListener('click', copyHtml);
    elements.copyTextBtn.addEventListener('click', copyText);

    // Template cards
    elements.templatesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      if (card) {
        loadTemplate(card.dataset.template);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'g':
        e.preventDefault();
        generate();
        break;

      case 'c':
        e.preventDefault();
        copyPolicy();
        break;

      case 'r':
        e.preventDefault();
        reset();
        break;

      case '1':
        e.preventDefault();
        switchTab('editor');
        break;

      case '2':
        e.preventDefault();
        switchTab('preview');
        break;

      case '3':
        e.preventDefault();
        switchTab('templates');
        break;
    }
  }

  // ==================== Initialize ====================
  function init() {
    initElements();
    initTabs();
    bindEvents();
    updateStatus();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
