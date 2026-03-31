SlideRenderer.register('code', function(slide) {
  const titleHtml = this.slideTitle(slide.title, slide.section, slide.titlePosition);
  const filename = slide.filename ? `<div class="code-filename"><i class="fa-solid fa-file-code"></i> ${this.esc(slide.filename)}</div>` : '';
  const lang = slide.language ? `<span class="code-lang">${this.esc(slide.language)}</span>` : '';

  return `
    <div class="slide-content code-slide">
      ${titleHtml}
      <div class="code-block">
        <div class="code-header">${filename}${lang}</div>
        <pre><code class="language-${this.esc(slide.language || 'plaintext')}">${this.esc(slide.code || '')}</code></pre>
      </div>
    </div>`;
});
