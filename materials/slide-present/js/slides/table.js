SlideRenderer.register('table', function(slide) {
  const table = slide.table || {};
  const headers = table.headers || [];
  const rows = table.rows || [];
  const highlight = table.highlight || [];
  const stripedCls = table.striped ? ' table-striped' : '';
  const compactCls = table.compact ? ' table-compact' : '';
  const headerHtml = headers.map(h => `<th>${this.fmt(h)}</th>`).join('');
  const rowsHtml = rows.map((row, i) => {
    const cls = highlight.includes(i) ? ' class="highlight"' : '';
    return `<tr${cls}>${row.map(c => `<td>${this.fmt(c)}</td>`).join('')}</tr>`;
  }).join('');

  const tblNum = this.nextCount('table');

  // Section title (slide heading)
  const sectionTitle = this.slideTitle(slide.title, slide.section);

  // Table caption — research paper style: "Table 1. Caption text"
  const captionText = slide.tableCaption || '';
  const tableCaptionHtml = `<div class="table-label"><span class="table-label-num">Table ${tblNum}.</span>${captionText ? ' ' + this.fmt(captionText) : ''}</div>`;

  return `
    <div class="slide-content table-slide">
      ${sectionTitle}
      ${slide.text ? `<p class="slide-text">${this.fmt(slide.text)}</p>` : ''}
      ${tableCaptionHtml}
      <div class="table-wrapper">
        <table class="${stripedCls}${compactCls}"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
      </div>
    </div>`;
});
