/**
 * KVSOVANREACH Word Association Game
 * Semantic distance word guessing game
 */

(function() {
  'use strict';

  // ==================== Word Database ====================
  // Pre-computed semantic relationships
  const WORD_DATABASE = {
    ocean: {
      related: {
        sea: 95, water: 90, wave: 88, beach: 85, marine: 85, fish: 80, blue: 78,
        deep: 75, salt: 75, tide: 75, surf: 72, coral: 70, shark: 70, whale: 70,
        dolphin: 68, swim: 65, boat: 62, ship: 60, island: 58, pacific: 55,
        atlantic: 55, coast: 55, sand: 50, dive: 48, underwater: 48, tropical: 45,
        current: 42, storm: 40, vast: 38, aquatic: 35, seaweed: 32, pearl: 30
      },
      hint: 'Think about what you find in or near large bodies of water',
      category: 'Nature'
    },
    fire: {
      related: {
        flame: 95, burn: 92, hot: 90, heat: 88, smoke: 85, blaze: 82, warm: 78,
        red: 75, orange: 72, ash: 70, spark: 70, ember: 68, campfire: 65,
        bonfire: 65, firewood: 62, torch: 60, inferno: 58, combustion: 55,
        firefighter: 52, wildfire: 50, grill: 48, candle: 45, light: 42,
        danger: 40, destroy: 38, passion: 35, energy: 32, phoenix: 30
      },
      hint: 'Think about combustion, temperature, and things that burn',
      category: 'Elements'
    },
    music: {
      related: {
        song: 95, melody: 92, rhythm: 90, sound: 88, instrument: 85, sing: 82,
        guitar: 80, piano: 80, drum: 78, beat: 78, concert: 75, band: 75,
        musician: 72, note: 70, harmony: 70, tune: 68, compose: 65, listen: 62,
        dance: 60, rock: 58, jazz: 58, classical: 55, pop: 52, artist: 50,
        album: 48, lyrics: 45, radio: 42, speaker: 40, headphones: 38, vinyl: 35
      },
      hint: 'Think about sounds, instruments, and performance',
      category: 'Art'
    },
    forest: {
      related: {
        tree: 95, woods: 92, jungle: 88, nature: 85, green: 82, leaf: 80,
        wildlife: 78, plant: 75, pine: 72, oak: 70, branch: 68, bark: 65,
        hiking: 62, trail: 60, mushroom: 58, deer: 55, bear: 55, bird: 52,
        squirrel: 50, moss: 48, shade: 45, wilderness: 42, rainforest: 40,
        ecosystem: 38, canopy: 35, timber: 32, log: 30, camping: 28
      },
      hint: 'Think about trees, woodland creatures, and nature',
      category: 'Nature'
    },
    computer: {
      related: {
        technology: 95, software: 92, hardware: 90, code: 88, program: 85,
        laptop: 85, desktop: 82, keyboard: 80, mouse: 78, screen: 78,
        monitor: 75, processor: 72, memory: 70, data: 68, internet: 65,
        digital: 65, electronic: 62, programmer: 60, developer: 58, app: 55,
        system: 52, network: 50, server: 48, database: 45, algorithm: 42,
        binary: 40, chip: 38, silicon: 35, tech: 32, computing: 30
      },
      hint: 'Think about technology, programming, and digital devices',
      category: 'Technology'
    },
    love: {
      related: {
        heart: 95, romance: 92, affection: 90, care: 88, relationship: 85,
        passion: 82, emotion: 80, kiss: 78, hug: 75, family: 72, friend: 70,
        partner: 68, marriage: 65, wedding: 62, valentine: 60, couple: 58,
        devotion: 55, attachment: 52, bond: 50, warmth: 48, feeling: 45,
        happiness: 42, joy: 40, intimate: 38, tender: 35, cherish: 32
      },
      hint: 'Think about emotions, relationships, and affection',
      category: 'Emotions'
    },
    space: {
      related: {
        star: 95, galaxy: 92, universe: 90, planet: 88, astronaut: 85,
        rocket: 82, moon: 80, sun: 78, astronomy: 75, cosmos: 75, orbit: 72,
        satellite: 70, nasa: 68, telescope: 65, alien: 62, meteor: 60,
        asteroid: 58, comet: 55, mars: 52, jupiter: 50, spacecraft: 48,
        gravity: 45, black: 42, hole: 40, nebula: 38, void: 35, infinite: 32
      },
      hint: 'Think about the cosmos, celestial bodies, and exploration',
      category: 'Science'
    },
    food: {
      related: {
        eat: 95, meal: 92, cook: 90, restaurant: 88, hungry: 85, taste: 82,
        delicious: 80, kitchen: 78, recipe: 75, chef: 72, dinner: 70,
        lunch: 68, breakfast: 65, snack: 62, fruit: 60, vegetable: 58,
        meat: 55, bread: 52, rice: 50, pasta: 48, pizza: 45, burger: 42,
        nutrition: 40, appetite: 38, cuisine: 35, gourmet: 32, flavor: 30
      },
      hint: 'Think about eating, cooking, and meals',
      category: 'Daily Life'
    },
    money: {
      related: {
        cash: 95, currency: 92, dollar: 90, bank: 88, rich: 85, wealth: 82,
        finance: 80, pay: 78, buy: 75, sell: 72, invest: 70, economy: 68,
        business: 65, profit: 62, income: 60, salary: 58, budget: 55,
        credit: 52, debt: 50, loan: 48, stock: 45, coin: 42, bill: 40,
        wallet: 38, savings: 35, expensive: 32, cheap: 30, price: 28
      },
      hint: 'Think about finances, economics, and transactions',
      category: 'Business'
    },
    dream: {
      related: {
        sleep: 95, imagination: 92, fantasy: 90, nightmare: 88, wish: 85,
        hope: 82, aspiration: 80, vision: 78, subconscious: 75, rest: 72,
        night: 70, bed: 68, pillow: 65, surreal: 62, goal: 60, ambition: 58,
        desire: 55, wonder: 52, magic: 50, floating: 48, flying: 45,
        adventure: 42, journey: 40, mind: 38, thought: 35, escape: 32
      },
      hint: 'Think about sleep, aspirations, and imagination',
      category: 'Mind'
    },
    mountain: {
      related: {
        peak: 95, climb: 92, hill: 90, summit: 88, rock: 85, hiking: 82,
        altitude: 80, snow: 78, valley: 75, cliff: 72, steep: 70,
        everest: 68, alps: 65, range: 62, trail: 60, nature: 58, view: 55,
        landscape: 52, terrain: 50, adventure: 48, outdoor: 45, camp: 42,
        cold: 40, high: 38, elevation: 35, glacier: 32, slope: 30
      },
      hint: 'Think about high terrain, climbing, and landscapes',
      category: 'Nature'
    },
    time: {
      related: {
        clock: 95, hour: 92, minute: 90, second: 88, watch: 85, calendar: 82,
        date: 80, schedule: 78, past: 75, future: 75, present: 72, moment: 70,
        history: 68, forever: 65, temporary: 62, eternal: 60, age: 58,
        period: 55, era: 52, decade: 50, century: 48, duration: 45,
        deadline: 42, timer: 40, alarm: 38, wait: 35, patience: 32
      },
      hint: 'Think about clocks, duration, and temporal concepts',
      category: 'Concepts'
    },
    // Additional words
    city: {
      related: {
        urban: 95, town: 92, downtown: 90, metro: 88, building: 85, street: 82,
        traffic: 80, skyscraper: 78, population: 75, suburb: 72, commute: 70,
        infrastructure: 68, public: 65, apartment: 62, bus: 60, taxi: 58,
        nightlife: 55, park: 52, mall: 50, business: 48, office: 45
      },
      hint: 'Think about urban areas and metropolitan life',
      category: 'Places'
    },
    book: {
      related: {
        read: 95, story: 92, novel: 90, author: 88, page: 85, chapter: 82,
        library: 80, literature: 78, fiction: 75, writing: 72, publish: 70,
        cover: 68, bookmark: 65, reader: 62, shelf: 60, edition: 58,
        bestseller: 55, series: 52, plot: 50, character: 48, genre: 45
      },
      hint: 'Think about reading and literature',
      category: 'Knowledge'
    },
    game: {
      related: {
        play: 95, fun: 92, sport: 90, video: 88, board: 85, player: 82,
        win: 80, lose: 78, competition: 75, rules: 72, team: 70,
        score: 68, level: 65, challenge: 62, strategy: 60, puzzle: 58,
        controller: 55, console: 52, arcade: 50, multiplayer: 48, tournament: 45
      },
      hint: 'Think about playing, competition, and entertainment',
      category: 'Entertainment'
    },
    coffee: {
      related: {
        cafe: 95, espresso: 92, caffeine: 90, brew: 88, bean: 85, roast: 82,
        morning: 80, cup: 78, mug: 75, latte: 72, cappuccino: 70,
        barista: 68, shop: 65, aroma: 62, drink: 60, energy: 58,
        black: 55, cream: 52, sugar: 50, hot: 48, break: 45
      },
      hint: 'Think about the popular caffeinated beverage',
      category: 'Daily Life'
    },
    art: {
      related: {
        painting: 95, artist: 92, canvas: 90, gallery: 88, museum: 85, creative: 82,
        sculpture: 80, drawing: 78, design: 75, color: 72, expression: 70,
        masterpiece: 68, brush: 65, portrait: 62, abstract: 60, modern: 58,
        exhibition: 55, style: 52, talent: 50, beauty: 48, inspiration: 45
      },
      hint: 'Think about creative expression and visual culture',
      category: 'Art'
    },
    health: {
      related: {
        wellness: 95, medical: 92, doctor: 90, hospital: 88, fitness: 85, exercise: 82,
        nutrition: 80, diet: 78, vitamin: 75, medicine: 72, immune: 70,
        body: 68, mental: 65, sleep: 62, stress: 60, checkup: 58,
        healthy: 55, care: 52, prevention: 50, recovery: 48, therapy: 45
      },
      hint: 'Think about physical and mental well-being',
      category: 'Life'
    }
  };

  // ==================== State ====================
  const state = {
    currentWord: null,
    guesses: [],
    bestMatch: 0,
    totalScore: 0,
    hintsUsed: 0
  };

  // ==================== DOM Elements ====================
  const elements = {
    targetWord: document.getElementById('targetWord'),
    targetHint: document.getElementById('targetHint'),
    guessInput: document.getElementById('guessInput'),
    submitBtn: document.getElementById('submitBtn'),
    bestMatch: document.getElementById('bestMatch'),
    guessCount: document.getElementById('guessCount'),
    totalScore: document.getElementById('totalScore'),
    similarityValue: document.getElementById('similarityValue'),
    similarityFill: document.getElementById('similarityFill'),
    similarityFeedback: document.getElementById('similarityFeedback'),
    historyList: document.getElementById('historyList'),
    hintBtn: document.getElementById('hintBtn'),
    newWordBtn: document.getElementById('newWordBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };

  // ==================== Game Logic ====================

  function getRandomWord() {
    const words = Object.keys(WORD_DATABASE);
    return words[Math.floor(Math.random() * words.length)];
  }

  function calculateSimilarity(guess, target) {
    const normalizedGuess = guess.toLowerCase().trim();
    const targetData = WORD_DATABASE[target];

    // Exact match with target
    if (normalizedGuess === target) {
      return 100;
    }

    // Check if it's in the related words
    if (targetData.related[normalizedGuess]) {
      return targetData.related[normalizedGuess];
    }

    // Check partial matches and similar words
    for (const [word, score] of Object.entries(targetData.related)) {
      // Partial match (word contains guess or vice versa)
      if (word.includes(normalizedGuess) || normalizedGuess.includes(word)) {
        return Math.floor(score * 0.7);
      }
    }

    // Calculate a base score using character similarity
    const charSimilarity = calculateCharSimilarity(normalizedGuess, target);
    return Math.floor(charSimilarity * 0.3);
  }

  function calculateCharSimilarity(str1, str2) {
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = [...set1].filter(char => set2.has(char));
    const union = new Set([...set1, ...set2]);
    return (intersection.length / union.size) * 100;
  }

  function getSimilarityFeedback(score) {
    if (score >= 90) return { text: 'Perfect match!', class: 'burning' };
    if (score >= 70) return { text: 'So close! You\'re on fire!', class: 'burning' };
    if (score >= 50) return { text: 'Getting warmer!', class: 'hot' };
    if (score >= 30) return { text: 'On the right track', class: 'warm' };
    if (score >= 15) return { text: 'A bit cold...', class: 'cold' };
    return { text: 'Ice cold! Try something else', class: 'cold' };
  }

  function getScoreClass(score) {
    if (score >= 70) return 'burning';
    if (score >= 50) return 'hot';
    if (score >= 30) return 'warm';
    return 'cold';
  }

  // ==================== UI Updates ====================

  function updateUI() {
    elements.bestMatch.textContent = state.bestMatch > 0 ? `${state.bestMatch}%` : '--';
    elements.guessCount.textContent = state.guesses.length;
    elements.totalScore.textContent = state.totalScore;
  }

  function showSimilarity(score) {
    elements.similarityValue.textContent = `${score}%`;
    elements.similarityFill.style.width = `${score}%`;

    const feedback = getSimilarityFeedback(score);
    elements.similarityFeedback.textContent = feedback.text;
    elements.similarityFeedback.className = `similarity-feedback ${feedback.class}`;

    // Animate the bar
    elements.similarityFill.style.transition = 'width 0.5s ease';
  }

  function addToHistory(word, score) {
    const scoreClass = getScoreClass(score);
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${scoreClass}`;
    historyItem.innerHTML = `
      <span class="history-word">${word}</span>
      <span class="history-score">${score}%</span>
    `;

    // Remove empty message if exists
    const emptyMsg = elements.historyList.querySelector('.history-empty');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    // Add to beginning
    elements.historyList.insertBefore(historyItem, elements.historyList.firstChild);

    // Animate entry
    historyItem.style.opacity = '0';
    historyItem.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      historyItem.style.transition = 'all 0.3s ease';
      historyItem.style.opacity = '1';
      historyItem.style.transform = 'translateY(0)';
    });
  }

  function clearHistory() {
    state.guesses = [];
    state.bestMatch = 0;
    elements.historyList.innerHTML = '<div class="history-empty">No guesses yet. Start typing!</div>';
    elements.similarityValue.textContent = '--';
    elements.similarityFill.style.width = '0%';
    elements.similarityFeedback.textContent = '';
    updateUI();
  }

  function showHint() {
    if (!state.currentWord) return;

    const wordData = WORD_DATABASE[state.currentWord];
    if (!elements.targetHint.textContent) {
      elements.targetHint.textContent = wordData.hint;
      elements.targetHint.style.opacity = '0';
      requestAnimationFrame(() => {
        elements.targetHint.style.transition = 'opacity 0.5s ease';
        elements.targetHint.style.opacity = '1';
      });
      state.hintsUsed++;
      ToolsCommon.Toast.show('Hint revealed!', 'info');
    } else {
      // Show a random related word as additional hint
      const relatedWords = Object.keys(wordData.related);
      const hintWord = relatedWords[Math.floor(Math.random() * Math.min(5, relatedWords.length))];
      ToolsCommon.Toast.show(`Try something like "${hintWord}"`, 'info');
    }
  }

  // ==================== Game Actions ====================

  function submitGuess() {
    const guess = elements.guessInput.value.trim();

    if (!guess) {
      ToolsCommon.Toast.show('Please enter a word', 'warning');
      return;
    }

    if (guess.length < 2) {
      ToolsCommon.Toast.show('Word too short', 'warning');
      return;
    }

    // Check if already guessed
    const normalizedGuess = guess.toLowerCase();
    if (state.guesses.some(g => g.word.toLowerCase() === normalizedGuess)) {
      ToolsCommon.Toast.show('Already guessed!', 'warning');
      elements.guessInput.value = '';
      return;
    }

    // Calculate similarity
    const score = calculateSimilarity(guess, state.currentWord);

    // Add to guesses
    state.guesses.push({ word: guess, score });

    // Update best match
    if (score > state.bestMatch) {
      state.bestMatch = score;
      if (score >= 90) {
        ToolsCommon.Toast.show('Amazing! Perfect match!', 'success');
      } else if (score >= 70) {
        ToolsCommon.Toast.show('New best match!', 'success');
      }
    }

    // Update total score
    state.totalScore += score;

    // Update UI
    showSimilarity(score);
    addToHistory(guess, score);
    updateUI();

    // Clear input
    elements.guessInput.value = '';
    elements.guessInput.focus();
  }

  function newWord() {
    state.currentWord = getRandomWord();
    state.guesses = [];
    state.bestMatch = 0;
    state.hintsUsed = 0;

    elements.targetWord.textContent = state.currentWord.toUpperCase();
    elements.targetHint.textContent = '';
    clearHistory();

    // Animate new word
    elements.targetWord.style.transform = 'scale(0.8)';
    elements.targetWord.style.opacity = '0';
    requestAnimationFrame(() => {
      elements.targetWord.style.transition = 'all 0.5s ease';
      elements.targetWord.style.transform = 'scale(1)';
      elements.targetWord.style.opacity = '1';
    });

    ToolsCommon.Toast.show('New word! Start guessing', 'success');
    elements.guessInput.focus();
  }

  // ==================== Event Handlers ====================

  function handleSubmit(e) {
    e?.preventDefault();
    submitGuess();
  }

  function handleKeydown(e) {
    if (e.target.matches('input, textarea, select, [contenteditable]')) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'h':
        e.preventDefault();
        showHint();
        break;
      case 'n':
        e.preventDefault();
        newWord();
        break;
    }
  }

  // ==================== Initialization ====================

  function init() {
    // Start with a random word
    newWord();

    // Event listeners
    elements.submitBtn?.addEventListener('click', handleSubmit);
    elements.guessInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit(e);
    });
    elements.hintBtn?.addEventListener('click', showHint);
    elements.newWordBtn?.addEventListener('click', newWord);
    elements.clearHistoryBtn?.addEventListener('click', clearHistory);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Focus input
    elements.guessInput?.focus();
  }

  // ==================== Bootstrap ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
