/**
 * KVSOVANREACH Cookie Policy Generator
 * Generate GDPR-compliant cookie policies
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    // Website info
    websiteName: document.getElementById('websiteName'),
    websiteUrl: document.getElementById('websiteUrl'),
    companyName: document.getElementById('companyName'),
    contactEmail: document.getElementById('contactEmail'),

    // Cookie types
    essentialCookies: document.getElementById('essentialCookies'),
    performanceCookies: document.getElementById('performanceCookies'),
    functionalCookies: document.getElementById('functionalCookies'),
    targetingCookies: document.getElementById('targetingCookies'),

    // Third-party services
    googleAnalytics: document.getElementById('googleAnalytics'),
    googleAds: document.getElementById('googleAds'),
    facebook: document.getElementById('facebook'),
    hotjar: document.getElementById('hotjar'),
    intercom: document.getElementById('intercom'),
    stripe: document.getElementById('stripe'),

    // Options
    gdprCompliance: document.getElementById('gdprCompliance'),
    ccpaCompliance: document.getElementById('ccpaCompliance'),
    includeDataRetention: document.getElementById('includeDataRetention'),
    includeUserRights: document.getElementById('includeUserRights'),

    // Actions
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    copyHtmlBtn: document.getElementById('copyHtmlBtn'),
    copyTextBtn: document.getElementById('copyTextBtn'),

    // Output
    outputSection: document.getElementById('outputSection'),
    outputPreview: document.getElementById('outputPreview')
  };

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

  function generate() {
    if (!elements.websiteName.value.trim()) {
      if (typeof ToolsCommon !== 'undefined') {
        ToolsCommon.Toast.error('Please enter a website name');
      }
      elements.websiteName.focus();
      return;
    }

    const data = getFormData();
    const html = generatePolicy(data);

    elements.outputPreview.innerHTML = html;
    elements.outputSection.classList.remove('hidden');

    // Scroll to output
    elements.outputSection.scrollIntoView({ behavior: 'smooth' });

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.success('Cookie policy generated!');
    }
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

    elements.outputSection.classList.add('hidden');

    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Toast.info('Form reset');
    }
  }

  function copyHtml() {
    const html = elements.outputPreview.innerHTML;
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Clipboard.copy(html);
    }
  }

  function copyText() {
    const text = elements.outputPreview.innerText;
    if (typeof ToolsCommon !== 'undefined') {
      ToolsCommon.Clipboard.copy(text);
    }
  }

  // ==================== Event Handlers ====================

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generate();
      return;
    }

    if (e.target.tagName === 'INPUT') return;

    if (e.key.toLowerCase() === 'r') {
      reset();
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Generate button
    elements.generateBtn.addEventListener('click', generate);

    // Reset button
    elements.resetBtn.addEventListener('click', reset);

    // Copy buttons
    elements.copyHtmlBtn.addEventListener('click', copyHtml);
    elements.copyTextBtn.addEventListener('click', copyText);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
