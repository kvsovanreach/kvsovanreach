/**
 * KVSOVANREACH Markdown Editor Tool
 * Live preview markdown editor with syntax highlighting
 */

(function() {
  'use strict';

  // ==================== State ====================
  const state = {
    view: 'preview',
    layout: 'split',
    isFullscreen: false
  };

  // ==================== DOM Elements ====================
  const elements = {};

  function initElements() {
    elements.markdownInput = document.getElementById('markdownInput');
    elements.previewContent = document.getElementById('previewContent');
    elements.htmlContent = document.getElementById('htmlContent');
    elements.htmlCode = document.getElementById('htmlCode');
    elements.wordCount = document.getElementById('wordCount');
    elements.charCount = document.getElementById('charCount');
    elements.toolbarBtns = document.querySelectorAll('.toolbar-btn[data-action]');
    elements.viewBtns = document.querySelectorAll('.view-btn');
    elements.downloadMd = document.getElementById('downloadMd');
    elements.copyHtml = document.getElementById('copyHtml');
    elements.clearEditor = document.getElementById('clearEditor');
    elements.clearBtn = document.getElementById('clearBtn');
    elements.fileUpload = document.getElementById('fileUpload');
    elements.dropZone = document.getElementById('dropZone');
    elements.toggleFullscreen = document.getElementById('toggleFullscreen');
    elements.layoutBtns = document.querySelectorAll('.layout-btn');
  }

  // ==================== UI Helpers ====================
  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  // ==================== Sample Content ====================
  const sampleMarkdown = `# Welcome to Markdown Editor

This is a **live preview** markdown editor. Start typing to see the results!

## Features

- **Bold** and *italic* text formatting
- \`Inline code\` and code blocks
- Links and images
- Lists (ordered and unordered)
- Task lists with checkboxes
- Tables and more!

## Quick Reference

### Text Formatting
| Syntax | Result |
| --- | --- |
| **bold** | **bold** |
| *italic* | *italic* |
| ~~strikethrough~~ | ~~strikethrough~~ |
| \`code\` | \`code\` |

### Lists
- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

### Task List
- [x] Completed task
- [ ] Pending task

### Code Block
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquote
> This is a blockquote. It can span multiple lines and is great for highlighting important information.

---

*Start editing to create your own content!*
`;

  // ==================== Markdown Parser ====================
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

  function parseMarkdown(md) {
    let html = md;

    // Escape HTML first
    html = escapeHtml(html);

    // Code blocks (``` ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Task lists
    html = html.replace(/^- \[x\] (.+)$/gm, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');
    html = html.replace(/^- \[ \] (.+)$/gm, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>');

    // Unordered lists
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive li in ul/ol
    html = html.replace(/(<li class="task-list-item">.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/(<li>(?!.*task-list).*<\/li>\n?)+/g, match => {
      // Check if it looks like ordered list (has numbers in original)
      return '<ul>' + match + '</ul>';
    });

    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      if (cells.every(c => /^-+$/.test(c))) {
        return '<!-- table separator -->';
      }
      const isHeader = html.indexOf(match) === html.indexOf('|');
      const tag = isHeader ? 'th' : 'td';
      const row = cells.map(c => `<${tag}>${c}</${tag}>`).join('');
      return `<tr>${row}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');
    html = html.replace(/<!-- table separator -->\n?/g, '');

    // Paragraphs
    html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>');

    // Clean up extra newlines
    html = html.replace(/\n{2,}/g, '\n');
    html = html.replace(/<\/p>\n<p>/g, '</p>\n\n<p>');

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    return html.trim();
  }

  // ==================== Editor Actions ====================
  function insertText(before, after = '', placeholder = '') {
    const textarea = elements.markdownInput;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    textarea.value = newText;

    // Set cursor position
    const newCursorPos = start + before.length + selected.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();

    updatePreview();
    updateStats();
  }

  function insertAtLineStart(prefix) {
    const textarea = elements.markdownInput;
    const start = textarea.selectionStart;
    const text = textarea.value;

    // Find line start
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;

    const line = text.substring(lineStart, actualLineEnd);
    const newLine = prefix + line;

    textarea.value = text.substring(0, lineStart) + newLine + text.substring(actualLineEnd);
    textarea.setSelectionRange(lineStart + prefix.length, lineStart + newLine.length);
    textarea.focus();

    updatePreview();
    updateStats();
  }

  const actions = {
    bold: () => insertText('**', '**', 'bold text'),
    italic: () => insertText('*', '*', 'italic text'),
    strikethrough: () => insertText('~~', '~~', 'strikethrough'),
    h1: () => insertAtLineStart('# '),
    h2: () => insertAtLineStart('## '),
    h3: () => insertAtLineStart('### '),
    ul: () => insertAtLineStart('- '),
    ol: () => insertAtLineStart('1. '),
    checklist: () => insertAtLineStart('- [ ] '),
    link: () => insertText('[', '](url)', 'link text'),
    image: () => insertText('![', '](url)', 'alt text'),
    code: () => insertText('`', '`', 'code'),
    codeblock: () => insertText('```\n', '\n```', 'code here'),
    quote: () => insertAtLineStart('> '),
    hr: () => insertText('\n---\n', '', ''),
    table: () => insertText('\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', '', '')
  };

  // ==================== UI Functions ====================
  function updatePreview() {
    const markdown = elements.markdownInput.value;

    if (!markdown.trim()) {
      elements.previewContent.innerHTML = `
        <div class="preview-placeholder">
          <i class="fa-solid fa-file-lines"></i>
          <p>Start typing to see the preview</p>
        </div>
      `;
      elements.htmlCode.textContent = '';
      return;
    }

    const html = parseMarkdown(markdown);
    elements.previewContent.innerHTML = html;
    elements.htmlCode.textContent = html;
  }

  function updateStats() {
    const text = elements.markdownInput.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    elements.wordCount.textContent = `${words} words`;
    elements.charCount.textContent = `${chars} chars`;
  }

  function downloadMarkdown() {
    const content = elements.markdownInput.value;
    if (!content.trim()) {
      showToast('Nothing to download');
      return;
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Downloaded!', 'success');
  }

  function copyHtml() {
    const html = parseMarkdown(elements.markdownInput.value);
    if (!html.trim()) {
      showToast('Nothing to copy', 'error');
      return;
    }
    ToolsCommon.copyWithToast(html, 'HTML copied!');
  }

  function clearEditor() {
    elements.markdownInput.value = '';
    updatePreview();
    updateStats();
    showToast('Editor cleared');
  }

  function toggleView(view) {
    state.view = view;

    elements.viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'preview') {
      elements.previewContent.style.display = 'block';
      elements.htmlContent.style.display = 'none';
    } else {
      elements.previewContent.style.display = 'none';
      elements.htmlContent.style.display = 'block';
    }
  }

  function toggleLayout(layout) {
    state.layout = layout;
    const wrapper = document.querySelector('.markdown-wrapper');
    const editorPanel = document.querySelector('.editor-panel');
    const previewPanel = document.querySelector('.preview-panel');
    const layoutBtns = document.querySelectorAll('.layout-btn');

    layoutBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layout === layout);
    });

    wrapper.classList.remove('layout-split', 'layout-editor', 'layout-preview');
    wrapper.classList.add(`layout-${layout}`);

    if (layout === 'editor') {
      editorPanel.style.display = 'flex';
      previewPanel.style.display = 'none';
    } else if (layout === 'preview') {
      editorPanel.style.display = 'none';
      previewPanel.style.display = 'flex';
    } else {
      editorPanel.style.display = 'flex';
      previewPanel.style.display = 'flex';
    }
  }

  function toggleFullscreen() {
    const wrapper = document.querySelector('.markdown-wrapper');
    const btn = document.getElementById('toggleFullscreen');

    state.isFullscreen = !state.isFullscreen;

    if (state.isFullscreen) {
      wrapper.classList.add('fullscreen');
      btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
      document.body.style.overflow = 'hidden';
    } else {
      wrapper.classList.remove('fullscreen');
      btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
      document.body.style.overflow = '';
    }
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.markdownInput.value = e.target.result;
      updatePreview();
      updateStats();
      localStorage.setItem('markdown-editor-content', e.target.result);
      showToast(`Loaded: ${file.name}`, 'success');
    };
    reader.onerror = () => {
      showToast('Failed to read file');
    };
    reader.readAsText(file);
  }

  // ==================== Initialize ====================
  function init() {
    initElements();

    // Event listeners
    elements.markdownInput.addEventListener('input', () => {
      updatePreview();
      updateStats();
    });

    // Toolbar actions
    elements.toolbarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (actions[action]) {
          actions[action]();
        }
      });
    });

    // View toggle
    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => toggleView(btn.dataset.view));
    });

    // Action buttons
    elements.downloadMd?.addEventListener('click', downloadMarkdown);
    elements.copyHtml?.addEventListener('click', copyHtml);
    elements.clearEditor?.addEventListener('click', clearEditor);
    elements.clearBtn?.addEventListener('click', clearEditor);

    // Keyboard shortcuts
    elements.markdownInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            actions.bold();
            break;
          case 'i':
            e.preventDefault();
            actions.italic();
            break;
          case 'k':
            e.preventDefault();
            actions.link();
            break;
        }
      }

      // Tab to insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        insertText('  ', '', '');
      }
    });

    // Load saved content or sample
    const savedContent = localStorage.getItem('markdown-editor-content');
    if (savedContent) {
      elements.markdownInput.value = savedContent;
    } else {
      elements.markdownInput.value = sampleMarkdown;
      localStorage.setItem('markdown-editor-content', sampleMarkdown);
    }
    updatePreview();
    updateStats();

    // Auto-save
    elements.markdownInput.addEventListener('input', () => {
      localStorage.setItem('markdown-editor-content', elements.markdownInput.value);
    });

    // Layout toggle
    elements.layoutBtns.forEach(btn => {
      btn.addEventListener('click', () => toggleLayout(btn.dataset.layout));
    });

    // Fullscreen toggle
    elements.toggleFullscreen?.addEventListener('click', toggleFullscreen);

    // File upload
    elements.fileUpload?.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        readFile(e.target.files[0]);
      }
    });

    // Drag and drop
    if (elements.dropZone) {
      elements.markdownInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('drag-over');
      });

      elements.markdownInput.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('drag-over');
      });

      elements.markdownInput.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown'))) {
          readFile(file);
        } else {
          showToast('Please drop a markdown file', 'error');
        }
      });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && state.isFullscreen) {
        toggleFullscreen();
      }
    });

    // Initial update
    updateStats();
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
