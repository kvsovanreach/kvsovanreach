EditorFields.register('code', function(slide) {
  const E = EditorFields;
  const langOptions = E.LANGUAGES.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }));
  return [
    E.row(
      E.select('language', 'Language', slide.language || 'javascript', langOptions),
      E.input('filename', 'Filename', slide.filename || '', { placeholder: 'app.js (optional)' })
    ),
    E.textarea('code', 'Code', slide.code || '', { rows: 12, mono: true, placeholder: '// Paste or type your code here' }),
    E.collapse('code-opts', 'Options', [
      E.input('title', 'Title', slide.title || '', { placeholder: 'Optional heading' }),
      E.input('highlightLines', 'Highlight Lines', slide.highlightLines || '', { placeholder: '1, 3-5, 8', hint: 'Comma-separated' }),
      E.titlePositionField(slide.titlePosition),
    ].join('')),
  ].join('');
});
