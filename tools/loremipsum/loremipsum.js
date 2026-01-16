/**
 * Lorem Ipsum Generator Tool
 * Generate placeholder text in various styles
 */

(function() {
  'use strict';

  // ==================== Text Libraries ====================
  const textLibraries = {
    classic: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident.',
      'Sunt in culpa qui officia deserunt mollit anim id est laborum.',
      'Curabitur pretium tincidunt lacus nulla gravida orci.',
      'Integer vitae libero ac risus egestas placerat.',
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere.',
      'Proin eget tortor risus cras ultricies ligula sed magna.',
      'Pellentesque habitant morbi tristique senectus et netus.',
      'Fames ac turpis egestas sed tempus urna et pharetra.',
      'Mauris blandit aliquet elit eget tincidunt nibh pulvinar.',
      'Vivamus suscipit tortor eget felis porttitor volutpat.'
    ],
    hipster: [
      'Artisan craft beer vinyl, helvetica ethical sustainable skateboard.',
      'Intelligentsia scenester chambray Brooklyn, kombucha four loko.',
      'Fixie PBR&B aesthetic actually, meditation vegan taxidermy.',
      'Dreamcatcher thundercats vinyl poke, portland enamel pin.',
      'Kinfolk tumeric selfies, raw denim chartreuse organic.',
      'Gentrify wayfarers yr, retro aesthetic deep v.',
      'Bushwick trust fund celiac, tacos bicycle rights.',
      'Gastropub plaid pitchfork, lo-fi normcore semiotics.',
      'Austin church-key sriracha, distillery letterpress brunch.',
      'Banjo la croix cronut, farm-to-table neutra drinking vinegar.',
      'Chia hammock asymmetrical beard cornhole selfies.',
      'Tousled umami succulents raclette, knausgaard poke sustainable.',
      'Venmo four loko food truck polaroid, coloring book direct trade.',
      'Microdosing slow-carb hella, salvia vape chartreuse.',
      'Palo santo snackwave taiyaki, air plant shabby chic.'
    ],
    business: [
      'Leverage agile frameworks to provide robust synopsis for high level overviews.',
      'Iterative approaches to corporate strategy foster collaborative thinking.',
      'Synergize scalable processes to further the overall value proposition.',
      'Organically grow the holistic world view of disruptive innovation.',
      'Bring to the table win-win survival strategies to ensure proactive domination.',
      'At the end of the day, going forward, new normal will require significant paradigm shifts.',
      'Capitalize on low hanging fruit to identify a ballpark value added activity.',
      'Proactively envisioned multimedia based expertise and cross-media growth strategies.',
      'Seamlessly visualize quality intellectual capital without superior collaboration.',
      'Professionally cultivate one-to-one customer service with robust ideas.',
      'Dynamically target high-payoff intellectual capital for customized technologies.',
      'Objectively innovate empowered manufactured products whereas parallel platforms.',
      'Holisticly predominate extensible testing procedures for reliable supply chains.',
      'Dramatically engage top-line web services vis-a-vis cutting-edge deliverables.',
      'Efficiently unleash cross-media information without cross-media value.'
    ],
    tech: [
      'Implementing machine learning algorithms for optimized data processing.',
      'Containerized microservices architecture enables seamless scalability.',
      'RESTful APIs facilitate efficient client-server communication.',
      'Cloud-native applications leverage serverless computing paradigms.',
      'DevOps practices streamline continuous integration and deployment.',
      'Kubernetes orchestration manages container lifecycle effectively.',
      'Neural networks enable sophisticated pattern recognition capabilities.',
      'Blockchain technology ensures immutable and transparent transactions.',
      'GraphQL queries optimize data fetching for modern applications.',
      'WebSocket connections enable real-time bidirectional communication.',
      'Edge computing reduces latency for time-critical applications.',
      'Infrastructure as code promotes reproducible environment configurations.',
      'Progressive web apps deliver native-like experiences on the web.',
      'Distributed systems ensure high availability and fault tolerance.',
      'Event-driven architecture enables loose coupling between services.'
    ]
  };

  const classicStart = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';

  // ==================== State ====================
  let generatedText = '';

  // ==================== DOM Elements ====================
  const elements = {
    tabs: document.querySelectorAll('.lorem-tab'),
    panels: document.querySelectorAll('.lorem-panel'),
    unitType: document.getElementById('unitType'),
    unitCount: document.getElementById('unitCount'),
    textStyle: document.getElementById('textStyle'),
    startWithLorem: document.getElementById('startWithLorem'),
    includeHtml: document.getElementById('includeHtml'),
    generateBtn: document.getElementById('generateBtn'),
    loremOutput: document.getElementById('loremOutput'),
    wordStats: document.getElementById('wordStats'),
    charStats: document.getElementById('charStats'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    previewFontSize: document.getElementById('previewFontSize'),
    previewLineHeight: document.getElementById('previewLineHeight'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    lineHeightValue: document.getElementById('lineHeightValue'),
    previewContent: document.getElementById('previewContent')
  };

  // ==================== Generate Text ====================
  function generateText() {
    const unitType = elements.unitType.value;
    const count = parseInt(elements.unitCount.value, 10) || 1;
    const style = elements.textStyle.value;
    const startWithLorem = elements.startWithLorem.checked;
    const includeHtml = elements.includeHtml.checked;

    const library = textLibraries[style];
    let result = '';

    switch (unitType) {
      case 'paragraphs':
        result = generateParagraphs(library, count, startWithLorem, includeHtml);
        break;
      case 'sentences':
        result = generateSentences(library, count, startWithLorem);
        break;
      case 'words':
        result = generateWords(library, count, startWithLorem);
        break;
    }

    generatedText = result;
    elements.loremOutput.value = result;
    updateStats();
    updatePreview();
    ToolsCommon.showToast('Generated successfully', 'success');
  }

  function generateParagraphs(library, count, startWithLorem, includeHtml) {
    const paragraphs = [];

    for (let i = 0; i < count; i++) {
      let paragraph = '';

      if (i === 0 && startWithLorem && library === textLibraries.classic) {
        paragraph = classicStart;
      }

      const sentenceCount = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < sentenceCount; j++) {
        paragraph += getRandomSentence(library) + ' ';
      }

      paragraphs.push(paragraph.trim());
    }

    if (includeHtml) {
      return paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
    }

    return paragraphs.join('\n\n');
  }

  function generateSentences(library, count, startWithLorem) {
    const sentences = [];

    if (startWithLorem && library === textLibraries.classic) {
      sentences.push(classicStart.trim());
      count--;
    }

    for (let i = 0; i < count; i++) {
      sentences.push(getRandomSentence(library));
    }

    return sentences.join(' ');
  }

  function generateWords(library, count, startWithLorem) {
    let text = '';

    if (startWithLorem && library === textLibraries.classic) {
      text = classicStart;
    }

    const allWords = library.join(' ').split(/\s+/);
    const neededWords = count - text.split(/\s+/).filter(w => w).length;

    for (let i = 0; i < neededWords; i++) {
      text += allWords[Math.floor(Math.random() * allWords.length)] + ' ';
    }

    // Trim to exact word count
    const words = text.split(/\s+/).filter(w => w).slice(0, count);
    return words.join(' ');
  }

  function getRandomSentence(library) {
    return library[Math.floor(Math.random() * library.length)];
  }

  // ==================== Update Stats ====================
  function updateStats() {
    const text = generatedText;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    elements.wordStats.textContent = words;
    elements.charStats.textContent = chars;
  }

  // ==================== Update Preview ====================
  function updatePreview() {
    if (!generatedText) {
      elements.previewContent.innerHTML = '<p class="placeholder">Generate text first to preview</p>';
      return;
    }

    const includeHtml = elements.includeHtml.checked;
    const unitType = elements.unitType.value;

    let html = '';
    if (includeHtml) {
      html = generatedText;
    } else if (unitType === 'paragraphs') {
      const paragraphs = generatedText.split('\n\n');
      html = paragraphs.map(p => `<p>${p}</p>`).join('');
    } else {
      html = `<p>${generatedText}</p>`;
    }

    elements.previewContent.innerHTML = html;
    applyPreviewStyles();
  }

  function applyPreviewStyles() {
    const fontSize = elements.previewFontSize.value;
    const lineHeight = elements.previewLineHeight.value;

    elements.previewContent.style.fontSize = fontSize + 'px';
    elements.previewContent.style.lineHeight = lineHeight;

    elements.fontSizeValue.textContent = fontSize + 'px';
    elements.lineHeightValue.textContent = lineHeight;
  }

  // ==================== Tab Switching ====================
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    elements.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
  }

  // ==================== Actions ====================
  function copyText() {
    if (!generatedText) {
      ToolsCommon.showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(generatedText, 'Copied to clipboard!');
  }

  function downloadText() {
    if (!generatedText) {
      ToolsCommon.showToast('Nothing to download', 'error');
      return;
    }

    const includeHtml = elements.includeHtml.checked;
    const ext = includeHtml ? 'html' : 'txt';
    const mimeType = includeHtml ? 'text/html' : 'text/plain';

    ToolsCommon.downloadText(generatedText, `lorem-ipsum.${ext}`, mimeType);
    ToolsCommon.showToast('Downloaded!', 'success');
  }

  // ==================== Event Listeners ====================
  function initEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Generate
    elements.generateBtn.addEventListener('click', generateText);
    elements.regenerateBtn.addEventListener('click', generateText);

    // Copy/Download
    elements.copyBtn.addEventListener('click', copyText);
    elements.downloadBtn.addEventListener('click', downloadText);

    // Preview controls
    elements.previewFontSize.addEventListener('input', applyPreviewStyles);
    elements.previewLineHeight.addEventListener('input', applyPreviewStyles);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select, textarea')) {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          generateText();
        }
        return;
      }

      switch (e.key) {
        case '1':
          switchTab('generator');
          break;
        case '2':
          switchTab('preview');
          break;
      }

      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateText();
      }
    });
  }

  // ==================== Initialize ====================
  function init() {
    initEventListeners();
    applyPreviewStyles();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
