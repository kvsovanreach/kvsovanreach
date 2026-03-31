/**
 * Editor field generators for each slide type
 * Optimized UX: collapsible sections, smart defaults, inline hints, keyboard shortcuts
 */
const EditorFields = {
  render(slide) {
    const renderer = this.renderers[slide.type];
    const fields = renderer ? renderer(slide) : this.renderGenericJSON(slide);
    // Always append speaker notes
    const notesSection = this.collapse('speaker-notes', 'Speaker Notes',
      this.textarea('notes', '', slide.notes || '', {
        rows: 4,
        placeholder: 'Private notes for the presenter (not shown in slides)',
        hint: 'Only visible in editor'
      }),
      !!(slide.notes)
    );
    return `<div class="editor-fields">${fields}${notesSection}</div>`;
  },

  // --- Helpers ---
  input(id, label, value, opts = {}) {
    const type = opts.type || 'text';
    const placeholder = opts.placeholder || '';
    const cls = opts.class || '';
    const suffix = opts.suffix ? `<span class="input-suffix">${opts.suffix}</span>` : '';
    const inputCls = suffix ? 'has-suffix' : '';
    const hint = opts.hint ? `<span class="field-hint">${opts.hint}</span>` : '';
    return `
      <div class="form-group ${cls}">
        <label for="${id}">${label}${hint}</label>
        <div class="input-wrap ${inputCls}">
          <input type="${type}" id="${id}" data-field="${id}" value="${this.esc(value)}" placeholder="${placeholder}">
          ${suffix}
        </div>
      </div>`;
  },

  textarea(id, label, value, opts = {}) {
    const rows = opts.rows || 3;
    const placeholder = opts.placeholder || '';
    const cls = opts.mono ? 'mono' : '';
    const hint = opts.hint ? `<span class="field-hint">${opts.hint}</span>` : '';
    return `
      <div class="form-group">
        <label for="${id}">${label}${hint}</label>
        <textarea id="${id}" data-field="${id}" rows="${rows}" placeholder="${placeholder}" class="${cls}">${this.esc(value)}</textarea>
      </div>`;
  },

  select(id, label, value, options, opts = {}) {
    const hint = opts.hint ? `<span class="field-hint">${opts.hint}</span>` : '';
    const optionsHtml = options.map(o => {
      const val = typeof o === 'string' ? o : o.value;
      const text = typeof o === 'string' ? o : o.label;
      return `<option value="${val}" ${String(val) === String(value) ? 'selected' : ''}>${text}</option>`;
    }).join('');
    return `
      <div class="form-group">
        <label for="${id}">${label}${hint}</label>
        <select id="${id}" data-field="${id}">${optionsHtml}</select>
      </div>`;
  },

  checkbox(id, label, checked) {
    return `
      <div class="form-group form-group-inline">
        <label class="checkbox-label">
          <input type="checkbox" data-field="${id}" ${checked ? 'checked' : ''}>
          <span>${label}</span>
        </label>
      </div>`;
  },

  row(...fields) {
    return `<div class="form-row">${fields.join('')}</div>`;
  },

  bulletList(id, label, items, opts = {}) {
    const placeholder = opts.placeholder || 'Type here, press Enter to add';
    const itemsHtml = (items || []).map((item, i) => `
      <div class="bullet-item" data-index="${i}">
        <input type="text" value="${this.esc(item)}" placeholder="${placeholder}" data-bullet="${id}" data-index="${i}" data-bullet-input>
        <button class="btn-icon btn-icon-danger" data-remove-bullet="${id}" data-index="${i}"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join('');
    return `
      <div class="form-group">
        <label>${label} <span class="field-hint">Enter = add, Backspace on empty = remove</span></label>
        <div class="bullet-list" id="bullets-${id}">
          ${itemsHtml}
          <div class="bullet-add" data-add-bullet="${id}"><i class="fa-solid fa-plus"></i> Add item</div>
        </div>
      </div>`;
  },

  sectionTitle(text) {
    return `<div class="editor-section-title">${text}</div>`;
  },

  /** Collapsible section — content hidden by default unless defaultOpen */
  collapse(id, label, content, defaultOpen = false) {
    const openCls = defaultOpen ? ' open' : '';
    const icon = defaultOpen ? 'fa-chevron-down' : 'fa-chevron-right';
    return `
      <div class="collapse-section${openCls}" data-collapse="${id}">
        <button class="collapse-toggle" type="button" data-collapse-toggle="${id}">
          <i class="fa-solid ${icon}"></i> ${label}
        </button>
        <div class="collapse-body">${content}</div>
      </div>`;
  },

  mediaFields(prefix, media) {
    const m = media || {};
    const content = [
      this.row(
        this.select(`${prefix}.size`, 'Size', m.size || 'auto', MEDIA_SIZES),
        this.select(`${prefix}.position`, 'Position', m.position || 'center', MEDIA_POSITIONS)
      ),
      this.row(
        this.input(`${prefix}.width`, 'Width', m.width || '', { placeholder: '400px or 60%', suffix: 'px/%' }),
        this.input(`${prefix}.height`, 'Height', m.height || '', { placeholder: '300px', suffix: 'px/%' })
      ),
      this.row(
        this.select(`${prefix}.fit`, 'Fit', m.fit || 'contain', MEDIA_FITS),
        this.input(`${prefix}.borderRadius`, 'Corner Radius', m.borderRadius || '8', { suffix: 'px' })
      )
    ].join('');
    return this.collapse('media-opts', 'Size & Position', content);
  },

  titlePositionField(value) {
    return this.select('titlePosition', 'Title Position', value || 'top', TITLE_POSITIONS);
  },

  esc(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  renderGenericJSON(slide) {
    const json = JSON.stringify(slide, null, 2);
    return this.textarea('_raw_json', 'Raw JSON', json, { rows: 15, mono: true });
  },

  // Common languages for code slide
  LANGUAGES: [
    'javascript','typescript','python','java','c','cpp','csharp','go','rust','ruby',
    'php','swift','kotlin','html','css','sql','bash','json','yaml','markdown','latex','other'
  ],

  // --- Per-type renderers ---
  renderers: {},

  /** Register an editor type renderer */
  register(type, fn) {
    this.renderers[type] = fn;
  },
};
