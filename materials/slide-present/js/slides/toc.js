SlideRenderer.register('toc', function(slide) {
  const items = slide.items || [];
  const cols = parseInt(slide.columns) || (items.length > 5 ? 2 : 1);
  const limit = parseInt(slide.itemsPerColumn) || 0; // 0 = auto

  const itemsHtml = items.map((item, i) => `
    <div class="toc-item">
      <span class="toc-number">${String(i + 1).padStart(2, '0')}</span>
      <div class="toc-text">
        <span class="toc-item-title">${this.esc(item.title)}</span>
        ${item.description ? `<span class="toc-item-desc">${this.esc(item.description)}</span>` : ''}
      </div>
    </div>
  `).join('');

  const isMultiCol = cols > 1;
  const layoutClass = isMultiCol ? 'toc-multi-column' : 'toc-one-column';
  const rowCount = limit || Math.ceil(items.length / cols);
  const gridStyle = isMultiCol ? `style="--toc-cols: ${cols}; --toc-rows: ${rowCount}"` : '';

  return `
    <div class="slide-content toc-slide">
      ${this.slideTitle(slide.title || 'Table of Contents', slide.section)}
      <div class="toc-list ${layoutClass}" ${gridStyle}>${itemsHtml}</div>
    </div>`;
});
