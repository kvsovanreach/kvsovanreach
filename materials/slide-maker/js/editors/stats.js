EditorFields.register('stats', function(slide) {
  const E = EditorFields;
  const items = slide.items || [];
  const itemsHtml = items.map((item, i) => `
    <div class="list-editor-item" data-index="${i}">
      <span class="item-num">${i + 1}</span>
      <div class="list-editor-fields list-editor-fields-3">
        <input type="text" value="${E.esc(item.value)}" placeholder="99%" data-stats-field="value" data-index="${i}">
        <input type="text" value="${E.esc(item.label)}" placeholder="Label" data-stats-field="label" data-index="${i}">
        <input type="text" value="${E.esc(item.icon || '')}" placeholder="users" data-stats-field="icon" data-index="${i}" title="FontAwesome icon name without fa-">
      </div>
      <button class="btn-icon btn-icon-danger" data-remove-stats="${i}"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Context for the metrics' }),
    `<div class="form-group">
      <label>Metrics <span class="field-hint">Value | Label | Icon (fa name)</span></label>
      <div class="list-editor" id="stats-editor-list">${itemsHtml}</div>
      <div class="bullet-add" id="btn-add-stats-item"><i class="fa-solid fa-plus"></i> Add Metric</div>
    </div>`
  ].join('');
});
