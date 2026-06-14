/**
 * Text Statistics Tool
 * Readability analysis with Flesch, Gunning Fog, Coleman-Liau, SMOG, ARI
 */

(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const elements = {
    textInput: document.getElementById('textInput'),
    clearBtn: document.getElementById('clearBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    countsSection: document.getElementById('countsSection'),
    charCount: document.getElementById('charCount'),
    charNoSpaceCount: document.getElementById('charNoSpaceCount'),
    wordCount: document.getElementById('wordCount'),
    sentenceCount: document.getElementById('sentenceCount'),
    paragraphCount: document.getElementById('paragraphCount'),
    syllableCount: document.getElementById('syllableCount'),
    avgWordLength: document.getElementById('avgWordLength'),
    avgSentenceLength: document.getElementById('avgSentenceLength'),
    timeSection: document.getElementById('timeSection'),
    readingTime: document.getElementById('readingTime'),
    speakingTime: document.getElementById('speakingTime'),
    difficultySection: document.getElementById('difficultySection'),
    difficultyBadge: document.getElementById('difficultyBadge'),
    gaugeSection: document.getElementById('gaugeSection'),
    gaugeFill: document.getElementById('gaugeFill'),
    gaugeNeedle: document.getElementById('gaugeNeedle'),
    gaugeScore: document.getElementById('gaugeScore'),
    scoresSection: document.getElementById('scoresSection'),
    fleschEase: document.getElementById('fleschEase'),
    fleschEaseBar: document.getElementById('fleschEaseBar'),
    fleschKincaid: document.getElementById('fleschKincaid'),
    fleschKincaidBar: document.getElementById('fleschKincaidBar'),
    gunningFog: document.getElementById('gunningFog'),
    gunningFogBar: document.getElementById('gunningFogBar'),
    colemanLiau: document.getElementById('colemanLiau'),
    colemanLiauBar: document.getElementById('colemanLiauBar'),
    smogIndex: document.getElementById('smogIndex'),
    smogIndexBar: document.getElementById('smogIndexBar'),
    ari: document.getElementById('ari'),
    ariBar: document.getElementById('ariBar'),
    emptyState: document.getElementById('emptyState')
  };

  // ==================== Sample Text ====================
  const SAMPLE_TEXT = `The art of writing clearly is one of the most important skills a person can develop. Good writing communicates ideas effectively, using simple words and short sentences when possible. Complex ideas can be broken down into smaller, more digestible pieces.

Reading comprehension improves when writers consider their audience. A medical journal article differs greatly from a newspaper column. The vocabulary, sentence structure, and assumed knowledge all change depending on who will read the text.

Studies show that the average American reads at approximately an eighth-grade level. This means that most public-facing documents should aim for clarity and simplicity. Government agencies, healthcare providers, and educational institutions all benefit from writing that is accessible to a broad audience.

However, simplicity does not mean sacrificing depth or nuance. Skilled writers can convey sophisticated ideas using straightforward language. The goal is not to dumb down content, but to make it as clear and engaging as possible for the intended reader.`;

  // ==================== Syllable Counter ====================

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 2) return 1;

    // Common exceptions
    const exceptions = {
      'simile': 3, 'every': 3, 'different': 3, 'family': 3,
      'generally': 4, 'usually': 4, 'beautiful': 3, 'business': 2,
      'basically': 4, 'interesting': 4, 'important': 3, 'everything': 3
    };
    if (exceptions[word]) return exceptions[word];

    // Remove silent e at end
    word = word.replace(/e$/, '');
    if (word.length === 0) return 1;

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;

    // Adjust for common patterns
    if (word.match(/[aeiouy]{2}/)) {
      // Diphthongs like "oa", "ea" etc count as one
    }

    // le at end with consonant before it adds a syllable
    if (word.match(/[^aeiouy]le$/)) {
      count++;
    }

    // -ed ending usually doesn't add syllable unless preceded by t or d
    if (word.match(/[^td]ed$/)) {
      count = Math.max(1, count - 1);
    }

    // -es ending
    if (word.match(/[^aeiouy]es$/)) {
      // usually not an extra syllable
    }

    // -ing
    if (word.match(/ing$/)) {
      // already counted
    }

    return Math.max(1, count);
  }

  function countTotalSyllables(words) {
    return words.reduce((total, word) => total + countSyllables(word), 0);
  }

  function countComplexWords(words) {
    // Words with 3+ syllables (for Gunning Fog)
    return words.filter(w => countSyllables(w) >= 3).length;
  }

  function countPolysyllabicWords(words) {
    // Words with 3+ syllables (for SMOG)
    return words.filter(w => countSyllables(w) >= 3).length;
  }

  // ==================== Text Parsing ====================

  function getWords(text) {
    return text.match(/[a-zA-Z'\u2019]+/g) || [];
  }

  function getSentences(text) {
    // Split on sentence-ending punctuation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences;
  }

  function getParagraphs(text) {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  }

  // ==================== Readability Formulas ====================

  function fleschReadingEase(totalWords, totalSentences, totalSyllables) {
    if (totalWords === 0 || totalSentences === 0) return 0;
    return 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  }

  function fleschKincaidGrade(totalWords, totalSentences, totalSyllables) {
    if (totalWords === 0 || totalSentences === 0) return 0;
    return 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
  }

  function gunningFogIndex(totalWords, totalSentences, complexWords) {
    if (totalWords === 0 || totalSentences === 0) return 0;
    return 0.4 * ((totalWords / totalSentences) + 100 * (complexWords / totalWords));
  }

  function colemanLiauIndex(totalWords, totalSentences, totalChars) {
    if (totalWords === 0) return 0;
    const L = (totalChars / totalWords) * 100; // avg letters per 100 words
    const S = (totalSentences / totalWords) * 100; // avg sentences per 100 words
    return 0.0588 * L - 0.296 * S - 15.8;
  }

  function smogIndex(totalSentences, polysyllabicWords) {
    if (totalSentences === 0) return 0;
    return 1.0430 * Math.sqrt(polysyllabicWords * (30 / totalSentences)) + 3.1291;
  }

  function automatedReadabilityIndex(totalWords, totalSentences, totalChars) {
    if (totalWords === 0 || totalSentences === 0) return 0;
    return 4.71 * (totalChars / totalWords) + 0.5 * (totalWords / totalSentences) - 21.43;
  }

  // ==================== Difficulty Level ====================

  function getDifficulty(fleschScore) {
    if (fleschScore >= 80) return { label: 'Very Easy', cls: 'very-easy' };
    if (fleschScore >= 60) return { label: 'Easy', cls: 'easy' };
    if (fleschScore >= 40) return { label: 'Moderate', cls: 'moderate' };
    if (fleschScore >= 20) return { label: 'Difficult', cls: 'difficult' };
    return { label: 'Very Difficult', cls: 'very-difficult' };
  }

  // ==================== Time Formatting ====================

  function formatTime(minutes) {
    if (minutes < 1) {
      const secs = Math.round(minutes * 60);
      return secs <= 0 ? '< 1 sec' : `${secs} sec`;
    }
    if (minutes < 60) {
      const m = Math.floor(minutes);
      const s = Math.round((minutes - m) * 60);
      return s > 0 ? `${m} min ${s} sec` : `${m} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h} hr ${m} min`;
  }

  // ==================== Analysis ====================

  let debounceTimer = null;

  function analyzeText() {
    const text = elements.textInput.value;

    if (!text.trim()) {
      hideResults();
      return;
    }

    showResults();

    // Basic counts
    const charCount = text.length;
    const charNoSpace = text.replace(/\s/g, '').length;
    const words = getWords(text);
    const wordCount = words.length;
    const sentences = getSentences(text);
    const sentenceCount = Math.max(1, sentences.length);
    const paragraphs = getParagraphs(text);
    const paragraphCount = paragraphs.length;
    const totalSyllables = countTotalSyllables(words);
    const letterCount = text.replace(/[^a-zA-Z]/g, '').length;

    // Averages
    const avgWordLen = wordCount > 0 ? (letterCount / wordCount).toFixed(1) : '0';
    const avgSentLen = wordCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0';

    // Complex words
    const complexCount = countComplexWords(words);
    const polysyllabic = countPolysyllabicWords(words);

    // Update basic counts
    elements.charCount.textContent = charCount.toLocaleString();
    elements.charNoSpaceCount.textContent = charNoSpace.toLocaleString();
    elements.wordCount.textContent = wordCount.toLocaleString();
    elements.sentenceCount.textContent = sentenceCount.toLocaleString();
    elements.paragraphCount.textContent = paragraphCount.toLocaleString();
    elements.syllableCount.textContent = totalSyllables.toLocaleString();
    elements.avgWordLength.textContent = avgWordLen;
    elements.avgSentenceLength.textContent = avgSentLen;

    // Time estimates
    const readMin = wordCount / 225;
    const speakMin = wordCount / 140;
    elements.readingTime.textContent = formatTime(readMin);
    elements.speakingTime.textContent = formatTime(speakMin);

    // Readability scores
    const fre = fleschReadingEase(wordCount, sentenceCount, totalSyllables);
    const fkg = fleschKincaidGrade(wordCount, sentenceCount, totalSyllables);
    const gfi = gunningFogIndex(wordCount, sentenceCount, complexCount);
    const cli = colemanLiauIndex(wordCount, sentenceCount, letterCount);
    const smg = smogIndex(sentenceCount, polysyllabic);
    const ariVal = automatedReadabilityIndex(wordCount, sentenceCount, letterCount);

    const freClamp = Math.max(0, Math.min(100, fre));

    // Update gauge
    const needlePos = Math.max(0, Math.min(100, freClamp));
    elements.gaugeNeedle.style.left = `calc(${needlePos}% - 2px)`;
    elements.gaugeScore.textContent = fre.toFixed(1);

    // Difficulty
    const diff = getDifficulty(freClamp);
    elements.difficultyBadge.textContent = diff.label;
    elements.difficultyBadge.className = 'difficulty-badge ' + diff.cls;

    // Score cards
    updateScore('fleschEase', fre.toFixed(1), freClamp);
    updateScore('fleschKincaid', Math.max(0, fkg).toFixed(1), gradeToPercent(fkg));
    updateScore('gunningFog', Math.max(0, gfi).toFixed(1), gradeToPercent(gfi));
    updateScore('colemanLiau', Math.max(0, cli).toFixed(1), gradeToPercent(cli));
    updateScore('smogIndex', Math.max(0, smg).toFixed(1), gradeToPercent(smg));
    updateScore('ari', Math.max(0, ariVal).toFixed(1), gradeToPercent(ariVal));
  }

  function updateScore(id, value, barPercent) {
    elements[id].textContent = value;
    const bar = elements[id + 'Bar'];
    if (bar) {
      bar.style.width = Math.min(100, Math.max(0, barPercent)) + '%';
    }
  }

  function gradeToPercent(grade) {
    // Map grade level (0-20) to percentage (0-100) for bar display
    return Math.min(100, Math.max(0, (grade / 20) * 100));
  }

  function showResults() {
    elements.countsSection.classList.remove('hidden');
    elements.timeSection.classList.remove('hidden');
    elements.difficultySection.classList.remove('hidden');
    elements.gaugeSection.classList.remove('hidden');
    elements.scoresSection.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
  }

  function hideResults() {
    elements.countsSection.classList.add('hidden');
    elements.timeSection.classList.add('hidden');
    elements.difficultySection.classList.add('hidden');
    elements.gaugeSection.classList.add('hidden');
    elements.scoresSection.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
  }

  // ==================== Event Listeners ====================

  elements.textInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(analyzeText, 200);
  });

  elements.clearBtn.addEventListener('click', () => {
    elements.textInput.value = '';
    hideResults();
  });

  elements.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      analyzeText();
      ToolsCommon.showToast('Text pasted from clipboard.', 'success');
    } catch {
      ToolsCommon.showToast('Unable to read clipboard.', 'error');
    }
  });

  elements.sampleBtn.addEventListener('click', () => {
    elements.textInput.value = SAMPLE_TEXT;
    analyzeText();
    ToolsCommon.showToast('Sample text loaded.', 'success');
  });

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && document.activeElement !== elements.textInput) {
      elements.textInput.value = '';
      hideResults();
    }
  });

})();
