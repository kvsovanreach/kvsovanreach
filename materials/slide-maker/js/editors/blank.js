EditorFields.register('blank', function(slide) {
  const E = EditorFields;
  return [
    E.input('title', 'Title', slide.title || '', { placeholder: 'Optional' }),
    E.textarea('text', 'Text', slide.text || '', { rows: 3, placeholder: 'Free-form content' }),
    E.input('backgroundColor', 'Background', slide.backgroundColor || '', { placeholder: '#1a1a2e', hint: 'CSS color' }),
  ].join('');
});
