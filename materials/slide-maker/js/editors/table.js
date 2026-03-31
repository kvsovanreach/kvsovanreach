EditorFields.register('table', function(slide) {
  const E = EditorFields;
  const table = slide.table || {};
  const headers = table.headers || [];
  const rows = table.rows || [];
  const highlight = (table.highlight || []).join(', ');
  const colCount = headers.length || 3;
  return [
    E.input('title', 'Section Title', slide.title || '', { placeholder: 'Slide heading (optional)' }),
    E.textarea('text', 'Description', slide.text || '', { rows: 2, placeholder: 'Context shown above the table (optional)' }),
    E.input('tableCaption', 'Table Caption', slide.tableCaption || '', { placeholder: 'Shown after "Table N."', hint: 'e.g. Performance comparison across models' }),
    `<div class="form-group">
      <label>Table <span class="field-hint">Edit cells directly</span></label>
      <div class="table-editor" id="table-editor">
        <div class="table-editor-controls">
          <button class="btn btn-xs btn-add" data-action="add-col"><i class="fa-solid fa-plus"></i> Col</button>
          <button class="btn btn-xs btn-add" data-action="add-row"><i class="fa-solid fa-plus"></i> Row</button>
          <button class="btn btn-xs btn-danger-ghost" data-action="remove-col"><i class="fa-solid fa-minus"></i> Col</button>
          <button class="btn btn-xs btn-danger-ghost" data-action="remove-row"><i class="fa-solid fa-minus"></i> Row</button>
        </div>
        <div class="table-grid" style="--cols: ${colCount}">
          ${headers.map((h, ci) => `<input class="table-cell table-header-cell" data-table="header" data-col="${ci}" value="${E.esc(h)}">`).join('')}
          ${rows.map((row, ri) => row.map((cell, ci) => `<input class="table-cell" data-table="cell" data-row="${ri}" data-col="${ci}" value="${E.esc(cell)}">`).join('')).join('')}
        </div>
      </div>
    </div>`,
    E.collapse('table-opts', 'Table Options', [
      E.input('table.highlight', 'Highlight Rows', highlight, { placeholder: '0, 2, 4', hint: 'Comma-separated row indices' }),
      E.row(
        E.checkbox('table.striped', 'Striped rows', table.striped),
        E.checkbox('table.compact', 'Compact', table.compact)
      ),
    ].join('')),
  ].join('');
});
