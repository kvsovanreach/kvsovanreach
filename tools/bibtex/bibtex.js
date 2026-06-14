/**
 * BibTeX Citation Manager
 * Parse, format, validate, and generate BibTeX entries
 */
(function() {
  'use strict';

  // ==================== DOM Elements ====================
  const tabs = document.querySelectorAll('.tool-tab[data-tab]');
  const panels = {
    parse: document.getElementById('parsePanel'),
    generate: document.getElementById('generatePanel')
  };

  // Parse tab
  const bibInput = document.getElementById('bibInput');
  const sampleBtn = document.getElementById('sampleBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const styleSelect = document.getElementById('styleSelect');
  const sortSelect = document.getElementById('sortSelect');
  const parseBtn = document.getElementById('parseBtn');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const validationMsg = document.getElementById('validationMsg');
  const bibResults = document.getElementById('bibResults');

  // Generate tab
  const genType = document.getElementById('genType');
  const genKey = document.getElementById('genKey');
  const genAuthor = document.getElementById('genAuthor');
  const genYear = document.getElementById('genYear');
  const genTitle = document.getElementById('genTitle');
  const genJournal = document.getElementById('genJournal');
  const genPublisher = document.getElementById('genPublisher');
  const genVolume = document.getElementById('genVolume');
  const genNumber = document.getElementById('genNumber');
  const genPages = document.getElementById('genPages');
  const genDoi = document.getElementById('genDoi');
  const genUrl = document.getElementById('genUrl');
  const genNote = document.getElementById('genNote');
  const generateBtn = document.getElementById('generateBtn');
  const clearFormBtn = document.getElementById('clearFormBtn');
  const copyGenBtn = document.getElementById('copyGenBtn');
  const genOutput = document.getElementById('genOutput');

  let parsedEntries = [];
  let lastGenerated = '';

  // ==================== Tab Switching ====================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(panels).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (panels[target]) panels[target].classList.add('active');
    });
  });

  // ==================== BibTeX Parser ====================
  function parseBibTeX(input) {
    const entries = [];
    const errors = [];
    const raw = input.trim();

    if (!raw) {
      errors.push('Input is empty.');
      return { entries, errors };
    }

    // Match @type{key, ... }
    const entryRegex = /@(\w+)\s*\{([^,]*),([^]*?)(?:\n\s*\})/g;
    let match;
    let found = 0;

    while ((match = entryRegex.exec(raw)) !== null) {
      found++;
      const type = match[1].toLowerCase();
      const key = match[2].trim();
      const body = match[3];

      if (!key) {
        errors.push(`Entry #${found}: Missing cite key.`);
      }

      const fields = {};
      // Match field = {value} or field = "value" or field = number
      const fieldRegex = /(\w+)\s*=\s*(?:\{([^}]*)\}|"([^"]*)"|(\d+))/g;
      let fm;
      while ((fm = fieldRegex.exec(body)) !== null) {
        const fname = fm[1].toLowerCase();
        const fval = fm[2] !== undefined ? fm[2] : fm[3] !== undefined ? fm[3] : fm[4];
        fields[fname] = fval.trim();
      }

      entries.push({ type, key, fields });
    }

    if (found === 0) {
      // Try looser matching
      if (raw.includes('@')) {
        errors.push('Could not parse entries. Check that each entry has matching braces and ends with }.');
      } else {
        errors.push('No BibTeX entries found. Entries must start with @type{key, ...}');
      }
    }

    return { entries, errors };
  }

  // ==================== Author Formatting ====================
  function parseAuthors(authorStr) {
    if (!authorStr) return [];
    return authorStr.split(/\s+and\s+/i).map(a => {
      a = a.trim();
      if (a.includes(',')) {
        const parts = a.split(',').map(p => p.trim());
        return { last: parts[0], first: parts[1] || '' };
      }
      const parts = a.split(/\s+/);
      if (parts.length === 1) return { last: parts[0], first: '' };
      const last = parts.pop();
      return { last, first: parts.join(' ') };
    });
  }

  function formatAuthorsAPA(authors) {
    if (authors.length === 0) return '';
    if (authors.length === 1) {
      const a = authors[0];
      return a.first ? `${a.last}, ${a.first.charAt(0)}.` : a.last;
    }
    if (authors.length === 2) {
      return authors.map(a => a.first ? `${a.last}, ${a.first.charAt(0)}.` : a.last).join(' & ');
    }
    const listed = authors.slice(0, -1).map(a => a.first ? `${a.last}, ${a.first.charAt(0)}.` : a.last).join(', ');
    const lastA = authors[authors.length - 1];
    return `${listed}, & ${lastA.first ? `${lastA.last}, ${lastA.first.charAt(0)}.` : lastA.last}`;
  }

  function formatAuthorsMLA(authors) {
    if (authors.length === 0) return '';
    if (authors.length === 1) {
      const a = authors[0];
      return a.first ? `${a.last}, ${a.first}` : a.last;
    }
    const first = authors[0];
    const rest = authors.slice(1).map(a => a.first ? `${a.first} ${a.last}` : a.last);
    const base = first.first ? `${first.last}, ${first.first}` : first.last;
    if (authors.length === 2) return `${base}, and ${rest[0]}`;
    return `${base}, et al.`;
  }

  function formatAuthorsChicago(authors) {
    if (authors.length === 0) return '';
    if (authors.length === 1) {
      const a = authors[0];
      return a.first ? `${a.last}, ${a.first}` : a.last;
    }
    const first = authors[0];
    const base = first.first ? `${first.last}, ${first.first}` : first.last;
    if (authors.length === 2) {
      const second = authors[1];
      return `${base}, and ${second.first ? `${second.first} ${second.last}` : second.last}`;
    }
    const mid = authors.slice(1, -1).map(a => a.first ? `${a.first} ${a.last}` : a.last).join(', ');
    const lastA = authors[authors.length - 1];
    return `${base}, ${mid}, and ${lastA.first ? `${lastA.first} ${lastA.last}` : lastA.last}`;
  }

  function formatAuthorsIEEE(authors) {
    if (authors.length === 0) return '';
    const formatted = authors.map(a => {
      if (!a.first) return a.last;
      const initials = a.first.split(/\s+/).map(n => n.charAt(0) + '.').join(' ');
      return `${initials} ${a.last}`;
    });
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return formatted.join(' and ');
    return formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1];
  }

  function formatAuthorsHarvard(authors) {
    return formatAuthorsAPA(authors);
  }

  // ==================== Citation Formatters ====================
  function formatAPA(entry) {
    const f = entry.fields;
    const authors = formatAuthorsAPA(parseAuthors(f.author || ''));
    const year = f.year ? ` (${f.year}).` : '.';
    const title = f.title ? ` ${f.title}.` : '';
    let source = '';
    if (f.journal) source = ` <em>${f.journal}</em>`;
    else if (f.booktitle) source = ` In <em>${f.booktitle}</em>`;
    if (f.volume) source += `, <em>${f.volume}</em>`;
    if (f.number) source += `(${f.number})`;
    if (f.pages) source += `, ${f.pages}`;
    if (source) source += '.';
    const doi = f.doi ? ` https://doi.org/${f.doi}` : '';
    return `${authors}${year}${title}${source}${doi}`;
  }

  function formatMLA(entry) {
    const f = entry.fields;
    const authors = formatAuthorsMLA(parseAuthors(f.author || ''));
    const title = f.title ? ` "${f.title}."` : '';
    let source = '';
    if (f.journal) source = ` <em>${f.journal}</em>`;
    else if (f.booktitle) source = ` <em>${f.booktitle}</em>`;
    if (f.volume) source += `, vol. ${f.volume}`;
    if (f.number) source += `, no. ${f.number}`;
    if (f.year) source += `, ${f.year}`;
    if (f.pages) source += `, pp. ${f.pages}`;
    if (source) source += '.';
    return `${authors}.${title}${source}`;
  }

  function formatChicago(entry) {
    const f = entry.fields;
    const authors = formatAuthorsChicago(parseAuthors(f.author || ''));
    const title = f.title ? ` "${f.title}."` : '';
    let source = '';
    if (f.journal) source = ` <em>${f.journal}</em>`;
    else if (f.booktitle) source = ` In <em>${f.booktitle}</em>`;
    if (f.volume) source += ` ${f.volume}`;
    if (f.number) source += `, no. ${f.number}`;
    if (f.year) source += ` (${f.year})`;
    if (f.pages) source += `: ${f.pages}`;
    if (source) source += '.';
    return `${authors}.${title}${source}`;
  }

  function formatIEEE(entry, index) {
    const f = entry.fields;
    const authors = formatAuthorsIEEE(parseAuthors(f.author || ''));
    const title = f.title ? ` "${f.title},"` : '';
    let source = '';
    if (f.journal) source = ` <em>${f.journal}</em>`;
    else if (f.booktitle) source = ` in <em>${f.booktitle}</em>`;
    if (f.volume) source += `, vol. ${f.volume}`;
    if (f.number) source += `, no. ${f.number}`;
    if (f.pages) source += `, pp. ${f.pages}`;
    if (f.year) source += `, ${f.year}`;
    if (source) source += '.';
    const prefix = `[${index + 1}] `;
    return `${prefix}${authors},${title}${source}`;
  }

  function formatHarvard(entry) {
    const f = entry.fields;
    const authors = formatAuthorsHarvard(parseAuthors(f.author || ''));
    const year = f.year ? ` (${f.year})` : '';
    const title = f.title ? ` '${f.title}',` : '';
    let source = '';
    if (f.journal) source = ` <em>${f.journal}</em>`;
    else if (f.booktitle) source = ` in <em>${f.booktitle}</em>`;
    if (f.volume) source += `, ${f.volume}`;
    if (f.number) source += `(${f.number})`;
    if (f.pages) source += `, pp. ${f.pages}`;
    if (source) source += '.';
    const doi = f.doi ? ` doi: ${f.doi}.` : '';
    return `${authors}${year}${title}${source}${doi}`;
  }

  function formatCitation(entry, style, index) {
    switch (style) {
      case 'apa': return formatAPA(entry);
      case 'mla': return formatMLA(entry);
      case 'chicago': return formatChicago(entry);
      case 'ieee': return formatIEEE(entry, index);
      case 'harvard': return formatHarvard(entry);
      default: return formatAPA(entry);
    }
  }

  // ==================== Sorting ====================
  function sortEntries(entries, sortBy) {
    if (sortBy === 'none') return entries;
    const sorted = [...entries];
    switch (sortBy) {
      case 'year':
        sorted.sort((a, b) => (parseInt(a.fields.year) || 0) - (parseInt(b.fields.year) || 0));
        break;
      case 'author':
        sorted.sort((a, b) => (a.fields.author || '').localeCompare(b.fields.author || ''));
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }
    return sorted;
  }

  // ==================== Render Results ====================
  function renderResults() {
    const style = styleSelect.value;
    const sortBy = sortSelect.value;
    const sorted = sortEntries(parsedEntries, sortBy);

    if (sorted.length === 0) {
      bibResults.innerHTML = '';
      copyAllBtn.disabled = true;
      return;
    }

    copyAllBtn.disabled = false;
    bibResults.innerHTML = sorted.map((entry, i) => {
      const citation = formatCitation(entry, style, i);
      const fieldRows = Object.entries(entry.fields).map(([k, v]) =>
        `<span class="field-name">${k}</span><span class="field-value">${escapeHTML(v)}</span>`
      ).join('');

      return `
        <div class="citation-card">
          <div class="citation-card-header">
            <div class="citation-card-meta">
              <span class="entry-type-badge">@${entry.type}</span>
              <span class="cite-key">${escapeHTML(entry.key)}</span>
            </div>
            <div class="citation-card-actions">
              <button type="button" class="action-btn secondary copy-cite-btn" data-index="${i}" title="Copy formatted citation">
                <i class="fa-solid fa-copy"></i>
                <span>Copy</span>
              </button>
            </div>
          </div>
          <div class="citation-card-body">
            <div class="citation-formatted">${citation}</div>
            <div class="citation-fields">${fieldRows}</div>
          </div>
        </div>
      `;
    }).join('');

    // Copy individual citation
    bibResults.querySelectorAll('.copy-cite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const entry = sorted[idx];
        const text = stripHTML(formatCitation(entry, style, idx));
        ToolsCommon.copyWithToast(text, 'Citation copied!');
      });
    });
  }

  function stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Validation Display ====================
  function showValidation(messages, type) {
    validationMsg.className = `bib-validation ${type}`;
    validationMsg.innerHTML = messages.map(m => escapeHTML(m)).join('<br>');
    validationMsg.classList.remove('hidden');
  }

  function hideValidation() {
    validationMsg.classList.add('hidden');
  }

  // ==================== Parse Action ====================
  function doParse() {
    hideValidation();
    const { entries, errors } = parseBibTeX(bibInput.value);

    if (errors.length > 0) {
      showValidation(errors, 'error');
      parsedEntries = [];
      bibResults.innerHTML = '';
      copyAllBtn.disabled = true;
      return;
    }

    parsedEntries = entries;
    showValidation([`Successfully parsed ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}.`], 'success');
    renderResults();
  }

  parseBtn.addEventListener('click', doParse);

  // Re-render on style or sort change
  styleSelect.addEventListener('change', renderResults);
  sortSelect.addEventListener('change', renderResults);

  // Copy all
  copyAllBtn.addEventListener('click', () => {
    const style = styleSelect.value;
    const sortBy = sortSelect.value;
    const sorted = sortEntries(parsedEntries, sortBy);
    const allText = sorted.map((e, i) => stripHTML(formatCitation(e, style, i))).join('\n\n');
    ToolsCommon.copyWithToast(allText, 'All citations copied!');
  });

  // ==================== Sample BibTeX ====================
  const sampleBib = `@article{knuth1984,
  author  = {Knuth, Donald E.},
  title   = {Literate Programming},
  journal = {The Computer Journal},
  volume  = {27},
  number  = {2},
  pages   = {97--111},
  year    = {1984},
  doi     = {10.1093/comjnl/27.2.97}
}

@book{lamport1994,
  author    = {Lamport, Leslie},
  title     = {LaTeX: A Document Preparation System},
  publisher = {Addison-Wesley},
  year      = {1994},
  edition   = {2nd}
}

@inproceedings{vaswani2017,
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N. and Kaiser, Lukasz and Polosukhin, Illia},
  title     = {Attention Is All You Need},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2017},
  pages     = {5998--6008}
}`;

  sampleBtn.addEventListener('click', () => {
    bibInput.value = sampleBib;
    doParse();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      bibInput.value = text;
      doParse();
    } catch {
      ToolsCommon.showToast('Clipboard access denied', 'error');
    }
  });

  clearBtn.addEventListener('click', () => {
    bibInput.value = '';
    parsedEntries = [];
    bibResults.innerHTML = '';
    copyAllBtn.disabled = true;
    hideValidation();
  });

  // ==================== Generate Tab ====================
  function generateBibTeX() {
    const type = genType.value;
    let key = genKey.value.trim();
    const author = genAuthor.value.trim();
    const year = genYear.value.trim();
    const title = genTitle.value.trim();

    if (!title && !author) {
      ToolsCommon.showToast('Please fill in at least title or author', 'error');
      return;
    }

    // Auto-generate key if empty
    if (!key) {
      const firstAuthor = author ? author.split(/[,\s]/)[0].toLowerCase() : 'unknown';
      key = `${firstAuthor}${year || 'nd'}`;
    }

    const fields = [];
    if (author) fields.push(`  author    = {${author}}`);
    if (title) fields.push(`  title     = {${title}}`);
    if (year) fields.push(`  year      = {${year}}`);

    const journal = genJournal.value.trim();
    const publisher = genPublisher.value.trim();
    const volume = genVolume.value.trim();
    const number = genNumber.value.trim();
    const pages = genPages.value.trim();
    const doi = genDoi.value.trim();
    const url = genUrl.value.trim();
    const note = genNote.value.trim();

    if (journal) {
      const fieldName = (type === 'inproceedings' || type === 'incollection') ? 'booktitle' : 'journal';
      fields.push(`  ${fieldName.padEnd(9)} = {${journal}}`);
    }
    if (publisher) fields.push(`  publisher = {${publisher}}`);
    if (volume) fields.push(`  volume    = {${volume}}`);
    if (number) fields.push(`  number    = {${number}}`);
    if (pages) fields.push(`  pages     = {${pages}}`);
    if (doi) fields.push(`  doi       = {${doi}}`);
    if (url) fields.push(`  url       = {${url}}`);
    if (note) fields.push(`  note      = {${note}}`);

    lastGenerated = `@${type}{${key},\n${fields.join(',\n')}\n}`;
    genOutput.textContent = lastGenerated;
    copyGenBtn.disabled = false;
  }

  generateBtn.addEventListener('click', generateBibTeX);

  copyGenBtn.addEventListener('click', () => {
    if (lastGenerated) {
      ToolsCommon.copyWithToast(lastGenerated, 'BibTeX copied!');
    }
  });

  clearFormBtn.addEventListener('click', () => {
    [genKey, genAuthor, genYear, genTitle, genJournal, genPublisher,
     genVolume, genNumber, genPages, genDoi, genUrl, genNote].forEach(el => el.value = '');
    genType.selectedIndex = 0;
    genOutput.textContent = 'Fill in the form and click Generate';
    lastGenerated = '';
    copyGenBtn.disabled = true;
  });

  // ==================== Auto-parse on large paste ====================
  bibInput.addEventListener('paste', () => {
    setTimeout(() => {
      if (bibInput.value.trim().length > 10) doParse();
    }, 100);
  });

})();
