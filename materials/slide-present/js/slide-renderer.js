/**
 * SlideRenderer — shared slide rendering engine
 * Single source of truth for both slide-maker (preview) and slide-present (presenter)
 * Outputs raw slide HTML — consumer wraps as needed
 */
const SlideRenderer = {
  /** Base URL for resolving relative asset paths (e.g. '../hrd-20260325/') */
  baseUrl: '',

  /** Set the base URL for relative asset resolution */
  setBaseUrl(url) {
    this.baseUrl = url ? (url.endsWith('/') ? url : url + '/') : '';
  },

  /** Resolve a URL — absolute URLs pass through, relative ones get baseUrl prepended */
  resolveUrl(url) {
    if (!url) return '';
    // Absolute URLs, data URIs, blob URLs — pass through
    if (/^(https?:\/\/|data:|blob:|\/\/)/i.test(url)) return url;
    if (!this.baseUrl) return url;
    // Strip leading ./ from relative paths
    const clean = url.replace(/^\.\//, '');
    return this.baseUrl + clean;
  },

  /** Counters for dynamic numbering (Figure 1, Table 1, etc.) */
  _counters: { figure: 0, table: 0, video: 0 },

  /** Reset counters — call before rendering a full slide deck */
  resetCounters() { this._counters = { figure: 0, table: 0, video: 0 }; },

  /** Get next number for a counter type */
  nextCount(type) { return ++this._counters[type]; },

  /** Render a slide's inner HTML */
  renderSlide(slide) {
    if (!slide) return '';
    const renderer = this.renderers[slide.type];
    if (!renderer) return `<div class="slide-content"><p>Unknown slide type: ${this.esc(slide.type)}</p></div>`;
    return renderer.call(this, slide);
  },

  esc(str) {
    if (str === null || str === undefined) return '';
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  },

  fmt(str) {
    if (!str) return '';
    let r = this.esc(str);
    r = r.replace(/\[(\d+)\]/g, '<sup class="citation">[$1]</sup>');
    r = r.replace(/&lt;nl&gt;/g, '<br>');
    return r;
  },

  slideTitle(title, section, position) {
    if (position === 'hidden' || !title) return '';
    const num = section ? `<span class="title-number">${String(section).padStart(2, '0')}</span>` : '';
    const cls = position && position !== 'top' ? ` title-pos-${position}` : '';
    return `<h2 class="slide-title${cls}">${num}${this.esc(title)}</h2>`;
  },

  mediaStyle(media) {
    if (!media) return '';
    const parts = [];
    if (media.width) parts.push(`width:${media.width}`);
    if (media.height) parts.push(`height:${media.height}`);
    if (media.fit) parts.push(`object-fit:${media.fit}`);
    if (media.borderRadius) parts.push(`border-radius:${media.borderRadius}px`);
    return parts.length ? `style="${parts.join(';')}"` : '';
  },

  mediaSizeClass(media) {
    if (!media || !media.size || media.size === 'auto') return '';
    return ` media-${media.size}`;
  },

  renderers: {},

  /** Register a slide type renderer */
  register(type, fn) {
    this.renderers[type] = fn;
  },
};
