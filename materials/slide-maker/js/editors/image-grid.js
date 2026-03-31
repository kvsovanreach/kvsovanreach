EditorFields.register('image-grid', function(slide) {
  const E = EditorFields;
  const images = slide.images || [];
  const imagesHtml = images.map((img, i) => `
    <div class="list-editor-item grid-image-item" data-index="${i}">
      <span class="item-num">${i + 1}</span>
      <div class="list-editor-fields list-editor-fields-3">
        <input type="text" value="${E.esc(img.src)}" placeholder="Image URL" data-grid-field="src" data-index="${i}">
        <input type="text" value="${E.esc(img.alt || '')}" placeholder="Alt" data-grid-field="alt" data-index="${i}">
        <input type="text" value="${E.esc(img.caption || '')}" placeholder="Caption" data-grid-field="caption" data-index="${i}">
      </div>
      <button class="btn-icon btn-icon-danger" data-remove-grid="${i}"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
  return [
    E.input('title', 'Title', slide.title || ''),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Optional text above grid' }),
    `<div class="form-group">
      <label>Images</label>
      <div class="list-editor" id="grid-image-list">${imagesHtml}</div>
      <div class="bullet-add" id="btn-add-grid-image"><i class="fa-solid fa-plus"></i> Add Image</div>
    </div>`,
    E.collapse('grid-opts', 'Grid Options', [
      E.row(
        E.input('columns', 'Columns', slide.columns || 3, { type: 'number' }),
        E.input('gap', 'Gap', slide.gap || '12', { suffix: 'px' })
      ),
    ].join('')),
  ].join('');
});
