EditorFields.register('toc', function(slide) {
  const E = EditorFields;
  const items = slide.items || [];
  const itemsHtml = items.map((item, i) => `
    <div class="list-editor-item" data-index="${i}">
      <span class="bullet-drag"><i class="fa-solid fa-grip-vertical"></i></span>
      <div class="list-editor-fields">
        <input type="text" value="${E.esc(item.title)}" placeholder="Topic title" data-toc-field="title" data-index="${i}" style="flex:4">
        <input type="text" value="${E.esc(item.description || '')}" placeholder="Short description" data-toc-field="description" data-index="${i}" style="flex:6">
      </div>
      <button class="btn-icon btn-icon-danger" data-remove-toc="${i}"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  return [
    E.input('title', 'Title', slide.title || 'Agenda'),
    `<div class="form-group">
      <label>Agenda Items</label>
      <div class="list-editor" id="toc-editor-list">${itemsHtml}</div>
      <div class="bullet-add" id="btn-add-toc-item"><i class="fa-solid fa-plus"></i> Add Item</div>
    </div>`,
    E.collapse('toc-layout', 'Layout', [
      E.row(
        E.input('columns', 'Columns', slide.columns || '', { type: 'number', placeholder: 'Auto (1 or 2)', hint: '1, 2, or 3' }),
        E.input('itemsPerColumn', 'Items per Column', slide.itemsPerColumn || '', { type: 'number', placeholder: 'Auto', hint: 'Limit rows per column' })
      )
    ].join('')),
  ].join('');
});
