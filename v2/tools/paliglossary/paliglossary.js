/**
 * KVSOVANREACH Pali Glossary Tool
 * Buddhist terminology reference with search
 */

(function() {
  'use strict';

  // ==================== Glossary Data ====================
  const GLOSSARY = [
    // Core Concepts
    {
      pali: 'Dukkha',
      english: 'Suffering / Unsatisfactoriness',
      etymology: 'From "du" (bad) + "kha" (space/hole in axle)',
      definition: 'The First Noble Truth. Refers to the inherent unsatisfactoriness of conditioned existence, including obvious suffering, impermanence of happiness, and the conditioned nature of all phenomena.',
      category: 'core'
    },
    {
      pali: 'Anicca',
      english: 'Impermanence',
      etymology: 'From "a" (not) + "nicca" (permanent)',
      definition: 'One of the three marks of existence. All conditioned phenomena are in constant flux and change. Nothing remains static; everything arises, persists for a time, and passes away.',
      category: 'core'
    },
    {
      pali: 'Anatta',
      english: 'Non-self / Not-self',
      etymology: 'From "an" (not) + "atta" (self/soul)',
      definition: 'One of the three marks of existence. There is no permanent, unchanging self or soul. What we consider "self" is a constantly changing collection of aggregates (khandhas).',
      category: 'core'
    },
    {
      pali: 'Nibbana',
      english: 'Nirvana / Extinguishment',
      etymology: 'From "ni" (out) + "vana" (blowing/craving)',
      definition: 'The ultimate goal of Buddhist practice. The extinguishment of greed, hatred, and delusion. Liberation from the cycle of rebirth and suffering.',
      category: 'core'
    },
    {
      pali: 'Samsara',
      english: 'Cycle of Rebirth',
      etymology: 'From "sam" (together) + "sarati" (to flow)',
      definition: 'The continuous cycle of birth, death, and rebirth driven by karma and craving. Beings wander through various realms until achieving liberation.',
      category: 'core'
    },
    {
      pali: 'Kamma',
      english: 'Karma / Action',
      etymology: 'From "kar" (to do/make)',
      definition: 'Intentional action through body, speech, or mind. Actions have consequences (vipaka) that shape future experiences and rebirths.',
      category: 'core'
    },
    {
      pali: 'Dhamma',
      english: 'Truth / Teaching / Phenomena',
      etymology: 'From "dhar" (to hold/support)',
      definition: 'Has multiple meanings: the Buddha\'s teaching, universal truth, natural law, or individual phenomena. The second of the Three Jewels.',
      category: 'core'
    },
    {
      pali: 'Sangha',
      english: 'Community / Assembly',
      etymology: 'From "sam" (together) + "han" (to come)',
      definition: 'The community of Buddhist practitioners. In narrow sense, the ordained monastics. In broader sense, all who follow the path. The third of the Three Jewels.',
      category: 'core'
    },

    // Practice
    {
      pali: 'Sila',
      english: 'Virtue / Morality',
      etymology: 'Related to "silana" (nature/character)',
      definition: 'Ethical conduct and moral discipline. The foundation of Buddhist practice, typically expressed through the Five Precepts for laypeople or the Vinaya rules for monastics.',
      category: 'practice'
    },
    {
      pali: 'Samadhi',
      english: 'Concentration / Stillness',
      etymology: 'From "sam" (together) + "a" (toward) + "dha" (to place)',
      definition: 'One-pointed concentration of mind. Mental unification achieved through meditation practice. The basis for developing wisdom.',
      category: 'practice'
    },
    {
      pali: 'Panna',
      english: 'Wisdom / Understanding',
      etymology: 'From "pa" (forth) + "janati" (to know)',
      definition: 'Direct insight into the true nature of reality. The understanding of the Four Noble Truths and the three characteristics of existence.',
      category: 'practice'
    },
    {
      pali: 'Bhavana',
      english: 'Mental Development / Meditation',
      etymology: 'From "bhu" (to become/develop)',
      definition: 'The cultivation or development of mind. General term for meditation practice including both samatha (calm) and vipassana (insight).',
      category: 'practice'
    },
    {
      pali: 'Sati',
      english: 'Mindfulness / Awareness',
      etymology: 'From "sar" (to remember)',
      definition: 'Present-moment awareness. The quality of being attentive to what is happening in the present. Central to meditation practice.',
      category: 'practice'
    },
    {
      pali: 'Vipassana',
      english: 'Insight Meditation',
      etymology: 'From "vi" (special) + "passana" (seeing)',
      definition: 'Insight meditation practice that develops wisdom through direct observation of the three characteristics: impermanence, suffering, and non-self.',
      category: 'practice'
    },
    {
      pali: 'Samatha',
      english: 'Calm / Tranquility',
      etymology: 'From "sam" (calm) + "tha" (to stand)',
      definition: 'Meditation practice aimed at developing mental calm and concentration. Often used as a preparation for vipassana practice.',
      category: 'practice'
    },
    {
      pali: 'Metta',
      english: 'Loving-kindness',
      etymology: 'From "mitta" (friend)',
      definition: 'Unconditional goodwill toward all beings. One of the four Brahmaviharas (divine abodes). Cultivated through specific meditation practice.',
      category: 'practice'
    },
    {
      pali: 'Karuna',
      english: 'Compassion',
      etymology: 'From "kar" (to do/act)',
      definition: 'The wish for beings to be free from suffering. One of the four Brahmaviharas. Compassion naturally arises from wisdom.',
      category: 'practice'
    },
    {
      pali: 'Dana',
      english: 'Generosity / Giving',
      etymology: 'From "da" (to give)',
      definition: 'The practice of giving and generosity. First of the ten paramis (perfections). Creates positive karma and reduces attachment.',
      category: 'practice'
    },

    // Mind & Mental
    {
      pali: 'Citta',
      english: 'Mind / Consciousness',
      etymology: 'From "cit" (to think/perceive)',
      definition: 'The knowing faculty of mind. Consciousness that cognizes objects. The basis for all mental activity.',
      category: 'mind'
    },
    {
      pali: 'Vedana',
      english: 'Feeling / Sensation',
      etymology: 'From "vid" (to know/experience)',
      definition: 'The feeling tone of experience: pleasant, unpleasant, or neutral. One of the five aggregates. Not emotion, but the basic quality of experience.',
      category: 'mind'
    },
    {
      pali: 'Sanna',
      english: 'Perception / Recognition',
      etymology: 'From "sam" (together) + "janati" (to know)',
      definition: 'The mental function that recognizes and interprets sense data. One of the five aggregates. Labels and categorizes experience.',
      category: 'mind'
    },
    {
      pali: 'Sankhara',
      english: 'Mental Formations / Volitional Activities',
      etymology: 'From "sam" (together) + "kar" (to do)',
      definition: 'Mental formations or volitional activities that shape experience and create karma. One of the five aggregates. Includes intentions, emotions, and mental factors.',
      category: 'mind'
    },
    {
      pali: 'Vinnana',
      english: 'Consciousness',
      etymology: 'From "vi" (special) + "janana" (knowing)',
      definition: 'Consciousness or awareness. One of the five aggregates. The knowing aspect of mind that cognizes objects through the six sense bases.',
      category: 'mind'
    },
    {
      pali: 'Kilesa',
      english: 'Defilements / Mental Impurities',
      etymology: 'From "kilissati" (to be afflicted)',
      definition: 'Mental impurities that cloud the mind. The three root defilements are greed (lobha), hatred (dosa), and delusion (moha).',
      category: 'mind'
    },
    {
      pali: 'Lobha',
      english: 'Greed / Attachment',
      etymology: 'From "lubh" (to desire)',
      definition: 'One of the three root defilements. The mental factor of craving, desire, and attachment. Leads to suffering through clinging.',
      category: 'mind'
    },
    {
      pali: 'Dosa',
      english: 'Hatred / Aversion',
      etymology: 'From "dus" (bad/ill)',
      definition: 'One of the three root defilements. The mental factor of aversion, anger, and ill-will. The opposite of metta.',
      category: 'mind'
    },
    {
      pali: 'Moha',
      english: 'Delusion / Ignorance',
      etymology: 'From "muh" (to be confused)',
      definition: 'One of the three root defilements. Fundamental ignorance of the true nature of reality. The root cause of all suffering.',
      category: 'mind'
    },
    {
      pali: 'Tanha',
      english: 'Craving / Thirst',
      etymology: 'From "tas" (to thirst)',
      definition: 'The Second Noble Truth identifies tanha as the cause of suffering. Three types: craving for sensual pleasure, craving for existence, craving for non-existence.',
      category: 'mind'
    },
    {
      pali: 'Upadana',
      english: 'Clinging / Attachment',
      etymology: 'From "upa" (near) + "a" (toward) + "da" (to take)',
      definition: 'Clinging or grasping. Intensified craving. Four types: clinging to sensual pleasure, views, rites and rituals, and self-doctrine.',
      category: 'mind'
    },

    // The Path
    {
      pali: 'Magga',
      english: 'Path / Way',
      etymology: 'From "magg" (to seek/track)',
      definition: 'The Fourth Noble Truth. The Noble Eightfold Path leading to the cessation of suffering.',
      category: 'path'
    },
    {
      pali: 'Samma Ditthi',
      english: 'Right View',
      etymology: 'Samma (right/proper) + Ditthi (view/understanding)',
      definition: 'First factor of the Noble Eightfold Path. Understanding the Four Noble Truths and the nature of reality.',
      category: 'path'
    },
    {
      pali: 'Samma Sankappa',
      english: 'Right Intention',
      etymology: 'Samma (right) + Sankappa (intention/thought)',
      definition: 'Second factor of the Noble Eightfold Path. Intentions of renunciation, goodwill, and harmlessness.',
      category: 'path'
    },
    {
      pali: 'Samma Vaca',
      english: 'Right Speech',
      etymology: 'Samma (right) + Vaca (speech)',
      definition: 'Third factor of the Noble Eightfold Path. Abstaining from lying, divisive speech, harsh speech, and idle chatter.',
      category: 'path'
    },
    {
      pali: 'Samma Kammanta',
      english: 'Right Action',
      etymology: 'Samma (right) + Kammanta (action)',
      definition: 'Fourth factor of the Noble Eightfold Path. Abstaining from killing, stealing, and sexual misconduct.',
      category: 'path'
    },
    {
      pali: 'Samma Ajiva',
      english: 'Right Livelihood',
      etymology: 'Samma (right) + Ajiva (livelihood)',
      definition: 'Fifth factor of the Noble Eightfold Path. Earning a living in ways that do not cause harm to others.',
      category: 'path'
    },
    {
      pali: 'Samma Vayama',
      english: 'Right Effort',
      etymology: 'Samma (right) + Vayama (effort)',
      definition: 'Sixth factor of the Noble Eightfold Path. Four aspects: preventing, abandoning, developing, and maintaining wholesome states.',
      category: 'path'
    },
    {
      pali: 'Samma Sati',
      english: 'Right Mindfulness',
      etymology: 'Samma (right) + Sati (mindfulness)',
      definition: 'Seventh factor of the Noble Eightfold Path. Mindful awareness of body, feelings, mind, and mental objects.',
      category: 'path'
    },
    {
      pali: 'Samma Samadhi',
      english: 'Right Concentration',
      etymology: 'Samma (right) + Samadhi (concentration)',
      definition: 'Eighth factor of the Noble Eightfold Path. Development of the four jhanas (meditative absorptions).',
      category: 'path'
    },
    {
      pali: 'Jhana',
      english: 'Meditative Absorption',
      etymology: 'From "jhe" (to think/meditate)',
      definition: 'Deep states of meditative absorption. Four form jhanas and four formless jhanas. Characterized by factors like applied thought, sustained thought, rapture, happiness, and equanimity.',
      category: 'path'
    },
    {
      pali: 'Sotapanna',
      english: 'Stream-enterer',
      etymology: 'From "sota" (stream) + "apanna" (entered)',
      definition: 'First stage of awakening. One who has entered the stream leading to Nibbana. Has abandoned the first three fetters and will be reborn at most seven more times.',
      category: 'path'
    },
    {
      pali: 'Arahant',
      english: 'Worthy One / Fully Awakened',
      etymology: 'From "araha" (worthy)',
      definition: 'Fourth and final stage of awakening. One who has completely eliminated all defilements and will not be reborn. The highest attainment in Theravada Buddhism.',
      category: 'path'
    },

    // Miscellaneous
    {
      pali: 'Buddha',
      english: 'Awakened One',
      etymology: 'From "budh" (to wake up/know)',
      definition: 'One who has awakened to the truth through their own efforts and teaches others. Refers to Siddhattha Gotama and other fully enlightened beings.',
      category: 'misc'
    },
    {
      pali: 'Bodhisatta',
      english: 'Being Seeking Enlightenment',
      etymology: 'From "bodhi" (awakening) + "satta" (being)',
      definition: 'In Theravada: one developing perfections to become a Buddha. In Mahayana: one who postpones final enlightenment to help all beings.',
      category: 'misc'
    },
    {
      pali: 'Paticcasamuppada',
      english: 'Dependent Origination',
      etymology: 'From "paticca" (dependent) + "samuppada" (arising)',
      definition: 'The teaching of dependent origination. Twelve links showing how suffering arises through conditions. Central to understanding causality in Buddhism.',
      category: 'misc'
    },
    {
      pali: 'Parami',
      english: 'Perfection / Excellence',
      etymology: 'From "parama" (highest/supreme)',
      definition: 'Perfections or virtues developed over lifetimes. Ten paramis: generosity, virtue, renunciation, wisdom, energy, patience, truthfulness, determination, loving-kindness, and equanimity.',
      category: 'misc'
    },
    {
      pali: 'Sutta',
      english: 'Discourse / Teaching',
      etymology: 'From "siv" (to sew/thread)',
      definition: 'A discourse of the Buddha. The second basket of the Tipitaka (Sutta Pitaka) contains thousands of suttas on various topics.',
      category: 'misc'
    },
    {
      pali: 'Vinaya',
      english: 'Discipline / Training',
      etymology: 'From "vi" (away) + "naya" (leading)',
      definition: 'The monastic code of conduct. The first basket of the Tipitaka containing rules and procedures for the Sangha.',
      category: 'misc'
    },
    {
      pali: 'Abhidhamma',
      english: 'Higher Teaching',
      etymology: 'From "abhi" (higher) + "dhamma" (teaching)',
      definition: 'The philosophical and psychological analysis of the Dhamma. The third basket of the Tipitaka, presenting systematic analysis of mind and matter.',
      category: 'misc'
    },
    {
      pali: 'Cetana',
      english: 'Intention / Volition',
      etymology: 'From "cit" (to intend)',
      definition: 'Mental volition or intention. The Buddha identified cetana as karma itself. The directing factor of mind that shapes actions.',
      category: 'mind'
    },
    {
      pali: 'Mudita',
      english: 'Sympathetic Joy',
      etymology: 'From "mud" (to rejoice)',
      definition: 'Joy in others\' happiness and success. One of the four Brahmaviharas. The antidote to jealousy and envy.',
      category: 'practice'
    },
    {
      pali: 'Upekkha',
      english: 'Equanimity',
      etymology: 'From "upa" (over) + "ikkh" (to look)',
      definition: 'Mental balance and impartiality. One of the four Brahmaviharas. Not indifference, but balanced awareness that does not cling or push away.',
      category: 'practice'
    }
  ];

  // ==================== State ====================
  const state = {
    searchMode: 'english', // 'english' or 'pali'
    activeCategory: 'all',
    searchQuery: ''
  };

  // ==================== DOM Elements ====================
  const elements = {
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    toggleModeBtn: document.getElementById('toggleModeBtn'),
    modeValue: document.getElementById('modeValue'),
    resultsCount: document.getElementById('resultsCount'),
    totalCount: document.getElementById('totalCount'),
    resultsList: document.getElementById('resultsList'),
    noResults: document.getElementById('noResults'),
    categoryTags: document.querySelectorAll('.category-tag')
  };

  // ==================== Core Functions ====================

  function filterGlossary() {
    const query = state.searchQuery.toLowerCase().trim();
    const category = state.activeCategory;

    return GLOSSARY.filter(term => {
      // Category filter
      if (category !== 'all' && term.category !== category) {
        return false;
      }

      // Search filter
      if (query) {
        if (state.searchMode === 'english') {
          return term.english.toLowerCase().includes(query) ||
                 term.definition.toLowerCase().includes(query);
        } else {
          return term.pali.toLowerCase().includes(query);
        }
      }

      return true;
    });
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getCategoryLabel(category) {
    const labels = {
      core: 'Core',
      practice: 'Practice',
      mind: 'Mind',
      path: 'Path',
      misc: 'Misc'
    };
    return labels[category] || category;
  }

  function renderResults() {
    const filtered = filterGlossary();
    const query = state.searchQuery.toLowerCase().trim();

    elements.resultsCount.textContent = filtered.length;
    elements.totalCount.textContent = GLOSSARY.length;

    if (filtered.length === 0) {
      elements.resultsList.innerHTML = '';
      elements.noResults.classList.add('visible');
      return;
    }

    elements.noResults.classList.remove('visible');

    elements.resultsList.innerHTML = filtered.map(term => {
      const paliText = state.searchMode === 'pali'
        ? highlightText(term.pali, query)
        : term.pali;
      const englishText = state.searchMode === 'english'
        ? highlightText(term.english, query)
        : term.english;
      const definitionText = state.searchMode === 'english'
        ? highlightText(term.definition, query)
        : term.definition;

      return `
        <div class="term-card">
          <div class="term-header">
            <div class="term-titles">
              <div class="term-pali">${paliText}</div>
              <div class="term-english">${englishText}</div>
            </div>
            <span class="term-category ${term.category}">${getCategoryLabel(term.category)}</span>
          </div>
          <div class="term-etymology">${term.etymology}</div>
          <div class="term-definition">${definitionText}</div>
        </div>
      `;
    }).join('');
  }

  function toggleSearchMode() {
    state.searchMode = state.searchMode === 'english' ? 'pali' : 'english';
    elements.modeValue.textContent = state.searchMode === 'english'
      ? 'English to Pali'
      : 'Pali to English';
    elements.searchInput.placeholder = state.searchMode === 'english'
      ? 'Type English term or definition...'
      : 'Type Pali term...';
    renderResults();
    ToolsCommon.Toast.show(`Search mode: ${elements.modeValue.textContent}`, 'info');
  }

  function setCategory(category) {
    state.activeCategory = category;
    elements.categoryTags.forEach(tag => {
      tag.classList.toggle('active', tag.dataset.category === category);
    });
    renderResults();
  }

  function clearSearch() {
    state.searchQuery = '';
    elements.searchInput.value = '';
    renderResults();
  }

  // ==================== Event Handlers ====================

  function handleSearchInput(e) {
    state.searchQuery = e.target.value;
    renderResults();
  }

  function handleCategoryClick(e) {
    const tag = e.target.closest('.category-tag');
    if (!tag) return;
    setCategory(tag.dataset.category);
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) {
      if (e.key === 'Escape') {
        clearSearch();
        elements.searchInput.blur();
      }
      return;
    }

    switch (e.key) {
      case '/':
        e.preventDefault();
        elements.searchInput.focus();
        break;
      case 'm':
      case 'M':
        toggleSearchMode();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    setupEventListeners();
    renderResults();
  }

  function setupEventListeners() {
    elements.searchInput?.addEventListener('input', ToolsCommon.debounce(handleSearchInput, 150));
    elements.clearSearchBtn?.addEventListener('click', clearSearch);
    elements.toggleModeBtn?.addEventListener('click', toggleSearchMode);

    elements.categoryTags.forEach(tag => {
      tag.addEventListener('click', handleCategoryClick);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
